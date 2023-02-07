<template>
  <div
    class="padding-xs padding-bottom-0"
    style="margin: 0 60px 0; padding-bottom: 0; position: relative"
    v-if="detailData.doneTime"
  >
    <div class="font12 starting">{{ detailData.startTime }}</div>
    <div
      class="flex justify-between hei"
      ref="top-list"
      @click.stop="handleAdd(1)"
    >
      <div class="flex-sub flex" style="position: relative">
        <div
          v-for="(item, index) in topList"
          :key="index"
          class="flex align-end kd-item"
          :style="{
            width: signWidth + 'px',
            right: (item.day - 1) * signWidth + 'px',
          }"
        >
          <el-popover placement="top" width="360" trigger="hover">
            <p
              v-for="(p, l) in item.list"
              :key="l"
              @click.stop="handleUpdate(p)"
              style="cursor: pointer"
            >
              【{{ item.time }}】{{ p.content }}
            </p>
            <div slot="reference" @click.stop="fnSecede">
              <div class="text-center" v-if="topList.length - 1 == index">
                <i class="el-icon-s-flag font28 text-red"></i>
                <div class="font12" style="white-space: nowrap">
                  {{ detailData.doneTime }}
                </div>
              </div>
              <div v-else>
                <i class="el-icon-caret-bottom font18 ml5 text-blue"></i>
              </div>
            </div>
          </el-popover>
        </div>
      </div>
    </div>
    <el-divider class="margin-0"></el-divider>
    <div
      class="flex justify-between hei"
      @click.stop="handleAdd(0)"
      style="position: relative"
    >
      <div class="flex-sub">
        <div
          v-for="(item, index) in bottomList"
          :key="index"
          class="flex align-start kd-item"
          :style="{
            width: signWidth + 'px',
            right: (item.day - 1) * signWidth + 'px',
          }"
        >
          <el-popover placement="bottom" width="360" trigger="hover">
            <p
              v-for="(p, l) in item.list"
              :key="l"
              @click.stop="handleUpdate(p)"
              style="cursor: pointer"
            >
              【{{ item.time }}】{{ p.content }}
            </p>
            <div slot="reference" @click.stop="fnSecede">
              <div class="text-center" v-if="topList.length - 1 == index">
                <i class="el-icon-s-flag font28 text-red"></i>
                <div class="font12">{{ detailData.doneTime }}</div>
              </div>
              <div v-else>
                <i class="el-icon-caret-top font18 ml5 text-blue"></i>
              </div>
            </div>
          </el-popover>
        </div>
      </div>
    </div>

    <el-dialog
      :close-on-click-modal="false"
      :append-to-body="true"
      :title="title"
      :visible.sync="dialogFormVisible"
      width="500px"
    >
      <el-form ref="form" :model="form" label-width="50px">
        <el-form-item label="时间" prop="createTime">
          <div class="flex">
            <el-date-picker
              style="width: 100%"
              ref="datePicker"
              v-model="form.createTime"
              type="date"
              placeholder="选择日期时间"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            type="textarea"
            v-model="form.content"
            :autosize="{ minRows: 5 }"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { projectProgressUpdate, projectProgressAdd } from "@/api/third/project";
export default {
  props: ["detailData"],
  data() {
    return {
      dialogFormVisible: false,
      title: "新增进度",
      signWidth: 0,
      topList: [],
      bottomList: [],
      day: 0,
      form: {
        direction: 0,
        createTime: new Date(),
      },
    };
  },
  watch: {
    detailData(val) {
      this.$nextTick(() => {
        if (!this.$refs["top-list"]) {
          return;
        }
        this.wid = this.$refs["top-list"].offsetWidth;
        let { wid } = this;
        let day = this.daysDistance(val.startTime, val.doneTime);
        let topList = [];
        let bottomList = [];
        for (let key of val.projectProgressList) {
          if (key.direction == 1) {
            topList.push(key);
          } else {
            bottomList.push(key);
          }
        }
        this.topList = this.duplicate(topList);
        this.bottomList = this.duplicate(bottomList);

        this.signWidth = wid / day;
        this.day = day;
      });
    },
  },
  mounted() {},
  methods: {
    fnSecede() {},
    duplicate(data) {
      let obj = {};
      for (let key of data) {
        if (obj[key.createTime]) {
          obj[key.createTime].arr.push(key);
        } else {
          obj[key.createTime] = {};

          obj[key.createTime].arr = [key];
          obj[key.createTime].createTime = key.createTime;
        }
      }
      let arr = [];
      for (let key in obj) {
        arr.push({
          list: obj[key].arr,
          time: key,
          day: this.daysDistance(obj[key].createTime, this.detailData.doneTime),
        });
      }

      return arr;
    },
    handleAdd(direction) {
      if (this.checkRole(["project_manager", "admin"])) {
        this.title = direction == 1 ? "新增计划进度" : "新增当前进度";

        this.form.projectId = this.detailData.id;
        this.form.direction = direction;
        this.form.id = undefined;
        this.form.createTime = new Date();
        this.dialogFormVisible = true;
      }
    },
    //处理默认选中当前日期
    getNowTime() {
      var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth(); //得到月份
      var date = now.getDate(); //得到日期
      var hour = " 00:00:00"; //默认时分秒 如果传给后台的格式为年月日时分秒，就需要加这个，如若不需要，此行可忽略
      month = month + 1;
      month = month.toString().padStart(2, "0");
      date = date.toString().padStart(2, "0");
      var defaultDate = `${year}-${month}-${date}`;
      this.$set(this.form, "createTime", defaultDate);
      return defaultDate;
    },

    handleUpdate(row) {
      if (this.checkRole(["project_manager", "admin"])) {
        this.form = Object.assign({}, row);

        this.dialogFormVisible = true;
      }
    },
    //date1和date2是2019-06-18格式
    daysDistance(date1, date2) {
      //parse() 是 Date 的一个静态方法 , 所以应该使用 Date.parse() 来调用，而不是作为 Date 的实例方法。返回该日期距离 1970/1/1 午夜时间的毫秒数
      date1 = Date.parse(date1);
      date2 = Date.parse(date2);
      var days = Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
      return days;
    },
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let fn = this.form.id ? projectProgressUpdate : projectProgressAdd;
          fn(this.form).then((res) => {
            if (res.code == 200) {
              this.dialogFormVisible = false;
              this.$emit("change");
              this.msgSuccess(this.form.id ? "更新成功！" : "新增成功！");
            }
          });
        }
      });
    },
  },
};
</script>

<style lang='scss'>
.starting {
  position: absolute;
  top: 50%;
  left: -65px;
  transform: translate(0, -50%);
}
.hei {
  height: 40px;
  &:hover {
    background: rgb(248, 248, 248);
    cursor: pointer;
  }
}
.kd-item {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  z-index: 10;
  cursor: pointer;
}
</style>