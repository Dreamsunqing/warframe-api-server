// TODO wgCache.js
const path = require("path");
const fs = require("fs");
const { getwg } = require("../utils/getWg.js");
const wgService = require("../services/wgService.js");

// FIXME Function：refreshCache
// 参数：无:void
// 返回值：Promise:refreshCache
// 功能：刷新国服缓存数据（原始）
// 错误处理：捕获并记录错误，不抛出以保护调用方
let cachedWgData = null;
let cacheInitialized = false;
let cacheLock = false;

const CACHE_DIR = path.resolve(__dirname, "../../src/cache/wg");
const CACHE_REFRESH_INTERVAL = 60_000;
const CACHE_SAVE_INTERVAL = 60_000;

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function refreshCache() {
  if (cacheLock) return;
  cacheLock = true;
  try {
    const newData = await getwg();
    cachedWgData = newData;
    cacheInitialized = true;
  } catch (error) {
    console.error("[wgCache]Cache refresh failed:", error);
  } finally {
    cacheLock = false;
  }
}

// FIXME Function：saveCache
// 参数：无:void
// 返回值：Promise:saveCache
// 功能：将当前国服缓存写入磁盘文件（原始+处理）
// 错误处理：捕获并记录错误
async function saveCache() {
  if (!cachedWgData) return;
  try {
    const oldFiles = fs.readdirSync(CACHE_DIR);
    oldFiles.forEach((file) => {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    });
    console.log(`[wgCache]已删除旧缓存文件: ${oldFiles.join(", ")}`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const rawPath = path.join(CACHE_DIR, `wgcache-${timestamp}.json`);
    await fs.promises.writeFile(rawPath, JSON.stringify(cachedWgData));
    console.log(`[wgCache]缓存已保存(原始): ${rawPath}`);

    const processed = await buildProcessedCache();
    const processedPath = path.join(
      CACHE_DIR,
      `wgcache-processed-${timestamp}.json`
    );
    await fs.promises.writeFile(processedPath, JSON.stringify(processed));
    console.log(`[wgCache]缓存已保存(处理过的): ${processedPath}`);
  } catch (error) {
    console.error("[wgCache]Cache save failed:", error);
  }
}

let cacheInterval = null;
let saveInterval = null;

// FIXME Function：startCacheMaintenance
// 参数：无:void
// 返回值：void:startCacheMaintenance
// 功能：启动国服缓存的定时刷新与保存
// 错误处理：无
function startCacheMaintenance() {
  if (cacheInterval) clearInterval(cacheInterval);
  if (saveInterval) clearInterval(saveInterval);
  cacheInterval = setInterval(refreshCache, CACHE_REFRESH_INTERVAL);
  saveInterval = setInterval(saveCache, CACHE_SAVE_INTERVAL);
  refreshCache().then(() => saveCache());
}

// FIXME Function：ensureCache
// 参数：无:void
// 返回值：Promise:any
// 功能：确保国服缓存已初始化并返回缓存数据
// 错误处理：错误在内部被处理并记录
async function ensureCache() {
  if (!cacheInitialized || !cachedWgData) {
    await refreshCache();
  }
  return cachedWgData;
}

// FIXME Function：buildProcessedCache
// 参数：无:void
// 返回值：Promise:any
// 功能：基于原始国服缓存构建处理过的数据（事件/警报）
// 错误处理：内部记录错误并抛出
async function buildProcessedCache() {
  try {
    const data = await ensureCache();
    return {
      events: await wgService.getEvents(data),
      alerts: await wgService.getAlerts(data),
      sortie: await wgService.getSortie(data),
      plainJobs: await wgService.getPlainJobs(data),
      fissures: await wgService.getFissures(data),
      invasions: await wgService.getInvasions(data),
      voidTrader: await wgService.getVoidTrader(data),
      deltav: await wgService.getDeltav(data),
    };
  } catch (err) {
    console.error("[wgCache]构建处理后缓存失败:", err);
    throw err;
  }
}

// FIXME Function：clearCacheIntervals
// 参数：无:void
// 返回值：void:clearCacheIntervals
// 功能：清理缓存相关定时器
// 错误处理：无
function clearCacheIntervals() {
  if (cacheInterval) clearInterval(cacheInterval);
  if (saveInterval) clearInterval(saveInterval);
}

// FIXME Function：registerProcessSignals
// 参数：无:void
// 返回值：void:registerProcessSignals
// 功能：注册进程退出信号以清理资源
// 错误处理：无
function registerProcessSignals() {
  process.on("SIGINT", () => {
    clearCacheIntervals();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    clearCacheIntervals();
    process.exit(0);
  });
}

module.exports = {
  refreshCache,
  saveCache,
  startCacheMaintenance,
  ensureCache,
  clearCacheIntervals,
  registerProcessSignals,
  buildProcessedCache,
};
