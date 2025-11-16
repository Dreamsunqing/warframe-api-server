// FIXME 路由组织（we）
const express = require("express");
const router = express.Router();
const wgController = require("../controllers/wgController.js");

router.get("/all", wgController.getAll);
router.get("/events", wgController.getEvents);
router.get("/alerts", wgController.getAlerts);
router.get("/sortie", wgController.getSortie);
router.get("/plainJobs", wgController.getPlainJobs);
module.exports = router;
