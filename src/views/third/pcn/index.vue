<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" @submit.native.prevent>
      <el-form-item label="品类" prop="category">
        <el-select v-model="queryParams.category" filterable clearable size="mini" style="width: 130px"
          placeholder="请选择品类">
          <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" clearable size="mini" style="width: 130px" placeholder="请选择状态">
          <el-option label="沟通中" :value="1" />
          <el-option label="客户同意" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户" prop="involvedCustomers">
        <TypedSelectLoadMore
          v-model="queryParams.involvedCustomers"
          type="customer"
          dictLabel="name"
          dictValue="name"
          style="width: 150px"
          @change="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="市场负责人" prop="marketManager">
        <el-select v-model="queryParams.marketManager" filterable clearable size="mini" style="width: 130px"
          placeholder="请选择市场负责人">
          <el-option v-for="item in marketManagerList" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictLabel" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目经理" prop="projectManager">
        <el-select v-model="queryParams.projectManager" filterable clearable size="mini" style="width: 130px"
          placeholder="请选择项目经理">
          <el-option v-for="item in projectManagerList" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictLabel" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" size="mini" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" v-debounce="{ Fn: handleQuery }">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd"
            v-hasPermi="['third:pcn:notice:add']">
            新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="pcnList" border :height="tableHeight()">
      <el-table-column label="序号" width="60" align="center" type="index">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="品类" align="center" prop="categoryName" width="140" />
      <el-table-column label="变更描述" align="center" prop="changeDescription" min-width="150" show-overflow-tooltip />
      <el-table-column label="涉及的客户" align="center" prop="involvedCustomers" width="150" show-overflow-tooltip>
        <span slot-scope="scope" v-NoData="scope.row.involvedCustomers"></span>
      </el-table-column>
      <el-table-column label="客户沟通进展" align="center" prop="customerCommunicationProgress" width="150"
        show-overflow-tooltip>
        <span slot-scope="scope" v-NoData="scope.row.customerCommunicationProgress"></span>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="{ row }">
          <el-tag v-if="row.status === 1" size="mini" type="warning">
            沟通中
          </el-tag>
          <el-tag v-else-if="row.status === 2" size="mini" type="success">
            客户同意
          </el-tag>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="具体实施对策" align="center" prop="implementationStrategy" width="150"
        show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span v-if="row.status === 2" v-NoData="row.implementationStrategy"></span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="市场负责人" align="center" prop="marketManager" width="110" />
      <el-table-column label="项目经理" align="center" prop="projectManager" width="110" />
      <el-table-column label="PCN文件" align="center" width="120">
        <template slot-scope="{ row }">
          <el-button v-if="row.pcnFile" type="text" size="mini" @click="handleShowFiles(row.pcnFile)">
            文件 ({{ getFileCount(row.pcnFile) }})
          </el-button>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="日期" align="center" prop="createTime" width="100">
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" fixed="right">
        <template slot-scope="scope">
          <Tooltip v-if="scope.row.status === 1" v-hasPermi="['third:pcn:notice:edit']" icon="el-icon-check" content="完成"
            @click="handleComplete(scope.row)" />
          <Tooltip v-hasPermi="['third:pcn:notice:edit']" icon="el-icon-edit" content="编辑"
            @click="handleUpdate(scope.row)" />
          <Tooltip v-hasPermi="['third:pcn:notice:delete']" icon="el-icon-delete" :className="['text-red']"
            content="删除" @click="handleDelete(scope.row)" />
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <!-- 添加或修改PCN产品变更通知对话框 -->
    <el-dialog :title="title" center :width="isCompleting ? '600px' : '800px'" :visible.sync="open" append-to-body :close-on-click-modal="false" top="0vh">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" @submit.native.prevent>
        <!-- 完成操作时只显示具体实施对策 -->
        <template v-if="isCompleting">
          <el-form-item label="具体实施对策:" prop="implementationStrategy">
            <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" v-model="form.implementationStrategy"
              placeholder="请输入具体实施对策（客户同意后）" />
          </el-form-item>
        </template>

        <!-- 非完成操作时显示所有字段 -->
        <template v-else>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="品类:" prop="category">
                <el-select v-model="form.category" filterable clearable placeholder="请选择品类" style="width: 100%">
                  <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态:" prop="status">
                <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                  <el-option label="沟通中" :value="1" />
                  <el-option label="客户同意" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="市场负责人:" prop="marketManager">
                <el-select v-model="form.marketManager" filterable clearable placeholder="请选择市场负责人" style="width: 100%">
                  <el-option v-for="item in marketManagerList" :key="item.dictValue" :label="item.dictLabel" :value="item.dictLabel" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目经理:" prop="projectManager">
                <el-select v-model="form.projectManager" filterable clearable placeholder="请选择项目经理" style="width: 100%">
                  <el-option v-for="item in projectManagerList" :key="item.dictValue" :label="item.dictLabel" :value="item.dictLabel" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="变更描述:" prop="changeDescription">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="form.changeDescription"
              placeholder="请输入变更描述" />
          </el-form-item>

          <el-form-item label="涉及的客户:" prop="involvedCustomers">
            <el-select
              v-model="form.involvedCustomersArray"
              multiple
              filterable
              clearable
              placeholder="请选择客户"
              style="width: 100%"
              @change="handleCustomerChange"
            >
              <el-option
                v-for="item in customerList"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="客户沟通进展:" prop="customerCommunicationProgress">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" v-model="form.customerCommunicationProgress"
              placeholder="请输入客户沟通进展" />
          </el-form-item>

          <el-form-item v-if="form.status === 2" label="具体实施对策:" prop="implementationStrategy">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" v-model="form.implementationStrategy"
              placeholder="请输入具体实施对策（客户同意后）" />
          </el-form-item>

          <el-form-item label="PCN文件:">
            <MyUpload 
              v-model="form.pcnFile"
              :multiple="true"
              :limit="10"
            />
          </el-form-item>
        </template>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-debounce="{ Fn: submitForm }">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 文件列表弹窗 -->
    <el-dialog title="PCN文件列表" :visible.sync="fileListVisible" width="600px" center append-to-body top="0vh">
      <el-table :data="fileList" border max-height="400px">
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="文件名称" align="center" min-width="200">
          <template slot-scope="{ row }">
            <span>{{ getFileName(row.url) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" icon="el-icon-download" @click="handleDownloadSingle(row.url)">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fileListVisible = false">关 闭</el-button>
        <el-button type="primary" @click="handleDownloadAll">全部下载</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listPcnNotice,
  getPcnNoticeInfo,
  addPcnNotice,
  editPcnNotice,
  deletePcnNotice,
} from "@/api/third/pcn";
import { categoryComputerDict } from "@/api/third/fileConfig";
import { dictPmProject, dictMkProject } from "@/api/third/project";
import { getCustomerList } from "@/api/order";
import MyUpload from '@/components/MyUpload';
import TypedSelectLoadMore from '@/components/TypedSelectLoadMore';

export default {
  name: "PcnNotice",
  components: {
    MyUpload,
    TypedSelectLoadMore
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // PCN列表数据
      pcnList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否为完成操作
      isCompleting: false,
      // 日期范围
      dateRange: [],
      // 品类列表
      categoryList: [],
      // 市场负责人列表
      marketManagerList: [],
      // 项目经理列表
      projectManagerList: [],
      // 客户列表（一次性加载全部）
      customerList: [],
      // 文件列表弹窗
      fileListVisible: false,
      fileList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        category: undefined,
        status: undefined,
        involvedCustomers: undefined,
        marketManager: undefined,
        projectManager: undefined,
        startTime: undefined,
        endTime: undefined,
      },
      // 表单参数
      form: {
        id: undefined,
        category: undefined,
        changeDescription: undefined,
        involvedCustomers: undefined,
        involvedCustomersArray: [],
        customerCommunicationProgress: undefined,
        status: 1,
        implementationStrategy: undefined,
        marketManager: undefined,
        projectManager: undefined,
        pcnFile: '',  // 修复：使用空字符串而不是 undefined
      },
      // 表单校验
      rules: {
        category: [
          { required: true, message: "品类不能为空", trigger: "change" },
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "change" },
        ],
        changeDescription: [
          { required: true, message: "变更描述不能为空", trigger: "blur" },
        ],
        marketManager: [
          { required: false, message: "市场负责人不能为空", trigger: "blur" },
        ],
        projectManager: [
          { required: true, message: "项目经理不能为空", trigger: "blur" },
        ],
      },
    };
  },

  created() {
    this.loadCategoryList();
    this.loadMarketManagerList();
    this.loadProjectManagerList();
    this.loadCustomerList();
    this.getList();
  },
  methods: {
    /** 加载品类列表 */
    loadCategoryList() {
      return categoryComputerDict().then((res) => {
        if (res.code === 200 && res.data) {
          // 处理数据格式，确保包含 id 和 name 字段
          if (Array.isArray(res.data)) {
            this.categoryList = res.data.map(item => ({
              id: item.id || item.categoryId,
              name: item.name || item.categoryName || item.label,
              ...item // 保留其他字段
            }))
          } else if (res.data.list) {
            this.categoryList = res.data.list.map(item => ({
              id: item.id || item.categoryId,
              name: item.name || item.categoryName || item.label,
              ...item // 保留其他字段
            }))
          }
          console.log('品类列表加载成功:', this.categoryList.length, '条')
        } else {
          console.error('获取品类列表失败:', res.msg)
          this.categoryList = []
        }
        return this.categoryList;
      }).catch((error) => {
        console.error('加载品类列表失败:', error);
        this.categoryList = [];
        return [];
      });
    },
    /** 加载市场负责人列表 */
    loadMarketManagerList() {
      return dictMkProject().then((res) => {
        if (res && res.data) {
          this.marketManagerList = Array.isArray(res.data) ? res.data : [];
          console.log('市场负责人列表加载成功:', this.marketManagerList.length, '条');
        } else {
          this.marketManagerList = [];
        }
        return this.marketManagerList;
      }).catch((error) => {
        console.error('加载市场负责人列表失败:', error);
        this.marketManagerList = [];
        return [];
      });
    },
    /** 加载项目经理列表 */
    loadProjectManagerList() {
      return dictPmProject().then((res) => {
        if (res && res.data) {
          this.projectManagerList = Array.isArray(res.data) ? res.data : [];
          console.log('项目经理列表加载成功:', this.projectManagerList.length, '条');
        } else {
          this.projectManagerList = [];
        }
        return this.projectManagerList;
      }).catch((error) => {
        console.error('加载项目经理列表失败:', error);
        this.projectManagerList = [];
        return [];
      });
    },
    /** 加载客户列表 */
    /** 加载客户列表（一次性加载全部） */
    loadCustomerList() {
      getCustomerList({
        p: 1,
        l: 9999
      }).then((res) => {
        if (res && res.data && res.data.list) {
          // 过滤启用状态的客户
          const filteredList = res.data.list.filter((item) => item.status === 0);

          // 按拼音/英文字母顺序排序
          this.customerList = filteredList.sort((a, b) => {
            const nameA = a.name || '';
            const nameB = b.name || '';
            return nameA.localeCompare(nameB, 'zh-CN', { sensitivity: 'base' });
          });
        } else {
          console.error('获取客户数据失败: 响应数据格式错误');
          this.customerList = [];
        }
      }).catch((error) => {
        console.error('获取客户数据失败:', error);
        this.customerList = [];
      });
    },
    /** 处理客户选择变化 */
    handleCustomerChange(value) {
      console.log('客户选择变化:', value);
      this.form.involvedCustomersArray = value;
    },
    /** 查询PCN列表 */
    getList() {
      this.loading = true;
      const params = this.addDateRange(this.queryParams, this.dateRange, {
        begin: 'startTime',
        end: 'endTime'
      });
      listPcnNotice(params)
        .then((response) => {
          this.pcnList = response.data.list || [];
          this.total = response.data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.isCompleting = false;  // 重置完成标记
      this.reset();
    },
    // 表单重置
    reset() {
      this.isCompleting = false;  // 重置完成标记
      this.form = {
        id: undefined,
        category: undefined,
        changeDescription: undefined,
        involvedCustomers: undefined,
        involvedCustomersArray: [], // 多选客户数组
        customerCommunicationProgress: undefined,
        status: 1,
        implementationStrategy: undefined,
        marketManager: undefined,
        projectManager: undefined,
        pcnFile: '',  // 修复：使用空字符串而不是 undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    /** 完成按钮（沟通中 -> 客户同意） */
    handleComplete(row) {
      this.reset();
      this.isCompleting = true;  // 设置为完成操作
      const id = row.id;
      
      getPcnNoticeInfo(id).then((response) => {
        this.form = response.data;
        // 将状态修改为客户同意
        this.form.status = 2;
        // 将逗号分隔的客户名称字符串转换为数组
        if (this.form.involvedCustomers) {
          this.form.involvedCustomersArray = this.form.involvedCustomers.split(',').map(item => item.trim()).filter(item => item);
        } else {
          this.form.involvedCustomersArray = [];
        }
        this.open = true;
        this.title = "完成";
      });
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id;
      
      getPcnNoticeInfo(id).then((response) => {
        this.form = response.data;
        // 将逗号分隔的客户字符串转换为数组
        if (this.form.involvedCustomers) {
          this.form.involvedCustomersArray = this.form.involvedCustomers.split(',').map(item => item.trim()).filter(item => item);
        } else {
          this.form.involvedCustomersArray = [];
        }
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          console.log('提交前-客户数组:', this.form.involvedCustomersArray);
          // 将客户数组转换为逗号分隔的字符串
          const submitData = {
            ...this.form,
            involvedCustomers: this.form.involvedCustomersArray && this.form.involvedCustomersArray.length > 0
              ? this.form.involvedCustomersArray.join(',')
              : ''
          };
          console.log('提交时-转换后的客户字符串:', submitData.involvedCustomers);
          // 删除临时的数组字段
          delete submitData.involvedCustomersArray;

          if (this.form.id !== undefined) {
            editPcnNotice(submitData).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addPcnNotice(submitData).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('确定要删除该PCN产品变更通知吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deletePcnNotice(row.id);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 获取文件数量 */
    getFileCount(fileUrls) {
      if (!fileUrls) return 0;
      return fileUrls.split(',').filter(url => url.trim()).length;
    },
    /** 显示文件列表 */
    handleShowFiles(fileUrls) {
      if (!fileUrls) return;
      
      const urls = fileUrls.split(',').filter(url => url.trim());
      this.fileList = urls.map(url => ({ url: url.trim() }));
      this.fileListVisible = true;
    },
    /** 下载单个文件 */
    handleDownloadSingle(fileUrl) {
      if (!fileUrl) return;
      window.open(fileUrl, '_blank');
    },
    /** 全部下载 */
    handleDownloadAll() {
      this.fileList.forEach((file, index) => {
        setTimeout(() => {
          window.open(file.url, '_blank');
        }, index * 300); // 每个文件间隔300ms，避免浏览器拦截
      });
    },
    /** 获取文件名 */
    getFileName(url) {
      if (!url) return '';
      try {
        const parts = url.split('/');
        const fileName = parts[parts.length - 1];
        return decodeURIComponent(fileName);
      } catch (e) {
        return url;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* PCN 页面样式 */
</style>

