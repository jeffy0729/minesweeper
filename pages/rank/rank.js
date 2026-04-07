Page({
  data: {
    currentTab: 'easy',
    ranks: []
  },

  onLoad() {
    this.loadRanks();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadRanks();
  },

  loadRanks() {
    const ranks = wx.getStorageSync('mine_ranks') || {};
    const currentRanks = ranks[this.data.currentTab] || [];
    
    // 转换日期
    const formatted = currentRanks.map(item => ({
      ...item,
      dateStr: this.formatDate(item.date)
    }));
    
    this.setData({ ranks: formatted });
  },

  formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  goBack() {
    wx.navigateBack();
  }
});