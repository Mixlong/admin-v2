<template>
  <div class="app-container process-route">
    <div :gutter="10"  >
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="仪表型号" prop="category" label-width="80px">
            <TypedSelectLoadMore
              v-model="queryParams.category"
              type="category"
              customStyle="width: 150px"
              size="mini"
              @change="handleCategoryChange"
            />
          </el-form-item>
          <el-form-item label="版本号" prop="versionCode">
            <select-loadMore
              v-model="queryParams.versionCode"
              :data="versionData.data"
              :page="versionData.page"
              :hasMore="versionData.more"
              dictLabel="versionCode"
              dictValue="id"
              :request="getVersionData"
              placeholder="请选择"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="负责人" prop="responsiblePerson">
            <TypedSelectLoadMore
              v-model="queryParams.responsiblePerson"
              type="user"
              customStyle="width: 150px"
              size="mini"
              clearable
              @change="handleQuery"
            />
          </el-form-item>
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="queryParams.remarks"
              placeholder="请输入备注"
              clearable
              size="mini"
              style="width: 200px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
    
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
          <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          class="fr"
          @click="handleAdd"
          v-hasPermi="['base:processRoute:add']"
        >新增</el-button>
        </el-form>
   
    </div>

    <div class="table-section">
      <el-table 
        ref="table"
        v-loading="loading" 
        :data="routeList" 
        @selection-change="handleSelectionChange" 
        border 
        style="width: 100%" 
        :height="tableHeight(180)"
        row-key="id"
        :row-class-name="getRowClassName"
        @sort-change="handleSortChange">
        
        <!-- 仪表型号 -->
        <el-table-column label="序号" width="58" type="index" align="center">
            <template slot-scope="scope">      
              {{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
        <el-table-column label="仪表型号" align="center" prop="categoryName" width="100" />
        <el-table-column label="版本号" align="center" prop="versionCode" width="120" />
        <!-- 动态生成工序类型分组 -->
        <el-table-column 
          v-for="processType in processTypeOptions" 
          :key="processType.dictValue"
     
          :label="processType.dictLabel" 
          align="center">
          <el-table-column label="标准人数" align="center" width="90" min-width="90">
            <template slot-scope="scope">
              {{ scope.row[`${processType.dictValue}StandardPeople`] || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="标准产能（PCS/H）" align="center" width="95">
            <template slot-scope="scope">
              {{ scope.row[`${processType.dictValue}StandardCapacity`] || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="UPPH" align="center" width="80" min-width="80">
            <template slot-scope="scope">
              {{ scope.row[`${processType.dictValue}Upph`] || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="人工工时" align="center" width="90" min-width="90">
            <template slot-scope="scope">
              {{ scope.row[`${processType.dictValue}ManHours`] || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="换线时间 （min）" align="center" width="90" min-width="90">
            <template slot-scope="scope">
              {{ scope.row[`${processType.dictValue}ChangeoverTime`] || '-' }}
            </template>
          </el-table-column>
          <!-- 组测工序类型额外显示爬坡相关字段 -->
          <template v-if="processType.dictValue === 'assembly'">
            <el-table-column label="爬坡产能（每日递增）" align="center" prop="rampUpCapacity" width="140" />
            <el-table-column label="爬坡时间" align="center" prop="rampUpTime" width="100" />
          </template>
        </el-table-column>
        
        <!-- 制定日期 -->
        <el-table-column label="制定日期" align="center" prop="createTime" width="100">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        
        <!-- 更新日期 -->
        <el-table-column label="更新日期" align="center" prop="updateTime" width="100">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        
        <!-- 责任人 -->
        <el-table-column label="责任人" align="center" prop="responsiblePerson" width="100" />
        
        <!-- 备注 -->
        <el-table-column label="备注" align="center" prop="remarks" width="150" show-overflow-tooltip />
        
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180" fixed="right">
          <template slot-scope="scope">
 
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="handleView(scope.row)"
              v-hasPermi="['base:processRoute:query']"
            >查看</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['base:processRoute:edit']"
            >编辑</el-button>
            <el-button
              v-if="!scope.row.sopId"
              size="mini"
              type="text"
              icon="el-icon-finished"
              @click="handleSopAssociation(scope.row)"
            >关联SOP</el-button>
            <el-button
              v-else
              size="mini"
              type="text"
              icon="el-icon-close"
              class="text-red"
              @click="handleSopUnbind(scope.row)"
            >取消关联</el-button>
            <el-button
              size="mini"
              type="text"
              class="text-red"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['base:processRoute:remove']"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改工艺路线对话框 -->
    <ProcessRouteDialog
      :title="title"
      :open="open"
      :processRoute="form"
      @close="cancel"
      @submit="submitForm"
    />

    <!-- 查看工艺路线对话框 -->
    <ViewProcessRouteDialog
      :open="openView"
      :processRoute="form"
      @close="closeView"
    />

    <!-- SOP关联对话框 -->
    <el-dialog title="关联SOP" custom-class="sop-dialog" :visible.sync="openSopDialog" center width="1000px" :close-on-click-modal="false" top="0vh">
      <div class="sop-dialog-content">
        <el-table
          ref="sopTable"
          v-loading="sopLoading"
          :data="sopList"
          border
          style="width: 100%"
          height="500px"
        >
          <el-table-column label="SOP名称" align="center" prop="categoryName" />
          <el-table-column label="版本编号" align="center" prop="versionCode" />
          <el-table-column label="描述" align="center" prop="desc" width="200" show-overflow-tooltip />
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template slot-scope="scope">
              {{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="80">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                @click="handleDirectBind(scope.row)"
              >关联</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <pagination
          v-show="sopTotal > 0"
          :total="sopTotal"
          :page.sync="sopQueryParams.pageNum"
          :limit.sync="sopQueryParams.pageSize"
          @pagination="getSopList"
        />
      </div>
      

    </el-dialog>

  </div>
</template>

<script>
import { listProcessRoute, getProcessRoute, delProcessRoute, updateProcessRoute } from "@/api/base/processRoute";
import { getDicts } from '@/api/system/dict/data';
import ProcessRouteDialog from './components/ProcessRouteDialog';
import ViewProcessRouteDialog from './components/ViewProcessRouteDialog';
import TypedSelectLoadMore from '@/components/TypedSelectLoadMore';
import { sopList } from "@/api/third/testApi";
export default {
  name: "ProcessRoute",
  components: {
    ProcessRouteDialog,
    ViewProcessRouteDialog,
    TypedSelectLoadMore
  },
  data() {
    return {
            // 品类数据
            categoryData: {
        data: [],
        page: 1,
        more: true
      },
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 工艺路线表格数据
      routeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示查看弹出层
      openView: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        category: null,
        responsiblePerson: null,
        versionCode: null,
        remarks: null,
        orderByColumn: null,
        isAsc: null
      },
      // 表单参数
      form: {},
      // 工序类型字典数据
      processTypeOptions: [],
      // 版本号数据
      versionData: {
        data: [],
        page: 1,
        more: true
      },
      // SOP关联对话框相关
      openSopDialog: false,
      sopLoading: false,
      sopList: [],
      sopTotal: 0,
      currentRow: null,
      sopQueryParams: {
        pageNum: 1,
        pageSize: 20,
        categoryId: null
      }
    };
  },
  created() {
    this.getList();
    this.loadProcessTypeDict();
  },
  methods: {
    /** 查询工艺路线列表 */
    getList() {
      this.loading = true;
      // 构建分页参数，确保参数名称正确
      const params = {
        ...this.queryParams,
        p: this.queryParams.pageNum,
        l: this.queryParams.pageSize
      };
      listProcessRoute(params).then(response => {
        // 处理返回的数据，将detailList中的数据映射到对应的工序类型列
        const processedList = response.data.list.map(route => {
          // 复制基础数据
          const processedRoute = { ...route };
          
          // 遍历detailList，将每个工序的数据映射到对应的列
          if (route.detailList && route.detailList.length > 0) {
            route.detailList.forEach(detail => {
              const processTypeValue = detail.processType;
              // 根据processType映射到对应的列
              processedRoute[`${processTypeValue}StandardPeople`] = detail.standardPersonnel;
              processedRoute[`${processTypeValue}StandardCapacity`] = detail.standardCapacity;
              processedRoute[`${processTypeValue}Upph`] = detail.unitCapacityPerPerson;
              processedRoute[`${processTypeValue}ManHours`] = detail.laborHours;
              processedRoute[`${processTypeValue}ChangeoverTime`] = detail.changeoverTime;
            });
          }
          
          return processedRoute;
        });
        
        this.routeList = processedList;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    
    /** 加载工序类型字典数据 */
    loadProcessTypeDict() {
      getDicts('sop_process_type').then(res => {
        // 按 dictSort 排序，小的在前面
        const sortedData = (res.data || []).sort((a, b) => {
          const sortA = parseInt(a.dictSort) || 0;
          const sortB = parseInt(b.dictSort) || 0;
          return sortA - sortB;
        });
        this.processTypeOptions = sortedData;
      }).catch(() => {
        console.error('获取工序类型字典失败');
        this.processTypeOptions = [];
      });
    },

    /** 处理仪表型号变化 */
    handleCategoryChange(categoryId) {
      // 清空版本号选择
      this.queryParams.versionCode = null;
      // 清空版本号数据
      this.versionData = {
        data: [],
        page: 1,
        more: true
      };
      
      // 如果选择了仪表型号，则获取对应的版本号列表
      if (categoryId) {
        this.getVersionData({ page: 1, categoryId });
      }
      
      // 执行查询
      this.handleQuery();
    },

    /** 获取版本号数据 */
    getVersionData({ page = 1, more = false, keyword = "", categoryId = null } = {}) {
      return new Promise((resolve) => {
        // 使用当前选中的仪表型号或传入的categoryId
        const currentCategoryId = categoryId || this.queryParams.category;
        
        if (!currentCategoryId) {
          this.versionData.data = [];
          this.versionData.more = false;
          resolve();
          return;
        }

        // 调用版本号接口
        import('@/utils/request').then(({ default: request }) => {
          request({
            url: '/order/stationPlan/versionList',
            method: 'get',
            params: {
              p: page,
              pageSize: 20,
              categoryId: currentCategoryId,
              keyword: keyword
            }
          }).then((res) => {
            if (res.code === 200 && res.data) {
            
              const processedList = (res.data || []).map(item => ({
                id: item.id || item.versionCode,
                versionCode: item.versionCode || item.name
              }));
              
              if (more) {
                this.versionData.data = [...this.versionData.data, ...processedList];
              } else {
                this.versionData.data = processedList;
              }
 
            } else {
              this.versionData.data = [];
              this.versionData.more = false;
            }
            resolve();
          }).catch((error) => {
            console.error('获取版本号数据失败:', error);
            this.versionData.data = [];
            this.versionData.more = false;
            resolve();
          });
        }).catch((error) => {
          console.error('导入request失败:', error);
          this.versionData.data = [];
          this.versionData.more = false;
          resolve();
        });
      });
    },
    
    /** 获取行样式 */
    getRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 === 0) {
        return 'even-row';
      } else {
        return 'odd-row';
      }
    },
    
    /** 排序变化处理 */
    handleSortChange(column) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order === 'ascending' ? 'asc' : 'desc';
      this.getList();
    },
    
 
    
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 关闭查看对话框
    closeView() {
      this.openView = false;
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        category: null,
        categoryCode: null,
        model: null,
        responsiblePerson: null,
        sopId: null,
        detailList: []
      };
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getProcessRoute(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 查看按钮操作 */
    handleView(row) {
      this.reset();
      const id = row.id;
      getProcessRoute(id).then(response => {
        this.form = response.data;
        this.openView = true;
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.open = false;
      this.$modal.msgSuccess("操作成功");
      this.getList();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除型号为"' + row.categoryName + '"的数据项?').then(function() {
        return delProcessRoute(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    
    /** SOP关联按钮操作 */
    handleSopAssociation(row) {
      this.currentRow = row;
      this.sopQueryParams.categoryId = row.category;
      this.sopQueryParams.pageNum = 1;
      this.openSopDialog = true;
      this.getSopList();
    },
    
    /** 直接绑定SOP */
    handleDirectBind(sop) {
      // 直接绑定，无需确认
      this.bindSop(this.currentRow.id, sop.id, sop);
      this.cancelSopDialog();
    },
    
    /** 获取SOP列表 */
    getSopList() {
      this.sopLoading = true;
      const params = {
        p: this.sopQueryParams.pageNum,
        l: this.sopQueryParams.pageSize,
        categoryId: this.sopQueryParams.categoryId
      };
      
      sopList(params).then(response => {
        if (response.code === 200 && response.data) {
          this.sopList = response.data.list || [];
          this.sopTotal = response.data.total || 0;
        } else {
          this.sopList = [];
          this.sopTotal = 0;
        }
        this.sopLoading = false;
      }).catch(error => {
        console.error('获取SOP列表失败:', error);
        this.sopLoading = false;
        this.sopList = [];
        this.sopTotal = 0;
        this.$modal.msgError('获取SOP列表失败');
      });
    },
    
    /** 取消SOP关联对话框 */
    cancelSopDialog() {
      this.openSopDialog = false;
      this.currentRow = null;
      this.sopList = [];
    },
    

    
    /** 调用绑定SOP的API */
    bindSop(processRouteId, sopId, sopInfo = null) {
      import('@/utils/request').then(({ default: request }) => {
        request({
          url: '/base/processRoute/bind',
          method: 'post',
          params: {
            id: processRouteId,
            sopId: sopId
        }
        }).then(response => {
          const sopName = sopInfo ? (sopInfo.categoryName || sopInfo.versionCode) : 'SOP';
          this.$modal.msgSuccess(`成功关联${sopName}`);
          // 刷新列表以显示最新的关联状态
          this.getList();
        }).catch(error => {
          console.error('SOP绑定失败:', error);
          this.$modal.msgError('SOP绑定失败，请重试');
        });
      });
    },
    
    /** SOP解绑操作 */
    handleSopUnbind(row) {
      this.$modal.confirm(`确认要取消关联SOP吗？`).then(() => {
        // 调用解绑API
        this.unbindSop(row.id);
      }).catch(() => {
        // 用户取消操作
      });
    },
    
    /** 调用解绑SOP的API */
    unbindSop(processRouteId) {
      // 调用解绑API
      import('@/utils/request').then(({ default: request }) => {
        request({
          url: '/base/processRoute/unbind',
          method: 'post',
          params: {
            id: processRouteId
          }
        }).then(response => {
          this.$modal.msgSuccess('成功取消SOP关联');
          // 刷新列表
          this.getList();
        }).catch(error => {
          console.error('SOP解绑失败:', error);
          this.$modal.msgError('取消关联失败，请重试');
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.process-route{
  ::v-deep .el-table--scrollable-x {
  height: 90%!important;
 }
}
::v-deep .sop-dialog{
   .el-dialog__body{
    padding: 10px 25px 30px!important;
  }
 }
</style>