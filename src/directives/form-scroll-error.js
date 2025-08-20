/**
 * 表单校验错误滚动定位指令
 * 使用方法：在表单元素上添加 v-form-scroll-error
 * 
 * <el-form v-form-scroll-error ref="form" :model="form" :rules="rules">
 *   ...
 * </el-form>
 * 
 * 然后在提交时正常调用 validate：
 * this.$refs.form.validate((valid, invalidFields) => {
 *   if (valid) {
 *     // 提交逻辑
 *   }
 *   // 不需要额外代码，指令会自动处理错误滚动
 * });
 */

const FormScrollError = {
  inserted(el, binding, vnode) {
    // 获取组件实例
    const component = vnode.componentInstance;
    if (!component) return;

    // 保存原始的 validate 方法
    const originalValidate = component.validate;
    
    // 重写 validate 方法
    component.validate = function(callback, ...args) {
      return originalValidate.call(this, (valid, invalidFields) => {
        // 如果校验失败，滚动到第一个错误位置
        if (!valid && invalidFields) {
          console.log('表单校验失败，开始滚动到错误位置');
          scrollToFirstError(el, invalidFields, binding.value);
        }
        
        // 调用原始回调
        if (callback) {
          callback(valid, invalidFields);
        }
      }, ...args);
    };
  }
};

/**
 * 滚动到第一个错误字段位置
 * @param {Element} formEl - 表单元素
 * @param {Object} invalidFields - 校验失败的字段
 * @param {Object} options - 配置选项
 */
function scrollToFirstError(formEl, invalidFields, options = {}) {
  console.log('scrollToFirstError 被调用，invalidFields:', invalidFields);
  
  if (!invalidFields) {
    console.log('invalidFields 为空，退出');
    return;
  }

  // 默认配置
  const config = {
    offset: 80, // 滚动偏移量
    behavior: 'smooth', // 滚动行为
    debug: false, // 调试模式
    container: null, // 自定义滚动容器
    ...options
  };

  // 获取第一个错误字段的名称
  const firstErrorField = Object.keys(invalidFields)[0];
  console.log('第一个错误字段:', firstErrorField);
  
  if (!firstErrorField) {
    console.log('没有找到错误字段，退出');
    return;
  }

  // 使用 $nextTick 确保DOM更新完成
  const vue = formEl.__vue__ || formEl.__vueParentComponent?.ctx;
  const nextTick = vue?.$nextTick || (() => Promise.resolve().then(() => {}));
  
  nextTick(() => {
    console.log('开始查找DOM元素...');
    const targetElement = findErrorElement(formEl, firstErrorField, config);
    
    if (targetElement) {
      console.log('找到目标元素，开始滚动');
      smoothScrollToElement(targetElement, config);
    } else {
      console.log('未找到目标元素');
    }
  });
}

/**
 * 查找错误字段对应的DOM元素
 * @param {Element} formEl - 表单元素
 * @param {string} fieldName - 字段名
 * @param {Object} config - 配置
 * @returns {Element|null} 目标元素
 */
function findErrorElement(formEl, fieldName, config) {
  let targetElement = null;

  // 处理数组字段（如 list[0].indexNum）
  if (fieldName.includes('[')) {
    console.log('处理数组字段');
    const match = fieldName.match(/(\w+)\[(\d+)\]\.(\w+)/);
    if (match) {
      const [, arrayName, index, subField] = match;
      const idx = parseInt(index);
      console.log('数组名:', arrayName, '索引:', idx, '字段名:', subField);
      
      // 通用数组字段查找策略
      targetElement = findArrayFieldElement(formEl, arrayName, idx, subField, config);
    }
  } else {
    console.log('处理普通字段');
    // 处理普通字段
    targetElement = findSimpleFieldElement(formEl, fieldName, config);
  }

  // 备用查找策略：通过 prop 属性查找
  if (!targetElement) {
    console.log('尝试通过prop属性查找');
    targetElement = formEl.querySelector(`[prop="${fieldName}"]`);
    
    // 如果找到表单项，尝试找到其中的输入控件
    if (targetElement) {
      const input = targetElement.querySelector('input, textarea, select, .el-select, .el-time-picker, .el-date-picker');
      if (input) {
        targetElement = input;
      }
    }
  }

  console.log('最终查找结果:', targetElement);
  return targetElement;
}

