# 环境变量配置向导

本项目新增了自动化的环境变量配置检查和上传功能。如果检测到 `.env` 文件缺失或配置不完整，系统会自动引导您完成配置。

## 功能特性

### 前端检查
- ✅ 应用启动时自动检查所有必需的环境变量
- ✅ 如果配置不完整，显示配置向导页面
- ✅ 支持手动粘贴或上传 .env 文件
- ✅ 自动识别和分类前端/后端配置
- ✅ 实时验证配置格式和完整性

### 后端检查
- ✅ 服务启动前验证必需的环境变量
- ✅ 缺少必需变量时拒绝启动并显示详细错误
- ✅ 缺少可选变量时显示警告但允许启动
- ✅ 提供 API 接口用于上传和保存配置

## 使用方法

### 方式一：通过前端界面配置

1. 启动前端应用：
   ```bash
   cd frontend
   npm run dev
   ```

2. 如果环境变量不完整，会自动显示配置向导页面

3. 选择配置方式：
   - **粘贴内容**：直接复制 .env 文件内容粘贴
   - **上传文件**：选择本地的 .env 文件上传

4. 系统会自动：
   - 解析环境变量
   - 识别前端和后端配置
   - 显示缺失的变量
   - 验证配置格式

5. 点击"保存配置"按钮，系统会：
   - 自动生成 `frontend/.env` 文件
   - 自动生成 `backend/.env` 文件
   - 提示重启应用

6. 重启前端和后端服务即可

### 方式二：手动创建配置文件

如果您更喜欢手动配置，可以在项目根目录分别创建两个 `.env` 文件：

#### frontend/.env
```env
# 前端环境变量配置

# API服务地址
VITE_API_BASE_URL=http://localhost:8080/api

# Supabase项目地址
VITE_SUPABASE_URL=https://xxxxx.supabase.co

# Supabase匿名密钥
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase重定向地址
VITE_SUPABASE_REDIRECT_TO=http://localhost:5173

# 高德地图JS API Key
VITE_AMAP_JS_KEY=your_amap_key_here

# 高德地图安全密钥
VITE_AMAP_JS_SECURITY_CODE=your_amap_security_code

# 语音识别模式 (browser/iflytek/disabled)
VITE_SPEECH_MODE=browser
```

#### backend/.env
```env
# 后端环境变量配置

# Node环境
NODE_ENV=development

# 服务端口
PORT=8080

# 前端地址
FRONTEND_ORIGIN=http://localhost:5173

# Supabase项目地址
SUPABASE_URL=https://xxxxx.supabase.co

# Supabase匿名密钥
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase服务密钥
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LLM API地址
LLM_API_URL=https://api.deepseek.com/v1

# LLM API密钥
LLM_API_KEY=sk-xxxxx

# LLM模型
LLM_MODEL=deepseek-chat

# 讯飞应用ID
IFLYTEK_APP_ID=xxxxx

# 讯飞API Key
IFLYTEK_API_KEY=xxxxx

# 讯飞API Secret
IFLYTEK_API_SECRET=xxxxx

# 高德地图服务端Key
AMAP_WEB_SERVICE_KEY=xxxxx

# 存储桶名称
STORAGE_BUCKET=voice-memos

# 临时目录
TMP_DIR=tmp
```

## 环境变量说明

### 必需的环境变量

