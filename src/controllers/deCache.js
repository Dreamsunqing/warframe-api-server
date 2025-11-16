// TODO deCache.js
const path = require("path");
const fs = require("fs");
const { getDe } = require("../utils/getDe.js");
const deService = require("../services/deService.js");

// FIXME Function：refreshCache
// 参数：无:void
// 返回值：Promise:refreshCache
// 功能：刷新缓存数据，拉取最新的国际服数据
// 错误处理：捕获并记录错误，不抛出以保护调用方
let cachedDeData = null;
let cacheInitialized = false;
let cacheLock = false;

const CACHE_DIR = path.resolve(__dirname, "../../src/cache");
const CACHE_REFRESH_INTERVAL = 60_000;
const CACHE_SAVE_INTERVAL = 60_000;

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

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

// FIXME Function：saveCache
// 参数：无:void
// 返回值：Promise:saveCache
// 功能：将当前缓存写入磁盘文件
// 错误处理：捕获并记录错误
async function saveCache() {
  if (!cachedDeData) return;
  try {
    const oldFiles = fs.readdirSync(CACHE_DIR);
    oldFiles.forEach((file) => {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    });
    console.log(`[deCache]已删除旧缓存文件: ${oldFiles.join(", ")}`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const rawPath = path.join(CACHE_DIR, `decache-${timestamp}.json`);
    await fs.promises.writeFile(rawPath, JSON.stringify(cachedDeData));
    console.log(`[deCache]缓存已保存(原始): ${rawPath}`);

    // 构建并保存处理过的数据
    const processed = await buildProcessedCache();
    const processedPath = path.join(
      CACHE_DIR,
      `decache-processed-${timestamp}.json`
    );
    await fs.promises.writeFile(processedPath, JSON.stringify(processed));
    console.log(`[deCache]缓存已保存(处理过的): ${processedPath}`);
  } catch (error) {
    console.error("Cache save failed:", error);
  }
}

let cacheInterval = null;
let saveInterval = null;

// FIXME Function：startCacheMaintenance
// 参数：无:void
// 返回值：void:startCacheMaintenance
// 功能：启动定时刷新与保存任务
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
// 功能：确保缓存已初始化并返回缓存数据
// 错误处理：错误在内部被处理并记录
async function ensureCache() {
  if (!cacheInitialized || !cachedDeData) {
    await refreshCache();
  }
  return cachedDeData;
}

// FIXME Function：buildProcessedCache
// 参数：无:void
// 返回值：Promise:any
// 功能：基于原始缓存构建处理过的数据用于缓存
// 错误处理：函数内捕获处理错误抛出供上层记录
async function buildProcessedCache() {
  try {
    const data = cachedDeData;
    return {
      plainCycles: await deService.plainCycleProcess(data, "zh"),
      alerts: await deService.alertProcess(data, "zh"),
      archonHunt: await deService.archStorieProcess(data, "zh"),
      shipProgress: await deService.constructionProgress(data),
      invasions: await deService.invasionsProcess(data, "zh"),
      sortie: await deService.sortieProcess(data, "zh"),
      steelPathReward: await deService.stellPathrewardProcess(),
      fissures: await deService.fissureProcess(data, "zh"),
    };
  } catch (err) {
    console.error("构建处理后缓存失败:", err);
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
