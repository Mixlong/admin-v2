<template>
  <div class="login-wrapper">
    <div class="bg-wrapper">
      <div class="card-inner">
        <div class="left-wrapper">
          <h1 class="logo">
            <img src="@/assets/logo/logo.png" alt="" />
          </h1>
          <span class="title">迪太云</span>
        </div>
        <div class="right-wrapper">
          <!-- 密码登录表单 -->
          <el-form
            v-if="loginMode === 'password'"
            ref="loginRef"
            class="login-form"
            :model="loginForm"
            :rules="loginRules"
          >
            <div class="login-title">欢迎登录</div>
            <div class="login-subtitle">请输入账号密码继续</div>
            <el-form-item class="login-form-item" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="用户名"
                @keyup.enter="handleLogin"
              >
                <template #prefix
                  ><svg-icon icon-class="user" class="el-input__icon input-icon"
                /></template>
              </el-input>
            </el-form-item>
            <el-form-item class="login-form-item" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                show-password
                @keyup.enter="handleLogin"
              >
                <template #prefix
                  ><svg-icon icon-class="password" class="el-input__icon input-icon"
                /></template>
              </el-input>
            </el-form-item>
            <el-form-item class="login-form-item login-options">
              <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item class="login-form-item login-actions">
              <el-button
                :loading="loading"
                type="primary"
                class="login-button"
                @click.prevent="handleLogin"
              >
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 短信验证码登录表单 -->
          <el-form
            v-else
            ref="smsLoginRef"
            class="login-form"
            :model="smsLoginForm"
            :rules="smsLoginRules"
          >
            <div class="login-title">欢迎登录</div>
            <div class="login-subtitle">请选择管理员并输入验证码</div>
            <el-form-item class="login-form-item" prop="phone">
              <el-select
                v-model="smsLoginForm.phone"
                placeholder="请选择管理员"
                class="admin-select"
              >
                <template #prefix
                  ><svg-icon icon-class="user" class="el-input__icon input-icon"
                /></template>
                <el-option
                  v-for="item in dataList"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
            <el-form-item class="login-form-item" prop="code">
              <div class="code-input-wrapper">
                <el-input
                  v-model="smsLoginForm.code"
                  placeholder="请输入验证码"
                  maxlength="6"
                  @keyup.enter="handleLogin"
                >
                  <template #prefix
                    ><svg-icon icon-class="password" class="el-input__icon input-icon"
                  /></template>
                </el-input>
                <el-button
                  type="primary"
                  :disabled="smsCodeWaiting"
                  @click="getSmsCode"
                  class="get-code-btn-inline"
                >
                  {{ smsCodeTitle }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item class="login-form-item login-options">
              <el-checkbox v-model="smsLoginForm.rememberMe">记住选择</el-checkbox>
              <span class="switch-mode-link" @click="switchLoginMode">密码登录</span>
            </el-form-item>
            <el-form-item class="login-form-item login-actions">
              <el-button
                :loading="loading"
                type="primary"
                class="login-button"
                @click.prevent="handleLogin"
              >
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!--  底部  -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg, getSmsSend, getSmsVerify, getSmsUser } from '@/api/login'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { setToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'
import { useRoute, useRouter } from 'vue-router'
import { getCurrentInstance, ref, watch, computed, onUnmounted } from 'vue'

const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

// 登录模式：password 或 sms
const loginMode = ref('password')

// 登录表单
const loginForm = ref({
  username: import.meta.env.MODE === 'development' ? 'admin' : '',
  password: import.meta.env.MODE === 'development' ? 'admin123' : '',
  rememberMe: false,
  code: '',
  uuid: ''
})

const loginRules = {
  username: [{ required: true, trigger: 'blur', message: '用户名不能为空' }],
  password: [{ required: true, trigger: 'blur', message: '密码不能为空' }],
  code: [{ required: true, trigger: 'change', message: '验证码不能为空' }]
}

// 短信登录表单
const smsLoginForm = ref({
  phone: '',
  code: '',
  rememberMe: false
})

const smsLoginRules = {
  phone: [{ required: true, trigger: 'change', message: '请选择管理员' }],
  code: [{ required: true, trigger: 'blur', message: '请输入验证码' }]
}

// 短信验证码相关
const dataList = ref([])

const codeUrl = ref('')
const loading = ref(false)
const redirect = ref(undefined)

// 判断是否为开发环境
const isNODE_ENV = computed(() => {
  return import.meta.env.MODE === 'development'
})

const loginRef = ref(null)
const smsLoginRef = ref(null)

watch(
  route,
  newRoute => {
    redirect.value = newRoute.query && newRoute.query.redirect
  },
  { immediate: true }
)

// 登录处理
function handleLogin() {
  // 防止重复点击
  if (loading.value) {
    return
  }

  // 短信验证码登录
  if (loginMode.value === 'sms') {
    smsLoginRef.value.validate(valid => {
      if (valid) {
        loading.value = true
        
        // 短信验证需要传递 username、password、phone 和 code
        const data = {
          username: loginForm.value.username || '',
          password: loginForm.value.password || '',
          phone: smsLoginForm.value.phone,
          code: smsLoginForm.value.code
        }

        getSmsVerify(data)
          .then(res => {
            const { iamKey, iamValue, token } = res.data
            setToken(token)
            Cookies.set('iamKeys', iamKey, { expires: 30 })
            Cookies.set(iamKey, iamValue, { expires: 30 })
            
            // 记住选择的管理员
            if (smsLoginForm.value.rememberMe) {
              Cookies.set('smsPhone', smsLoginForm.value.phone, { expires: 30 })
              Cookies.set('rememberMe', smsLoginForm.value.rememberMe, { expires: 30 })
            } else {
              Cookies.remove('smsPhone')
              Cookies.remove('rememberMe')
            }
            
            router.push({ path: redirect.value || '/' })
          })
          .catch(() => {
            loading.value = false
          })
      }
    })
    return
  }

  // 密码登录
  loginRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set('username', loginForm.value.username, { expires: 30 })
        Cookies.set('password', encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set('rememberMe', loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }

      // 调用 action 的登录方法
      userStore
        .login(loginForm.value)
        .then(() => {
          router.push({ path: redirect.value || '/' })
        })
        .catch(err => {
          // 如果返回 40010 错误码，需要短信验证，切换到短信登录模式
          if (err === 40010) {
            loginMode.value = 'sms'
            getDictType()
            proxy.$message({
              type: 'warning',
              message: '需要短信验证，请使用短信登录'
            })
          }
          loading.value = false
          getCode()
        })
    }
  })
}

