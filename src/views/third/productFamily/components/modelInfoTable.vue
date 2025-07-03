  <template>
    <div class="product-packaging-info">
      <el-table :data="tableData" :key="tableKey" style="width: 100%">
        <el-table-column prop="checkItem.label" label="包装作业检查项目" align="center" width="200"></el-table-column>
        <el-table-column label="作业内容" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.content" placeholder="请选择" style="width:300px"
              @change="handleChange(scope.row)">
              <el-option v-for="(item, index) in scope.row.contentOptions" :key="`${scope.$index}-${index}-${item.id}`"
                :label="item.label" :value="item.id" />
            </el-select>

          </template>
        </el-table-column>
        <el-table-column label="详情/附件" align="center">
          <template slot-scope="scope">
            <div
              v-if="(scope.row.checkItem.id === 'accessoryPackingRequirements' || scope.row.checkItem.id === 'boxMarkRequirements') && scope.row.content === 'customerSpecified'">
              <!-- <MyUpload class="upload-demo" action="https://jsonplaceholder.typicode.com/posts/"
                v-model="scope.row.details" :multiple="false" :limit="1">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </MyUpload> -->
                  <DrUpload
             v-model="scope.row.details"
              :limit="1"
              :isOnePic="1"
              class="flex-direction align-start"
            >
              <div class="text-left">
                <el-button type="primary" size="small">
                  上传
                  <i class="el-icon-upload el-icon--right"></i>
                </el-button>
              </div>
            </DrUpload>
            </div>
            <div v-else>
              <el-input type="textarea" v-model="scope.row.details"></el-input>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>

<script>

export default {
  props: {
    data: {
      type: [Array, String],
      default: () => []
    }
  },
  data() {
    return {
      tableKey: Date.now(), // 用于强制刷新表格
      // 默认的完整数据结构模板
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
      tableData: []
    };
  },
  mounted() {
    this.initializeTableData();
  },
  watch: {
    data: {
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
      let processedData = this.data;

      // 如果传入的是字符串，先尝试解析为数组
      if (typeof this.data === 'string' && this.data.trim()) {
        try {
          processedData = JSON.parse(this.data);
        } catch (error) {
          console.warn('Failed to parse data string:', error);
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
          this.tableData = JSON.parse(JSON.stringify(processedData));
        } else {
          // 格式不对，使用默认数据
          this.tableData = JSON.parse(JSON.stringify(this.defaultTableData));
        }
      } else {
        // 没有数据，使用默认数据
        this.tableData = JSON.parse(JSON.stringify(this.defaultTableData));
      }
      
      // 确保每行的content都默认选择第一个选项
      this.ensureDefaultContentSelection();
      console.log("🚀 ~ initializeTableData ~ this.tableData:", this.tableData)
    },
    
    // 确保每行的content都默认选择第一个选项
    ensureDefaultContentSelection() {
      this.tableData.forEach(row => {
        if (!row.content && row.contentOptions && row.contentOptions.length > 0) {
          row.content = row.contentOptions[0].id;
        }
      });
    },

    // 将简化格式的数据转换为完整的表格数据格式
    convertSimpleDataToTableData(simpleData) {
      return this.defaultTableData.map(template => {
        const matchingData = simpleData.find(item => item.checkItemId === template.checkItem.id);
        return {
          ...template,
          content: matchingData?.contentId || template.contentOptions[0].id, // 默认选择第一个选项
          details: matchingData?.details || ''
        };
      });
    },

    exportSelectedJson() {
      const formattedData = this.tableData.map(row => {
        return {
          checkItemId: row.checkItem.id,
          contentId: row.content,
          details: row.details
        };
      });
      return JSON.stringify(formattedData);
    },

    handleChange(row) {
      row.details = '';
    }

  }
};
</script>

<style lang="scss" scoped>
.product-packaging-info {
  padding: 20px;

  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
}
</style>