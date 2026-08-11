# 🚀 daily_stock_analysis 部署指南

## ✅ 部署状态

- [x] 代码已推送至 `https://github.com/saxleo/daily-stock-analysis`
- [ ] GitHub Actions 需手动配置（Token 权限限制）
- [ ] Secrets 需手动配置
- [ ] 首次运行测试

---

## 📋 第一步：配置 GitHub Secrets

访问：`https://github.com/saxleo/daily-stock-analysis/settings/secrets/actions`

### 必填项

| Secret 名称 | 值 | 说明 |
|:---|:---|:---|
| `STOCK_LIST` | `000021,002409,600584,600667,002436,600176,600487,600183,002837,002463,002602,002155,002230,159599,588710` | 你的持仓股 |

### AI 模型配置（至少配置一个）

| Secret 名称 | 值 | 说明 |
|:---|:---|:---|
| `OPENAI_API_KEY` | 你的 API Key | 推荐：DeepSeek/通义千问等兼容 OpenAI 格式的 API |
| `OPENAI_BASE_URL` | `https://api.deepseek.com` 或 `https://dashscope.aliyuncs.com/compatible-mode/v1` | API 基础地址 |
| `OPENAI_MODEL` | `deepseek-chat` 或 `qwen-max` | 模型名称 |
| `DEEPSEEK_API_KEY` | 你的 DeepSeek Key | 备选 |
| `GEMINI_API_KEY` | 你的 Gemini Key | 备选 |

> 💡 **推荐配置 DeepSeek**：成本低、中文好、适合 A 股分析

### 通知渠道（至少配置一个）

| Secret 名称 | 值 | 说明 |
|:---|:---|:---|
| `FEISHU_WEBHOOK_URL` | `https://open.feishu.cn/open-apis/bot/v2/hook/b6f02ca2-bc19-4b4c-b1d2-122e2242cfaa` | 你的飞书机器人（已从配置读取）|
| `WECHAT_WEBHOOK_URL` | 你的企微 Webhook | 企业微信机器人 |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | 你的 Telegram 配置 | Telegram 推送 |

### 新闻源（推荐配置，提升分析质量）

| Secret 名称 | 值 | 说明 |
|:---|:---|:---|
| `TAVILY_API_KEYS` | 你的 Tavily Key | 新闻搜索（免费额度充足）|
| `SERPAPI_API_KEYS` | 你的 SerpAPI Key | 搜索引擎结果 |

> 💡 Tavily 注册：https://tavily.com（免费 1000 次/月）

---

## 📁 第二步：手动添加 GitHub Actions

由于 Token 权限限制，需要手动在 GitHub 上创建工作流文件。

### 操作步骤

1. 访问：`https://github.com/saxleo/daily-stock-analysis/actions/new`
2. 点击 "set up a workflow yourself"
3. 文件名输入：`daily-analysis.yml`
4. 粘贴以下内容：

```yaml
name: 每日股票分析

on:
  schedule:
    - cron: '0 10 * * 1-5'     # 周一到周五 UTC 10:00 = 北京时间 18:00
  workflow_dispatch:
    inputs:
      mode:
        description: '运行模式'
        required: true
        default: 'full'
        type: choice
        options:
          - full
          - market-only
          - stocks-only
      force_run:
        description: '强制运行（跳过交易日检查）'
        required: false
        default: false
        type: boolean

concurrency:
  group: stock-analysis
  cancel-in-progress: false

jobs:
  analyze:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - name: 检出代码
        uses: actions/checkout@v5
      
      - name: 设置 Python 环境
        uses: actions/setup-python@v6
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: 安装依赖
        run: |
          pip install --upgrade pip
          pip install -r requirements.txt
      
      - name: 创建必要目录
        run: mkdir -p data logs reports
      
      - name: 执行股票分析
        env:
          STOCK_LIST: ${{ secrets.STOCK_LIST }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_BASE_URL: ${{ secrets.OPENAI_BASE_URL }}
          OPENAI_MODEL: ${{ secrets.OPENAI_MODEL }}
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          FEISHU_WEBHOOK_URL: ${{ secrets.FEISHU_WEBHOOK_URL }}
          WECHAT_WEBHOOK_URL: ${{ secrets.WECHAT_WEBHOOK_URL }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
          TAVILY_API_KEYS: ${{ secrets.TAVILY_API_KEYS }}
          SERPAPI_API_KEYS: ${{ secrets.SERPAPI_API_KEYS }}
          MARKET_REVIEW_ENABLED: 'true'
          AGENT_MODE: 'true'
        run: |
          python main.py --mode ${{ github.event.inputs.mode || 'full' }} \
            ${{ github.event.inputs.force_run == 'true' && '--force' || '' }}
      
      - name: 上传报告
        uses: actions/upload-artifact@v4
        with:
          name: reports-${{ github.run_id }}
          path: reports/
```

