<template>
  <el-dialog title="包装信息" :visible.sync="isDialogVisible" width="50%" center :close-on-click-modal="false"
    append-to-body>
    <div class="package-info-box">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column label="检查项" width="180">
          <template slot-scope="scope">
            {{ scope.row.checkItem.label }}
          </template>
        </el-table-column>
        <el-table-column label="内容" width="280">
          <template slot-scope="scope">

            <span v-for="(item, index) in scope.row.contentOptions" :key="`${scope.$index}-${index}-${item.id}`"
              v-if="scope.row.content === item.id">{{ item.label }}</span>

          </template>
        </el-table-column>
        <el-table-column label="详情">
          <template slot-scope="scope">
            <!-- 迪太英文指标项显示文件信息 -->
            <template v-if="scope.row.checkItem.id === 'ditaiEnglishIndicators'">
              <div v-if="scope.row.fileUrl && scope.row.fileUrl.length > 0" class="file-info">
                <el-button type="text" size="mini" icon="el-icon-document" @click="handleFileDownload(scope.row.fileUrl)">
                  {{ getFileName(scope.row.fileUrl) }}
                </el-button>
              </div>
              <span v-else class="no-file">未上传文件</span>
            </template>
            <!-- 其他项的详情显示 -->
            <template v-else>
              <template v-if="isHttpLink(scope.row.details)">
                <a href="javascript:void(0)" @click="handleDownload(scope.row.details)" class="download-link">下载链接</a>
              </template>
              <template v-else>
                {{ scope.row.details || '无' }}
              </template>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script>
import { urlDownload } from "@/utils";

