 
<template>
  <div class="navbar-wrap-gg" @mouseleave="mouseLeave" :class="[cellStyle(content)]">
    <div>
      <div class="navbar">
        <div class="bg"></div>
        <div class="cover" @click="changUpdate" style="position: relative; z-index: 101">
          <img style="border-radius: 100%" :src="
            content.avatar
              ? 'http://config-api.riding-evolved.com' + content.avatar
              : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
          " alt="" />
        </div>
        <div class="title-style">
          {{ content.nickName }}<span class="text-gray">{{ content.status == 1 ? "(停用)" : "" }}</span>
          <br />
          <span> {{ content.dept.deptName }}</span>
          <div></div>
        </div>
        <ul class="menu">
            <li v-for="(tag, i) in cRoles(content.roles)" :key="i">
              <a class="fa fa-facebook" v-if="i == 6" @mouseover="mouseOver">
                <div class="flex align-center justify-center" style="
                  min-width: 40px;
                  max-width: 40px;
                  min-height: 40px;
                  max-height: 40px;
                  border-radius: 100%;
                  border: 1px solid #ccc;
                  vertical-align: middle;
                ">
                  ...
                </div>
              </a>
              <div v-else class="item" effect="dark" :content="tag.name">
                <a class="fa fa-facebook">
                  <el-image style="
                    min-width: 40px;
                    max-width: 40px;
                    min-height: 40px;
                    max-height: 40px;
                    border-radius: 100%;
                    border: 1px solid #ccc;
                    vertical-align: middle;
                  " :src="tag.cover" fit="cover">
                    <div slot="error" style="line-height: 47px">
                      <i class="el-icon-key" style="font-size: 24px; color: #ddd"></i>
                    </div>
                  </el-image>
                  <span style="white-space: nowrap">
                    {{ tag.roleName }}
                  </span>
                </a>
              </div>
            </li>
        </ul>
      </div>

      <el-card class="all-content" :class="{ 'all-content-active': openFlag }">
        <div v-for="(pg, o) in content.projectNameList" :key="o" class="all-li">
          {{ pg.name }}
        </div>
      </el-card>
      <div class="footer-content">
        <el-button @click="handleDelete" type="text" class="text-red" icon="el-icon-close">
        </el-button>
        <el-button type="text" @click="reset" icon="el-icon-unlock"></el-button>
        <el-button v-if="checkRole(['admin']) && content.nickName === 'admin'" type="text" @click="onClearSecurity"
          icon="el-icon-delete"></el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { clearSecurity } from '@/api/system/user'
export default {
  props: ["content"],
  data() {
    return {
      openFlag: false, //是否展开菜单
    };
  },
  computed: {
    cRoles() {
      return list => {
        return list.filter((item, index) => index < 7);
      }
    }
  },
  methods: {
    changUpdate() {
      this.$emit("changeEdit", this.content);
    },
    handleDelete() {
      this.$emit("delete", this.content);
    },
    reset() {
      this.$emit("reset", this.content);
    },
    // 移入
    mouseOver() {
      this.openFlag = true;
    },
    // 移出
    mouseLeave() {
      this.openFlag = false;
    },
    cellStyle(row) {
      let cellStyle;
      if (row.online == 1) {
        cellStyle = "work-end";
      }
      return cellStyle;
    },
    jumpProject(row) {
      this.$router.push({
        path: "/prodData/govern",
        query: {
          id: row.id,
        },
      });
    },
    onClearSecurity() {
      clearSecurity(this.content.userName).then(res => {
        if (res.data) {
          this.$message({ showClose: true, message: '清除用户令牌成功', type: 'success' })
        } else {
          this.$message({ showClose: true, message: '清除用户令牌失败', type: 'error' })
        }
      })
    }
  },
};
</script>

<style lang="scss" scoped>
@keyframes pulse {
  0% {
    box-shadow: 0 0 8px 6px #42e573;
  }

  50% {
    box-shadow: 0 0 8px 6px #42e573;
  }

  100% {
    box-shadow: 0 0 8px 6px #42e573;
  }
}

