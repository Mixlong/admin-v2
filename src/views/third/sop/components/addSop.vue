<template>
  <el-dialog class="sop-form-dialog" :title="isTitle" :visible="visible" width="1000px" append-to-body center top="0vh"
    :close-on-click-modal="false" @close="close">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="sop-form" v-form-scroll-error>
      <!-- 基本信息 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">基本信息</legend>
        <div class="fieldset-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="品类" prop="categoryId">
                <TypedSelectLoadMore
              ref="categorySelect"
              v-model="form.categoryId"
              type="category"
              customStyle="width: 100%"
              size="mini"
              @change="handleCategoryChange"
            />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="版本号" prop="versionCode">
                <el-input v-model="form.versionCode" clearable placeholder="请输入版本号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="版本描述" prop="desc">
            <el-input v-model="form.desc" type="textarea" clearable :rows="3" placeholder="请输入版本描述" />
          </el-form-item>
          <el-form-item label="封面图" prop="topImg">
            <ImageUpload 
              v-model="form.topImg" 
              :accept="'image/*'"
              :showFileList="true"
                   :sortable="true"
              listType="picture-card"
              css="width: 200px; height: 120px;"
              class="top-img-upload">
              <div class="upload-placeholder">
                <i class="el-icon-plus"></i>
              </div>
            </ImageUpload>
          </el-form-item>
          <el-form-item label="排拉表" prop="sortImg">
            <ImageUpload 
              v-model="form.sortImg" 
              :accept="'image/*'"
              :showFileList="true"
              :sortable="true"
              listType="picture-card"
              css="width: 200px; height: 120px;"
              class="top-img-upload">
              <div class="upload-placeholder">
                <i class="el-icon-plus"></i>
              </div>
            </ImageUpload>
          </el-form-item>
        </div>
      </fieldset>

      <!-- 历史文件 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">
          历史文件
          <DrUpload v-model="form.historyFile" :useObjectFormat="true" :showFileList="false" class="legend-upload">
            <el-button size="small" type="text">
              点击上传
            </el-button>
          </DrUpload>
        </legend>
        <div class="fieldset-content">
          <!-- 用表格展示已上传的文件 -->
          <el-table :data="historyFileList" border style="width: 100%" empty-text="暂无历史文件">
            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
            <el-table-column prop="name" label="文件名" min-width="200" align="center">
              <template slot-scope="{ row }">
                <el-link :href="row.url" target="_blank" type="primary" :underline="false">
                  <i class="el-icon-document"></i>
                  {{ row.name }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="上传时间" width="160" align="center">
              <template slot-scope="{ row }">
                {{ formatUploadTime(row.uploadTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template slot-scope="{ row, $index }">
                <el-button size="mini" type="text" @click="previewFile(row)">预览</el-button>
                <el-button size="mini" type="text" style="color: #f56c6c;"
                  @click="removeHistoryFile($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </fieldset>
      <!-- 工位管理 -->
      <div ref="stationBoxRef" v-loading="isSubLoading" element-loading-text="处理中...">
        <!-- 工序类型tabs -->
        <div class="tabs-container">
          <div class="tabs-header">
            <el-tabs v-model="activeProcessType" type="border-card" class="process-tabs">
              <el-tab-pane 
                v-for="processType in processTypeOptions" 
                :key="processType.dictValue"
                :label="processType.dictLabel" 
                :name="processType.dictValue">
                
                <!-- 每个tab的工位列表 -->
                <div class="workstation-list">
                  <transition-group name="workstation-list" tag="div" class="workstation-transition-group">
                    <WorkstationItem
                      v-for="(workstation, index) in form.workstations[processType.dictValue] || []"
                      :key="`${processType.dictValue}_${workstation.id || index}_${workstation._renderKey || ''}`"
                      :workstation="workstation"
                      :item-index="index"
                      :process-type="processType.dictValue"
                      :equipment-options="equipmentOptions"
                      :process-type-options="processTypeOptions"
                      :total-items-in-process="(form.workstations[processType.dictValue] || []).length"
                      :is-focused="focusedWorkstationId === workstation.id"
                      :rules="rules"
                      :action-url="actionUrl"
                      :accept="accept"
                      @drag-start="onDragStart"
                      @drag-end="onDragEnd"
                      @file-change="onFileChange"
                      @move-up="onMoveUp"
                      @move-down="onMoveDown"
                      @move-to-process="onMoveToProcess"
                      @copy-item="onCopyItem"
                      @remove-item="onRemoveItem"
                      @save-item="onSaveItem"
                      @index-num-input="handleIndexNumInput"
                      @spend-time-change="handleSpendTimeChange"
                      @validate-field="validateField"
                    />
                  </transition-group>
                  
                  <!-- 添加工位按钮 -->
                  <div class="add-workstation-btn">
                    <el-button type="dashed" size="large" @click="addWorkstation(processType.dictValue)" icon="el-icon-plus">
                      添加{{ processType.dictLabel }}工位
                    </el-button>
                  </div>
                </div>
                
              </el-tab-pane>
            </el-tabs>
            
            <!-- PDF上传按钮 (Element UI 2.3兼容版本) -->
            <div class="pdf-upload-container">
              <el-tooltip 
                :content="`上传PDF到${getProcessTypeLabel(activeProcessType)}工序`" 
                placement="bottom">
                <el-button 
                  type="primary" 
                  size="small" 
                  :disabled="isSubLoading" 
                  @click="handlePdfUpload" 
                  icon="el-icon-upload2">
                  {{ isSubLoading ? '上传中...' : '上传PDF' }}
                </el-button>
              </el-tooltip>
              <input ref="pdfFileInput" type="file" accept="application/pdf" style="display: none"
                @change="onPdfFileSelected">
            </div>
          </div>
        </div>
      </div>
    </el-form>

    <!-- 底部操作区 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
      <el-button v-if="!form.id" type="info" :loading="isSavingDraft" @click="saveDraft">
        {{ isSavingDraft ? '保存中...' : '保存草稿' }}
      </el-button>
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        {{ isSubLoading ? '保存中...' : '确定' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { sopSave, sopUpdate } from "@/api/third/testApi";
import { getDicts } from "@/api/system/dict/data";
import axios from "axios";
import ElUploadSortable from "@/components/el-upload-sortable";
import reqUrl from "@/utils/requestUrl";
import draggable from "vuedraggable";
import _ from "lodash";
import DrUpload from "@/components/Upload";
import ImageUpload from "@/components/el-upload-sortable/index.vue";
import WorkstationItem from "./WorkstationItem.vue";
export default {
  components: {
    draggable,
    ElUploadSortable,
    DrUpload,
    ImageUpload,
    WorkstationItem,
  },
  props: {
    dictList: Array,
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentPdfIndex: -1, // 当前处理PDF的索引
      drag: false,
      dragSourceIndex: -1, // 拖拽源行索引
      dragImageIndex: -1, // 拖拽图片索引
      dragOverIndex: -1, // 拖拽目标行索引
      actionUrl: reqUrl + "/oss/batch-upload",
      accept: "image/*,video/*",
      // 提交loading
      isSubLoading: false,
      // 草稿保存loading
      isSavingDraft: false,
      // 当前加载的草稿ID
      currentDraftId: null,
      historyFileList: [], // 历史文件表格数据
      uploadingItems: {}, // 上传中的文件信息 {[index]: {name, type, preview, percentage, loaded, total}}
      pendingUpload: null, // 待上传文件信息
      equipmentOptions: [], // 装备字典选项
      processTypeOptions: [ // 工序类型字典选项（默认值，避免模板报错）
 
      ],
      activeProcessType: '1', // 当前激活的工序类型tab
      focusedWorkstationId: null, // 当前聚焦的工位ID
      // 表单参数
      form: {
        categoryId: "",
        versionCode: "",
        desc: "",
        topImg: "", // 封面图
        historyFile: [], // 历史文件对象数组格式
        workstations: {
          '1': [], // 生产工位
          '2': [], // 组装工位  
          '3': [], // 包装工位
        },
      },
      cloneForm: {},
      originalForm: {}, // 保存原始表单数据用于对比
      isCLoading: false,
      // 表单校验
      rules: {
        categoryId: [
          { required: true, message: "请选择品类", trigger: "change" },
        ],
        versionCode: [
          { required: true, message: "请输入版本号", trigger: ["blur", "change"] },
        ],
        desc: [{ required: true, message: "请输入版本描述", trigger: ["blur", "change"] }],
        topImg: [
          { required: true, message: "请上传封面图", trigger: ["blur", "change"] }
        ],
        indexNum: [
          { required: true, message: "请输入序号", trigger: "change" },
        ],
        file: [
          {
            required: true,
            message: "请上传图片或视频文件",
            trigger: ["change", "blur"],
            validator: (rule, value, callback) => {
              if (!value || value.trim() === '') {
                callback(new Error('请上传图片或视频文件'));
                return;
              }
              
              // 简单检查文件字符串是否包含有效URL
              const urls = value.split(',').filter(url => url.trim());
              if (urls.length === 0) {
                callback(new Error('请上传图片或视频文件'));
                return;
              }
              
              // 检查是否有有效的URL格式
              const hasValidUrl = urls.some(url => {
                const trimmedUrl = url.trim();
                return trimmedUrl && (trimmedUrl.startsWith('http') || trimmedUrl.startsWith('//'));
              });
              
              if (!hasValidUrl) {
                callback(new Error('文件无效，请重新上传'));
                return;
              }
              
              callback();
            }
          },
        ],
        remark: [
          { required: false, message: "工位文件描述为空", trigger: ["blur", "change"] },
        ],
        spendTime: [
          {
            validator: (rule, value, callback) => {
              // 工时必填
              if (value === null || value === undefined || value === '') {
                callback(new Error('请输入工时'));
              } else if (isNaN(value) || parseFloat(value) <= 0) {
                callback(new Error('工时必须大于0'));
              } else {
                callback();
              }
            },
            trigger: ["blur", "change"]
          }
        ]
      },
    };
  },
  computed: {
    isTitle() {
      return this.form.id ? "编辑SOP" : "添加SOP";
    },
  },
  watch: {
    visible(isShow) {
      if (!isShow) {
        this.reset();
      }
    },
  },
  watch: {
    // 监听 form.historyFile 的变化，同步更新表格数据
    'form.historyFile': {
      handler(newFileList) {
        console.log('form.historyFile 变化:', newFileList);
        if (Array.isArray(newFileList)) {
          this.updateHistoryFileList(newFileList);
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    // 加载装备字典数据
    this.loadEquipmentDict();
  },
  mounted() {
    // 监听 TypedSelectLoadMore 的选择事件，获取完整的选项信息
    this.$nextTick(() => {
      // 尝试获取 TypedSelectLoadMore 组件实例
      this.setupCategoryListener();
    });
  },
  methods: {
    // 加载装备字典数据
    async loadEquipmentDict() {
      try {
        const [response, response2] = await Promise.all([
          getDicts('sop_equipment'),
          getDicts('sop_process_type')
        ])
         
        if (response && response.data) {
          this.equipmentOptions = response.data;
        }
        if(response2 && response2.data) {
          this.processTypeOptions = response2.data;
          // 字典数据加载完成后，重新排序工位序号
          this.$nextTick(() => {
            this.reorderAllWorkstationIndexes();
          });
        }
      } catch (error) {
        console.error('加载装备字典数据失败:', error);
        this.equipmentOptions = [];
        // 保持默认的processTypeOptions，不清空
      }
    },
    close() {
      this.$emit("update:visible", false);
    },
    /** 处理品类选择变化 */
    handleCategoryChange(value) {
      // value 是选中的品类ID
      console.log('品类ID变化:', value);
      
      // 从 TypedSelectLoadMore 组件中获取对应的品类名称
      this.$nextTick(() => {
        if (this.$refs.categorySelect && this.$refs.categorySelect.componentData) {
          const categoryData = this.$refs.categorySelect.componentData.data || [];
          const selectedCategory = categoryData.find(item => {
            // 根据 type="category" 的配置，dictValue 是 'id'
            return item.id == value || item.id === value;
          });
          
          if (selectedCategory) {
            // 根据 type="category" 的配置，dictLabel 是 'name'
            const categoryName = selectedCategory.name || selectedCategory.label || value;
            console.log('品类名称:', categoryName);
            this.$set(this.form, 'categoryName', categoryName);
          }
        }
      });
    },
    /** 设置品类选择器监听 */
    setupCategoryListener() {
      // 这个方法不再需要，因为我们已经在 handleCategoryChange 中处理了
    },
    // 表单重置
    reset() {
      this.form = {
        categoryId: "",
        versionCode: "",
        desc: "",
        topImg: "", // 重置封面图
        historyFile: [],
        workstations: {
          '1': [], // 生产工位
          '2': [], // 组装工位  
          '3': [], // 包装工位
        },
      };
      this.historyFileList = []; // 重置历史文件表格数据
      this.activeProcessType = '1'; // 重置到第一个tab
      this.currentDraftId = null; // 清除草稿ID
      // 确保表单引用存在后再重置
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetFields();
        }
      });
    },
    // 新增工位文件（按工序类型）
    addWorkstation(processType) {
      if (!this.form.workstations[processType]) {
        this.form.workstations[processType] = [];
      }
      
      const newWorkstation = {
        id: `ws_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`, // 唯一ID
        indexNum: 1, // 临时序号，会通过reorderAllWorkstationIndexes重新计算
        file: "",
        remark: "",
        spendTime: null,
        equipment: [], // 装备字段（多选）
        processType: processType, // 工序类型
        isProcess: 0, // 默认未发布
      };
      
      this.form.workstations[processType].push(newWorkstation);
      // 重新排序所有工位的序号（从第一个tabs开始连续编号）
      this.reorderAllWorkstationIndexes();
      this.onSetStationBoxRef();
    },

    // 将分组工位数据转换为列表格式
    convertWorkstationsToList(workstations) {
      let list = [];
      
      // 遍历所有工序类型
      this.processTypeOptions.forEach(processType => {
        const processValue = processType.dictValue;
        const workstationList = workstations[processValue] || [];
        
        workstationList.forEach((workstation) => {
          list.push({
            ...workstation,
            processType: processValue,
            isProcess: workstation.isProcess || 0,
            indexNum: workstation.indexNum, // 使用已经排序好的连续序号
          });
        });
      });
      
      return list;
    },

    // 将列表数据转换为分组格式
    convertListToWorkstations(list) {
      const workstations = {
        '1': [],
        '2': [],
        '3': [],
      };
      
      if (list && list.length > 0) {
        list.forEach(item => {
          const processType = item.processType || '1'; // 默认生产工序
          if (!workstations[processType]) {
            workstations[processType] = [];
          }
          workstations[processType].push({
            ...item,
            id: item.id || `workstation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 确保有ID
            equipment: this.processEquipmentField(item.equipment),
          });
        });
      }
      
      // 重新编排序号
      this.reorderWorkstationsIndexes(workstations);
      
      return workstations;
    },

    // WorkstationItem组件事件处理方法
    onFileChange(workstation, index, processType) {
      // 文件变化时触发，可以在这里添加额外的业务逻辑
      console.log('文件变化:', workstation, index, processType);
    },

    onCopyItem(index, processType) {
      const workstationList = this.form.workstations[processType];
      if (workstationList && workstationList[index]) {
        const item = {
          ...workstationList[index],
          id: `ws_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`, // 新的唯一ID
          indexNum: 1, // 临时序号，会通过reorderAllWorkstationIndexes重新计算
        };
        workstationList.splice(index + 1, 0, item);
        // 重新排序所有工位的序号（从第一个tabs开始连续编号）
        this.reorderAllWorkstationIndexes();
      }
    },

    onMoveUp(index, processType) {
      const workstationList = this.form.workstations[processType];
      if (workstationList && index > 0) {
        // 获取被移动工位的ID
        const movedWorkstationId = workstationList[index].id;
        
        // 交换位置
        const temp = workstationList[index];
        this.$set(workstationList, index, workstationList[index - 1]);
        this.$set(workstationList, index - 1, temp);
        
        // 重新排序所有工位的序号（从第一个tabs开始连续编号）
        this.reorderAllWorkstationIndexes();
        
        // 设置聚焦状态
        this.setWorkstationFocus(movedWorkstationId);
      }
    },

    onMoveDown(index, processType) {
      const workstationList = this.form.workstations[processType];
      if (workstationList && index < workstationList.length - 1) {
        // 获取被移动工位的ID
        const movedWorkstationId = workstationList[index].id;
        
        // 交换位置
        const temp = workstationList[index];
        this.$set(workstationList, index, workstationList[index + 1]);
        this.$set(workstationList, index + 1, temp);
        
        // 重新排序所有工位的序号（从第一个tabs开始连续编号）
        this.reorderAllWorkstationIndexes();
        
        // 设置聚焦状态
        this.setWorkstationFocus(movedWorkstationId);
      }
    },

    onMoveToProcess(index, sourceProcessType, targetProcessType) {
      const sourceList = this.form.workstations[sourceProcessType];
      const targetList = this.form.workstations[targetProcessType];
      
      if (sourceList && targetList && sourceList[index]) {
        // 从源列表中移除工位
        const workstation = sourceList.splice(index, 1)[0];
        
        // 更新工序类型
        workstation.processType = targetProcessType;
        
        // 添加到目标列表
        targetList.push(workstation);
        
        // 重新排序所有工位的序号（从第一个tabs开始连续编号）
        this.reorderAllWorkstationIndexes();
        
        // 切换到目标tab
        this.activeProcessType = targetProcessType;
        
        this.$message.success(`工位已移动到${this.getProcessTypeLabel(targetProcessType)}`);
      }
    },

    // 获取工序类型标签
    getProcessTypeLabel(processType) {
      const option = this.processTypeOptions.find(opt => opt.dictValue === processType);
      return option ? option.dictLabel : processType;
    },

    // 设置工位聚焦状态
    setWorkstationFocus(workstationId) {
      this.focusedWorkstationId = workstationId;
      
      // 2秒后自动清除聚焦状态
      setTimeout(() => {
        if (this.focusedWorkstationId === workstationId) {
          this.focusedWorkstationId = null;
        }
      }, 2000);
    },

    // 重新编排所有工位的序号，从第一个tabs开始连续编号
    reorderAllWorkstationIndexes() {
      let globalIndex = 1;
      
      // 如果processTypeOptions还没加载完成，使用默认顺序
      const processTypes = this.processTypeOptions.length > 0 
        ? this.processTypeOptions 
        : [
            { dictValue: '1', dictLabel: '生产' },
            { dictValue: '2', dictLabel: '组装' },
            { dictValue: '3', dictLabel: '包装' }
          ];
      
      // 按照工序类型的顺序重新编号
      processTypes.forEach(processType => {
        const processValue = processType.dictValue;
        const workstationList = this.form.workstations[processValue] || [];
        
        workstationList.forEach(workstation => {
          workstation.indexNum = globalIndex++;
        });
      });
    },

    // 重新编排工位对象的序号（用于数据加载时）
    reorderWorkstationsIndexes(workstations) {
      let globalIndex = 1;
      
      // 如果processTypeOptions还没加载完成，使用默认顺序
      const processTypes = this.processTypeOptions.length > 0 
        ? this.processTypeOptions 
        : [
            { dictValue: '1', dictLabel: '生产' },
            { dictValue: '2', dictLabel: '组装' },
            { dictValue: '3', dictLabel: '包装' }
          ];
      
      // 按照工序类型的顺序重新编号
      processTypes.forEach(processType => {
        const processValue = processType.dictValue;
        const workstationList = workstations[processValue] || [];
        
        workstationList.forEach(workstation => {
          workstation.indexNum = globalIndex++;
        });
      });
    },

    onRemoveItem(index, processType) {
      const workstationList = this.form.workstations[processType];
      if (workstationList && workstationList[index]) {
        workstationList.splice(index, 1);
        // 重新排序所有工位的序号（从第一个tabs开始连续编号）
        this.reorderAllWorkstationIndexes();
      }
    },

    onSaveItem(workstation, index, processType) {
      // 保存工位时的回调，可以添加业务逻辑
      console.log('保存工位:', workstation, index, processType);
    },

    validateField(fieldProp) {
      if (this.$refs.form && this.$refs.form.validateField) {
        this.$refs.form.validateField(fieldProp);
      }
    },

    onSetStationBoxRef() {
      // 检查 stationBoxRef 是否存在
      if (!this.$refs.stationBoxRef) {
        console.warn('stationBoxRef 不存在，跳过滚动操作');
        return;
      }

      const scrollRef = this.$refs.stationBoxRef.$el;
      if (!scrollRef) {
        console.warn('stationBoxRef.$el 不存在，跳过滚动操作');
        return;
      }

      const scrollHeight = scrollRef.scrollHeight;

      this.$nextTick(() => {
        if (scrollRef && scrollRef.scrollHeight) {
          scrollRef.scrollTop = scrollHeight;
        }
      });
    },
    /** 获取文件列表 - 将字符串转换为对象数组 */
    getFileList(fileString) {
      if (!fileString) return [];
      const urls = fileString.split(',').filter(url => url.trim());
      return urls.map((url, index) => ({
        id: `${Date.now()}_${index}`,
        url: url.trim(),
        name: url.split('/').pop() || `文件${index + 1}`
      }));
    },

    /** 获取项目唯一键 */
    getItemKey(item) {
      return item.id;
    },

    /** 拖拽开始事件 */
    onDragStart(evt, rowIndex) {
      console.log('开始拖拽，行索引:', rowIndex);
      this.dragSourceIndex = rowIndex;
    },

    /** 拖拽结束事件 */
    onDragEnd(evt) {
      console.log('拖拽结束');
      this.dragSourceIndex = -1;
    },


    checkListItem() {
      let arr = [];
      
      // 遍历所有工序类型的工位
      for (const processType of this.processTypeOptions) {
        const processValue = processType.dictValue;
        const workstationList = this.form.workstations[processValue] || [];
        
        for (const { indexNum } of workstationList) {
          if (arr.includes(indexNum)) {
            this.msgError("工位序号不能重复");
            return true;
          } else {
            arr.push(indexNum);
          }
        }
      }
      return false;
    },

    /** 验证工序文件 */
    checkWorkStationFiles() {
      let workstationIndex = 1;
      
      // 遍历所有工序类型
      for (const processType of this.processTypeOptions) {
        const processValue = processType.dictValue;
        const workstationList = this.form.workstations[processValue] || [];
        
        for (let i = 0; i < workstationList.length; i++) {
          const item = workstationList[i];
          
          // 检查文件是否为空
          if (!item.file || item.file.trim() === '') {
            this.msgError(`第${workstationIndex}个工位（${processType.dictLabel}）必须上传图片或视频文件`);
            return true;
          }
          
          // 检查文件是否有效（有实际的URL）
          const fileList = this.getFileList(item.file);
          if (fileList.length === 0) {
            this.msgError(`第${workstationIndex}个工位（${processType.dictLabel}）必须上传图片或视频文件`);
            return true;
          }
          
          // 验证每个文件URL是否有效
          const hasValidFile = fileList.some(file => {
            const url = file.url && file.url.trim();
            return url && url !== '';
          });
          
          if (!hasValidFile) {
            this.msgError(`第${workstationIndex}个工位（${processType.dictLabel}）的文件无效，请重新上传`);
            return true;
          }
          
          workstationIndex++;
        }
      }
      
      return false; // 验证通过
    },
    /** 触发PDF文件选择 */
    handlePdfUpload() {
      this.$refs.pdfFileInput.click();
    },

    /** PDF文件选择后的处理 */
    onPdfFileSelected(event) {
      const file = event.target.files[0];
      this.isSubLoading = true;
      if (!file) return;

      if (file.type !== 'application/pdf') {
        this.msgError('请上传PDF格式文件');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      this.isSubLoading = true;
      // 调用后端接口转换PDF为图片并上传至OSS
      axios.post(reqUrl + '/file/converterToOss', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }).then(response => {
        this.processPdfResponse(response.data);
      }).catch(error => {
        console.error('PDF转换失败:', error);
        this.msgError('PDF转换上传失败，请重试');
      }).finally(() => {
        this.isSubLoading = false;
        // 重置文件输入框，以便于再次选择同一文件
        this.$refs.pdfFileInput.value = '';
      });
    },

    /** 处理PDF转换响应数据 */
    processPdfResponse(data) {
      if (data.code === 200 && data.data) {
        // 将获取的OSS图片URL数组添加到表单项中
        if (Array.isArray(data.data)) {
          // 查找当前最大序号
          let maxIndexNum = 0;
          // 查找当前工序类型的所有工位的最大序号
          const currentWorkstationList = this.form.workstations[this.activeProcessType] || [];
          currentWorkstationList.forEach(item => {
            if (item.indexNum && parseInt(item.indexNum) > maxIndexNum) {
              maxIndexNum = parseInt(item.indexNum);
            }
          });

          // 处理PDF转换得到的图片
          data.data.forEach((imageData, idx) => {
            // 清理URL中的反引号和空格
            let cleanUrl = imageData.url;
            if (typeof cleanUrl === 'string') {
              cleanUrl = cleanUrl.replace(/`/g, '').trim();
            }

            // 查找空项或添加新项
            const emptyIndex = currentWorkstationList.findIndex(item => !item.file);
            if (emptyIndex !== -1) {
              // 更新空项
              currentWorkstationList[emptyIndex].file = cleanUrl;
              // 序号会通过reorderAllWorkstationIndexes重新计算
              if (!currentWorkstationList[emptyIndex].indexNum) {
                currentWorkstationList[emptyIndex].indexNum = 1; // 临时序号
              }
              // 触发验证以清除错误提示
              this.$nextTick(() => {
                this.$refs.form && this.$refs.form.validateField(`workstations.${this.activeProcessType}[${emptyIndex}].file`);
              });
            } else {
              // 如果没有空项，则添加新项
              const newWorkstation = {
                id: `ws_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`, // 唯一ID
                indexNum: 1, // 临时序号，会通过reorderAllWorkstationIndexes重新计算
                file: cleanUrl,
                remark: '',
                spendTime: null,
                equipment: [], // 装备字段（多选）
                processType: this.activeProcessType,
                isProcess: 0,
              };
              currentWorkstationList.push(newWorkstation);
              const newIndex = currentWorkstationList.length - 1;
              // 触发验证以清除错误提示
              this.$nextTick(() => {
                this.$refs.form && this.$refs.form.validateField(`workstations.${this.activeProcessType}[${newIndex}].file`);
              });
            }
          });
          // 重新排序所有工位的序号（从第一个tabs开始连续编号）
          this.reorderAllWorkstationIndexes();
          // 更新站位盒子引用
          this.onSetStationBoxRef();
          this.msgSuccess('PDF转换成功');
        } else {
          // 处理单个URL的情况
          let cleanUrl = data.data;
          if (typeof cleanUrl === 'string') {
            cleanUrl = cleanUrl.replace(/`/g, '').trim();
          }

          const currentWorkstationList = this.form.workstations[this.activeProcessType] || [];
          const emptyIndex = currentWorkstationList.findIndex(item => !item.file);
          if (emptyIndex !== -1) {
            currentWorkstationList[emptyIndex].file = cleanUrl;
            // 触发验证以清除错误提示
            this.$nextTick(() => {
              this.$refs.form && this.$refs.form.validateField(`workstations.${this.activeProcessType}[${emptyIndex}].file`);
            });
          } else {
            // 如果没有空项，则添加新项
            const newWorkstation = {
              id: `ws_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`, // 唯一ID
              indexNum: 1, // 临时序号，会通过reorderAllWorkstationIndexes重新计算
              file: cleanUrl,
              remark: '',
              spendTime: null,
              equipment: [], // 装备字段（多选）
              processType: this.activeProcessType,
              isProcess: 0,
            };
            currentWorkstationList.push(newWorkstation);
            const newIndex = currentWorkstationList.length - 1;
            // 触发验证以清除错误提示
            this.$nextTick(() => {
              this.$refs.form && this.$refs.form.validateField(`workstations.${this.activeProcessType}[${newIndex}].file`);
            });
          }
          // 重新排序所有工位的序号（从第一个tabs开始连续编号）
          this.reorderAllWorkstationIndexes();
          this.onSetStationBoxRef();
          this.msgSuccess('PDF转换成功');
        }
      } else {
        this.msgError(data.msg || 'PDF转换失败');
      }
    },

    /** 处理装备字段格式转换 */
    processEquipmentField(equipment) {
      if (!equipment) return [];

      if (Array.isArray(equipment)) {
        return equipment;
      }

      if (typeof equipment === 'string') {
        // 尝试解析JSON
        try {
          const parsed = JSON.parse(equipment);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // JSON解析失败，尝试按逗号分割
          return equipment.split(',').filter(code => code.trim()).map(code => code.trim());
        }
      }

      // 其他情况转换为数组
      return [equipment];
    },

    /** 获取装备字段的显示文本 */
    getEquipmentDisplayText(equipment) {
      if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
        return '暂无装备';
      }

      const labels = equipment.map(code => {
        const option = this.equipmentOptions.find(opt => opt.dictCode === code);
        return option ? option.dictLabel : code;
      });

      return labels.join('、');
    },

    /** 提交按钮 */
    submitForm: function () {
      if (this.checkListItem()) return;
      
      // 验证每个工序都必须有文件
      if (this.checkWorkStationFiles()) return;

      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;

          // 深拷贝表单数据
          const submitData = _.cloneDeep(this.form);

          // 将 historyFile 对象数组转换为原格式字符串
          if (submitData.historyFile && Array.isArray(submitData.historyFile)) {
            submitData.historyFile = JSON.stringify(submitData.historyFile)
          }

          // 将分组的工位数据转换为列表格式
          submitData.list = this.convertWorkstationsToList(submitData.workstations);
          delete submitData.workstations; // 删除分组数据，使用list格式

          // 处理装备字段和工时字段的提交格式
          if (submitData.list && submitData.list.length > 0) {
            submitData.list.forEach(item => {
              if (item.equipment && Array.isArray(item.equipment)) {
                // 将装备数组转换为JSON字符串
                item.equipment = JSON.stringify(item.equipment);
              }

              // el-input-number 已确保工时为数字类型，只需处理空值
              if (item.spendTime === null || item.spendTime === undefined) {
                item.spendTime = null;
              }

              // 新增的工位不传ID，让后端自动生成
              if (item.id && item.id.startsWith('ws_')) {
                delete item.id;
              }
            });
          }

          // 添加isModified字段，告诉后端是否修改了SOP
          submitData.isModified = this.checkDataModified() ? 1 : 0;

          if (this.form.id) {
            sopUpdate(submitData)
              .then(() => {
                this.msgSuccess("修改成功");
                this.$parent.getList();
              })
              .finally(() => {
                this.isSubLoading = false;
                this.close();
              });
          } else {
            sopSave(submitData)
              .then(() => {
                this.msgSuccess("创建成功");
                this.$parent.getList();
                // 如果是从草稿创建的，自动删除该草稿
                if (this.currentDraftId) {
                  this.deleteDraftById(this.currentDraftId);
                }
              })
              .finally(() => {
                this.isSubLoading = false;
                this.close();
              });
          }
        }
        // 指令会自动处理校验失败时的滚动，这里不需要额外代码
      });
    },

    /** 编辑时数据回显 */
    setFormData(data) {
      let formData = { ...data };
      console.log("🚀 ~ setFormData ~  formData.historyFile:", formData.historyFile)
      formData.historyFile = formData.historyFile ? JSON.parse(formData.historyFile) : [];
      console.log("🚀 ~ setFormData ~ formData.historyFile:", formData.historyFile)

      // 设置历史文件表格数据
      this.historyFileList = formData.historyFile.map((file, index) => ({
        name: file.name,
        url: file.url,
        size: file.size || 0,
        uploadTime: file.uploadTime || new Date(),
        id: file.id || (Date.now() + index)
      }));

      // 将列表数据转换为分组数据
      if (formData.list && formData.list.length > 0) {
        // 确保工时是数字格式，处理装备字段的多选格式
        formData.list.forEach(item => {
          if (item.spendTime && typeof item.spendTime === 'string') {
            item.spendTime = parseFloat(item.spendTime) || null;
          }

          // 处理装备字段的多选格式
          item.equipment = this.processEquipmentField(item.equipment);
        });
        
        // 转换为分组格式
        formData.workstations = this.convertListToWorkstations(formData.list);
        delete formData.list; // 删除原来的list字段
      } else {
        // 如果没有list数据，初始化为空的分组结构
        formData.workstations = {
          '1': [],
          '2': [],
          '3': [],
        };
      }

      this.form = formData;
      // 保存原始数据副本用于对比
      this.originalForm = _.cloneDeep(formData);
      
      // 确保数据加载后重新排序工位序号（连续编号）
      this.$nextTick(() => {
        this.reorderAllWorkstationIndexes();
      });
    },

    /** 格式化工时显示 */
    formatSpendTime(seconds) {
      if (!seconds || seconds === 0) return '';

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      let result = [];
      if (hours > 0) result.push(`${hours}时`);
      if (minutes > 0) result.push(`${minutes}分`);
      if (remainingSeconds > 0 || result.length === 0) result.push(`${remainingSeconds}秒`);

      return result.join('');
    },

    /** 处理工时变化 */
    handleSpendTimeChange(value, index, processType) {
      // 更新对应工序类型的工位数据
      if (this.form.workstations[processType] && this.form.workstations[processType][index]) {
        this.$set(this.form.workstations[processType][index], 'spendTime', value);
      }
    },

    /** 处理序号输入，只允许数字 */
    handleIndexNumInput(value, index, processType) {
      // 移除非数字字符
      const numericValue = value.replace(/[^\d]/g, '');

      // 转换为数字，如果为空则设为null
      const numberValue = numericValue === '' ? null : parseInt(numericValue, 10);

      // 更新对应工序类型的工位数据
      if (this.form.workstations[processType] && this.form.workstations[processType][index]) {
        this.form.workstations[processType][index].indexNum = numberValue;
      }
    },


    /** 更新历史文件表格数据 */
    updateHistoryFileList(fileList) {
      console.log('更新历史文件表格数据:', fileList);

      // 将 DrUpload 组件的文件列表转换为表格数据
      this.historyFileList = (fileList || []).map((file, index) => ({
        name: file.name || file.fileName || file.originalName || '未知文件',
        url: file.url || file.fileUrl || file.downloadUrl,
        size: file.size || file.fileSize || 0,
        uploadTime: file.uploadTime || file.createTime || file.time || new Date(),
        id: file.id || file.fileId || (Date.now() + index)
      }));

      console.log('转换后的表格数据:', this.historyFileList);
    },

    /** 删除历史文件 */
    removeHistoryFile(index) {
      this.historyFileList.splice(index, 1);
      this.form.historyFile.splice(index, 1);
      this.$message.success('删除成功');
    },

    /** 预览文件 */
    previewFile(file) {
      window.open(file.url, '_blank');
    },

    /** 格式化文件大小 */
    formatFileSize(size) {
      if (!size) return '-';
      if (size < 1024) {
        return size + ' B';
      } else if (size < 1048576) {
        return (size / 1024).toFixed(1) + ' KB';
      } else {
        return (size / 1048576).toFixed(1) + ' MB';
      }
    },

    /** 格式化上传时间 */
    formatUploadTime(time) {
      if (!time) return '-';
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },


    /** 判断是否为视频文件 */
    isVideoFile(url) {
      if (!url) return false;
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
      const extension = url.toLowerCase().substring(url.lastIndexOf('.'));
      return videoExtensions.includes(extension);
    },

    /** 获取图片URL列表（用于预览，排除视频） */
    getImageUrls(fileString) {
      const fileList = this.getFileList(fileString);
      return fileList.filter(file => !this.isVideoFile(file.url)).map(img => img.url);
    },

    /** 保存草稿到 localStorage */
    saveDraft() {
      // 基本验证：至少需要品类
      if (!this.form.categoryId) {
        this.msgWarning('请至少选择品类后再保存草稿');
        return;
      }

      this.isSavingDraft = true;
      
      try {
        // 获取品类名称（优先从 form.categoryName，否则从 categoryId）
        const categoryName = this.form.categoryName || this.getCategoryName(this.form.categoryId);
        
        // 准备草稿数据
        const draftData = {
          id: this.currentDraftId || `draft_${Date.now()}`,
          createTime: this.currentDraftId ? this.getDraftById(this.currentDraftId)?.createTime : new Date().toISOString(),
          updateTime: new Date().toISOString(),
          formData: _.cloneDeep(this.form),
          categoryName: categoryName, // 保存品类名称用于显示
          categoryId: this.form.categoryId, // 同时保存品类ID
          versionCode: this.form.versionCode || '',
          desc: this.form.desc || '',
        };

        // 获取现有草稿列表
        const drafts = this.getDraftList();
        
        // 查找是否存在相同ID的草稿
        const existingIndex = drafts.findIndex(d => d.id === draftData.id);
        
        if (existingIndex !== -1) {
          // 更新现有草稿
          drafts[existingIndex] = draftData;
          this.msgSuccess('草稿已更新');
        } else {
          // 添加新草稿
          drafts.unshift(draftData); // 最新的放在前面
          this.msgSuccess('草稿已保存');
        }

        // 保存到 localStorage
        localStorage.setItem('sop_drafts', JSON.stringify(drafts));
        this.currentDraftId = draftData.id;
        
      } catch (error) {
        console.error('保存草稿失败:', error);
        this.msgError('保存草稿失败，请重试');
      } finally {
        this.isSavingDraft = false;
      }
    },

    /** 获取草稿列表 */
    getDraftList() {
      try {
        const draftsStr = localStorage.getItem('sop_drafts');
        return draftsStr ? JSON.parse(draftsStr) : [];
      } catch (error) {
        console.error('读取草稿列表失败:', error);
        return [];
      }
    },

    /** 根据ID获取草稿 */
    getDraftById(draftId) {
      const drafts = this.getDraftList();
      return drafts.find(d => d.id === draftId);
    },

    /** 删除指定ID的草稿 */
    deleteDraftById(draftId) {
      try {
        const drafts = this.getDraftList();
        const filteredDrafts = drafts.filter(d => d.id !== draftId);
        localStorage.setItem('sop_drafts', JSON.stringify(filteredDrafts));
      } catch (error) {
        console.error('删除草稿失败:', error);
      }
    },

    /** 加载草稿 */
    loadDraft(draftId) {
      const draft = this.getDraftById(draftId);
      if (!draft) {
        this.msgError('草稿不存在');
        return;
      }

      try {
        // 加载表单数据
        this.form = _.cloneDeep(draft.formData);
        this.currentDraftId = draftId;
        
        // 确保工位数据格式正确
        if (!this.form.workstations) {
          this.form.workstations = {
            '1': [],
            '2': [],
            '3': [],
          };
        }

        // 重新排序工位序号
        this.$nextTick(() => {
          this.reorderAllWorkstationIndexes();
        });
      } catch (error) {
        this.msgError('加载草稿失败，请重试');
      }
    },

    /** 获取品类名称（用于草稿列表显示） */
    getCategoryName(categoryId) {
      if (!categoryId) return '未选择品类';
      
      // 尝试从表单的 categoryName 字段获取（编辑时会有）
      if (this.form.categoryName) {
        return this.form.categoryName;
      }
      
      // 尝试从 TypedSelectLoadMore 组件中获取
      if (this.$refs.categorySelect && this.$refs.categorySelect.componentData) {
        const categoryData = this.$refs.categorySelect.componentData.data || [];
        const selectedCategory = categoryData.find(item => item.id == categoryId || item.id === categoryId);
        if (selectedCategory) {
          return selectedCategory.name || selectedCategory.label || categoryId;
        }
      }
      
      // 如果没有名称，返回 ID
      return categoryId;
    },

    /** 检测数据是否被修改 */
    checkDataModified() {
      // 新增模式，直接返回false
      if (!this.form.id) {
        return false;
      }

      // 检测品类ID是否变更
      if (this.originalForm.categoryId !== this.form.categoryId) {
        return true;
      }

      // 检测workstations数据是否变化
      const originalList = this.convertWorkstationsToList(this.originalForm.workstations || { '1': [], '2': [], '3': [] });
      const currentList = this.convertWorkstationsToList(this.form.workstations || { '1': [], '2': [], '3': [] });
      
      // 检测list数组长度是否变化（新增数据）
      if (originalList.length !== currentList.length) {
        return true;
      }

      // 检测list中的spendTime和indexNum是否变更
      for (let i = 0; i < currentList.length; i++) {
        const original = originalList[i];
        const current = currentList[i];

        if (!original || !current) {
          return true; // 数据结构不匹配，认为有变更
        }

        // 检测spendTime变化
        if (original.spendTime !== current.spendTime) {
          return true;
        }

        // 检测indexNum变化
        if (original.indexNum !== current.indexNum) {
          return true;
        }
      }

      return false;
    },

  },
};
</script>

<style lang="scss" scoped>
.sop-form-dialog {
  ::v-deep .el-dialog {
    border-radius: 4px;
  }

  ::v-deep .el-dialog__header {
    padding: 16px 20px;
    background: #ffffff;
    border-bottom: 1px solid #e8e8e8;

    .el-dialog__title {
      color: #333333;
      font-size: 16px;
      font-weight: 500;
    }
  }

  ::v-deep .el-dialog__body {
    padding: 20px;
    max-height: 75vh;
    overflow-y: auto;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 20px;
    background: #ffffff;
    border-top: 1px solid #e8e8e8;
    text-align: right;
  }
}

// 对话框内容区域
.dialog-content {
  padding: 24px;
  max-height: 75vh;
  overflow-y: auto;
  background: #f8fafc;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;

    &:hover {
      background: #a0aec0;
    }
  }
}

// 简洁表单样式
.sop-form {
  .el-form-item {
    margin-bottom: 18px;
  }

  .el-form-item__label {
    color: #666666;
    font-weight: normal;
  }
}

// 简洁的区块样式
.form-fieldset {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 16px;
  background: #ffffff;
  position: relative;

  .fieldset-legend {
    font-size: 14px;
    font-weight: 500;
    margin: 0;
    padding: 12px 16px;
    background: #fff;

    .legend-upload {
      position: absolute;
      right: 16px;
      top: 12px;
      z-index: 10;
      font-size: 14px;
      padding: 0 20px;
      background: #fff;

      // 覆盖按钮样式，显示为纯文字
      ::v-deep .el-button {
        border: none;
        background: none;
        padding: 0;
        font-size: 14px;
        color: #409EFF;

        &:hover {
          background: none;
          color: #66b1ff;
        }

        &:focus,
        &:active {
          background: none;
          border: none;
          outline: none;
        }

        .el-icon-upload {
          display: none;
        }
      }
    }
  }

  .fieldset-content {
    padding: 16px;
  }
}

// 工位项目样式
.workspace-item {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  background: #ffffff;

  .item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;

    .item-number {
      background: #333333;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 500;
    }

    .item-actions {
      display: flex;
      gap: 8px;
    }
  }

  .workspace-item-content {
    display: flex;
    align-items: center;

    // 检查最后一个表单项，去除其下边距
    .el-form-item:last-child {
      margin-bottom: 0;
    }
  }
}

// 简单图片上传区域
.simple-upload-area {
  border-right: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 8px;
  min-height: 100px;

  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;

    .image-item {
      position: relative;

      .image-preview {
        width: 80px;
        height: 80px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        object-fit: cover;
      }

      // 视频元素样式
      video.image-preview {
        width: 80px;
        height: 80px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        object-fit: cover;
        background: #000;
      }

      .delete-btn {
        position: absolute;
        top: -8px;
        right: -8px;
      }
    }
  }

  .upload-btn {
    width: 80px;
    height: 80px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    i {
      font-size: 20px;
    }
  }

  // 上传进度遮罩层
  .upload-progress-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;

    .upload-progress-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 200px;
      padding: 16px;

      .upload-preview {
        margin-bottom: 12px;

        .preview-image,
        .preview-video {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #e8e8e8;
        }

        .preview-file {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #606266;

          i {
            font-size: 32px;
            margin-bottom: 4px;
          }

          span {
            font-size: 12px;
            text-align: center;
            word-break: break-all;
          }
        }
      }

      .upload-info {
        width: 100%;

        .file-name {
          font-size: 12px;
          color: #303133;
          margin-bottom: 8px;
          text-align: center;
          word-break: break-all;
        }

        .upload-size {
          font-size: 11px;
          color: #909399;
          text-align: center;
          margin-top: 4px;
        }
      }
    }
  }
}

// 时间显示
.time-display {
  margin-top: 8px;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #666666;
  text-align: center;
}

// 封面图上传样式
.top-img-upload {
  .my-upload-demo{
    width: 100%!important;
    height: auto!important;
  }
  ::v-deep .el-upload-list {
    display: flex;
    gap: 10px;
    .el-upload-list__item {
      margin: 0!important;
      margin-right: 10px!important;
    }
  }
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    
    i {
      font-size: 32px;
      color: #c0c4cc;
      transition: color 0.3s;
    }
    
    &:hover i {
      color: #409eff;
    }
  }
}

// 工位文件上传hover效果
::v-deep .workspace-item-content {
  .el-upload-list__item:hover {
    .el-upload-list__item-actions {
      opacity: 1 !important;
    }
  }
  
  .el-upload-list__item-actions {
    opacity: 0 !important;
    transition: opacity 0.3s ease !important;
  }
}

// 响应式布局
@media (max-width: 768px) {
  .form-fieldset {
    margin-bottom: 12px;

    .fieldset-legend {
      font-size: 13px;
      padding: 10px 12px;
    }

    .fieldset-content {
      padding: 12px;
    }
  }

  .workspace-item {
    .item-header {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }
  }

  .simple-upload-area {
    .image-list {
      justify-content: center;
    }
  }
}

// tabs容器和头部布局
.tabs-container {
  position: relative;
}

.tabs-header {
  position: relative;
  display: flex;
  align-items: flex-start;
}

// 工序类型tabs样式
.process-tabs {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  
  ::v-deep .el-tabs__header {
    margin: 0;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
    
    .el-tabs__nav-wrap {
      padding: 0 16px;
    }
    
    .el-tabs__item {
      font-weight: 500;
      color: #606266;
      
      &.is-active {
        color: #409eff;
        font-weight: 600;
      }
    }
  }
  
  ::v-deep .el-tabs__content {
    padding: 20px;
  }
}

// PDF上传按钮容器 (Element UI 2.3兼容版本)
.pdf-upload-container {
  position: absolute;
  top: 4px;
  right: 16px;
  z-index: 10;
  
  .el-button {
    height: 32px;
    padding: 8px 15px;
    font-size: 13px;
    border-radius: 6px;
  }
}

.workstation-list {
  min-height: 200px;
}

.workstation-transition-group {
  position: relative;
}

/* 工位列表移动动画 */
.workstation-list-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.workstation-list-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.workstation-list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
}

.workstation-list-enter {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.workstation-list-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

/* 移动时保持平滑过渡 */
.workstation-list-move .workspace-item {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-workstation-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  
  .el-button {
    min-width: 200px;
    height: 60px;
    font-size: 16px;
    border: 2px dashed #d9d9d9;
    background: #fafafa;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #409eff;
      background: #ecf5ff;
      color: #409eff;
    }
    
    .el-icon-plus {
      font-size: 20px;
      margin-right: 8px;
    }
  }
}
</style>