// 短信登录获取验证码
const smsCodeWaiting = ref(false)
const smsCodeTitle = ref('获取验证码')
const smsCodeTimer = ref(null)

function getSmsCode() {
  if (!smsLoginForm.value.phone) {
    proxy.$message({ type: 'error', message: '请选择管理员' })
    return
  }

  let holdTime = 60
  smsCodeWaiting.value = true
  smsCodeTitle.value = '重新获取(60)'

  smsCodeTimer.value = setInterval(() => {
    if (holdTime <= 0) {
      smsCodeWaiting.value = false
      smsCodeTitle.value = '获取验证码'
      clearInterval(smsCodeTimer.value)
      return
    }
    smsCodeTitle.value = '重新获取(' + --holdTime + ')'
  }, 1000)

  // 发送短信验证码需要传递 username、password 和 phone
  const data = {
    username: loginForm.value.username || '',
    password: loginForm.value.password || '',
    phone: smsLoginForm.value.phone
  }

  getSmsSend(data).then(() => {
    proxy.$message({
      showClose: true,
      message: '验证码已发送',
      type: 'success'
    })
  }).catch(() => {
    smsCodeWaiting.value = false
    smsCodeTitle.value = '获取验证码'
    clearInterval(smsCodeTimer.value)
  })
}

// 切换登录模式
function switchLoginMode() {
  loginMode.value = loginMode.value === 'password' ? 'sms' : 'password'
  loading.value = false
  
  // 切换到短信登录时，加载管理员列表
  if (loginMode.value === 'sms') {
    getDictType()
  }
}

