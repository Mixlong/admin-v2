#!/bin/bash

echo "=== 强制添加所有必要文件 ==="

cd /Users/dragons/Desktop/project/FILECONF-UI

# 如果git仓库不存在，先初始化
if [ ! -d ".git" ]; then
    echo "初始化git仓库..."
    git init
fi

echo "1. 清理git缓存..."
git rm -r --cached . 2>/dev/null || true

echo "2. 检查admin-fileconf-v3目录内容..."
ls -la micro-apps/admin-fileconf-v3/

echo "3. 强制添加主项目文件..."
git add src/ config/ scripts/ package.json vue.config.js README.md

echo "4. 强制添加micro-apps源码文件..."
# 逐个添加确保不遗漏
git add micro-apps/admin-v3/src/
git add micro-apps/admin-v3/public/
git add micro-apps/admin-v3/package.json
git add micro-apps/admin-v3/vite.config.js
git add micro-apps/admin-v3/README.md

git add micro-apps/admin-fileconf-v3/src/
git add micro-apps/admin-fileconf-v3/public/
git add micro-apps/admin-fileconf-v3/package.json
git add micro-apps/admin-fileconf-v3/vite.config.js
git add micro-apps/admin-fileconf-v3/README.md

echo "5. 添加其他重要文件..."
git add .gitignore
git add *.sh

echo "6. 检查暂存状态..."
git status

echo "7. 显示将要提交的admin-fileconf-v3文件..."
git ls-files | grep admin-fileconf-v3

echo "8. 提交..."
git commit -m "feat: 初始化完整项目

- 主项目配置和组件
- admin-v3微应用
- admin-fileconf-v3微应用  
- 报价组件优化
- 动态IP获取功能

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "=== 完成！检查最终结果 ==="
echo "提交的admin-fileconf-v3文件："
git ls-files | grep admin-fileconf-v3 | head -10