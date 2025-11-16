const deService = require("../services/deService.js");
const { success, error } = require("../utils/apiResponse.js");
const deCache = require("./deCache.js");
const ensureCache = deCache.ensureCache;
const startCacheMaintenance = deCache.startCacheMaintenance;
const registerProcessSignals = deCache.registerProcessSignals;

// 缓存模块已抽离至 controllers/deCache.js

// FIXME 控制器函数（de）
// FIXME 处理循环信息
const getPlainCycle = async (req, res) => {
  try {
    const warframeData = await ensureCache();
    const data = await deService.plainCycleProcess(warframeData);
    res.json(success(data));
  } catch (error) {
    res.json(
      error({
        success: false,
        message: error?.message || "Server error",
      })
    );
  }
};
// FIXME 处理警报信息
const getAlert = async (req, res) => {
  try {
    const warframeData = await ensureCache();
    const data = await deService.alertProcess(warframeData);
    res.json(success(data));
  } catch (error) {
    res.json(
      error({
        success: false,
        message: error?.message || "Server error",
      })
    );
  }
};

// FIXME 处理执行官周常信息
const getArchStorie = async (req, res) => {
  try {
    const warframeData = await ensureCache();
    const data = await deService.archStorieProcess(warframeData);
    res.json(success(data));
  } catch (error) {
    res.json(
      error({
        success: false,
        message: error?.message || "Server error",
      })
    );
  }
};

// FIXME 处理战舰建造进度信息
const getShipProgress = async (req, res) => {
  try {
    const warframeData = await ensureCache();
    const data = await deService.constructionProgress(warframeData);
    res.json(success(data));
  } catch (error) {
    res.json(
      error({
        success: false,
        message: error?.message || "Server error",
      })
    );
  }
};

// FIXME 处理入侵数据
const getInvasions = async (req, res) => {
  try {
    const warframeData = await ensureCache();
    const data = await deService.invasionsProcess(warframeData);
    res.json(success(data));
  } catch (error) {
    res.json(
      error({
        success: false,
        message: error?.message || "Server error",
      })
    );
  }
};
// FIXME 处理每日突击信息
const getSortie = async (req, res) => {
  try {
    const warframeData = await ensureCache();
    const data = await deService.sortieProcess(warframeData);
    res.json(success(data));
  } catch (error) {
    res.json(
      error({
        success: false,
        message: error?.message || "Server error",
      })
    );
  }
};

// FIXME 处理每周钢铁之路奖励
const getStellPathreward = async (req, res) => {
  try {
    const warframeData = await ensureCache();
    const data = await deService.stellPathrewardProcess(warframeData);
    res.json(success(data));
  } catch (error) {
    res.json(error());
  }
};

// FIXME 处理裂缝任务信息
const getFissures = async (req, res) => {
  try {
    const warframeData = await ensureCache();
    const data = await deService.fissureProcess(warframeData);
    res.json(success(data));
  } catch (error) {
    res.json(error());
  }
};

// 初始化缓存维护
startCacheMaintenance();
registerProcessSignals();

module.exports = {
  getPlainCycle,
  getAlert,
  getSortie,
  getShipProgress,
  getInvasions,
  getArchStorie,
  getStellPathreward,
  getFissures,
  // 缓存维护
  refreshCache: deCache.refreshCache, // 手动刷新缓存
  saveCache: deCache.saveCache, // 手动保存缓存文件
};
