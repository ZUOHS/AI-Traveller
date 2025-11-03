# AI-Traveller 🌍✈️# AI Traveller



智能旅行规划助手 - 使用 AI 帮你规划完美的旅行# AI-Traveller 🌍✈️



---智能旅行规划助手 - 使用 AI 帮你规划完美的旅行



## 🚀 快速启动（3 步）## 🚀 Docker 快速启动（推荐）



### 1️⃣ 配置环境变量### 1️⃣ 配置环境变量



```bash```bash

cp .env.example .env# 复制环境变量模板

notepad .env    # Windows 编辑cp .env.example .env

```

# 编辑文件填入你的 API 密钥

**必需配置：**notepad .env      # Windows

```envnano .env         # Linux/macOS

SUPABASE_URL=your_supabase_url```

SUPABASE_ANON_KEY=your_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_service_key**最少需要配置（必需）：**

``````env

SUPABASE_URL=your_supabase_url_here

### 2️⃣ 启动 DockerSUPABASE_ANON_KEY=your_supabase_anon_key_here

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

```bash```

docker-compose up -d

```### 2️⃣ 启动服务



### 3️⃣ 访问应用```bash

docker-compose up -d

**http://localhost:8080**```



完成！🎉### 3️⃣ 访问应用



---打开浏览器：**http://localhost:8080**



## 📋 常用 Docker 命令就这么简单！🎉



```bash---

docker-compose up -d          # 启动

docker-compose logs -f        # 查看日志## 📋 Docker 常用命令

docker-compose down           # 停止

docker-compose up -d --build  # 重新构建```bash

docker-compose ps             # 查看状态# 启动服务

```docker-compose up -d



---# 查看日志

docker-compose logs -f

## 🔑 获取 API 密钥

# 停止服务

### 必需（核心功能）docker-compose down



| 服务 | 网址 |# 重新构建

|------|------|docker-compose up -d --build

| **Supabase** | https://app.supabase.com |

# 查看状态

### 可选（增强功能）docker-compose ps

```

| 服务 | 网址 | 功能 |

|------|------|------|---

| DeepSeek AI | https://platform.deepseek.com | AI 智能行程规划 |

| 高德地图 | https://lbs.amap.com | 地图和路线 |## 🔑 获取 API 密钥

| 讯飞语音 | https://www.xfyun.cn | 语音输入 |

### 必需服务（核心功能）

---

| 服务 | 网址 | 说明 |

## 📝 完整环境变量

## ✨ 核心功能

在项目根目录的 `.env` 文件中配置：- **智能行程规划**：输入旅行目的地、预算、同行人等信息，AI 自动生成包含交通、住宿、景点、美食的多日行程。

- **预算估算与费用管理**：AI 估算预算结构，支持语音或文字记录每天开销并同步汇总。

```env- **账号密码登录体系**：注册时填写唯一用户名、邮箱和密码，系统向邮箱发送验证码/确认邮件；登录支持“用户名或邮箱 + 密码”，并保留教学模式下的临时 Token 演示。

# ===== 必需 =====- **语音识别支持**：内置 Web Speech API 输入，也可上传语音文件由后端代理科大讯飞识别。

SUPABASE_URL=your_url- **地图可视化**：集成高德地图（Amap）展示行程路线与 POI，并在缺少坐标时自动解析。

SUPABASE_ANON_KEY=your_key- **一体化部署**：前端（Vite + React）、后端（Express）与 Docker 打包，单命令启动或部署。

SUPABASE_SERVICE_ROLE_KEY=your_key

## 🧱 技术栈

# ===== 可选（AI 行程规划）=====- **前端**：Vite, React 19, Tailwind CSS, React Router, SWR, Zustand

LLM_API_URL=https://api.deepseek.com/v1- **后端**：Node.js 20, Express, Supabase JS, OpenAI 兼容 SDK, Axios, Multer

LLM_API_KEY=your_key- **共享模块**：`@ai-traveller/common`（费用类别、常量、类型）

LLM_MODEL=deepseek-chat- **第三方服务**：Supabase（认证 & 数据库）、科大讯飞语音识别、大语言模型 API、高德地图开放平台

- **工程工具**：npm workspaces, ESLint, Vitest, Docker, GitHub Actions（预留）

# ===== 可选（地图功能）=====

AMAP_WEB_SERVICE_KEY=your_key## 📁 目录结构

VITE_AMAP_JS_KEY=your_key```

VITE_AMAP_JS_SECURITY_CODE=your_code.

├── backend/               # Express API 服务

# ===== 可选（语音识别）=====├── frontend/              # React Web 前端

IFLYTEK_APP_ID=your_id├── packages/common/       # 前后端共享常量

IFLYTEK_API_KEY=your_key├── docs/                  # 架构及提交文档

IFLYTEK_API_SECRET=your_secret├── scripts/               # 构建辅助脚本

```├── Dockerfile

└── docker-compose.yml

---```



## ✨ 功能特性## 🚀 快速开始



