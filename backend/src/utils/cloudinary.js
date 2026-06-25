const cloudinary = require('cloudinary').v2;

// Check if credentials are set before configuring
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn(
    '⚠️ Cloudinary warning: Credentials are not fully set in environment variables. File uploads will fallback to local storage.'
  );
}

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File raw binary buffer from Multer
 * @param {string} folder - Destination folder name in Cloudinary
 * @returns {Promise<object>} - Cloudinary upload result object
 */
const uploadToCloudinary = (fileBuffer, folder = 'devfolio_pro') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary credentials are not configured on the server.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto', // Auto detects image, pdf, video, etc.
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // End the upload stream with the file buffer
    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  uploadToCloudinary,
  isCloudinaryConfigured,
};
