// ============================================
// 每日股票分析仪表盘 - 静态版
// 从 GitHub 仓库获取报告数据
// ============================================

const CONFIG = {
  owner: 'saxleo',
  repo: 'daily-stock-analysis',
  reportPath: 'reports/latest_report.json',
  // GitHub raw 文件地址
  rawUrl: 'https://raw.githubusercontent.com/saxleo/daily-stock-analysis/main/reports/latest_report.json',
  // 备选：从 GitHub API 获取
  apiUrl: 'https://api.github.com/repos/saxleo/daily-stock-analysis/contents/reports/latest_report.json?ref=main'
};

// 模拟数据（首次使用或报告未生成时显示）
const MOCK_DATA = {
  date: new Date().toISOString().split('T')[0],
  market: {
    indices: [
      { name: '上证指数', value: '3,934.09', change: '-0.82%', up: false },
      { name: '深证成指', value: '14,259.44', change: '-0.40%', up: false },
      { name: '创业板指', value: '3,549.16', change: '+0.34%', up: true },
      { name: '科创50', value: '—', change: '-1.63%', up: false }
    ],
    turnover: '2.32万亿',
    advanceDecline: '1576:3549'
  },
  stocks: [
    { code: '000021', name: '深科技', score: 78, signal: 'buy', price: '40.14', change: '-0.15%', tags: ['存储芯片', 'HBM'] },
    { code: '002409', name: '雅克科技', score: 55, signal: 'hold', price: '150.97', change: '-2.75%', tags: ['半导体材料'] },
    { code: '600584', name: '长电科技', score: 62, signal: 'hold', price: '78.18', change: '-0.43%', tags: ['封测龙头'] },
    { code: '600667', name: '太极实业', score: 82, signal: 'buy', price: '20.10', change: '+4.31%', tags: ['机器人', '放量突破'] },
    { code: '002436', name: '兴森科技', score: 48, signal: 'hold', price: '33.30', change: '-0.42%', tags: ['PCB'] },
    { code: '600176', name: '中国巨石', score: 45, signal: 'hold', price: '42.29', change: '-2.29%', tags: ['玻纤'] },
    { code: '600487', name: '亨通光电', score: 38, signal: 'sell', price: '57.28', change: '-3.92%', tags: ['光纤光缆'] },
    { code: '600183', name: '生益科技', score: 52, signal: 'hold', price: '135.80', change: '-2.00%', tags: ['覆铜板'] },
    { code: '002837', name: '英维克', score: 58, signal: 'hold', price: '55.03', change: '-0.38%', tags: ['温控设备'] },
    { code: '002463', name: '沪电股份', score: 65, signal: 'hold', price: '120.77', change: '-1.57%', tags: ['PCB'] },
    { code: '002602', name: '世纪华通', score: 70, signal: 'buy', price: '14.55', change: '+1.68%', tags: ['游戏', 'AI'] },
    { code: '002155', name: '湖南黄金', score: 60, signal: 'hold', price: '27.25', change: '+0.63%', tags: ['黄金'] },
    { code: '002230', name: '科大讯飞', score: 55, signal: 'hold', price: '43.29', change: '-0.46%', tags: ['AI大模型'] },
    { code: '159599', name: '芯片ETF', score: 50, signal: 'hold', price: '2.911', change: '-0.89%', tags: ['ETF', '半导体'] },
    { code: '588710', name: '科创半导体ETF', score: 42, signal: 'sell', price: '3.168', change: '-2.46%', tags: ['ETF', '科创'] }
  ],
  alerts: {
    risks: [
      { stock: '亨通光电', text: '主力资金连续3日净流出，光纤板块退潮' },
      { stock: '生益科技', text: 'PCB板块整体调整，上方套牢盘较重' },
      { stock: '科创半导体ETF', text: '科创50重挫-1.63%，半导体链承压' }
    ],
    catalysts: [
      { stock: '太极实业', text: '机器人概念午后暴动，宇树科技IPO催化' },
      { stock: '世纪华通', text: 'AI应用端活跃，游戏板块获资金关注' },
      { stock: '深科技', text: 'HBM需求旺盛，存储芯片涨价周期延续' }
    ]
  }
};

// ============================================
// 主逻辑
// ============================================

let currentData = null;

