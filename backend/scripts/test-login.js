require('dotenv').config();
const bcrypt = require('bcryptjs');

async function testLogin() {
  const emailInput = 'admin@example.com';
  const passwordInput = 'admin714';
  
  const envEmail = process.env.ADMIN_EMAIL;
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  
  console.log('--- Diagnosis Input ---');
  console.log(`Input Email:    "${emailInput}"`);
  console.log(`Input Password: "${passwordInput}"`);
  console.log(`Env Email:      "${envEmail}"`);
  console.log(`Env Hash:       "${envHash}"`);
  console.log('-----------------------');

  if (emailInput !== envEmail) {
    console.log('❌ Emails do not match!');
  } else {
    console.log('✅ Emails match.');
  }

  try {
    const isMatch = await bcrypt.compare(passwordInput, envHash);
    if (isMatch) {
      console.log('✅ Password matches hash successfully!');
    } else {
      console.log('❌ Password does NOT match hash!');
    }
  } catch (error) {
    console.error('❌ Error during bcrypt comparison:', error);
  }
}

testLogin();
