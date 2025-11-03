# AI-Traveller 快速启动指南# AI-Traveller 快速启动指南



## 🚀 快速开始（3 步）## 🚀 快速开始（3 步）



### 1. 配置环境变量### 1. 配置环境变量



```bash1. **启动前端服务**

# 复制环境变量模板   ```bash

cp .env.example .env   cd frontend

   npm install  # 如果还没安装依赖

# 编辑 .env 文件，填入你的 API 密钥   npm run dev

# Windows: notepad .env   ```

# Linux/macOS: nano .env

```2. **打开浏览器**

   - 访问 http://localhost:5173

**必需配置（最少需要这些）：**   - 会自动显示环境配置向导页面

- `SUPABASE_URL` - Supabase 项目地址

- `SUPABASE_ANON_KEY` - Supabase 匿名密钥  3. **准备你的配置信息**

- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服务密钥   

   你需要准备以下信息：

### 2. 启动后端   

   **Supabase 配置** (必需)

#### Windows (PowerShell)   - 访问 https://app.supabase.com

```powershell   - 创建或选择项目

cd backend   - 在项目设置 → API 中获取：

.\start.ps1     - Project URL (SUPABASE_URL)

```     - anon public key (SUPABASE_ANON_KEY)

     - service_role key (SUPABASE_SERVICE_ROLE_KEY)

#### Linux/macOS   

```bash   **高德地图配置** (必需)

cd backend   - 访问 https://lbs.amap.com

chmod +x start.sh   - 注册并创建应用

./start.sh   - 获取：

```     - Web 服务 Key (AMAP_WEB_SERVICE_KEY)

     - Web 端(JS API) Key (VITE_AMAP_JS_KEY)

#### 或手动启动     - 安全密钥 (VITE_AMAP_JS_SECURITY_CODE)

```bash   

cd backend   **DeepSeek AI 配置** (可选，用于 AI 行程规划)

npm install   - 访问 https://platform.deepseek.com

npm run dev   - 注册并获取 API Key

```   

   **讯飞语音** (可选，用于语音识别)

### 3. 启动前端（新终端）   - 访问 https://www.xfyun.cn

   - 注册并创建应用

#### Windows (PowerShell)   - 获取 App ID、API Key、API Secret

```powershell

cd frontend4. **填写配置**

.\start.ps1   

```   选择"粘贴内容"，复制以下模板并填入你的真实信息：

   

#### Linux/macOS   ```env

```bash   # 前端配置

cd frontend   VITE_API_BASE_URL=http://localhost:8080/api

chmod +x start.sh   VITE_SUPABASE_URL=你的Supabase项目地址

./start.sh   VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥

```   VITE_SUPABASE_REDIRECT_TO=http://localhost:5173

   VITE_AMAP_JS_KEY=你的高德地图JS_Key

#### 或手动启动   VITE_AMAP_JS_SECURITY_CODE=你的高德地图安全密钥

```bash   VITE_SPEECH_MODE=browser

cd frontend   

npm install   # 后端配置

npm run dev   NODE_ENV=development

```   PORT=8080

   FRONTEND_ORIGIN=http://localhost:5173

**访问应用：** http://localhost:5173   SUPABASE_URL=你的Supabase项目地址

   SUPABASE_ANON_KEY=你的Supabase匿名密钥

---   SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务密钥

   LLM_API_URL=https://api.deepseek.com/v1

## 📝 环境变量说明   LLM_API_KEY=你的DeepSeek_API_Key

   LLM_MODEL=deepseek-chat

在项目根目录创建 `.env` 文件：   IFLYTEK_APP_ID=你的讯飞AppID

   IFLYTEK_API_KEY=你的讯飞APIKey

```env   IFLYTEK_API_SECRET=你的讯飞APISecret

# ===== 必需配置 =====   AMAP_WEB_SERVICE_KEY=你的高德地图Web服务Key

SUPABASE_URL=https://xxxxx.supabase.co   STORAGE_BUCKET=voice-memos

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...   TMP_DIR=tmp

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...   ```



