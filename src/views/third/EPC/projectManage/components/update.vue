<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    width="700px"
    append-to-body
    top="15vh"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px" inline>
      <template v-if="typeName !== 'content'">
        <el-form-item label="品类" prop="categoryId">
          <el-select
            :disabled="!!form.id"
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
        <el-form-item label="产品型号">
          <el-input
            v-model.trim="form.versionName"
            :disabled="!!form.id"
          ></el-input>
        </el-form-item>
        <el-form-item label="属性" prop="type">
          <el-select
            v-model="form.type"
            clearable
            size="small"
            style="width: 185px"
            :disabled="!!form.id"
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
      </template>
      <el-form-item label="属性描述" prop="content">
        <tinymce
          v-if="dialogVisible"
          v-model="form.content"
          placeholder="请输入属性描述"
          height="350"
        ></tinymce>
      </el-form-item>
      <el-form-item
        label="文件"
        prop="url"
        v-if="form.up == 1 && typeName !== 'content'"
        style="width: 100%"
      >
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
} from "@/api/third/epc/versionManage";
import tinymce from "@/views/components/Editor";
export default {
  props: ["dictList"],
  components: { tinymce },
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
      dialogVisible: false,
      fileTypeList: [],
      computerFormOptions: [],
      similarList: [],
      typeName: "",
      // 表单参数
      form: {
        url: "",
        content: "",
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
        content: "",
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

