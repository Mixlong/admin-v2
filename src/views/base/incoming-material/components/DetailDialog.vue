<template>
  <el-dialog
    title="来料入库详情"
    :visible.sync="dialogVisible"
    width="700px"
    @close="handleClose"
    top='0vh'
  >
    <el-descriptions :column="2" border v-loading="loading">
      <el-descriptions-item label="请购单号">
        {{ detail.purchaseOrderNo || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="料号">
        {{ detail.materialCode || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="物料名称">
        {{ detail.materialName || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="规格">
        {{ detail.specification || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="数量">
        {{ detail.quantity || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="预计到料日期">
        {{ detail.expectedArrivalDate || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="实际到料日期">
        {{ detail.actualArrivalDate || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="检验完成日期">
        {{ detail.inspectionCompleteDate || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="延期天数">
        <span :style="{ color: detail.delayDays > 0 ? '#F56C6C' : '' }">
          {{ detail.delayDays || 0 }} 天
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="入库状态">
        <el-tag v-if="detail.storageStatus === 0" type="info">{{ detail.storageStatusName }}</el-tag>
        <el-tag v-else-if="detail.storageStatus === 1" type="warning">{{ detail.storageStatusName }}</el-tag>
        <el-tag v-else-if="detail.storageStatus === 2" type="">{{ detail.storageStatusName }}</el-tag>
        <el-tag v-else-if="detail.storageStatus === 3" type="success">{{ detail.storageStatusName }}</el-tag>
        <span v-else>--</span>
      </el-descriptions-item>
      <el-descriptions-item label="创建人">
        {{ detail.createBy || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ detail.createTime || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="修改人">
        {{ detail.updateBy || '--' }}
      </el-descriptions-item>
      <el-descriptions-item label="修改时间">
        {{ detail.updateTime || '--' }}
      </el-descriptions-item>
    </el-descriptions>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getIncomingMaterialDetail } from '@/api/base/incomingMaterial'

export default {
  name: 'DetailDialog',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      detail: {}
    }
  },
  methods: {
    open(id) {
      this.dialogVisible = true
      this.loadDetail(id)
    },
    loadDetail(id) {
      this.loading = true
      getIncomingMaterialDetail(id)
        .then(response => {
          this.detail = response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleClose() {
      this.detail = {}
    }
  }
}
</script>
