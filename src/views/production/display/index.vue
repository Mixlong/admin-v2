<template>
  <div class="production-display-container app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm 
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch" 
      @reset="handleReset"
      :default-visible-count="4"
      @field-change="handleFieldChange">
      
      <!-- 自定义所属品类字段渲染 -->
      <template #field-orderNo="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <select-loadMore v-model="queryParams.orderNo" :data="salesOrderNoData.data" :page="salesOrderNoData.page"
                :hasMore="salesOrderNoData.more" allow-create dictLabel="salesOrderNo" dictValue="salesOrderNo"
                :request="getSalesOrderNoData"  @getChange="handleSearch" />
        </el-form-item>
      </template>

      <!-- 自定义仪表型号字段渲染 -->
      <template #field-computerId="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select 
            v-model="searchForm[field.key]" 
            :loading="isCLoading" 
            filterable 
            remote 
            clearable 
            @change="handleSearch"
            :remote-method="getComputerNameList" 
            style="width: 140px" 
            size="mini" 
            placeholder="请先选择">
            <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
          </el-select>
        </el-form-item>
      </template>


      <!-- 自定义生产日期字段渲染 -->
      <template #field-dateRange="{ field }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-date-picker 
            v-model="dateRange" 
            style="width: 250px" 
            value-format="timestamp" 
            type="daterange"
            range-separator="-" 
            start-placeholder="开始日期" 
            end-placeholder="结束日期" 
            @change="handleQuery"
            size="mini">
          </el-date-picker>
        </el-form-item>
      </template>
    </IntelligentSearchForm>

    <!-- 生产数据表格 -->
    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%" :height="tableHeight()">
        <el-table-column label="生产日期" align="center" width="110">
          <template slot-scope="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="computerName" label="仪表型号" align="center" min-width="150"/>
        <el-table-column prop="salesOrderNo" label="迪太订单号" align="center" width="140"/>
        <el-table-column prop="orderCode" label="工单号" align="center" width="140"/>
        <el-table-column prop="num" label="生产数量" align="center" width="100">
          <template slot-scope="scope">
            <strong 
              style="cursor: pointer; color: #409EFF; text-decoration: underline; font-size: 15px; font-weight: 700;"
              @click="handleQuantityClick(scope.row)"
            >
              {{ scope.row.num }}
            </strong>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="生产地点" align="center" width="100"/>
        
        <!-- 测试环节分组列 -->
        <el-table-column label="测试" align="center">
          <el-table-column label="IQC" align="center" width="80">
            <template slot-scope="scope">
              <strong style="font-size: 15px; font-weight: 700;">{{ scope.row.iqcNum }}</strong>
            </template>
          </el-table-column>
          
          <el-table-column label="FQC" align="center" width="80">
            <template slot-scope="scope">
              <strong style="font-size: 15px; font-weight: 700;">{{ scope.row.fqcNum }}</strong>
            </template>
          </el-table-column>
          
          <el-table-column label="防水" align="center" width="80">
            <template slot-scope="scope">
              <strong style="font-size: 15px; font-weight: 700;">{{ scope.row.fsNum }}</strong>
            </template>
          </el-table-column>
          
          <el-table-column label="配置工位" align="center" width="90">
            <template slot-scope="scope">
              <strong style="font-size: 15px; font-weight: 700;">{{ scope.row.dcdNum }}</strong>
            </template>
          </el-table-column>
        </el-table-column>
        
        <!-- 包装列（独立，显示订单详情） -->
        <el-table-column label="包装" align="center" min-width="200">
          <template slot-scope="scope">
            <div v-if="scope.row.packagingDataList && scope.row.packagingDataList.length > 0" style="padding: 5px 0;">
              <div 
                v-for="(item, index) in scope.row.packagingDataList" 
                :key="index"
              >
                <div style="display: flex; justify-content: center; align-items: center;">
                  <div>
                    <div>{{ item.packagingNum }}</div>
                  </div>
                </div>
                 <div v-if="index !== scope.row.packagingDataList.length - 1" style="width: 100%; height: 1px; background-color: #EBEEF5;"></div>
              </div>
              
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.p"
        :limit.sync="queryParams.l"
        @pagination="getList"
      />
    </div>

    <!-- 排产详情弹窗 -->
    <el-dialog
      title="排产详情"
      :visible.sync="schedulingDialogVisible"
      width="80%"
      top="0"
      :before-close="handleCloseSchedulingDialog">
      <el-table
        :data="schedulingTableData"
        v-loading="schedulingLoading"
        border
        stripe
        style="width: 100%"
        max-height="400">
        <el-table-column prop="orderCode" label="工单号" align="center" />
        <el-table-column prop="customerName" label="客户名称" align="center" />
        <el-table-column prop="num" label="订单数量" align="center">
          <template slot-scope="scope">
            <strong>{{ scope.row.num }}</strong>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <pagination
        v-show="schedulingTotal > 0"
        :total="schedulingTotal"
        :page.sync="schedulingQueryParams.pageNum"
        :limit.sync="schedulingQueryParams.pageSize"
        @pagination="getSchedulingList"
        style="margin-top: 15px;"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getProductionMaterialList } from '@/api/production/display'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import { computerNameList, categoryComputerDict } from '@/api/third/fileConfig'
