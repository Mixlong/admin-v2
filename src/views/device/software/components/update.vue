<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="710px"
    append-to-body
    top="13vh"
    :close-on-click-modal="false"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="95px"
      @submit.native.prevent
      class="form-data-inline"
      inline
    >
      <el-form-item label="装备类型:" prop="name">
        <select-loadMore
          v-model="form.name"
          style="width: 100%"
          :data="equipmentData.data"
          :page="equipmentData.page"
          :hasMore="equipmentData.more"
          dictLabel="name"
          :moreParams="true"
          :disabled="!!form.id"
          :request="getEquipmentList"
          :clearFn="clearCode"
          @getChange="getEqupmentInfo"
          placeholder="请选择装备类型"
        />
      </el-form-item>
      <el-form-item label="装备型号:" prop="code">
        <el-input v-model="form.code" readonly />
      </el-form-item>
      <el-form-item label="系列名称:" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择系列名称"
          filterable
          clearable
          style="width: 100%"
          @change="form.module = ''"
        >
          <el-option
            v-for="(item, index) in dictOptions"
            :key="index"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="模块名称:" prop="module">
        <el-select
          v-model="form.module"
          placeholder="请选择模块名称"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="(item, index) in moduleOptions"
            :key="index"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="覆盖条件:" prop="updateCondition">
        <el-select
          v-model="form.updateCondition"
          placeholder="请选择覆盖条件"
          filterable
          clearable
          style="width: 100%"
          @change="changeTargetIdType"
        >
          <el-option
            v-for="item in conditionOptions"
            :key="item.value"
            :label="item.dictValue"
            :value="+item.dictLabel"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="工厂名称:"
        prop="targetId"
        v-if="form.updateCondition == 3"
      >
        <el-select
          v-model="form.targetId"
          placeholder="请选择工厂名称"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in factoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="在测试DUT:"
        prop="targetId"
        v-if="form.updateCondition == 4"
      >
        <el-select
          v-model="form.targetId"
          placeholder="请选择在测试DUT"
          filterable
          clearable
          multiple
          style="width: 100%"
        >
          <el-option
            v-for="item in computerOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="PUCS_ID:"
        prop="targetId"
        v-if="form.updateCondition == 2"
      >
        <el-select
          v-model="form.targetId"
          placeholder="请选择PUCS项"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in pucsOptions"
            :key="item.dictValue"
            :label="item.dictCpu"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="版本号:" prop="versionName">
        <el-input
          v-model="form.versionName"
          placeholder="请输入版本号"
          clearable
        >
        </el-input>
      </el-form-item>
      <el-form-item label="版本序号:" prop="versionCode">
        <el-input
          v-model="form.versionCode"
          placeholder="请输入版本序号"
          clearable
        >
        </el-input>
      </el-form-item>
      <el-form-item label="版本描叙:" prop="explains" class="form-textarea">
        <el-input
          v-model="form.explains"
          type="textarea"
          :rows="4"
          placeholder="请输入版本描叙"
        >
        </el-input>
      </el-form-item>

      <el-form-item label="文件上传:" prop="fileUrl">
        <DrUpload
          v-model="form.fileUrl"
          :limit="1"
          :isOnePic="1"
          class="flex-direction align-start"
        >
          <div class="text-left">
            <el-button type="primary" size="small">
              上传
              <i class="el-icon-upload el-icon--right"></i>
            </el-button>
          </div>
        </DrUpload>
      </el-form-item>

      <el-form-item label="强制更新:" prop="forceUpdate">
        <el-radio-group v-model="form.forceUpdate" size="small">
          <el-radio-button :label="1" border>是</el-radio-button>
          <el-radio-button :label="0" border>否</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { categoryComputerDict } from "@/api/third/fileConfig";
import { listType } from "@/api/pucs/type";
import {
  addSoft,
  updateSoft,
  typeDictList,
  moduleDictList,
} from "@/api/pucs/soft";
import { dictFactory } from "@/api/factory";
import { pucsDict } from "@/api/pucs";

