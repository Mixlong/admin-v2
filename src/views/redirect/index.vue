<template>
  <div class="redirect-container">
    <el-result icon="info" title="页面跳转中..." subTitle="请稍候...">
      <template slot="extra">
        <el-button type="primary" @click="handleBack">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script>
export default {
  created() {
    const { name, id } = this.$route.query;
    
    console.log('=== Redirect 组件 ===');
    console.log('目标页面 name:', name);
    console.log('参数 id:', id);
    
    if (!name) {
      this.$message.error('缺少跳转目标页面参数');
      this.handleBack();
      return;
    }

    // 构建跳转路由
    const routeConfig = {
      name: name
    };

    // 如果有 id 参数，添加到 query 中
    if (id) {
      routeConfig.query = { id };
    }

    console.log('路由配置:', routeConfig);

    // 延迟跳转，给用户一个视觉反馈
    setTimeout(() => {
      console.log('开始执行跳转...');
      try {
        const result = this.$router.push(routeConfig);
        // 处理可能返回 Promise 的情况
        if (result && typeof result.catch === 'function') {
          result.catch(err => {
            console.error('跳转失败:', err);
            this.$message.error(`跳转到页面 ${name} 失败，可能该页面不存在`);
            this.handleBack();
          });
        }
      } catch (err) {
        console.error('跳转异常:', err);
        this.$message.error(`跳转到页面 ${name} 失败，可能该页面不存在`);
        this.handleBack();
      }
    }, 100);
  },
  methods: {
    handleBack() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped lang="scss">
.redirect-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
}
</style>