5. 点击 "Commit changes..." 提交

---

## 🧪 第三步：首次运行测试

1. 访问：`https://github.com/saxleo/daily-stock-analysis/actions`
2. 点击左侧 "每日股票分析"
3. 点击 "Run workflow" → 选择 "full" → 点击 "Run workflow"
4. 等待约 5-10 分钟
5. 查看运行日志和推送结果

---

## 📊 你的自选股配置

已根据 stock-t-watcher 持仓配置：

```
000021 深科技
002409 雅克科技
600584 长电科技
600667 太极实业
002436 兴森科技
600176 中国巨石
600487 亨通光电
600183 生益科技
002837 英维克
002463 沪电股份
002602 世纪华通
002155 湖南黄金
002230 科大讯飞
159599 芯片ETF东财
588710 科创半导体设备ETF华泰柏瑞
```

如需修改，更新 Secrets 中的 `STOCK_LIST` 即可。

---

## 🔧 可选配置

### 数据源增强
- **Tushare**：获取更稳定的历史行情（https://tushare.pro）
- **TickFlow**：实时行情（付费，但更稳定）

### LLM 模型选择
| 模型 | 成本 | 速度 | 中文 | 推荐度 |
|:---|:---:|:---:|:---:|:---:|
| DeepSeek | ⭐ 低 | 快 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Gemini | ⭐ 低 | 快 | ⭐⭐ | ⭐⭐⭐⭐ |
| 通义千问 | ⭐ 低 | 快 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| GPT-4 | 高 | 中 | ⭐⭐ | ⭐⭐⭐ |

### 本地运行（调试/测试）

```bash
# 克隆到本地
git clone https://github.com/saxleo/daily-stock-analysis.git
cd daily-stock-analysis

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的配置

# 运行分析
python main.py --stocks 000021,002409,600584 --debug

# 启动 WebUI
python main.py --webui
```

---

## 📱 推送效果预览

每日 18:00 自动推送的决策仪表盘包含：
- 📊 每只股票的 AI 评分（买入/观望/卖出）
- 📰 重要新闻和舆情
- 🚨 风险警报
- ✨ 利好催化
- 📈 技术面分析
- 🎯 操作建议

---

## ⚠️ 注意事项

1. **免费额度**：DeepSeek/Gemini/Tavily 都有免费额度，注意用量
2. **运行时间**：完整分析约 5-15 分钟（取决于股票数量和 LLM 响应速度）
3. **交易日**：默认只在工作日运行，非交易日自动跳过
4. **权限问题**：GitHub Actions 需要配置 Secrets 才能正常运行

---

## 🔗 相关链接

- **项目仓库**：https://github.com/saxleo/daily-stock-analysis
- **原项目**：https://github.com/ZhuLinsen/daily_stock_analysis
- **飞书机器人**：已配置（从你的 stock-t-watcher 配置读取）

---

> 📅 **下次自动运行**：明天 18:00（北京时间）
> 
> 如需立即测试，请按第三步手动触发运行。
