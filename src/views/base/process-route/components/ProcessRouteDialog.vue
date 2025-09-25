<template>
  <el-dialog :title="title" :visible.sync="visible" width="800px" append-to-body @close="handleClose" top="0vh" :close-on-click-modal="false" >
    <el-form ref="form" :model="formData" :rules="rules" label-width="80px"  >
      <el-row  style="margin-bottom: 20px;">
        <el-col :span="12">
          <el-form-item label="仪表型号" prop="category">
            <TypedSelectLoadMore
              v-model="formData.category"
              type="category"
              customStyle="width: 150px"
              size="mini"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-table :data="formData.detailList" border style="width: 100%" max-height="500px">
        <el-table-column label="序号" type="index" width="50" align="center" />
        <el-table-column label="工序类型" prop="processType" width="180">
          <template slot-scope="scope">
            <span>{{ getProcessTypeName(scope.row.processType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="换线时间(min)" prop="changeoverTime"  >
          <template slot-scope="scope">
            <el-input-number 
              v-model="scope.row.changeoverTime" 
              :min="0" 
              :precision="0" 
              controls-position="right"
              size="mini"
              style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="标准人数" prop="standardPersonnel">
          <template slot-scope="scope">
            <el-input-number 
              v-model="scope.row.standardPersonnel" 
              :min="0" 
              :precision="0" 
              controls-position="right"
              size="mini"
              style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="标准产能(PCS/H)" prop="standardCapacity"  >
          <template slot-scope="scope">
            <el-input-number 
              v-model="scope.row.standardCapacity" 
              :min="0" 
              :precision="0" 
              controls-position="right"
              size="mini"
              style="width: 100%"
              :disabled="!!formData.sopId" />
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addProcessRoute, updateProcessRoute } from "@/api/base/processRoute";
import { afterCategoryList } from '@/api/third/sale';
import { mapGetters } from 'vuex';

export default {
  name: "ProcessRouteDialog",
  props: {
    title: {
      type: String,
      default: ""
    },
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
      // 表单参数
      formData: {
        id: null,
        category: null,
        responsiblePerson: "",
        sopId: null,
        detailList: []
      },
      // 工序类型选项
      processTypeOptions: [],
      // 品类数据
      categoryData: {
        data: [],
        page: 1,
        more: true
      },
      // 用户数据
      userData: {
        data: [],
        page: 1,
        more: true
      },
      // 表单校验
      rules: {
        category: [
          { required: true, message: "品类不能为空", trigger: "change" }
        ],
        responsiblePerson: [
          { required: true, message: "负责人不能为空", trigger: "blur" }
        ],
        processType: [
          { required: true, message: "工序类型不能为空", trigger: "change" }
        ],
        changeoverTime: [
          { required: true, message: "换线时间不能为空", trigger: "blur" }
        ],
        standardPersonnel: [
          { required: true, message: "标准人数不能为空", trigger: "blur" }
        ],
        standardCapacity: [
          { required: true, message: "标准产能不能为空", trigger: "blur" }
        ],
        laborHours: [
          { required: true, message: "人工工时不能为空", trigger: "blur" }
        ],
        unitCapacityPerPerson: [
          { required: true, message: "单位人时产能不能为空", trigger: "blur" }
        ]
      }
    };
  },
  computed: {
    ...mapGetters(['name', 'nickName'])
  },
  watch: {
    open(val) {
      this.visible = val;
      if (val) {
        // 确保工序类型数据已加载后再初始化表单
        if (this.processTypeOptions.length > 0) {
          this.initFormData();
        } else {
          // 如果工序类型数据还没加载，等待加载完成
          this.getDicts("sop_process_type").then(response => {
            this.processTypeOptions = response.data;
            this.initFormData();
          });
        }
      }
    }
  },
  created() {
    this.getCategoryData({ page: 1 });
    this.getUserData({ page: 1 });
    this.loadProcessTypeDict();
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      if (this.processRoute.id) {
        // 编辑模式，复制对象避免直接修改props
        this.formData = JSON.parse(JSON.stringify(this.processRoute));
        // 确保detailList存在并补充缺失的工序类型
        this.ensureAllProcessTypes();
      } else {
        // 新增模式
        this.formData = {
          id: null,
          category: null,
          responsiblePerson: this.nickName || this.name || "",
          sopId: null,
          detailList: []
        };
        // 自动生成所有工序类型
        this.generateAllProcessTypes();
      }
    },
    // 获取品类数据
    getCategoryData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
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
      });
    },
    // 自动生成所有工序类型
    generateAllProcessTypes() {
      console.log('生成所有工序类型 - processTypeOptions:', this.processTypeOptions);
      
      if (!this.processTypeOptions || this.processTypeOptions.length === 0) {
        console.log('工序类型选项为空，设置空列表');
        this.formData.detailList = [];
        return;
      }
      
      // 去重处理，避免重复的工序类型
      const uniqueProcessTypes = [];
      const processTypeSet = new Set();
      
      this.processTypeOptions.forEach(dict => {
        const processTypeValue = parseInt(dict.dictValue);
        console.log(`处理字典项: ${dict.dictLabel} (${dict.dictValue})`);
        
        if (!processTypeSet.has(processTypeValue)) {
          processTypeSet.add(processTypeValue);
          uniqueProcessTypes.push({
            id: null,
            processRouteId: this.formData.id,
            processType: processTypeValue,
            changeoverTime: 0,
            standardPersonnel: 0,
            standardCapacity: 0,
            laborHours: 0,
            unitCapacityPerPerson: 0
          });
          console.log(`添加工序类型: ${processTypeValue}`);
        } else {
          console.log(`跳过重复工序类型: ${processTypeValue}`);
        }
      });
      
      console.log('最终生成的detailList:', uniqueProcessTypes);
      this.formData.detailList = uniqueProcessTypes;
    },
    // 确保所有工序类型都存在（编辑模式）
    ensureAllProcessTypes() {
      if (!this.formData.detailList) {
        this.formData.detailList = [];
      }
      
      if (!this.processTypeOptions || this.processTypeOptions.length === 0) {
        return;
      }
      
      // 去重处理，获取唯一的工序类型
      const uniqueProcessTypeValues = new Set();
      this.processTypeOptions.forEach(dict => {
        uniqueProcessTypeValues.add(parseInt(dict.dictValue));
      });
      
      // 检查每个唯一工序类型是否存在
      uniqueProcessTypeValues.forEach(processTypeValue => {
        const existingItem = this.formData.detailList.find(item => item.processType === processTypeValue);
        
        if (!existingItem) {
          // 如果不存在，添加新的工序类型
          this.formData.detailList.push({
            id: null,
            processRouteId: this.formData.id,
            processType: processTypeValue,
            changeoverTime: 0,
            standardPersonnel: 0,
            standardCapacity: 0,
            laborHours: 0,
            unitCapacityPerPerson: 0
          });
        }
      });
    },
    // 获取工序类型名称
    getProcessTypeName(processTypeValue) {
      if (!this.processTypeOptions || this.processTypeOptions.length === 0) {
        return '加载中...';
      }
      const dict = this.processTypeOptions.find(item => parseInt(item.dictValue) === processTypeValue);
      return dict ? dict.dictLabel : '未知工序';
    },
    // 关闭对话框
    handleClose() {
      this.$emit("close");
    },
    /** 加载工序类型字典数据 */
    loadProcessTypeDict() {
      // 从父组件获取字典数据，或者直接调用API
      import('@/api/system/dict/data').then(({ getDicts }) => {
        getDicts('sop_process_type').then(res => {
          console.log('原始字典数据:', res.data);
          
          // 按 dictSort 排序，小的在前面
          const sortedData = (res.data || []).sort((a, b) => {
            const sortA = parseInt(a.dictSort) || 0;
            const sortB = parseInt(b.dictSort) || 0;
            return sortA - sortB;
          });
          
          console.log('排序后的数据:', sortedData);
          this.processTypeOptions = sortedData;
          
          // 如果对话框已经打开，重新初始化表单数据
          if (this.visible) {
            this.initFormData();
          }
        }).catch(() => {
          console.error('获取工序类型字典失败');
          this.processTypeOptions = [];
        });
      });
    },
    /** 获取用户数据 */
    getUserData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        import('@/api/system/user').then(({ dictUserList }) => {
          dictUserList({
            p: page,
            pageSize: 20,
            nickName: keyword,
          }).then((res) => {
            if (res && res.data) {
              let list = res.data.map(user => ({
                id: user.id,
                userName: user.userName,
                displayName: user.nickName || user.userName
              }));

              // 去重处理
              const uniqueUsers = [];
              const userNameSet = new Set();
              list.forEach(user => {
                if (!userNameSet.has(user.userName)) {
                  userNameSet.add(user.userName);
                  uniqueUsers.push(user);
                }
              });

              if (more) {
                this.userData.data = [...this.userData.data, ...uniqueUsers];
              } else {
                this.userData.data = uniqueUsers;
              }

              // 计算是否还有更多数据
              this.userData.more = uniqueUsers.length >= 20;
              this.userData.page = page;
            } else {
              console.error('获取用户数据失败:', res?.msg);
              this.userData.data = [];
              this.userData.more = false;
            }
            resolve();
          }).catch(error => {
            console.error('获取用户数据异常:', error);
            this.userData.data = [];
            this.userData.more = false;
            resolve();
          });
        }).catch(error => {
          console.error('导入用户API失败:', error);
          this.userData.data = [];
          this.userData.more = false;
          resolve();
        });
      });
    },
    // 提交表单
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          const formData = JSON.parse(JSON.stringify(this.formData));
          
          // 处理日期格式化问题 - 移除或格式化日期字段
          // 后端期望 yyyy-MM-dd HH:mm:ss 格式，但前端可能传递了 yyyy-MM-dd 格式
          if (formData.createTime) {
            // 如果是编辑模式且有createTime，移除它让后端自动处理
            delete formData.createTime;
          }
          if (formData.updateTime) {
            // 移除updateTime让后端自动处理
            delete formData.updateTime;
          }
          
          // 验证工艺路线详情数据
          if (formData.detailList && formData.detailList.length > 0) {
            // 处理详情列表中的日期字段
            formData.detailList.forEach(detail => {
              if (detail.createTime) {
                delete detail.createTime;
              }
              if (detail.updateTime) {
                delete detail.updateTime;
              }
            });
            
            // 提交所有工序类型数据，不再过滤0值或空数据
            // 移除了之前的验证和过滤逻辑，现在提交所有工序数据
          }
          
          if (formData.id) {
            // 更新
            updateProcessRoute(formData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.$emit("submit");
            });
          } else {
            // 新增
            addProcessRoute(formData).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.$emit("submit");
            });
          }
        }
      });
    }
  }
};
</script>

<style scoped lang="scss">
.mb0 {
  margin-bottom: 0;
}

/* 表格内输入框样式 */
::v-deep .el-table {
  .el-input-number {
    width: 100%;
  }
  
  .el-input-number .el-input__inner {
    text-align: center;
  }
  
  /* 确保表格单元格内容居中 */
  .cell {
    text-align: center;
  }
  
  /* 表格行高度调整 */
  .el-table__row {
    height: 50px;
  }
  
  /* 表格单元格内边距 */
  .el-table td {
    padding: 8px 0;
  }
}
</style>