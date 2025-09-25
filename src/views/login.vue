<template>
  <div class="login-wrapper" style="overflow: hidden">
    <div class="bg-wrapper">
      <div class="left-wrapper">
        <!-- id="text3d" -->
        <h1 class="logo">
          <img src="@/assets/logo/logo.png" alt="" />
        </h1>
        <span class="title">迪太云</span>
      </div>
      <div class="right-wrapper">
        <el-form :model="loginForm" :rules="loginRules" ref="loginForm">
          <div class="login-title">欢迎登录</div>
          <el-form-item style="margin-top: 20px" prop="username">
            <el-input v-model="loginForm.username" size="large" style="width: 300px" placeholder="用户名"
              prefix-icon="el-icon-user" @keyup.enter.native="handleLogin"></el-input>
          </el-form-item>
          <el-form-item style="margin-top: 20px" prop="password">
            <el-input show-password v-model="loginForm.password" size="large" style="width: 300px" type="password"
              placeholder="密码" prefix-icon="el-icon-lock" @keyup.enter.native="handleLogin"></el-input>
          </el-form-item>
          <el-form-item style="margin-top: 30px">
            <el-button :loading="loading" type="primary" style="width: 100%; padding: 12px 20px"
              @click.native.prevent="handleLogin">
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 验证码 -->
    <el-dialog title="验证码" :visible.sync="isCodeDiag" width="470px" center append-to-body :close-on-click-modal="false">
      <el-form :model="codeForm" ref="codeForm" :inline="true" label-width="92px" label-position="left"
        @submit.native.prevent="submitCode">
        <el-form-item label="选择管理员" style="min-width: 150px" prop="phone" :rules="[
          {
            required: true,
            message: '请选择接收验证码用户',
            trigger: 'change',
          },
        ]">
          <el-radio-group v-model="codeForm.phone">
            <el-radio :label="item.dictValue" v-for="(item, index) in dataList" :key="index">{{ item.dictLabel
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="验证码" prop="code" :rules="[
          { required: true, message: '请输入验证码', trigger: 'change' },
        ]">
          <el-input size="small" clearable v-model="codeForm.code" placeholder="请输入验证码"></el-input>
        </el-form-item>
        <el-form-item v-if="isNODE_ENV">
          <el-button size="small" type="primary" :disabled="getSmsCodeisWaiting" @click="getCodeVal">
            {{ codeValTitle }}
          </el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="isCodeLoading" @click="submitCode">
          确 定
        </el-button>
        <el-button @click="isCodeDiag = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getCodeImg, getSmsSend, getSmsVerify, getSmsUser } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import { setToken } from "@/utils/auth";
import { mapGetters } from "vuex";

export default {
  name: "Login",
  data() {
    return {
      dataList: [],
      isCodeDiag: false,
      codeUrl: "",
      cookiePassword: "",
      getSmsCodeisWaiting: false,
      codeValTitle: "获取验证码",
      codeTimeEr: null,
      codeForm: {
        code: "",
        phone: "",
      },
      loginForm: {
        username: "",
        password: "",
        rememberMe: false,
        code: "",
        uuid: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "用户名不能为空" },
        ],
        password: [
          { required: true, trigger: "blur", message: "密码不能为空" },
        ],
        code: [
          { required: true, trigger: "change", message: "验证码不能为空" },
        ],
      },
      loading: false,
      isCodeLoading: false,
      redirect: undefined,
    };
  },
  computed: {
    ...mapGetters(["isNODE_ENV"]),
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route?.query?.redirect;
      },
      immediate: true,
    },
  },
  created() {
    this.getCookie();
  },
  mounted: function () {
    window.onresize = () => {
      const windowWidth = document.body.clientWidth;
      const windowHeight = document.documentElement.clientHeight;

      const windowAspectRatio = windowHeight / windowWidth;
      let videoWidth;
      let videoHeight;

      if (windowAspectRatio < 0.5625) {
        videoWidth = windowWidth;
        videoHeight = videoWidth * 0.5625;
        this.fixStyle = {
          height: windowWidth * 0.5625 + "px",
          width: windowWidth + "px",
          "margin-bottom": (windowHeight - videoHeight) / 2 + "px",
          "margin-left": "initial",
        };
      } else {
        videoHeight = windowHeight;
        videoWidth = videoHeight / 0.5625;
        this.fixStyle = {
          height: windowHeight + "px",
          width: windowHeight / 0.5625 + "px",
          "margin-left": (windowWidth - videoWidth) / 2 + "px",
          "margin-bottom": "initial",
        };
      }
    };
    window.onresize();
  },
  destroyed() {
    clearInterval(this.codeTimeEr);
  },
  methods: {
    getCode() {
      getCodeImg().then((res) => {
        this.codeUrl = "data:image/gif;base64," + res.img;
        this.loginForm.uuid = res.uuid;
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberMe");
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password:
          password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), {
              expires: 30,
            });
            Cookies.set("rememberMe", this.loginForm.rememberMe, {
              expires: 30,
            });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberMe");
          }
          this.$store
            .dispatch("Login", this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" });
            })
            .catch((err) => {
              if (err === 40010) {
                this.resetForm("codeForm");
                this.isCodeDiag = true;
                this.getDictType();
              }
              this.loading = false;
              this.getCode();
            });
        }
      });
    },
    // 获取验证码
    getCodeVal() {
      if (!this.codeForm.phone) {
        this.$message({ type: "error", message: "请选择接收验证码用户" });
        return;
      }
      let holdTime = 60;
      this.getSmsCodeisWaiting = true;
      this.codeValTitle = "重新获取(60)";
      this.codeTimeEr = setInterval(() => {
        if (holdTime <= 0) {
          this.getSmsCodeisWaiting = false;
          this.codeValTitle = "获取验证码";
          clearInterval(this.codeTimeEr);
          return;
        }
        this.codeValTitle = "重新获取(" + --holdTime + ")";
      }, 1000);
      const data = {
        username: this.loginForm.username,
        password: this.loginForm.password,
        phone: this.codeForm.phone,
      };
      getSmsSend(data).then(() => {
        this.$message({
          showClose: true,
          message: "请向管理员要验证码",
          type: "success",
        });
      });
    },
    // 校验验证码
    submitCode() {
      this.$refs.codeForm.validate((valid) => {
        if (valid) {
          this.isCodeLoading = true;
          this.codeForm.username = this.loginForm.username;
          this.codeForm.password = this.loginForm.password;

          getSmsVerify(this.codeForm)
            .then((res) => {
              const { iamKey, iamValue, token, username } = res.data;
              setToken(token);
              Cookies.set("iamKeys", iamKey, { expires: 30 });
              Cookies.set(iamKey, iamValue, { expires: 30 });
              this.$router.push({ path: this.redirect || "/" });
            })
            .finally(() => {
              this.isCodeLoading = false;
            });
        }
      });
    },
    getDictType() {
      getSmsUser().then((res) => {
        this.dataList = res.data;
      });
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scope>

.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  video {
    width: 100%;
    height: 100%;
  }
}

