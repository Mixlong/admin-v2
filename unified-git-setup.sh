#!/bin/bash

echo "=== 统一仓库管理设置 ==="

cd /Users/dragons/Desktop/project/FILECONF-UI

echo "1. 删除子项目的.git目录..."
if [ -d "micro-apps/admin-v3/.git" ]; then
    rm -rf micro-apps/admin-v3/.git
    echo "已删除 admin-v3/.git"
fi

if [ -d "micro-apps/admin-fileconf-v3/.git" ]; then
    rm -rf micro-apps/admin-fileconf-v3/.git  
    echo "已删除 admin-fileconf-v3/.git"
fi

echo "2. 删除现有git仓库（如果存在）..."
if [ -d ".git" ]; then
    rm -rf .git
    echo "已删除现有.git目录"
fi

echo "3. 初始化新的git仓库..."
git init

echo "4. 创建.gitignore..."
cat > .gitignore << 'EOF'
.DS_Store
node_modules
dist
*.log
.idea
.vscode
*.local
*.zip
prod.ssh
test.ssh
EOF

echo "5. 检查项目结构..."
echo "主项目文件："
ls -la | grep -E '\.(js|json|vue|md)$' | head -5

echo "micro-apps目录："
ls -la micro-apps/

echo "admin-fileconf-v3内容："
ls -la micro-apps/admin-fileconf-v3/ | head -10

echo "6. 添加所有文件到git..."
git add .

echo "7. 检查暂存状态..."
echo "总共暂存文件数："
git status --porcelain | wc -l

echo "admin-fileconf-v3相关文件："
git status --porcelain | grep admin-fileconf-v3 | head -10

echo "8. 提交..."
git commit -m "feat: 初始化统一微前端项目

包含以下模块:
- 主项目配置和组件
- admin-v3 微应用 
- admin-fileconf-v3 微应用
- 报价管理功能优化
- 动态IP获取功能

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "=== 设置完成 ==="
echo "检查最终状态："
git log --oneline -n 1
echo "仓库中的文件总数："
git ls-files | wc -l
echo "admin-fileconf-v3文件数："
git ls-files | grep admin-fileconf-v3 | wc -l