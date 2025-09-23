<template>
  <el-dialog title="查看" :visible.sync="visible" width="1000px" append-to-body @close="handleClose" top="0vh">
    <el-descriptions :column="2" border style="margin-bottom: 20px;">
      <el-descriptions-item label="品类">{{ getCategoryName(processRouteData.category) }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ processRouteData.responsiblePerson }}</el-descriptions-item>
    </el-descriptions>

    <el-table :data="processRouteData.detailList" border style="width: 100%">
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column label="工序类型" prop="processType" width="180"  align="center">
        <template slot-scope="scope">
          {{ getProcessTypeName(scope.row.processType) }}
        </template>
      </el-table-column>
      <el-table-column label="换线时间(min)" prop="changeoverTime"   align="center"/>
      <el-table-column label="标准人数" prop="standardPersonnel"  align="center" />
      <el-table-column label="标准产能(PCS/H)" prop="standardCapacity"  align="center"/>
      <el-table-column label="UPPH" prop="unitCapacityPerPerson" align="center" />
      <el-table-column label="人工工时" prop="laborHours"  align="center"/>
    </el-table>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ViewProcessRouteDialog",
  props: {
    open: {
      type: Boolean,
      default: false
    },
    processRoute: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      processRouteData: {},
      // 工序类型选项
      processTypeOptions: [],
      // 品类数据
      categoryData: {
        data: [],
        page: 1,
        more: true
      }
    };
  },
  watch: {
    open(val) {
      this.visible = val;
      if (val) {
        this.processRouteData = JSON.parse(JSON.stringify(this.processRoute));
      }
    }
  },
  created() {
    this.getDicts("sop_process_type").then(response => {
      this.processTypeOptions = response.data;
    });
    this.getCategoryData({ page: 1 });
  },
  methods: {
    // 关闭对话框
    handleClose() {
      this.$emit("close");
    },
    // 获取工序类型名称
    getProcessTypeName(processType) {
      const typeObj = this.processTypeOptions.find(item => parseInt(item.dictValue) === processType);
      return typeObj ? typeObj.dictLabel : '';
    },
    // 获取品类名称
    getCategoryName(categoryId) {
      if (!categoryId || !this.categoryData.data.length) {
        return categoryId || '';
      }
      const category = this.categoryData.data.find(item => item.id === categoryId);
      return category ? category.name : categoryId;
    },
    // 获取品类数据
    getCategoryData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        import('@/api/third/sale').then(({ afterCategoryList }) => {
          afterCategoryList({
            p: page,
            key: keyword
          }).then((res) => {
            if (res.code === 200 && res.data) {
              const { list, total, pageNum, pageSize } = res.data;
              if (more) {
                this.categoryData.data = [...this.categoryData.data, ...list];
              } else {
                this.categoryData.data = list || [];
              }
              this.categoryData.more = pageNum * pageSize < total;
              this.categoryData.page = pageNum;
            } else {
              this.categoryData.data = [];
              this.categoryData.more = false;
            }
            resolve();
          }).catch((error) => {
            console.error('获取品类数据失败:', error);
            this.categoryData.data = [];
            this.categoryData.more = false;
            resolve();
          });
        }).catch((error) => {
          console.error('导入品类API失败:', error);
          this.categoryData.data = [];
          this.categoryData.more = false;
          resolve();
        });
      });
    }
  }
};
</script>