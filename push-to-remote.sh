#!/bin/bash

echo "=== 推送到远程仓库 ==="

cd /Users/dragons/Desktop/project/FILECONF-UI

echo "1. 添加远程仓库..."
git remote add origin http://192.168.2.237:8888/dtAdmin/FILECONF-UI.git

echo "2. 检查远程仓库配置..."
git remote -v

echo "3. 检查当前分支..."
git branch

echo "4. 推送代码到远程仓库..."
echo "正在推送到 origin test..."
git push -u origin test

echo "5. 检查推送结果..."
git status

echo "=== 推送完成 ==="
echo "现在你的代码已经推送到远程仓库："
echo "http://192.168.2.237:8888/dtAdmin/FILECONF-UI.git"