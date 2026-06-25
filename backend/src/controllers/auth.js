const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

/**
 * Handle Admin Authentication Login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Retrieve admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      return res.status(500).json({
        error: true,
        message: 'Admin credentials are not configured on the server.',
      });
    }

    // Verify email matches
    if (email !== adminEmail) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password.',
      });
    }

    // Verify password matches the stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password.',
      });
    }

    // Create JWT token payload
    const tokenPayload = {
      email: adminEmail,
    };

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

    // Sign the JWT token
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: jwtExpiresIn });

    // Return token in the success envelope
    return res.status(200).json({
      success: true,
      data: {
        token,
        expiresIn: jwtExpiresIn,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Session Token (Protected)
 * Returns the authenticated admin user email if the token is valid.
 */
exports.verify = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        email: req.admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Admin Password (Protected)
 * Verifies current password, generates new bcrypt hash, updates .env file and in-memory process.env
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        error: true,
        message: 'New password and confirmation do not match.',
      });
    }

    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      return res.status(500).json({
        error: true,
        message: 'Admin credentials are not configured on the server.',
      });
    }

    // Verify current password matches the stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(currentPassword, adminPasswordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: true,
        message: 'Current password is incorrect.',
      });
    }

    // Generate new hash
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Read and update the .env file
    const envPath = path.join(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');

      // Check if ADMIN_PASSWORD_HASH exists in the .env file
      if (envContent.includes('ADMIN_PASSWORD_HASH=')) {
        envContent = envContent.replace(/ADMIN_PASSWORD_HASH=.*/, `ADMIN_PASSWORD_HASH="${newHash}"`);
      } else {
        envContent += `\nADMIN_PASSWORD_HASH="${newHash}"`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
    }

    // Update in-memory environment variable
    process.env.ADMIN_PASSWORD_HASH = newHash;

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
