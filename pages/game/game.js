const LEVELS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

Page({
  data: {
    level: 'easy',
    rows: 9,
    cols: 9,
    mines: 10,
    cellSize: 56,
    grid: [],
    mineCount: 10,
    flagCount: 0,
    time: 0,
    timer: null,
    gameOver: false,
    win: false,
    firstClick: true
  },

  onLoad(options) {
    const level = options.level || 'easy';
    const config = LEVELS[level];
    
    this.setData({
      level,
      rows: config.rows,
      cols: config.cols,
      mines: config.mines,
      mineCount: config.mines,
      cellSize: level === 'hard' ? 40 : 56
    });
    
    this.initGrid();
  },

  initGrid() {
    const { rows, cols } = this.data;
    const grid = [];
    
    for (let i = 0; i < rows * cols; i++) {
      grid.push({
        mine: false,
        opened: false,
        flagged: false,
        count: 0
      });
    }
    
    this.setData({ grid, time: 0, flagCount: 0, gameOver: false, win: false, firstClick: true });
    
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  startTimer() {
    const timer = setInterval(() => {
      if (!this.data.gameOver) {
        this.setData({ time: this.data.time + 1 });
      }
    }, 1000);
    this.setData({ timer });
  },

  placeMines(excludeIndex) {
    const { rows, cols, mines, grid } = this.data;
    let placed = 0;
    
    while (placed < mines) {
      const index = Math.floor(Math.random() * rows * cols);
      if (!grid[index].mine && index !== excludeIndex) {
        grid[index].mine = true;
        placed++;
      }
    }
    
    // 计算每个格子周围的雷数
    for (let i = 0; i < grid.length; i++) {
      if (!grid[i].mine) {
        const neighbors = this.getNeighbors(i);
        grid[i].count = neighbors.filter(j => grid[j].mine).length;
      }
    }
    
    this.setData({ grid });
  },

  getNeighbors(index) {
    const { rows, cols } = this.data;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const neighbors = [];
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          neighbors.push(nr * cols + nc);
        }
      }
    }
    
    return neighbors;
  },

  onCellTap(e) {
    if (this.data.gameOver) return;
    
    const index = e.currentTarget.dataset.index;
    const { grid } = this.data;
    
    if (grid[index].flagged || grid[index].opened) return;
    
    if (this.data.firstClick) {
      this.placeMines(index);
      this.startTimer();
      this.setData({ firstClick: false });
    }
    
    if (grid[index].mine) {
      this.gameOver(false);
      return;
    }
    
    this.openCell(index);
    this.checkWin();
  },

  openCell(index) {
    const { grid } = this.data;
    const cell = grid[index];
    
    if (cell.opened || cell.flagged) return;
    
    cell.opened = true;
    this.setData({ grid: [...grid] });
    
    // 如果周围没有雷，自动展开
    if (cell.count === 0) {
      const neighbors = this.getNeighbors(index);
      neighbors.forEach(i => this.openCell(i));
    }
  },

  onCellLongPress(e) {
    if (this.data.gameOver) return;
    
    const index = e.currentTarget.dataset.index;
    const { grid } = this.data;
    
    if (grid[index].opened) return;
    
    grid[index].flagged = !grid[index].flagged;
    
    const flagCount = grid.filter(c => c.flagged).length;
    this.setData({ grid: [...grid], flagCount });
  },

  checkWin() {
    const { grid, mines } = this.data;
    const opened = grid.filter(c => c.opened).length;
    const total = grid.length;
    
    if (opened === total - mines) {
      this.gameOver(true);
    }
  },

  gameOver(win) {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    
    this.setData({ gameOver: true, win });
    
    if (win) {
      this.saveRank();
    }
  },

  saveRank() {
    const { level, time } = this.data;
    const ranks = wx.getStorageSync('mine_ranks') || { easy: [], medium: [], hard: [] };
    
    ranks[level].push({ time, date: Date.now() });
    ranks[level].sort((a, b) => a.time - b.time);
    ranks[level] = ranks[level].slice(0, 10); // 只保留前10名
    
    wx.setStorageSync('mine_ranks', ranks);
  },

  resetGame() {
    this.initGrid();
  },

  backToMenu() {
    wx.navigateBack();
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  }
});