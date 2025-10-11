<template>
  <div class="workspace-item" :class="{ 'workspace-item-focused': isFocused }">
    <div class="item-header">
      <span class="item-number">{{ workstation.indexNum }}</span>
      
      <div class="item-actions">
        <el-button type="text" size="small" @click="onMoveUp" :disabled="itemIndex === 0">上移</el-button>
        <el-button type="text" size="small" @click="onMoveDown" :disabled="isLastItem">下移</el-button>
        <el-dropdown @command="onMoveToProcess" trigger="click" class="move-to-dropdown">
          <el-button type="text" size="small">
            移动到<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item 
              v-for="option in availableProcessTypes" 
              :key="option.dictValue"
              :command="option.dictValue">
              {{ option.dictLabel }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="text" size="small" @click="onCopyItem">复制</el-button>
        <el-button type="text" size="small" @click="onRemoveItem" style="color: #f56c6c;">删除</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="workspace-item-content">
      <el-col :span="16">
        <el-form-item :prop="fileProp" :rules="fileRules" label=" " label-width="40px" required>
          <ElUploadSortable
            v-model="workstation.file"
            :action="actionUrl"
            :accept="accept"
            :limit="10"
            :sortable="true"
            :disabled="false"
            :show-file-list="true"
            :drag-group="{ 
              name: 'workstation-files', 
              pull: true, 
              put: true,
              revertClone: false
            }"
            list-type="picture-card"
            css="width: 100%; min-height: 80px;"
            :imgH="80"
            @on-success="onUploadSuccess"
            @on-remove="onFileRemove"
            @on-change="onFileChange"
            @on-exceed="onExceed"
            @drag-add="onDragAdd"
            @drag-remove="onDragRemove"
            @dragstart="onDragStart"
            @dragend="onDragEnd"
          />
        </el-form-item>
      </el-col>
                <el-col :span="8">
        <!-- 序号字段隐藏，但静默传给后台 -->
        <input type="hidden" v-model="workstation.indexNum" />
        <el-form-item label="工时" :prop="spendTimeProp" :rules="spendTimeRules"
          label-width="60px" required>
          <el-input-number
            v-model="workstation.spendTime"
            placeholder="请输入工时(秒)"
            size="small"
            :min="0"
            :max="99999"
            :precision="2"
            :step="0.1"
            controls-position="right"
            @change="handleSpendTimeChange"
            @blur="onSaveItem"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="装备" :prop="equipmentProp" label-width="60px">
          <el-select v-model="workstation.equipment" multiple filterable clearable placeholder="请选择装备" size="small"
            style="width: 100%;" @change="onSaveItem">
            <el-option v-for="option in equipmentOptions" :key="option.dictCode" :label="option.dictLabel"
              :value="option.dictCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" :prop="remarkProp" :rules="remarkRules" label-width="60px">
          <el-input v-model="workstation.remark" type="textarea" :rows="2" placeholder="请输入工位文件描述"
            @blur="onSaveItem" />
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ElUploadSortable from '@/components/el-upload-sortable';

