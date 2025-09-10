// 动态CSS加载工具
const loadedCSS = new Set();

export function loadCSS(href, id) {
  return new Promise((resolve, reject) => {
    // 避免重复加载
    if (loadedCSS.has(href)) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (id) link.id = id;

    link.onload = () => {
      loadedCSS.add(href);
      resolve();
    };
    
    link.onerror = () => {
      reject(new Error(`CSS load failed: ${href}`));
    };

    document.head.appendChild(link);
  });
}

// 预定义的CSS资源
export const CSS_RESOURCES = {
  VIEWER: () => import('viewerjs/dist/viewer.css'),
  EASYTABLE: () => import('vue-easytable/libs/theme-default/index.css')
};