<template>
  <el-dialog
    title="请确认是否删除"
    :visible.sync="delDialogVisible"
    :close-on-click-modal='false'
    width="30%"
    center
    
  >
    <el-row style="display: flex">
      <el-input
        auto-complete="off"
        placeholder="验证码"
        v-model="code"
        style="width: 60%; margin-right: 20px"
      >
      </el-input>
      <img @click="getCode" :src="codeUrl" />
    </el-row>

    <span slot="footer" class="dialog-footer">
      <el-button @click="delDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleDelSub">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getCodeImg } from "@/api/base/code";
export default {
  data() {
    return {
      code: "",
      codeUrl: "",
      delDialogVisible: false,
    };
  },
  watch: {
    delDialogVisible(val) {
      if (val) {
        this.getCode();
        this.code=''
      }
    },
  },
  mounted() {
    this.getCode();
  },
  methods: {
    handleDelSub() {
      if (this.code) {
        this.$emit("confirm",{code: this.code,uuid:this.uuid});
      } else {
        this.msgError("验证码不能为空");
      }
    },
    getCode() {
      getCodeImg().then((res) => {
        this.codeUrl = "data:image/gif;base64," + res.img;
        this.uuid = res.uuid;
      });
    },
  },
};
</script>

<style>
</style>