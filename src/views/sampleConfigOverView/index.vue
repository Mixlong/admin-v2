<template>
  <div class="app-container">
    <AllPramsConfig
      ref="allPramsConfig"
      @handle-add="handleAdd"
      @handle-update="handleUpdate"
    />
    <CompUpdate ref="compUpdate" @refresh-list="handleRefreshList" />
    <!-- <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="总配置项" name="first">
        <AllPramsConfig />
      </el-tab-pane>
      <el-tab-pane label="型号名称" name="second">
        <SingleParamsConfig />
      </el-tab-pane>
    </el-tabs> -->
  </div>
</template>

<script>
import AllPramsConfig from './components/allPramsConfig.vue';
import CompUpdate from '../third/sampleProductFamily/components/updates';
import { detailSampleComputer } from '@/api/third/sampleProductFamily';

export default {
  name: "ConfigOverview",
  components: {
    AllPramsConfig,
    CompUpdate,
  },
  data() {
    return {
      activeName: 'first',
    }
  },
  methods: {
    handleAdd() {
      const allPramsConfigRef = this.$refs.allPramsConfig;
      const categoryId = allPramsConfigRef?.queryParams?.categoryId;

      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form.categoryId = categoryId;
      this.$refs.compUpdate.title = "添加子产品";
      this.$refs.compUpdate.isCopyProduct = true;
    },
    handleUpdate(row) {
      this.$refs.compUpdate.reset();

      detailSampleComputer(row.computerId).then((res) => {
        const { data } = res;
        data.instrumentModel = data.instrumentModel ? data.instrumentModel : {};
        this.$refs.compUpdate.dialogVisible = true;
        this.$refs.compUpdate.disabled = true;
        this.$refs.compUpdate.isCopyProduct = false;
        this.$refs.compUpdate.form = Object.assign({}, data);
        this.$refs.compUpdate.title = "修改子产品";
      });
    },
    handleRefreshList() {
      this.$refs.allPramsConfig?.getList();
    },
  },
};
</script>
