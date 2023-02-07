<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    :width="type == 4 ? '950px' : '25%'"
    top="25vh"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      :label-width="type == 4 ? '125px' : '100px'"
      @submit.native.prevent
      class="disabled-click"
      disabled
    >
      <div v-if="type == 4" class="col-12-cust">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测试文件:" prop="dutCode" style="width: 100%">
              <el-input
                style="position: relative; z-index: 10"
                v-model="formUpload.testJsFileName"
                placeholder=""
              >
                <el-button
                  slot="append"
                  icon="el-icon-upload"
                  @click="openFile(1)"
                ></el-button>
              </el-input>
              <DrUpload
                :css="{ position: 'relative', top: '-18px' }"
                :limit="1"
                v-model="formUpload.testJs"
                ref="testJsUpload"
              >
              </DrUpload> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item
              label="烧录文件:"
              prop="processId"
              style="width: 100%"
            >
              <el-input
                style="position: relative; z-index: 10"
                v-model="formUpload.firmwareConf.name"
                placeholder=""
              >
                <el-button
                  slot="append"
                  icon="el-icon-upload"
                  @click="openFile(2)"
                ></el-button>
              </el-input>
              <DrUpload
                :css="{ position: 'relative', top: '-18px' }"
                :limit="1"
                v-model="formUpload.firmware"
                ref="firmwareUpload"
              >
              </DrUpload> </el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label=" 厂商">
              <el-select
                v-model.number="formUpload.firmwareConf.mid"
                style="width: 100%"
                @change="changeMidValue"
                placeholder=""
              >
                <el-option
                  v-for="dict in midOptions"
                  :key="dict.key"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="8">
            <el-form-item label="芯片系列">
              <el-select
                v-model.number="formUpload.firmwareConf.cid"
                @change="$forceUpdate()"
                placeholder=""
              >
                <el-option
                  v-for="(dict, index) in splitCidOptions"
                  :key="index"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="8">
            <el-form-item label="烧录地址">
              <el-input
                v-model="formUpload.firmwareConf.addr"
                placeholder=""
                
              >
                <template slot="prepend">0x</template>
              </el-input>
            </el-form-item></el-col
          >
          <el-col :span="8">
            <el-form-item label="烧录方式">
              <el-select v-model.number="formUpload.firmwareConf.type" placeholder="">
                <el-option
                  v-for="(dict, index) in typeOptions"
                  :key="index"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="8">
            <el-form-item label="输出电压 ">
              <el-select v-model.number="formUpload.firmwareConf.voltage" placeholder="">
                <el-option
                  v-for="(dict, index) in voltageOptions"
                  :key="index"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="8">
            <el-form-item label="可烧录次数">
              <el-input
                type="number"
                v-model="formUpload.firmwareConf.bs"
                placeholder=""
              /> </el-form-item
          ></el-col>
          <el-col :span="8">
            <el-form-item label="擦除配置">
              <el-select v-model.number="formUpload.firmwareConf.erase" placeholder="">
                <el-option label="擦除全片" :value="0" />
                <el-option label="擦除烧写部分" :value="1" />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="8">
            <el-form-item label="烧录速度">
              <el-select v-model.number="formUpload.firmwareConf.speed" placeholder="">
                <el-option label="高速" :value="0" />
                <el-option label="低速" :value="1" />
              </el-select> </el-form-item
          ></el-col>
        </el-row>
        <el-row>
          <el-col :span="4">
            <el-form-item label="">
              <el-checkbox v-model="formUpload.firmwareConf.auto"
                >自动烧录</el-checkbox
              >
              <!-- <el-radio-group
                v-model="formUpload.firmwareConf.auto"
              >
                <el-radio-button :label="0">自动烧录</el-radio-button>
                <el-radio-button :label="1">不自动烧录</el-radio-button>
              </el-radio-group> -->
            </el-form-item></el-col
          >
          <el-col :span="5">
            <el-form-item label="">
              <el-checkbox v-model="formUpload.firmwareConf.burnOnOff"
                >计算余剩烧录</el-checkbox
              >
              <!-- <el-radio-group
                v-model="formUpload.firmwareConf.burnOnOff"
                size="mini"
              >
                <el-radio-button :label="0"> 计算</el-radio-button>
                <el-radio-button :label="1">不计算 </el-radio-button>
              </el-radio-group> -->
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="">
              <el-checkbox v-model="formUpload.firmwareConf.check"
                >是否校验</el-checkbox
              >
              <!-- <el-radio-group
                v-model="formUpload.firmwareConf.check"
                size="mini"
              >
                <el-radio-button :label="0"> 校验</el-radio-button>
                <el-radio-button :label="1">不校验 </el-radio-button>
              </el-radio-group> -->
            </el-form-item></el-col
          >

          <el-col :span="4">
            <el-form-item label="">
              <el-checkbox v-model="formUpload.firmwareConf.protect"
                >读写保护</el-checkbox
              >
            </el-form-item></el-col
          >

          <el-col :span="4">
            <el-form-item label="">
              <el-checkbox v-model="formUpload.firmwareConf.reset"
                >烧录重启</el-checkbox
              >
              <!-- <el-radio-group
                v-model="formUpload.firmwareConf.reset"
                size="mini"
              >
                <el-radio-button :label="0"> 重启运行</el-radio-button>
                <el-radio-button :label="1">不重启运行 </el-radio-button>
              </el-radio-group> -->
            </el-form-item></el-col
          >
        </el-row>
        <el-form-item label="备注" style="width: 100%">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4 }"
            placeholder=""
            v-model="formUpload.remark"
          ></el-input>
        </el-form-item>
      </div>
    </el-form>
    <el-form
      ref="form"
      :model="form"
      class="form-data"
      :label-width="type == 4 ? '125px' : '100px'"
    >
      <el-form-item class="auth" label="拒审原因">
        <el-input
          class="width-100-style"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          v-model="form.remark"
          placeholder="不通过则需要输入原因"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleApprove(3)">不通过</el-button>
      <el-button type="primary" @click="handleApprove(2)">通过</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { pucsState, pucsLoadInfo } from "@/api/pucs";
