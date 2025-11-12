// FIXME 数据处理层（de）
const CycleUtils = require("./deUtils/plainCycle.js");
const utils = new CycleUtils();
const fs = require("fs/promises");
const path = require("path");

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

// FIXME 获取警报信息
async function alertProcess(data) {
  try {
    // 加载本地化数据
    const [solNodesStr, missionTypesStr, factionsStr] = await Promise.all([
      fs.readFile(
        path.join(__dirname, "../public/i18n/zh/solNodes.json"),
        "utf8"
      ),
      fs.readFile(
        path.join(__dirname, "../public/i18n/zh/missionTypes.json"),
        "utf8"
      ),
      fs.readFile(
        path.join(__dirname, "../public/i18n/zh/factionData.json"),
        "utf8"
      ),
    ]);
    const solNodes = JSON.parse(solNodesStr);
    const missionTypes = JSON.parse(missionTypesStr);
    const factionsData = JSON.parse(factionsStr);
    // 获取原始数据
    const art = Array.isArray(data?.Alerts) ? data.Alerts : [];
    // 处理警报数据
    const Alerts = [];
    art.forEach((one) => {
      Alerts.push({
        node:
          solNodes[one.MissionInfo.location]?.value ||
          one.MissionInfo.location ||
          "未知节点",
        // 敌人等级
        enemyLevel: `${one.MissionInfo.minEnemyLevel} - ${one.MissionInfo.maxEnemyLevel}`,
        type:
          missionTypes[one.MissionInfo.missionType]?.value ||
          one.MissionInfo.missionType ||
          "未知任务",
        factions: factionsData[one.MissionInfo.faction].value,
        activation: new Date(Number(one.Activation.$date.$numberLong)),
        expiry: new Date(Number(one.Expiry.$date.$numberLong)),
        // TODO 未来开发
        rewards: one.MissionInfo.missionReward,
        // other: [
        //   one.MissionInfo.levelOverride,
        //   one.MissionInfo.enemySpec,
        //   one.MissionInfo.extraEnemySpec,
        //   one.MissionInfo.descText,
        //   one.MissionInfo.maxWaveNum,
        //   one.Tag,
        //   one.ForceUnlock,
        // ],
      });
    });
    if (Alerts.length === 0) {
      return {
        message: "没有可用的警报信息",
      };
    }
    return Alerts;
  } catch (error) {
    // 4. 统一错误处理 --------------------------------------------------
    // console.error("处理警报数据时出错:", {
    //   message: error.message,
    //   stack: error.stack,
    // });
    // throw new Error("获取警报数据失败");
  }
}

// FIXME 获取执行官突击周常
async function archStorieProcess(data) {
  try {
    // 1. 动态加载本地化数据 ------------------------------------------------
    const [solNodesStr, missionTypeStr, bossesDataStr] = await Promise.all([
      fs.readFile(
        path.join(__dirname, "../public/i18n/zh/solNodes.json"),
        "utf8"
      ),
      fs.readFile(
        path.join(__dirname, "../public/i18n/zh/missionTypes.json"),
        "utf8"
      ),
      fs.readFile(
        path.join(__dirname, "../public/i18n/zh/sortieData.json"),
        "utf8"
      ),
    ]);

    const solNodes = JSON.parse(solNodesStr);
    const missionType = JSON.parse(missionTypeStr);
    const { archBosses } = JSON.parse(bossesDataStr);

    // 2. 防御性数据验证 ---------------------------------------------------
    if (!data?.LiteSorties?.[0]) {
      throw new Error("Invalid data format: LiteSorties is missing or empty");
    }

    const liteSortie = data.LiteSorties[0];

    // 3. 构建ArchonHunt对象 ----------------------------------------------
    const ArchonHunt = {
      // 时间处理
      activation: new Date(Number(liteSortie.Activation.$date.$numberLong)),
      expiry: new Date(Number(liteSortie.Expiry.$date.$numberLong)),

      // Boss信息（带回退机制）
      boss: archBosses[liteSortie.Boss]?.name || liteSortie.Boss || "未知Boss",
      reward:
        archBosses[liteSortie.Boss]?.reward || liteSortie.reward || "未知奖励",

      // 任务列表处理
      missions: liteSortie.Missions.map((one) => ({
        node: solNodes[one.node]?.value || one.node || "未知节点",
        type:
          missionType[one.missionType]?.value ||
          one.missionType ||
          "未知任务类型",
      })),
    };

    return ArchonHunt;
  } catch (err) {
    // 4. 统一错误处理 ---------------------------------------------------
    console.error("Failed to process ArchonHunt data:", {
      message: err.message,
      stack: err.stack,
      data: data?.LiteSorties?.[0]
        ? "Partial data available"
        : "No valid sortie data",
    });

    throw new Error("Failed to get ArchonHunt data - see error details above");
  }
}

module.exports = { plainCycleProcess, alertProcess, archStorieProcess };
