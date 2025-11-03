#!/bin/bash

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "❌ 错误：找不到 .env 文件"
    echo ""
    echo "请先配置环境变量："
    echo "  1. 复制模板：cp .env.example .env"
    echo "  2. 编辑文件：nano .env"
    echo "  3. 填入你的 Supabase 密钥"
    echo ""
    exit 1
fi

echo "🚀 正在启动 AI-Traveller..."
echo ""

# 启动 Docker Compose
docker-compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 服务启动成功！"
    echo ""
    echo "📊 服务信息："
    echo "  - 访问地址: http://localhost:8080"
    echo "  - 查看日志: docker-compose logs -f"
    echo "  - 停止服务: docker-compose down"
    echo ""
    
    # 等待 3 秒
    sleep 3
    
    # 显示容器状态
    echo "📦 容器状态："
    docker-compose ps
    
    echo ""
    echo "🎉 启动完成！打开浏览器访问 http://localhost:8080"
else
    echo ""
    echo "❌ 启动失败！请查看错误信息"
    echo ""
    echo "常见问题："
    echo "  1. 端口 8080 被占用：lsof -ti:8080"
    echo "  2. Docker 未运行：请启动 Docker"
    echo "  3. 查看详细日志：docker-compose logs"
    echo ""
fi
