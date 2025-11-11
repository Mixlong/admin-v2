/**
 * 全局表单输入修复补丁
 * 解决若依框架中常见的表单被禁用、loading 遮罩卡死等问题
 * 
 * 主要功能：
 * 1. 自动修复未关闭的 Loading 遮罩
 * 2. 清理阻止交互的 pointer-events
 * 3. 拦截 el-form 的全局禁用
 * 4. 开发环境提示问题来源
 */

import Vue from 'vue';
import { Loading } from 'element-ui';

// ============================================
// ✅ 1. 自动修复遮罩层 / loading 层
// ============================================
const originalLoading = Loading.service;
const activeLoadings = [];

Loading.service = function (options = {}) {
  const instance = originalLoading.call(this, options);
  activeLoadings.push(instance);

  // 自动超时关闭机制
  const timeout = setTimeout(() => {
    if (instance && instance.close) {
      console.warn('[表单修复] 检测到超时未关闭的 Loading，已自动关闭。');
      instance.close();
    }
  }, 20000); // 超过20秒自动清理

  // 监听关闭事件，清除定时器
  if (instance.$on) {
    instance.$on('close', () => clearTimeout(timeout));
  }

  return instance;
};

// 定时清理遗留遮罩
setInterval(() => {
  document.querySelectorAll('.el-loading-mask').forEach(mask => {
    const visible = mask.style.display !== 'none';
    if (visible && mask.parentElement && !mask.parentElement.contains(document.activeElement)) {
      console.warn('[表单修复] 清理遗留 Loading 遮罩');
      mask.remove();
    }
  });
}, 10000);

// ============================================
// ✅ 2. 自动修复 pointer-events 禁止交互问题
// ============================================
setInterval(() => {
  const blocked = [...document.querySelectorAll('body *')]
    .find(el => {
      const style = window.getComputedStyle(el);
      // 排除 el-select、el-dropdown 等正常需要 pointer-events 的组件
      const isSelectComponent = el.classList.contains('el-select-dropdown') ||
                                el.classList.contains('el-popper') ||
                                el.classList.contains('el-picker-panel') ||
                                el.closest('.el-select-dropdown') ||
                                el.closest('.el-popper');
      
      return style.pointerEvents === 'none' && el.offsetParent && !isSelectComponent;
    });
  
  if (blocked) {
    console.warn('[表单修复] 检测到 pointer-events:none 的元素，已解除', blocked);
    blocked.style.pointerEvents = 'auto';
  }
}, 5000);

// ============================================
// ✅ 3. 拦截 el-form 的全局禁用（自动降级为单项控制）
// ============================================
try {
  const ElForm = Vue.component('ElForm');
  
  if (ElForm && ElForm.options) {
    // 备份原始 created 钩子
    const originalCreated = ElForm.options.created;
    
    // 重写 created 钩子
    ElForm.options.created = function () {
      // 检测并移除全局 disabled
      if (this.$attrs && this.$attrs.disabled !== undefined) {
        console.warn('[表单修复] 检测到 <el-form disabled>，已自动解除全局禁用');
        this.$delete(this.$attrs, 'disabled');
      }
      
      // 调用原始钩子
      if (originalCreated) {
        originalCreated.call(this);
      }
    };
  }
} catch (error) {
  console.error('[表单修复] 拦截 el-form 失败:', error);
}

// ============================================
// ✅ 4. 全局提示开发者问题来源（仅开发环境）
// ============================================
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const inputs = document.querySelectorAll('input, textarea, select');
    if (inputs.length === 0) return;
    
    const blocked = [...inputs].filter(el => {
      // 排除隐藏的元素
      return el.offsetParent !== null && (el.disabled || el.readOnly);
    });
    
    if (blocked.length === inputs.length && inputs.length > 5) {
      console.warn('[表单修复] 当前页面所有输入框都被禁用，请检查 :disabled 逻辑或遮罩层。');
    }
  }, 5000);
}

// ============================================
// ✅ 5. 清理僵尸遮罩层（全局 el-loading-mask）
// ============================================
const cleanZombieMasks = () => {
  const masks = document.querySelectorAll('.el-loading-mask');
  masks.forEach(mask => {
    // 检查是否是孤立的遮罩（没有父级组件控制）
    if (!mask.__vue__ && mask.style.display !== 'none') {
      console.warn('[表单修复] 清理僵尸遮罩层', mask);
      mask.remove();
    }
  });
};

// 页面加载完成后执行一次
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', cleanZombieMasks);
} else {
  cleanZombieMasks();
}

// ============================================
// ✅ 6. 自动恢复被禁用的富文本编辑器
// ============================================
setInterval(() => {
  const quillEditors = document.querySelectorAll('.ql-container');
  quillEditors.forEach(editor => {
    if (editor.classList.contains('ql-disabled')) {
      const toolbar = editor.previousElementSibling;
      if (toolbar && toolbar.classList.contains('ql-toolbar')) {
        const parentForm = editor.closest('form, .el-form');
        if (parentForm && parentForm.hasAttribute('disabled')) {
          console.warn('[表单修复] 检测到富文本编辑器被禁用，尝试恢复');
          editor.classList.remove('ql-disabled');
        }
      }
    }
  });
}, 3000);

console.log('[表单修复] 全局补丁已加载 ✅');

export default {
  name: 'FormBlockFix',
  version: '1.0.0'
};
