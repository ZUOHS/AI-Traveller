# 启动脚本 (Windows PowerShell)

# 检查是否存在 .env 文件
if (-not (Test-Path "..\.env")) {
    Write-Host "❌ 错误: 未找到 .env 文件" -ForegroundColor Red
    Write-Host ""
    Write-Host "请执行以下步骤:" -ForegroundColor Yellow
    Write-Host "1. 复制 .env.example 为 .env"
    Write-Host "   Copy-Item .env.example .env"
    Write-Host ""
    Write-Host "2. 编辑 .env 文件，填入真实的配置"
    Write-Host "   notepad .env"
    Write-Host ""
    exit 1
}

Write-Host "🚀 启动 AI-Traveller 前端..." -ForegroundColor Green
Write-Host ""

# 读取 .env 文件中的 VITE_ 开头的变量
Get-Content "..\.env" | ForEach-Object {
    if ($_ -match "^\s*(VITE_[^=]+)\s*=\s*(.+)\s*$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
        Write-Host "✓ 设置环境变量: $name" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📦 安装依赖..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "🔥 启动开发服务器..." -ForegroundColor Cyan
npm run dev
