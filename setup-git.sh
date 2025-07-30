#!/bin/bash

echo "=== 开始初始化Git仓库 ==="

# 确保在正确的目录
cd /Users/dragons/Desktop/project/FILECONF-UI

# 初始化git仓库
echo "1. 初始化git仓库..."
git init

# 检查git状态
echo "2. 检查git状态..."
git status

# 强制添加micro-apps目录
echo "3. 添加micro-apps目录..."
git add micro-apps/

# 添加所有其他文件
echo "4. 添加所有文件..."
git add .

# 再次检查状态
echo "5. 检查暂存状态..."
git status

# 提交
echo "6. 提交文件..."
git commit -m "feat: 初始化项目，包含主项目和微应用

- 添加主项目配置和组件
- 包含admin-v3和admin-fileconf-v3微应用
- 优化报价组件功能
- 添加动态IP获取功能

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "=== Git仓库初始化完成 ==="

# 显示最终状态
echo "7. 最终状态:"
git log --oneline -n 1
git status