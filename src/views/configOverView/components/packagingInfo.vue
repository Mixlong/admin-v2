<template>
  <el-dialog 
    title="包装信息" 
    :visible.sync="isDialogVisible" 
    :width="isNewFormat ? '98%' : '50%'" 
    center 
    :close-on-click-modal="false"
    :top="isNewFormat ? '0vh' : '15vh'"
    append-to-body
    :custom-class="isNewFormat ? 'packaging-view-dialog packaging-view-dialog-new' : 'packaging-view-dialog packaging-view-dialog-old'"
  >
    <!-- 旧格式UI：简单表格 -->
    <div v-if="!isNewFormat" class="package-info-box">
      <el-table 
        :key="'old-format-' + tableData.length"
        :data="tableData" 
        border 
        size="small"
        style="width: 100%"
        class="old-format-table"
      >
        <el-table-column label="检查项" width="200">
          <template slot-scope="scope">
            {{ scope.row.checkItem.label }}
          </template>
        </el-table-column>
        <el-table-column label="内容" width="250">
          <template slot-scope="scope">
            <!-- 如果有预定义选项，显示匹配的label -->
            <span v-if="scope.row.contentOptions && scope.row.contentOptions.length > 0">
              <span v-for="(item, index) in scope.row.contentOptions" 
                    :key="`${scope.$index}-${index}-${item.id}`"
                    v-if="scope.row.content === item.id">
                {{ item.label }}
              </span>
            </span>
            <!-- 否则直接显示内容 -->
            <span v-else>{{ scope.row.content || '无' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="详情/备注">
          <template slot-scope="scope">
            <!-- 如果是HTTP链接，显示为下载链接 -->
            <a 
              v-if="isHttpLink(scope.row.details)"
              href="javascript:void(0);"
              class="download-link"
              @click="handleDownload(scope.row.details)"
            >
              下载链接
            </a>
            <!-- 如果是富文本内容，使用v-html渲染 -->
            <div 
              v-else-if="scope.row.details && !isHttpLink(scope.row.details)" 
              v-html="scope.row.details" 
              class="rich-text-content"
              @click="handleRichTextClick($event, scope.row)"
            ></div>
            <!-- 否则显示无 -->
            <span v-else style="color: #909399;">无</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 新格式UI：多级表头表格（类似编辑表格） -->
    <div v-else class="package-info-new-format">
      <el-table 
        :key="'new-format-' + Object.keys(newFormatData).length"
        :data="[newFormatData]" 
        border 
        size="small"
        style="width: 100%"
        class="packaging-table-view"
      >
        <!-- 附件出库方式 -->
        <el-table-column label="附件出库方式" align="center">
          <el-table-column label="支架螺丝" width="180" header-align="center">
            <template slot-scope="scope">
              <div class="view-cell">
                {{ getFieldValue(scope.row, '解件出库方式', '支架螺丝') }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="按栓螺丝" width="180" header-align="center">
            <template slot-scope="scope">
              <div class="view-cell">
                {{ getFieldValue(scope.row, '解件出库方式', '按栓螺丝') }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="硅胶垫片" width="180" header-align="center">
            <template slot-scope="scope">
              <div class="view-cell">
                {{ getFieldValue(scope.row, '解件出库方式', '硅胶垫片') }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="其它附件要求" min-width="250" header-align="center">
            <template slot-scope="scope">
              <div 
                class="view-cell rich-text-view"
                v-if="getFieldValue(scope.row, '解件出库方式', '其它附件要求')"
                v-html="getFieldValue(scope.row, '解件出库方式', '其它附件要求')"
                @click="handleRichTextClick($event, scope.row['解件出库方式'])"
              ></div>
              <div v-else class="view-cell">--</div>
            </template>
          </el-table-column>
        </el-table-column>
        
        <!-- 附件装箱方式 -->
        <el-table-column label="附件装箱方式" min-width="250" header-align="center">
          <template slot-scope="scope">
            <div class="view-cell">
              <div class="view-value">{{ getFieldValue(scope.row, '附件装箱方式', 'value') }}</div>
              <div 
                v-if="getFieldValue(scope.row, '附件装箱方式', 'administrator')" 
                class="rich-text-view view-details"
                v-html="getFieldValue(scope.row, '附件装箱方式', 'administrator')"
                @click="handleRichTextClick($event, scope.row['附件装箱方式'])"
              ></div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 箱唛要求 -->
        <el-table-column label="箱唛要求" min-width="250" header-align="center">
          <template slot-scope="scope">
            <div class="view-cell">
              <div class="view-value">{{ getFieldValue(scope.row, '箱唛要求', 'value') }}</div>
              <div 
                v-if="getFieldValue(scope.row, '箱唛要求', 'administrator')" 
                class="rich-text-view view-details"
                v-html="getFieldValue(scope.row, '箱唛要求', 'administrator')"
                @click="handleRichTextClick($event, scope.row['箱唛要求'])"
              ></div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 检验报告要求 -->
        <el-table-column label="检验报告要求" min-width="250" header-align="center">
          <template slot-scope="scope">
            <div class="view-cell">
              <div class="view-value">{{ getFieldValue(scope.row, '检验报告要求', 'value') }}</div>
              <div 
                v-if="getFieldValue(scope.row, '检验报告要求', 'administrator')" 
                class="rich-text-view view-details"
                v-html="getFieldValue(scope.row, '检验报告要求', 'administrator')"
                @click="handleRichTextClick($event, scope.row['检验报告要求'])"
              ></div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 图片预览组件 -->
    <el-image-viewer 
      v-if="showImageViewer" 
      :url-list="previewImageList" 
      :initial-index="currentImageIndex"
      :on-close="closeImageViewer"
    />
  </el-dialog>
</template>

<script>
import { urlDownload } from "@/utils";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer';

export default {
  components: {
    ElImageViewer,
  },
  data() {
    return {
      isDialogVisible: false,
      packagingInfo: "",
      tableData: [],
      // 图片预览
      showImageViewer: false,
      previewImageList: [],
      currentImageIndex: 0,
      // 格式标识和新格式数据
      isNewFormat: false,
      newFormatData: {},
      defaultTableData: [
        {
          checkItem: { id: 'ditaiStandardNoLockAttachment', label: '支架螺丝安装要求' },
          content: 'ditaiStandardNoLockAttachment', // 默认选择第一个选项的id
          details: '',

          contentOptions: [
            { id: 'ditaiStandardNoLockAttachment', label: '迪太标准：不锁，作为附件' },
            { id: 'customerSpecifiedNoLock', label: '客户指定：锁上，但不锁紧' },
            { id: 'customerSpecifiedNormalLock', label: '客户指定：锁上，正常锁紧' },
            { id: 'ditaiEnglishIndicators', label: '迪太英文标准' }
          ],
        },
        {
          checkItem: { id: 'accessoryPackingRequirements', label: '附件装箱要求' },
          content: 'ditaiStandardAllAccessoriesUnifiedTailNumber', // 默认选择第一个选项的id
          details: '',

          contentOptions: [
            { id: 'ditaiStandardAllAccessoriesUnifiedTailNumber', label: '迪太标准：所有附件统一放尾数箱' },
            { id: 'customerSpecified', label: '所有附件统一放每箱内' },
            { id: 'ditaiEnglishIndicators', label: '迪太英文标准' }
          ],
        },
        {
          checkItem: { id: 'packagingRequirementsCardboardWaterproofBag', label: '包装要求 (卡板、防水袋)' },
          content: 'accordingToBOM', // 默认选择第一个选项的id
          details: '',

          contentOptions: [
            { id: 'accordingToBOM', label: '依据BOM' },
            { id: 'customerSpecified', label: '客户指定' },
            { id: 'ditaiEnglishIndicators', label: '迪太英文标准' }
          ],
        },
        {
          checkItem: { id: 'boxMarkRequirements', label: '箱唛要求' },
          content: 'ditaiTemplate', // 默认选择第一个选项的id
          details: '',

          contentOptions: [
            { id: 'ditaiTemplate', label: '迪太模板' },
            { id: 'customerSpecified', label: '客户指定' },
            { id: 'ditaiEnglishIndicators', label: '迪太英文标准' }
          ],
        },
        {
          checkItem: { id: 'inspectionReportRequirements', label: '检验报告要求' },
          content: 'ditaiTemplate', // 默认选择第一个选项的id
          details: '',

          contentOptions: [
            { id: 'ditaiTemplate', label: '迪太模板' },
            { id: 'customerSpecified', label: '客户指定' },
            { id: 'ditaiEnglishIndicators', label: '迪太英文标准' }
          ],
        },
      ],
    }
  },
  watch: {
    packagingInfo: {
      handler(newVal) {
        this.initializeTableData();
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    // 初始化表格数据
    initializeTableData() {
      if (!this.packagingInfo) {
        this.tableData = [];
        this.isNewFormat = false;
        this.newFormatData = {};
        return;
      }

      let processedData;
      
      // 如果传入的是字符串，先尝试解析
      if (typeof this.packagingInfo === 'string' && this.packagingInfo.trim()) {
        try {
          processedData = JSON.parse(this.packagingInfo);
        } catch (error) {
          console.error('解析包装信息失败:', error);
          this.tableData = [];
          this.isNewFormat = false;
          this.newFormatData = {};
          return;
        }
      } else if (typeof this.packagingInfo === 'object') {
        processedData = this.packagingInfo;
      }

      if (!processedData) {
        this.tableData = [];
        this.isNewFormat = false;
        this.newFormatData = {};
        return;
      }

      // 检测数据格式版本
      const version = this.detectDataVersion(processedData);
      console.log('📦 数据格式版本:', version);

      switch (version) {
        case 'v1-old':
        case 'v1-full':
          // 旧格式：使用简单表格UI
          this.isNewFormat = false;
          if (version === 'v1-old') {
            this.tableData = this.convertOldFormatToTable(processedData);
          } else {
            this.tableData = JSON.parse(JSON.stringify(processedData));
          }
          break;
        case 'v2-new':
          // 新格式：使用多级表头UI
          this.isNewFormat = true;
          this.newFormatData = processedData;
          break;
        default:
          this.isNewFormat = false;
          this.tableData = [];
      }

      console.log('✅ 格式标识:', this.isNewFormat ? '新格式' : '旧格式');
      console.log('✅ 数据:', this.isNewFormat ? this.newFormatData : this.tableData);
    },

    // 检测数据格式版本
    detectDataVersion(data) {
      if (!data) return 'empty';
      
      if (Array.isArray(data)) {
        if (data.length === 0) return 'empty';
        const firstItem = data[0];
        
        // 旧格式：{checkItemId, contentId, details}
        if (firstItem.checkItemId && firstItem.contentId !== undefined) {
          return 'v1-old';
        }
        // 完整旧格式：{checkItem, content, contentOptions, details}
        if (firstItem.checkItem && firstItem.content && firstItem.contentOptions) {
          return 'v1-full';
        }
      } else if (typeof data === 'object') {
        // 新格式：对象结构，包含分组
        const keys = Object.keys(data);
        if (keys.some(key => ['解件出库方式', '附件装箱方式', '包装要求', '检验报告要求'].includes(key))) {
          return 'v2-new';
        }
      }
      
      return 'unknown';
    },

    // 将旧格式转换为表格数据（不污染原始模板）
    convertOldFormatToTable(oldData) {
      console.log('🔄 转换旧格式数据:', oldData);
      
      // 创建模板副本，避免污染原始数据
      const tableData = JSON.parse(JSON.stringify(this.defaultTableData));
      
      // 根据 checkItemId 匹配并填充数据
      oldData.forEach(item => {
        console.log('  处理项:', item.checkItemId, '内容:', item.contentId, '详情:', item.details);
        
        let index = tableData.findIndex(
          row => row.checkItem.id === item.checkItemId
        );
        
        // 如果没找到精确匹配，尝试兼容性匹配
        if (index === -1) {
          console.warn('  ⚠️ 未找到匹配的checkItemId:', item.checkItemId);
          // 尝试部分匹配（用于向后兼容）
          const partialMatches = {
            'bracketScrewInstallation': 'ditaiStandardNoLockAttachment',
            'accessoryPackingRequirements': 'accessoryPackingRequirements',
            'packagingRequirementsCardboardWaterproofBag': 'packagingRequirementsCardboardWaterproofBag',
            'boxMarkRequirements': 'boxMarkRequirements',
            'inspectionReportRequirements': 'inspectionReportRequirements'
          };
          
          const mappedId = partialMatches[item.checkItemId];
          if (mappedId) {
            index = tableData.findIndex(row => row.checkItem.id === mappedId);
            console.log('  ✓ 使用映射ID:', mappedId, '索引:', index);
          }
        }
        
        if (index !== -1) {
          tableData[index].content = item.contentId;
          tableData[index].details = item.details || '';
          
          // 如果有文件URL
          if (item.fileUrl) {
            tableData[index].fileUrl = item.fileUrl;
          }
          console.log('  ✅ 成功填充数据，索引:', index);
        } else {
          console.error('  ❌ 无法匹配checkItemId:', item.checkItemId);
        }
      });
      
      console.log('  最终tableData:', tableData);
      return tableData;
    },

    // 将新格式转换为表格数据
    convertNewFormatToTable(newData) {
      console.log('🔄 转换新格式数据:', newData);
      
      const tableData = [];
      
      // 遍历新格式的各个分组
      Object.keys(newData).forEach(groupName => {
        const groupData = newData[groupName];
        
        // 判断是否为 {value, administrator} 结构
        const isValueAdminStructure = groupData && 
          typeof groupData === 'object' && 
          !Array.isArray(groupData) &&
          ('value' in groupData || 'administrator' in groupData);
        
        if (isValueAdminStructure) {
          // 附件装箱方式、箱唛要求、检验报告要求 这类结构
          tableData.push({
            checkItem: {
              id: groupName,
              label: groupName
            },
            content: groupData.value || '',
            details: groupData.administrator || '',
            contentOptions: []
          });
        } else if (typeof groupData === 'object' && !Array.isArray(groupData)) {
          // 解件出库方式这类结构，每个子项是独立的行
          Object.keys(groupData).forEach(itemKey => {
            const itemValue = groupData[itemKey];
            
            tableData.push({
              checkItem: {
                id: itemKey,
                label: `${groupName} - ${itemKey}`
              },
              content: typeof itemValue === 'object' ? itemValue.value : itemValue,
              details: typeof itemValue === 'object' ? (itemValue.administrator || '') : '',
              contentOptions: []
            });
          });
        } else {
          // 简单值
          tableData.push({
            checkItem: {
              id: groupName,
              label: groupName
            },
            content: groupData,
            details: '',
            contentOptions: []
          });
        }
      });
      
      return tableData;
    },
    // 处理下载链接点击
    handleDownload(url) {
      urlDownload(url);
    },

    // 判断是否为HTTP链接
    isHttpLink(text) {
      if (!text) return false;
      return text.toLowerCase().startsWith('http://') || text.toLowerCase().startsWith('https://');
    },

    // 根据content id获取对应的label
    getContentLabel(row) {
      const option = row.contentOptions.find(opt => opt.id === row.content);
      return option ? option.label : row.content;
    },
    
    // 获取字段值（兼容 Vue 2 语法）
    getFieldValue(row, groupName, fieldName) {
      if (!row || !row[groupName]) {
        return '--';
      }
      const value = row[groupName][fieldName];
      return value || '--';
    },
    
    // 处理富文本内容点击事件
    handleRichTextClick(event, rowData) {
      const target = event.target;
      
      // 处理图片点击
      if (target.tagName === 'IMG') {
        event.preventDefault();
        event.stopPropagation();
        
        // 获取富文本内容
        let htmlContent = '';
        if (rowData) {
          // 新格式：可能是对象形式
          if (typeof rowData === 'object') {
            if (rowData.details) {
              // 旧格式的 row
              htmlContent = rowData.details;
            } else if (rowData.其它附件要求) {
              // 解件出库方式
              htmlContent = rowData.其它附件要求;
            } else if (rowData.administrator) {
              // 其他有 administrator 字段的
              htmlContent = rowData.administrator;
            }
          } else if (typeof rowData === 'string') {
            htmlContent = rowData;
          }
        }
        
        // 获取当前富文本内容中的所有图片
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const images = Array.from(tempDiv.querySelectorAll('img'));
        
        // 提取所有图片地址
        this.previewImageList = images.map(img => img.src);
        
        // 找到当前点击图片的索引
        this.currentImageIndex = images.findIndex(img => img.src === target.src);
        if (this.currentImageIndex === -1) {
          this.currentImageIndex = 0;
        }
        
        // 显示图片预览
        this.showImageViewer = true;
      }
      
      // 处理链接点击（在新窗口打开）
      if (target.tagName === 'A') {
        event.preventDefault();
        event.stopPropagation();
        const href = target.getAttribute('href');
        if (href) {
          window.open(href, '_blank');
        }
      }
    },
    
    // 关闭图片预览
    closeImageViewer() {
      this.showImageViewer = false;
      this.previewImageList = [];
      this.currentImageIndex = 0;
    },
  }
};
</script>

<style lang="scss" scoped>
// 旧格式UI样式
.package-info-box {
  max-height: 500px;
  overflow: hidden;
  overflow-y: auto;
  padding: 10px;
  
  .old-format-table {
    ::v-deep .el-table__header {
      th {
        background-color: #F5F7FA !important;
        background-image: none !important;
        color: #606266 !important;
        font-weight: 500 !important;
        padding: 8px 0 !important;
        font-size: 13px !important;
        border-bottom: 1px solid #EBEEF5 !important;
      }
    }
    
    ::v-deep .el-table__body {
      td {
        padding: 8px 10px !important;
        vertical-align: middle !important;
      }
    }
  }

  .download-link {
    color: #409EFF;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
  
  .rich-text-content {
    white-space: pre-wrap;
    word-break: break-word;
    
    ::v-deep p {
      margin: 4px 0;
    }
    
    ::v-deep img {
      max-width: 100%;
      height: auto;
      cursor: pointer;
      transition: transform 0.2s;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    ::v-deep a {
      color: #409EFF;
      text-decoration: underline;
      cursor: pointer;
      
      &:hover {
        color: #66b1ff;
      }
    }
  }
}

// 新格式UI样式
.package-info-new-format {
  padding: 10px;
  
  .packaging-table-view {
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    overflow: hidden;
    
    ::v-deep .el-table__header {
      th {
        background: linear-gradient(180deg, #F8F9FA 0%, #F0F2F5 100%) !important;
        color: #303133 !important;
        font-weight: 600 !important;
        border-bottom: 2px solid #E4E7ED !important;
        padding: 14px 10px !important;
        font-size: 13px !important;
      }
    }
    
    ::v-deep .el-table__body {
      td {
        padding: 12px 10px !important;
        vertical-align: top !important;
      }
    }
  }
  
  .view-cell {
    padding: 8px 10px;
    min-height: 40px;
    line-height: 1.5;
  }
  
  .view-value {
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .view-details {
    color: #606266;
    font-size: 12px;
    padding-top: 8px;
    border-top: 1px dashed #E4E7ED;
    margin-top: 8px;
  }
  
  .rich-text-view {
    ::v-deep p {
      margin: 4px 0;
    }
    
    ::v-deep img {
      max-width: 100%;
      height: auto;
      cursor: pointer;
      transition: transform 0.2s;
      border-radius: 4px;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }
    
    ::v-deep a {
      color: #409EFF;
      text-decoration: underline;
      cursor: pointer;
      
      &:hover {
        color: #66b1ff;
      }
    }
  }
}

// 对话框自定义样式 - 通用
.packaging-view-dialog {
  ::v-deep .el-dialog__body {
    padding: 15px;
    max-height: calc(100vh - 150px);
    overflow-y: auto;
  }
}

// 旧格式对话框专属样式
.packaging-view-dialog-old {
  ::v-deep .el-dialog__body {
    padding: 15px;
  }
  
  // 确保旧格式表格样式不被覆盖
  ::v-deep .old-format-table {
    .el-table__header th {
      background-color: #F5F7FA !important;
      background-image: none !important;
      color: #606266 !important;
      font-weight: 500 !important;
      padding: 8px 0 !important;
      font-size: 13px !important;
      border-bottom: 1px solid #EBEEF5 !important;
    }
    
    .el-table__body td {
      padding: 8px 10px !important;
    }
  }
}

// 新格式对话框专属样式
.packaging-view-dialog-new {
  ::v-deep .el-dialog__body {
    padding: 15px;
  }
  
  // 确保新格式表格样式不被覆盖
  ::v-deep .packaging-table-view {
    .el-table__header th {
      background: linear-gradient(180deg, #F8F9FA 0%, #F0F2F5 100%) !important;
      color: #303133 !important;
      font-weight: 600 !important;
      padding: 14px 10px !important;
      font-size: 13px !important;
      border-bottom: 2px solid #E4E7ED !important;
    }
    
    .el-table__body td {
      padding: 12px 10px !important;
      vertical-align: top !important;
    }
  }
}
</style>

<style lang="scss">
/* 全局样式 - 图片预览器层级 */
.el-image-viewer__wrapper {
  z-index: 99999 !important;
  position: fixed !important;
}

.el-image-viewer__mask {
  z-index: 0 !important;
  position: absolute !important;
}

.el-image-viewer__canvas {
  z-index: 1 !important;
  position: absolute !important;
}

.el-image-viewer__btn {
  z-index: 2 !important;
  position: absolute !important;
}

.el-image-viewer__close {
  z-index: 2 !important;
  position: absolute !important;
}

.el-image-viewer__actions {
  z-index: 2 !important;
  position: absolute !important;
}
</style>