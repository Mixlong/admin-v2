#!/bin/bash

# 微前端配置检查脚本

echo "🔍 检查微前端配置..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查结果统计
PASS=0
FAIL=0
WARN=0

# 检查函数
check_file() {
  local file=$1
  local desc=$2
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅${NC} $desc: $file"
    PASS=$((PASS + 1))
    return 0
  else
    echo -e "${RED}❌${NC} $desc: $file (不存在)"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

check_content() {
  local file=$1
  local pattern=$2
  local desc=$3
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $desc"
    PASS=$((PASS + 1))
    return 0
  else
    echo -e "${RED}❌${NC} $desc (未找到)"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

check_warning() {
  local file=$1
  local pattern=$2
  local desc=$3
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${YELLOW}⚠️${NC}  $desc"
    WARN=$((WARN + 1))
    return 1
  else
    echo -e "${GREEN}✅${NC} $desc"
    PASS=$((PASS + 1))
    return 0
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 V3 主应用配置检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file "micro-apps/admin-fileconf-v3/package.json" "V3 package.json"
check_content "micro-apps/admin-fileconf-v3/package.json" "wujie-vue3" "V3 已安装 wujie-vue3"
check_file "micro-apps/admin-fileconf-v3/src/config/microApps.js" "V3 微应用配置文件"
check_file "micro-apps/admin-fileconf-v3/src/components/MicroAppContainer.vue" "V3 微应用容器组件"
check_content "micro-apps/admin-fileconf-v3/src/main.js" "WujieVue" "V3 main.js 已注册 Wujie"
check_content "micro-apps/admin-fileconf-v3/src/router/index.js" "MicroAppContainer" "V3 路由已配置微应用容器"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 V2 子应用配置检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file "package.json" "V2 package.json"
check_content "package.json" "wujie-vue2" "V2 已安装 wujie-vue2"
check_content "src/main.js" "__POWERED_BY_WUJIE__" "V2 main.js 已添加微前端生命周期钩子"
check_content "src/main.js" "__WUJIE_MOUNT" "V2 main.js 已定义挂载钩子"
check_content "src/main.js" "__WUJIE_UNMOUNT" "V2 main.js 已定义卸载钩子"
check_content "vue.config.js" "Access-Control-Allow-Origin" "V2 vue.config.js 已配置 CORS"
check_content "vue.config.js" "disableHostCheck" "V2 vue.config.js 已禁用 host 检查"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 配置检查结果"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 通过: $PASS${NC}"
echo -e "${RED}❌ 失败: $FAIL${NC}"
echo -e "${YELLOW}⚠️  警告: $WARN${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 所有配置检查通过！可以启动微前端应用了。${NC}"
  echo ""
  echo "启动命令:"
  echo "  ./start-micro-apps.sh"
else
  echo -e "${RED}❌ 配置检查失败，请修复上述问题后再启动。${NC}"
  echo ""
  echo "查看详细文档:"
  echo "  cat MICRO_FRONTEND_INTEGRATION.md"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