async function init() {
  // 显示当前日期
  document.getElementById('current-date').textContent = formatDate(new Date());
  document.getElementById('market-status').textContent = '交易中';
  
  // 尝试获取真实数据
  const data = await fetchReport();
  currentData = data || MOCK_DATA;
  
  // 标记是否为模拟数据
  if (!data) {
    document.getElementById('market-status').textContent = '模拟数据';
    document.getElementById('market-status').style.background = 'var(--hold-bg)';
    document.getElementById('market-status').style.color = 'var(--hold)';
  }
  
  // 渲染
  renderMarketOverview(currentData.market);
  renderStockGrid(currentData.stocks);
  renderAlerts(currentData.alerts);
  
  // 更新时间
  document.getElementById('update-time').textContent = formatDateTime(new Date());
  
  // 绑定过滤按钮
  bindFilters();
}

async function fetchReport() {
  try {
    // 方法1：直接从 raw.githubusercontent.com 获取（无限制）
    const response = await fetch(CONFIG.rawUrl + '?t=' + Date.now(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 成功获取报告数据');
      return data;
    }
  } catch (e) {
    console.log('❌ 无法获取报告:', e.message);
  }
  
  return null;
}

// ============================================
// 渲染函数
// ============================================

function renderMarketOverview(market) {
  const container = document.getElementById('index-cards');
  
  if (!market || !market.indices) {
    container.innerHTML = '<div class="loading">暂无大盘数据</div>';
    return;
  }
  
  container.innerHTML = market.indices.map(idx => `
    <div class="index-card">
      <div class="name">${idx.name}</div>
      <div class="value">${idx.value}</div>
      <div class="change ${idx.up ? 'up' : 'down'}">${idx.change}</div>
    </div>
  `).join('');
}

function renderStockGrid(stocks) {
  const container = document.getElementById('stock-grid');
  
  if (!stocks || stocks.length === 0) {
    container.innerHTML = '<div class="loading">暂无股票数据</div>';
    return;
  }
  
  container.innerHTML = stocks.map(stock => `
    <div class="stock-card ${stock.signal}" data-signal="${stock.signal}">
      <div class="stock-header">
        <div class="stock-info">
          <h3>${stock.name}</h3>
          <div class="code">${stock.code}</div>
        </div>
        <div class="stock-score">
          <div class="score">${stock.score}</div>
          <div class="label ${stock.signal}">${signalText(stock.signal)}</div>
        </div>
      </div>
      <div class="stock-details">
        <div class="detail-row">
          <span>现价</span>
          <span class="value">${stock.price}</span>
        </div>
        <div class="detail-row">
          <span>涨跌</span>
          <span class="value" style="color: ${stock.change.startsWith('+') ? 'var(--up)' : 'var(--down)'}">${stock.change}</span>
        </div>
      </div>
      <div class="stock-tags">
        ${stock.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function renderAlerts(alerts) {
  const container = document.getElementById('alerts-grid');
  
  if (!alerts) {
    container.innerHTML = '<div class="loading">暂无警报数据</div>';
    return;
  }
  
  container.innerHTML = `
    <div class="alert-card risks">
      <h3>🚨 风险警报</h3>
      <ul class="alert-list">
        ${alerts.risks.map(r => `
          <li><span class="stock-name">${r.stock}</span>：${r.text}</li>
        `).join('')}
      </ul>
    </div>
    <div class="alert-card catalysts">
      <h3>✨ 利好催化</h3>
      <ul class="alert-list">
        ${alerts.catalysts.map(c => `
          <li><span class="stock-name">${c.stock}</span>：${c.text}</li>
        `).join('')}
      </ul>
    </div>
  `;
}

// ============================================
// 交互
// ============================================

function bindFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 切换激活状态
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 过滤股票
      const filter = btn.dataset.filter;
      filterStocks(filter);
    });
  });
}

function filterStocks(filter) {
  const cards = document.querySelectorAll('.stock-card');
  cards.forEach(card => {
    if (filter === 'all' || card.dataset.signal === filter) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// ============================================
// 工具函数
// ============================================

function signalText(signal) {
  const map = { buy: '买入', hold: '观望', sell: '卖出' };
  return map[signal] || signal;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${y}年${m}月${d}日 ${weekdays[date.getDay()]}`;
}

function formatDateTime(date) {
  return date.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

// ============================================
// 启动
// ============================================

document.addEventListener('DOMContentLoaded', init);
