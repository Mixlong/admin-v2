 
<template>
  <div class="navbar-wrap" :class="borderStyle()">
    <div class="navbar">
      <div class="bg"></div>
      <div class="cover" @click="changUpdate">
        <el-image
          style="width: 150px; height: 150px; vertical-align: middle"
          :src="content.cover || require('@/assets/image/wenanfengmian.png')"
          fit="cover"
        ></el-image>
      </div>
      <div class="title-style">
        <span  v-for="(pg, o) in Number(content.state)"
          :key="o">
          <i
            v-if="content.state > 0 && content.state <= 3"
            class="el-icon-star-on text-shadow font14"
            :class="stateClass()">
          </i>
        </span>
        {{ content.name }}
        <br />
        <span class="text-gray"> {{ stateName() }}</span>
      </div>
      <ul class="menu">
        <li v-for="(tag, i) in content.work" :key="i">
          <el-tooltip
            class="item"
            effect="dark"
            :content="tag.dictLabel"
            placement="left-end"
          >
            <a
              class="fa fa-facebook"
              :class="{ 'urgency-end': tag.urgency == 1 }"
              >{{ tag.dictLabel.slice(0, 1) }}</a
            >
          </el-tooltip>
        </li>
      </ul>
    </div>
    <div class="footer-content" v-if="checkRole(['project_manager', 'admin'])">
      <el-button
        @click="handleSort(4)"
        type="text"
        icon=" iconfont icon-xiangshangzhiding"
      >
      </el-button>
      <el-button
        @click="handleDelete"
        type="text"
        class="text-red"
        icon="el-icon-close"
      >
      </el-button>
      <el-button type="text" @click="addTask" icon="el-icon-plus"> </el-button>

      <el-button
        type="text"
        @click="handleSort(1)"
        icon=" iconfont icon-xiangxiazhidi"
      ></el-button>
    </div>
  </div>
</template>

<script>
import { checkRole } from "@/utils/permission";
import { sortProject } from "@/api/third/project";
export default {
  props: ["content", "stateListOptions"],
  data() {
    return {
      openFlag: false, //是否展开菜单
    };
  },
  methods: {
    checkRole,
    changUpdate() {
      sessionStorage.setItem("project", JSON.stringify(this.content));
      this.$router.push({
        path: "/prodData/govern",
        query: {
          id: this.content.id,
        },
      });
    },
    handleDelete() {
      this.$emit("delete", this.content);
    },
    stateClass() {
      let row = this.content;
      let cellStyle = "";
      if (row.state === "0") {
      } else if (row.state === "1") {
        cellStyle = "text-brown";
      } else if (row.state === "2") {
        cellStyle = "text-orange";
      } else if (row.state === "3") {
        cellStyle = "text-red";
      }
      return cellStyle;
    },
    handleSort(target) {
      let data = {};
      data.id = this.content.id;
      data.sort = target;
      sortProject(data).then((response) => {
        if (response.code === 200) {
          this.msgSuccess("操作成功");
          this.$emit("sort");
        }
      });
    },
    stateName() {
      let name = "";
      let { content, stateListOptions } = this;
      for (let key of stateListOptions) {
        if (key.dictValue == content.state) {
          name = key.dictLabel;
        }
      }
      return name;
    },
    borderStyle() {
      let { content } = this;
      if (
        content.state == "4" ||
        content.state == "5" ||
        content.state == "7"
      ) {
        return;
      }
      let cellStyle = "";
      let rtArr = content.workList.filter((item) => item.urgency == 1);
      if (rtArr.length) {
        cellStyle = "work-end";
      }

      return cellStyle;
    },
    addTask() {
      this.$emit("task", this.content);
    },
  },
};
</script>

