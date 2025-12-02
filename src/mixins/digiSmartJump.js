/**
 * DigiSmart 跳转处理 Mixin
 * 用于处理从 DigiSmart 桌面端应用通过 URL 参数 ?id=xxx 跳转到 Web 页面的场景
 * 自动读取 ID 并执行查询，查询完成后会自动清除 URL 中的 id 参数
 * 
 * 使用场景：
 * - DigiSmart 桌面端点击某条记录，跳转到 Web 系统查看详情
 * - 支持分享链接，打开后自动定位到指定记录
 * - 查询后清理 URL，保持界面整洁
 * 
 * 使用方法：
 * 1. 在组件中引入并混入这个 mixin
 * 2. 确保组件的 queryParams 中有 id 字段
 * 3. 在数据请求成功后调用 this.clearDigiSmartId()
 * 
 * @example
 * import digiSmartJumpMixin from '@/mixins/digiSmartJump'
 * 
 * export default {
 *   mixins: [digiSmartJumpMixin],
 *   data() {
 *     return {
 *       queryParams: {
 *         id: null,
 *         // ... 其他查询参数
 *       }
 *     }
 *   },
 *   methods: {
 *     getList() {
 *       someApi(this.queryParams).then(response => {
 *         // ... 处理数据
 *         this.clearDigiSmartId(); // 查询完成后清除 DigiSmart 跳转 ID
 *       });
 *     }
 *   }
 * }
 */
export default {
  created() {
    // 检查 DigiSmart 跳转参数
    this.initDigiSmartId();
  },
  methods: {
    /**
     * 初始化 DigiSmart 跳转 ID
     * 从 URL 参数中读取 DigiSmart 传递的 id，并赋值给 queryParams.id
     */
    initDigiSmartId() {
      const digiSmartId = this.$route.query.id;
      if (digiSmartId && this.queryParams) {
        this.queryParams.id = digiSmartId;
        console.log('[DigiSmart跳转] 接收到ID:', digiSmartId);
      }
    },
    
    /**
     * 清除 DigiSmart 跳转 ID
     * 在数据查询完成后调用，清理 URL 和 queryParams 中的 id
     * 保持 URL 整洁，避免后续操作受影响
     */
    clearDigiSmartId() {
      if (this.$route.query.id) {
        // 移除 URL 中的 DigiSmart 跳转参数
        try {
          if (this.$router && this.$router.replace) {
            // 统一包 Promise，避免返回 undefined 时直接调用 catch 报错
            Promise.resolve(this.$router.replace({ query: {} })).catch(() => {})
          }
        } catch (err) {
          console.warn('[DigiSmart跳转] 清理URL失败（忽略）:', err)
        }
        // 清空 queryParams 中的 id
        if (this.queryParams) {
          this.queryParams.id = null;
        }
        console.log('[DigiSmart跳转] 已清除跳转ID，恢复正常查询模式');
      }
    }
  }
};
