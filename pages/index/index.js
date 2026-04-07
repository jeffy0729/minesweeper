Page({
  startGame(e) {
    const level = e.currentTarget.dataset.level;
    wx.navigateTo({
      url: `/pages/game/game?level=${level}`
    });
  },

  goRank() {
    wx.navigateTo({
      url: '/pages/rank/rank'
    });
  }
})