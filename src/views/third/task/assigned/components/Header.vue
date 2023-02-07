<template>
  <div>
    <el-row :gutter="10" class="margin-bottom-xs font14 flex justify-between">
      <el-col :span="18" class="flex align-center" v-if="userInfoData">
        <div class="flex align-center">
          勤奋的干饭人:{{ userInfoData.name }}
          <el-avatar
            size="medium"
            :src="userInfoData.cover"
            class="margin-left-xs"
          ></el-avatar>
        </div>

        <div class="margin-left-xl">
          完成任务:{{ userInfoData.doneNum }}条
          <span class="margin-left-sm"
            >超过{{ parseInt(userInfoData.beyondRate || 0) }}%</span
          >的同事
        </div>
        <div class="margin-left-xl">
          完成准时率:{{ parseInt(userInfoData.doneRate || 0) }}%
          <span class="margin-left-sm">{{ hintHtml }}</span>
        </div>
      </el-col>
      <el-col :span="5" class="flex justify-end align-center">
        <el-checkbox v-model="state" @change="refresh">显示已完成</el-checkbox>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          class="margin-left"
          >新增</el-button
        >
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { taskCount } from "@/api/third/task";
export default {
  props: ["queryParams"],
  data() {
    return {
      userInfoData: null, //头部信息
      hintArr: [
        {
          value: 0,
          list: ["从零开始，我们一起努力"],
        },
        {
          value: 1,
          list: ["革命尚未成功，同志你尚需加班"],
        },
        {
          value: 20,
          list: ["七八点钟的太阳，说的就是你"],
        },
        {
          value: 30,
          list: ["太慢了，太慢了，你出拳这么慢，你师傅知道吗？"],
        },
        {
          value: 50,
          list: ["差一点就及格了，你行的，再努努力"],
        },
        {
          value: 60,
          list: ["嗯，刚刚及格，不要放松哦"],
        },
        {
          value: 70,
          list: ["很好，下一步我们赶超英美"],
        },
        {
          value: 80,
          list: ["再快一点、再快一点，你就超神了", "超神般的存在"],
        },
        {
          value: 90,
          list: ["厉害了我的哥", "天下武功，唯快不破"],
        },
      ],
      state: false,
    };
  },

  computed: {
    ...mapGetters(["userId", "avatar", "nickName"]),
    hintHtml() {
      let { doneRate } = this.userInfoData;
      let val = "";
      for (let key of this.hintArr) {
        if (key.value <= doneRate) {
          val = key;
        }
      }
      let round = Math.floor(Math.random() * val.list.length);
      return val.list[round.toString()];
    },
  },
  mounted() {
    taskCount(this.$route.query.id).then((res) => {
      let { query } = this.$route;
      this.userInfoData = Object.assign(query, res.data);
    });
  },
  methods: {
    refresh() {
      this.$emit("refresh", this.state);
    },

    handleAdd() {
      if (this.checkRole(["task_director", "admin"])) {
        this.$confirm("请选择您要创建的任务类型?", "提示", {
          confirmButtonText: "项目任务",
          cancelButtonText: "私有任务",
          type: "warning",
          center: true,
          distinguishCancelAndClose: true,
          lockScroll: true,
          showClose: false,
          callback: (action) => {
            if (action == "cancel") {
              this.openAdd({
                hideObj: {
                  projectId: true,
                  workId: true,
                },
                title: "添加私有任务",
              });
            } else if (action == "confirm") {
              this.openAdd({ title: "项目任务" });
            }
          },
        });
      } else {
        this.openAdd({
          hideObj: {
            projectId: true,
            workId: true,
          },
          title: "添加私有任务",
        });
      }
    },
    openAdd({ hideObj, showName, title }) {
      this.$parent.$refs.compUpdate.dialogVisible = true;
      this.$parent.$refs.compUpdate.reset();
      this.$parent.$refs.compUpdate.form = {
        principal: this.$route.query.id.toString(),
      };

      this.$parent.$refs.compUpdate.hideObj = hideObj || {};
      this.$parent.$refs.compUpdate.showName = showName;
      this.$parent.title = title;
    },
  },
};
</script>

<style>
</style>