// FIXME 路由组织（we）
const express = require("express");
const router = express.Router();
const wgController = require("../controllers/wgController.js");

router.get("/all", wgController.getAll);
module.exports = router;
