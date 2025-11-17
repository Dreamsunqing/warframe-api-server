// FIXME 数据处理层 （wg）

const {
  combineLatest,
} = require("puppeteer-core/lib/esm/third_party/rxjs/rxjs.js");

async function getEvents(data) {
  const hort = [
    {
      zh: "奥提克光子枪 破坏者",
      count: 100,
    },
    {
      zh: "雪藏的恩怨纹章",
      count: 75,
    },
    {
      zh: "并合 散弹弹幕 + 并合 膛线",
      count: 50,
    },
    {
      zh: "并合 弹头扩散 + 并合 肢解",
      count: 25,
    },
    {
      zh: "雪藏的恩怨纹章",
      count: 5,
    },
  ];
  const events = [];
  data.data.events.forEach((item) =>
    events.push({
      name: item.description,
      title: item.tooltip,
      node: item.node,
      activation: item.activation,
      expiry: item.expiry,
      item: item.description.includes("热美亚") ? hort : [],
    })
  );
  return events;
}
async function getAlerts(data) {
  const alerts = [];
  data.data.alerts.map((item) => {
    const rewardItems = [];
    if (item.mission) {
      item.mission.reward.countedItems.forEach((item) =>
        rewardItems.push({
          // 奖励物品类型
          // FIXME 这里会出现未翻译的物品名称type
          type: item.type,
          count: item.count,
        })
      );
    }
    alerts.push({
      activation: item.activation,
      expiry: item.expiry,
      name: item.mission.description,
      node: item.mission.node,
      type: item.mission.type,
      faction: item.mission.faction,
      rewards: {
        credits: item.mission.reward.credits,
        countedItems: rewardItems,
      },
    });
  });
  return alerts;
}

async function getSortie(data) {
  const sortieMissions = [];
  data.data.sortie.variants.forEach((item, index) =>
    sortieMissions.push({
      index: index,
      node: item.node,
      missionType: item.missionType,
      modifier: item.modifier,
      modifierDesc: item.modifierDescription,
    })
  );
  const sortie = {
    activation: data.data.sortie.activation,
    expiry: data.data.sortie.expiry,
    boss: data.data.sortie.boss,
    faction: data.data.sortie.faction,
    sortieMissions: sortieMissions,
  };

  return sortie;
}

async function getPlainJobs(data) {
  const plainJobs = [];
  data.data.syndicateMissions.forEach((item) => {
    const jobs = [];
    if (item.jobs) {
      item.jobs.forEach((job) =>
        jobs.push({
          jobName: job.enemyLevels[0] !== 100 ? job.type : job.type + " 钢铁",
          level: job.enemyLevels[0] + "-" + job.enemyLevels[1],
          count: job.standingStages,
        })
      );
    }
    // TODO 过滤掉没有赏金的集团（目前只有3大平原咯，圣所1999尚未找到）
    if (jobs.length > 0) {
      plainJobs.push({
        plainName: item.syndicate,
        activation: item.activation,
        expiry: item.expiry,
        jobs: jobs,
      });
    }
  });
  return plainJobs;
}

async function getFissures(data) {
  const fissures = [];
  data.data.fissures.forEach((item) => {
    const match = String(item.tierNum).match(/(\d)(?!.*\d)/);
    let tier = match ? Number(match[1]) : Number(item.tierNum);
    let tierName = "";
    if (tier === 1) {
      tierName = "古纪";
    } else if (tier === 2) {
      tierName = "前纪";
    } else if (tier === 3) {
      tierName = "中纪";
    } else if (tier === 4) {
      tierName = "后纪";
    } else if (tier === 5) {
      tierName = "安魂";
    } else if (tier === 6) {
      tierName = "全能";
    }
    fissures.push({
      activation: item.activation,
      expiry: item.expiry,
      tier: tier,
      tierName: tierName,
      node: item.node,
      type: item.missionType,
      faction: item.enemy,
      isHard: item.isHard,
      isStorm: item.isStorm,
    });
  });
  // TODO 映射 node faction 到 中文，从 i18n 中读取 solNodes.json
  const solNodes = require("../public/i18n/CH/solNodes.json");
  fissures.forEach((item) => {
    item.node = solNodes[item.node]?.value || item.node;
    item.faction = solNodes[item.faction]?.enemy || item.faction;
    item.type = solNodes[item.type]?.type || item.type;
  });

  // TODO 排序，根据tier从低到高
  fissures.sort((a, b) => {
    if (a.tier !== b.tier) {
      return a.tier - b.tier;
    }
  });

  return fissures;
}

// TODO 入侵任务
async function getInvasions(data) {
  const invasions = [];
  data.data.invasions.forEach((item) => {
    if (item.completion < 0) return;
    invasions.push({
      activation: item.activation,
      node: item.node,
      desc: item.desc,
      // 进度百分比
      completion: Number(item.completion).toFixed(2),
      // FIXME 从这里计算 count是进度，有正负数。requireRuns是总数
      count: item.count,
      requireRuns: item.requiredRuns,
      attacker: {
        faction: item.attackingFaction,
        reward: item.attackerReward.countedItems.map((item) => ({
          type: item.type,
          count: item.count,
        })),
      },
      defender: {
        faction: item.defendingFaction,
        reward: item.defender.reward.countedItems.map((item) => ({
          type: item.type,
          count: item.count,
        })),
      },
    });
  });
  return invasions;
}

