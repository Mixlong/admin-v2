#!/bin/bash

echo "=== 简单Git设置 ==="

cd /Users/dragons/Desktop/project/FILECONF-UI

# 初始化git（如果还没有的话）
if [ ! -d ".git" ]; then
    git init
    echo "Git仓库已初始化"
fi

# 检查admin-fileconf-v3目录是否存在
if [ -d "micro-apps/admin-fileconf-v3" ]; then
    echo "找到admin-fileconf-v3目录"
    ls -la micro-apps/admin-fileconf-v3/ | head -10
else
    echo "未找到admin-fileconf-v3目录"
    ls -la micro-apps/
fi

# 简单添加所有文件（让git自己处理忽略规则）
echo "添加所有文件..."
git add .

# 检查哪些文件被暂存
echo "检查暂存的文件（前20个）："
git status --porcelain | head -20

# 特别检查admin-fileconf-v3文件
echo "admin-fileconf-v3相关文件："
git status --porcelain | grep admin-fileconf-v3 | head -10

echo "=== 准备提交 ==="
echo "是否要提交？输入 'y' 继续："