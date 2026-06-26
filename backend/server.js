// Load environment variables
require('dotenv').config();

// Sanitize env vars — strip surrounding quotes that get accidentally
// copied from .env file format (e.g. DATABASE_URL="postgresql://...")
const ENV_KEYS_TO_SANITIZE = ['DATABASE_URL', 'JWT_SECRET', 'ADMIN_PASSWORD_HASH', 'CLOUDINARY_API_SECRET'];
ENV_KEYS_TO_SANITIZE.forEach((key) => {
  if (process.env[key]) {
    process.env[key] = process.env[key].replace(/^["']|["']$/g, '').trim();
  }
});

const app = require('./src/app');
const prisma = require('./src/prisma/prisma');

const PORT = process.env.PORT || 5000;

// Start server listening
const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 DevFolio Pro Backend running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`==================================================`);
});

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  
  // Close database connections
  try {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
  } catch (err) {
    console.error('Error disconnecting from database:', err);
  }

  // Close Express server
  server.close(() => {
    console.log('🛑 Server stopped listening.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch Unhandled Exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️ Uncaught Exception thrown:', error);
  // Gracefully exit the app to let PM2 or docker restart the container
  process.exit(1);
});
