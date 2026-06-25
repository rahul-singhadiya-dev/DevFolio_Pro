const bcrypt = require('bcryptjs');

// Get password from command line arguments
const password = process.argv[2];

if (!password) {
  console.error('\x1b[31mError: Please provide a password as an argument.\x1b[0m');
  console.log('Usage: npm run hash-password <your-password>');
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Hashing error:', err);
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('\x1b[32mPassword Hash Generated Successfully!\x1b[0m');
  console.log('==================================================');
  console.log(`Password: ${password}`);
  console.log(`Hash:     ${hash}`);
  console.log('==================================================');
  console.log('Copy the hash value and paste it as ADMIN_PASSWORD_HASH in your .env file.\n');
});
