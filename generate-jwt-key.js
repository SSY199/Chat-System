import crypto from 'crypto';

console.log('\n🔑 Generated JWT Key (copy this for your .env file):\n');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('\n');