# ===== 可选配置（影响特定功能）=====5. **保存配置**

   - 点击"保存配置"按钮

# AI 行程规划   - 等待成功提示

LLM_API_URL=https://api.deepseek.com/v1

LLM_API_KEY=sk-xxxxx6. **启动后端服务**

LLM_MODEL=deepseek-chat   ```bash

   cd backend

# 地图功能   npm install  # 如果还没安装依赖

AMAP_WEB_SERVICE_KEY=xxxxx   npm start

VITE_AMAP_JS_KEY=xxxxx   ```

VITE_AMAP_JS_SECURITY_CODE=xxxxx

7. **刷新前端页面**

# 语音识别   - 按 Ctrl+R (Windows) 或 Cmd+R (Mac)

IFLYTEK_APP_ID=xxxxx   - 应用应该正常运行了！

IFLYTEK_API_KEY=xxxxx

IFLYTEK_API_SECRET=xxxxx---

```

### 方法二：手动创建配置文件

### 获取 API 密钥

如果你更喜欢手动配置：

| 服务 | 网址 | 用途 |

|------|------|------|1. **复制示例文件**

| Supabase | https://app.supabase.com | 数据库和认证 |   ```bash

| DeepSeek | https://platform.deepseek.com | AI 行程规划 |   # 前端配置

| 高德地图 | https://lbs.amap.com | 地图服务 |   cd frontend

| 讯飞语音 | https://www.xfyun.cn | 语音识别 |   cp .env.example .env

   

---   # 后端配置

   cd ../backend

## 🐳 Docker 部署   cp .env.example .env

   ```

### 方式 1：Docker Compose（推荐）

2. **编辑配置文件**

```bash   - 用文本编辑器打开 `frontend/.env` 和 `backend/.env`

# 1. 配置环境变量   - 填入你的真实配置信息

cp .env.example .env

# 编辑 .env 文件3. **启动服务**

   ```bash

# 2. 启动   # 启动后端

docker-compose up -d   cd backend

   npm start

# 3. 查看日志   

docker-compose logs -f   # 启动前端（新终端窗口）

   cd frontend

# 4. 停止   npm run dev

docker-compose down   ```

```

---

### 方式 2：Docker 命令

## 最小配置（只为了快速测试）

```bash

# 构建如果你只想快速测试，只需要 Supabase 配置：

docker build -t ai-traveller .

```env

# 运行# frontend/.env

docker run -d \VITE_API_BASE_URL=http://localhost:8080/api

  -p 8080:8080 \VITE_SUPABASE_URL=你的Supabase地址

  --env-file .env \VITE_SUPABASE_ANON_KEY=你的Supabase密钥

  ai-travellerVITE_SUPABASE_REDIRECT_TO=http://localhost:5173

VITE_AMAP_JS_KEY=临时填写一个值

# 查看日志VITE_AMAP_JS_SECURITY_CODE=临时填写一个值

docker logs -f ai-travellerVITE_SPEECH_MODE=disabled

```

# backend/.env

---NODE_ENV=development

PORT=8080

## 💻 不同启动方式FRONTEND_ORIGIN=http://localhost:5173

SUPABASE_URL=你的Supabase地址

### 方式 1：使用 .env 文件（推荐）SUPABASE_ANON_KEY=你的Supabase匿名密钥

SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务密钥

```bashSTORAGE_BUCKET=voice-memos

# 1. 创建 .env 文件（见上面的说明）TMP_DIR=tmp

# 2. 启动应用```

cd backend && npm run dev

cd frontend && npm run dev  # 新终端⚠️ 注意：这样配置后，地图和 AI 功能将不可用

```

---

### 方式 2：命令行环境变量

## 常见问题

**Windows PowerShell:**

```powershell### Q: 我保存了配置但前端还是显示配置页面？

# 后端A: 需要重启前端服务或刷新页面（Ctrl+R / Cmd+R）

