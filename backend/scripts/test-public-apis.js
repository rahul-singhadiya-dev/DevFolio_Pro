const http = require('http');

function makeRequest(path) {
  const port = process.env.PORT || 5000;
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          path,
          statusCode: res.statusCode,
          data: data.trim().startsWith('{') || data.trim().startsWith('[') ? JSON.parse(data) : data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path,
        statusCode: 500,
        error: err.message
      });
    });

    req.end();
  });
}

async function runTest() {
  console.log('Testing public landing page API endpoints...');
  const paths = [
    '/api/profile',
    '/api/skills',
    '/api/projects?limit=3',
    '/api/experience'
  ];

  const results = await Promise.all(paths.map(makeRequest));
  
  results.forEach(res => {
    console.log(`\nPath:        ${res.path}`);
    console.log(`Status Code: ${res.statusCode}`);
    if (res.error) {
      console.log('Error:      ', res.error);
    } else {
      console.log('Response:   ', JSON.stringify(res.data, null, 2).substring(0, 300) + (JSON.stringify(res.data).length > 300 ? '...' : ''));
    }
  });
}

runTest();
