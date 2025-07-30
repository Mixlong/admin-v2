#!/bin/bash

# 初始化主项目为git仓库的脚本

echo "=== 初始化主项目git仓库 ==="

# 初始化git仓库
git init

# 创建.gitignore（如果不存在的话）
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
.DS_Store
node_modules/
dist/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
**/*.log

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.local

package-lock.json
yarn.lock
oldDist
EOF
    echo "创建了.gitignore文件"
fi

# 添加所有文件
git add .

# 初始提交
git commit -m "feat: 初始化项目

包含主项目和微应用子项目

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "=== 主项目git仓库初始化完成 ==="
echo "现在主项目会跟踪micro-apps目录下的所有文件更改"