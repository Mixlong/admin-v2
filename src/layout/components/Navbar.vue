<template>
  <div class="navbar-wrap-style">
    <!-- <div style="font-size: 25px; padding: 0 25px 0 25px" class="hamburger-container text-shadow text-blue"> -->
    <!-- 迪太云后台管理 -->
    <!-- <img :src="customImage == 0
          ? require('@/assets/logo/logo.png')
          : require('@/assets/logo/logo1.png')
        " alt="" class="logo-image" style="vertical-align: middle; width: 100px" /> -->
    <!-- <div class="text-center font20 company-name">迪太云</div> -->
    <!-- </div> -->
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    <div class="right-menu" v-if="!externalFlag">
      <template v-if="device !== 'mobile'">
        <search
          id="header-search"
          class="right-menu-item"
          v-if="name === 'admin' || nickName == '黄江龙'"
        />

      </template>

      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <!-- <el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item> -->
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <div class="user-info padding-right-xs">
        <span class="user-name">{{ nickName }}</span>
      </div>
    </div>
    <!-- 外部系统访问时显示的右侧菜单 -->
    <div v-else class="right-menu external-menu">
      <el-button 
        type="text" 
        icon="el-icon-refresh-right"
        @click="handleReload"
        class="reload-btn"
      >
        刷新
      </el-button>
    </div>
    
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import Screenfull from "@/components/Screenfull";
import SizeSelect from "@/components/SizeSelect";
import Search from "@/components/HeaderSearch";
import RuoYiGit from "@/components/RuoYi/Git";
import RuoYiDoc from "@/components/RuoYi/Doc";

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    RuoYiGit,
    RuoYiDoc,
  },
  computed: {
    ...mapGetters([
      "sidebar",
      "avatar",
      "nickName",
      "readNum",
      "device",
      "name",
      "isFromExternal",
    ]),
    externalFlag() {
      // 兼容未及时写入 Vuex 的场景，回落到 sessionStorage
      return (
        this.isFromExternal ||
        sessionStorage.getItem("isFromExternal") === "true"
      );
    },
    setting: {
      get() {
        return this.$store.state.settings.showSettings;
      },
      set(val) {
        this.$store.dispatch("settings/changeSetting", {
          key: "showSettings",
          value: val,
        });
      },
    },
  },

  methods: {
    /**
     * 重新加载当前页面
     */
    handleReload() {
      this.$confirm('确定要重新加载当前页面吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        // 刷新当前路由
        this.$router.go(0);
      }).catch(() => {
        // 取消操作
      });
    },
    jumpApi() {
      this.$router.push({
        path: "/document",
      });
    },
    toProjectNote() {
      this.$router.push({ path: "/prodData/projectNote" });
    },
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      this.$confirm("确定注销并退出系统吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$store.dispatch("LogOut").then(() => {
          location.href = "/index";
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

.navbar-wrap-style {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: transparent !important;
  color: #515a6e !important;

  .company-name {
    color: if($darkTheme, #ffffff, #0094d0);
  }

  .icon-msg {
    position: relative;
    top: 2px;
    display: inline-block;
    width: 16px !important;
    margin: auto;
    height: 16px;
    background-size: 16px 16px;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url("data:image/png;base64,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");

    &.news {
      background-image: url("data:image/png;base64,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");
    }
  }

  .hamburger-container {
    display: flex;
    align-items: center;
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    .company-name {
      margin-left: 10px;
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .user-info {
    color: #515a6e !important;
    display: flex;
    align-items: center;
    margin-right: 20px;

    .user-name {
      color: #515a6e !important;
      font-size: 14px;
      position: relative;
      display: inline-block;
      margin-left: 5px;
      &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 10px;
        width: 100%;
        height: 1px;
        background-color: #515a6e;
      }
    }
  }

  .right-menu {
    float: right;
    display: flex;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #515a6e !important;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: if(
            $darkTheme,
            rgba(255, 255, 255, 0.1),
            rgba(0, 0, 0, 0.025)
          );
        }
      }
    }

    .version-btn-container {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      font-size: 20px;

      i {
        color: #515a6e;
        transition: all 0.3s;
      }

      &:hover i {
        color: #409eff;
        transform: scale(1.1);
      }

      .version-badge {
        ::v-deep .el-badge__content {
          background-color: #f56c6c;
        }
      }
    }

    .avatar-container {
      margin-right: 0;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        display: flex;
        align-items: center;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }
      }
    }
  }
}

.right-menu.external-menu {
  padding-right: 16px;

  .reload-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #409eff;
    padding: 6px 14px;
    margin-right: 24px;
    border-radius: 18px;

    i {
      margin-right: 4px;
      transition: transform 0.3s ease;
    }
  }
}

.logo-image {
  transition: filter 0.3s ease;
}

</style>
