const prisma = require('../prisma/prisma');

/**
 * Fetch and download/redirect to the active resume PDF (Public)
 */
exports.getResume = async (req, res, next) => {
  try {
    const profile = await prisma.profile.findFirst();

    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({
        error: true,
        message: 'Resume PDF has not been uploaded yet.',
      });
    }

    // Redirect to the stored resume URL (local path or cloud URL)
    return res.redirect(profile.resumeUrl);
  } catch (error) {
    next(error);
  }
};
