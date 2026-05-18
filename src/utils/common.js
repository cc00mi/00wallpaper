export function compareTimestamp(timestamp) {
  const currentTime = Date.now();
  const timeDiff = currentTime - timestamp;

  if (timeDiff < 60 * 1000) {
    return "1分钟";
  }

  if (timeDiff < 60 * 60 * 1000) {
    return `${Math.floor(timeDiff / (60 * 1000))}分钟`;
  }

  if (timeDiff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(timeDiff / (60 * 60 * 1000))}小时`;
  }

  if (timeDiff < 30 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(timeDiff / (24 * 60 * 60 * 1000))}天`;
  }

  if (timeDiff < 90 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(timeDiff / (30 * 24 * 60 * 60 * 1000))}个月`;
  }

  return "很久";
}

export function gotoHome() {
  uni.showModal({
    title: "提示",
    content: "页面有误，将返回首页",
    showCancel: false,
    success: (res) => {
      if (res.confirm) {
        uni.reLaunch({
          url: "/pages/index/index",
        });
      }
    },
  });
}
