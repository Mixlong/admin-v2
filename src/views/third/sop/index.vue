<template>
  <div class="app-container">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
      "
    >
      <div style="flex: 1">
        <el-form :model="queryParams" ref="queryForm" inline>
          <el-form-item label="产品品类" prop="categoryId">
            <TypedSelectLoadMore
              v-model="queryParams.categoryId"
              type="category"
              customStyle="width: 150px"
              size="mini"
            />
          </el-form-item>
          <el-form-item label="审核状态" prop="state">
            <el-select
              v-model="queryParams.state"
              style="width: 140px"
              clearable
              placeholder="请选择审核状态"
            >
              <el-option label="待审核" value="0" />
              <el-option label="审核通过" value="1" />
              <el-option label="审核拒绝" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="版本号" prop="versionCode">
            <el-input
              v-model.trim="queryParams.versionCode"
              clearable
              style="width: 140px"
              placeholder="请选择版本号"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="handleQuery"
            >
              搜索
            </el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div style="flex-shrink: 0; margin-left: 10px">
        <el-button
          type="primary"
          icon="el-icon-user-solid"
          v-hasPermi="['sop:people:add']"
          @click="handleAddPeople"
        >
          人员管理
        </el-button>
        <el-button
          v-hasPermi="['sop:add:btn']"
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        >
          新增
        </el-button>
        <el-button
          type="info"
          icon="el-icon-folder-opened"
          @click="handleOpenDraftBox"
        >
          草稿箱
        </el-button>
      </div>
    </div>

    <el-table
      class="afterSaleBox"
      :row-class-name="rowName"
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
    >
      <el-table-column label="序号" type="index" width="60" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="品类"
        prop="categoryName"
        align="center"
        min-width="120"
      />
      <el-table-column
        label="版本号"
        prop="versionCode"
        align="center"
        min-width="100"
      />
      <el-table-column
        label="描述"
        prop="desc"
        align="center"
        min-width="150"
        show-overflow-tooltip
      />

      <!-- 会审状态 -->
      <el-table-column label="会审状态" width="170" align="center">
        <template slot-scope="scope">
          <div
            v-if="
              scope.row.sopChangeNotice &&
              scope.row.sopChangeNotice.list &&
              scope.row.sopChangeNotice.list.length > 0
            "
          >
            <div
              v-for="(item, index) in scope.row.sopChangeNotice.list"
              :key="index"
              style="margin: 4px 0"
            >
              <el-tag type="info" size="mini">
                {{ getFieldName(item.field) }}
              </el-tag>
              <span style="margin: 0 4px">{{ item.fieldName }}</span>
              <el-tag :type="getAuditTagType(item.state)" size="mini">
                {{ getAuditStateName(item.state) }}
              </el-tag>
            </div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 工程审状态 -->
      <el-table-column label="工程审" width="120" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.sopChangeNotice">
            <div style="margin-bottom: 4px">
              {{ scope.row.sopChangeNotice.engineeringPerson || "-" }}
            </div>
            <el-tag
              :type="
                getAuditTagType(scope.row.sopChangeNotice.engineeringState)
              "
              size="small"
            >
              {{
                getAuditStateName(scope.row.sopChangeNotice.engineeringState)
              }}
            </el-tag>
          </div>
          <span v-else-if="scope.row.engineeringPerson">{{ scope.row.engineeringPerson }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 项目人员 -->
      <el-table-column label="项目人员" width="120" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.sopChangeNotice">
            <div style="margin-bottom: 4px">
              {{ scope.row.sopChangeNotice.projectPerson || "-" }}
            </div>
            <el-tag
              :type="getAuditTagType(scope.row.sopChangeNotice.projectState)"
              size="small"
            >
              {{ getAuditStateName(scope.row.sopChangeNotice.projectState) }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <!-- 终审状态 -->
      <el-table-column label="终审" width="120" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.sopChangeNotice">
            <div style="margin-bottom: 4px">
              {{ scope.row.sopChangeNotice.secondPerson || "-" }}
            </div>
            <el-tag
              :type="getAuditTagType(scope.row.sopChangeNotice.secondState)"
              size="small"
            >
              {{ getAuditStateName(scope.row.sopChangeNotice.secondState) }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column
        label="创建人"
        prop="createBy"
        align="center"
        min-width="100"
        show-overflow-tooltip
      />
      <el-table-column
        label="更新时间"
        prop="updateTime"
        align="center"
        min-width="140"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.updateTime || row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220">
        <template slot-scope="{ row }">
          <div class=" ">
            <!-- 新版SOP审核按钮 -->
            <el-button
              v-if="row.isOldSop == 0 && canAudit(row)"
              class="text-orange"
              type="text"
              size="small"
              @click="handleNewAudit(row)"
            >
              审核
            </el-button>
            <!-- 旧版SOP审核按钮 -->
            <el-button
              v-else-if="row.isOldSop == 1 && row.state === 0"
              class="text-orange"
              type="text"
              size="small"
              @click="handleOldAudit(row)"
            >
              审核
            </el-button>
            <!-- 审核详情按钮 -->
            <el-button
              v-if="(row.isOldSop == 0 && row.sopChangeNotice) || (row.isOldSop == 1 && row.engineeringPerson)"
              class="text-purple"
              type="text"
              size="small"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <!-- 查看详情按钮 -->
            <el-button
              v-hasPermi="['sop:detail:btn']"
              class="text-green"
              type="text"
              size="small"
              @click="handleDetail(row)"
            >
              查看
            </el-button>
            <el-button
              v-hasPermi="['sop:update:btn']"
              class="text-blue"
              type="text"
              size="small"
              @click="handleUpdate(row)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPermi="['sop:delete:btn']"
              class="text-red"
              type="text"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
            <el-button
              v-if="row.historyFile"
              class="text-blue"
              type="text"
              size="small"
              @click="handleHistory(row)"
            >
              历史文件
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <!-- 新增、修改 -->
    <add-sop
      ref="isAddSopRef"
      :visible.sync="isSopAddDia"
      :dictList="dictList"
      :userListOptions="userListOptions"
    />

    <!-- 详情 -->
    <sop-detail ref="isSopDetailRef" :visible.sync="isSopDetailDia" />

    <!-- 历史文件弹出框 -->
    <el-dialog
      title="历史文件"
      :visible.sync="historyFileDialogVisible"
      width="1000px"
      append-to-body
      top="0vh"
    >
      <el-table :data="historyFileList" border>
        <el-table-column
          prop="name"
          label="文件名"
          min-width="200"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="url"
          label="文件地址"
          min-width="300"
          align="center"
        >
          <template slot-scope="scope">
            <el-link :href="scope.row.url" target="_blank" type="primary">{{
              scope.row.url
            }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="time"
          label="上传时间"
          min-width="180"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.time }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 草稿箱 -->
    <DraftBox :visible.sync="isDraftBoxVisible" @edit-draft="handleEditDraft" />
    
    <!-- 审核对话框 -->
    <AuditDialog ref="auditDialog" @success="getList" />
    
    <!-- 审核详情对话框 -->
    <AuditDetailDialog ref="auditDetailDialog" />

    <!-- 审核人员管理 -->
    <el-dialog
      title="SOP审核人员管理"
      :visible.sync="isPeopleManageVisible"
      top="2vh"
      center
      append-to-body
      width="600px"
      :close-on-click-modal="false"
    >
      <el-row type="flex" justify="center">
        <el-col :xs="0" :span="2"></el-col>
        <el-col :xs="24" :span="20">
          <el-form
            ref="peopleForm"
            :model="peopleManageForm"
            :rules="peopleManageRules"
            label-width="110px"
            label-position="left"
            class="input-width"
          >
            <!-- 会审人员 -->
            <el-form-item label="会审人员："></el-form-item>
            <el-form-item label-width="20px">
              <el-form-item
                label="品质："
                prop="qualityData"
                label-width="90px"
              >
                <el-select
                  class="w100"
                  v-model="peopleManageForm.qualityData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择品质人员"
                >
                  <el-option
                    v-for="(item, index) in userListOptions"
                    :key="index"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="生产："
                prop="productionData"
                label-width="90px"
              >
                <el-select
                  class="w100"
                  v-model="peopleManageForm.productionData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择生产人员"
                >
                  <el-option
                    v-for="(item, index) in userListOptions"
                    :key="index"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="研发：" prop="rdData" label-width="90px">
                <el-select
                  class="w100"
                  v-model="peopleManageForm.rdData"
                  filterable
                  multiple
                  clearable
                  placeholder="请选择研发人员"
                >
                  <el-option
                    v-for="(item, index) in userListOptions"
                    :key="index"
                    :label="item.userName"
                    :value="item.userName"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form-item>

            <!-- 工程人员 -->
            <el-form-item label="工程人员：" prop="engineerData">
              <el-select
                class="w100"
                v-model="peopleManageForm.engineerData"
                filterable
                multiple
                clearable
                placeholder="请选择工程人员"
              >
                <el-option
                  v-for="(item, index) in userListOptions"
                  :key="index"
                  :label="item.userName"
                  :value="item.userName"
                >
                </el-option>
              </el-select>
            </el-form-item>

            <!-- 终审人员 -->
            <el-form-item label="终审人员：" prop="finalData">
              <el-select
                class="w100"
                v-model="peopleManageForm.finalData"
                filterable
                multiple
                clearable
                placeholder="请选择终审人员"
              >
                <el-option
                  v-for="(item, index) in userListOptions"
                  :key="index"
                  :label="item.userName"
                  :value="item.userName"
                >
                </el-option>
              </el-select>
            </el-form-item>

            <!-- 项目人员 -->
            <el-form-item label="项目人员：" prop="projectData">
              <el-select
                class="w100"
                v-model="peopleManageForm.projectData"
                filterable
                multiple
                clearable
                placeholder="请选择项目人员"
              >
                <el-option
                  v-for="(item, index) in userListOptions"
                  :key="index"
                  :label="item.userName"
                  :value="item.userName"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :xs="0" :span="2"></el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitPeopleForm">确 定</el-button>
        <el-button @click="isPeopleManageVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  sopList,
  sopDelete,
  sopState,
  sopPersonList,
  sopPersonEdit,
} from "@/api/third/testApi";
import { dictUserList } from "@/api/system/user";
import { mapGetters } from "vuex";
import AddSop from "./components/addSop";
import SopDetail from "./components/sopDetail";
import DraftBox from "./components/DraftBox";
import AuditDialog from "./components/AuditDialog";
import AuditDetailDialog from "./components/AuditDetailDialog";
import digiSmartJumpMixin from "@/mixins/digiSmartJump";

export default {
  name: "Sop",
  components: {
    AddSop,
    SopDetail,
    DraftBox,
    AuditDialog,
    AuditDetailDialog,
  },
  mixins: [digiSmartJumpMixin],
  computed: {
    // ...mapGetters(["nickName"])
  },
  data() {
    return {
      // nickName:'杨贵来',
      form: {},
      urls: [],
      // 遮罩层
      loading: true,
      // 新增、修改弹窗
      isSopAddDia: false,
      // 详情弹窗
      isSopDetailDia: false,
      // 历史文件弹窗
      historyFileDialogVisible: false,
      // 草稿箱弹窗
      isDraftBoxVisible: false,
      // 人员管理弹窗
      isPeopleManageVisible: false,
      // 历史文件列表
      historyFileList: [],
      // 待处理 、 全部
      isWaitDispose: true,
      // 总条数
      total: 0,
      brandList: [],
      isNoComputerFlag: true,
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        id: null, // DigiSmart 跳转 ID
        categoryId: undefined,
        state: undefined,
        versionCode: undefined,
      },
      // 用户列表
      userListOptions: [],
      // 字典列表（传递给子组件）
      dictList: [],
      // 人员管理表单
      peopleManageForm: {
        qualityData: [], // 会审-品质 (type: 3)
        productionData: [], // 会审-生产 (type: 4)
        engineerData: [], // 会审-工程 (type: 5)
        rdData: [], // 会审-研发 (type: 6)
        finalData: [], // 终审 (type: 10)
        projectData: [], // 项目人员 (type: 14)
      },
      // 人员管理校验规则
      peopleManageRules: {
        qualityData: [
          { required: true, message: "请选择会审-品质人员", trigger: "change" },
        ],
        productionData: [
          { required: true, message: "请选择会审-生产人员", trigger: "change" },
        ],
        engineerData: [
          { required: true, message: "请选择会审-工程人员", trigger: "change" },
        ],
        rdData: [
          { required: true, message: "请选择会审-研发人员", trigger: "change" },
        ],
        finalData: [
          { required: true, message: "请选择终审人员", trigger: "change" },
        ],
        projectData: [
          { required: true, message: "请选择项目人员", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    ...mapGetters(["userId", "name", "nickName"]),
    directionDir() {
      return (dataList, direction) => {
        return (
          dataList.length &&
          dataList.filter((item) => +item.dictValue === +direction)
        );
      };
    },
    directionLabel() {
      return (dataList, direction) => {
        const directionData = this.directionDir(dataList, direction);
        return directionData[0] && directionData[0].dictLabel;
      };
    },
  },
  created() {
    let { name } = this.$route.query;
    if (name) {
      this.queryParams.product = name;
    }
    this.getList();
    this.getUserList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      sopList(this.queryParams)
        .then((res) => res.data)
        .then((data) => {
          const { list, total } = data;

          this.brandList = list;
          this.total = total;
          
          // 清除 DigiSmart 跳转 ID
          this.clearDigiSmartId();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 审核
    handleCheck(row) {
      let loading = null;

      this.$confirm("是否审核通过？", "警告", {
        confirmButtonText: "通 过",
        cancelButtonText: "驳 回",
        type: "warning",
        distinguishCancelAndClose: true,
      })
        .then((res) => {
          loading = this.$loading({
            lock: true,
            text: "正在处理中...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });

          sopState({ id: row.id, state: 1 }).then(() => {
            loading.close();
            this.getList();
            this.msgSuccess("操作成功");
          });
        })
        .catch((res) => {
          loading = this.$loading({
            lock: true,
            text: "正在处理中...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });
          loading.close();
          if (res == "cancel") {
            sopState({ id: row.id, state: 2 }).then(() => {
              loading.close();
              this.getList();
              this.msgSuccess("操作成功");
            });
          }
        });
    },
    // 新增
    handleAdd() {
      this.isSopAddDia = true;
      // 新增时重置表单，避免显示上一次编辑的数据
      this.$nextTick(() => {
        this.$refs.isAddSopRef.reset();
      });
    },
    // 修改
    handleUpdate(row) {
      this.isSopAddDia = true;
      this.$nextTick(() => {
        this.$refs.isAddSopRef.setFormData(
          JSON.parse(JSON.stringify({ ccPersons: "", ...row }))
        );
      });
    },
    // 详情
    handleDetail(row) {
      this.isSopDetailDia = true;
      this.$refs.isSopDetailRef.getSopInfo(row.id);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除品类为"' + row.categoryName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          return sopDelete([row.id]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    rowName({ row, rowIndex }) {
      // 旧版SOP使用原有逻辑
      if (row.isOldSop === 1) {
        if (row.state === 1) {
          return "finish-row";
        }
        if (row.state === 2) {
          return "reject-row";
        }
      }
      
      // 新版SOP使用新逻辑
      if (row.isOldSop === 0 && row.sopChangeNotice) {
        const notice = row.sopChangeNotice;
        
        // 全部通过 - 绿色背景（会审、工程审、项目审、终审都通过）
        const allJointAuditPassed = !notice.list || notice.list.every(item => item.state === 1);
        const engineeringPassed = notice.engineeringState === 1;
        const projectPassed = !notice.projectPerson || notice.projectState === 1; // 如果没有项目人员，视为通过
        const finalPassed = notice.secondState === 1;
        
        if (allJointAuditPassed && engineeringPassed && projectPassed && finalPassed) {
          return 'finish-row';
        }
        
        // 有驳回 - 红色背景
        const hasRejected = notice.engineeringState === 2 || 
                           notice.secondState === 2 || 
                           notice.projectState === 2 ||
                           (notice.list && notice.list.some(item => item.state === 2));
        if (hasRejected) return 'reject-row';
      }
      
      return '';
    },
    // 查看历史文件
    handleHistory(row) {
      if (row.historyFile) {
        this.historyFileList = JSON.parse(row.historyFile);
        this.historyFileDialogVisible = true;
      }
    },
    /** 判断是否可以审核（新版SOP） */
    canAudit(row) {
      // 只对新版SOP进行判断
      if (row.isOldSop !== 0 || !row.sopChangeNotice) {
        return false;
      }
      
      // 获取当前用户信息
      const currentUser = this.nickName || '';
      const notice = row.sopChangeNotice;
      
      // 检查是否有会审被驳回
      const hasJointAuditRejected = notice.list && notice.list.length > 0 
        ? notice.list.some(item => item.state === 2)
        : false;
      
      // 如果有会审被驳回，后续流程都不能进行
      if (hasJointAuditRejected) {
        // 只有待审核的会审人员可以继续审核
        if (notice.list && notice.list.length > 0) {
          const myAudit = notice.list.find(item => item.fieldName === currentUser && item.state === 0);
          if (myAudit) return true;
        }
        return false;
      }
      
      // 1. 检查会审状态（第一阶段，可以并行审核）
      if (notice.list && notice.list.length > 0) {
        const myAudit = notice.list.find(item => item.fieldName === currentUser && item.state === 0);
        if (myAudit) return true;
      }
      
      // 2. 检查工程审状态（第二阶段，需要所有会审都通过）
      if (notice.engineeringPerson === currentUser && notice.engineeringState === 0) {
        // 检查是否所有会审都已通过
        const allJointAuditPassed = notice.list && notice.list.length > 0 
          ? notice.list.every(item => item.state === 1)
          : false;
        
        // 只有会审全部通过后，才能工程审
        if (allJointAuditPassed) {
          return true;
        }
      }
      
      // 3. 检查项目审状态（第三阶段，需要工程审通过）
      if (notice.projectPerson === currentUser && notice.projectState === 0) {
        // 检查是否所有会审都已通过
        const allJointAuditPassed = notice.list && notice.list.length > 0 
          ? notice.list.every(item => item.state === 1)
          : false;
        
        // 检查工程审是否已通过
        const engineeringPassed = notice.engineeringState === 1;
        
        // 只有会审全部通过且工程审通过后，才能项目审
        if (allJointAuditPassed && engineeringPassed) {
          return true;
        }
      }
      
      // 4. 检查终审状态（第四阶段，需要项目审通过）
      if (notice.secondPerson === currentUser && notice.secondState === 0) {
        // 检查是否所有会审都已通过
        const allJointAuditPassed = notice.list && notice.list.length > 0 
          ? notice.list.every(item => item.state === 1)
          : false;
        
        // 检查工程审是否已通过
        const engineeringPassed = notice.engineeringState === 1;
        
        // 检查项目审是否已通过（如果有项目人员）
        const projectPassed = !notice.projectPerson || notice.projectState === 1;
        
        // 只有会审全部通过、工程审通过、项目审通过后，才能终审
        if (allJointAuditPassed && engineeringPassed && projectPassed) {
          return true;
        }
      }
      
      return false;
    },
    /** 新版SOP审核按钮操作 */
    handleNewAudit(row) {
      const currentUser = this.nickName || '';
      const notice = row.sopChangeNotice;
      
      // 判断当前用户的审核类型
      // 1. 检查是否是会审人员（第一阶段）
      if (notice.list && notice.list.length > 0) {
        const myAudit = notice.list.find(item => item.fieldName === currentUser && item.state === 0);
        if (myAudit) {
          this.$refs.auditDialog.open('field', row, myAudit);
          return;
        }
      }
      
      // 2. 检查是否是工程审人员（第二阶段）
      if (notice.engineeringPerson === currentUser && notice.engineeringState === 0) {
        this.$refs.auditDialog.open('engineering', row);
        return;
      }
      
      // 3. 检查是否是项目审人员（第三阶段）
      if (notice.projectPerson === currentUser && notice.projectState === 0) {
        this.$refs.auditDialog.open('project', row);
        return;
      }
      
      // 4. 检查是否是终审人员（第四阶段）
      if (notice.secondPerson === currentUser && notice.secondState === 0) {
        this.$refs.auditDialog.open('final', row);
        return;
      }
    },
    /** 查看审核详情按钮操作 */
    handleViewDetail(row) {
      this.$refs.auditDetailDialog.open(row);
    },
    // 旧版SOP审核逻辑（直接审核通过/驳回）
    handleOldAudit(row) {
      let loading = null;

      this.$confirm("是否审核通过？", "警告", {
        confirmButtonText: "通 过",
        cancelButtonText: "驳 回",
        type: "warning",
        distinguishCancelAndClose: true,
      })
        .then(() => {
          loading = this.$loading({
            lock: true,
            text: "审核中...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });

          // 审核通过
          sopState({ id: row.id, state: 1 })
            .then((res) => {
              if (res.code === 200) {
                this.$message.success("审核通过");
                this.getList();
              }
            })
            .finally(() => {
              if (loading) loading.close();
            });
        })
        .catch((action) => {
          if (action === "cancel") {
            // 用户点击驳回
            this.$prompt("请输入驳回原因", "驳回", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              inputPattern: /.+/,
              inputErrorMessage: "驳回原因不能为空",
            })
              .then(({ value }) => {
                loading = this.$loading({
                  lock: true,
                  text: "审核中...",
                  spinner: "el-icon-loading",
                  background: "rgba(0, 0, 0, 0.7)",
                });

                // 审核驳回
                sopState({ id: row.id, state: 2, remark: value })
                  .then((res) => {
                    if (res.code === 200) {
                      this.$message.success("已驳回");
                      this.getList();
                    }
                  })
                  .finally(() => {
                    if (loading) loading.close();
                  });
              })
              .catch(() => {
                // 用户取消输入驳回原因
              });
          }
        });
    },
    // 打开草稿箱
    handleOpenDraftBox() {
      this.isDraftBoxVisible = true;
    },
    // 从草稿箱编辑草稿
    handleEditDraft(draftId) {
      // 打开新增弹窗
      this.isSopAddDia = true;
      // 等待弹窗打开后加载草稿数据
      this.$nextTick(() => {
        if (this.$refs.isAddSopRef && this.$refs.isAddSopRef.loadDraft) {
          this.$refs.isAddSopRef.loadDraft(draftId);
        }
      });
    },
    // 获取用户列表
    getUserList() {
      dictUserList().then((res) => {
        this.userListOptions = res.data || [];
      });
    },
    // 打开人员管理
    async handleAddPeople() {
      this.isPeopleManageVisible = true;
      // 获取当前审核人员配置（分别获取各类型人员，和addSop.vue逻辑一致）
      // 领域编码: 3品质 4生产 5工程 6研发 10终审 14项目人员
      try {
        const [
          qualityRes,
          productionRes,
          engineerRes,
          rdRes,
          finalRes,
          projectRes,
        ] = await Promise.all([
          sopPersonList({ type: 3 }), // 品质
          sopPersonList({ type: 4 }), // 生产
          sopPersonList({ type: 5 }), // 工程
          sopPersonList({ type: 6 }), // 研发
          sopPersonList({ type: 10 }), // 终审
          sopPersonList({ type: 14 }), // 项目人员
        ]);

        this.peopleManageForm = {
          qualityData:
            qualityRes.code === 200 && qualityRes.data?.list
              ? qualityRes.data.list.map((item) => item.personnel)
              : [],
          productionData:
            productionRes.code === 200 && productionRes.data?.list
              ? productionRes.data.list.map((item) => item.personnel)
              : [],
          engineerData:
            engineerRes.code === 200 && engineerRes.data?.list
              ? engineerRes.data.list.map((item) => item.personnel)
              : [],
          rdData:
            rdRes.code === 200 && rdRes.data?.list
              ? rdRes.data.list.map((item) => item.personnel)
              : [],
          finalData:
            finalRes.code === 200 && finalRes.data?.list
              ? finalRes.data.list.map((item) => item.personnel)
              : [],
          projectData:
            projectRes.code === 200 && projectRes.data?.list
              ? projectRes.data.list.map((item) => item.personnel)
              : [],
        };
      } catch (error) {
        console.error("加载审核人员配置失败:", error);
      }
    },
    // 提交人员管理表单
    submitPeopleForm() {
      this.$refs.peopleForm.validate((valid) => {
        if (valid) {
          // 将人员数据转换为API要求的数组格式
          // 领域编码: 3品质 4生产 5工程 6研发 10终审 14项目人员
          // changeType: 1 (SOP变更类型)
          const list = [];

          // 会审-品质 (type: 3)
          this.peopleManageForm.qualityData.forEach((personnel) => {
            list.push({ personnel, type: 3, changeType: 1 });
          });

          // 会审-生产 (type: 4)
          this.peopleManageForm.productionData.forEach((personnel) => {
            list.push({ personnel, type: 4, changeType: 1 });
          });

          // 会审-工程 (type: 5)
          this.peopleManageForm.engineerData.forEach((personnel) => {
            list.push({ personnel, type: 5, changeType: 1 });
          });

          // 会审-研发 (type: 6)
          this.peopleManageForm.rdData.forEach((personnel) => {
            list.push({ personnel, type: 6, changeType: 1 });
          });

          // 终审 (type: 10)
          this.peopleManageForm.finalData.forEach((personnel) => {
            list.push({ personnel, type: 10, changeType: 1 });
          });

          // 项目人员 (type: 14)
          this.peopleManageForm.projectData.forEach((personnel) => {
            list.push({ personnel, type: 14, changeType: 1 });
          });

          sopPersonEdit(list).then((res) => {
            if (res.code === 200) {
              this.msgSuccess("人员配置成功");
              this.isPeopleManageVisible = false;
              this.getList();
            }
          });
        }
      });
    },
    /** 获取审核状态标签类型 */
    getAuditTagType(state) {
      // null 或 undefined 默认为待审核
      if (state === null || state === undefined) {
        return "warning";
      }
      const typeMap = {
        0: "warning", // 待审核 - 橙色
        1: "success", // 已通过 - 绿色
        2: "danger", // 已驳回 - 红色
      };
      return typeMap[state] || "warning";
    },
    /** 获取审核状态名称 */
    getAuditStateName(state) {
      // null 或 undefined 默认为待审核
      if (state === null || state === undefined) {
        return "待审核";
      }
      const nameMap = {
        0: "待审核",
        1: "已通过",
        2: "已驳回",
      };
      return nameMap[state] || "待审核";
    },
    /** 获取字段名称（部门类型映射） */
    getFieldName(field) {
      // type: 2品质 3生产 5研发 8终审 9工程审
      const fieldMap = {
        2: "品质",
        3: "生产",
        5: "研发",
        8: "终审",
        9: "工程审",
        2: "品质",
        3: "生产",
        5: "研发",
        8: "终审",
        9: "工程审",
      };
      return fieldMap[field] || field;
    },
  },
};
</script>
<style lang="scss">
.finish-row td,
.finish-row:hover td {
  background-color: rgba(155, 216, 148, 0.3) !important;
}

.reject-row td,
.reject-row:hover td {
  background-color: rgba(224, 82, 99, 0.3) !important;
}

.text-orange {
  color: #e6a23c;
}

.text-grey {
  color: #909399;
}

.text-green {
  color: #67c23a;
}

.text-blue {
  color: #409eff;
}

.text-red {
  color: #f56c6c;
}

.text-cyan {
  color: #17a2b8;
}

.text-purple {
  color: #9c27b0;
}

.w100 {
  width: 100%;
}
</style>
