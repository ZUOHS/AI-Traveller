#!/bin/bash
# 启动脚本 (Linux/macOS)

# 检查是否存在 .env 文件
if [ ! -f "../.env" ]; then
    echo "❌ 错误: 未找到 .env 文件"
    echo ""
    echo "请执行以下步骤:"
    echo "1. 复制 .env.example 为 .env"
    echo "   cp .env.example .env"
    echo ""
    echo "2. 编辑 .env 文件，填入真实的配置"
    echo "   nano .env"
    echo ""
    exit 1
fi

echo "🚀 启动 AI-Traveller 前端..."
echo ""

# 加载 .env 文件中的 VITE_ 开头的变量
export $(grep -v '^#' ../.env | grep '^VITE_' | xargs)

echo "✓ 环境变量已加载"
echo ""

echo "📦 安装依赖..."
npm install

echo ""
echo "🔥 启动开发服务器..."
npm run dev
