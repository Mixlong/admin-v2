<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    width="600px"
    :close-on-click-modal="false"
    top="0vh"
    @close="handleClose">
    <el-form ref="auditForm" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="审核类型">
        <el-tag :type="auditTypeTag">{{ auditTypeName }}</el-tag>
      </el-form-item>
      
      <el-form-item v-if="auditType === 'field'" label="审核领域">
        <span>{{ getFieldName(currentFieldItem.field) }} - {{ currentFieldItem.fieldName }}</span>
      </el-form-item>
      
      <el-form-item label="审核结果" prop="state">
        <el-radio-group v-model="form.state">
          <el-radio :label="1">通过</el-radio>
          <el-radio :label="2">驳回</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item v-if="form.state === 2" label="驳回原因" prop="result">
        <el-input
          v-model="form.result"
          type="textarea"
          :rows="3"
          placeholder="请输入驳回原因"
          maxlength="500"
          show-word-limit />
      </el-form-item>
      
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（可选）"
          show-word-limit />
      </el-form-item>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { sopFieldAudit, sopEngineerAudit, sopFinalAudit, sopProjectAudit } from "@/api/third/testApi";

export default {
  name: "AuditDialog",
  data() {
    return {
      visible: false,
      submitLoading: false,
      auditType: '', // 'field' | 'engineering' | 'project' | 'final'
      rowData: null,
      currentFieldItem: null,
      form: {
        state: 1,
        result: '',
        remark: ''
      },
      rules: {
        state: [
          { required: true, message: '请选择审核结果', trigger: 'change' }
        ],
        result: [
          { required: true, message: '请输入驳回原因', trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    dialogTitle() {
      const typeMap = {
        field: '会审',
        engineering: '工程审',
        project: '项目审',
        final: '终审'
      };
      return typeMap[this.auditType] || '审核';
    },
    auditTypeName() {
      const typeMap = {
        field: '会审',
        engineering: '工程审',
        project: '项目审',
        final: '终审'
      };
      return typeMap[this.auditType] || '';
    },
    auditTypeTag() {
      const tagMap = {
        field: 'primary',
        engineering: 'warning',
        project: 'info',
        final: 'success'
      };
      return tagMap[this.auditType] || 'info';
    }
  },
  methods: {
    open(type, rowData, fieldItem = null) {
      this.auditType = type;
      this.rowData = rowData;
      this.currentFieldItem = fieldItem;
      this.visible = true;
      this.resetForm();
      
      // 调试信息
      console.log('审核类型:', type);
      console.log('行数据:', rowData);
      console.log('sopChangeNotice:', rowData.sopChangeNotice);
      if (type === 'project') {
        console.log('项目审核人:', rowData.sopChangeNotice?.projectPerson);
      }
    },
    
    handleClose() {
      this.visible = false;
      this.resetForm();
    },
    
    resetForm() {
      this.form = {
        state: 1,
        result: '',
        remark: ''
      };
      this.$nextTick(() => {
        this.$refs.auditForm && this.$refs.auditForm.clearValidate();
      });
    },
    
    handleSubmit() {
      this.$refs.auditForm.validate(valid => {
        if (valid) {
          this.submitAudit();
        }
      });
    },
    
    async submitAudit() {
      this.submitLoading = true;
      
      try {
        let apiFunc = null;
        let params = {
          id: this.rowData.sopChangeNotice?.id || this.rowData.id,
          state: this.form.state,
          result: this.form.result,
          remark: this.form.remark
        };
        
        if (this.auditType === 'field') {
          // 会审
          apiFunc = sopFieldAudit;
          params = {
            ...this.currentFieldItem,
            id: this.rowData.sopChangeNotice?.id || this.rowData.id,
            state: this.form.state,
            result: this.form.result,
            remark: this.form.remark
          };
        } else if (this.auditType === 'engineering') {
          // 工程审
          apiFunc = sopEngineerAudit;
          params.secondPerson = this.rowData.sopChangeNotice?.engineeringPerson || '';
        } else if (this.auditType === 'project') {
          // 项目审
          apiFunc = sopProjectAudit;
          params.secondPerson = this.rowData.sopChangeNotice?.projectPerson || '';
        } else if (this.auditType === 'final') {
          // 终审
          apiFunc = sopFinalAudit;
          params.secondPerson = this.rowData.sopChangeNotice?.secondPerson || '';
        }
        
        console.log('审核参数:', params);
        const res = await apiFunc(params);
        
        if (res.code === 200) {
          this.$message.success('审核成功');
          this.handleClose();
          this.$emit('success');
        } else {
          this.$message.error(res.msg || '审核失败');
        }
      } catch (error) {
        console.error('审核失败:', error);
        this.$message.error('审核失败，请稍后重试');
      } finally {
        this.submitLoading = false;
      }
    },
    
    getFieldName(field) {
      // type: 2品质 3生产 5研发 8终审 9工程审
      const fieldMap = {
        2: '品质',
        3: '生产',
        5: '研发',
        8: '终审',
        9: '工程审'
      };
      return fieldMap[field] || '';
    }
  }
};
</script>