- 🤖 **AI 智能规划** - DeepSeek AI 生成个性化行程### 1. 克隆与安装依赖

- 🗺️ **地图集成** - 高德地图路线规划和导航```bash

- 💰 **费用管理** - 自动跟踪和管理旅行开支git clone <your-repo-url> ai-traveller

- 🎤 **语音输入** - 讯飞语音识别支持cd ai-traveller

- 👥 **用户系统** - Supabase 安全认证npm install

- 📱 **响应式设计** - 支持桌面和移动设备```



---### 2. 配置环境变量

复制示例环境文件，按照需求填写真实密钥（切勿提交到仓库）：

## 🛠️ 技术栈```bash

cp backend/.env.example backend/.env

- **前端**: React + Vite + TailwindCSScp frontend/.env.example frontend/.env

- **后端**: Node.js + Express```

- **数据库**: Supabase (PostgreSQL)

- **AI**: DeepSeek LLM关键变量说明：

- **地图**: 高德地图 API

- **语音**: 讯飞语音 API| 变量 | 说明 |

- **部署**: Docker + Docker Compose| --- | --- |

| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase 项目地址与密钥，后端使用 service role，前端只使用 anon key |

---| `LLM_API_URL` / `LLM_API_KEY` / `LLM_MODEL` | 大语言模型服务地址、密钥与模型名称（支持 OpenAI 兼容接口） |

| `IFLYTEK_APP_ID` / `IFLYTEK_API_KEY` / `IFLYTEK_API_SECRET` | 科大讯飞实时语音转写密钥 |

## 📁 项目结构| `AMAP_WEB_SERVICE_KEY` | 高德开放平台「Web 服务」Key，用于服务端 POI/逆地理接口 |

| `VITE_AMAP_JS_KEY`（前端） | 高德开放平台「Web 端 (JS API)」Key |

```| `VITE_AMAP_JS_SECURITY_CODE`（前端） | 高德 Web JS 安全密钥 securityJsCode，需与 JS Key 一起使用 |

.

├── backend/           # Express API 服务> 📌 如果暂未配置 Supabase，可使用登录页底部的“教学模式”临时 Token 登录进行演示。

│   ├── src/

│   │   ├── controllers/### 3. 初始化 Supabase 表结构

│   │   ├── services/在 Supabase 控制台 → SQL Editor 依次执行以下脚本，创建所需表及 RLS 策略：

│   │   ├── routes/

│   │   └── config/```sql

│   └── public/        # 前端构建文件-- 用户资料表（用户名唯一）

├── frontend/          # React 应用create table if not exists public.profiles (

│   └── src/  id uuid primary key references auth.users (id) on delete cascade,

├── packages/common/   # 共享代码  username text not null unique,

├── docs/             # 文档  email text not null,

├── .env              # 环境变量（你需要创建）  created_at timestamptz default now()

├── .env.example      # 环境变量模板);

├── Dockerfile

└── docker-compose.ymlalter table public.profiles enable row level security;

```create policy "Users manage own profile"

  on public.profiles

---  using (auth.uid() = id)

  with check (auth.uid() = id);

## 🐛 故障排除

-- 行程表

### 端口被占用create table if not exists public.trips (

  id uuid primary key,

```bash  user_id uuid not null references auth.users (id) on delete cascade,

# Windows  destination text not null,

netstat -ano | findstr :8080  start_date date,

taskkill /PID <PID> /F  end_date date,

  budget numeric,

# Linux/macOS  currency text,

lsof -ti:8080 | xargs kill -9  travelers int,

```  preferences jsonb,

  notes text,

### 环境变量没生效  ai_summary jsonb,

  ai_budget jsonb,

```bash  created_at timestamptz default now(),

# 检查文件  updated_at timestamptz default now()

ls .env);



# 重新构建alter table public.trips enable row level security;

docker-compose downcreate policy "Trips belong to user"

docker-compose up -d --build  on public.trips

```  using (auth.uid() = user_id)

  with check (auth.uid() = user_id);

### 查看详细日志

-- 行程详情与预算

```bashcreate table if not exists public.itineraries (

docker-compose logs -f  trip_id uuid primary key references public.trips (id) on delete cascade,

```  data jsonb not null,

  updated_at timestamptz default now()

---);



## 📚 详细文档alter table public.itineraries enable row level security;

create policy "Itinerary belongs to trip owner"

需要更多信息？查看完整文档：  on public.itineraries

  using (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()))

- [Docker 启动详细指南](./DOCKER_START.md) - Docker 部署完整说明  with check (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));

- [架构文档](./docs/ARCHITECTURE.md) - 系统架构和技术细节

