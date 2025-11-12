// FIXME 路由组织（de）
const express = require("express");
const router = express.Router();
const deController = require("../controllers/deController.js");

// TODO 接口分组
// 获取所有数据
// router.get("/all", deController.getAllData);

/**
 * 实时性 降序
 */
// 获取所有实时裂隙
// router.get("/fissures", deController.getAlerts);
// 获取普通裂隙
// router.get("/fissures/pt", deController.getAlerts);
// 获取钢铁裂隙
// router.get("/fissures/hard", deController.getAlerts);
// 获取风暴裂隙
// router.get("/fissures/storm", deController.getAlerts);

// 获取平原数据
// router.get("/plain", deController);
// 循环状态
router.get("/plain/cycles", deController.getPlainCycle);
// 赏金任务
// router.get("/alerts/jobs", deController);

// 获取每日突击
// router.get("/sortie", deController);

// 获取每日集团任务
// router.get("/syndicates", deController.getAlerts);

// 获取每周钢铁之路奖励(泰辛)
// router.get("/stellrewad", deController.getAlerts);

// 获取获取执行官周常数据
router.get("/archsortie", deController.getArchStorie);

// 获取入侵任务
// router.get("/invasions", deController.getAlerts);
// 获取战舰建造进度
// router.get("/shipprogress", deController.getAlerts);

// 获取警报数据;
router.get("/alerts", deController.getAlert);

module.exports = router;