/**
 * 查找数组字段元素
 * @param {Element} formEl - 表单元素
 * @param {string} arrayName - 数组字段名
 * @param {number} index - 数组索引
 * @param {string} subField - 子字段名
 * @param {Object} config - 配置
 * @returns {Element|null}
 */
function findArrayFieldElement(formEl, arrayName, index, subField, config) {
  // 常见的数组项容器类名模式
  const containerSelectors = [
    '.array-item',
    '.list-item', 
    '.form-item-group',
    '.workspace-item', // SOP特定
    '[class*="item"]',
    '[class*="row"]'
  ];

  let targetElement = null;

  // 尝试不同的容器选择器
  for (const containerSelector of containerSelectors) {
    const containers = formEl.querySelectorAll(containerSelector);
    if (config.debug) {
      console.log(`尝试容器选择器 ${containerSelector}:`, containers.length);
    }
    
    if (containers[index]) {
      targetElement = findFieldInContainer(containers[index], subField, config);
      if (targetElement) {
        console.log(`在容器 ${containerSelector} 中找到目标元素`);
        break;
      }
    }
  }

  return targetElement;
}

/**
 * 在容器中查找字段元素
 * @param {Element} container - 容器元素
 * @param {string} fieldName - 字段名
 * @param {Object} config - 配置
 * @returns {Element|null}
 */
function findFieldInContainer(container, fieldName, config) {
  // 字段名到选择器的映射
  const fieldSelectors = {
    // 通用字段
    indexNum: ['input[placeholder*="序号"]', 'input[placeholder="序号"]'],
    spendTime: [
      '.el-time-picker input',
      '.el-time-picker .el-input__inner',
      'input[placeholder*="工时"]',
      'input[placeholder*="时间"]',
      'input[placeholder="请选择工时"]',
      '.el-time-picker'
    ],
    remark: ['textarea', 'textarea[placeholder*="描述"]', 'textarea[placeholder*="备注"]'],
    file: ['.upload-area', '.simple-upload-area', '.el-upload'],
    name: ['input[placeholder*="名称"]', 'input[placeholder*="姓名"]'],
    value: ['input[placeholder*="值"]', 'input[placeholder*="数值"]'],
    // 可以根据需要添加更多字段映射
  };

  let targetElement = null;
  const selectors = fieldSelectors[fieldName] || [`input[name*="${fieldName}"]`, `[class*="${fieldName}"]`];

  // 尝试各种选择器
  for (const selector of selectors) {
    targetElement = container.querySelector(selector);
    if (targetElement) {
      if (config.debug) {
        console.log(`字段 ${fieldName} 通过选择器 ${selector} 找到`);
      }
      break;
    }
  }

  // 如果还没找到，尝试通过所有输入控件匹配
  if (!targetElement) {
    const allInputs = container.querySelectorAll('input, textarea, select');
    targetElement = Array.from(allInputs).find(input => {
      const placeholder = input.placeholder || '';
      const name = input.name || '';
      const id = input.id || '';
      
      return placeholder.includes(fieldName) || 
             name.includes(fieldName) || 
             id.includes(fieldName) ||
             input.classList.toString().includes(fieldName);
    });
    
    if (targetElement && config.debug) {
      console.log(`字段 ${fieldName} 通过智能匹配找到`);
    }
  }

  return targetElement;
}

/**
 * 查找简单字段元素
 * @param {Element} formEl - 表单元素  
 * @param {string} fieldName - 字段名
 * @param {Object} config - 配置
 * @returns {Element|null}
 */
