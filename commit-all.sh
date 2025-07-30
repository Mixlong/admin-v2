#!/bin/bash

# 批量提交所有项目的脚本

echo "=== 开始批量提交所有项目 ==="

# 提交主项目（如果有git仓库）
echo "1. 检查主项目..."
if [ -d ".git" ]; then
    echo "提交主项目更改..."
    git add .
    git commit -m "feat: 更新主项目配置和组件

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    echo "主项目提交完成"
else
    echo "主项目没有git仓库，跳过"
fi

echo ""

# 提交micro-apps下的所有子项目
echo "2. 检查micro-apps子项目..."
for dir in micro-apps/*/; do
    if [ -d "$dir" ]; then
        project_name=$(basename "$dir")
        echo "进入项目: $project_name"
        cd "$dir"
        
        if [ -d ".git" ]; then
            echo "提交 $project_name 的更改..."
            git add .
            git commit -m "feat: 更新 $project_name 项目

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
            echo "$project_name 提交完成"
        else
            echo "$project_name 没有git仓库，跳过"
        fi
        
        cd - > /dev/null
        echo ""
    fi
done

echo "=== 批量提交完成 ==="