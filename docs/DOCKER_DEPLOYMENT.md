# Docker 镜像发布指南

本项目已配置 GitHub Actions 自动构建和发布 Docker 镜像。

## 🚀 自动发布触发条件

镜像会在以下情况自动构建和发布：

1. **推送到主分支** (`main` 或 `master`)
2. **创建版本标签** (如 `v1.0.0`)
3. **手动触发** (通过 GitHub Actions 界面)
4. **Pull Request** (仅构建，不发布)

## 📦 镜像位置

镜像会发布到 **GitHub Container Registry**：

```bash
ghcr.io/<你的GitHub用户名>/ai-traveller:latest
```

## 🏷️ 镜像标签规则

- `latest` - 最新的主分支构建
- `main` 或 `master` - 主分支构建
- `v1.0.0` - 版本标签 (如果推送 tag)
- `v1.0` - 主版本和次版本
- `v1` - 主版本
- `main-abc123` - 分支名+commit hash

## 📝 使用步骤

### 1. 首次设置

GitHub Actions 会自动使用 `GITHUB_TOKEN`，无需额外配置。

### 2. 发布新版本

**方式一：推送到主分支**
```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

**方式二：创建版本标签**
```bash
git tag v1.0.0
git push origin v1.0.0
```

**方式三：手动触发**
1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Build and Push Docker Image"
4. 点击 "Run workflow"

### 3. 拉取镜像

```bash
# 拉取最新版本
docker pull ghcr.io/<你的GitHub用户名>/ai-traveller:latest

# 拉取特定版本
docker pull ghcr.io/<你的GitHub用户名>/ai-traveller:v1.0.0
```

### 4. 运行容器

```bash
# 基本运行
docker run -p 8080:8080 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_KEY=your_key \
  -e OPENAI_API_KEY=your_key \
  ghcr.io/<你的GitHub用户名>/ai-traveller:latest

# 使用 .env 文件
docker run -p 8080:8080 \
  --env-file ./backend/.env.docker \
  ghcr.io/<你的GitHub用户名>/ai-traveller:latest
```

## 🐳 Docker Hub 发布（可选）

如果想同时发布到 Docker Hub：

### 1. 创建 Docker Hub Token
1. 登录 [Docker Hub](https://hub.docker.com)
2. 进入 Account Settings → Security
3. 创建新的 Access Token

### 2. 添加 GitHub Secrets
1. 进入 GitHub 仓库的 Settings → Secrets and variables → Actions
2. 添加以下 secrets：
   - `DOCKERHUB_USERNAME` - 你的 Docker Hub 用户名
   - `DOCKERHUB_TOKEN` - 刚才创建的 token

### 3. 修改 workflow 文件
打开 `.github/workflows/docker-publish.yml`，取消注释 Docker Hub 相关部分。

## 🔍 查看构建状态

1. 访问 GitHub 仓库的 "Actions" 标签
2. 查看最近的工作流运行
3. 点击查看详细日志

## 📖 环境变量说明

容器运行时需要以下环境变量：

- `SUPABASE_URL` - Supabase 项目 URL
- `SUPABASE_KEY` - Supabase anon key
- `OPENAI_API_KEY` - OpenAI API 密钥
- `AZURE_SPEECH_KEY` - Azure 语音服务密钥（可选）
- `AZURE_SPEECH_REGION` - Azure 语音服务区域（可选）

## 🎯 最佳实践

1. **使用版本标签**：推荐使用语义化版本 (v1.0.0)
2. **环境变量管理**：不要将密钥硬编码到镜像中
3. **多架构支持**：镜像已配置支持 `amd64` 和 `arm64`
4. **镜像缓存**：GitHub Actions 已配置构建缓存，加快构建速度

## 🔐 镜像可见性

默认镜像是私有的。如需公开：

1. 访问 https://github.com/users/<用户名>/packages/container/ai-traveller/settings
2. 在 "Danger Zone" 部分，选择 "Change visibility"
3. 选择 "Public"

## 🛠️ 故障排查

**构建失败**
- 检查 Actions 日志
- 确保 Dockerfile 正确
- 验证所有依赖可访问

**无法拉取镜像**
- 检查镜像名称是否正确
- 如果是私有镜像，需要先登录：
  ```bash
  echo $GITHUB_TOKEN | docker login ghcr.io -u <用户名> --password-stdin
  ```

**镜像运行错误**
- 检查环境变量是否正确配置
- 查看容器日志：`docker logs <container_id>`
