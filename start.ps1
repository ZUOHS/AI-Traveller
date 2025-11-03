# 检查 .env 文件
if (-not (Test-Path .env)) {
    Write-Host "❌ 错误：找不到 .env 文件" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先配置环境变量：" -ForegroundColor Yellow
    Write-Host "  1. 复制模板：cp .env.example .env" -ForegroundColor Cyan
    Write-Host "  2. 编辑文件：notepad .env" -ForegroundColor Cyan
    Write-Host "  3. 填入你的 Supabase 密钥" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "🚀 正在启动 AI-Traveller..." -ForegroundColor Green
Write-Host ""

# 启动 Docker Compose
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 服务启动成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 服务信息：" -ForegroundColor Cyan
    Write-Host "  - 访问地址: http://localhost:8080" -ForegroundColor White
    Write-Host "  - 查看日志: docker-compose logs -f" -ForegroundColor White
    Write-Host "  - 停止服务: docker-compose down" -ForegroundColor White
    Write-Host ""
    
    # 等待 3 秒
    Start-Sleep -Seconds 3
    
    # 显示容器状态
    Write-Host "📦 容器状态：" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host ""
    Write-Host "🎉 启动完成！打开浏览器访问 http://localhost:8080" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 启动失败！请查看错误信息" -ForegroundColor Red
    Write-Host ""
    Write-Host "常见问题：" -ForegroundColor Yellow
    Write-Host "  1. 端口 8080 被占用：netstat -ano | findstr :8080" -ForegroundColor White
    Write-Host "  2. Docker 未运行：请启动 Docker Desktop" -ForegroundColor White
    Write-Host "  3. 查看详细日志：docker-compose logs" -ForegroundColor White
    Write-Host ""
}
