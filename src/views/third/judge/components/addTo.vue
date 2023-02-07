<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :width="showName ? (showName == 'problem' ? '1020px' : '510px') : '1020px'"
    append-to-body
    :close-on-click-modal="false"
    top="2vh"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="110px"
      class="input-width-judge"
      :class="{ 'row-label-style': showName }"
    >
      <el-row :gutter="100">
        <el-col :span="12" v-if="showName == 'dept' || !showName">
          <el-form-item label="责任领域" prop="dept">
            <el-select
              v-model="form.dept"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in deptList"
                :key="index"
                :label="item.dictLabel"
                :value="item.dictValue"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="showName == 'principal' || !showName">
          <el-form-item label="负责人" prop="principal">
            <el-select
              v-model="form.principal"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in pmDictList"
                :key="index"
                :label="item.dictLabel"
                :value="item.dictValue"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="showName == 'state' || !showName">
          <el-form-item label="状态" prop="state">
            <el-select
              v-model="form.state"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in stateList"
                :key="index"
                :label="item.dictLabel"
                :value="item.dictValue"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="showName == 'planDoneTime' || !showName">
          <el-form-item label="计划完成时间" prop="planDoneTime">
            <el-date-picker
              ref="datePicker"
              v-model="form.planDoneTime"
              type="date"
              placeholder="选择日期时间"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" v-if="showName == 'problem' || !showName">
          <el-form-item
            label="遗留问题"
            label-width="108px"
            prop="problem"
            style="width: 100%; max-height: 326px"
          >
            <!-- <tinymce
              v-if="dialogVisible"
              v-model="form.problem"
              placeholder="请输入"
              height="150"
            ></tinymce> -->
            <el-input
              type="textarea"
              :autosize="{ minRows: 4 }"
              placeholder="请输入内容"
              v-model="form.problem"
            >
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { judgeoOderAdd, judgeOrderUpdate } from "@/api/third/judge";
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["deptList", "pmDictList", "stateList"],
  data() {
    return {
      showName: "",
      dialogVisible: false,
      // 表单参数
      form: {
        isShow: 0,
      },
      title: "",
      // 表单校验
      rules: {
        dept: [{ required: true, message: "请选择责任领域", trigger: "blur" }],
        projectName: [
          { required: true, message: "请选择责任领域", trigger: "blur" },
        ],
        principal: [
          { required: true, message: "请选择负责人", trigger: "blur" },
        ],
        state: [{ required: true, message: "请选择状态", trigger: "blur" }],
        planDoneTime: [
          { required: true, message: "请选择日期时间", trigger: "blur" },
        ],
        problem: [
          { required: true, message: "请输入遗留问题", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    dialogVisible(val) {
      // if (!val) {
      //   this.form = {};
      // }
    },
  },
  mounted() {},
  methods: {
    // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let param = Object.assign({}, this.form);
          if (param.id) {
            judgeOrderUpdate(param).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            judgeoOderAdd(param).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scope>
.input-width-judge.row-label-style {
  .el-row {
    position: inherit;
    .el-col {
      width: 100%;
    }
  }
}
</style>

