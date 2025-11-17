// FIXME 路由（we）
const express = require("express");
const router = express.Router();
const wgController = require("../controllers/wgController.js");

// 获取国服原始数据
router.get("/all", wgController.getAll);
// 从缓存获取处理好的数据
router.get("/all/process", wgController.getProcessedCache);

router.get("/events", wgController.getEvents);
router.get("/alerts", wgController.getAlerts);
router.get("/sortie", wgController.getSortie);
router.get("/plainJobs", wgController.getPlainJobs);
router.get("/fissures", wgController.getFissures);
router.get("/invasions", wgController.getInvasions);
router.get("/voidTrader", wgController.getVoidTrader);
router.get("/deltav", wgController.getDeltav);
router.get("/cycle", wgController.getCycle);
router.get("/constructionProgress", wgController.getConstructionProgress);

module.exports = router;