// 校验验证码
function submitCode() {
  // 防止重复点击
  if (isCodeLoading.value) {
    return
  }

  codeFormRef.value.validate(valid => {
    if (valid) {
      isCodeLoading.value = true
      codeForm.value.username = loginForm.value.username
      codeForm.value.password = loginForm.value.password

      getSmsVerify(codeForm.value)
        .then(res => {
          const { iamKey, iamValue, token } = res.data
          setToken(token)
          Cookies.set('iamKeys', iamKey, { expires: 30 })
          Cookies.set(iamKey, iamValue, { expires: 30 })
          router.push({ path: redirect.value || '/' })
          // 登录成功后不重置 loading 状态，保持按钮禁用直到页面跳转完成
        })
        .catch(() => {
          // 只有失败时才重置 loading 状态
          isCodeLoading.value = false
        })
    }
  })
}

// 获取管理员列表
function getDictType() {
  getSmsUser().then(res => {
    dataList.value = res.data
  })
}

function getCode() {
  getCodeImg().then(res => {
    codeUrl.value = 'data:image/gif;base64,' + res.img
    loginForm.value.uuid = res.uuid
  })
}

function getCookie() {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (smsCodeTimer.value) {
    clearInterval(smsCodeTimer.value)
  }
})

getCookie()

// 恢复短信登录的记住选项
const smsPhone = Cookies.get('smsPhone')
if (smsPhone) {
  smsLoginForm.value.phone = smsPhone
  smsLoginForm.value.rememberMe = Boolean(Cookies.get('rememberMe'))
}
</script>

<style lang="scss" scoped>
.login-wrapper {
  position: fixed;
  inset: 0;
  width: 100%;
  min-height: 100vh;
  padding: 32px 16px 64px;
  background: linear-gradient(180deg, #007aff 0%, #dbeafe 45%, #f8fafc 100%);
  display: flex;
  flex-direction: row;
  z-index: 1;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.32) 1px, transparent 1px),
      radial-gradient(900px 520px at 20% 18%, rgba(255, 255, 255, 0.55), transparent 60%),
      radial-gradient(900px 520px at 86% 26%, rgba(0, 122, 255, 0.12), transparent 62%);
    background-size:
      22px 22px,
      auto,
      auto;
    background-position:
      0 0,
      center,
      center;
    pointer-events: none;
    z-index: 0;
  }
}

.bg-wrapper {
  width: min(980px, 94vw);
  height: clamp(420px, 62vh, 560px);
  z-index: 1;
  display: flex;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.16),
    0 8px 24px rgba(15, 23, 42, 0.08);
}

.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex: 1;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
}

.left-wrapper {
  display: flex;
  flex: 1;
  height: 100%;
  padding: 40px 32px;
  background: linear-gradient(145deg, rgba(0, 122, 255, 0.92), rgba(96, 165, 250, 0.86));
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 999px;
    opacity: 0.16;
    pointer-events: none;
  }

  &::before {
    width: 230px;
    height: 230px;
    top: -80px;
    left: -70px;
    background: rgba(255, 255, 255, 0.95);
  }

  &::after {
    width: 340px;
    height: 340px;
    bottom: -160px;
    right: -170px;
    background: rgba(255, 255, 255, 0.85);
  }

  .title {
    color: white;
    font-size: 40px;
    margin-top: 18px;
    letter-spacing: 2px;
    font-weight: 700;
    text-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
    z-index: 1;
  }

  .logo {
    margin: 0;
    z-index: 1;

    img {
      height: 56px;
      width: auto;
      margin: 0;
      pointer-events: none;
      filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.18));
    }
  }
}

.right-wrapper {
  flex: 1;
  height: 100%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  padding: 32px 36px;
}

.login-title {
  width: 100%;
  text-align: left;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #0f172a;
}

.login-subtitle {
  margin-top: 10px;
  margin-bottom: 28px;
  font-size: 14px;
  color: rgba(15, 23, 42, 0.62);
}

