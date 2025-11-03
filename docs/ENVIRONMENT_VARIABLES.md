# 环境变量配置指南

本项目通过环境变量进行配置。你可以通过以下三种方式提供配置：

## 方式 1：使用 .env 文件（推荐用于开发）

### 1. 创建配置文件

```bash
# 在项目根目录创建 .env 文件
cd AI-Traveller

# 前端配置
cat > frontend/.env << 'EOF'
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_REDIRECT_TO=http://localhost:5173
VITE_AMAP_JS_KEY=your_amap_js_key
VITE_AMAP_JS_SECURITY_CODE=your_amap_security_code
VITE_SPEECH_MODE=browser
EOF

# 后端配置
cat > backend/.env << 'EOF'
NODE_ENV=development
PORT=8080
FRONTEND_ORIGIN=http://localhost:5173

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

LLM_API_URL=https://api.deepseek.com/v1
LLM_API_KEY=your_deepseek_api_key
LLM_MODEL=deepseek-chat

IFLYTEK_APP_ID=your_iflytek_app_id
IFLYTEK_API_KEY=your_iflytek_api_key
IFLYTEK_API_SECRET=your_iflytek_api_secret

AMAP_WEB_SERVICE_KEY=your_amap_web_service_key

STORAGE_BUCKET=voice-memos
TMP_DIR=tmp
EOF
```

### 2. 启动应用

```bash
# 启动后端
cd backend
npm install
npm run dev

# 启动前端（新终端）
cd frontend
npm install
npm run dev
```

## 方式 2：命令行环境变量（推荐用于测试）

### Windows (PowerShell)

```powershell
# 启动后端
cd backend
$env:SUPABASE_URL="your_url"; $env:SUPABASE_ANON_KEY="your_key"; $env:SUPABASE_SERVICE_ROLE_KEY="your_service_key"; $env:LLM_API_KEY="your_llm_key"; $env:AMAP_WEB_SERVICE_KEY="your_amap_key"; npm run dev

# 启动前端（新终端）
cd frontend
$env:VITE_SUPABASE_URL="your_url"; $env:VITE_SUPABASE_ANON_KEY="your_key"; $env:VITE_AMAP_JS_KEY="your_amap_key"; $env:VITE_AMAP_JS_SECURITY_CODE="your_code"; npm run dev
```

### Linux / macOS (Bash)

```bash
# 启动后端
cd backend
SUPABASE_URL=your_url \
SUPABASE_ANON_KEY=your_key \
SUPABASE_SERVICE_ROLE_KEY=your_service_key \
LLM_API_KEY=your_llm_key \
AMAP_WEB_SERVICE_KEY=your_amap_key \
npm run dev

# 启动前端（新终端）
cd frontend
VITE_SUPABASE_URL=your_url \
VITE_SUPABASE_ANON_KEY=your_key \
VITE_AMAP_JS_KEY=your_amap_key \
VITE_AMAP_JS_SECURITY_CODE=your_code \
npm run dev
```

## 方式 3：Docker 环境变量（推荐用于生产）

### 1. 使用 docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: ../Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - FRONTEND_ORIGIN=http://localhost:5173
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - LLM_API_URL=${LLM_API_URL}
      - LLM_API_KEY=${LLM_API_KEY}
      - LLM_MODEL=${LLM_MODEL:-deepseek-chat}
      - IFLYTEK_APP_ID=${IFLYTEK_APP_ID}
      - IFLYTEK_API_KEY=${IFLYTEK_API_KEY}
      - IFLYTEK_API_SECRET=${IFLYTEK_API_SECRET}
      - AMAP_WEB_SERVICE_KEY=${AMAP_WEB_SERVICE_KEY}
      - STORAGE_BUCKET=voice-memos
      - TMP_DIR=tmp

  frontend:
    build:
      context: ./frontend
    ports:
      - "5173:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:8080/api
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - VITE_SUPABASE_REDIRECT_TO=http://localhost:5173
      - VITE_AMAP_JS_KEY=${VITE_AMAP_JS_KEY}
      - VITE_AMAP_JS_SECURITY_CODE=${VITE_AMAP_JS_SECURITY_CODE}
      - VITE_SPEECH_MODE=browser
```

### 2. 创建 .env 文件用于 Docker

```bash
# 在项目根目录创建 .env
cat > .env << 'EOF'
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# LLM API
LLM_API_URL=https://api.deepseek.com/v1
LLM_API_KEY=your_deepseek_api_key
LLM_MODEL=deepseek-chat

# 讯飞语音
IFLYTEK_APP_ID=your_iflytek_app_id
IFLYTEK_API_KEY=your_iflytek_api_key
IFLYTEK_API_SECRET=your_iflytek_api_secret

# 高德地图
AMAP_WEB_SERVICE_KEY=your_amap_web_service_key
VITE_AMAP_JS_KEY=your_amap_js_key
VITE_AMAP_JS_SECURITY_CODE=your_amap_security_code
EOF
```

### 3. 启动 Docker

```bash
# 使用 docker-compose
docker-compose up -d

