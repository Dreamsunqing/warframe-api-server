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

// FIXME 获取警报
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
        // TODO 警报奖励未来开发
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
    // 错误处理
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
    // 加载本地数据
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

    // 防御性数据验证
    if (!data?.LiteSorties?.[0]) {
      throw new Error("Invalid data format: LiteSorties is missing or empty");
    }

    const liteSortie = data.LiteSorties[0];

    // 构建ArchonHunt对象
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
    // 统一错误处理
    // console.error("Failed to process ArchonHunt data:", {
    //   message: err.message,
    //   stack: err.stack,
    //   data: data?.LiteSorties?.[0]
    //     ? "Partial data available"
    //     : "No valid sortie data",
    // });
    // throw new Error("Failed to get ArchonHunt data - see error details above");
  }
}

// FIXME 获取战舰建造进度
async function constructionProgress(data) {
  try {
    // 防御性数据验证
    if (!data?.ProjectPct || data.ProjectPct.length !== 2) {
      throw new Error("提示：战舰可能正在进攻您的中继站");
    }
  } catch (err) {
    // 统一错误处理
  }

  const Progress = {
    fomorian: Math.min(data.ProjectPct[0], 100).toFixed(2),
    fomorianName: "巨人战舰",
    razorback: Math.min(data.ProjectPct[1], 100).toFixed(2),
    razorbackName: "利刃豺狼舰队",
  };
  return Progress;
}
//  处理入侵奖励
function invasionsReward(value, itemUniqueName) {
  // 增加 itemUniqueName 参数传递
  if (!value || !value.countedItems) return "";
  const rewardList = value.countedItems.map((one) => {
    one.ItemType = one.ItemType.toLowerCase();
    if (!itemUniqueName[one.ItemType]) {
      console.log(`未找到物品: ${one.ItemType}`);
    }

    const name = itemUniqueName[one.ItemType]?.value || one.ItemType;
    return `${one.ItemCount} ${name}`;
  });
  return rewardList.join(" + ");
}

// FIXME 获取入侵数据
async function invasionsProcess(data) {
  try {
    //  加载 JSON 文件
    const solNodesPath = path.join(
      __dirname,
      "../public/i18n/zh/solNodes.json"
    );
    const factionsDataPath = path.join(
      __dirname,
      "../public/i18n/zh/factionData.json"
    );
    const itemsDataPath = path.join(
      __dirname,
      "../public/i18n/zh/itemsData.json"
    ); // 假设物品数据也放在JSON文件中

    // 并行读取所有文件
    const [solNodesStr, factionsDataStr, itemsDataStr] = await Promise.all([
      fs.readFile(solNodesPath, "utf8"),
      fs.readFile(factionsDataPath, "utf8"),
      fs.readFile(itemsDataPath, "utf8"),
    ]);

    // 解析JSON数据
    const solNodes = JSON.parse(solNodesStr);
    const factionsData = JSON.parse(factionsDataStr);
    const itemUniqueName = JSON.parse(itemsDataStr); // 物品数据

    // 2. 处理入侵数据
    const invasions = [];

    if (!data?.Invasions || !Array.isArray(data.Invasions)) {
      throw new Error(
        "Invalid data format: Invasions is missing or not an array"
      );
    }

    data.Invasions.forEach((one) => {
      // 排除已结束的
      if (one.Completed) return;

      invasions.push({
        node: solNodes[one.Node]?.value || one.Node || "未知节点",
        completion: (((one.Count + one.Goal) / (one.Goal * 2)) * 100).toFixed(
          2
        ),
        attacker: {
          faction:
            factionsData[one.Faction]?.value || one.Faction || "未知阵营",
          reward: invasionsReward(one.AttackerReward, itemUniqueName), // 传递物品数据
        },
        defender: {
          faction:
            factionsData[one.DefenderFaction]?.value ||
            one.DefenderFaction ||
            "未知阵营",
          reward: invasionsReward(one.DefenderReward, itemUniqueName), // 传递物品数据
        },
      });
    });

    return invasions;
  } catch (error) {
    console.error("处理入侵数据时出错:", error);
    throw new Error("Failed to process invasions data");
  }
}

module.exports = {
  plainCycleProcess,
  alertProcess,
  invasionsProcess,
  archStorieProcess,
  constructionProgress,
};
