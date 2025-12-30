<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
    top="0vh"
    class="dialog-scroll"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="140px"
    >
      <el-form-item label="请购单号" prop="purchaseOrderNo">
        <el-input
          v-model="form.purchaseOrderNo"
          placeholder="请输入请购单号"
          maxlength="50"
        />
      </el-form-item>

      <el-form-item label="料号" prop="materialCode">
        <select-loadMore
          v-model="form.materialCode"
          style="width: 100%"
          :data="inventoryData.data"
          :page="inventoryData.page"
          :hasMore="inventoryData.more"
          dictLabel="invCode"
          dictValue="invCode"
          :request="getInventoryList"
          placeholder="请选择物料编码"
          size="mini"
        >
        </select-loadMore>
      </el-form-item>
      
                 
      <el-form-item label="数量" prop="quantity">
        <el-input-number
          v-model="form.quantity"
          :min="1"
          :max="999999"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="预计到料日期" prop="expectedArrivalDate">
        <el-date-picker
          v-model="form.expectedArrivalDate"
          type="date"
          placeholder="选择预计到料日期"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  addIncomingMaterial
} from '@/api/base/incomingMaterial'
import { getInventoryList } from '@/api/base/inventory'
import selectLoadMore from '@/components/selectLoadMore'

export default {
  name: 'FormDialog',
  components: { selectLoadMore },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      materialLoading: false,
      materialOptions: [],
      title: '新增来料入库',
      form: {
        purchaseOrderNo: '',
        materialCode: '',
        quantity: 1,
        expectedArrivalDate: ''
      },
            // 来料数据
      inventoryData: {
        data: [],
        page: 1,
        more: true
      },
      rules: {
        purchaseOrderNo: [
          { required: false, message: '请输入请购单号', trigger: 'blur' }
        ],
        materialCode: [
          { required: true, message: '请输入料号', trigger: 'blur' }
        ],
        quantity: [
          { required: true, message: '请输入数量', trigger: 'blur' }
        ],
        expectedArrivalDate: [
          { required: true, message: '请选择预计到料日期', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    // 获取来料列表
    getInventoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        const params = {
          p: page,
          l: 10
        }
        
        if (keyword) {
          params.invCode = keyword
        }

        getInventoryList(params).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total } = res.data
            const pageSize = 10
            if (more) {
              this.inventoryData.data = [...this.inventoryData.data, ...list]
            } else {
              this.inventoryData.data = list || []
            }
            this.inventoryData.more = page * pageSize < total
            this.inventoryData.page = page
          } else {
            this.inventoryData.data = []
            this.inventoryData.more = false
          }
          resolve()
        }).catch((error) => {
          console.error('获取来料数据失败:', error)
          this.inventoryData.data = []
          this.inventoryData.more = false
          resolve()
        })
      })
    },

    open() {
      this.dialogVisible = true
      this.title = '新增来料入库'
      this.resetForm()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          
          addIncomingMaterial(this.form)
            .then(() => {
              this.msgSuccess('新增成功')
              this.dialogVisible = false
              this.$emit('ok')
            })
            .finally(() => {
              this.submitLoading = false
            })
        }
      })
    },
    resetForm() {
      this.form = {
        purchaseOrderNo: '',
        materialCode: '',
        quantity: 1,
        expectedArrivalDate: ''
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    handleClose() {
      this.resetForm()
    }
  }
}
</script>
