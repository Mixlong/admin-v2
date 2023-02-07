<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    :width="boleConfig ? '980px' : '780px'"
    append-to-body
    :top="boleConfig ? '5vh' : '15vh'"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="130px"
      class="form-data form-data-inline"
      :class="{ 'inline-form': boleConfig }"
      inline
    >
      <el-form-item label="品类" prop="categoryId">
        <el-select
          :disabled="form.id ? true : false"
          v-model="form.categoryId"
          clearable
          @change="changeCategory2"
          size="small"
          style="width: 185px"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="型号" prop="computerId">
        <el-select
          :disabled="form.id ? true : false"
          v-model="form.computerId"
          clearable
          size="small"
          style="width: 185px"
          @change="$forceUpdate()"
        >
          <el-option
            v-for="dict in computerFormOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.model"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="属性" prop="type">
        <el-select
          v-model="form.type"
          clearable
          size="small"
          style="width: 185px"
          disabled
          @change="$forceUpdate()"
        >
          <el-option
            v-for="dict in fileTypeList"
            :key="dict.key"
            :label="dict.value"
            :value="dict.key"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="属性描述" prop="content">
        <el-input
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 8 }"
          v-model="form.content"
          placeholder="请输入文件描述"
        />
      </el-form-item>

      <el-form-item
        label="文件"
        prop="url"
        v-if="form.up == 1"
        style="width: 100%"
      >
        <DrUpload :limit="1" v-model="form.url" :css="{ width: '100%' }" :isOnePic="1">
          <div>
            <el-button size="small" type="primary">点击上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>

      <!-- 新增字段 -->
      <template v-if="boleConfig">
        <el-form-item label="烧录的文件名">
          <el-input
            style="width: 100%"
            v-model="form.firmwareConf.name"
            placeholder="请输入烧录的文件名"
          />
        </el-form-item>
        <el-form-item label=" 厂商">
          <el-select
            v-model.number="form.firmwareConf.mid"
            size="small"
            style="width: 100%"
            @change="changeMidValue"
          >
            <el-option
              v-for="dict in midOptions"
              :key="dict.key"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="芯片系列">
          <el-select
            v-model.number="form.firmwareConf.cid"
            size="small"
            style="width: 185px"
            @change="changeCidValue"
          >
            <el-option
              v-for="(dict, index) in splitCidOptions"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="地址位置">
          <el-input
            type="number"
            style="width: 100%"
            v-model="form.firmwareConf.addr"
            placeholder="请输入烧录到芯片中的首地址位置 "
          />
        </el-form-item>
        <el-form-item label="烧录方式">
          <el-select
            v-model.number="form.firmwareConf.type"
            size="small"
            style="width: 100%"
          >
            <el-option
              v-for="(dict, index) in typeOptions"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="烧录电压选择">
          <el-select v-model.number="form.firmwareConf.voltage" size="small">
            <el-option
              v-for="(dict, index) in voltageOptions"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="可烧录次数">
          <el-input
            type="number"
            v-model="form.firmwareConf.bs"
            placeholder="请输入表示可烧录次数"
          />
        </el-form-item>
        <el-form-item label="否上电自动烧录">
          <el-radio-group v-model="form.firmwareConf.auto" size="small">
            <el-radio-button :label="0">自动烧录</el-radio-button>
            <el-radio-button :label="1">不自动烧录</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="计算余剩可烧录次">
          <el-radio-group v-model="form.firmwareConf.burnOnOff" size="small">
            <el-radio-button :label="0"> 计算</el-radio-button>
            <el-radio-button :label="1">不计算 </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否校验">
          <el-radio-group v-model="form.firmwareConf.check" size="small">
            <el-radio-button :label="0"> 校验</el-radio-button>
            <el-radio-button :label="1">不校验 </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="擦除配置">
          <el-radio-group v-model="form.firmwareConf.erase" size="small">
            <el-radio-button :label="0"> 擦除全片</el-radio-button>
            <el-radio-button :label="1">擦除烧写部分</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="擦除配置">
          <el-radio-group v-model="form.firmwareConf.protect" size="small">
            <el-radio-button :label="0"> 烧录后打开读写保护</el-radio-button>
            <el-radio-button :label="1">录后不打开读写保护 </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="烧录完成重启程序">
          <el-radio-group v-model="form.firmwareConf.reset" size="small">
            <el-radio-button :label="0"> 重启运行</el-radio-button>
            <el-radio-button :label="1">不重启运行 </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label=" 烧录速度">
          <el-radio-group v-model="form.firmwareConf.speed" size="small">
            <el-radio-button :label="0"> 高速</el-radio-button>
            <el-radio-button :label="1">低速 </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </template>
      <el-form-item label="批量同步"  >
        <el-select
          ref="select"
          v-model="form.idList"
          multiple
          placeholder=""
          class="similar-style"
          style="width:100%"
        >
          <el-option
            :disabled="disabledName == dict.computer"
            v-for="dict in similarList"
            :key="dict.id"
            :label="dict.computer"
            :value="dict.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  addFileConfig,
  editFileConfig,
  computerDictList,
} from "@/api/third/fileConfig";
export default {
  props: ["dictList"],
  data() {
    let validateUpload = (rule, value, callback) => {
      if (this.form.up === 0) {
        callback();
      } else {
        if (this.form.url) {
          callback();
        } else {
          callback(new Error("请上传文件"));
        }
      }
    };
    return {
      boleConfig: false,
      dialogVisible: false,
      fileTypeList: [],
      computerFormOptions: [],
      similarList: [],
      // 表单参数
      form: {
        url: "",
      },
      title: "",
      // 表单校验
      rules: {
        computerModel: [
          { required: true, message: "所属仪表不能为空", trigger: "blur" },
        ],
        type: [
          { required: true, message: "文件类型不能为空", trigger: "blur" },
        ],
        url: [{ required: true, validator: validateUpload, trigger: "blur" }],
      },
      cidOptions: [],
      splitCidOptions: [],
      typeOptions: [],
      voltageOptions: [],
      midOptions: [],
      disabledName: "",
    };
  },
  watch: {
    form(val) {
      if (val) {
        computerDictList({
          categoryId: val.categoryId,
          type: val.type,
        }).then((res) => {
          let { computerFormOptions } = this;
          this.disabledName = "";
          for (let key of computerFormOptions) {
            if (key.model == this.form.computerId) {
              this.disabledName = key.name;
            }
          }
    
          this.similarList = res.data;
        });
      }
    },
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
    // 表单重置
    reset() {
      this.form = {
        url: "",
      };
      this.resetForm("form");
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
        this.form.firmwareConf.cid = "";
      }
    },
    changeCidValue(val) {
      this.$forceUpdate();
    },
    changeCategory2(val) {
      this.form.computerId = "";
      return new Promise((resove) => {
        this.computerFormOptions = this.dictList.filter(
          (item) => item.id === val
        )[0].computerList;
        resove(this.computerFormOptions);
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.status = 0;
          // if (this.form.firmwareConf.mid) {
          //   this.form.firmwareConf.mid = Number(this.form.firmwareConf.mid);
          // }
          // console.log(this.form);
          // if (this.form.firmwareConf.cid) {
          //   this.form.firmwareConf.cid = Number(this.form.firmwareConf.cid);
          // }
          // if (this.form.firmwareConf.type) {
          //   this.form.firmwareConf.type = Number(this.form.firmwareConf.type);
          // }
          if (this.form.id) {
            delete this.form.createTime;
            delete this.form.updateTime;
            delete this.form.updateBy;
            delete this.form.updateTime;
            editFileConfig(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            addFileConfig(this.form).then((response) => {
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
.style-upload {
  .el-upload-dragger {
    width: 100%;
  }
}
.similar-style {
  .el-select__tags {
    cursor: pointer;
    &::after {
      font-family: "element-icons" !important;
      speak: none;
      font-style: normal;
      font-weight: normal;
      font-variant: normal;
      text-transform: none;
      line-height: 1;
      vertical-align: baseline;
      content: "\e7a0";
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      background: #0098f7;
      margin-left: 6px;
      width: 50px;
      color: #fff;
      border-radius: 4px;
    }
  }
  .el-input__suffix {
    display: none;
  }
}
</style>

