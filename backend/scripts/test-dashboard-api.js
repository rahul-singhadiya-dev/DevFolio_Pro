require('dotenv').config();
const http = require('http');

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
  try {
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@example.com',
      password: 'admin714'
    });

    const token = loginRes.data.data.token;
    
    const dashboardRes = await makeRequest({
      hostname: 'localhost',
      port: port,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('--- API Response from /api/admin/dashboard ---');
    console.log('Status Code:', dashboardRes.statusCode);
    console.log('Response Body:', JSON.stringify(dashboardRes.data, null, 2));
    console.log('---------------------------------------------');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