export default {
  props: ["dutOptions", "processOptions", "factoryOptions", "title", "type"],
  data() {
    return {
      dialogVisible: false,
      // 是否显示弹出层
      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      midOptions: [],
      voltageOptions: [],
      typeOptions: [],
      cidOptions: [],
      splitCidOptions: [],
      // 表单参数
      form: { remark: "" },
      formUpload: { firmwareConf: {} },
      // 表单校验
      rules: {
        processId: [
          { required: false, message: "请选择生产工序", trigger: "change" },
        ],
        factoryId: [
          { required: true, message: "请选择工厂", trigger: "change" },
        ],
        dutCode: [
          { required: false, message: "请选择在测dut", trigger: "change" },
        ],
      },
    };
  },

  mounted() {
    this.getDicts("sys_file_cid").then((res) => {
      for (let key of res.data) {
        key.dictValue = Number(key.dictValue);
      }
      this.cidOptions = res.data;
    });
    this.getDicts("sys_file_type").then((res) => {
      for (let key of res.data) {
        key.dictValue = Number(key.dictValue);
      }
      this.typeOptions = res.data;
    });
    this.getDicts("sys_file_voltage").then((res) => {
      for (let key of res.data) {
        key.dictValue = Number(key.dictValue);
      }
      this.voltageOptions = res.data;
    });
    this.getDicts("sys_file_mid").then((res) => {
      for (let key of res.data) {
        key.dictValue = Number(key.dictValue);
      }
      this.midOptions = res.data;
    });
  },
  methods: {
    getInfo() {
      return new Promise((resolve) => {
        pucsLoadInfo(this.form.id).then((res) => {
          this.formUpload = this.resetBooleForm(res.data);
          if (this.formUpload.firmwareConf.mid) {
            this.changeMidValue(this.formUpload.firmwareConf.mid, false);
            this.form.remark = "";
          }
        });
      });
    },

    resetBooleForm(obj, isPost) {
      let arrStr = ["reset", "protect", "check", "burnOnOff", "auto"];
      let newObj = Object.assign({}, obj);
      for (let key in newObj.firmwareConf) {
        let val = newObj.firmwareConf;
        if (arrStr.indexOf(key) > -1) {
          if (isPost) {
            val[key] = val[key] == true ? 0 : 1;
          } else {
            val[key] = val[key] == 0 ? true : false;
          }
        }
      }
      return newObj;
    },
    changeMidValue(val, isChange) {
      let arr = [];
      for (let key of this.cidOptions) {
        let parentId = key.dictLabel.slice(0, 1);
        if (parentId == Number(val)) {
          let obj = Object.assign({}, key);
          obj.dictLabel = key.dictLabel.slice(2);
          arr.push({
            dictValue: obj.dictValue,
            dictLabel: obj.dictLabel,
          });
        }
      }

      this.splitCidOptions = Object.assign({}, arr);
      if (isChange == undefined) {
        this.formUpload.firmwareConf.cid = "";
      }
    },
    handleApprove(state) {
      if (state === 3 && !this.form.remark) {
        return this.msgError("请填写拒绝审核原因！");
      }
      pucsState(Object.assign({ state }, this.form)).then((res) => {
        let { code } = res;
        if (code == 200) {
          this.dialogVisible = false;
          this.msgSuccess("操作成功！");
          this.$parent.getList();
        }
      });
    },
  },
};
</script>
<style lang="scss">
.disabled-click {
  //   position: relative;

  //   &::after {
  //     cursor: no-drop;
  //     content: "";
  //     position: absolute;
  //     top: 0;
  //     left: 0;
  //     width: 100%;
  //     height: 100%;
  //     z-index: 10;
  //   }
}
</style>
