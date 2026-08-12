import http from 'http';

const start = Date.now();
http.get('http://localhost:3000/sites/tokokue', (res) => {
  const ttfb = Date.now() - start;
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const total = Date.now() - start;
    console.log(`Status: ${res.statusCode}`);
    console.log(`TTFB: ${ttfb}ms`);
    console.log(`Total time: ${total}ms`);
    console.log(`Response size: ${data.length} bytes`);
  });
}).on('error', err => {
  console.log('Error:', err.message);
});
