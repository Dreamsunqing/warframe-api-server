// FIXME 工具函数（utils）
module.exports = class CycleUtils {
  // FIXME 计算循环的真实开始时间（地球，双衍王境）
  calcCycleStartTime(loopList, staticTime) {
    // 一次循环总时间，毫秒
    const loopTime = loopList.reduce((total, one) => {
      return total + one.duration;
    }, 0);
    const nowTime = Date.now();
    // 至今已过多少次循环
    const repeatCount = Math.floor((nowTime - staticTime) / loopTime);
    const startTime = staticTime + repeatCount * loopTime;
    return startTime;
  }

  // FIXME 处理循环信息，返回当前状态信息
  plainCycleInfo(loopList, startTime) {
    const rangeState = [];
    loopList.reduce((activation, one) => {
      rangeState.push({
        activation: activation,
        expiry: activation + one.duration,
        ...one,
      });
      return activation + one.duration;
    }, startTime);
    const nowTime = Date.now();
    if (nowTime < startTime) return rangeState[0];
    // 找到当前时间是在哪个状态
    const finded = rangeState.find((one) => {
      return one.activation <= nowTime && nowTime <= one.expiry;
    });
    return finded || rangeState[rangeState.length - 1];
  }
};
