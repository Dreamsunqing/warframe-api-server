// FIXME国际化路径配置
module.exports = (lang = "zh") => [
  {
    key: "solNodes",
    relPath: `../public/i18n/${lang}/solNodes.json`,
  },
  {
    key: "missionTypes",
    relPath: `../public/i18n/${lang}/missionTypes.json`,
  },
  {
    key: "modifierTypes",
    relPath: `../public/i18n/${lang}/sortieData.json`,
    processor: (data) => data?.modifierTypes || [],
  },
  {
    key: "factionsData",
    relPath: `../public/i18n/${lang}/factionData.json`,
  },
  {
    key: "archBosses",
    relPath: `../public/i18n/${lang}/sortieData.json`,
    processor: (data) => data?.archBosses || [],
  },
  {
    key: "itemsData",
    relPath: `../public/i18n/${lang}/itemsData.json`,
  },
  {
    key: "fissureLevel",
    relPath: `../public/i18n/${lang}/fissureLevel.json`,
  },
];