这些变量是应用运行的基本要求，缺少任何一个都会导致应用无法启动：

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `SUPABASE_URL` | Supabase 项目地址 | [Supabase Dashboard](https://app.supabase.com) → 项目设置 |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase Dashboard → API 设置 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务密钥 | Supabase Dashboard → API 设置 |

### 可选但推荐的环境变量

这些变量缺失时应用仍可启动，但相关功能将不可用：

| 变量名 | 说明 | 影响功能 | 获取方式 |
|--------|------|----------|----------|
| `LLM_API_URL` | LLM API 地址 | AI 行程规划 | [DeepSeek](https://platform.deepseek.com) 等 |
| `LLM_API_KEY` | LLM API 密钥 | AI 行程规划 | DeepSeek 等 |
| `IFLYTEK_APP_ID` | 讯飞应用 ID | 语音识别 | [讯飞开放平台](https://www.xfyun.cn) |
| `IFLYTEK_API_KEY` | 讯飞 API Key | 语音识别 | 讯飞开放平台 |
| `IFLYTEK_API_SECRET` | 讯飞 API Secret | 语音识别 | 讯飞开放平台 |
| `AMAP_WEB_SERVICE_KEY` | 高德地图服务端 Key | 地图服务 | [高德开放平台](https://lbs.amap.com) |
| `VITE_AMAP_JS_KEY` | 高德地图 JS Key | 地图显示 | 高德开放平台 |
| `VITE_AMAP_JS_SECURITY_CODE` | 高德地图安全密钥 | 地图显示 | 高德开放平台 |

## API 接口

系统提供了以下 API 接口用于环境变量管理：

### GET /api/env/status
检查后端环境变量配置状态

**响应示例：**
```json
{
  "isComplete": false,
  "configured": ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
  "missing": ["SUPABASE_SERVICE_ROLE_KEY", "LLM_API_KEY"],
  "summary": {
    "total": 9,
    "configured": 2,
    "missing": 7
  }
}
```

### POST /api/env/validate
验证环境变量内容格式

**请求体：**
```json
{
  "content": "VITE_API_BASE_URL=http://localhost:8080/api\nSUPABASE_URL=https://..."
}
```

**响应示例：**
```json
{
  "success": true,
  "frontend": {
    "vars": { "VITE_API_BASE_URL": "..." },
    "validation": {
      "isComplete": false,
      "missing": ["VITE_SUPABASE_URL"],
      "present": ["VITE_API_BASE_URL"]
    }
  },
  "backend": {
    "vars": { "SUPABASE_URL": "..." },
    "validation": { ... }
  }
}
```

### POST /api/env/upload
上传并保存环境变量配置

**请求体：**
```json
{
  "frontendEnv": "VITE_API_BASE_URL=...\nVITE_SUPABASE_URL=...",
  "backendEnv": "NODE_ENV=development\nPORT=8080\n..."
}
```

## 故障排除

### 前端一直显示配置页面
1. 检查 `frontend/.env` 文件是否存在
2. 确认所有必需的环境变量都已配置
3. 检查变量格式是否正确（如 URL 必须以 http/https 开头）

### 后端无法启动
1. 查看终端输出的错误信息
2. 确认 `backend/.env` 文件存在
3. 确认必需的环境变量（Supabase 相关）都已配置

### 配置保存失败
1. 检查文件系统权限
2. 确认项目目录结构正确
3. 查看后端日志获取详细错误信息

## 开发说明

### 前端相关文件
- `frontend/src/utils/envValidator.js` - 环境变量验证工具
- `frontend/src/pages/EnvSetupPage.jsx` - 配置向导页面
- `frontend/src/App.jsx` - 应用入口，集成环境检查

### 后端相关文件
- `backend/src/config/envValidator.js` - 后端环境变量验证
- `backend/src/controllers/envController.js` - 环境变量管理控制器
- `backend/src/routes/index.js` - API 路由
- `backend/src/index.js` - 服务入口，启动时检查

## 注意事项

1. **安全性**：`.env` 文件包含敏感信息，请勿提交到版本控制系统
2. **重启**：修改环境变量后必须重启前端和后端服务
3. **格式**：环境变量采用 `KEY=VALUE` 格式，每行一个
4. **引号**：值中如有空格，建议不加引号（系统会自动处理）
5. **注释**：支持 `#` 开头的注释行

## 更新日志

### v1.0.0 (2025-10-30)
- ✅ 新增前端环境变量自动检查
- ✅ 新增配置向导界面
- ✅ 新增后端启动时环境验证
- ✅ 新增环境变量上传 API
- ✅ 支持粘贴和文件上传两种方式
- ✅ 自动识别和分类前端/后端配置
