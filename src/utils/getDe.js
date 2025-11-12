// FIXME 获取原始数据（de）
const axios = require("axios");
// 存储实际数据
let worldStateData = null;

/**
 * 实际获取数据的内部函数
 * @param {number} retries - 重试次数（默认3次）
 * @returns {Promise<object>} - 包含世界状态数据的 Promise
 * @throws {Error} - 若重试耗尽仍失败
 * @description 该函数用于获取 Warframe 世界状态数据，支持重试机制。
 * 若首次请求失败，会根据重试次数自动重试，每次重试间隔 2 秒。
 * 若重试耗尽仍失败，则抛出错误。
 */
async function fetchWorldStateWithRetry(retries = 3) {
  try {
    const response = await axios.get(
      "https://api.warframe.com/cdn/worldState.php"
    );
    worldStateData = response.data; // 存储真实数据
    return worldStateData;
  } catch (error) {
    console.error(
      `获取 Warframe 世界状态失败（剩余重试次数：${retries - 1}）`,
      "错误信息：",
      error.message
    );
    if (retries > 1) {
      // 重试前等待 2 秒，避免频繁请求
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return fetchWorldStateWithRetry(retries - 1);
    }
    // 重试耗尽仍失败，抛出错误
    throw new Error("多次尝试后仍无法获取数据:");
  }
}

/**
 * @returns {object} - 包含世界状态数据的对象
 * @description 该对外提供的函数用于获取 Warframe 世界状态数据。
 * 若数据未加载，会触发首次加载并返回 Promise。
 * 若数据已加载，直接返回缓存数据（同步）。
 */
async function getDe() {
  if (!worldStateData) {
    // 若数据未加载，
    await fetchWorldStateWithRetry();
    return worldStateData;
  }
  // 已加载则直接返回数据（同步）
  return worldStateData;
  S;
}

module.exports = { getDe };
// 调试用;
// async function dev() {
//   const a = await getDe();
//   console.log(a);
// }
// dev();
