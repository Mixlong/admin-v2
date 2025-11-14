<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="500px" append-to-body top="0vh">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="审核结果" prop="state">
        <el-radio-group v-model="form.state">
          <el-radio :label="1">通过</el-radio>
          <el-radio :label="2">驳回</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="拒绝原因" prop="result" v-if="form.state === 2">
        <el-input v-model="form.result" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitAudit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { trialApplyFirstAudit, trialApplySecondAudit, trialApplyThirdAudit, trialApplyFinalAudit, trialApplyFieldState } from '@/api/third/trialApply'

export default {
  data() {
    return {
      dialogVisible: false,
      title: '',
      auditType: 0, // 1:初审 2:会审 3:终审 4:PMC审
      currentFieldItem: null, // 当前会审的字段项
      form: {
        id: '',
        secondPerson: '',
        state: 1,
        remark: '',
        result: ''
      },
      rules: {
        state: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
        result: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
      }
    }
  },
  methods: {
    showAudit(row, type) {
      this.auditType = type
      this.form.state = 1
      this.form.remark = ''
      this.form.result = ''
      
      switch (type) {
        case 1:
          this.title = '初审'
          this.form.id = row.id
          this.form.secondPerson = row.firstPerson
          this.currentFieldItem = null
          break
        case 2:
          this.title = '会审'
          // 对于会审，row是字段项对象
          this.currentFieldItem = row
          this.form.id = row.id
          this.form.secondPerson = row.fieldName
          break
        case 4:
          this.title = 'PMC审'
          this.form.id = row.id
          this.form.secondPerson = row.thirdPerson
          this.currentFieldItem = null
          break
        case 5:
          this.title = '终审'
          this.form.id = row.id
          this.form.secondPerson = row.finalPerson
          this.currentFieldItem = null
          break
      }
      
      this.dialogVisible = true
    },
    resetAudit(row, type) {
      this.$confirm('是否确认撤销该审核?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let param
        if (type === 2) {
          // 会审撤销，传递完整的字段对象
          param = {
            ...row,
            state: 0,
            remark: '',
            result: ''
          }
        } else {
          // 其他审核撤销
          param = {
            id: row.id,
            state: 0,
            remark: '',
            result: ''
          }
        }
        this.submitAuditAPI(param, type)
      }).catch(() => {})
    },
    submitAudit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.state === 2 && !this.form.result) {
            this.msgError('请输入拒绝原因')
            return
          }
          
          let param
          if (this.auditType === 2) {
            // 会审提交，传递完整的字段对象
            param = {
              ...this.currentFieldItem,
              state: this.form.state,
              remark: this.form.remark,
              result: this.form.result
            }
          } else {
            // 其他审核提交
            param = this.form
          }
          
          this.submitAuditAPI(param, this.auditType)
        }
      })
    },
    submitAuditAPI(param, type) {
      let apiMethod
      switch (type) {
        case 1:
          apiMethod = trialApplyFirstAudit
          break
        case 2:
          apiMethod = trialApplyFieldState // 使用新的会审字段状态接口
          break
        case 4:
          apiMethod = trialApplyThirdAudit
          break
        case 5:
          apiMethod = trialApplyFinalAudit
          break
      }
      
      apiMethod(param).then((response) => {
        if (response.code === 200) {
          this.msgSuccess('审核成功')
          this.dialogVisible = false
          this.$parent.getList()
        }
      })
    }
  }
}
</script>
