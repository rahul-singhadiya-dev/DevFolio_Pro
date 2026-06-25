const multer = require('multer');

// Configure memory storage to allow programmatically writing to disk or uploading to cloud services
const storage = multer.memoryStorage();

// Validate file type
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Define limits: 5MB
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB in bytes
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;
