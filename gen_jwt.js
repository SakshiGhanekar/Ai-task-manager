const crypto = require('crypto');
const header = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64').replace(/=/g, '');
const payload = Buffer.from(JSON.stringify({sub: 'testuser', exp: Math.floor(Date.now()/1000) + 3600})).toString('base64').replace(/=/g, '');
const signature = crypto.createHmac('sha256', '94a08da1fecbb6e8b46990538c7b50b2848cd5f1c324317fdbf4e918c5e62bc4').update(header + '.' + payload).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
console.log(header + '.' + payload + '.' + signature);
