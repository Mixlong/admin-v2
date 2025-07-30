#!/bin/bash

echo "=== 推送到test分支 ==="

cd /Users/dragons/Desktop/project/FILECONF-UI

echo "1. 提交所有文件..."
git add .
git commit -m "feat: 添加Git管理和验证脚本

- 统一仓库管理脚本
- Git验证脚本  
- 远程推送脚本"

echo "2. 创建并切换到test分支..."
git checkout -b test

echo "3. 检查分支状态..."
git branch

echo "4. 推送到远程test分支..."
git push -u origin test

echo "5. 检查推送结果..."
git status

echo "=== 推送完成 ==="
echo "代码已成功推送到test分支："
echo "http://192.168.2.237:8888/dtAdmin/FILECONF-UI.git (test分支)"