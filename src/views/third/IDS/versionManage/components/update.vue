<template>
  <!-- 硬件数据 -->
  <el-dialog
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    :width="isDigWidth"
    append-to-body
    top="15vh"
    center
  >
    <el-form ref="form" :model="form" :rules="rules" label-position="top">
      <template v-if="!isBatchSync">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品类" prop="categoryId">
              <el-select
                :disabled="!!form.id"
                v-model="form.categoryId"
                clearable
                @change="changeCategory2"
                class="w100"
              >
                <el-option
                  v-for="dict in dictList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号">
              <el-input
                v-model.trim="form.versionName"
                :disabled="!!form.id"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="属性" prop="type">
              <el-select
                v-model="form.type"
                clearable
                :disabled="!!form.id"
                @change="$forceUpdate()"
                class="w100"
              >
                <el-option
                  v-for="dict in fileTypeList"
                  :key="dict.key"
                  :label="dict.value"
                  :value="dict.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="属性描述" prop="content">
              <el-input
                v-model="form.content"
                clearable
                placeholder="请输入文件描述"
              />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item v-if="form.up == 1" label="文件" prop="url">
              <DrUpload
                :limit="1"
                v-model="form.url"
                :css="{ width: '100%' }"
                :isOnePic="1"
              >
                <div>
                  <el-button size="small" type="primary">点击上传</el-button>
                </div>
              </DrUpload>
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <!-- 批量同步 -->
      <el-form-item
        label="版本号"
        v-if="isBatchSync"
        style="width: 100%"
        label-width="100px"
        :required="isHaveBatchSync"
        prop="idList"
      >
        <el-select
          ref="select"
          v-model="form.idList"
          multiple
          placeholder=""
          class="similar-style"
          style="width: 100%"
        >
          <el-option
            :disabled="form.versionName === dict.computer"
            v-for="dict in computerOptions"
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
  editFileConfigConfig,
  fileVersionConfigDirt,
} from "@/api/third/ids/versionManage";

export default {
  props: ["dictList"],
  data() {
    const validateIdList = (rule, value, callback) => {
      if (!value.length && this.isHaveBatchSync) {
        return callback(new Error("版本号不能为空"));
      } else {
        callback();
      }
    };
    return {
      // 批量同步
      isBatchSync: false,
      dialogVisible: false,
      fileTypeList: [],
      computerFormOptions: [],
      similarList: [],
      // 版本号列表
      computerOptions: [],
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
        url: [{ required: true, message: "请上传文件", trigger: "change" }],
        idList: [
          { type: "array", validator: validateIdList, trigger: "change" },
        ],
      },
      cidOptions: [],
      splitCidOptions: [],
      typeOptions: [],
      voltageOptions: [],
      midOptions: [],
      disabledName: "",
    };
  },
  computed: {
    isHaveBatchSync() {
      return this.isBatchSync;
    },
    isDigWidth() {
      return this.isBatchSync ? "450px" : "680px";
    },
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
        if (this.isBatchSync) {
          this.getComputerNameList(val.categoryId, val.type);
        }
      }
    },
    "form.url"(url) {
      if (url) {
        this.clearValidateItem("form", "url");
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
    // 版本号列表
    getComputerNameList(categoryId, type) {
      fileVersionConfigDirt({
        categoryId,
        type,
      }).then((res) => {
        console.log(res);
        this.computerOptions = res.data;
      });
    },
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
          if (this.form.id) {
            delete this.form.createTime;
            delete this.form.updateTime;
            delete this.form.updateBy;
            delete this.form.updateTime;
            let fn = this.isBatchSync ? editFileConfigConfig : editFileConfig;
            fn(this.form).then((res) => {
              if (res.code === 200) {
                const title = this.isBatchSync ? "批量同步成功" : "修改成功";
                this.msgSuccess(title);
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            addFileConfig(this.form).then((res) => {
              if (res.code === 200) {
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
