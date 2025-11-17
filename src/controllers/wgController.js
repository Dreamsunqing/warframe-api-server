const { success, error } = require("../utils/apiResponse.js");
const wgCache = require("./wgCache.js");
const wgService = require("../services/wgService.js");
const ensureCache = wgCache.ensureCache;
const startCacheMaintenance = wgCache.startCacheMaintenance;
const registerProcessSignals = wgCache.registerProcessSignals;

const wgController = {
  getAll: async (req, res) => {
    try {
      const data = await ensureCache();
      res.json(success(data.data));
    } catch (err) {
      res.json(
        error({ success: false, message: err?.message || "Server error" })
      );
    }
  },
  // 获取所有处理过的国服数据
  getProcessedCache: async (req, res) => {
    try {
      const processedData = await wgCache.buildProcessedCache();
      res.json(success(processedData));
    } catch (error) {
      res.json(
        error({
          success: false,
          message: error?.message || "Server error",
        })
      );
    }
  },

  getEvents: async (req, res) => {
    try {
      const data = await ensureCache();
      const events = await wgService.getEvents(data);
      res.json(success(events));
    } catch (err) {
      res.json(
        error({ success: false, message: err?.message || "Server error" })
      );
    }
  },
  getAlerts: async (req, res) => {
    try {
      const data = await ensureCache();
      const alerts = await wgService.getAlerts(data);
      res.json(success(alerts));
    } catch (err) {
      res.json(
        error({ success: false, message: err?.message || "Server error" })
      );
    }
  },
  getSortie: async (req, res) => {
    try {
      const data = await ensureCache();
      const sortie = await wgService.getSortie(data);
      res.json(success(sortie));
    } catch (err) {
      res.json(
        error({ success: false, message: err?.message || "Server error" })
      );
    }
  },
  getPlainJobs: async (req, res) => {
    try {
      const data = await ensureCache();
      const plainJobs = await wgService.getPlainJobs(data);
      res.json(success(plainJobs));
    } catch (err) {
      res.json(
        error({ success: false, message: err?.message || "Server error" })
      );
    }
  },
  getFissures: async (req, res) => {
    try {
      const data = await ensureCache();
      const fissures = await wgService.getFissures(data);
      res.json(success(fissures));
    } catch (err) {
      res.json(
        error({ success: false, message: err?.message || "Server error" })
      );
    }
  },
  getInvasions: async (req, res) => {
    try {
      const data = await ensureCache();
      const invasions = await wgService.getInvasions(data);
      res.json(success(invasions));
    } catch (err) {
      res.json(
        error({ success: false, message: err?.message || "Server error" })
      );
    }
  },
  getVoidTrader: async (req, res) => {
    try {
      const data = await ensureCache();
      const voidTrader = await wgService.getVoidTrader(data);
      res.json(success(voidTrader));
    } catch (err) {
      res.json(
        error({ success: false, message: err?.message || "Server error" })
      );
    }
  },
  getDeltav: async (req, res) => {
    try {
      const data = await ensureCache();
      const deltav = await wgService.getDeltav(data);
      res.json(success(deltav));
    } catch (err) {
      res.json(
        error({ success: false, message: err?.message || "Server error" })
      );
    }
  },
  getCycle: async (req, res) => {
    try {
      const data = await ensureCache();
      const cycle = await wgService.getCycle(data);
      res.json(success(cycle));
    } catch (err) {
      res.json(
        error({ success: false, message: err?.message || "Server error" })
      );
    }
  },
};

// 初始化缓存维护
startCacheMaintenance();
registerProcessSignals();

module.exports = wgController;
