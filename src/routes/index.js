// FIXME 统一导出路由
const deRoutes = require("./de");
const wgRoutes = require("./wg");
function setupRoutes(app) {
  // 挂载 de 路由（自动添加 /de 前缀）
  app.use("/de", deRoutes);
  // 挂载 wg 路由（自动添加 /wg 前缀）
  app.use("/wg", wgRoutes);
}
module.exports = setupRoutes;
