<template>
  <el-dialog
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogFormVisible"
    width="800px"
    top="2vh"
    custom-class="style-dialog"
    v-if="dialogFormVisible"
  >
    <el-form :model="form" label-width="80px" ref="form" :rules="rules">
      <template v-if="showName == ''">
        <div class="flex">
          <div class="flex-sub flex justify-center">
            <el-form-item
              label=""
              prop="cover"
              label-width="0"
              class="margin-0 margin-bottom-xs"
            >
              <div class="cover-wrap">
                <div class="navbar">
                  <div class="cover">
                    <DrUpload
                      :limit="1"
                      v-model="form.cover"
                      class="style-width-upload"
                      :showFileList="false"
                      accept="image/jpeg, image/gif, image/png,image/bmp"
                    >
                      <div class="ilfex justify-center align-center">
                        <el-image
                          style="
                            width: 150px;
                            height: 150px;
                            vertical-align: middle;
                            border-radius: 100%;
                          "
                          :src="
                            form.cover ||
                            require('@/assets/image/wenanfengmian.png')
                          "
                          fit="cover"
                        ></el-image>
                      </div>
                    </DrUpload>
                  </div>
                  <ul class="menu">
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="item.dictLabel"
                      placement="left-end"
                      v-for="(item, index) in list"
                      :key="index"
                    >
                      <li
                        :style="{ top: item.y + 'px', left: item.x + 'px' }"
                        :class="{ active: item.check }"
                        @click="selectWork(item, index)"
                      >
                        <a class="fa fa-facebook">{{ item.initial }} </a>
                      </li>
                    </el-tooltip>
                  </ul>
                </div>
              </div>
            </el-form-item>
          </div>
          <div class="flex-sub flex-direction flex justify-center">
            <el-form-item label="项目名称" prop="name">
              <el-input
                placeholder="请输入项目名"
                v-model="form.name"
                style="width: 100%"
              >
              </el-input>
            </el-form-item>
            <el-form-item label="项目经理" prop="pm">
              <el-select
                v-model="form.pm"
                placeholder="请选择项目经理"
                style="width: 100%"
              >
                <el-option
                  :label="item.dictLabel"
                  :value="item.dictValue"
                  v-for="(item, index) in pmDictListOptions"
                  :key="index"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="项目状态" prop="state">
              <el-select
                v-model="form.state"
                placeholder="请选择项目状态"
                style="width: 100%"
              >
                <el-option
                  :label="item.dictLabel"
                  :value="item.dictValue"
                  v-for="(item, index) in stateListOptions"
                  :key="index"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="结项时间"
              prop="doneTime"
              v-if="showName == 'doneTime' || !showName"
            >
              <div class="flex">
                <!-- <el-date-picker
                  style="width: 195px"
                  ref="datePicker"
                  v-model="form.doneTime"
                  type="date"
                  placeholder="选择日期时间"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                >
                </el-date-picker> -->
                <el-date-picker
                  v-model="dateTime"
                  type="daterange"
                  align="right"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :picker-options="pickerOptions"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                >
                </el-date-picker>
              </div>
            </el-form-item>
            <el-form-item label="" prop="doneTime" label-width="0">
              <div
                class="flex align-center padding-left-xs"
                style="height: 36px"
              >
                <el-radio-group v-model="form.authType" class="flex">
                  <el-radio :label="0">全部公开</el-radio>
                  <el-radio :label="1">部分可见</el-radio>
                </el-radio-group>
                <el-select
                  v-if="form.authType == 1"
                  v-model="form.usersList"
                  multiple
                  collapse-tags
                  clearable
                  style="margin-left: 20px; width: 100%"
                  placeholder="请选择"
                >
                  <el-option
                    :label="item.dictLabel"
                    :value="item.dictValue"
                    v-for="(item, index) in visiblePersonOption"
                    :key="index"
                  >
                  </el-option>
                </el-select>
              </div>
            </el-form-item>
          </div>
        </div>
        <div
          style="
            font-size: 14px;
            color: #606266;
            line-height: 40px;
            padding: 0 12px 0 0;
          "
        >
          <label for=""> 项目描述 </label>
        </div>
        <el-form-item prop="desc" label-width="0">
          <tinymce
            v-model="form.desc"
            placeholder="请输入项目说明"
            width="755px"
            height="210"
          ></tinymce>
        </el-form-item>
      </template>
      <template>
        <el-form-item
          prop="progress"
          label="项目进展"
          label-width="0"
          v-if="showName == 'progress'"
        >
          <tinymce
            v-model="form.progress"
            placeholder="请输入项目进展"
            width="755px"
            height="210"
          ></tinymce>
        </el-form-item>
        <el-form-item
          prop="plan"
          label="项目计划"
          label-width="0"
          v-if="showName == 'plan'"
        >
          <tinymce
            v-model="form.plan"
            placeholder="请输入项目计划"
            width="755px"
            height="210"
          ></tinymce>
        </el-form-item>
        <el-form-item
          prop="plan"
          label="市场声音"
          label-width="0"
          v-if="showName == 'marketFeedback'"
        >
          <tinymce
            v-model="form.marketFeedback"
            placeholder="请输入"
            width="755px"
            height="210"
          ></tinymce>
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import tinymce from "@/views/components/Editor";
import { addProject, editProject } from "@/api/third/project";
import { memberDictUser } from "@/api/system/user";
export default {
  components: { tinymce },
  props: ["worKListOptions", "pmDictListOptions", "stateListOptions"],
  data() {
    return {
      showName: "",
      dialogFormVisible: false,
      list: [],
      dateTime: [],
      form: {
        cover: "",
        authType: 0,
      },
      radii: 125, //半径
      title: "添加项目",
      visiblePersonOption: [],
      rules: {
        name: [{ required: true, message: "请输入项目名", trigger: "blur" }],
        pm: [{ required: true, message: "请选择项目经理", trigger: "blur" }],
        state: [{ required: true, message: "请选择项目状态", trigger: "blur" }],
        cover: [{ required: false, message: "请上传图片", trigger: "blur" }],
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
    };
  },
  watch: {
    dialogFormVisible(val) {
      if (val) {
        this.radianaNum();
        let { list, form } = this;
        if (form.workList) {
          let allId = form.workList.map((item) => item.workId);
          for (let key of list) {
            key.check = allId.indexOf(key.dictValue) > -1 ? true : false;
          }
        }
      }
    },
    form(val) {
      if (val.doneTime && val.startTime) {
        this.dateTime = [val.startTime, val.doneTime];
      } else {
        this.dateTime = [];
      }
    },
  },
  mounted() {
    this.radianaNum();
    memberDictUser().then((response) => {
      if (response.code === 200) {
        this.visiblePersonOption = response.data;
      }
    });
  },
  methods: {
    selectWork(item, index) {
      this.list[index].check = !item.check;
      this.list = Object.assign([], this.list);
    },
    // 表单重置
    reset() {
      this.form = {
        authType: 0,
        usersList: [],
      };
      this.resetForm("form");
    },
    radianaNum() {
      let { worKListOptions, radii } = this;
      let list = worKListOptions;
      let angle = 210 / (list.length - 1);
      let deg = 165;
      for (let key of list) {
        key.x = 75 + radii * Math.cos((deg * Math.PI) / 180);
        key.y = 75 + radii * Math.sin((deg * Math.PI) / 180);
        deg += angle;
        key.initial = key.dictLabel.slice(0, 1);
        key.check = false;
      }
      this.list = list;
    },
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let fn = "";
          let { dateTime } = this;
          fn = this.form.id ? editProject : addProject;
          if (dateTime.length) {
            this.form.startTime = dateTime[0];
            this.form.doneTime = dateTime[1];
          }
          this.form.workIdList = this.list.map((item) => {
            return { id: item.dictValue, status: item.check ? 0 : 1 };
          });

          fn(this.form).then((res) => {
            if (res.code == 200) {
              this.msgSuccess(this.form.id ? "更新成功！" : "操作成功！");
              this.dialogFormVisible = false;
              this.$emit("success");
            }
          });
        }
      });
    },
  },
};
</script>

<style lang='scss'  >
.style-dialog {
  .el-dialog__body {
    padding-top: 0;
  }
}
.cover-wrap {
  padding: 80px 80px 0;

  .navbar {
    position: relative;
    vertical-align: middle;
    border-radius: 100%;

    .cover {
      display: flex;
      align-items: center;
      justify-items: center;
      min-height: 150px;
      overflow: hidden;
      img {
        vertical-align: middle;
      }
    }
    .menu {
      list-style: none;
      li {
        cursor: pointer;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        border: 1px solid #ccc;
        width: 40px;
        height: 40px;
        border-radius: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        &.active {
          background: #1890ff;
          color: #fff;
        }
      }
    }
  }
}
</style>