// 小红书抓取配置
// 修改 bloggerUrl 为你目标博主的个人主页链接
export default {
  // 目标博主主页 URL
  bloggerUrl: "https://www.xiaohongshu.com/user/profile/",

  // Obsidian 导出目录
  outputDir: "C:\\Users\\Malpaca\\Documents\\Obsidian Vault\\xhs摘要",

  // 每次抓取条数
  postsPerRun: 5,

  // 浏览器用户数据目录（持久化登录态）
  browserProfileDir: "./browser-profile",

  // 浏览器启动选项
  headless: false,       // 可见模式，降低反爬检测
  slowMo: 500,           // 操作间隔(ms)，模拟人类行为
};
