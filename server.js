const { createApp } = require("./src/app.js");
const app = createApp();

// 根路由示例

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