<style lang="scss"   scoped>
.navbar-wrap {
  padding: 60px 70px 50px;
  transform: translate3d(0, 0, 0);
  display: inline-block;
  position: relative;
  &.work-end {
    .bg {
      width: 100%;
      height: 150px;
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
      animation: pulse 0.8s infinite;
    }
  }
  .footer-content {
    position: absolute;
    visibility: hidden;
    opacity: 0;
    bottom: 15px;
    left: 50%;
    width: 80%;
    display: flex;
    transform: translate(-50%, 0);
    transition: all 0.5s 0.1s;
    > .el-button {
      flex: 1;
      height: 30px;
      width: 20%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 13px;
      cursor: pointer;
      // &:nth-child(2),
      // &:nth-child(3) {
      //   border-radius: 5px;
      //   border: 1px solid transparent;
      // }
    }
  }
}
.navbar {
  display: inline-block;

  background: #fff;
  position: relative;
  z-index: 100;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  color: #383838;
  transition: 0.24s 0.2s;
  .cover {
    position: relative;
    z-index: 100;
    cursor: pointer;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 1px solid #ccc;
    background: #fff;
    box-sizing: border-box;
    overflow: hidden;
    vertical-align: middle;
    img {
      width: 100%;
    }
  }
  .title-style {
    padding-top: 20px;
    color: #666;
    height: 60px;
    font-size: 14px;
    line-height: 20px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

.navbar-wrap:hover {
  background: rgba(255, 255, 255, 0.75);
  .footer-content {
    visibility: visible;
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 8px 6px #fff;
  }
  50% {
    box-shadow: 0 0 8px 6px #e54d42;
  }
  100% {
    box-shadow: 0 0 8px 6px #fff;
  }
}
.navbar-wrap .menu {
  list-style: none;
  padding: 0;
  margin: 0;
  position: absolute;
  top: -75px;
  left: -75px;
  border: 150px solid transparent;
  cursor: default;
  border-radius: 50%;
  transform: scale(0);
  transition: transform 1.4s 0.07s;
  z-index: -1;
}
.navbar-wrap:hover .menu {
  transition: transform 0.4s 0.08s, z-index 0s 0.5s;
  transform: scale(1);
  z-index: 1;
}
.navbar-wrap .menu li {
  position: absolute;
  top: 100px;
  left: -100px;

  transform-origin: 100px -100px;
  transition: all 0.3s 0.1s;
}
.navbar-wrap:hover .menu li {
  transition: all 0.5s;
}
.navbar-wrap .menu li a {
  transition: all 0.1s;
  width: 45px;
  height: 45px;
  line-height: 45px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  bottom: 0;
  left: 0;
  font-size: 60%;
  border: 1px solid #ccc;

  text-decoration: none;
  &.urgency-end {
    background-color: #e54d42;
    color: #fff;
    &:hover {
      background-color: #e54d42;
      color: #fff;
    }
  }
}
.navbar-wrap .menu li a:hover {
  background-color: rgb(24, 144, 255);
  color: #fff;
}
.navbar-wrap:hover .menu li:nth-child(1) {
  transition-delay: 0.02s;
  transform: rotate(20deg);
}
.navbar-wrap:hover .menu li:nth-child(1) a {
  transition-delay: 0.04s;
  transform: rotate(-20deg);
}
.navbar-wrap:hover .menu li:nth-child(2) {
  transition-delay: 0.04s;
  transform: rotate(48.75deg);
}
.navbar-wrap:hover .menu li:nth-child(2) a {
  transition-delay: 0.08s;
  transform: rotate(-48.75deg);
}
.navbar-wrap:hover .menu li:nth-child(3) {
  transition-delay: 0.06s;
  transform: rotate(77.5deg);
}
.navbar-wrap:hover .menu li:nth-child(3) a {
  transition-delay: 0.12s;
  transform: rotate(-77.5deg);
}
.navbar-wrap:hover .menu li:nth-child(4) {
  transition-delay: 0.08s;
  transform: rotate(106.25deg);
}
.navbar-wrap:hover .menu li:nth-child(4) a {
  transition-delay: 0.16s;
  transform: rotate(-106.25deg);
}
.navbar-wrap:hover .menu li:nth-child(5) {
  transition-delay: 0.1s;
  transform: rotate(135deg);
}
.navbar-wrap:hover .menu li:nth-child(5) a {
  transition-delay: 0.2s;
  transform: rotate(-135deg);
}
.navbar-wrap:hover .menu li:nth-child(6) {
  transition-delay: 0.12s;
  transform: rotate(163.75deg);
}
.navbar-wrap:hover .menu li:nth-child(6) a {
  transition-delay: 0.24s;
  transform: rotate(-163.75deg);
}
.navbar-wrap:hover .menu li:nth-child(7) {
  transition-delay: 0.14s;
  transform: rotate(192.5deg);
}
.navbar-wrap:hover .menu li:nth-child(7) a {
  transition-delay: 0.28s;
  transform: rotate(-192.5deg);
}
.navbar-wrap:hover .menu li:nth-child(8) {
  transition-delay: 0.14s;
  transform: rotate(221.25deg);
}
.navbar-wrap:hover .menu li:nth-child(8) a {
  transition-delay: 0.28s;
  transform: rotate(-221.25deg);
}
.navbar-wrap:hover .menu li:nth-child(9) {
  transition-delay: 0.14s;
  transform: rotate(250deg);
}
.navbar-wrap:hover .menu li:nth-child(9) a {
  transition-delay: 0.28s;
  transform: rotate(-250deg);
}
</style>
