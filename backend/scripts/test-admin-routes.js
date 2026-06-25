require('dotenv').config();
const http = require('http');

// Helper to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: JSON.parse(data || '{}')
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTest() {
  const port = process.env.PORT || 5000;
  console.log(`Testing admin auth flow on port ${port}...`);

  try {
    // 1. Login
    console.log('\nStep 1: Logging in...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: port,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'admin@example.com',
      password: 'admin714'
    });

    console.log(`Login Response Status: ${loginRes.statusCode}`);
    console.log('Login Response Body:', loginRes.data);

    if (loginRes.statusCode !== 200 || !loginRes.data.success) {
      console.log('❌ Login failed. Cannot proceed to test admin routes.');
      return;
    }

    const token = loginRes.data.data.token;
    console.log('✅ Login succeeded. Token received.');

    // 2. Fetch Admin Projects
    console.log('\nStep 2: Fetching admin projects...');
    const projectsRes = await makeRequest({
      hostname: 'localhost',
      port: port,
      path: '/api/admin/projects',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Admin Projects Status: ${projectsRes.statusCode}`);
    console.log('Admin Projects Body:', projectsRes.data);

    if (projectsRes.statusCode === 200) {
      console.log('✅ Success! Admin route works perfectly.');
    } else {
      console.log('❌ Admin route failed.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('Is the backend server running? Start it with npm run dev or node server.js first.');
  }
}

runTest();
