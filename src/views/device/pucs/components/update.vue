<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    :width="type == 4 ? '950px' : '25%'"
    top="25vh"
    append-to-body
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      :label-width="type == 4 ? '125px' : '100px'"
      @submit.native.prevent
    >
      <el-form-item label="PUCS名称:" prop="name" v-if="type == 3">
        <el-input v-model="form.name" placeholder="请输入PUCS名称"> </el-input>
      </el-form-item>
      <el-form-item label="工厂名称:" prop="factoryId" v-if="type == 1">
        <el-select v-model="form.factoryId" placeholder="请选择">
          <el-option
            v-for="item in factoryOptions"
            :key="item.value"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="产品品类:"
        :prop="type === 2 ? 'dutCode' : ''"
        v-if="type == 2"
      >
        <el-select
          v-model="form.dutCode"
          clearable
          @change="changeCategory"
          placeholder="请选择产品品类"
          style="width: 100%"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="产品型号:"
        :prop="form.dutCode ? 'computerId' : ''"
        v-if="type == 2"
      >
        <el-select
          v-model="form.computerId"
          clearable
          placeholder="请选择产品型号"
          style="width: 100%"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.model"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="方案版本:"
        :prop="form.dutCode ? 'schemeVersion' : ''"
        v-if="type == 2"
      >
        <el-select
          v-model="form.schemeVersion"
          clearable
          placeholder="请输入方案版本"
          @change="changeDut"
          style="width: 100%"
        >
          <el-option
            v-for="item in pucsVersionData"
            :key="item.dictCode"
            :label="item.dictLabel"
            :value="item.dictCode + ''"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="生产工序:"
        :prop="form.dutCode && type === 2 ? 'processId' : ''"
        v-if="type === 2"
      >
        <el-select
          clearable
          v-model="form.processId"
          placeholder="请选择生产工序"
          @change="changeProcessId"
          style="width: 100%"
        >
          <el-option
            v-for="item in processOptions"
            :key="item.value"
            :label="item.dictLabel"
            :value="item.dictCode"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <div v-if="type == 4" class="col-12-cust">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="测试脚本:"
              prop="testJsFileName"
              style="width: 100%"
            >
              <el-input
                style="position: relative; z-index: 10"
                v-model="formUpload.testJsFileName"
                placeholder="请输入文件名"
              >
                <el-button
                  type="primary"
                  slot="append"
                  icon="el-icon-upload"
                  @click="openFile(1)"
                ></el-button>
              </el-input>
              <DrUpload
                :css="{ position: 'relative', top: '5px' }"
                :limit="1"
                v-model="formUpload.testJs"
                @uploadSuccess="testJsUploadSuccess"
                ref="testJsUpload"
              >
              </DrUpload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="烧录文件:"
              prop="processId"
              style="width: 100%"
            >
              <el-input
                style="position: relative; z-index: 10"
                v-model="formUpload.firmwareConf.name"
                placeholder="请输入文件名"
              >
                <el-button
                  slot="append"
                  icon="el-icon-upload"
                  @click="openFile(2)"
                ></el-button>
              </el-input>
              <DrUpload
                :css="{ position: 'relative', top: '5px' }"
                :limit="1"
                v-model="formUpload.firmware"
                @uploadSuccess="firmwareUploadSuccess"
                ref="firmwareUpload"
              >
              </DrUpload> </el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="类型">
              <el-select v-model.number="formUpload.firmwareConf.type">
                <el-option
                  v-for="(dict, index) in typeOptions"
                  :key="index"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="8">
            <el-form-item label="厂商">
              <el-select
                v-model.number="formUpload.firmwareConf.mid"
                style="width: 100%"
                @change="changeMidValue"
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
            <el-form-item label="系列">
              <el-select
                v-model.number="formUpload.firmwareConf.cid"
                @change="$forceUpdate()"
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
                placeholder="固件目标烧录地址 "
              >
                <template slot="prepend">0x</template>
              </el-input>
            </el-form-item></el-col
          >

          <el-col :span="8">
            <el-form-item label="输出电压 ">
              <el-select v-model.number="formUpload.firmwareConf.voltage">
                <el-option
                  v-for="(dict, index) in voltageOptions"
                  :key="index"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="8">
            <el-form-item label="烧录次数">
              <el-input
                type="number"
                v-model="formUpload.firmwareConf.bs"
                placeholder="0为不限制次数"
              /> </el-form-item
          ></el-col>
          <el-col :span="8">
            <el-form-item label="擦除方式">
              <el-select v-model.number="formUpload.firmwareConf.erase">
                <el-option label="整片擦除" :value="0" />
                <el-option label="扇区擦除" :value="1" />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="8">
            <el-form-item label="烧录速度">
              <el-select v-model.number="formUpload.firmwareConf.speed">
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
                >计算剩余烧录</el-checkbox
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
                >校验数据</el-checkbox
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
            placeholder="请输入说明"
            v-model="formUpload.remark"
          ></el-input>
        </el-form-item>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updatePucs, pucsLoad, pucsLoadInfo } from "@/api/pucs";
