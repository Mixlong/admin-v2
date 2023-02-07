<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    :title="showName ? '' : title"
    :visible.sync="dialogVisible"
    :width="showName ? (showName == 'remark' ? '710px' : '510px') : '710px'"
    top="15vh"
    append-to-body
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.native.prevent
      :class="[!showName ? 'form-data-inline' : 'row-label-style']"
      :inline="showName ? false : true"
    >
      <el-form-item
        label="编号:"
        prop="no"
        v-if="showName == 'no' || !showName"
      >
        <el-input v-model="form.no" placeholder="请输入编号"> </el-input>
      </el-form-item>
      <el-form-item
        label="名称:"
        prop="name"
        v-if="showName == 'name' || !showName"
      >
        <el-input v-model="form.name" placeholder="请输入名称"> </el-input>
      </el-form-item>
      <el-form-item
        label="型号:"
        prop="type"
        v-if="showName == 'type' || !showName"
      >
        <el-input v-model="form.type" placeholder="请输入型号"> </el-input>
      </el-form-item>
      <el-form-item
        label="当前地址:"
        prop="addr"
        v-if="showName == 'addr' || !showName"
      >
        <el-input v-model="form.addr" placeholder="请输入当前地址"> </el-input>
      </el-form-item>
      <el-form-item
        label="控制板:"
        prop="controlBoard"
        v-if="showName == 'controlBoard' || !showName"
      >
        <el-input v-model.trim="form.controlBoard" placeholder="请输入控制板">
        </el-input>
      </el-form-item>

      <el-form-item
        label="责任人:"
        prop="principal"
        v-if="showName == 'principal' || !showName"
      >
        <el-select
          v-model="form.principal"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            v-for="(item, index) in pmDictListOptions"
            :key="index"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态:" prop="addr" v-if="showName == 'state'">
        <el-select
          v-model="form.state"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            v-for="item in stateList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注:" prop="remark" v-if="showName == 'remark'">
        <tinymce
          v-if="dialogVisible"
          v-model="form.remark"
          placeholder="请输入"
          :width="showName == 'remark' ? '100%' : '590px'"
          height="210"
        ></tinymce>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { toolAdd, toolUpdate } from "@/api/third/tool";
import tinymce from "@/views/components/Editor";
export default {
  props: ["pmDictListOptions"],
  components: { tinymce },
  data() {
    return {
      showName: "",
      dialogVisible: false,
      title: "",
      // 是否显示弹出层

      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        no: [{ required: true, message: "请输入编号", trigger: "change" }],
        name: [{ required: true, message: "请输入名称", trigger: "change" }],
        type: [{ required: true, message: "请输入型号", trigger: "change" }],
        controlBoard: [
          { required: true, message: "请输入控制板", trigger: "change" },
        ],
        addr: [
          { required: true, message: "请输入存放地址", trigger: "change" },
        ],
        principal: [
          { required: true, message: "请选择责任人", trigger: "change" },
        ],
      },
      options: [],
      stateList: [
        {
          value: 0,
          label: "闲置",
        },
        {
          value: 1,
          label: "使用中",
        },
        {
          value: 2,
          label: "升级中",
        },
        {
          value: 4,
          label: "禁用",
        },
      ],
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.resetForm("form");
      }
    },
  },
  mounted() {},
  methods: {
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let fn = this.showName ? toolUpdate : toolAdd;

          fn(this.form).then((response) => {
            if (response.code === 200) {
              this.msgSuccess(this.showName ? "修改成功" : "新增成功");
              this.$parent.getList();
              this.dialogVisible = false;
            }
          });
        }
      });
    },
    changeDut(val) {
      if (!val) {
        this.form.processId = null;
        this.form.dutCode = null;
      }
    },
    changeProcessId(val) {
      if (!val) {
        this.form.processId = null;
        this.form.dutCode = null;
      }
    },
  },
};
</script>
<style lang='scss'  >
</style>
