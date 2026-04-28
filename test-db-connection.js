import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL?.replace('/rest/v1/', '');
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少环境变量');
  console.error('请确保 .env 文件中包含:');
  console.error('  - PUBLIC_SUPABASE_URL');
  console.error('  - PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🔗 正在连接到 Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 测试 1: 检查认证状态
    console.log('\n📋 测试 1: 检查匿名会话...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ 会话错误:', sessionError.message);
    } else {
      console.log('✅ 会话检查成功');
      console.log('   当前会话:', sessionData.session ? '已登录' : '未登录');
    }

    // 测试 2: 尝试查询 tweets 表
    console.log('\n📋 测试 2: 查询 tweets 表...');
    const { data: tweets, error: tweetsError } = await supabase
      .from('tweets')
      .select('count')
      .limit(1);

    if (tweetsError) {
      console.error('❌ 查询错误:', tweetsError.message);
      console.error('   提示: 可能需要先在 Supabase SQL Editor 中执行 schema.sql');
    } else {
      console.log('✅ 表查询成功');
      console.log('   tweets 表可访问');
    }

    // 测试 3: 检查存储桶
    console.log('\n📋 测试 3: 检查存储桶...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ 存储桶错误:', bucketsError.message);
    } else {
      console.log('✅ 存储桶列表成功');
      const imagesBucket = buckets.find(b => b.name === 'images');
      if (imagesBucket) {
        console.log('   ✅ images 存储桶已存在');
      } else {
        console.log('   ⚠️  images 存储桶不存在，需要执行 schema.sql 创建');
      }
    }

    console.log('\n✨ 连接测试完成！');
    console.log('\n📝 下一步:');
    console.log('   1. 如果看到错误，请在 Supabase Dashboard > SQL Editor 中执行:');
    console.log('      supabase/schema.sql');
    console.log('   2. 确保启用了匿名登录: Authentication > Providers > Anonymous');
    
  } catch (error) {
    console.error('\n💥 发生未知错误:', error.message);
    process.exit(1);
  }
}

testConnection();
