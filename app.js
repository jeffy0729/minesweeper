App({
  onLaunch() {
    // 初始化本地存储
    const ranks = wx.getStorageSync('mine_ranks') || {
      easy: [],
      medium: [],
      hard: []
    };
    wx.setStorageSync('mine_ranks', ranks);
  }
})