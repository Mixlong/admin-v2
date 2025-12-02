<template>
  <el-dialog :title="isEdit ? '编辑采购订单' : '新增采购订单'" :visible.sync="visible" width="600px" :close-on-click-modal="false" @close="handleClose" top="0vh">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <el-form-item label="采购单号：" prop="purchaseOrderCode">
        <el-input v-model.trim="form.purchaseOrderCode" placeholder="请输入采购单号" clearable :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="采购订单图：" prop="purchaseOrderImg">
        <ImageUpload v-model="form.purchaseOrderImg" :accept="'image/*'" :max="1" :sortable="false" @input="handleImageChange" />
      </el-form-item>
      <el-form-item label="生产地点：" prop="address">
        <el-select v-model="form.address" placeholder="请选择生产地点" style="width: 100%" filterable clearable>
          <el-option v-for="(item, index) in productAddressList" :key="index" :label="item.dictLabel" :value="item.dictLabel" />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button size="mini" @click="visible = false">取消</el-button>
      <el-button type="primary" size="mini" @click="handleSubmit" :loading="submitLoading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addOutsourcingOrder, updateOrder } from '@/api/outsourcing/order'
import ImageUpload from '@/components/el-upload-sortable/index.vue'

export default {
  name: 'AddPurchaseDialog',
  components: { ImageUpload },
  data() {
    return {
      visible: false,
      submitLoading: false,
      isEdit: false,
      form: {
        id: null,
        purchaseOrderCode: '',
        purchaseOrderImg: '',
        purchaseOrderImgName: '',
        address: ''
      },
      formRules: {
        purchaseOrderCode: [{ required: true, message: '请输入采购单号', trigger: 'blur' }],
        purchaseOrderImg: [{ required: true, message: '请上传采购订单图', trigger: 'change' }],
        address: [{ required: true, message: '请选择生产地点', trigger: 'change' }]
      },
      productAddressList: []
    }
  },
  created() {
    this.getProductAddressList()
  },
  methods: {
    open(row) {
      this.isEdit = !!row
      if (row) {
        this.form = { 
          id: row.id,
          purchaseOrderCode: row.purchaseOrderCode || '', 
          purchaseOrderImg: row.purchaseOrderImg || '', 
          purchaseOrderImgName: row.purchaseOrderImgName || '',
          address: row.address || '' 
        }
      } else {
        this.form = { id: null, purchaseOrderCode: '', purchaseOrderImg: '', purchaseOrderImgName: '', address: '' }
      }
      this.getProductAddressList()
      this.visible = true
    },
    handleClose() {
      this.$refs.formRef?.resetFields()
    },
    getProductAddressList() {
      this.getDicts('product_address').then(res => {
        this.productAddressList = res.data || []
      })
    },
    handleImageChange(value) {
      // 当图片URL改变时，提取文件名
      if (value) {
        this.form.purchaseOrderImgName = this.extractFileName(value)
      } else {
        this.form.purchaseOrderImgName = ''
      }
    },
    extractFileName(url) {
      if (!url) return ''
      try {
        // 解码URL
        const decodedUrl = decodeURIComponent(url)
        // 分割路径获取文件名
        const parts = decodedUrl.split('/')
        let fileName = parts[parts.length - 1] || ''
        // 去掉查询参数
        fileName = fileName.split('?')[0]
        return fileName || '采购订单图片'
      } catch (error) {
        console.warn('提取文件名失败:', error)
        return '采购订单图片'
      }
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.submitLoading = true
        const api = this.isEdit ? updateOrder : addOutsourcingOrder
        api(this.form).then(res => {
          if (res.code === 200) {
            this.$message.success(this.isEdit ? '编辑成功' : '新增成功')
            this.visible = false
            this.$emit('success')
          }
        }).finally(() => {
          this.submitLoading = false
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>