.login-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url("../assets/image/login-background.jpg");
  background-size: cover;
  display: flex;
  flex-direction: row;
  z-index: 1;
  justify-content: center;
  align-items: center;
}

.bg-wrapper {
  width: 60%;
  height: 58%;
  z-index: 9999;
  opacity: 0.95;
  display: flex;
  flex-direction: row;
  box-shadow: 0 12px 32px 4px rgba(0, 0, 0, 0.04),
    0 8px 20px rgba(0, 0, 0, 0.08);
}

.left-wrapper {
  display: flex;
  flex: 1;
  background-color: #6190e8;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .title {
    color: white;
    font-size: 38px;
    margin-top: 30px;
  }

  .logo {
    margin: 0;

    img {
      height: 50px;
      width: auto;
      margin: 0;
      user-drag: none;
      -webkit-user-drag: none;
      pointer-events: none;
    }
  }
}

.right-wrapper {
  flex: 1;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  position: relative;

}

.login-title {
  width: 300px;
  text-align: center;
  font-size: 30px;
  margin-bottom: 40px;
}

#text3d {
  img {
    width: 100%;
    height: 100%;
  }

  width: 100%;
  margin: 0 auto 0 auto;
  font-family: "Lato",
  sans-serif;

  font-size: 3rem;

  text-align: center;
  text-transform: uppercase;
  text-rendering: optimizeLegibility;
}

/*	
============
	Light
============
*/
#text3d::before {
  content: "";
  width: 100%;

  position: absolute;
  top: -200px;
  left: 10px;
  transform: rotate(55deg);
  background: rgba(206, 188, 155, 0.7);
  background: -moz-linear-gradient(left,
      rgba(206, 188, 155, 0.7) 0%,
      rgba(42, 31, 25, 0) 65%);
  background: -webkit-gradient(left top,
      right top,
      color-stop(0%, rgba(206, 188, 155, 0.7)),
      color-stop(65%, rgba(42, 31, 25, 0)));
  background: -webkit-linear-gradient(left,
      rgba(206, 188, 155, 0.7) 0%,
      rgba(42, 31, 25, 0) 65%);
  background: -o-linear-gradient(left,
      rgba(206, 188, 155, 0.7) 0%,
      rgba(42, 31, 25, 0) 65%);
  background: -ms-linear-gradient(left,
      rgba(206, 188, 155, 0.7) 0%,
      rgba(42, 31, 25, 0) 65%);
  background: linear-gradient(to right,
      rgba(206, 188, 155, 0.7) 0%,
      rgba(42, 31, 25, 0) 65%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#cebc9b', endColorstr='#2a1f19', GradientType=0.7);
}

/*	
========================
			3D Effect
========================
*/
#text3d {
  color: #70869d;
  letter-spacing: 0.15em;
  text-shadow: -1px -1px 1px #efede3, 0px 1px 0 #2e2e2e, 0px 2px 0 #2c2c2c,
    0px 3px 0 #2a2a2a, 0px 4px 0 #282828, 0px 5px 0 #262626, 0px 6px 0 #242424,
    0px 7px 0 #222, 0px 8px 0 #202020, 0px 9px 0 #1e1e1e, 0px 10px 0 #1c1c1c,
    0px 11px 0 #1a1a1a, 0px 12px 0 #181818, 0px 13px 0 #161616,
    0px 14px 0 #141414, 0px 15px 0 #121212, 2px 20px 5px rgba(0, 0, 0, 0.9),
    5px 23px 5px rgba(0, 0, 0, 0.3), 8px 27px 8px rgba(0, 0, 0, 0.5),
    8px 28px 35px rgba(0, 0, 0, 0.9);
}

@media screen and (max-width: 1200px) {
  .bg-wrapper {
    flex-direction: column;
    min-width: 450px;

    .right-wrapper {
      padding-top: 30px;
    }
  }
}
</style>