function findSimpleFieldElement(formEl, fieldName, config) {
  // 常见字段的选择器映射
  const fieldSelectors = {
    categoryId: ['.el-select input', 'select[name="categoryId"]'],
    versionCode: ['input[placeholder*="版本号"]', 'input[name="versionCode"]'],
    desc: ['textarea[placeholder*="描述"]', 'textarea[name="desc"]'],
    name: ['input[placeholder*="名称"]', 'input[name="name"]'],
    email: ['input[type="email"]', 'input[placeholder*="邮箱"]'],
    phone: ['input[type="tel"]', 'input[placeholder*="电话"]', 'input[placeholder*="手机"]'],
    // 可以根据项目需要添加更多映射
  };

  let targetElement = null;
  const selectors = fieldSelectors[fieldName] || [`input[name="${fieldName}"]`, `select[name="${fieldName}"]`, `textarea[name="${fieldName}"]`];

  // 尝试各种选择器
  for (const selector of selectors) {
    targetElement = formEl.querySelector(selector);
    if (targetElement) {
      if (config.debug) {
        console.log(`简单字段 ${fieldName} 通过选择器 ${selector} 找到`);
      }
      break;
    }
  }

  return targetElement;
}

/**
 * 平滑滚动到指定元素
 * @param {Element} element - 目标元素
 * @param {Object} config - 配置
 */
function smoothScrollToElement(element, config) {
  console.log('smoothScrollToElement 被调用，element:', element);
  
  if (!element) {
    console.log('element 为空，退出');
    return;
  }

  // 高亮错误元素
  highlightErrorElement(element, config);

  // 如果指定了自定义滚动容器
  if (config.container) {
    scrollInContainer(element, config.container, config);
    return;
  }

  // 先尝试最简单的方法
  console.log('尝试使用 scrollIntoView');
  element.scrollIntoView({
    behavior: config.behavior,
    block: 'center',
    inline: 'nearest'
  });

  // 如果在对话框中，再尝试对话框内滚动
  setTimeout(() => {
    const dialog = findScrollableDialog(element);
    if (dialog) {
      console.log('找到对话框，进行对话框内滚动');
      scrollInContainer(element, dialog, config);
    }
  }, 100);
}

/**
 * 在指定容器内滚动
 * @param {Element} element - 目标元素
 * @param {Element} container - 滚动容器
 * @param {Object} config - 配置
 */
function scrollInContainer(element, container, config) {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  // 计算滚动位置
  const elementTop = elementRect.top - containerRect.top + container.scrollTop;
  const scrollTop = Math.max(0, elementTop - config.offset);
  
  console.log('容器内滚动信息:', {
    elementTop,
    currentScrollTop: container.scrollTop,
    targetScrollTop: scrollTop,
    containerHeight: container.clientHeight,
    containerScrollHeight: container.scrollHeight
  });

  // 平滑滚动
  container.scrollTo({
    top: scrollTop,
    behavior: config.behavior
  });
}

/**
 * 查找可滚动的对话框容器
 * @param {Element} element - 目标元素
 * @returns {Element|null}
 */
function findScrollableDialog(element) {
  // 查找包含目标元素的对话框body
  const allDialogBodies = document.querySelectorAll('.el-dialog__body');
  for (let body of allDialogBodies) {
    if (body.contains(element)) {
      return body;
    }
  }
  
  // 查找其他可能的滚动容器
  const scrollContainers = document.querySelectorAll('[class*="scroll"], .modal-body, .drawer-body');
  for (let container of scrollContainers) {
    if (container.contains(element) && container.scrollHeight > container.clientHeight) {
      return container;
    }
  }
  
  return null;
}

/**
 * 高亮错误元素
 * @param {Element} element - 目标元素
 * @param {Object} config - 配置
 */
function highlightErrorElement(element, config) {
  if (!element) return;

  // 添加高亮样式
  element.style.transition = 'all 0.3s ease';
  element.style.boxShadow = '0 0 8px rgba(245, 108, 108, 0.6)';
  element.style.borderColor = '#f56c6c';

  // 3秒后移除高亮效果
  setTimeout(() => {
    element.style.boxShadow = '';
    element.style.borderColor = '';
  }, 3000);
}

export default FormScrollError;