// Load environment variables
require('dotenv').config();

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
