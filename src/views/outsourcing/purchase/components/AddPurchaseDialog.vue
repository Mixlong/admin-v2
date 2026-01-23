<template>
  <el-dialog :title="isEdit ? '编辑采购订单' : '新增采购订单'" :visible.sync="visible" width="600px" :close-on-click-modal="false" @close="handleClose" top="0vh">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <el-form-item label="采购单号：" prop="purchaseOrderCode">
        <el-input v-model.trim="form.purchaseOrderCode" placeholder="请输入采购单号" clearable :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="采购订单图：" prop="purchaseOrderImg">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <ImageUpload 
            v-model="form.purchaseOrderImg" 
            :accept="'image/*'" 
            :max="105" 
            :sortable="true" 
            @input="handleImageChange" 
            style="flex: 1;"
          />
          <el-button 
            type="primary" 
            size="mini" 
            icon="el-icon-upload" 
            :loading="pdfUploading"
            @click="handlePdfUpload"
          >
            上传PDF
          </el-button>
        </div>
        <div class="form-tip">支持多图上传，可拖拽排序。点击"上传PDF"可上传PDF文件自动转换为图片</div>
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
    <!-- 隐藏的PDF文件输入框 -->
    <input 
      ref="pdfFileInput" 
      type="file" 
      accept="application/pdf" 
      style="display: none;" 
      @change="onPdfFileSelected"
    />
  </el-dialog>
</template>

<script>
import { addOutsourcingOrder, updateOrder } from '@/api/outsourcing/order'
import ImageUpload from '@/components/el-upload-sortable/index.vue'
import axios from 'axios'
import reqUrl from '@/utils/requestUrl'

export default {
  name: 'AddPurchaseDialog',
  components: { ImageUpload },
  data() {
    return {
      visible: false,
      submitLoading: false,
      isEdit: false,
      pdfUploading: false, // PDF上传中
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
      // 当图片URL改变时，提取文件名（多图用逗号分隔）
      if (value) {
        const urls = value.split(',').filter(url => url.trim())
        const fileNames = urls.map(url => this.extractFileName(url))
        this.form.purchaseOrderImgName = fileNames.join(',')
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
    /** 触发PDF文件选择 */
    handlePdfUpload() {
      this.$refs.pdfFileInput.click()
    },
    /** PDF文件选择后的处理 */
    onPdfFileSelected(event) {
      const file = event.target.files[0]
      if (!file) return

      if (file.type !== 'application/pdf') {
        this.$message.error('请上传PDF格式文件')
        event.target.value = '' // 重置文件输入框
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      this.pdfUploading = true
      // 调用后端接口转换PDF为图片并上传至OSS
      axios
        .post(reqUrl + '/file/converterToOss', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          this.processPdfResponse(response.data)
        })
        .catch((error) => {
          console.error('PDF转换失败:', error)
          this.$message.error('PDF转换上传失败，请重试')
        })
        .finally(() => {
          this.pdfUploading = false
          // 重置文件输入框，以便于再次选择同一文件
          event.target.value = ''
        })
    },
    /** 处理PDF转换响应数据 */
    processPdfResponse(data) {
      if (data.code === 200 && data.data) {
        // 将获取的OSS图片URL数组添加到表单项中
        if (Array.isArray(data.data)) {
          // 获取现有图片列表
          const existingImages = this.form.purchaseOrderImg 
            ? this.form.purchaseOrderImg.split(',').filter(url => url.trim()) 
            : []
          
          // 处理PDF转换得到的图片
          const newImages = data.data.map(imageData => {
            // 清理URL中的反引号和空格
            let cleanUrl = imageData.url
            if (typeof cleanUrl === 'string') {
              cleanUrl = cleanUrl.replace(/`/g, '').trim()
            }
            return cleanUrl
          }).filter(url => url)

          // 合并现有图片和新图片
          const allImages = [...existingImages, ...newImages]
          this.form.purchaseOrderImg = allImages.join(',')
          
          // 触发图片变化处理
          this.handleImageChange(this.form.purchaseOrderImg)
          
          this.$message.success(`PDF转换成功，已添加 ${newImages.length} 张图片`)
        } else {
          // 处理单个URL的情况
          let cleanUrl = data.data
          if (typeof cleanUrl === 'string') {
            cleanUrl = cleanUrl.replace(/`/g, '').trim()
          }

          const existingImages = this.form.purchaseOrderImg 
            ? this.form.purchaseOrderImg.split(',').filter(url => url.trim()) 
            : []
          
          existingImages.push(cleanUrl)
          this.form.purchaseOrderImg = existingImages.join(',')
          this.handleImageChange(this.form.purchaseOrderImg)
          
          this.$message.success('PDF转换成功')
        }
      } else {
        this.$message.error(data.msg || 'PDF转换失败')
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
