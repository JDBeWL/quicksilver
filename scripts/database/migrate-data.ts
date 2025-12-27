import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES模块中获取__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function exportData() {
  console.log('导出数据...');
  
  // 获取所有数据
  const users = await prisma.user.findMany();
  const accounts = await prisma.account.findMany();
  const sessions = await prisma.session.findMany();
  const posts = await prisma.post.findMany();
  const plugins = await prisma.plugin.findMany();
  const siteConfigs = await prisma.siteConfig.findMany();
  const inviteCodes = await prisma.inviteCode.findMany();
  
  const data = {
    users,
    accounts,
    sessions,
    posts,
    plugins,
    siteConfigs,
    inviteCodes,
  };
  
  // 保存到文件
  const dataPath = path.join(__dirname, '../data-export.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`数据已导出到: ${dataPath}`);
  
  return data;
}

async function importData() {
  console.log('导入数据...');
  
  const dataPath = path.join(__dirname, '../data-export.json');
  if (!fs.existsSync(dataPath)) {
    console.error('找不到导出数据文件');
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // 清空现有数据
  await prisma.post.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.plugin.deleteMany();
  await prisma.inviteCode.deleteMany();
  await prisma.siteConfig.deleteMany();
  await prisma.user.deleteMany();
  
  // 导入用户数据
  if (data.users && data.users.length > 0) {
    for (const user of data.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          image: user.image,
          password: user.password,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
      });
    }
  }
  
  // 导入账户数据
  if (data.accounts && data.accounts.length > 0) {
    for (const account of data.accounts) {
      await prisma.account.create({
        data: {
          id: account.id,
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
          createdAt: new Date(account.createdAt),
          updatedAt: new Date(account.updatedAt),
        },
      });
    }
  }
  
  // 导入会话数据
  if (data.sessions && data.sessions.length > 0) {
    for (const session of data.sessions) {
      await prisma.session.create({
        data: {
          id: session.id,
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: new Date(session.expires),
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
        },
      });
    }
  }
  
  // 导入文章数据
  if (data.posts && data.posts.length > 0) {
    for (const post of data.posts) {
      await prisma.post.create({
        data: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          published: post.published,
          authorId: post.authorId,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
        },
      });
    }
  }
  
  // 导入插件数据
  if (data.plugins && data.plugins.length > 0) {
    for (const plugin of data.plugins) {
      await prisma.plugin.create({
        data: {
          id: plugin.id,
          name: plugin.name,
          slug: plugin.slug,
          description: plugin.description,
          type: plugin.type,
          code: plugin.code,
          styles: plugin.styles,
          config: plugin.config,
          enabled: plugin.enabled,
          priority: plugin.priority,
          authorId: plugin.authorId,
          createdAt: new Date(plugin.createdAt),
          updatedAt: new Date(plugin.updatedAt),
        },
      });
    }
  }
  
  // 导入站点配置数据
  if (data.siteConfigs && data.siteConfigs.length > 0) {
    for (const config of data.siteConfigs) {
      await prisma.siteConfig.create({
        data: {
          id: config.id,
          key: config.key,
          value: config.value,
          updatedAt: new Date(config.updatedAt),
        },
      });
    }
  }
  
  // 导入邀请码数据
  if (data.inviteCodes && data.inviteCodes.length > 0) {
    for (const inviteCode of data.inviteCodes) {
      await prisma.inviteCode.create({
        data: {
          id: inviteCode.id,
          code: inviteCode.code,
          used: inviteCode.used,
          expiresAt: new Date(inviteCode.expiresAt),
          createdAt: new Date(inviteCode.createdAt),
        },
      });
    }
  }
  
  console.log('数据导入完成');
}

async function main() {
  const command = process.argv[2];
  
  if (command === 'export') {
    await exportData();
  } else if (command === 'import') {
    await importData();
  } else {
    console.log('用法: ts-node scripts/migrate-data.ts [export|import]');
    console.log('  export - 导出当前数据库数据');
    console.log('  import - 导入数据到当前数据库');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });