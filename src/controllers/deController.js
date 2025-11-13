const deService = require("../services/deService.js");
const { getDe } = require("../utils/getDe.js");
const path = require("path");
const fs = require("fs");
const { success, error } = require("../utils/apiResponse.js");

// 缓存策略参数
const CACHE_DIR = path.resolve(__dirname, "../../src/cache");
const CACHE_REFRESH_INTERVAL = 60_000; // 1分钟
const CACHE_SAVE_INTERVAL = 600_000; // 10分钟
// 确保缓存目录存在
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}
// 缓存状态管理
let cachedDeData = null;
let cacheInitialized = false;
let cacheLock = false;
let cacheInterval = null;
let saveInterval = null;
// 缓存刷新函数
async function refreshCache() {
  if (cacheLock) return;
  cacheLock = true;
  try {
    const newData = await getDe();
    cachedDeData = newData;
    cacheInitialized = true;
  } catch (error) {
    console.error("Cache refresh failed:", error);
  } finally {
    cacheLock = false;
  }
}
// 缓存保存函数
async function saveCache() {
  if (!cachedDeData) return;

  try {
    // 删除原缓存文件
    const oldFiles = fs.readdirSync(CACHE_DIR);
    oldFiles.forEach((file) => {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    });
    console.log(`Deleted old cache files: ${oldFiles.join(", ")}`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(CACHE_DIR, `${timestamp}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(cachedDeData));
    console.log(`Cache saved to ${filePath}`);
  } catch (error) {
    console.error("Cache save failed:", error);
  }
}
// 启动定时任务
function startCacheMaintenance() {
  // 清除已有定时器
  if (cacheInterval) clearInterval(cacheInterval);
  if (saveInterval) clearInterval(saveInterval);

  // 设置新定时器
  cacheInterval = setInterval(refreshCache, CACHE_REFRESH_INTERVAL);
  saveInterval = setInterval(saveCache, CACHE_SAVE_INTERVAL);

  // 首次加载立即刷新并保存
  refreshCache().then(() => saveCache());
}
// 确保缓存存在
async function ensureCache() {
  if (!cacheInitialized || !cachedDeData) {
    await refreshCache();
  }
  return cachedDeData;
}

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

// 清理资源
function clearCacheIntervals() {
  if (cacheInterval) clearInterval(cacheInterval);
  if (saveInterval) clearInterval(saveInterval);
}
// 捕获进程退出信号
process.on("SIGINT", () => {
  clearCacheIntervals();
  process.exit(0);
});
process.on("SIGTERM", () => {
  clearCacheIntervals();
  process.exit(0);
});
// 初始化缓存维护
startCacheMaintenance();

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
  refreshCache, // 手动刷新缓存
  saveCache, // 手动保存缓存文件
};
