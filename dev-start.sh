#!/bin/bash

echo "启动微前端开发环境..."

# 获取本机IP地址
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "192.168.2.15")
echo "检测到本机IP: $LOCAL_IP"

# 确保配置文件使用正确的IP
echo "更新微应用配置中的IP地址..."

# 检查并杀掉可能占用端口的进程
echo "检查端口占用情况..."
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:2025 | xargs kill -9 2>/dev/null || true

# 启动子应用 RuoYi-Vue3
echo "启动子应用 RuoYi-Vue3 (端口 3002)..."
cd micro-apps/RuoYi-Vue3

# 初始化 nvm 环境
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

if [ -f .nvmrc ]; then
  echo "切换子应用到 .nvmrc 中指定的 Node 版本..."
  nvm use
  echo "子应用当前使用的Node版本: $(node --version)"
  echo "子应用当前使用的npm版本: $(npm --version)"
else
  echo "未找到 .nvmrc 文件，强制切换到 Node 20.18.0"
  nvm use 20.18.0
  echo "子应用当前使用的Node版本: $(node --version)"
  echo "子应用当前使用的npm版本: $(npm --version)"
fi

# 使用子进程启动，避免 exec 导致的问题
npm run dev &
RUOYI_PID=$!
cd ../..

# 等待子应用启动
sleep 5

# 启动主应用
echo "启动主应用 (端口 2025)..."

# 切换到主应用的Node版本（12.22.12）
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo "切换主应用到Node 12.22.12..."
nvm use 12.22.12
echo "主应用当前使用的Node版本: $(node --version)"
echo "主应用当前使用的npm版本: $(npm --version)"

npm run dev &
MAIN_PID=$!

echo ""
echo "微前端开发环境启动完成！"
echo "主应用: http://$LOCAL_IP:2025"
echo "子应用: http://$LOCAL_IP:3002"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获 Ctrl+C 信号
trap 'echo "正在停止所有服务..."; kill $MAIN_PID $RUOYI_PID 2>/dev/null; exit 0' INT

# 保持脚本运行
wait