// FIXME 路由组织（de）
const express = require("express");
const router = express.Router();
const deController = require("../controllers/deController.js");

router.get("/shipprogress", deController.getShipProgress);
router.get("/invasions", deController.getInvasions);
router.get("/plain/cycles", deController.getPlainCycle);
router.get("/archsortie", deController.getArchStorie);
router.get("/alerts", deController.getAlert);
router.get("/sortie", deController.getSortie);
router.get("/stellrewad", deController.getStellPathreward);
router.get("/fissures", deController.getFissures);
module.exports = router;
