// FIXME 数据处理层（de）
const CycleUtils = require("./deUtils/plainCycle.js");
const utils = new CycleUtils();

//   循环的持续时间和状态
const loopItems = {
  夜灵平原: [
    { state: "day", name: "白昼", duration: 6000000, minute: "100m" },
    { state: "night", name: "夜晚", duration: 3000000, minute: "50m" },
  ],
  奥布山谷: [
    { state: "cold", name: "寒冷", duration: 1200000, minute: "20m" },
    { state: "warm", name: "温暖", duration: 400000, minute: "6m40s" },
  ],
  魔胎之境: [
    { state: "fass", name: "Fass", duration: 6000000, minute: "100m" },
    { state: "vome", name: "Vome", duration: 3000000, minute: "50m" },
  ],
  扎里曼: [
    {
      state: "grineer",
      name: "蠕虫女皇入侵者",
      duration: 9000000,
      minute: "150m",
    },
    {
      state: "corpus",
      name: "帕尔沃斯的部队",
      duration: 9000000,
      minute: "150m",
    },
  ],
  地球: [
    { state: "day", name: "白昼", duration: 14400000, minute: "240m" },
    { state: "night", name: "夜晚", duration: 14400000, minute: "240m" },
  ],
  双衍王境: [
    { state: "joy", name: "喜悦", duration: 7200000, minute: "120m" },
    { state: "anger", name: "愤怒", duration: 7200000, minute: "120m" },
    { state: "envy", name: "嫉妒", duration: 7200000, minute: "120m" },
    { state: "sorrow", name: "悲伤", duration: 7200000, minute: "120m" },
    { state: "fear", name: "恐惧", duration: 7200000, minute: "120m" },
  ],
};

//  FIXME 获取平原循环
async function plainCycleProcess(data) {
  const deData = data;
  // 从国际服api获取原始数据，地球和王境推算
  const cache = {
    夜灵平原:
      deData?.SyndicateMissions.find((one) => one.Tag === "CetusSyndicate") ||
      {},
    奥布山谷:
      deData?.SyndicateMissions.find((one) => one.Tag === "SolarisSyndicate") ||
      {},
    魔胎之境:
      deData?.SyndicateMissions.find((one) => one.Tag === "EntratiSyndicate") ||
      {},
    扎里曼:
      deData?.SyndicateMissions.find((one) => one.Tag === "ZarimanSyndicate") ||
      {},
    地球: {},
    双衍王境: {},
  };
  const cycleItems = [];
  for (const key in cache) {
    // 获取要处理的数据
    const loopList = loopItems[key];
    const item = cache[key];
    let startTime;
    //  地球和双衍王境需要自行计算开始时间
    if (key == "地球") {
      startTime = utils.calcCycleStartTime(loopList, 1746691200097);
    } else if (key == "双衍王境") {
      startTime = utils.calcCycleStartTime(loopList, 1746734400000);
    } else {
      startTime = Number(item.Activation?.$date.$numberLong);
    }
    const currentInfo = utils.plainCycleInfo(loopList, startTime);
    cycleItems.push({
      name: key,
      state: currentInfo.state,
      stateName: currentInfo.name,
      minute: currentInfo.minute,
      activation: new Date(currentInfo.activation),
      expiry: new Date(currentInfo.expiry),
    });
  }
  return cycleItems;
}

module.exports = { plainCycleProcess };
