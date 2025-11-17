const express = require("express");
const setupRoutes = require("./src/routes/index.js"); // 引入统一路由配置
const app = express();
app.use(express.json());
// 配置路由
setupRoutes(app);

// 根路由示例
app.get("/", (req, res) => {
  res.json({
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
        正在开发中: "请期待",
      },
    },
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