export default {
  data() {
    return {
      isDialogVisible: false,
      packagingInfo: "",
      tableData: [],
      defaultTableData: [
        {
          checkItem: { id: 'ditaiStandardNoLockAttachment', label: '支架螺丝安装要求' },
          content: 'ditaiStandardNoLockAttachment', // 默认选择第一个选项的id
          details: '',
          contentOptions: [
            { id: 'ditaiStandardNoLockAttachment', label: '迪太标准：不锁，作为附件' },
            { id: 'customerSpecifiedNoLock', label: '客户指定：锁上，但不锁紧' },
            { id: 'customerSpecifiedNormalLock', label: '客户指定：锁上，正常锁紧' }
          ],
        },
        {
          checkItem: { id: 'accessoryPackingRequirements', label: '附件装箱要求' },
          content: 'ditaiStandardAllAccessoriesUnifiedTailNumber', // 默认选择第一个选项的id
          details: '',
          contentOptions: [
            { id: 'ditaiStandardAllAccessoriesUnifiedTailNumber', label: '迪太标准：所有附件统一放置尾数' },
            { id: 'customerSpecified', label: '客户指定' }
          ],
        },
        {
          checkItem: { id: 'packagingRequirementsCardboardWaterproofBag', label: '包装要求 (卡板、防水袋)' },
          content: 'accordingToBOM', // 默认选择第一个选项的id
          details: '',
          contentOptions: [
            { id: 'accordingToBOM', label: '依据BOM' },
            { id: 'customerSpecified', label: '客户指定' }
          ],
        },
        {
          checkItem: { id: 'boxMarkRequirements', label: '箱唛要求' },
          content: 'ditaiTemplate', // 默认选择第一个选项的id
          details: '',
          contentOptions: [
            { id: 'ditaiTemplate', label: '迪太模板' },
            { id: 'customerSpecified', label: '客户指定' },
          ],
        },
        {
          checkItem: { id: 'inspectionReportRequirements', label: '检验报告要求' },
          content: 'ditaiTemplate', // 默认选择第一个选项的id
          details: '',
          contentOptions: [
            { id: 'ditaiTemplate', label: '迪太模板' },
            { id: 'customerSpecified', label: '客户指定' }
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
      let processedData;
      if (!this.packagingInfo) {
        this.tableData = [];
        return;
      }
      // 如果传入的是字符串，先尝试解析为数组
      if (typeof this.packagingInfo === 'string' && this.packagingInfo.trim()) {
        try {
          processedData = JSON.parse(this.packagingInfo);
        } catch (error) {
          processedData = [];
        }
      }

      if (processedData && processedData.length > 0) {
        // 检查数据格式，如果是简化格式则转换，否则直接使用
        const firstItem = processedData[0];
        if (firstItem.checkItemId && firstItem.contentId !== undefined) {
          // 简化格式，需要转换
          this.tableData = this.convertSimpleDataToTableData(processedData);
        } else if (firstItem.checkItem && firstItem.content) {
          // 完整格式，直接深拷贝使用
          console.log("🚀 ~ file: packagingInfo.vue:155 ~ 直接深拷贝使用:", 直接深拷贝使用)
          this.tableData = JSON.parse(JSON.stringify(processedData));
        } else {
          // 格式不对，使用默认数据
          console.log("🚀 ~ file: packagingInfo.vue:158 ~ 式不对:", 式不对)
          this.tableData = JSON.parse(JSON.stringify(this.defaultTableData));
        }
      } else {
        // 没有数据，使用默认数据
        console.log("🚀 ~ file: packagingInfo.vue:165 ~ 默认数据:", 默认数据)
        this.tableData = JSON.parse(JSON.stringify(this.defaultTableData));
      }
      console.log("🚀 ~ file: packagingInfo.vue:138 ~  this.tableData :", this.tableData)
    },

    // 将简化格式的数据转换为完整的表格数据格式
    convertSimpleDataToTableData(simpleData) {
      console.log("🚀 ~ file: packagingInfo.vue:172 ~ simpleData:", simpleData)
      for (let i = 0; i < simpleData.length; i++) {
        const element = simpleData[i];
        console.log("🚀 ~ file: packagingInfo.vue:174 ~ element:", element)
        this.defaultTableData[i].content = element.contentId;
        this.defaultTableData[i].details = element.details;
        // 处理文件URL字段（如果存在）
        if (element.fileUrl !== undefined) {
          this.defaultTableData[i].fileUrl = element.fileUrl;
        }
      }
      return this.defaultTableData
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

    // 处理文件下载
    handleFileDownload(fileUrl) {
      if (!fileUrl) {
        this.$message.warning('文件链接不存在');
        return;
      }
      
      try {
        // 如果是JSON字符串格式的文件数组，解析第一个文件
        let downloadUrl = fileUrl;
        if (typeof fileUrl === 'string' && fileUrl.startsWith('[')) {
          const files = JSON.parse(fileUrl);
          if (files && files.length > 0) {
            downloadUrl = files[0].url || files[0];
          }
        }
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = this.getFileName(downloadUrl);
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } catch (error) {
        console.error('文件下载失败:', error);
        this.$message.error('文件下载失败');
      }
    },

    // 从文件URL中提取文件名
    getFileName(fileUrl) {
      if (!fileUrl) return '未知文件';
      
      try {
        // 如果是JSON字符串格式的文件数组，解析第一个文件名
        if (typeof fileUrl === 'string' && fileUrl.startsWith('[')) {
          const files = JSON.parse(fileUrl);
          if (files && files.length > 0) {
            const file = files[0];
            return file.name || this.extractFileNameFromUrl(file.url || file);
          }
        }
        
        // 直接从URL提取文件名
        return this.extractFileNameFromUrl(fileUrl);
        
      } catch (error) {
        console.error('解析文件名失败:', error);
        return '文件';
      }
    },

    // 从URL中提取文件名
    extractFileNameFromUrl(url) {
      if (!url) return '未知文件';
      
      try {
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const cleanFileName = fileName.split('?')[0]; // 去除查询参数
        return decodeURIComponent(cleanFileName) || '文件';
      } catch (error) {
        return '文件';
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.package-info-box {
  max-height: 500px;
  overflow: hidden;
  overflow-y: auto;
  padding: 10px;

  .download-link {
    color: #409EFF;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .file-info {
    display: flex;
    align-items: center;
    
    .el-button {
      color: #409EFF;
      padding: 4px 8px;
      
      &:hover {
        color: #66b1ff;
        background-color: #ecf5ff;
      }
    }
  }

  .no-file {
    color: #c0c4cc;
    font-style: italic;
    font-size: 12px;
  }
}
</style>