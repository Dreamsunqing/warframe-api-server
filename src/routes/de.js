// FIXME 路由（de）
const express = require("express");
const router = express.Router();
const deController = require("../controllers/deController.js");

// 获取未处理过的数据缓存（从文件）
router.get("/all", deController.getALl);
// 缓存处理好的数据
router.get("/all/process", deController.getProcessedCache);

router.get("/shipprogress", deController.getShipProgress);
router.get("/invasions", deController.getInvasions);
router.get("/plain/cycles", deController.getPlainCycle);
router.get("/archsortie", deController.getArchStorie);
router.get("/alerts", deController.getAlert);
router.get("/sortie", deController.getSortie);
router.get("/stellrewad", deController.getStellPathreward);
router.get("/fissures", deController.getFissures);
module.exports = router;