.login-form {
  width: min(360px, 100%);
  --el-input-height: 44px;
  --el-component-size: 44px;
  --el-border-radius-base: 10px;

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input) {
    width: 100%;
  }

  :deep(.el-input__wrapper) {
    height: var(--el-input-height);
    border-radius: 10px;
    box-shadow: none;
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(15, 23, 42, 0.1);
    padding: 0 14px;
    min-height: auto;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  :deep(.el-input__wrapper:hover) {
    border-color: rgba(0, 122, 255, 0.35);
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: rgba(0, 122, 255, 0.6);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.14);
  }

  :deep(.el-input__inner) {
    height: var(--el-input-height);
    line-height: var(--el-input-height);
    font-size: 15px;
    color: #0f172a;
  }

  :deep(.el-input__prefix) {
    color: rgba(15, 23, 42, 0.55);
    margin-right: 8px;
  }

  :deep(.el-input__prefix-inner) {
    display: flex;
    align-items: center;
  }

  :deep(.el-input__suffix-inner) {
    color: rgba(15, 23, 42, 0.45);
  }

  :deep(.el-form-item.is-error .el-input__wrapper) {
    border-color: rgba(239, 68, 68, 0.55);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
  }

  // 下拉框样式
  .admin-select {
    width: 100%;

    :deep(.el-select__wrapper) {
      height: var(--el-input-height);
      border-radius: 10px;
      box-shadow: none;
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(15, 23, 42, 0.1);
      padding: 0 14px;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;

      &:hover {
        border-color: rgba(0, 122, 255, 0.35);
      }

      &.is-focused {
        border-color: rgba(0, 122, 255, 0.6);
        box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.14);
      }
    }

    :deep(.el-select__placeholder) {
      font-size: 15px;
      color: rgba(15, 23, 42, 0.4);
    }

    :deep(.el-select__selected-item) {
      font-size: 15px;
      color: #0f172a;
    }
  }

  // 验证码输入框和按钮组合
  .code-input-wrapper {
    display: flex;
    gap: 10px;
    width: 100%;

    .el-input {
      flex: 1;
    }

    .get-code-btn-inline {
      height: var(--el-input-height);
      padding: 0 18px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
      background: linear-gradient(90deg, #007aff 0%, #3b82f6 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        box-shadow: 0 6px 16px rgba(0, 122, 255, 0.28);
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 122, 255, 0.18);
      }

      &:disabled {
        background: rgba(15, 23, 42, 0.12);
        color: rgba(15, 23, 42, 0.35);
        box-shadow: none;
        cursor: not-allowed;
      }
    }
  }
}

.input-icon {
  font-size: 18px;
  color: rgba(15, 23, 42, 0.55);
}

.login-form-item {
  margin-top: 0 !important;
}

.login-options {
  margin-top: 8px !important;
  margin-bottom: 24px !important;
  display: flex;
  justify-content: space-between;
  align-items: center;

  :deep(.el-checkbox) {
    user-select: none;
  }

  :deep(.el-checkbox__label) {
    color: rgba(15, 23, 42, 0.72);
    font-size: 14px;
  }
}

.switch-mode-link {
  font-size: 14px;
  color: #007aff;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;

  &:hover {
    color: #3b82f6;
    text-decoration: underline;
  }
}

.login-actions {
  margin-bottom: 0 !important;
}

.login-button {
  width: 100%;
  height: 44px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1px;
  border: none;
  background: linear-gradient(90deg, #007aff 0%, #3b82f6 55%, #60a5fa 100%) !important;
  box-shadow: 0 12px 28px rgba(0, 122, 255, 0.22);
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 14px 30px rgba(0, 122, 255, 0.24);
  }

  &:active {
    box-shadow: 0 10px 22px rgba(0, 122, 255, 0.18);
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: rgba(15, 23, 42, 0.6);
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
  z-index: 2;
  text-shadow: none;
}

@media screen and (max-width: 960px) {
  .card-inner {
    flex-direction: column;
    height: auto;
  }

  .bg-wrapper {
    height: auto;

    .right-wrapper {
      padding: 36px 22px;
    }
  }

  .left-wrapper {
    padding: 36px 24px;

    .title {
      font-size: 34px;
    }
  }
}

@media screen and (max-width: 420px) {
  .login-wrapper {
    padding: 28px 12px 64px;
  }

  .right-wrapper {
    padding: 30px 18px;
  }
}
</style>
