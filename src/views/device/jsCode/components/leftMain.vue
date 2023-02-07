<template>
  <div>
    <el-dialog
      title="基础函数区"
      :visible.sync="dialogFormVisible"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="95px" :rules="rules" ref="form">
        <el-form-item label="PUCS类型:" prop="pucsType">
          <el-select
            v-model="form.pucsType"
            style="width: 100%"
            placeholder="请选择PUCS类型"
            :disabled="form.isDisable"
          >
            <el-option
              :label="item.dictLabel"
              :value="item.dictValue"
              v-for="(item, index) in pucsTypeList"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="一级分类:" prop="dirRootName" v-if="!form.id">
          <el-autocomplete
            class="inline-input"
            style="width: 100%"
            v-model="form.dirRootName"
            :fetch-suggestions="querySearch"
            placeholder="请输入一级分类"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="二级分类:" prop="dirName" v-if="!form.id">
          <el-autocomplete
            class="inline-input"
            style="width: 100%"
            v-model="form.dirName"
            :fetch-suggestions="querySearchTwo"
            placeholder="请输入二级分类"
          ></el-autocomplete>
        </el-form-item> -->
        <el-form-item label="软件模块:" prop="dirName">
          <el-input v-model="form.dirName" :disabled="form.isDisable" placeholder="请输入软件模块名称"></el-input>
        </el-form-item>
        <el-form-item label="函数名称:" prop="name">
          <el-input v-model="form.name" placeholder="请输入函数名称"></el-input>
        </el-form-item>
        <el-form-item label="函数描述:">
          <el-input
            v-model="form.desc"
            type="textarea"
            placeholder="请输入函数描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="函数方法:" prop="funcName">
          <el-input
            v-model="form.funcName"
            placeholder="请输入函数方法"
          ></el-input>
        </el-form-item>

        <el-form-item label="函数参数:">
          <div
            class="flex"
            v-for="(item, index) in paramsList"
            :key="index"
            :class="{ 'margin-top-xs': index > 0 }"
          >
            <el-input v-model="item.key" placeholder="请输入参数"></el-input>
            <el-input
              v-model="item.value"
              class="margin-left-xs"
              placeholder="请输入参数描述"
            ></el-input>
            <div style="min-width: 46px">
              <el-button
                @click="handleDeleteList(index)"
                class="margin-left-xs"
                icon="el-icon-minus"
                circle
                plain
                v-if="
                  index > 0 &&
                  paramsList.length > 0 &&
                  index + 1 != paramsList.length
                "
                type="primary"
              ></el-button>
              <el-button
                @click="handleAddList"
                class="margin-left-xs"
                icon="el-icon-plus"
                circle
                plain
                v-if="index + 1 == paramsList.length"
                type="primary"
              ></el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="模拟返回值:">
          <el-input
            v-model="form.res"
            placeholder="请输入模拟返回值"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { jsfuncBaseAdd, jsfuncBaseUpdate } from "@/api/js";
export default {
  props: ["pucsTypeList"],
  data() {
    return {
      dialogFormVisible: false,
      form: {},
      paramsList: [
        {
          key: "",
          value: "",
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入函数名称", trigger: "blur" }],
        dirRootName: [
          { required: true, message: "请输入一级分类标题", trigger: "change" },
        ],
        dirName: [
          { required: true, message: "请输入软件模块名称", trigger: "change" },
        ],
        funcName: [
          { required: true, message: "请输入函数方法", trigger: "blur" },
        ],
        pucsType: [
          { required: true, message: "请选择PUCS类型", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    dialogFormVisible(val) {
      if (val) {
        if (this.form.param) {
          this.paramsList = JSON.parse(this.form.param);
        } else {
          this.paramsList = [];
          this.handleAddList();
        }
      }
    },
  },
  methods: {
    handleAddList() {
      this.paramsList.push({
        key: "",
        value: "",
      });
    },
    handleDeleteList(index) {
      this.paramsList.splice(index, 1);
    },
    querySearch(queryString, cb) {
      var restaurants = this.$parent.baseList.map((item) => {
        return { value: item.name };
      });
      var results = queryString
        ? restaurants.filter((restaurant) => {
            return (
              (restaurant.value + "")
                .toLowerCase()
                .indexOf(queryString.toLowerCase()) === 0
            );
          })
        : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    querySearchTwo(queryString, cb) {
      let arr = this.$parent.baseList.filter(
        (item) => item.name === this.form.dirRootName
      );
      if (arr.length) {
        var restaurants = arr[0].pucsFuncs.map((item) => {
          return { value: item.name };
        });

        var results = queryString
          ? restaurants.filter((restaurant) => {
              return (
                (restaurant.value + "")
                  .toLowerCase()
                  .indexOf(queryString.toLowerCase()) === 0
              );
            })
          : restaurants;
        // 调用 callback 返回建议列表的数据
        cb(results);
      }
      cb();
    },
    submitForm() {
      let fn = this.form.id ? jsfuncBaseUpdate : jsfuncBaseAdd;
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let { paramsList, form } = this;
          let arr = [];
          for (let key of paramsList) {
            if (key.key && key.value) {
              arr.push(key);
            }
          }
          if (arr.length) {
            form.param = JSON.stringify(arr);
          }
          form.jsType = 1;
          fn(form).then((res) => {
            if (res.code == 200) {
              this.dialogFormVisible = false;
              this.msgSuccess(form.id ? "修改成功!" : "添加成功!");
              this.$emit("success");
              this.$parent.getList(1);
            }
          });
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style>
</style>