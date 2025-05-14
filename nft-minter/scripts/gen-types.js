const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// 加载 .env 和 .env.local 文件
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!projectRef) {
  console.error('错误: 未设置 SUPABASE_PROJECT_REF 环境变量');
  console.error('请确保在 .env 或 .env.local 文件中设置了 SUPABASE_PROJECT_REF');
  process.exit(1);
}

console.log('SUPABASE_PROJECT_REF:', projectRef);

execSync(
  `npx supabase gen types --lang=typescript --project-id=${projectRef} > src/app/_lib/database.types.ts`,
  { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN
    }
  }
);