cd backend

$env:SUPABASE_URL="your_url"; $env:SUPABASE_ANON_KEY="your_key"; $env:SUPABASE_SERVICE_ROLE_KEY="your_key"; npm run dev### Q: 后端提示环境变量缺失？

A: 检查 `backend/.env` 文件是否存在，以及必需的 Supabase 配置是否填写

# 前端（新终端）

cd frontend### Q: 我不想用 AI 功能，必须配置 DeepSeek 吗？

$env:VITE_SUPABASE_URL="your_url"; $env:VITE_SUPABASE_ANON_KEY="your_key"; npm run devA: 不需要，LLM 相关配置是可选的，不配置只是无法使用 AI 行程规划功能

```

### Q: 配置向导页面无法保存？

**Linux/macOS:**A: 检查：

```bash1. 后端服务是否已启动

# 后端2. 文件系统权限是否正确

cd backend3. 查看浏览器控制台和后端日志的错误信息

SUPABASE_URL=your_url SUPABASE_ANON_KEY=your_key SUPABASE_SERVICE_ROLE_KEY=your_key npm run dev

### Q: 如何更新配置？

# 前端（新终端）A: 直接编辑 `frontend/.env` 和 `backend/.env` 文件，然后重启服务

cd frontend

VITE_SUPABASE_URL=your_url VITE_SUPABASE_ANON_KEY=your_key npm run dev---

```

## 下一步

### 方式 3：使用启动脚本

配置完成后，你可以：

我们提供了便捷的启动脚本，会自动读取 .env 文件：

1. 📝 创建账号并登录

```bash2. 🗺️ 规划你的第一次旅行

# Windows3. 🤖 使用 AI 助手生成行程

cd backend4. 🎤 尝试语音输入功能

.\start.ps15. 💰 记录和管理旅行支出



cd frontend  # 新终端查看更多文档：

.\start.ps1- [环境配置详细指南](./ENV_SETUP_GUIDE.md)

- [架构文档](./ARCHITECTURE.md)

# Linux/macOS- [Docker 部署](./DOCKER_DEPLOYMENT.md)

cd backend
./start.sh

cd frontend  # 新终端
./start.sh
```

---

## ✅ 验证配置

启动后检查日志：

### ✅ 成功
```
✅ 环境变量配置完整
Supabase client initialised (anon key)
Supabase service client initialised
API server listening on port 8080
```

### ⚠️ 部分配置缺失
```
⚠️ 环境变量配置不完整
缺少以下必需的环境变量：
  - LLM_API_KEY: LLM API密钥
部分功能可能不可用
```

---

## 🐛 故障排除

### 问题：端口被占用

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8080 | xargs kill -9
```

### 问题：环境变量没有生效

1. 确认 .env 文件在正确的位置
2. 检查变量名拼写（注意大小写）
3. 重启服务

### 问题：找不到 .env 文件

```bash
# 检查当前目录
pwd
ls -la .env

# 确保在正确的目录
# .env 应该在项目根目录
```

---

## 📚 更多文档

- [环境变量详细说明](./ENVIRONMENT_VARIABLES.md)
- [架构文档](./ARCHITECTURE.md)
- [Docker 部署指南](./DOCKER_DEPLOYMENT.md)

---

## 🎯 最简启动（仅核心功能）

只想快速测试？使用最小配置：

```bash
# 1. 创建最小配置
cat > .env << 'EOF'
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
EOF

# 2. 启动
cd backend && npm run dev &
cd frontend && npm run dev
```

这样只有核心功能可用，但足够开始使用！

---

## 🚀 总结

**最快方式：**
1. `cp .env.example .env` （编辑填入密钥）
2. `cd backend && npm run dev` 
3. `cd frontend && npm run dev`（新终端）
4. 访问 http://localhost:5173

**Docker 方式：**
1. `cp .env.example .env` （编辑填入密钥）
2. `docker-compose up -d`
3. 访问 http://localhost:8080

就这么简单！🎉