import Pagination from '@/components/Pagination'
import {
  schedulingList
} from "@/api/www/planSchedule";
import { getMaterialList } from '@/api/third/prodData'
export default {
  name: 'ProductionDisplay',
  components: {
    IntelligentSearchForm,
    Pagination
  },
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      searchForm: {
        categoryId: '',
        computerId: '',
        salesOrderNo: '',
        no: ''
      },
      searchFields: [
        {
          key: 'orderCode',
          label: '工单号',
          component: 'el-input',
          sort: 1
        },
        {
          key: 'computerId',
          label: '型号',
          component: 'el-select',
          sort: 3
        },
        {
          key: 'orderNo',
          label: '订单号',
          component: 'el-select',
          sort: 2
        },
        {
          key: 'dateRange',
          label: '生产日期',
          component: 'el-date-picker',
          sort: 4
        }
      ],
      salesOrderNoData: {
        data: [],
        page: 1,
        more: true,
      },
      // 排产弹窗相关数据
      schedulingDialogVisible: false,
      schedulingLoading: false,
      schedulingTableData: [],
      schedulingTotal: 0,
      schedulingQueryParams: {
        pageNum: 1,
        pageSize: 10,
        orderCode: ''
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryId: '',
        computerId: '',
        date: '',
        orderNo: '',
        process: '组装',
        address: ''
      },
      // 日期范围
      dateRange: [],
      // 字典数据
      dictList: [],
      categoryOptions: [],
      computerOptions: [],
      isCLoading: false
    }
  },
  mounted() {
    // 设置日期默认值为昨天到明天
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    this.dateRange = [yesterday.getTime(), tomorrow.getTime()];
    
    // 设置日期后查询数据
    this.getList();
    this.getCategoryComputerData().then(() => {
    });
  },
  methods: {
    // 获取品类和型号字典数据
    getCategoryComputerData() {
      return new Promise((resolve, reject) => {
        categoryComputerDict().then((res) => {
          this.dictList = res.data;
          this.categoryOptions = res.data || [];
          resolve();
        }).catch(reject);
      });
    },
    
    // 品类变更处理
    changeCategory(val) {
      if (!val) return;
      this.searchForm.computerId = "";
      return new Promise((resolve) => {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === val
        )[0]?.computerList || [];
        resolve();
      });
    },
    
    // 远程搜索型号
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = false;
        computerNameList({
          name,
          categoryId: this.searchForm.categoryId,
        }).then((res) => {
          this.computerOptions = res.data || [];
        });
      } else {
        this.computerOptions = [];
      }
    },
    // 迪太订单号
    getSalesOrderNoData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        schedulingList({
          p: page,
          productStatus: 0,
          salesOrderNo: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.salesOrderNoData.data = [...this.salesOrderNoData.data, ...list];
          } else {
            this.salesOrderNoData.data = list;
          }
          this.salesOrderNoData.more = pageNum * pageSize < total;
          this.salesOrderNoData.page = pageNum;
          resolve();
        });
      });
    },
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return '--';
      const date = new Date(timestamp);
      return date.toLocaleDateString('zh-CN');
    },

    // 获取文件状态
    getFileStatus(list, typeKey) {
      if (!list || !Array.isArray(list)) return false;
      const file = list.find(item => item.typeKey === typeKey);
      return file ? file.status === 1 : false;
    },

    // 获取文件值
    getFileValue(list, typeKey) {
      if (!list || !Array.isArray(list)) return '--';
      const file = list.find(item => item.typeKey === typeKey);
      return file ? (file.value || '--') : '--';
    },

    // 计算整体状态
    calculateOverallStatus(list) {
      if (!list || !Array.isArray(list)) return 'pending';
      const fileTypes = ['oqc_tool_soft', 'config_file', 'ui_data', 'pack_file'];
      const completedCount = fileTypes.filter(type => 
        this.getFileStatus(list, type)
      ).length;
      
      if (completedCount === fileTypes.length) return 'completed';
      if (completedCount > 0) return 'in-progress';
      return 'pending';
    },

    // 计算完成率
    calculateCompletionRate(list) {
      if (!list || !Array.isArray(list)) return '0%';
      const fileTypes = ['oqc_tool_soft', 'config_file', 'ui_data', 'pack_file'];
      const completedCount = fileTypes.filter(type => 
        this.getFileStatus(list, type)
      ).length;
      
      return Math.round((completedCount / fileTypes.length) * 100) + '%';
    },

    // 检查数量是否完成（数量大于0表示已完成）
    checkQuantityCompleted(quantity) {
      return quantity != null && quantity > 0;
    },

    // 格式化数量显示
    formatQuantity(quantity) {
      if (quantity == null) return '--';
      return quantity.toString();
    },

    // 根据数量计算整体状态
    calculateOverallStatusByQuantity(item) {
      const quantities = [
        item.oqcNum,
        item.dcdNum,
        item.fsNum,
        item.bzNum
      ];
      
      const completedCount = quantities.filter(qty => qty != null && qty > 0).length;
      const totalCount = quantities.length;
      
      if (completedCount === totalCount) return 'completed';
      if (completedCount > 0) return 'in-progress';
      return 'pending';
    },

    // 根据数量计算完成率
    calculateCompletionRateByQuantity(item) {
      const quantities = [
        item.oqcNum,
        item.dcdNum,
        item.fsNum,
        item.bzNum
      ];
      
      const completedCount = quantities.filter(qty => qty != null && qty > 0).length;
      const totalCount = quantities.length;
      
      return Math.round((completedCount / totalCount) * 100) + '%';
    },

    // 添加日期范围到查询参数
    addDateRange(params, dateRange, options = {}) {
      const result = { ...params };
      if (dateRange && dateRange.length === 2) {
        result[options.begin || 'startDate'] = dateRange[0];
        result[options.end || 'endDate'] = dateRange[1];
      }
      return result;
    },
    
    // 获取数据列表
    getList() {
      this.loading = true;
      
      // 添加日期范围
      const params = this.addDateRange(this.queryParams, this.dateRange, {
        begin: "startTime",
        end: "endTime",
      });
      
      // 过滤空值参数
      const filteredParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          filteredParams[key] = params[key];
        }
      });
      
      getProductionMaterialList(filteredParams)
        .then((response) => {
          // 映射数据到表格格式
          this.tableData =response.data.list || [];
          this.total = response.data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 智能搜索表单提交处理
    handleSearch() {
      console.log('搜索数据:', this.searchForm);
      this.queryParams={...this.queryParams,...this.searchForm}
      this.getList();
    },

    // 重置搜索表单
    handleReset() {
      console.log('重置搜索表单');
      this.searchForm = {
        categoryId: '',
        computerId: '',
        salesOrderNo: '',
        no: ''
      };
      this.dateRange = [];
      this.queryParams = {
        p: 1,
        l: 20,
        categoryId: '',
        computerId: '',
        date: '',
        orderNo: '',
        process: '组装',
        address: ''
      };
      this.getList();
    },

    // 字段变更处理
    handleFieldChange(field, value) {
      console.log('字段变更:', field, value);
      if (field === 'categoryId') {
        this.changeCategory(value);
      }
    },

    // 查询处理
    handleQuery() {
      this.handleSearch(this.searchForm);
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      const statusMap = {
        'completed': 'success',
        'in-progress': 'warning',
        'pending': 'info'
      };
      return statusMap[status] || 'info';
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'completed': '已完成',
        'in-progress': '进行中',
        'pending': '待开始'
      };
      return statusMap[status] || '待开始';
    },

    // 处理生产数量点击事件
    handleQuantityClick(row) {
      if (!row.orderCode) {
        this.$message.warning('工单号不存在');
        return;
      }
      
      // 重置分页参数
      this.schedulingQueryParams.pageNum = 1;
      this.schedulingQueryParams.orderCode = row.orderCode;
      
      this.schedulingDialogVisible = true;
      this.getSchedulingData();
    },

    // 获取排产数据
    getSchedulingData() {
      this.schedulingLoading = true;
      
      const params = {
        orderCode: this.schedulingQueryParams.orderCode,
        p: this.schedulingQueryParams.pageNum,
        l: this.schedulingQueryParams.pageSize
      };
      
      getMaterialList(params)
        .then(response => {
          if (response.code === 200) {
            // 根据实际API响应结构处理数据
            const data = response.data;
            if (data) {
              this.schedulingTableData = data.list || [];
              this.schedulingTotal = data.total || 0;
              
              if (this.schedulingTableData.length === 0) {
                this.$message.info('暂无排产数据');
              }
            } else {
              this.schedulingTableData = [];
              this.schedulingTotal = 0;
            }
          }
        })
        .finally(() => {
          this.schedulingLoading = false;
        });
    },

    // 排产列表分页处理
    getSchedulingList() {
      this.getSchedulingData();
    },

    // 关闭排产弹窗
    handleCloseSchedulingDialog() {
      this.schedulingDialogVisible = false;
      this.schedulingTableData = [];
      this.schedulingTotal = 0;
      this.schedulingQueryParams = {
        pageNum: 1,
        pageSize: 10,
        orderCode: ''
      };
    },

    // 获取排产状态标签类型
    getSchedulingStatusType(status) {
      const statusMap = {
        '0': 'info',     // 待开始
        '1': 'warning',  // 进行中
        '2': 'success',  // 已完成
        '3': 'danger'    // 已取消
      };
      return statusMap[status] || 'info';
    },

    // 获取排产状态文本
    getSchedulingStatusText(status) {
      const statusMap = {
        '0': '待开始',
        '1': '进行中', 
        '2': '已完成',
        '3': '已取消'
      };
      return statusMap[status] || '待开始';
    }
  }
}
</script>

<style scoped>


</style>