- [环境变量说明](./docs/ENVIRONMENT_VARIABLES.md) - 所有配置选项create table if not exists public.budgets (

  trip_id uuid primary key references public.trips (id) on delete cascade,

---  data jsonb not null,

  updated_at timestamptz default now()

## 💻 本地开发（不使用 Docker）);



如果你想在本地开发，可以分别启动前后端：alter table public.budgets enable row level security;

create policy "Budget belongs to trip owner"

```bash  on public.budgets

# 安装依赖  using (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()))

npm install  with check (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));



# 终端 1：启动后端-- 费用记录

cd backendcreate table if not exists public.expenses (

npm run dev  id uuid primary key,

  trip_id uuid not null references public.trips (id) on delete cascade,

# 终端 2：启动前端  user_id uuid not null references auth.users (id) on delete cascade,

cd frontend  title text,

npm run dev  category text,

```  amount numeric,

  currency text,

访问 http://localhost:5173  spent_at timestamptz,

  notes text,

详见 [快速启动指南](./docs/QUICK_START.md)  voice_note_url text,

  transcript text,

---  created_at timestamptz default now(),

  updated_at timestamptz default now()

## 📄 许可证);



MIT Licensealter table public.expenses enable row level security;

create policy "Expenses belong to user"

---  on public.expenses

  using (auth.uid() = user_id)

## 🤝 贡献  with check (auth.uid() = user_id);

```

欢迎提交 Issue 和 Pull Request！

确保在 **Authentication → Configuration** 中打开 “Email confirmations”，并把 `http://localhost:5173`（以及部署地址）填入 Site URL 和 Additional Redirect URLs。

---

### 4. 启动开发环境

**开始你的智能旅行规划之旅！** 🌟```bash

npm run dev

如有问题，请查看 [DOCKER_START.md](./DOCKER_START.md) 获取详细帮助。```

该命令将并行启动：
- `http://localhost:8080`：Express API（含健康检查 `/health`）
- `http://localhost:5173`：React 前端开发服务

### 5. 质量检查与构建
```bash
npm run lint
npm run test:backend
npm --workspace frontend run build   # 验证前端构建
```

## 🧠 模块说明
- **认证与用户管理**：`backend/src/services/authService.js` 负责注册、登录与用户名解析。使用 service role 创建 Supabase 用户并写入 `profiles`，注册后发送邮箱验证码；登录支持用户名或邮箱。前端 `LoginGate` 提供注册 + 登录表单，并在未配置 Supabase 时回退到临时 Token 或内存账号模式。
- **AI 规划 (`backend/src/services/aiService.js`)**：封装 LLM Prompt 和 JSON 解析，在未配置 LLM Key 时提供静态示例。
- **语音识别 (`backend/src/services/speechService.js`)**：实现科大讯飞 REST API 签名流程，缺省时给出提示；前端提供 Web Speech + 音频上传两种方式。
- **地图服务 (`backend/src/services/mapService.js`)**：调用高德 Web 服务获取 POI 与逆地理结果，并在缺少 Key 时返回示例坐标；前端地图组件会自动补全行程项坐标。
- **费用管理 (`backend/src/services/expenseService.js`)**：Supabase 表结构访问 + 内存回退，包含分类校验和金额处理。
- **前端状态 (`frontend/src/store/useSessionStore.js`)**：统一 Supabase Session、教学模式 Token，与 Axios 鉴权拦截器配合使用。

## 🐳 Docker 打包与运行
1. 准备 `backend/.env.docker` 并填入生产环境密钥。
2. 构建镜像：
   ```bash
   docker build -t ai-traveller:latest .
   ```
3. 运行：
   ```bash
   docker run --rm -p 8080:8080 --env-file backend/.env.docker ai-traveller:latest
   ```
   或使用 Compose：
   ```bash
   docker compose up --build
   ```
   容器会同时提供 `/api` 接口与前端静态页面。

## 📄 文档与提交
- `docs/ARCHITECTURE.md`：系统架构、模块、配置说明。
- `docs/submission.pdf`：执行 `REPO_URL=<仓库地址> npm run generate:pdf` 自动生成（基于 README）。

## 🔐 API 密钥与安全建议
- 所有密钥仅配置在 `.env`，禁止提交到仓库。
- 前端需要公开的 Key 使用 `VITE_` 前缀，通过 Vite 注入。
- Supabase service role 只在后端使用，可通过部署平台的环境变量管理。
- 部署前建议为账号密码登录启用强密码策略与邮箱域名白名单。

## ✅ 下一步计划
- 接入 Supabase Realtime，实现多人协作与实时通知。
- 扩展 CI/CD（GitHub Actions）自动化测试、Docker 构建与推送。
- 增强移动端适配与 PWA 缓存能力。

> 💡 如需调试或替换新的 API Key，请在 `.env` 中更新并重启服务；若仅用于教学/演示，可继续使用登录页提供的临时 Token 登录模式。


## OTP Authentication Notes
- This project now uses Supabase email OTP (six-digit verification codes) for signup and login; no passwords are stored.
- New users must provide a unique username when requesting their first OTP; returning users only need to enter their email.
- After submitting the code, the backend verifies it via Supabase and issues a session token; in mock mode the code is stored in-memory.

