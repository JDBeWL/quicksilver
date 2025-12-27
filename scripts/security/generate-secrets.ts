import crypto from 'crypto';

// 生成32字节(256位)的随机密钥，转换为十六进制字符串
const generateSecret = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

console.log('=== 安全密钥生成器 ===\n');

console.log('JWT_SECRET:');
console.log(`"${generateSecret()}"`);

console.log('\nAUTH_SECRET:');
console.log(`"${generateSecret()}"`);

console.log('\n这些密钥使用crypto.randomBytes()生成，具有足够的随机性和强度。');
console.log('请将它们复制到你的.env文件中。');