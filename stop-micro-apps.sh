#!/bin/bash

# 微前端应用停止脚本
# 停止 V3 主应用和 V2 子应用

echo "🛑 停止微前端应用..."
echo ""

# 停止应用
stop_app() {
  local name=$1
  local pid_file="logs/$name.pid"
  
  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    
    if ps -p $pid > /dev/null 2>&1; then
      echo "🛑 停止 $name (PID: $pid)..."
      kill $pid
      
      # 等待进程结束
      local count=0
      while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
        sleep 1
        count=$((count + 1))
      done
      
      # 如果进程还在运行，强制杀死
      if ps -p $pid > /dev/null 2>&1; then
        echo "⚠️  强制停止 $name..."
        kill -9 $pid
      fi
      
      echo "✅ $name 已停止"
    else
      echo "⚠️  $name 进程不存在 (PID: $pid)"
    fi
    
    rm "$pid_file"
  else
    echo "⚠️  未找到 $name 的 PID 文件"
  fi
}

# 停止 V3 主应用
stop_app "V3 主应用"
echo ""

# 停止 V2 子应用
stop_app "V2 子应用"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 所有应用已停止！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
