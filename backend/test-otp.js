const http = require('http');

const data = JSON.stringify({
  phoneNumber: '+919876543212'
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 4000,
  path: '/api/auth/send-phone-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('OTP Status:', res.statusCode, body));
});

req.on('error', console.error);
req.write(data);
req.end();
