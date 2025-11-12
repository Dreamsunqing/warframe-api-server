// FIXME 国际化JSON文件加载器
const fs = require("fs").promises;
const path = require("path");
const cache = new Map(); // 语言缓存

async function loadJsonFiles(configs) {
  // 生成缓存key：语言+配置哈希
  const cacheKey = `${configs.lang}-${configs.hash}`;

  // 尝试从缓存获取
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const results = {};
  const filePaths = configs.paths.map((p) => path.resolve(__dirname, p));

  try {
    // 并发读取文件
    const fileContents = await Promise.all(
      filePaths.map((p) => fs.readFile(p, "utf8"))
    );

    // 处理每个文件内容
    configs.rawConfigs.forEach((config, index) => {
      const content = fileContents[index];
      results[config.key] = config.processor
        ? config.processor(JSON.parse(content))
        : JSON.parse(content);
    });

    // 存入缓存（设置TTL 1小时）
    cache.set(cacheKey, results, 3600_000);
    return results;
  } catch (error) {
    // 回退到默认语言
    if (configs.lang !== "zh") {
      console.warn(`Loading ${configs.lang} failed, falling back to zh`);
      return loadJsonFiles({
        ...configs,
        lang: "zh",
      });
    }
    throw error;
  }
}

module.exports = loadJsonFiles;
