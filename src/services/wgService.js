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

module.exports = {
  getEvents,
  getAlerts,
};
