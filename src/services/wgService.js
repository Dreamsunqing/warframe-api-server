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
      requireRuns: item.requireRuns,
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

// 达尔特惠
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

module.exports = {
  getEvents,
  getAlerts,
  getSortie,
  getPlainJobs,
  getFissures,
  getInvasions,
  getVoidTrader,
  getDeltav,
};
