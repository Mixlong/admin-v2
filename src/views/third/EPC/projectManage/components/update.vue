<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    append-to-body
    width="700px"
    top="15vh"
    center
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="110px" inline>
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
        <el-form-item
          v-if="form.type === 'sop'"
          label="关联SOP"
          prop="versionCode"
        >
          <select-loadMore
            v-model="form.versionCode"
            style="width: 100%"
            :data="sopData.data"
            :page="sopData.page"
            :hasMore="sopData.more"
            dictLabel="versionCode"
            :moreParams="true"
            :request="getSopList"
            @getChange="getSopId"
            placeholder="请选择SOP"
          >
          </select-loadMore>
        </el-form-item>
      </template>
      <el-form-item label="属性描述" prop="content">
        <div id="desc_box">
          <tinymce
            v-if="dialogVisible"
            v-model="form.content"
            placeholder="请输入属性描述"
            height="250"
          />
          <a id="download" href="" style="display: none"></a>
        </div>
      </el-form-item>
      <template v-if="form.content">
        <div class="flex justify-around">
          <el-form-item label="属性描述图片" prop="fileUrl" style="width: 100%">
            <DrUpload
              :limit="1"
              v-model="form.fileUrl"
              :css="{ width: '100%' }"
              :isOnePic="1"
            >
              <el-button size="mini" type="primary">上传</el-button>
            </DrUpload>
          </el-form-item>
        </div>
      </template>

      <el-form-item
        label="文件"
        prop="url"
        v-if="
          form.up == 1 &&
          typeName !== 'content' &&
          form.type !== 'sop' &&
          form.type !== 'waterproof_test'
        "
        :rules="[{ required: true, message: '请上传文件', trigger: 'change' }]"
        style="width: 100%"
      >
        <DrUpload
          :limit="1"
          v-model="form.url"
          :css="{ width: '100%' }"
          :isOnePic="1"
        >
          <div>
            <el-button size="small" type="primary">上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>

      <el-form-item
        label="气密性配置"
        prop="url"
        v-if="
          form.up == 1 &&
          typeName !== 'content' &&
          form.type === 'waterproof_test'
        "
        :rules="[
          { required: true, message: '请选择气密性配置项', trigger: 'change' },
        ]"
        style="width: 100%"
      >
        <select-loadMore
          v-model="form.url"
          :data="gasData.data"
          :page="gasData.page"
          :hasMore="gasData.more"
          :moreParams="true"
          dictLabel="remark"
          :request="getGasConfigList"
          @getChange="getGasConfigJson"
          placeholder="请选择"
        >
        </select-loadMore>
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
import { sopList } from "@/api/third/testApi";
import { gasConfigList } from "@/api/third/testApi";
import tinymce from "@/views/components/Editor";

export default {
  props: ["dictList"],
  components: { tinymce },
  data() {
    return {
      isImgLoading: false,
      dialogVisible: false,
      fileTypeList: [],
      computerFormOptions: [],
      similarList: [],
      typeName: "",
      // 表单参数
      form: {
        url: "",
        content: "",
        tightnessJson: "",
        configId: "",
      },
      sopData: {
        data: [],
        page: 1,
        more: true,
      },
      // 客户数据
      gasData: {
        data: [],
        page: 1,
        more: true,
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
        versionCode: [
          { required: true, message: "请选择SOP", trigger: "change" },
        ],
        fileUrl: [
          { required: true, message: "请上传属性描述图片", trigger: "change" },
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
    "form.url"(url) {
      if (url) {
        this.clearValidateItem("form", "url");
      }
    },
    "form.fileUrl"(url) {
      if (url) {
        this.clearValidateItem("form", "fileUrl");
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
        tightnessJson: "",
        configId: "",
      };
      this.gasData.data = [];
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
      C;
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
    getSopList({ page = 1, more = false, keyword = "" } = {}) {
      const { categoryId } = this.form;
      return new Promise((resolve) => {
        sopList({
          p: page,
          versionCode: keyword,
          state: 1,
          categoryId,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.sopData.data = [...this.sopData.data, ...list];
          } else {
            this.sopData.data = list;
          }
          this.sopData.more = pageNum * pageSize < total;
          this.sopData.page = pageNum;
          resolve();
        });
      });
    },
    getSopId(info) {
      if (!info) {
        this.form.sopId = "";
        return;
      }
      const { id } = JSON.parse(info);
      this.form.sopId = id;
    },
    getGasConfigList({ page = 1, more = false, keyword = "" } = {}) {
      const { categoryId } = this.form;

      return new Promise((resolve) => {
        gasConfigList({
          p: page,
          categoryId: categoryId,
          status: 0,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.gasData.data = [...this.gasData.data, ...list];
          } else {
            this.gasData.data = list;
          }
          this.gasData.more = pageNum * pageSize < total;
          this.gasData.page = pageNum;
          resolve();
        });
      });
    },
    getGasConfigJson(info) {
      if (!info) {
        this.form.url = "";
        this.form.tightnessJson = "";
        this.form.configId = "";
        return;
      }
      const { remark, json, id } = JSON.parse(info);
      this.form.url = remark;
      this.form.tightnessJson = json;
      this.form.configId = id;
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
