// FIXME 数据处理层 （wg）

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

module.exports = {
  getEvents,
  getAlerts,
  getSortie,
  getPlainJobs,
};
