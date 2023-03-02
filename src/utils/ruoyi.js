/**
 * 通用js方法封装处理
 * Copyright (c) 2019 ruoyi
 */
import reqUrl from '@/utils/requestUrl';

const baseURL = reqUrl;
/**
 * 深拷贝
 * @param {Object} source 拷贝对象
 * @returns {Object}
 */
export function extend(source) {
  let target;
  if (typeof source === 'object') {

    target = Array.isArray(source) ? [] : {};
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] !== 'object') {
          target[key] = source[key];
        } else {
          target[key] = extend(source[key]);
        }
      }
    }
  } else {
    target = source;
  }
  return target;
}
// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (typeof time === 'object') {
    date = time;
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/');
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  });
  return time_str;
}

// 图片地址格式化
export function transFileUrl(url) {
  return url.slice(url.lastIndexOf('/') + 1)
}

// 去除表单项校验
export function clearValidateItem(refName, formItemName) {
  if (this.$refs[refName]) {
    this.$refs[refName].clearValidate(formItemName);
  }
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

// 添加日期范围
export function addDateRange(params, dateRange, { begin = 'beginTime', end = 'endTime' } = {}) {
  var search = params;
  search[begin] = '';
  search[end] = '';
  if (null != dateRange && '' != dateRange) {
    search[begin] = dateRange[0];
    search[end] = dateRange[1];
  }
  return search;
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  var actions = [];
  Object.keys(datas).some(key => {
    if (datas[key].dictValue == '' + value) {
      actions.push(datas[key].dictLabel);
      return true;
    }
  });
  return actions.join('');
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas, value, separator) {
  var actions = [];
  var currentSeparator = undefined === separator ? ',' : separator;
  var temp = value.split(currentSeparator);
  Object.keys(value.split(currentSeparator)).some(val => {
    Object.keys(datas).some(key => {
      if (datas[key].dictValue == '' + temp[val]) {
        actions.push(datas[key].dictLabel + currentSeparator);
      }
    });
  });
  return actions.join('').substring(0, actions.join('').length - 1);
}

// 通用下载方法
export function download(fileName) {
  window.location.href = baseURL + '/common/download?fileName=' + encodeURI(fileName) + '&delete=' + true;
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments, flag = true, i = 1;
  str = str.replace(/%s/g, function () {
    var arg = args[i++];
    if (typeof arg === 'undefined') {
      flag = false;
      return '';
    }
    return arg;
  });
  return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
  if (!str || str == 'undefined' || str == 'null') {
    return '';
  }
  return str;
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function handleTree(data, id, parentId, children, rootId) {
  id = id || 'id';
  parentId = parentId || 'parentId';
  children = children || 'children';
  rootId =
    rootId ||
    Math.min.apply(
      Math,
      data.map(item => {
        return item[parentId];
      })
    ) ||
    0;
  //对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data));
  //循环所有项
  const treeData = cloneData.filter(father => {
    let branchArr = cloneData.filter(child => {
      //返回每一项的子级数组
      return father[id] === child[parentId];
    });
    branchArr.length > 0 ? (father.children = branchArr) : '';
    //返回第一层
    return father[parentId] === rootId;
  });
  return treeData != '' ? treeData : data;
}

// TABLE 通用高度
export function tableHeight(num) {
  num = num ? num : 0;
  return document.documentElement.clientHeight - 290 + num;
}

// dialog 通用宽度
export function dialogTop() {
  const w = document.documentElement.clientWidth
  if (w < 1350) {
    return '50vh'
  }
  return '10vh'
}

// 全局通用表单按enter提交方法
export function Enter_Fn(fn) {
  try {
    document.onkeydown = (e) => {
      if (e.keyCode === 13) {
        fn && fn();
      }
    };
  } catch (error) {
    console.log(error)
  }
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
export function is_Empty(obj) {
  if (
    typeof obj == "undefined" ||
    obj == null ||
    (typeof obj == "string" && obj.trim() == "") ||
    (typeof obj == "object" && Object.keys(obj).length === 0)
  ) {
    return true;
  } else {
    return false;
  }
}