#!/bin/bash

# 微前端应用启动脚本
# 同时启动 V3 主应用和 V2 子应用

echo "🚀 启动微前端应用..."
echo ""

# 检查是否安装了依赖
check_dependencies() {
  local dir=$1
  local name=$2
  
  if [ ! -d "$dir/node_modules" ]; then
    echo "⚠️  $name 未安装依赖，正在安装..."
    cd "$dir"
    npm install
    cd -
  fi
}

# 启动应用
start_app() {
  local dir=$1
  local name=$2
  local command=$3
  local port=$4
  
  echo "📦 启动 $name (端口: $port)..."
  cd "$dir"
  
  # 使用 nohup 在后台运行
  nohup $command > "../logs/$name.log" 2>&1 &
  local pid=$!
  
  echo "✅ $name 已启动 (PID: $pid)"
  echo "$pid" > "../logs/$name.pid"
  
  cd -
}

# 创建日志目录
mkdir -p logs

# 检查依赖
echo "🔍 检查依赖..."
check_dependencies "." "V2 子应用"
check_dependencies "micro-apps/admin-fileconf-v3" "V3 主应用"
echo ""

# 启动 V2 子应用
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
start_app "." "V2 子应用" "npm run dev" "8080"
echo ""

# 等待 V2 启动
echo "⏳ 等待 V2 子应用启动..."
sleep 5
echo ""

# 启动 V3 主应用
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
start_app "micro-apps/admin-fileconf-v3" "V3 主应用" "npm run dev" "5173"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 所有应用已启动！"
echo ""
echo "📋 访问地址:"
echo "   V3 主应用: http://localhost:5173"
echo "   V2 子应用: http://localhost:8080"
echo ""
echo "📋 日志文件:"
echo "   V3 主应用: logs/V3 主应用.log"
echo "   V2 子应用: logs/V2 子应用.log"
echo ""
echo "📋 停止应用:"
echo "   ./stop-micro-apps.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
