<template>
  <div class="bg-white document" @click="closeVisible">
    <el-container>
      <el-header class="solid-bottom shodw"
        ><h3 class="flex justify-between">
          <span> 外部接口文档</span>
          <!-- <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="isEdit = !isEdit"
            >{{ isEdit ? "关闭" : "显示" }}编辑</el-button
          > -->
        </h3></el-header
      >
      <el-container class="conent-wrap">
        <el-aside width="300px" class="padding-0 left-nav-wrap">
          <div class="flex justify-between solid-bottom title">
            <h4 class="margin-0">标题栏</h4>
            <el-button
              v-if="isEdit"
              @click="handleTitleAdd"
              type="primary"
              size="small"
              icon="el-icon-plus"
            ></el-button>
          </div>

          <el-menu
            :default-active="navActive"
            class="el-menu-vertical-demo"
            background-color="#eef1f6"
            text-color="#666"
            active-text-color="#fff"
            @select="handleMenuSelect"
          >
            <div v-for="(item, index) in leftList" :key="index">
              <el-submenu :index="item.id" v-if="item.childList.length">
                <template slot="title">
                  <MenuItem
                    :add="true"
                    :item="item"
                    @change="closeVisible"
                    @update="handleTitleUpdate"
                    @add="handleTitleAdd"
                    @delete="handleDelete"
                  />
                </template>
                <el-menu-item-group
                  v-for="(items, indexs) in item.childList"
                  :key="indexs"
                >
                  <el-menu-item :index="items.id">
                    <MenuItem
                      :item="items"
                      @change="closeVisible"
                      @update="handleTitleUpdate"
                      @add="handleTitleAdd"
                      @delete="handleDelete"
                    />
                  </el-menu-item>
                </el-menu-item-group>
              </el-submenu>
              <el-menu-item :index="item.id" v-else>
                <div class="flex justify-between">
                  <div slot="title" style="width: 100%">
                    <MenuItem
                      :add="true"
                      :item="item"
                      @change="closeVisible"
                      @update="handleTitleUpdate"
                      @add="handleTitleAdd"
                      @delete="handleDelete"
                    />
                  </div>
                </div>
              </el-menu-item>
            </div>
          </el-menu>
        </el-aside>
        <el-main>
          <div class="margin-bottom-xs">
            <el-button
              v-if="isEdit && navActive"
              size="small"
              class="text-blue margin-right-xs"
              @click="addMarkdown"
              >{{ !contentData ? "新增" : "编辑" }}
            </el-button>
          </div>
          <div v-if="contentData">
            <MarkdownView :source="contentData.content"></MarkdownView>
            <el-backtop target=".el-main" :bottom="100">
              <i class="el-icon-caret-top"></i
            ></el-backtop>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="80px" ref="form" :rules="rules">
        <el-form-item label="父级菜单" prop="parentName" v-if="form.parentName">
          <el-input v-model="form.parentName" disabled></el-input>
        </el-form-item>
      </el-form>
      <el-form :model="form" label-width="80px" ref="form" :rules="rules">
        <el-form-item label="菜单名称" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入菜单名称"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="markdownTitle"
      :visible.sync="open"
      width="80%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <markdown-editor
        v-model="formMarkdownValue"
        height="600px"
        ref="editor"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="open = false">取 消</el-button>
        <el-button type="primary" @click="submitMarkdown">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  addApi,
  updateApi,
  addList,
  docDetail,
  docAdd,
  docUpdate,
} from "@/api/document";
import MenuItem from "./components/MenuItem";
import MarkdownEditor from "./components/MarkdownEditor";
import MarkdownView from "./components/MarkdownView";
import { apiAuth } from "@/api/document";
export default {
  components: {
    MarkdownView,
    MenuItem,
    MarkdownEditor,
  },
  data() {
    return {
      open: false,
      isEdit: true,
      dialogVisible: false,

      title: "",
      form: {},
      valForm: {},
      rules: {
        title: [
          { required: true, message: "请输入菜单名称", trigger: "change" },
        ],
      },
      leftList: [],
      navActive: "",
      contentData: null,
      formMarkdownValue: "",
      markdownTitle: "",
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      addList().then((res) => {
        for (let key of res.data) {
          key.visible = false;
          for (let keys of key.childList) {
            keys.visible = false;
          }
        }
        this.leftList = res.data;
        if (this.navActive == "") {
          this.navActive = res.data[0].childList.length
            ? res.data[0].childList[0].id
            : res.data[0].id;
          this.getDetail();
        }
      });
    },
    getDetail() {
      docDetail(this.navActive).then((res) => {
        this.contentData = res.data;
      });
    },
    handleMenuSelect(item) {
      this.navActive = item;
      this.getDetail();
    },
    submitMarkdown() {
      let fn = this.contentData ? docUpdate : docAdd;
      if (this.formMarkdownValue) {
        fn({
          apiId: this.navActive,
          content: this.formMarkdownValue,
          id: this.contentData ? this.contentData.id : undefined,
        }).then((res) => {
          let { code } = res;
          if (code == 200) {
            this.msgSuccess(this.contentData ? "修改成功！" : "新增成功");
            this.open = false;
            this.getDetail();
          }
        });
      }
    },
    addMarkdown() {
      this.open = true;
      this.markdownTitle = "新增";
      if (this.contentData) {
        this.formMarkdownValue = this.contentData.content;
        this.markdownTitle = "编辑";
      } else {
        this.formMarkdownValue = "";
      }
    },
    handleTitleAdd(item) {
      this.form = {};
      this.dialogVisible = true;
      this.title = "新增一级菜单";
      if (item) {
        this.form.parentId = item.id;
        this.form.parentName = item.title;
        this.title = "新增二级菜单";
      }
    },
    handleTitleUpdate(item) {
      this.form = Object.assign({}, item);
      this.dialogVisible = true;
      this.title = "修改一级菜单";
      if (item.parentId) {
        this.title = "修改二级菜单";
      }
    },

    changeNav(item) {
      this.navActive = item.id;
    },
    submitForm() {
      let { form } = this;
      let fn = form.id ? updateApi : addApi;
      this.$refs["form"].validate((valid) => {
        if (valid) {
          fn(form).then((res) => {
            let { code } = res;
            if (code == 200) {
              this.msgSuccess(form.id ? "修改成功！" : "添加成功");
              this.dialogVisible = false;
              this.getList();
            }
          });
        } else {
          return false;
        }
      });
    },
    closeVisible() {
      for (let key of this.leftList) {
        key.visible = false;
        for (let keys of key.childList) {
          keys.visible = false;
        }
      }
    },
    handleDelete(item) {
      apiAuth(item.id).then((res) => {
        let { code } = res;
        if (code == 200) {
          this.msgSuccess("删除成功！");
          this.getList();
        }
      });
    },
  },
};
</script>

<style lang='scss' scope>
.el-main {
  height: calc(100vh - 60px);
}
.document {
  .is-active {
    background: rgba(24, 144, 255, 0.6) !important;
    color: #fff;
  }
  .el-submenu__title,
  .el-menu-item {
    height: 40px;
    line-height: 40px;
  }
  .el-menu-item-group__title {
    padding: 0;
  }
}
.left-nav-wrap {
  > div {
    padding: 10px 20px;
    font-size: 14px;
    &:hover {
      cursor: pointer;
    }
    &.active {
      background: rgba(24, 144, 255, 0.6);
      color: #fff;
    }
  }
  > .title {
    padding: 10px;
    font-size: 16px;
    &:hover {
      cursor: default;
    }
  }
}
.conent-wrap {
  min-height: calc(100vh - 60px);
}
</style>