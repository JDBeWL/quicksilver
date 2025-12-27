import fs from 'fs';
import path from 'path';

// ES模块中获取__dirname
const __filename = new URL(import.meta.url).pathname.slice(1); // Windows路径处理
const __dirname = path.dirname(__filename);
import { PrismaClient } from '@prisma/client';

// 读取环境变量
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// 解析环境变量
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && !key.startsWith('#')) {
    envVars[key.trim()] = values.join('=').trim().replace(/"/g, '');
  }
});

// 检查是否是本地 SQLite
if (envVars.DATABASE_TYPE === 'sqlite' || envVars.DATABASE_URL?.includes('file:')) {
  console.log('检测到本地 SQLite 数据库，开始导出数据...');
  
  // 创建本地 Prisma 客户端
  const localPrisma = new PrismaClient({
    datasources: {
      db: {
        url: envVars.DATABASE_URL
      }
    }
  });
  
  // 导出数据的函数
  async function exportData() {
    try {
      // 导出所有数据
      const users = await localPrisma.user.findMany();
      const accounts = await localPrisma.account.findMany();
      const sessions = await localPrisma.session.findMany();
      const verificationTokens = await localPrisma.verificationToken.findMany();
      const posts = await localPrisma.post.findMany();
      const plugins = await localPrisma.plugin.findMany();
      const siteConfigs = await localPrisma.siteConfig.findMany();
      const inviteCodes = await localPrisma.inviteCode.findMany();
      
      // 将数据保存到文件
      const exportData = {
        users,
        accounts,
        sessions,
        verificationTokens,
        posts,
        plugins,
        siteConfigs,
        inviteCodes
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'db-export.json'), 
        JSON.stringify(exportData, null, 2)
      );
      
      console.log('数据导出成功！已保存到 scripts/db-export.json');
      
      // 按依赖关系排序（确保先创建主记录）
      const orderedData = [
        { model: 'user', data: users },
        { model: 'siteConfig', data: siteConfigs },
        { model: 'account', data: accounts },
        { model: 'session', data: sessions },
        { model: 'verificationToken', data: verificationTokens },
        { model: 'post', data: posts },
        { model: 'plugin', data: plugins },
        { model: 'inviteCode', data: inviteCodes }
      ];
      
      // 创建 SQL 导入脚本
      let sqlScript = '-- 导入数据的 SQL 脚本\n\n';
      
      for (const { model, data } of orderedData) {
        if (data.length === 0) continue;
        
        sqlScript += `-- 导入 ${model} 数据\n`;
        
        for (const record of data) {
          const fields = Object.keys(record);
          const values = Object.values(record).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val;
          });
          
          sqlScript += `INSERT INTO "${model}" (${fields.map(f => `"${f}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        sqlScript += '\n';
      }
      
      fs.writeFileSync(
        path.join(__dirname, 'import-to-supabase.sql'), 
        sqlScript
      );
      
      console.log('SQL 导入脚本已生成！请使用 Supabase SQL 编辑器运行 scripts/import-to-supabase.sql');
      
    } catch (error) {
      console.error('导出数据时出错:', error);
    } finally {
      await localPrisma.$disconnect();
    }
  }
  
  exportData();
  
} else {
  console.log('当前不是 SQLite 数据库，无需导出数据');
}