import { categoryComputerDict } from "@/api/third/fileConfig";

export default {
  props: [
    "dutOptions",
    "processOptions",
    "factoryOptions",
    "title",
    "type",
    "typeDictList",
    "listComputerData",
    "pucsVersionData",
  ],
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
      dictList: [],
      computerOptions: [],
      // 表单参数
      form: {},
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
          { required: true, message: "请选择产品品类", trigger: "change" },
        ],
        computerId: [
          { required: true, message: "请选择产品型号", trigger: "change" },
        ],
        schemeVersion: [
          { required: true, message: "请选择方案版本", trigger: "change" },
        ],
      },
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        if (this.type == 4) {
          this.getInfo();
        }
      }
    },
    "form.dutCode"(val) {
      if (val) {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === val
        )[0].computerList;
      }
    },
  },
  mounted() {
    categoryComputerDict().then((response) => {
      this.dictList = response.data;
    });
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
    reset() {
      this.form = {};
      this.resetForm("form");
    },
    changeCategory(val) {
      this.form.computerId = "";
      this.computerOptions = [];
      if (val) {
        return new Promise((resove) => {
          this.computerOptions = this.dictList.filter(
            (item) => item.id === val
          )[0].computerList;
          resove();
        });
      }
    },
    getInfo() {
      return new Promise((resolve) => {
        pucsLoadInfo(this.form.id).then((res) => {
          this.formUpload = this.resetBooleForm(res.data);
          if (this.formUpload.firmwareConf.mid) {
            this.changeMidValue(this.formUpload.firmwareConf.mid, false);
          }
        });
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form);
          if (params.dutCode) {
            if (!this.form.processId) {
              return this.msgError("请选择生产工序");
            }
          }
          if (params.processId) {
            if (!this.form.dutCode) {
              return this.msgError("请选择在测dut");
            }
          }
          if (this.type == 4) {
            if (JSON.stringify(this.formUpload) === "{}") {
              return this.msgError("上传文件不能为空");
            }
            let rt = true;
            for (let key in this.formUpload.firmwareConf) {
              if (this.formUpload.firmwareConf[key]) {
                rt = false;
              }
            }
            if (rt && !this.formUpload.firmware && !this.formUpload.testJs) {
              return;
            }
            let params = this.resetBooleForm(this.formUpload, true);
            pucsLoad(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("更新成功");
                this.$parent.getList();
                this.dialogVisible = false;
              }
            });
          } else {
            updatePucs(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("更新成功");
                this.$parent.getList();
                this.dialogVisible = false;
              }
            });
          }
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
    resetBooleForm(obj, isPost) {
      let arrStr = ["reset", "protect", "check", "burnOnOff", "auto"];
      let newObj = Object.assign({}, obj);
      for (let key in newObj.firmwareConf) {
        let val = newObj.firmwareConf;
        if (arrStr.indexOf(key) > -1) {
          if (isPost) {
            //读写保护1是✅ ，0是取消
            if (key == "protect") {
              val[key] = val[key] == true ? 1 : 0;
            } else {
              val[key] = val[key] == true ? 0 : 1;
            }
          } else {
            //读写保护1是✅ ，0是取消
            if (key == "protect") {
              val[key] = val[key] == 1 ? true : false;
            } else {
              val[key] = val[key] == 0 ? true : false;
            }
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
    openFile(type) {
      if (type == 1) {
        this.$refs["testJsUpload"].clickInput();
      } else {
        if (type == 2) {
          this.$refs["firmwareUpload"].clickInput();
        }
      }
    },
    firmwareUploadSuccess(response, file) {
      this.formUpload.firmwareConf.name = file.name;
    },
    testJsUploadSuccess(response, file) {
      this.formUpload.testJsFileName = file.name;
    },
  },
};
</script>
<style lang="scss"></style>
