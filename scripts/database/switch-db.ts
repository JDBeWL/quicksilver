import fs from 'fs';
import path from 'path';

// ES模块中获取__dirname
const __filename = new URL(import.meta.url).pathname.slice(1); // Windows路径处理
const __dirname = path.dirname(__filename);

// 获取参数
const dbType = process.argv[2];

if (!dbType || (dbType !== 'sqlite' && dbType !== 'postgresql')) {
  console.error('请指定数据库类型: sqlite 或 postgresql');
  console.log('用法: ts-node scripts/database/switch-db.ts [sqlite|postgresql]');
  process.exit(1);
}

// 读取环境变量文件
const envPath = path.join(__dirname, '../.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// 更新环境变量
if (dbType === 'sqlite') {
  // 使用正则表达式确保只匹配实际的配置行，而不是注释
  envContent = envContent.replace(/^DATABASE_TYPE=.*/gm, 'DATABASE_TYPE="sqlite"');
  envContent = envContent.replace(/^DATABASE_URL=.*/gm, 'DATABASE_URL="file:./dev.db"');
  console.log('已切换到 SQLite 数据库');
} else {
  // 保留现有的 PostgreSQL URL，如果没有则使用示例
  envContent = envContent.replace(/^DATABASE_TYPE=.*/gm, 'DATABASE_TYPE="postgresql"');
  
  // 检查是否有实际配置的 DATABASE_URL (不是注释行)
  const hasPostgresUrl = /^DATABASE_URL=.*postgresql:/.test(envContent);
  
  if (!hasPostgresUrl) {
    // 只替换实际配置的 DATABASE_URL 行，不替换注释
    envContent = envContent.replace(/^DATABASE_URL=.*/gm, 'DATABASE_URL="postgresql://username:password@localhost:5432/mydb"');
    console.log('已切换到 PostgreSQL 数据库，请修改 DATABASE_URL 为实际的连接字符串');
  } else {
    console.log('已切换到 PostgreSQL 数据库');
  }
}

// 更新 Prisma schema
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');
// 只修改数据源 (datasource) 的 provider，不修改生成器 (generator) 的 provider
const regex = /datasource db \{\s+provider = ".+"/g;
schemaContent = schemaContent.replace(regex, `datasource db {\n  provider = "${dbType}"`);

// 写回文件
fs.writeFileSync(envPath, envContent);
fs.writeFileSync(schemaPath, schemaContent);

console.log(`数据库配置已更新为: ${dbType}`);
console.log('请运行以下命令以应用更改:');
console.log('1. npx prisma generate');
console.log('2. npx prisma db push');
console.log('3. npm run dev');