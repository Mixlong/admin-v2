<template>
  <el-dialog
    title="试产申请详情"
    :visible.sync="dialogVisible"
    width="1000px"
    :close-on-click-modal="false"
    append-to-body
    class="dialog-scroll"
  >
    <div v-loading="loading">
      <!-- 基本信息 -->
      <el-descriptions title="基本信息" :column="2" border class="margin-bottom-sm">
        <el-descriptions-item label="试产编号">{{ detailData.ecn || '-' }}</el-descriptions-item>
        <el-descriptions-item label="产品品类">{{ detailData.categoryName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="产品型号">{{ detailData.computerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请部门">{{ detailData.reqUnit || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detailData.applicant || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="试产说明" :span="2">{{ detailData.trialInfo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="附件" :span="2" v-if="detailData.file">
          <FileDisplay :file-url="detailData.file" />
        </el-descriptions-item>
      </el-descriptions>

      <!-- 审核信息（合并展示） -->
      <div class="section-title margin-bottom-sm">审核信息</div>
      <el-table :data="auditTableData" border size="small" :span-method="auditSpanMethod">
        <el-table-column label="审核阶段" prop="stage" width="100" align="center" />
        <el-table-column label="部门" prop="dept" width="80" align="center" />
        <el-table-column label="方案" prop="programme" min-width="280">
          <template slot-scope="scope">
            <template v-if="scope.row.programmeLabel">
              <div class="programme-item">
                <el-tag size="mini" type="info">{{ scope.row.programmeLabel }}</el-tag>
                <span class="programme-value">{{ scope.row.programme || '-' }}</span>
              </div>
              <div v-if="scope.row.treatmentLabel" class="programme-item margin-top-xs">
                <el-tag size="mini" type="info">{{ scope.row.treatmentLabel }}</el-tag>
                <span class="programme-value">{{ scope.row.treatment || '-' }}</span>
              </div>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="审核人" prop="person" width="100" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" :type="getStateType(scope.row.state)">{{ getStateText(scope.row.state) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="120">
          <template slot-scope="scope">{{ scope.row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column label="拒绝原因" prop="result" min-width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.result" class="text-danger">{{ scope.row.result }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { trialApplyDetail } from '@/api/third/trialApply'
import FileDisplay from '@/components/FileDisplay'

export default {
  name: 'TrialApplyDetail',
  components: { FileDisplay },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      detailData: { list: [] },
      auditSpanArr: [],
      auditPosition: 0
    }
  },
  computed: {
    // 合并后的审核表格数据
    auditTableData() {
      const data = []
      const d = this.detailData
      // 初审
      data.push({
        stage: '初审',
        dept: '-',
        programme: '',
        treatment: '',
        treatmentLabel: '',
        person: d.firstPerson || '-',
        state: d.firstState,
        remark: d.remark || '',
        result: d.result || '',
        rowType: 'first'
      })
      // 会审（按部门分组）
      const list = d.list || []
      const sortedList = [...list].sort((a, b) => a.field - b.field)
      sortedList.forEach(item => {
        data.push({
          stage: '会审',
          dept: this.getFieldName(item.field),
          programme: item.programme || '',
          programmeLabel: this.getProgrammeLabel(item.field),
          treatment: item.treatment || '',
          treatmentLabel: this.getTreatmentLabel(item.field),
          person: item.fieldName || '-',
          state: item.state,
          remark: item.remark || '',
          result: item.result || '',
          rowType: 'second',
          field: item.field
        })
      })
      // PMC审
      data.push({
        stage: 'PMC审',
        dept: '-',
        programme: '',
        treatment: '',
        treatmentLabel: '',
        person: d.thirdPerson || '-',
        state: d.thirdState,
        remark: d.thirdRemark || '',
        result: d.thirdResult || '',
        rowType: 'third'
      })
      // 终审
      data.push({
        stage: '终审',
        dept: '-',
        programme: '',
        treatment: '',
        treatmentLabel: '',
        person: d.finalPerson || '-',
        state: d.secondState,
        remark: d.finalRemark || '',
        result: d.finalResult || '',
        rowType: 'final'
      })
      return data
    }
  },
  watch: {
    auditTableData: {
      handler(data) {
        this.getAuditSpanArr(data)
      },
      immediate: true
    }
  },
  methods: {
    // 计算审核表格合并行
    getAuditSpanArr(data) {
      this.auditSpanArr = []
      this.auditPosition = 0
      for (let i = 0; i < data.length; i++) {
        if (i === 0) {
          this.auditSpanArr.push(1)
          this.auditPosition = 0
        } else {
          // 同一阶段且同一部门合并
          if (data[i].stage === data[i - 1].stage && data[i].dept === data[i - 1].dept) {
            this.auditSpanArr[this.auditPosition] += 1
            this.auditSpanArr.push(0)
          } else {
            this.auditSpanArr.push(1)
            this.auditPosition = i
          }
        }
      }
    },
    // 审核表格合并单元格
    auditSpanMethod({ rowIndex, columnIndex }) {
      // 审核阶段列合并（同阶段合并）
      if (columnIndex === 0) {
        const data = this.auditTableData
        if (rowIndex === 0 || data[rowIndex].stage !== data[rowIndex - 1].stage) {
          let count = 1
          for (let i = rowIndex + 1; i < data.length; i++) {
            if (data[i].stage === data[rowIndex].stage) count++
            else break
          }
          return { rowspan: count, colspan: 1 }
        }
        return { rowspan: 0, colspan: 0 }
      }
      // 部门和方案列合并（同部门合并）
      if (columnIndex === 1 || columnIndex === 2) {
        const rowspan = this.auditSpanArr[rowIndex]
        const colspan = rowspan > 0 ? 1 : 0
        return { rowspan, colspan }
      }
    },
    showDetail(id) {
      this.dialogVisible = true
      this.loading = true
      this.getDetailData(id)
    },
    getDetailData(id) {
      trialApplyDetail(id).then((response) => {
        if (response.code === 200) {
          this.detailData = response.data || { list: [] }
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    getStateType(state) {
      switch (state) {
        case 0: return 'warning'
        case 1: return 'success'
        case 2: return 'danger'
        default: return 'info'
      }
    },
    getStateText(state) {
      switch (state) {
        case 0: return '待审核'
        case 1: return '已审核'
        case 2: return '已驳回'
        default: return '未知'
      }
    },
    getFinalState() {
      if (this.detailData.finalResult) return 2
      if (this.detailData.finalRemark) return 1
      return 0
    },
    getFieldName(field) {
      const names = { 2: '采购', 3: '品质', 4: '生产', 5: '工程', 6: '研发', 7: '仓库', 8: '市场' }
      return names[field] || '未知'
    },
    // 方案标签（与表单对齐）
    getProgrammeLabel(field) {
      const labels = {
        2: '在途物料处理方案',
        3: '涉及更新的文件',
        4: '在制产品处理方案',
        5: '涉及更新的文件',
        6: '涉及更新的文件',
        7: '在库物料处理方案',
        8: '已出货产品处理方案'
      }
      return labels[field] || ''
    },
    // 处理方案标签（仓库和市场有第二个方案）
    getTreatmentLabel(field) {
      const labels = { 7: '在库成品处理方案', 8: '未出货产品处理方案' }
      return labels[field] || ''
    }
  }
}
</script>

<style scoped>
::v-deep .el-descriptions__label {
  width: 120px;
}
.text-danger {
  color: #f56c6c;
}
.text-gray {
  color: #909399;
}
.margin-bottom-sm {
  margin-bottom: 20px;
}
.margin-top-xs {
  margin-top: 8px;
}
.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}
.programme-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.programme-value {
  flex: 1;
  word-break: break-all;
}
</style>