export default {
  props: ["title", "conditionOptions"],
  data() {
    return {
      dictOptions: [], // 类型字典
      moduleOptions: [], // 模块字典
      dialogVisible: false,
      factoryOptions: [],
      computerOptions: [],
      pucsOptions: [],
      // 是否显示弹出层

      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      // 表单参数
      form: {
        fileUrl: "",
        type: "",
        module: "",
      },
      equipmentData: {
        data: [],
        page: 1,
        more: true,
      },
      // 表单校验
      rules: {
        name: [
          {
            required: true,
            message: "请选择装备类型",
            trigger: "change",
          },
        ],
        code: [
          {
            required: true,
            message: "装备型号不能为空",
            trigger: "change",
          },
        ],
        type: [
          {
            required: true,
            message: "请选择系列名称",
            trigger: "change",
          },
        ],
        module: [
          {
            required: true,
            message: "请选择模块名称",
            trigger: "change",
          },
        ],
        // targetId: [{ required: true, message: "请选择", trigger: "change" }],
        updateCondition: [
          {
            required: true,
            message: "请选择覆盖条件",
            trigger: "change",
          },
        ],
        versionName: [
          {
            required: true,
            message: "请输入版本号",
            trigger: "change",
          },
        ],
        versionCode: [
          {
            required: true,
            message: "请输入版本序号",
            trigger: "change",
          },
        ],
        fileUrl: [
          {
            required: true,
            message: "请上传文件",
            trigger: "change",
          },
        ],
        forceUpdate: [
          {
            required: true,
            message: "是否强制更新",
            trigger: "change",
          },
        ],
      },
    };
  },
  watch: {
    "form.type"(newVal) {
      if (newVal) {
        this.getModuleDictList();
      }
    },
    "form.fileUrl"(fileUrl) {
      if (fileUrl) {
        this.clearValidateItem("form", "fileUrl");
      }
    },
  },
  mounted() {
    this.getOptions();
    this.getTypeDictList();
    pucsDict().then((res) => {
      this.pucsOptions = res.data;
    });
  },
  methods: {
    // 类型字典
    getTypeDictList() {
      typeDictList().then((res) => {
        this.dictOptions = res.data;
      });
    },
    // 模块字典
    getModuleDictList() {
      moduleDictList({
        type: this.form.type,
      }).then((res) => {
        this.moduleOptions = res.data;
      });
    },
    /** 查询下拉*/
    getOptions() {
      dictFactory().then((response) => {
        this.factoryOptions = response.data;
      });
      categoryComputerDict().then((response) => {
        this.computerOptions = response.data;
      });
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
        fileUrl: "",
        forceUpdate: 1,
        module: "",
      };
      this.resetForm("form");
    },
    changeTargetIdType(val) {
      this.form.targetId = this.form.updateCondition == 4 ? [] : "";
      this.form = Object.assign({}, this.form);
    },

    /** 产品测试数据 */
    getEquipmentList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        listType({
          p: page,
          code: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.equipmentData.data = [...this.equipmentData.data, ...list];
          } else {
            this.equipmentData.data = list;
          }
          this.equipmentData.more = pageNum * pageSize < total;
          this.equipmentData.page = pageNum;
          resolve();
        });
      });
    },
    getEqupmentInfo(info) {
      if (!info) {
        this.form.orderId = "";
        return;
      }
      const { code } = JSON.parse(info);
      this.form.code = code;
    },
    clearCode() {
      this.form.code = "";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form);
          if (params.updateCondition == 4) {
            params.targetId = params.targetId.toString();
          }
          if (this.form.id) {
            updateSoft(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("更新成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            addSoft(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
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

<style lang="scss">
.style-upload {
  .el-upload-dragger {
    width: 100%;
  }
}
</style>
