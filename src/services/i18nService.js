// FIXME 国际化服务
const i18nPaths = require("../configs/i8nPaths.js");
const loadJsonFiles = require("../utils/i18n.js");

class I18nService {
  constructor(lang = "zh") {
    this.lang = lang;
    this.configs = i18nPaths(lang);
    this.rawConfigs = [...this.configs]; // 保存原始配置用于哈希

    // 生成配置哈希用于缓存key
    this.hash = this.rawConfigs
      .map((c) => c.relPath)
      .sort()
      .join("|")
      .hashCode();
  }

  async load() {
    return loadJsonFiles({
      lang: this.lang,
      hash: this.hash,
      paths: this.configs.map((c) => c.relPath),
      rawConfigs: this.rawConfigs,
    });
  }
}

// 添加hashCode扩展
Object.defineProperty(String.prototype, "hashCode", {
  value: function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
      hash = (Math.imul(31, hash) + this.charCodeAt(i)) | 0;
    }
    return hash;
  },
});

module.exports = I18nService;
