const fs = require('fs');
const path = require('path');
const prisma = require('../prisma/prisma');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../utils/cloudinary');
const cache = require('../utils/cache');


/**
 * Helper to ensure the local uploads folder exists
 */
const ensureUploadsDirectory = () => {
  const uploadDir = path.join(__dirname, '../../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

/**
 * Fetch Developer Profile (Public)
 * Returns the first profile record. If none exists, creates a seed record to prevent empty UI crash.
 */
exports.getProfile = async (req, res, next) => {
  try {
    const cachedProfile = cache.get('profile');
    if (cachedProfile) {
      return res.status(200).json({
        success: true,
        data: cachedProfile,
      });
    }

    let profile = await prisma.profile.findFirst();

    if (!profile) {
      // Seed default profile data if the DB is blank
      profile = await prisma.profile.create({
        data: {
          fullName: 'Alex Carter',
          title: 'Full-Stack Developer',
          bio: 'I care about clean code, great UX, and shipping things that matter.',
          avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
          githubUrl: 'https://github.com',
          linkedinUrl: 'https://linkedin.com',
          twitterUrl: 'https://twitter.com',
          resumeUrl: null,
        },
      });
    }

    cache.set('profile', profile);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile Details (Admin - Protected)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, title, bio, avatarUrl, githubUrl, linkedinUrl, twitterUrl, resumeUrl } = req.body;

    let profile = await prisma.profile.findFirst();

    if (!profile) {
      // Create profile if not exists
      profile = await prisma.profile.create({
        data: {
          fullName,
          title,
          bio,
          avatarUrl,
          githubUrl,
          linkedinUrl,
          twitterUrl,
          resumeUrl,
        },
      });
    } else {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          fullName,
          title,
          bio,
          avatarUrl,
          githubUrl,
          linkedinUrl,
          twitterUrl,
          resumeUrl,
        },
      });
    }

    cache.invalidate('profile');

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Resume PDF (Admin - Protected)
 */
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: 'Please upload a PDF file.',
      });
    }

    let profile = await prisma.profile.findFirst();
    if (!profile) {
      // Seed minimal profile if it does not exist yet to attach the resume
      profile = await prisma.profile.create({
        data: {
          fullName: 'Alex Carter',
          title: 'Full-Stack Developer',
          bio: 'I care about clean code, great UX, and shipping things that matter.',
        },
      });
    }

    let resumeUrl = '';

    if (isCloudinaryConfigured()) {
      // Upload PDF directly from buffer to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'devfolio_resumes');
      resumeUrl = cloudinaryResult.secure_url;
      console.log(`[Cloudinary] Resume PDF uploaded successfully: ${resumeUrl}`);
    } else {
      // Local fallback storage
      const uploadDir = ensureUploadsDirectory();
      const fileName = `resume-${Date.now()}.pdf`;
      const filePath = path.join(uploadDir, fileName);

      // Save PDF buffer to local disk
      fs.writeFileSync(filePath, req.file.buffer);
      resumeUrl = `/uploads/${fileName}`;

      // Clean up old local resume
      if (profile.resumeUrl && profile.resumeUrl.startsWith('/uploads/')) {
        const oldFileName = profile.resumeUrl.split('/').pop();
        const oldFilePath = path.join(uploadDir, oldFileName);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (e) {
            console.error('Failed to delete old resume file:', e);
          }
        }
      }
    }

    // Update resume URL in database
    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        resumeUrl: resumeUrl,
      },
    });

    cache.invalidate('profile');

    return res.status(200).json({
      success: true,
      data: {
        resumeUrl: updatedProfile.resumeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
