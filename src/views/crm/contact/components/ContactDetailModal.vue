<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title=""
    width="600px"
    top="0vh"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <div v-if="contact" class="contact-detail">
      <el-descriptions title="联系人信息" :column="2" border>
        <el-descriptions-item label="姓名">{{ contact.contactName }}</el-descriptions-item>
        <el-descriptions-item label="所属客户">{{ contact.customerName }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ contact.department }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ contact.position }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ contact.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ contact.email }}</el-descriptions-item>
        <el-descriptions-item label="微信">{{ contact.wechat }}</el-descriptions-item>
        <el-descriptions-item label="是否决策人">
          <el-tag v-if="contact.isDecisionMaker === 1" type="warning" size="small">是</el-tag>
          <span v-else>否</span>
        </el-descriptions-item>
        <el-descriptions-item label="名片图片" :span="2">
          <div v-if="contact.cardImage  && getImageList(contact.cardImage ).length > 0">
            <el-carousel 
              v-if="getImageList(contact.cardImage ).length > 1"
              height="150px" 
              :autoplay="false" 
              indicator-position="outside"
              arrow="hover"
              :interval="4000"
              style="width: 200px; border-radius: 4px; overflow: hidden;">
              <el-carousel-item 
                v-for="(img, index) in getImageList(contact.cardImage)" 
                :key="index">
                <el-image
                  style="width: 200px; height: 150px"
                  :src="img"
                  :preview-src-list="getImageList(contact.cardImage )"
                  :initial-index="index"
                  fit="cover">
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
              </el-carousel-item>
            </el-carousel>
            <el-image
              v-else
              style="width: 200px; height: 150px; border-radius: 4px;"
              :src="getImageList(contact.cardImage )[0]"
              :preview-src-list="getImageList(contact.cardImage )"
              fit="cover">
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </div>
          <span v-else>暂无名片</span>
        </el-descriptions-item>
        <el-descriptions-item label="联系人详情" :span="2">{{ contact.contactDetails }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ContactDetailModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    contact: {
      type: Object,
      default: null
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },
  methods: {
    // 处理多图显示 - 将逗号分隔的URL字符串转换为数组
    getImageList(imgStr) {
      if (!imgStr) return []
      return imgStr.split(',').filter(url => url.trim() !== '')
    },

    handleClose() {
      this.$emit('update:visible', false)
    },

    handleEdit() {
      if (this.contact) {
        this.$router.push(`/crm/contact/edit/${this.contact.id}`)
        this.handleClose()
      }
    }
  }
}
</script>

<style scoped>
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.contact-detail :deep(.el-image) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>