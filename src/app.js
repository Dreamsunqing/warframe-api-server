// TODO src/app.js
const express = require("express");
const setupRoutes = require("./routes/index.js");

// FIXME Function：createApp
// 参数：无:void
// 返回值：Function:createApp
// 功能：创建并配置 Express 应用，挂载所有路由
// 错误处理：路由内部处理错误，本函数不抛出
function createApp() {
  const app = express();
  app.use(express.json());
  setupRoutes(app);
  const apiDocs = {
    name: "Warframe Status API",
    message: "Welcome to the Warframe Status API",
    routes: {
      de: {
        "/de/all": "获取 国际服原始数据 信息",
        "/de/all/process": "获取 国际服处理过的数据缓存 信息",
        "/de/alerts": "获取 警报 信息",
        "/de/plain/cycles": "获取 平原循环 信息",
        "/de/sortie": "获取 每日突击 信息",
        "/de/stellrewad": "获取 钢铁每周奖励,常驻奖励 信息",
        "/de/archsortie": "获取 执行官周常 信息",
        "/de/invasions": "获取 入侵 信息",
        "/de/shipprogress": "获取 船只进度 信息",
        "/de/fissures": "获取 虚空裂隙 信息",
        正在翻译中: "部分翻译映射尚未完成，请期待",
        正在开发中: "统一双服数据结构",
      },
      wg: {
        "/wg/all": "获取 国服原始数据 信息",
        "/wg/all/process": "获取 国服处理过的数据缓存 信息",
        "/wg/events": "获取 事件 信息",
        "/wg/alerts": "获取 警报 信息",
        "/wg/cycle": "获取 平原循环 信息",
        "/wg/plainJobs": "获取 平原赏金 信息",
        "/wg/sortie": "获取 每日突击 信息",
        "/wg/deltav": "获取 每日折扣 信息",
        "/wg/invasions": "获取 入侵 信息",
        "/wg/constructionProgress": "获取 建造进度 信息",
        "/wg/fissures": "获取 虚空裂隙 信息",
        "/wg/voidTrader": "获取 虚空商人 信息",
        "/wg/steelRewad": "获取 钢铁每周奖励,常驻奖励 信息",
        "/wg/archSortie": "获取 执行官周常 信息",
        正在翻译中: "部分翻译映射尚未完成，请期待",
        正在开发中: "统一双服数据结构",
      },
    },
  };
  // FIXME Function：renderDocsHtml
  // 参数：docs:object
  // 返回值：string:html
  // 功能：将接口文档对象渲染为可阅读的 HTML 页面
  // 错误处理：输入为空时返回空页面结构
  function renderDocsHtml(docs) {
    const deRoutes = docs?.routes?.de || {};
    const wgRoutes = docs?.routes?.wg || {};
    function tableRows(obj) {
      return Object.keys(obj)
        .map(
          (k) =>
            `<tr><td><code>${k}</code></td><td>${String(obj[k])}</td></tr>`
        )
        .join("");
    }
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${docs?.name || "API Docs"}</title>
  <style>
    :root{color-scheme:light dark}
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;margin:24px}
    h1,h2{margin:0 0 12px}
    .card{border:1px solid #ccc;border-radius:8px;padding:16px;margin:16px 0}
    table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}
    th{background:#f6f6f6}
    code{font-family:ui-monospace,Consolas,Monaco,monospace}
    .footer{margin-top:24px;color:#666;font-size:12px}
    .grid{display:grid;gap:16px}
    @media(min-width:768px){.grid{grid-template-columns:1fr 1fr}}
  </style>
</head>
<body>
  <h1>${docs?.name || "Warframe Status API"}</h1>
  <p>${docs?.message || "接口文档"}</p>
  <div class="grid">
    <section class="card">
      <h2>DE 国际服</h2>
      <table>
        <thead><tr><th>路径</th><th>说明</th></tr></thead>
        <tbody>${tableRows(deRoutes)}</tbody>
      </table>
    </section>
    <section class="card">
      <h2>WG 国服</h2>
      <table>
        <thead><tr><th>路径</th><th>说明</th></tr></thead>
        <tbody>${tableRows(wgRoutes)}</tbody>
      </table>
    </section>
  </div>
  <div class="footer">生成于：${new Date().toLocaleString()} · /docs 返回此页面 · /docs.json 返回 JSON</div>
</body>
</html>`;
  }
  app.get("/", (req, res) => {
    res.json({ name: apiDocs.name, message: apiDocs.message });
  });
  app.get("/docs", (req, res) => {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(renderDocsHtml(apiDocs));
  });
  app.get("/docs.json", (req, res) => {
    res.json(apiDocs);
  });
  return app;
}

module.exports = { createApp };
