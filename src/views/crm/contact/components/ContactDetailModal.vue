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
 
</style>