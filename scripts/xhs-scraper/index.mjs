import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import readline from "node:readline";
import config from "./config.mjs";

// ---- 常量 ----
const XHS_HOME = "https://www.xiaohongshu.com";
const EXPORTED_FILE = path.join(config.outputDir, ".exported.json");

// ---- 工具函数 ----

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(baseMs, range = 1000) {
  return baseMs + Math.random() * range;
}

function fmtDate(iso) {
  if (!iso) return "未知日期";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function ensureDir(dir) {
  if (!existsSync(dir)) await fs.mkdir(dir, { recursive: true });
}

function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

// ---- 浏览器 ----

async function launchBrowser() {
  await ensureDir(config.browserProfileDir);
  const context = await chromium.launchPersistentContext(
    path.resolve(config.browserProfileDir),
    {
      headless: config.headless,
      slowMo: config.slowMo,
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      locale: "zh-CN",
    },
  );
  return context;
}

async function checkLogin(page) {
  try {
    await page.goto(XHS_HOME, { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(3000);
    return await page.evaluate(() => {
      const hasUserMenu =
        !!document.querySelector('[class*="user"]') ||
        !!document.querySelector('[class*="avatar"]') ||
        !!document.querySelector('[class*="side-bar"]');
      const hasCookie = document.cookie.includes("a1");
      return hasUserMenu && hasCookie;
    });
  } catch {
    return false;
  }
}

// ---- 登录流程 ----

async function doLogin(context) {
  const page = await context.newPage();
  let loggedIn = await checkLogin(page);

  if (loggedIn) {
    console.log("✓ 已登录，无需重新登录");
    await page.close();
    return true;
  }

  console.log("正在打开小红书登录页...");
  await page.goto("https://www.xiaohongshu.com/login", {
    waitUntil: "domcontentloaded",
  });
  console.log("请在浏览器中扫码或手机号登录");
  await waitForEnter("登录完成后按 Enter 继续...");

  loggedIn = await checkLogin(page);
  if (loggedIn) {
    console.log("✓ 登录成功，会话已保存");
  } else {
    console.log("⚠ 登录状态未确认，可能未成功");
  }
  await page.close();
  return loggedIn;
}

// ---- 抓取笔记列表 ----

async function collectNotesFromApi(page, bloggerUrl) {
  const notes = [];

  // 监听 API 响应
  const responseHandler = async (resp) => {
    const url = resp.url();
    if (
      (url.includes("/web_api/sns/v1/user/notes") ||
        url.includes("/api/sns/web/v1/user_posted")) &&
      resp.status() === 200
    ) {
      try {
        const json = await resp.json();
        const list = json?.data?.notes || json?.data?.items || [];
        for (const n of list) {
          const noteId = n.note_id || n.id || "";
          if (!noteId) continue;
          notes.push({
            noteId: String(noteId),
            title: n.display_title || n.title || "(无标题)",
            type: n.type || "normal",
            coverUrl: n.cover?.url_default || n.cover?.url || n.cover?.info_list?.[0]?.url || "",
            likeCount: n.likes || n.liked_count || n.interact_info?.liked_count || 0,
            collectCount: n.collects || n.collected_count || n.interact_info?.collected_count || 0,
            commentCount: n.comments || n.comments_count || n.interact_info?.comment_count || 0,
            createdAt: n.time ? new Date(n.time).toISOString() : "",
            url: `https://www.xiaohongshu.com/explore/${noteId}`,
          });
        }
      } catch {
        // JSON 解析失败，忽略
      }
    }
  };

  page.on("response", responseHandler);

  // 导航到博主主页
  console.log(`正在访问: ${bloggerUrl}`);
  await page.goto(bloggerUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(4000);

  // 滚动加载
  console.log("正在滚动加载笔记列表...");
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, 600));
    await sleep(jitter(1500, 1000));
  }

  // 等待可能的 API 响应
  await sleep(2000);

  page.off("response", responseHandler);

  // 去重
  const seen = new Set();
  const unique = [];
  for (const n of notes) {
    if (!seen.has(n.noteId)) {
      seen.add(n.noteId);
      unique.push(n);
    }
  }
  return unique;
}

// ---- 抓取笔记详情 ----

async function extractNoteDetail(page, noteUrl) {
  console.log(`  正在打开: ${noteUrl}`);
  await page.goto(noteUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(jitter(2500, 1500));

  const detail = await page.evaluate(() => {
    // 标题
    const title =
      document.querySelector("#detail-title")?.textContent?.trim() ||
      document.querySelector('[class*="title"]')?.textContent?.trim() ||
      document.querySelector("meta[property='og:title']")?.getAttribute("content")?.trim() ||
      "";

    // 正文
    const content =
      document.querySelector("#detail-desc")?.textContent?.trim() ||
      document.querySelector('[class*="desc"]')?.textContent?.trim() ||
      document.querySelector(".note-scroller .content")?.textContent?.trim() ||
      document.querySelector('[class*="note-text"]')?.textContent?.trim() ||
      "";

    // 日期
    const dateEl =
      document.querySelector(".bottom-container .date") ||
      document.querySelector('[class*="date"]') ||
      document.querySelector("time");
    const date = dateEl?.textContent?.trim() || dateEl?.getAttribute("datetime") || "";

    // 标签/话题
    const tags = [
      ...document.querySelectorAll(
        '[class*="tag"] a, [class*="topic"] a, a[href*="/topics/"], [class*="hash"]',
      ),
    ]
      .map((a) => a.textContent?.trim().replace(/^#/, ""))
      .filter(Boolean);

    // 摘要：前 200 字
    const summary = content.replace(/\s+/g, " ").slice(0, 200);

    return { title, content, date, tags, summary };
  });

  return detail;
}

// ---- 导出追踪 ----

async function loadExportedIds() {
  try {
    const raw = await fs.readFile(EXPORTED_FILE, "utf-8");
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

async function saveExportedIds(ids) {
  await fs.writeFile(EXPORTED_FILE, JSON.stringify([...ids], null, 2), "utf-8");
}

// ---- Markdown 导出 ----

async function writeToObsidian(note, detail) {
  const safeTitle = (detail.title || note.title || "无标题")
    .replace(/[\\/:*?"<>|]/g, "-")
    .slice(0, 60);
  const dateStr = fmtDate(note.createdAt);
  const fileName = `${dateStr} - ${safeTitle}.md`;
  const filePath = path.join(config.outputDir, fileName);

  const tagList = detail.tags.length > 0 ? `\ntags: [${detail.tags.join(", ")}]` : "";

  const frontmatter =
    [
      "---",
      `date: ${dateStr}`,
      `note_id: ${note.noteId}`,
      `url: ${note.url}`,
      `source: 小红书`,
      `likes: ${note.likeCount}`,
      `collects: ${note.collectCount}`,
      `comments: ${note.commentCount}`,
      detail.tags.length > 0 ? `tags: [${detail.tags.join(", ")}]` : null,
      "---",
    ]
      .filter(Boolean)
      .join("\n") + "\n";

  const body =
    [
      `# ${detail.title || "无标题"}`,
      "",
      `> 原文链接: ${note.url}`,
      `> 发布于: ${dateStr}`,
      "",
      "## 摘要",
      "",
      detail.summary || "（无文字内容）",
      "",
      "## 全文内容",
      "",
      detail.content || "（无文字内容，可能为纯图片/视频笔记）",
      "",
      detail.tags.length > 0 ? `**话题:** ${detail.tags.map((t) => `#${t}`).join(" ")}` : "",
      "",
      "---",
      `*抓取时间: ${new Date().toISOString().replace("T", " ").slice(0, 19)}*`,
    ]
      .filter(Boolean)
      .join("\n");

  const md = frontmatter + "\n" + body;
  await fs.writeFile(filePath, md, "utf-8");
  console.log(`  ✓ 已导出: ${fileName}`);
  return fileName;
}

// ---- 主流程 ----

async function main() {
  const loginOnly = process.argv.includes("--login");

  await ensureDir(config.outputDir);
  console.log("启动浏览器...");
  const context = await launchBrowser();

  // --login 模式
  if (loginOnly) {
    await doLogin(context);
    await context.close();
    console.log("登录流程完成");
    process.exit(0);
  }

  const page = await context.newPage();

  // 检查登录
  console.log("检查登录状态...");
  const loggedIn = await checkLogin(page);
  if (!loggedIn) {
    console.log("⚠ 未登录！请先运行: npm run login");
    await page.close();
    await context.close();
    process.exit(1);
  }
  console.log("✓ 登录态有效");

  // 抓取笔记列表
  const notes = await collectNotesFromApi(page, config.bloggerUrl);

  if (notes.length === 0) {
    console.log("⚠ 未找到任何笔记");
    console.log("可能原因:");
    console.log("  1. 博主 URL 不正确，请检查 config.mjs 中的 bloggerUrl");
    console.log("  2. 页面结构已变化，API 路径需要更新");
    console.log("  3. 被反爬拦截，请尝试重启脚本");
    await page.close();
    await context.close();
    process.exit(1);
  }

  console.log(`找到 ${notes.length} 条笔记`);

  // 按时间排序（最新在前）
  notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 去重：已导出的跳过
  const exportedIds = await loadExportedIds();
  const newNotes = notes.filter((n) => !exportedIds.has(n.noteId)).slice(0, config.postsPerRun);

  if (newNotes.length === 0) {
    console.log("✓ 没有新笔记需要导出");
    await page.close();
    await context.close();
    process.exit(0);
  }

  console.log(`\n本次导出 ${newNotes.length} 条新笔记:\n`);

  // 逐条抓取详情并导出
  const newIds = [];
  for (let i = 0; i < newNotes.length; i++) {
    const note = newNotes[i];
    console.log(`[${i + 1}/${newNotes.length}] ${note.title}`);
    try {
      const detail = await extractNoteDetail(page, note.url);
      await writeToObsidian(note, detail);
      newIds.push(note.noteId);
    } catch (err) {
      console.error(`  ✗ 处理失败: ${err.message}`);
    }
    if (i < newNotes.length - 1) {
      console.log("  等待间隔...");
      await sleep(jitter(3000, 2000));
    }
  }

  // 更新导出记录
  const allExported = new Set([...exportedIds, ...newIds]);
  await saveExportedIds(allExported);

  console.log(`\n完成！共导出 ${newIds.length} 条笔记`);
  console.log(`导出目录: ${config.outputDir}`);

  await page.close();
  await context.close();
}

main().catch((err) => {
  console.error("\n运行出错:", err);
  process.exit(1);
});