// TODO 虚空商人
async function getVoidTrader(data) {
  const voidTrader = data.data.voidTrader;
  // if (voidTrader.activation > Date.now()) return true;
  return {
    activation: voidTrader.activation,
    expiry: voidTrader.expiry,
    name: voidTrader.character,
    node: voidTrader.location,
    type: voidTrader.type,
    // 还有多久来
    start: voidTrader.startString,
    // 还有多久走
    end: voidTrader.endString,
    state: voidTrader.activation < Date.now() ? "到达" : "离开",
    // FIXME 虚空商人物品 11-28 11-30 注意完善
    inventory: voidTrader.inventory.map((item) => ({
      // type: item.type,
      // count: item.count,
      尚未确定数据结构: "11-28 11-30 注意完善",
      item: item,
    })),
  };
}

// TODO 达尔特惠
async function getDeltav(data) {
  const deltav = data.data.dailyDeals;
  const items = [];
  deltav.forEach((item) => {
    items.push({
      activation: item.activation,
      expiry: item.expiry,
      // FIXME 商品名称 需要映射到中文
      name: item.item,
      // 原价，
      // 销售价格，
      // 总共，
      // 售出，
      // 折扣
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      total: item.total,
      sold: item.sold,
      discount: item.discount,
    });
  });
  return {
    items: items,
  };
}

// TODO 获取循环状态
async function getCycle(data) {
  const { earthCycle, cetusCycle, cambionCycle, zarimanCycle, vallisCycle } =
    data.data;
  const cycleInfo = {
    地球: earthCycle,
    夜灵平原: cetusCycle,
    奥布山谷: vallisCycle,
    魔胎之境: cambionCycle,
    扎里曼: zarimanCycle,
    双衍王境: {},
  };
  // FIXME 待修改 王境开始时间
  const dub = {
    双衍王境: [
      { state: "joy", name: "喜悦", duration: 7200000, minute: "120m" },
      { state: "anger", name: "愤怒", duration: 7200000, minute: "120m" },
      { state: "envy", name: "嫉妒", duration: 7200000, minute: "120m" },
      { state: "sorrow", name: "悲伤", duration: 7200000, minute: "120m" },
      { state: "fear", name: "恐惧", duration: 7200000, minute: "120m" },
    ],
  };
  function formatState(state) {
    if (state == "day") {
      return "白昼";
    } else if (state == "night") {
      return "夜晚";
    } else if (state == "cold") {
      return "寒冷";
    } else if (state == "warm") {
      return "温暖";
    } else if (state == "fass") {
      return "秩序";
    } else if (state == "vome") {
      return "混乱";
    } else if (state == "grineer") {
      return "蠕虫女皇入侵者";
    } else if (state == "corpus") {
      return "帕尔沃斯的部队";
    }
  }

  const cycle = [];
  for (const key in cycleInfo) {
    const item = cycleInfo[key];
    // FIXME 待修改 王境开始时间
    if (key == "双衍王境") {
      continue;
    }
    cycle.push({
      activation: item.activation,
      expiry: item.expiry,
      name: key,
      state: formatState(item.state) || formatState(item.active),
    });
  }
  return cycle;
}

// TODO 建造进度
async function getConstructionProgress(data) {
  const constructionProgress = data.data.constructionProgress;
  return {
    fomorianName: "巨人战舰",
    fomorianProgress: constructionProgress.fomorianProgress,
    razorbackName: "利刃豺狼战舰",
    razorbackProgress: constructionProgress.razorbackProgress,
  };
}

// TODO 钢铁之路奖励
async function getSteelRewad(data) {
  const steelRewad = data.data.steelPath;
  const evergreens = [];
  steelRewad.evergreens.forEach((item) => {
    evergreens.push({
      name: item.name,
      cost: item.cost,
    });
  });
  return {
    activation: steelRewad.activation,
    expiry: steelRewad.expiry,
    currentReward: {
      name: steelRewad.currentReward.name,
      cost: steelRewad.currentReward.cost,
    },
    // 每周奖励循环池
    rotation: steelRewad.rotation,
    evergreens: evergreens,
  };
}

// TODO 执行官周常
async function getArchSortie(data) {
  const archSortie = data.data.archonHunt;
  const archBoss = {
    SORTIE_BOSS_BOREAL: {
      name: "诡文枭主",
      faction: "合一众",
      reward: "蔚蓝执刑官源力石",
    },
    SORTIE_BOSS_AMAR: {
      name: "欺谋狼主",
      faction: "合一众",
      reward: "深红执刑官源力石",
    },
    SORTIE_BOSS_NIRA: {
      name: "混沌蛇主",
      faction: "合一众",
      reward: "琥珀执刑官源力石",
    },
  };

  const missions = [];
  archSortie.missions.forEach((item, index) => {
    missions.push({
      index: index + 1,
      node: item.node,
      type: item.type,
    });
  });
  return {
    activation: archSortie.activation,
    expiry: archSortie.expiry,
    boss: archBoss[archSortie.boss]?.name || archSortie.boss,
    faction: archBoss[archSortie.boss]?.faction || archSortie.faction,
    reward: archBoss[archSortie.boss]?.reward || archSortie.reward,
    missions: missions,
  };
}

// TODO 获取
module.exports = {
  getEvents,
  getAlerts,
  getSortie,
  getPlainJobs,
  getFissures,
  getInvasions,
  getVoidTrader,
  getDeltav,
  getCycle,
  getConstructionProgress,
  getSteelRewad,
  getArchSortie,
};
