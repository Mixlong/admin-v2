<template>
  <div class="dut-detail">
    <el-dialog
      :close-on-click-modal="false"
      @close="onClose"
      :visible.sync="dialogVisible"
      title="日志"
      width="50%"
      top="10vh"
      center
    >
      <div class="text-right">
        <el-button type="primary" size="small" :disabled="isDisabled" @click="onStart(1)">开始</el-button>
        <el-button size="small" @click="onStart(0)">结束</el-button>
      </div>
      <div class="dut-box flex margin-top">
        <div class="dut-left flex-sub margin-right-sm">
          <p class="text-center">平台LOG</p>
          <div class="log-box margin-top" v-if="platformLog" v-html="platformLog"></div>
          <div v-else class="text-center">暂无数据</div>
        </div>
        <div class="dut-right flex-sub">
          <p class="text-center">脚本LOG</p>
          <div class="log-box margin-top" v-if="scriptLog" v-html="scriptLog"></div>
          <div v-else class="text-center">暂无数据</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { moduleIotLog, moduleIotLogDetail } from "@/api/pucs/soft";
export default {
  name: "dutDetail",
  props: ["detailId"],
  data() {
    return {
      dialogVisible: false,
      isDisabled: false,
      timers: null,
      platformLog: "",
      scriptLog: "",
    };
  },
  methods: {
    onStart(status) {
      if (status === 1) {  
        const data = { id: this.detailId, status };
        moduleIotLog(data).then((res) => {
          this.isDisabled = true  
          this.timers = setInterval(this.getDetail, 1000);
        });
      } else {
        this.isDisabled = false  
        clearInterval(this.timers);
      }
    },
    getDetail() {
      moduleIotLogDetail(this.detailId).then((res) => {
        const { platformLog, scriptLog } = res.data;
        if (platformLog) {
          this.platformLog += platformLog;
        }
        if (scriptLog) {
          this.scriptLog += scriptLog;
        }
      });
    },
    onClose() {
      this.isDisabled = false  
      clearInterval(this.timers);
    },
    clearTxt() {
        this.platformLog = ''
        this.scriptLog = ''
    }
  },
};
</script>

<style lang="scss" scoped>
.dut-detail {
  .dut-box {
    .dut-left,
    .dut-right {
      border: 1px solid #ccc;
      height: 400px;
      border-radius: 5px;
      padding: 5px;
      p {
        font-weight: bold;
      }
      .log-box {
        height: 320px;
        overflow-y: auto;
      }
    }
  }
}
</style>