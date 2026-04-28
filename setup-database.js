import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL?.replace('/rest/v1/', '');
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少环境变量');
  process.exit(1);
}

console.log('🔗 连接到 Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  try {
    console.log('\n📖 读取 SQL 文件...');
    const sqlPath = join(__dirname, 'supabase', 'init-database.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    console.log('✅ SQL 文件读取成功');
    console.log(`   文件大小: ${sqlContent.length} 字符`);
    
    console.log('\n⚠️  重要提示:');
    console.log('   由于浏览器安全限制，无法直接通过 JavaScript 执行 SQL');
    console.log('   请手动在 Supabase Dashboard 中执行:');
    console.log('');
    console.log('   1. 打开 https://supabase.com/dashboard');
    console.log('   2. 选择你的项目');
    console.log('   3. 点击左侧菜单 "SQL Editor"');
    console.log('   4. 点击 "New Query"');
    console.log('   5. 复制并粘贴以下文件的内容:');
    console.log('      supabase/init-database.sql');
    console.log('   6. 点击 "Run" 按钮执行');
    console.log('');
    console.log('📁 SQL 文件位置:');
    console.log('   ' + sqlPath);
    console.log('');
    console.log('✨ 执行完成后，运行测试脚本验证:');
    console.log('   node test-db-connection.js');
    
  } catch (error) {
    console.error('\n💥 错误:', error.message);
    process.exit(1);
  }
}

initDatabase();