export default {
  name: 'WorkstationItem',
  components: {
    ElUploadSortable
  },
  props: {
    workstation: {
      type: Object,
      required: true
    },
    itemIndex: {
      type: Number,
      required: true
    },
    processType: {
      type: String,
      required: true
    },
    equipmentOptions: {
      type: Array,
      default: () => []
    },
    rules: {
      type: Object,
      required: true
    },
    actionUrl: {
      type: String,
      required: true
    },
    accept: {
      type: String,
      default: '.jpg,.jpeg,.png,.gif,.bmp,.webp,.mp4,.avi,.mov,.wmv,.flv,.mkv'
    },
    processTypeOptions: {
      type: Array,
      default: () => []
    },
    totalItemsInProcess: {
      type: Number,
      default: 0
    },
    isFocused: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uploadingItem: null,
    };
  },
  computed: {
    fileProp() {
      return `workstations.${this.processType}[${this.itemIndex}].file`;
    },
    indexNumProp() {
      return `workstations.${this.processType}[${this.itemIndex}].indexNum`;
    },
    spendTimeProp() {
      return `workstations.${this.processType}[${this.itemIndex}].spendTime`;
    },
    equipmentProp() {
      return `workstations.${this.processType}[${this.itemIndex}].equipment`;
    },
    remarkProp() {
      return `workstations.${this.processType}[${this.itemIndex}].remark`;
    },
    fileRules() {
      return this.rules.file;
    },
    indexNumRules() {
      return this.rules.indexNum;
    },
    spendTimeRules() {
      return this.rules.spendTime;
    },
    remarkRules() {
      return this.rules.remark;
    },
    // 是否是最后一个项目
    isLastItem() {
      return this.itemIndex === this.totalItemsInProcess - 1;
    },
    // 可移动到的工序类型（排除当前工序类型）
    availableProcessTypes() {
      return this.processTypeOptions.filter(option => option.dictValue !== this.processType);
    }
  },
  methods: {
    // 拖拽开始
    onDragStart(event) {
      this.$emit('drag-start', event, this.itemIndex, this.processType);
    },
    
    // 拖拽结束
    onDragEnd(event) {
      this.$emit('drag-end', event);
    },
    
    // 文件变化
    onFileChange() {
      this.$emit('file-change', this.workstation, this.itemIndex, this.processType);
    },
    
    // 拖拽添加文件
    onDragAdd(evt) {
      // 延迟执行，确保 vuedraggable 完成数据更新
      this.$nextTick(() => {
        this.$emit('file-change', this.workstation, this.itemIndex, this.processType);
        this.$emit('drag-add', evt, this.itemIndex, this.processType);
      });
    },
    
    // 拖拽移除文件  
    onDragRemove(evt) {
      // 延迟执行，确保 vuedraggable 完成数据更新
      this.$nextTick(() => {
        this.$emit('file-change', this.workstation, this.itemIndex, this.processType);
        this.$emit('drag-remove', evt, this.itemIndex, this.processType);
      });
    },
    
    // 文件移除
    onFileRemove() {
      this.$emit('file-change', this.workstation, this.itemIndex, this.processType);
      // 触发验证
      this.$nextTick(() => {
        this.$emit('validate-field', this.fileProp);
      });
    },
    
    // 上传成功
    onUploadSuccess(response) {
      this.$emit('file-change', this.workstation, this.itemIndex, this.processType);
      // 触发验证
      this.$nextTick(() => {
        this.$emit('validate-field', this.fileProp);
      });
    },
    
    // 文件超出限制
    onExceed(files, fileList) {
      this.$message.warning(`最多只能上传 10 个文件，当前共选择了 ${files.length + fileList.length} 个文件`);
    },
    
    // 上移工位
    onMoveUp() {
      if (this.itemIndex > 0) {
        this.$emit('move-up', this.itemIndex, this.processType);
      }
    },
    
    // 下移工位
    onMoveDown() {
      if (this.itemIndex < this.totalItemsInProcess - 1) {
        this.$emit('move-down', this.itemIndex, this.processType);
      }
    },
    
    // 移动到其他工序类型
    onMoveToProcess(targetProcessType) {
      this.$emit('move-to-process', this.itemIndex, this.processType, targetProcessType);
    },
    
    // 复制工位
    onCopyItem() {
      this.$emit('copy-item', this.itemIndex, this.processType);
    },
    
    // 删除工位
    onRemoveItem() {
      this.$emit('remove-item', this.itemIndex, this.processType);
    },
    
    // 保存工位
    onSaveItem() {
      this.$emit('save-item', this.workstation, this.itemIndex, this.processType);
    },
    
    // 处理序号输入
    handleIndexNumInput(value) {
      this.$emit('index-num-input', value, this.itemIndex, this.processType);
    },
    
    // 处理工时变化
    handleSpendTimeChange(value) {
      this.$emit('spend-time-change', value, this.itemIndex, this.processType);
    }
  }
};
</script>

<style scoped>
.workspace-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0); /* 启用硬件加速 */
  position: relative;
}

.workspace-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  transform: translateY(-1px) translateZ(0);
}

/* 聚焦状态 - 刚移动的工位 */
.workspace-item-focused {
  border-color: #67c23a !important;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2), 0 4px 12px rgba(103, 194, 58, 0.15) !important;
  transform: translateY(-2px) translateZ(0) !important;
  animation: focusPulse 2s ease-in-out;
}

@keyframes focusPulse {
  0% {
    box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2), 0 4px 12px rgba(103, 194, 58, 0.15);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.3), 0 6px 16px rgba(103, 194, 58, 0.2);
  }
  100% {
    box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2), 0 4px 12px rgba(103, 194, 58, 0.15);
  }
}

/* 防止快速操作时的hover状态错位 */
.workspace-item.moving {
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 入场动画 */
.workspace-item-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.workspace-item-enter {
  opacity: 0;
  transform: translateY(-20px) translateZ(0);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.item-number {
  font-weight: 600;
  color: #409eff;
  font-size: 16px;
  background: #ecf5ff;
  padding: 4px 12px;
  border-radius: 12px;
  min-width: 32px;
  text-align: center;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.item-actions .el-button--text {
  padding: 0 8px;
  font-size: 12px;
  height: 28px;
  line-height: 28px;
}

.move-to-dropdown {
  display: inline-block;
}

.workspace-item-content {
  margin-top: 12px;
}
</style>
