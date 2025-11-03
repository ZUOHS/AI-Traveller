# Docker 快速启动指南 🐳

## 最简单的启动方式

### 第 1 步：配置环境变量

```bash
# 复制模板
cp .env.example .env

# 编辑文件（填入你的 API 密钥）
notepad .env   # Windows
nano .env      # Linux/macOS
```

**必需配置：**
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 第 2 步：启动服务

```bash
docker-compose up -d
```

### 第 3 步：访问应用

打开浏览器：**http://localhost:8080**

完成！✅

---

## 📋 常用命令

```bash
# 启动（后台运行）
docker-compose up -d

# 启动（查看日志）
docker-compose up

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 查看运行状态
docker-compose ps

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build
```

---

## 🔍 验证服务

### 检查容器状态
```bash
docker-compose ps
```

应该看到：
```
NAME                COMMAND             SERVICE   STATUS
ai-traveller-app-1  "node backend/..."  app       Up
```

### 检查日志
```bash
docker-compose logs --tail=50
```

成功启动应该看到：
```
✅ 环境变量配置完整
Supabase client initialised
API server listening on port 8080
```

### 测试 API
```bash
curl http://localhost:8080/api/health
```

应该返回：
```json
{"status":"ok"}
```

---

## 🛠️ 环境变量说明

### 最小配置（必需）
```env
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### 完整配置（所有功能）
```env
# Supabase (必需)
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# DeepSeek AI (AI 行程规划)
LLM_API_URL=https://api.deepseek.com/v1
LLM_API_KEY=your_key
LLM_MODEL=deepseek-chat

# 高德地图 (地图功能)
AMAP_WEB_SERVICE_KEY=your_key
VITE_AMAP_JS_KEY=your_key
VITE_AMAP_JS_SECURITY_CODE=your_code

# 讯飞语音 (语音识别)
IFLYTEK_APP_ID=your_id
IFLYTEK_API_KEY=your_key
IFLYTEK_API_SECRET=your_secret
```

---

## 🐛 故障排除

### 问题 1：端口被占用

**错误信息：**
```
Error: bind: address already in use
```

**解决方法：**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8080 | xargs kill -9
```

或修改 `docker-compose.yml` 中的端口：
```yaml
ports:
  - "8081:8080"  # 改用 8081 端口
```

### 问题 2：环境变量没生效

**检查文件：**
```bash
# 确认 .env 文件存在
ls -la .env

# 查看文件内容
cat .env
```

**重新构建：**
```bash
docker-compose down
docker-compose up -d --build
```

### 问题 3：容器无法启动

**查看详细日志：**
```bash
docker-compose logs --tail=100
```

**检查 Docker 状态：**
```bash
docker ps -a
docker-compose ps
```

**清理并重建：**
```bash
docker-compose down -v
docker-compose up -d --build
```

### 问题 4：数据库连接失败

**检查 Supabase 配置：**
```bash
# 查看环境变量
docker-compose exec app env | grep SUPABASE
```

**验证 Supabase URL：**
- 确保 URL 格式正确：`https://xxxxx.supabase.co`
- 检查密钥是否有效
- 确认 Supabase 项目状态正常

---

## 📦 数据管理

### 查看容器内文件
```bash
docker-compose exec app ls -la
```

### 进入容器
```bash
docker-compose exec app sh
```

### 备份数据
```bash
# 导出环境变量
cp .env .env.backup
```

### 清理所有数据
```bash
docker-compose down -v  # 删除容器和卷
docker system prune -a  # 清理所有未使用的 Docker 资源
```

---

## 🔄 更新应用

```bash
# 1. 停止服务
docker-compose down

# 2. 拉取最新代码
git pull

# 3. 重新构建并启动
docker-compose up -d --build

# 4. 查看日志确认
docker-compose logs -f
```

---

## 🌐 生产环境部署

### 使用自定义端口
```yaml
# docker-compose.yml
services:
  app:
    ports:
      - "80:8080"  # 使用 80 端口
```

### 配置反向代理（Nginx）
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 配置 HTTPS（使用 Let's Encrypt）
```bash
# 安装 Certbot
apt-get install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com
```

---

## 📊 监控和日志

### 实时查看日志
```bash
docker-compose logs -f
```

### 只看错误
```bash
docker-compose logs | grep -i error
```

### 导出日志
```bash
docker-compose logs > app.log
```

### 查看资源使用
```bash
docker stats
```

---

## ✅ 快速检查清单

- [ ] 已复制 `.env.example` 到 `.env`
- [ ] 已填写 Supabase 配置（必需）
- [ ] 已启动 Docker Desktop（Windows/macOS）
- [ ] 端口 8080 未被占用
- [ ] 运行 `docker-compose up -d`
- [ ] 访问 http://localhost:8080 成功

---

## 🎯 一键启动脚本

### Windows (start.ps1)
```powershell
# 检查 .env 文件
if (-not (Test-Path .env)) {
    Write-Host "❌ .env 文件不存在，请先配置环境变量" -ForegroundColor Red
    Write-Host "运行: cp .env.example .env" -ForegroundColor Yellow
    exit 1
}

# 启动服务
Write-Host "🚀 启动 AI-Traveller..." -ForegroundColor Green
docker-compose up -d

# 等待服务启动
Start-Sleep -Seconds 3

# 显示状态
Write-Host "`n📊 服务状态:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n✅ 服务已启动！访问: http://localhost:8080" -ForegroundColor Green
Write-Host "查看日志: docker-compose logs -f" -ForegroundColor Yellow
```

### Linux/macOS (start.sh)
```bash
#!/bin/bash

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "❌ .env 文件不存在，请先配置环境变量"
    echo "运行: cp .env.example .env"
    exit 1
fi

# 启动服务
echo "🚀 启动 AI-Traveller..."
docker-compose up -d

# 等待服务启动
sleep 3

# 显示状态
echo ""
echo "📊 服务状态:"
docker-compose ps

echo ""
echo "✅ 服务已启动！访问: http://localhost:8080"
echo "查看日志: docker-compose logs -f"
```

---

**就是这么简单！** 🎉

有问题？查看完整文档：[README.md](./README.md)
