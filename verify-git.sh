#!/bin/bash

echo "=== Git仓库验证 ==="

cd /Users/dragons/Desktop/project/FILECONF-UI

echo "1. Git状态检查："
git status

echo -e "\n2. 提交历史："
git log --oneline

echo -e "\n3. admin-fileconf-v3文件检查："
echo "admin-fileconf-v3相关文件数量："
git ls-files | grep admin-fileconf-v3 | wc -l

echo -e "\n前10个admin-fileconf-v3文件："
git ls-files | grep admin-fileconf-v3 | head -10

echo -e "\n4. 各微应用文件统计："
echo "主项目文件: $(git ls-files | grep -v micro-apps | wc -l)"
echo "admin-v3文件: $(git ls-files | grep micro-apps/admin-v3 | wc -l)"  
echo "admin-fileconf-v3文件: $(git ls-files | grep micro-apps/admin-fileconf-v3 | wc -l)"

echo -e "\n5. 仓库总体信息："
echo "总文件数: $(git ls-files | wc -l)"
echo "分支: $(git branch --show-current)"

echo -e "\n6. 检查重要文件是否存在："
important_files=(
    "micro-apps/admin-fileconf-v3/src/App.vue"
    "micro-apps/admin-fileconf-v3/package.json"
    "micro-apps/admin-fileconf-v3/vite.config.js"
    "src/views/quote-management/quote-calculator/components/AddQuoteDialogRefactored.vue"
    "src/config/microApps.js"
    "scripts/get-local-ip.js"
)

for file in "${important_files[@]}"; do
    if git ls-files | grep -q "^$file$"; then
        echo "✅ $file"
    else
        echo "❌ $file (缺失)"
    fi
done

echo -e "\n=== 验证完成 ==="
echo "如果admin-fileconf-v3文件数量大于0，说明设置成功！"