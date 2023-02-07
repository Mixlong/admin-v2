import request from '@/utils/request';

// 列表
export function productionList (query) {
  return request ({
    url: '/production/list',
    method: 'get',
    params: query,
  });
}

export function productionAging (query) {
    return request ({
      url: '/production/aging',
      method: 'get',
      params: query,
    });
  }
  export function productionConfstation (query) {
    return request ({
      url: '/production/confstation',
      method: 'get',
      params: query,
    });
  }
  

export function productionFct (query) {
    return request ({
      url: '/production/fct',
      method: 'get',
      params: query,
    });
  }
  export function productionFqc (query) {
    return request ({
      url: '/production/fqc',
      method: 'get',
      params: query,
    });
  }
  

export function productionOqc (query) {
    return request ({
      url: '/production/oqc',
      method: 'get',
      params: query,
    });
  }
  export function productionUndone (query) {
    return request ({
      url: '/production/undone',
      method: 'get',
      params: query,
    });
  }
  export function productionWaterproof (query) {
    return request ({
      url: '/production/waterproof',
      method: 'get',
      params: query,
    });
  }
  