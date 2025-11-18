// TODO api/index.js
const serverless = require("serverless-http");
const { createApp } = require("../src/app.js");

// FIXME Function：handler
// 参数：req:any
// 参数：res:any
// 返回值：Function:handler
// 功能：Vercel 入口，使用 serverless-http 包装 Express 应用
// 错误处理：错误由各路由内部处理
const app = createApp();
module.exports = serverless(app);