.navbar-wrap-gg {
  padding: 70px 50px 50px 80px;
  transform: translate3d(0, 0, 0);
  display: block;
  position: relative;

  &.work-end {
    .bg {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      position: absolute;
      top: 20px;
      left: 20px;
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

    >.el-button {
      flex: 1;
      height: 30px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 13px;
      cursor: pointer;

      &:nth-child(2) {
        border-radius: 5px;
        background: rgb(24, 144, 255);
        color: #fff;
        border-color: rgb(24, 144, 255);
      }
    }
  }

  .style-posi {
    position: absolute;
    top: -40px;
    right: -100px;
  }

  .all-content {
    position: absolute;
    top: 0px;
    left: 300px;
    visibility: hidden;
    overflow-y: scroll;
    transition: all 0.4s;
    height: 0;
    cursor: pointer;

    .all-li {
      min-width: 80px;
      border-bottom: 1px solid #e6ebf5;
      padding: 10px 0;
      line-height: normal;
      font-size: 13px;
      white-space: nowrap;

      &:hover {
        background-color: #1890ff;
        color: #fff;
      }
    }

    &.all-content-active {
      visibility: visible;
      height: 300px;
    }
  }

  .navbar {
    display: inline-block;
    border-radius: 50%;

    position: relative;
    cursor: pointer;
    text-align: center;
    font-weight: bold;
    color: #383838;
    transition: 0.24s 0.2s;
    background: transparent;

    .cover {
      position: relative;
      z-index: 102;
      cursor: pointer;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: transparent;
      box-sizing: border-box;
      overflow: hidden;
      padding: 20px;
      vertical-align: middle;

      img {
        width: 100%;
        border-radius: 100%;
        border: 1px solid #ccc;
      }
    }

    .title-style {
      padding-top: 20px;
      color: #666;
      height: 80px;
      font-size: 14px;
      line-height: 20px;
      max-width: 190px;
      overflow: hidden;
      // text-overflow: ellipsis;
      // display: -webkit-box;
      // -webkit-box-orient: vertical;
      // -webkit-line-clamp: 2;
    }
  }
}

.navbar-wrap-gg:hover {
  background: rgba(255, 255, 255, 0.75);

  .footer-content {
    visibility: visible;
    opacity: 1;
  }
}

.navbar-wrap-gg .menu {
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

.navbar-wrap-gg:hover .menu {
  transition: transform 0.4s 0.08s, z-index 0s 0.5s;
  transform: scale(1);
  z-index: 100;
}

.navbar-wrap-gg .menu li {
  position: absolute;
  top: 100px;
  left: -100px;
  transform-origin: 100px -100px;
  transition: all 0.3s 0.1s;
}

.navbar-wrap-gg:hover .menu li {
  transition: all 0.5s;
}

.navbar-wrap-gg .menu li a {
  transition: all 0.1s ease 0s;
  width: 45px;
  height: 60px;
  border-radius: 50%;
  position: absolute;
  bottom: 0;
  left: 0;
  font-size: 60%;
  transition: 0.6s;
  text-decoration: none;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: flex-start;

  .box-card-style {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(0, -50%);
  }

  span {
    overflow: hidden; //超出的文本隐藏
    text-overflow: ellipsis; //溢出用省略号显示
    white-space: nowrap; //溢出不换行
    width: 80px;
  }
}

.navbar-wrap-gg {
  &:hover {
    .menu {
      li {
        &:nth-child(1) {
          transition-delay: 0.02s;
          transform: rotate(29deg);
        }

        &:nth-child(1) a {
          transition-delay: 0.04s;
          transform: rotate(-29deg);
        }

        &:nth-child(2) {
          transition-delay: 0.04s;
          transform: rotate(64deg);
        }

        &:nth-child(2) a {
          transition-delay: 0.08s;
          transform: rotate(-64deg);
        }

        &:nth-child(3) {
          transition-delay: 0.06s;
          transform: rotate(99deg);
        }

        &:nth-child(3) a {
          transition-delay: 0.12s;
          transform: rotate(-99deg);
        }

        &:nth-child(4) {
          transition-delay: 0.08s;
          transform: rotate(134deg);
        }

        &:nth-child(4) a {
          transition-delay: 0.16s;
          transform: rotate(-134deg);
        }

        &:nth-child(5) {
          transition-delay: 0.1s;
          transform: rotate(169deg);
        }

        &:nth-child(5) a {
          transition-delay: 0.2s;
          transform: rotate(-169deg);
        }

        &:nth-child(6) {
          transition-delay: 0.12s;
          transform: rotate(204deg);
        }

        &:nth-child(6) a {
          transition-delay: 0.24s;
          transform: rotate(-204deg);
        }

        &:nth-child(7) {
          transition-delay: 0.14s;
          transform: rotate(239deg);
        }

        &:nth-child(7) a {
          transition-delay: 0.28s;
          transform: rotate(-239deg);
        }
      }
    }
  }
}
</style>
