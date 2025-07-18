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
                v-if="scope.row.content === item.id"
                  >{{ item.label }}</span>
           
          </template>
        </el-table-column>
        <el-table-column label="详情">
          <template slot-scope="scope">
            <template v-if="isHttpLink(scope.row.details)">
              <a href="javascript:void(0)" @click="handleDownload(scope.row.details)" class="download-link">下载链接</a>
            </template>
            <template v-else>
              {{ scope.row.details || '无' }}
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
      let processedData ;
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
}
</style>