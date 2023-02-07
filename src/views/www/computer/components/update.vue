<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="750px"
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
      class="form-data-inline demo-tag"
      inline
    >
      <el-form-item label="仪表名称:" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入仪表名称"
          style="width: 100%"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="分类:" prop="dirId">
        <el-select
          v-model="form.dirId"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            v-for="item in classOptions"
            :key="item.value"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="排序:" prop="sort">
        <el-input
          v-model="form.sort"
          type="number"
          placeholder="请输入仪表名称"
          style="width: 245px"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="描述:" prop="description">
        <el-input
          type="textarea"
          v-model.trim="form.description"
          placeholder="请输入描述内容"
          style="width: 245px"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="英文描述:" prop="enDescription">
        <el-input
          type="textarea"
          v-model.trim="form.enDescription "
          placeholder="请输入英文描述内容"
          style="width: 245px"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="是否首页:" prop="isHome">
        <el-switch
          v-model="form.isHome"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"
          >
        </el-switch>
      </el-form-item>
      <el-form-item label="首页封面:" prop="homeCover">
        <DrUpload
          :limit="1"
          :isOnePic="1"
          v-model="form.homeCover"
          :showFileList="false"
          accept="image/jpeg, image/gif, image/png,image/bmp"
        >
          <div class="text-left" v-if="!form.homeCover">
            <el-button size="small" type="primary">点击上传</el-button>
          </div>
          <div v-else>
            <el-image
              :src="form.homeCover"
              style="width: 80px; height: 80px"
              fit="cover"
            ></el-image>
          </div>
        </DrUpload>
      </el-form-item>
      <el-form-item label="封面:" prop="cover">
        <DrUpload
          :limit="1"
          :isOnePic="1"
          v-model="form.cover"
          :showFileList="false"
          accept="image/jpeg, image/gif, image/png,image/bmp"
        >
          <div class="text-left" v-if="!form.cover">
            <el-button size="small" type="primary">点击上传</el-button>
          </div>
          <div v-else>
            <el-image
              :src="form.cover"
              style="width: 80px; height: 80px"
              fit="cover"
            ></el-image>
          </div>
        </DrUpload>
      </el-form-item>
      <el-form-item label="详情图:" prop="detailCover" style="width: 100%">
        <DrUpload
          v-model="form.detailCover"
          accept="image/jpeg, image/gif, image/png,image/bmp"
        >
        </DrUpload>
      </el-form-item>

      <el-form-item label="中文规格:" prop=" " style="width: 100%">
        <div>
          <el-tag
            effect="plain"
            v-for="(item, index) in zhSpecArr"
            :key="index"
            class="margin-bottom-xs margin-left-xs pointer"
            closable
            @close="handleClose(zhSpecArr, index)"
            @click="editItem(item, 'zhSpecArr', index)"
            >{{ item.key }}</el-tag
          >
          <el-button
            class="font20 margin-left-xs"
            type="text"
            icon="el-icon-circle-plus"
            @click="addInput('zhSpecArr')"
          ></el-button>
        </div>
      </el-form-item>
      <el-form-item
        label=" "
        style="width: 98%"
        v-if="temporary.name == 'zhSpecArr'"
      >
        <el-card shadow="never" style="width: 100%">
          <el-row :gutter="18">
            <el-col :span="8">
              <el-input type="text" v-model="entryObj.key" />
            </el-col>
            <el-col :span="13">
              <el-input type="text" v-model="entryObj.value" />
            </el-col>
            <el-col :span="2">
              <el-button type="text" @click="saveInput">保存</el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-form-item>
      <el-form-item label="英文规格:" prop=" " style="width: 100%">
        <div>
          <el-tag
            effect="plain"
            v-for="(item, index) in enSpecArr"
            :key="index"
            closable
            @close="handleClose(enSpecArr, index)"
            class="margin-bottom-xs margin-left-xs pointer"
            @click="editItem(item, 'enSpecArr', index)"
            >{{ item.key }}</el-tag
          >
          <el-button
            class="font20 margin-left-xs"
            type="text"
            icon="el-icon-circle-plus"
            @click="addInput('enSpecArr')"
          ></el-button>
        </div>
      </el-form-item>
      <el-form-item
        label=" "
        style="width: 98%"
        v-if="temporary.name == 'enSpecArr'"
      >
        <el-card shadow="never" style="width: 100%">
          <el-row :gutter="18">
            <el-col :span="8">
              <el-input type="text" v-model="entryObj.key" />
            </el-col>
            <el-col :span="13">
              <el-input type="text" v-model="entryObj.value" />
            </el-col>
            <el-col :span="2">
              <el-button type="text" @click="saveInput">保存</el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { computerAdd, computerUpdate } from "@/api/home/computer";
import reqUrl from "@/utils/requestUrl";
export default {
  props: ["title", "classOptions"],
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      dialogVisible: false,
      zhSpecArr: [],
      enSpecArr: [],
      // 是否显示弹出层

      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      // 表单参数
      form: {
        fileUrl: ""
      },
      entryObj: {},
      temporary: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "请输入仪表名称", trigger: "change" },
        ],
        dirId: [{ required: true, message: "请选择分类", trigger: "change" }],
        cover: [{ required: true, message: "请选择封面", trigger: "blur" }],
        detailCover: [
          { required: true, message: "请选择详情图", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    form(val) {
      this.enSpecArr = [];
      this.zhSpecArr = [];
      if (val.enSpecification) {
        let data = JSON.parse(val.enSpecification);
        if (data.length) {
          this.enSpecArr = data;
        }
      }
      if (val.specification) {
        let data = JSON.parse(val.specification);
        if (data.length) {
          this.zhSpecArr = data;
        }
      }
    },
  },
  mounted() {},
  methods: {
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
        fileUrl: "",
        forceUpdate: 1,
      };
      this.zhSpecArr = [{ key: "", value: "" }];
      this.enSpecArr = [{ key: "", value: "" }];
      this.resetForm("form");
    },
    handleClose(arr, index) {
      arr.splice(index, 1);
    },
    //编辑但个规格，temporary用于存储当前数组和修改的下标
    editItem(item, name, index) {
      this.entryObj = {
        key: item.key,
        value: item.value,
      };
      this.temporary = {
        name,
        index,
      };
    },
    saveInput() {
      let { entryObj, temporary } = this;
      let { key, value } = entryObj;

      if (key && value) {
        if (temporary.index != undefined) {
          this[temporary.name][temporary.index] = {
            key,
            value,
          };
        } else {
          this[temporary.name].push({
            key,
            value,
          });
        }
        this[temporary.name] = Object.assign([], this[temporary.name]);
        this.msgSuccess("保存成功！");
        this.entryObj.key = "";
        this.entryObj.value = "";
        this.temporary = {};
      } else {
        this.msgError("内容不能为空！");
      }
    },
    addInput(name) {
      this.entryObj = {
        key: "",
        value: "",
      };
      this.temporary = {
        name,
      };
    },
    isEmpty(list) {
      let arr = [];
      for (let key of list) {
        if (key.value && key.key) {
          arr.push(key);
        }
      }
      return arr;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form);
          let { zhSpecArr, enSpecArr } = this;
          params.specification = JSON.stringify(this.isEmpty(zhSpecArr));
          params.enSpecification = JSON.stringify(this.isEmpty(enSpecArr));
          if (params.id) {
            computerUpdate(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("更新成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            computerAdd(params).then((response) => {
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
.demo-block.demo-tag .el-tag + .el-tag {
  margin-left: 10px;
}
</style>

 