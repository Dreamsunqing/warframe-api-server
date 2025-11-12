// FIXME 获取原始数据（wegame）
// 最小化 Puppeteer 抓取：后台静默打开 -> 获取世界状态 JSON -> 退出
const puppeteer = require("puppeteer-core");
const fs = require("fs");

// 国服世界状态地址
const CONFIG = {
  wegameUrl: "https://www.wegame.com.cn/act/xjzj/xjzj20220330/index.html",
  //   真正的数据地址
  apiUrl:
    "https://www.wegame.com.cn/api/act/index.php/xjzj/xjzj20220330/index/ajax_get_worldState",
  timeout: 10000,
};

// 获取浏览器地址
function resolveChromePath() {
  // 优先使用环境变量CHROME_PATH指定的路径
  const preferred = process.env.CHROME_PATH;
  // 如果环境变量存在且路径有效，直接返回
  if (preferred && fs.existsSync(preferred)) return preferred;

  // 候选浏览器路径列表（按优先级排序）
  const candidates = [
    // Windows native paths
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    // Linux paths （部署到服务器用）
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
  ];

  // 遍历候选路径，返回第一个存在的路径
  for (const p of candidates) {
    try {
      // 路径存在性验证
      if (fs.existsSync(p)) return p;
    } catch {
      console.error("请检查浏览器环境(是否安装，路径如何)");
    }
  }
  // 最终回退策略：
  // 1. 如果环境变量存在但路径无效，返回原始环境变量值
  // 2. 如果环境变量不存在，返回Linux默认路径
  return preferred || "/usr/bin/chromium-browser";
}

// FIXME 获取数据主函数
/**
 * @returns output 国服原始数据
 */
async function getwg() {
  let browser;
  try {
    // 获取正确的浏览器地址
    const execPath = resolveChromePath();
    // 浏览器启动配置
    browser = await puppeteer.launch({
      headless: true, // 无头模式是否启用
      executablePath: execPath, // 浏览器环境地址
      args: [
        "--no-sandbox", // 禁用沙盒模式（解决docker、linux权限问题）
        "--window-size=1920,1080", // 浏览器窗口尺寸
        "--disable-infobars", // 阻止"Chrome正在被自动化测试控制"提示条
        "--disable-dev-shm-usage", // 避免/dev/shm内存不足问题（Docker适用）
      ],
      // 注：此设置↓不影响响应式布局检测，仅控制截图/元素定位的基准尺寸
      defaultViewport: { width: 1920, height: 1080 }, // 页面默认视口尺寸（与window-size参数协同作用）
    });

    // 创建页面
    const page = await browser.newPage();

    // 注册页面相应事件监听器
    const hint = "/ajax_get_worldState";
    let capturedText = null;
    page.on("response", async (res) => {
      // url是hint，并且，capturedText 不为空，确保获取的是首次数据
      if (res.url().includes(hint) && !capturedText) {
        try {
          capturedText = await res.text();
        } catch {}
      }
    });

    // 第一次进入
    await page.goto(CONFIG.wegameUrl, {
      waitUntil: "domcontentloaded",
      timeout: CONFIG.timeout,
    });

    // 等待网络空闲（第一道保险）结合事件监听器，确保不错过指定接口
    await page
      .waitForNetworkIdle({
        idleTime: 800, // 定义网络空闲标准：800ms内无新请求
        timeout: 3000, // 最大等待时间：5秒（避免页面卡死）
      })
      .catch(() => {}); // 静默处理超时错误（保持主流程执行）

    // 精准捕获目标API响应（第二道保险）
    const r = await page
      .waitForResponse((res) => res.url().includes(hint), { timeout: 3000 })
      .catch(() => null); // 捕获超时为null（避免未定义状态）
    // 属于第二道保险，如果成功精准捕获API，并且为首次获取数据，则保存此次数据
    if (r && !capturedText) {
      try {
        capturedText = await r.text();
      } catch {}
    }
    // 格式化一下，无法解析就返回原始数据
    let output;
    try {
      output = JSON.parse(capturedText);
    } catch {
      output = capturedText;
    }
    return output;
  } catch (error) {
    new err();
    console.error("错误信息:", error.message);
    // 抛出错误，让调用者处理
    throw new Error("多次尝试后仍无法获取数据");
  } finally {
    // 关闭浏览器环境
    try {
      if (browser) await browser.close();
    } catch {}
  }
}

module.exports = { getwg };
// 调试使用
// (async () => {
//   const a = await getwg();
//   // 数据结构
//   console.log(
//     JSON.stringify(
//       {
//         status: "success",
//         data: a,
//         source: "minimal",
//         timestamp: new Date().toISOString(),
//       },
//       null,
//       2
//     )
//   );
// })();