# 或使用 docker run
docker run -d \
  -p 8080:8080 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
  -e LLM_API_KEY=your_llm_key \
  -e AMAP_WEB_SERVICE_KEY=your_amap_key \
  ai-traveller-backend
```

## 环境变量说明

### 前端环境变量（必需）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:8080/api` |
| `VITE_SUPABASE_URL` | Supabase 项目地址 | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_SUPABASE_REDIRECT_TO` | OAuth 重定向地址 | `http://localhost:5173` |
| `VITE_AMAP_JS_KEY` | 高德地图 JS API Key | `your_amap_js_key` |
| `VITE_AMAP_JS_SECURITY_CODE` | 高德地图安全密钥 | `your_security_code` |
| `VITE_SPEECH_MODE` | 语音识别模式 | `browser` 或 `iflytek` |

### 后端环境变量

#### 必需配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SUPABASE_URL` | Supabase 项目地址 | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务密钥 | `eyJhbGciOiJIUzI1NiIs...` |

#### 可选配置（影响特定功能）

| 变量名 | 说明 | 默认值 | 影响功能 |
|--------|------|--------|----------|
| `NODE_ENV` | 运行环境 | `development` | 日志级别 |
| `PORT` | 服务端口 | `8080` | - |
| `FRONTEND_ORIGIN` | 前端地址 | - | CORS |
| `LLM_API_URL` | LLM API 地址 | - | AI 行程规划 |
| `LLM_API_KEY` | LLM API 密钥 | - | AI 行程规划 |
| `LLM_MODEL` | LLM 模型名称 | `gpt-4o-mini` | AI 行程规划 |
| `IFLYTEK_APP_ID` | 讯飞应用 ID | - | 语音识别 |
| `IFLYTEK_API_KEY` | 讯飞 API Key | - | 语音识别 |
| `IFLYTEK_API_SECRET` | 讯飞 API Secret | - | 语音识别 |
| `AMAP_WEB_SERVICE_KEY` | 高德地图服务端 Key | - | 地图服务 |
| `STORAGE_BUCKET` | Supabase 存储桶 | `voice-memos` | 文件存储 |
| `TMP_DIR` | 临时文件目录 | `tmp` | 文件缓存 |

## 获取 API 密钥

### Supabase
1. 访问 https://app.supabase.com
2. 创建项目或选择现有项目
3. 进入 Project Settings → API
4. 复制 URL 和 API Keys

### DeepSeek (LLM)
1. 访问 https://platform.deepseek.com
2. 注册并登录
3. 进入 API Keys 页面
4. 创建新的 API Key

### 讯飞语音
1. 访问 https://www.xfyun.cn
2. 注册并登录
3. 创建语音识别应用
4. 获取 App ID、API Key、API Secret

### 高德地图
1. 访问 https://lbs.amap.com
2. 注册并登录
3. 创建应用
4. 添加 Web 服务 Key 和 Web 端(JS API) Key

## 验证配置

启动应用后，检查日志输出：

### 成功示例
```
✅ 环境变量配置完整
Supabase client initialised (anon key)
Supabase service client initialised
API server listening on port 8080
```

### 警告示例
```
⚠️ 环境变量配置不完整
缺少以下必需的环境变量：
  - LLM_API_KEY: LLM API密钥
  - AMAP_WEB_SERVICE_KEY: 高德地图服务端Key
```

## 故障排除

### 问题：应用启动但功能不可用

**原因**：缺少可选的环境变量

**解决**：查看启动日志，补充缺失的环境变量

### 问题：环境变量没有生效

**原因**：
1. .env 文件位置错误
2. 命令行变量拼写错误
3. Docker 容器没有重启

**解决**：
1. 确认 .env 文件在正确的目录
2. 检查变量名称拼写
3. 重启容器：`docker-compose restart`

### 问题：生产环境密钥泄露

**解决**：
1. 不要将 .env 文件提交到 Git
2. 使用环境变量管理工具（如 AWS Secrets Manager）
3. 使用 Docker secrets
4. 定期轮换密钥

## 最佳实践

1. **开发环境**：使用 .env 文件
2. **测试环境**：使用命令行环境变量
3. **生产环境**：使用 Docker 环境变量或密钥管理服务
4. **团队协作**：提供 .env.example 文件作为模板
5. **安全性**：将 .env 添加到 .gitignore

## 快速启动示例

### 最小配置（仅核心功能）

```bash
# 后端
cd backend
cat > .env << 'EOF'
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
EOF
npm run dev

# 前端
cd frontend
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_REDIRECT_TO=http://localhost:5173
VITE_AMAP_JS_KEY=temp_key
VITE_AMAP_JS_SECURITY_CODE=temp_code
VITE_SPEECH_MODE=disabled
EOF
npm run dev
```

访问 http://localhost:5173 即可使用基础功能。
