<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="产品品类" prop="categoryId">
        <el-select v-model="queryParams.categoryId" filterable clearable placeholder="请选择产品品类"
          @change="queryParams.computerId = ''">
          <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="仪表型号" prop="computerId">
        <el-select v-model="queryParams.computerId" :loading="isCLoading" filterable remote clearable
          placeholder="请选择仪表型号" @change="getList" @focus="getComputerData" :remote-method="getComputerNameList"
          style="width: 160px">
          <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重 置
        </el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddProblem" v-hasPermi="['third:prodPermit:addIssue']">
          新增历史问题
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="产品型号" prop="name" align="center" width="150" />
      <el-table-column label="描述" prop="desc" align="center" />
      <el-table-column label="许可状态" align="center" width="120">
        <template slot-scope="{ row }">
          <el-dropdown :type="row.isLicense === 0 ? 'danger' : 'success'" split-button trigger="click" :style="{backgroundColor:row.isLicense === 0 ? '#ff4949':'#5cb85c',borderRadius:'12px'}">
            {{ row.isLicense === 0 ? "未许可" : "已许可" }}
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="row.isLicense === 1 && checkPermi(['third:prodPermit:cancelLicense'])" @click.native="showLicenseDialog(0, row)">取消许可</el-dropdown-item>
              <el-dropdown-item v-if="row.isLicense === 0 && checkPermi(['third:prodPermit:license'])" @click.native="showLicenseDialog(1, row)">许可</el-dropdown-item>
              <el-dropdown-item v-if="row.isLicense === 0 && checkPermi(['third:prodPermit:forceLicense'])" @click.native="showLicenseDialog(2, row)">强制许可</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
      <el-table-column label="许可有效期" align="center" width="120">
        <template slot-scope="{ row }">
          <span v-if="row.validityDate">
            {{ parseTime(row.validityDate, '{y}-{m}-{d}') }}
          </span>
          <span v-else-if="row.validityType === 1" class="text-warning">
            长期有效
          </span>
          <span v-else class="text-muted">
            -
          </span>
        </template>
      </el-table-column>
      <el-table-column label="历史问题" align="center" width="240">
        <template slot-scope="{ row }">
          <div v-if="row.issuesList && row.issuesList.length > 0" style="text-align: left;height:50px ;overflow-y: scroll;">
            <div v-for="(issue, index) in row.issuesList" :key="issue.id || index" style="margin-bottom: 5px;">
              <div>
                <span style="font-weight: bold;">时间:</span> {{ parseTime(issue.createTime) }}
              </div>
              <div>
                <span style="font-weight: bold;">问题描述:</span> {{ issue.historicalIssues }}
              </div>
              <div>
                <span style="font-weight: bold;">状态:</span>
                <el-tag :type="issue.status === 1 ? 'success' : 'info'" size="mini">
                  {{ issue.status === 1 ? '已处理' : '未处理' }}
                </el-tag>

              </div>
              <el-divider class="custom-divider" v-if="index < row.issuesList.length - 1" style="margin: 5px 0;"></el-divider>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作人" prop="createBy" align="center" width="100" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" align="center" width="140">
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100">
        <template slot-scope="{row}">
          <Tooltip icon="el-icon-tickets" content="操作记录" @click="handleLog(row.id)" v-hasPermi="['third:prodPermit:log']" />
          <Tooltip icon="el-icon-time" v-if="row.issuesList.length > 0" content="处理历史问题" @click="handleViewHistoricalIssues(row)" v-hasPermi="['third:prodPermit:handleIssue']" />
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="新增历史问题"
      :visible.sync="isAddProblemDialogVisible"
      width="600px"
      center
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="addProblemFormRef" :model="addProblemForm" label-width="100px" :rules="addProblemRules">
        <el-form-item label="历史问题点" prop="historicalIssuePoint">
          <el-input
            v-model="addProblemForm.historicalIssuePoint"
            type="textarea"
            :rows="4"
            placeholder="请输入历史问题点"
          ></el-input>
        </el-form-item>
        <el-form-item label="涉及型号">
          <div v-for="(model, index) in addProblemForm.involvedModels" :key="index" style="display: flex; margin-bottom: 10px;">
            <el-select v-model="model.categoryId" filterable clearable placeholder="品类" style="width: 150px; margin-right: 10px;" @change="model.computerId = ''">
              <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.id" />
            </el-select>
            <el-select v-model="model.computerId" filterable remote clearable placeholder="型号" style="width: 150px;" @focus="getComputerDataForAddProblem(model)" :remote-method="(query) => getComputerNameListForAddProblem(query, model)">
              <el-option v-for="dict in model.computerOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
            </el-select>
            <el-button v-if="addProblemForm.involvedModels.length > 1" type="danger" icon="el-icon-minus" size="mini" circle @click="removeInvolvedModel(index)" style="margin-left: 10px;"></el-button>
            <el-button v-if="index === addProblemForm.involvedModels.length - 1" type="success" icon="el-icon-plus" size="mini" circle @click="addInvolvedModel" style="margin-left: 10px;"></el-button>
          </div>

        </el-form-item>
        <el-form-item label="批量关闭许可" prop="isBatchCloseLicense">
          <el-switch v-model="addProblemForm.isBatchCloseLicense"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isAddProblemDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddProblemForm">提 交</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="历史问题列表"
      :visible.sync="isHistoricalIssuesListDialogVisible"
      width="1000px"
      center
      :close-on-click-modal="false"
      append-to-body
    >
      <el-table v-loading="loading" :data="historicalIssuesList" border height="400">
        <el-table-column label="序号" width="58" type="index" align="center" />
        <el-table-column label="问题点" prop="historicalIssues" align="center" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="createTime" align="center" width="150">
          <template slot-scope="{ row }">
            {{ parseTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="处理状态" align="center" width="100">
          <template slot-scope="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="mini">
              {{ row.status === 1 ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template slot-scope="{ row }">
            <el-button
              v-if="row.status === 0" 
              v-hasPermi="['third:prodPermit:confirmIssue']"
              type="text"
              size="mini"
              @click="submitHandleProblem(row)" 
            >
              确认处理完成
            </el-button>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isHistoricalIssuesListDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <el-dialog title="操作记录" center :visible.sync="isTask">
      <el-table v-loading="loading" :data="logList" top="1vh" border height="500">
        <el-table-column label="序号" width="58" type="index" align="center">
          <template slot-scope="scope">
            {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="文件名称" prop="typeName" align="center" />
        <el-table-column label="文件key" prop="type" align="center" />
        <el-table-column label="操作内容" prop="msg" align="center" />
        <el-table-column label="操作人" prop="operationName" align="center" width="150" />
        <el-table-column label="创建时间" prop="operationTime" align="center" width="180" />
      </el-table>
    </el-dialog>

    <!-- 许可操作弹窗 -->
    <el-dialog
      title="选择有效期"
      :visible.sync="licenseDialog.visible"
      width="400px"
      center
      top='0vh'
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="license-dialog-content" style="padding: 20px;">
        <div class="warning-icon" style="text-align: center; margin-bottom: 30px; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="el-icon-warning-outline" style="font-size: 24px; color: #E6A23C;"></i>
          <span style="font-size: 16px; color: #303133; font-weight: 500;">请选择许可有效期？</span>
        </div>
        
        <!-- 有效期选择选项卡 -->
        <div class="validity-options" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
          <div 
            class="validity-option" 
            :class="{ active: licenseDialog.validityType === 1 }"
            @click="selectValidityType(1)"
            style="display: flex; align-items: center; padding: 15px 20px; border: 2px solid #DCDFE6; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; background: #fff;"
            :style="licenseDialog.validityType === 1 ? 'border-color: #409EFF; background: #f0f9ff;' : ''"
          >
            <div 
              class="option-circle" 
              style="width: 20px; height: 20px; border: 2px solid #DCDFE6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; transition: all 0.3s ease;"
              :style="licenseDialog.validityType === 1 ? 'border-color: #409EFF; background: #409EFF; color: white;' : ''"
            >
              <i v-if="licenseDialog.validityType === 1" class="el-icon-check" style="font-size: 12px;"></i>
            </div>
            <span style="font-size: 14px; color: #303133; font-weight: 500;">长期有效</span>
          </div>
          
          <div 
            class="validity-option" 
            :class="{ active: licenseDialog.validityType === 2 }"
            @click="selectValidityType(2)"
            style="display: flex; align-items: center; padding: 15px 20px; border: 2px solid #DCDFE6; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; background: #fff;"
            :style="licenseDialog.validityType === 2 ? 'border-color: #409EFF; background: #f0f9ff;' : ''"
          >
            <div 
              class="option-circle" 
              style="width: 20px; height: 20px; border: 2px solid #DCDFE6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; transition: all 0.3s ease;"
              :style="licenseDialog.validityType === 2 ? 'border-color: #409EFF; background: #409EFF; color: white;' : ''"
            >
              <i v-if="licenseDialog.validityType === 2" class="el-icon-check" style="font-size: 12px;"></i>
            </div>
            <span style="font-size: 14px; color: #303133; font-weight: 500;">具体日期</span>
          </div>
        </div>
        
        <!-- 日期选择组件 -->
        <div v-if="licenseDialog.validityType === 2" style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #EBEEF5;">
          <div style="margin-bottom: 10px; font-size: 14px; color: #606266;">选择截止日期：</div>
          <el-date-picker
            v-model="licenseDialog.validityDate"
            type="date"
            placeholder="请选择截止日期"
            :picker-options="datePickerOptions"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </div>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="licenseDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmLicenseOperation">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addHistoryIssue, getHistoryIssuesListByComputerId, handleHistoryIssue } from '@/api/third/issuesApi';
import {
  computerLicenseList,
  computerUpdate,
  computerLogList,
} from "@/api/third/testApi";
import { categoryComputerDict, computerNameList } from "@/api/third/fileConfig";
import { checkPermi } from "@/utils/permission";

export default {
  name: "ProdPermit",
  data() {
    return {
      loading: false,
      isCLoading: false,
      list: [],
      isTask: false,
      taskForm: {},
      dictList: [],
      computerOptions: [],
      logList: [],
      queryParams: {
        p: 1,
        l: 10,
        categoryId: "",
        computerId: "",
      },

      isAddProblemDialogVisible: false,
      addProblemForm: {
        historicalIssuePoint: "",
        involvedModels: [
          { categoryId: "", computerId: "", computerOptions: [] }
        ],
        isBatchCloseLicense: false,
      },
      addProblemRules: {
        historicalIssuePoint: [
          { required: true, message: "历史问题点不能为空", trigger: "blur" }
        ],
      },

      isHistoricalIssuesListDialogVisible: false,
      historicalIssuesList: [],
      currentComputerIdForIssues: null,

      // 许可操作弹窗数据
      licenseDialog: {
        visible: false,
        title: '',
        message: '',
        type: 0, // 0: 取消许可, 1: 许可, 2: 强制许可
        currentRow: null,
        validityType: 1, // 1: 长期有效, 2: 具体日期
        validityDate: null
      },

      // 日期选择器配置
      datePickerOptions: {
        // 移除日期禁用，允许选择任意日期
      },
    };
  },
  watch: {
    $route: {
      async handler(route) {
        if (route.name === "ProdPermit") {
          this.queryParams.categoryId = "";
          this.queryParams.computerId = "";

          const { categoryId, computerId } = route?.params;

          if (categoryId && computerId) {
            this.dictList = await this.getCategoryData();
            this.queryParams.categoryId = categoryId;
            this.getComputerData();
            this.queryParams.computerId = computerId;

            this.handleQuery();
          } else {
            this.dictList = await this.getCategoryData();
            this.queryParams.categoryId = this.dictList[0]?.id;
            this.getComputerData();

            this.handleQuery();
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    checkPermi,
    getCategoryData() {
      return new Promise((resolve, reject) => {
        try {
          categoryComputerDict().then((res) => {
            resolve(res.data);
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    getComputerData() {
      if (this.queryParams.categoryId && this.dictList.length) {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === this.queryParams.categoryId
        )[0].computerList;
      }
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = true;
        computerNameList({
          name,
          categoryId: this.queryParams.categoryId,
        })
          .then((res) => {
            this.computerOptions = res.data;
          })
          .finally(() => {
            this.isCLoading = false;
          });
      } else {
        this.computerOptions = [];
      }
    },
    getList() {
      this.loading = true;
      computerLicenseList(this.queryParams)
        .then((response) => {
          this.list = response.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 显示许可操作弹窗
    showLicenseDialog(isLicense, row) {
      // 如果是取消许可，直接执行操作
      if (isLicense === 0) {
        this.$confirm("确认要取消该产品的许可吗？", "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            return computerUpdate({
              id: row.id,
              isLicense: 0
            });
          })
          .then((res) => {
            if (res.data === 1) {
              this.msgSuccess("取消许可成功");
              this.getList();
            } else {
              this.msgError("配置总览未审核");
            }
          })
          .catch(() => {});
        return;
      }

      // 如果是强制许可，使用原来的逻辑
      if (isLicense === 2) {
        this.$confirm("确认要强制许可该产品吗？", "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            return computerUpdate({
              id: row.id,
              isLicense: 2
            });
          })
          .then((res) => {
            if (res.data === 1) {
              this.msgSuccess("强制许可成功");
              this.getList();
            } else {
              this.msgError("配置总览未审核");
            }
          })
          .catch(() => {});
        return;
      }

      // 只有普通许可（isLicense === 1）才显示有效期选择弹窗
      this.licenseDialog = {
        visible: true,
        type: isLicense,
        currentRow: row,
        validityType: 1, // 默认长期有效
        validityDate: null
      };
    },

    // 选择有效期类型
    selectValidityType(type) {
      this.licenseDialog.validityType = type;
      if (type === 1) { // 长期有效
        this.licenseDialog.validityDate = null;
      }
    },

    // 确认许可操作
    confirmLicenseOperation() {
      const { type, currentRow, validityType, validityDate } = this.licenseDialog;
      
      // 构建请求参数
      const params = {
        id: currentRow.id,
        isLicense: type
      };

      // 添加有效期类型参数
      if (type === 1 || type === 2) {
        params.validityType = validityType;
        
        // 如果选择了具体日期，添加有效期参数
        if (validityType === 2) {
          if (!validityDate) {
            this.$message.warning('请选择有效期截止日期');
            return;
          }
          // 将日期转换为10位时间戳（秒级）
          const timestamp = Math.floor(new Date(validityDate).getTime() / 1000);
          params.validityDate = timestamp;
          // 保持向后兼容
          params.licenseValidityPeriod = validityDate;
        }
      }

      // 执行许可操作
      computerUpdate(params)
        .then((res) => {
          if (res.data === 1) {
            this.msgSuccess("操作成功");
            this.getList();
            this.licenseDialog.visible = false;
          } else {
            this.msgError("配置总览未审核");
          }
        })
        .catch((error) => {
        });
    },

    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.categoryId = this.dictList[0]?.id;
      this.handleQuery();
    },
    async handleLog(id) {
      this.isTask = true;

      try {
        const res = await computerLogList({ computerId: id });
        this.logList = res.data;
      } catch (error) {
        console.error(error);
      }
    },

    handleAddProblem() {
      this.resetForm("addProblemFormRef");
      this.addProblemForm = {
        historicalIssuePoint: "",
        involvedModels: [
          { categoryId: "", computerId: "", computerOptions: [] }
        ],
        isBatchCloseLicense: false,
      };
      this.isAddProblemDialogVisible = true;
    },

    submitAddProblemForm() {
      this.$refs.addProblemFormRef.validate(valid => {
        if (valid) {
          const computerIdsToSend = this.addProblemForm.involvedModels.map(model => 
            model.computerId
          ).filter(id => id);

          if (computerIdsToSend.length === 0) {
            this.msgError("请至少添加一个涉及型号");
            return;
          }

          // Check for duplicate model selections
          const uniqueIds = new Set(computerIdsToSend);
          if (uniqueIds.size !== computerIdsToSend.length) {
            this.msgError("涉及型号不能重复");
            return;
          }

          const params = {
            historicalIssues: this.addProblemForm.historicalIssuePoint,
            computerIds: computerIdsToSend,
            isCancel: this.addProblemForm.isBatchCloseLicense ? 1 : 0,
          };

          addHistoryIssue(params).then(res => {
            this.msgSuccess("新增历史问题成功");
            this.isAddProblemDialogVisible = false;
            this.getList();
          }).catch(err => {
            console.error("新增历史问题失败", err);
            this.msgError("新增历史问题失败");
          });
        } else {
          this.msgError("请检查表单填写");
          return false;
        }
      });
    },

    addInvolvedModel() {
      const lastModel = this.addProblemForm.involvedModels[this.addProblemForm.involvedModels.length - 1];
      this.addProblemForm.involvedModels.push({
        categoryId: lastModel.categoryId,
        computerId: "",
        computerOptions: lastModel.computerOptions
      });
    },

    removeInvolvedModel(index) {
      this.addProblemForm.involvedModels.splice(index, 1);
    },

    getComputerDataForAddProblem(model) {
      if (model.categoryId && this.dictList.length) {
        const category = this.dictList.find(item => item.id === model.categoryId);
        model.computerOptions = category ? category.computerList : [];
      } else {
        model.computerOptions = [];
      }
    },

    getComputerNameListForAddProblem(name, model) {
      if (name && model.categoryId) {
        this.isCLoading = true;
        computerNameList({
          name,
          categoryId: model.categoryId,
        })
          .then((res) => {
            model.computerOptions = res.data;
          })
          .finally(() => {
            this.isCLoading = false;
          });
      } else {
        model.computerOptions = [];
      }
    },

    async handleViewHistoricalIssues(row) {
      this.currentComputerIdForIssues = row.id;
      this.isHistoricalIssuesListDialogVisible = true;
      this.loading = true;
      try {
        const res = await getHistoryIssuesListByComputerId(row.id); 
        this.historicalIssuesList = res.data;
      } catch (error) {
        console.error("获取历史问题列表失败", error);
        this.msgError("获取历史问题列表失败");
        this.historicalIssuesList = [];
      } finally {
        this.loading = false;
      }
    },

    submitHandleProblem(issueRow) { 
      this.$confirm("确认该问题已处理完成吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        handleHistoryIssue({ id: issueRow.id }).then(res => { 
          this.msgSuccess("问题处理成功");
          this.handleViewHistoricalIssues({ id: this.currentComputerIdForIssues });
          this.getList();
        }).catch(err => {
          console.error("处理历史问题失败", err);
          this.msgError("处理历史问题失败");
        });
      }).catch(() => {
      });
    },
  },
};
</script>
<style>
.custom-divider{
  margin:5px 0 ;
}

/* 许可操作弹窗样式 */
.license-dialog-content {
  padding: 20px 0;
}

.license-dialog-content .warning-icon {
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.license-dialog-content .warning-text {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

/* 有效期选择选项卡样式 */
.validity-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.validity-option {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border: 2px solid #DCDFE6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.validity-option:hover {
  border-color: #409EFF;
  background: #f0f9ff;
}

.validity-option.active {
  border-color: #409EFF;
  background: #f0f9ff;
}

.validity-option .option-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #DCDFE6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.validity-option.active .option-circle {
  border-color: #409EFF;
  background: #409EFF;
  color: white;
}

.validity-option .option-text {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* 日期选择区域 */
.date-picker-section {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #EBEEF5;
}

/* 文本颜色类 */
.text-warning {
  color: #E6A23C;
}

.text-muted {
  color: #909399;
}

</style>