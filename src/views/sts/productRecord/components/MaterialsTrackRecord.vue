<template>
    <el-dialog 
      title="物料追溯记录" 
      :visible="dialogVisible" 
      @close="handleClose"
      width="80%"
      top="0vh"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">

        <el-table v-loading="loading" :data="brandList" height="400" border>
          <el-table-column label="序号" width="58" type="index" align="center">
            <template slot-scope="scope">
              {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="工单号" prop="orderCode" align="center" />
          <el-table-column label="整机 SN" prop="sn" align="center" />
          <el-table-column label="批次号" prop="batchNumber" align="center" />
          <el-table-column label="绑定时间" prop="createTime" align="center"  />
        </el-table>

        <pagination v-if="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
          @pagination="getList" />
      </div>
    </el-dialog>
  </template>
  
  <script>
  import { categoryComputerDict, partList, partExport } from "@/api/third/fileConfig";
  
  export default {
    name: "MaterialsTrackRecord",
    props: {
      value: {
        type: Boolean,
        default: false
      },
      orderCode: {
        type: String,
        default: ""
      },
      sn: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        // 遮罩层
        loading: false,
        // 总条数
        total: 0,
        brandList: [],
        // 查询参数
        queryParams: {
          p: 1,
          l: 20,
          sn: "",
          orderCode: "",
        },
      };
    },
    computed: {
      dialogVisible: {
        get() {
          return this.value;
        },
        set(val) {
          this.$emit('input', val);
        }
      }
    },
    watch: {
      value(newVal) {
        if (newVal) {
          this.initData();
        }
      }
    },
    methods: {
      // 初始化数据
      initData() {
        this.queryParams.sn = this.sn;
        this.queryParams.p = 1;
        this.getList();
      },
      /** 查询列表 */
      getList() {
        if (!this.orderCode && !this.sn) {
          return;
        }
        this.loading = true;
        partList(this.queryParams).then((response) => {
          this.brandList = response.data.list || [];
          this.total = response.data.total || 0;
          this.loading = false;
        }).catch(() => {
          this.loading = false;
          this.brandList = [];
          this.total = 0;
        });
      },
      // 关闭弹框
      handleClose() {
        this.dialogVisible = false;
      },
      /** 导出按钮操作 */
      handleExport() {
        this.$modal.confirm('是否确认导出物料追溯记录数据?').then(() => {
          this.loading = true;
          return partExport(this.queryParams);
        }).then(response => {
          if (response.code === 200 && response.msg) {
            this.download(response.msg);
          }
          this.loading = false;
        }).catch(() => {
          this.loading = false;
        });
      }
    },
  };
  </script>

  <style lang="scss" scoped>
  .dialog-content {
    .info-section {
      background: #f5f7fa;
      padding: 16px;
      margin-bottom: 16px;
      border-radius: 4px;
      
      .info-label {
        font-weight: bold;
        color: #606266;
      }
      
      .info-value {
        color: #303133;
        margin-left: 8px;
      }
    }
  }
  
  .dialog-footer {
    text-align: right;
  }
  </style>