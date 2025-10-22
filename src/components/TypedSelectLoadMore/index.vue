<template>
  <select-loadMore
    v-model="internalValue"
    :data="componentData.data"
    :page="componentData.page"
    :hasMore="componentData.more"
    :dictLabel="computedDictLabel"
    :dictValue="computedDictValue"
    :request="handleRequest"
    :placeholder="placeholder"
    :style="customStyle"
    :size="size"
    :clearable="clearable"
    @change="handleChange"
  />
</template>

<script>
export default {
  name: 'TypedSelectLoadMore',
  props: {
    // v-model 绑定值
    value: {
      type: [String, Number],
      default: ''
    },
    // 选择器类型：category（仪表型号）、user（用户）、customer（客户）
    // 如果传入了 dictLabel 和 dictValue，则 type 可以为任意字符串
    type: {
      type: String,
      required: false,
      default: 'custom'
    },
    // 占位符文本
    placeholder: {
      type: String,
      default: '请选择'
    },
    // 自定义样式
    customStyle: {
      type: [String, Object],
      default: 'width: 150px'
    },
    // 尺寸
    size: {
      type: String,
      default: 'mini'
    },
    // 是否可清空
    clearable: {
      type: Boolean,
      default: false
    },
    // 自定义字典标签字段（可选，会覆盖默认配置）
    dictLabel: {
      type: String,
      default: ''
    },
    // 自定义字典值字段（可选，会覆盖默认配置）
    dictValue: {
      type: String,
      default: ''
    },
    // 是否返回 label 而不是 value（用于需要返回名称而不是ID的场景）
    returnLabel: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      componentData: {
        data: [],
        page: 1,
        more: true
      }
    };
  },
  computed: {
    // 内部值，用于双向绑定
    internalValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    },
    // 根据类型配置
    typeConfig() {
      const configs = {
        category: {
          dictLabel: 'name',
          dictValue: 'id',
          placeholder: '请选择仪表型号'
        },
        user: {
          dictLabel: 'displayName',
          dictValue: 'userName',
          placeholder: '请选择负责人'
        },
        customer: {
          dictLabel: 'name',
          dictValue: 'id',
          placeholder: '请选择客户'
        }
      };
      return configs[this.type] || {};
    },
    // 计算后的字典标签字段
    computedDictLabel() {
      // 优先使用传入的 prop，其次使用类型配置，最后默认为 'label'
      return this.dictLabel || this.typeConfig.dictLabel || 'label';
    },
    // 计算后的字典值字段
    computedDictValue() {
      // 如果设置了 returnLabel，则返回 label 字段
      if (this.returnLabel) {
        return this.dictLabel || this.typeConfig.dictLabel || 'label';
      }
      // 优先使用传入的 prop，其次使用类型配置，最后默认为 'value'
      return this.dictValue || this.typeConfig.dictValue || 'value';
    },
    // 计算后的占位符
    computedPlaceholder() {
      return this.placeholder || this.typeConfig.placeholder;
    }
  },
  created() {
    // 初始化数据
    this.loadData({ page: 1 });
  },
  methods: {
    // 处理请求
    handleRequest(params) {
      return this.loadData(params);
    },
    
    // 根据类型加载数据
    async loadData({ page = 1, more = false, keyword = "" } = {}) {
      try {
        if (this.type === 'category') {
          await this.getCategoryData({ page, more, keyword });
        } else if (this.type === 'user') {
          await this.getUserData({ page, more, keyword });
        } else if (this.type === 'customer') {
          await this.getCustomerData({ page, more, keyword });
        }
      } catch (error) {
        console.error(`加载${this.type}数据失败:`, error);
      }
    },
    
    // 获取品类数据
    async getCategoryData({ page = 1, more = false, keyword = "" } = {}) {
      const { listCategory } = await import('@/api/third/category.js');
      return new Promise((resolve) => {
        listCategory({
          p: page,
          key: keyword
        }).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total, pageNum, pageSize } = res.data;
            if (more) {
              this.componentData.data = [...this.componentData.data, ...list];
            } else {
              this.componentData.data = list || [];
            }
            this.componentData.more = pageNum * pageSize < total;
            this.componentData.page = pageNum;
          } else {
            this.componentData.data = [];
            this.componentData.more = false;
          }
          resolve();
        }).catch((error) => {
          console.error('获取品类数据失败:', error);
          this.componentData.data = [];
          this.componentData.more = false;
          resolve();
        });
      });
    },
    
    // 获取用户数据
    async getUserData({ page = 1, more = false, keyword = "" } = {}) {
      const { dictUserList } = await import('@/api/system/user');
      
      return new Promise((resolve) => {
        dictUserList({
          p: page,
          pageSize: 20,
          nickName: keyword,
        }).then((res) => {
          if (res && res.data) {
            let list = res.data.map(user => ({
              id: user.id,
              userName: user.userName,
              displayName: user.nickName || user.userName
            }));

            // 去重处理
            const uniqueUsers = [];
            const userNameSet = new Set();
            list.forEach(user => {
              if (!userNameSet.has(user.userName)) {
                userNameSet.add(user.userName);
                uniqueUsers.push(user);
              }
            });

            if (more) {
              this.componentData.data = [...this.componentData.data, ...uniqueUsers];
            } else {
              this.componentData.data = uniqueUsers;
            }

            // 计算是否还有更多数据
            this.componentData.more = uniqueUsers.length >= 20;
            this.componentData.page = page;
          } else {
            console.error('获取用户数据失败:', res?.msg);
            this.componentData.data = [];
            this.componentData.more = false;
          }
          resolve();
        }).catch((error) => {
          console.error('获取用户数据失败:', error);
          this.componentData.data = [];
          this.componentData.more = false;
          resolve();
        });
      });
    },
    
    // 获取客户数据
    async getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      // 使用与contact页面相同的客户API
      const { getCustomerList } = await import('@/api/order');
      
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword
        }).then((res) => {
          // 直接使用res.data，与contact页面保持一致
          if (res && res.data) {
            const { list, total, pageNum, pageSize } = res.data;
            // 过滤启用状态的客户
            const filteredList = list.filter((item) => item.status === 0);

            if (more) {
              this.componentData.data = [...this.componentData.data, ...filteredList];
            } else {
              this.componentData.data = filteredList;
            }

            // 计算是否还有更多数据
            this.componentData.page = pageNum;
            this.componentData.more = this.componentData.data.length < total;
          } else {
            console.error('获取客户数据失败: 响应数据格式错误');
            this.componentData.data = [];
            this.componentData.more = false;
          }
          resolve();
        }).catch((error) => {
          console.error('获取客户数据失败:', error);
          this.componentData.data = [];
          this.componentData.more = false;
          resolve();
        });
      });
    },

    // 处理值变化
    handleChange(value) {
      this.$emit('change', value);
    }
  }
};
</script>
