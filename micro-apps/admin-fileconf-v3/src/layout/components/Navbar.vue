<template>
  <div class="navbar-wrap-style">
    <Hamburger
      id="hamburger-container"
      :is-active="appStore.sidebar.opened"
      class="hamburger-container"
      @toggle-click="toggleSideBar"
    />

    <Breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    
    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <HeaderSearch id="header-search" class="right-menu-item" />

        <!-- 版本更新入口 -->
        <!-- <el-tooltip content="查看版本更新" placement="bottom">
          <div
            class="version-btn-container right-menu-item hover-effect"
            @click="openVersionHistory"
          >
            <el-icon><Bell /></el-icon>
            <el-badge v-if="hasNewVersion" is-dot class="version-badge" />
          </div>
        </el-tooltip> -->

        <!-- Windows版迪太云管理下载 -->
        <div @click="handleDownload" class="download-btn-container">
          <img
            src="@/assets/logo/desktop_on.png"
            class="download-icon"
            alt="下载"
          />
          <span class="download-text">迪大圣Windows版</span>
        </div>
      </template>

      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
        @command="handleCommand"
      >
        <div class="avatar-wrapper">
          <img :src="userStore.avatar" class="user-avatar" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/user/profile">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided command="logout">
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="user-info padding-right-xs">
        <span class="user-name">{{ userStore.nickName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElLoading, ElMessage } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import HeaderSearch from '@/components/HeaderSearch'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'

const appStore = useAppStore()
const userStore = useUserStore()

const hasNewVersion = ref(false)

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case 'logout':
      logout()
      break
    default:
      break
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      userStore.logOut().then(() => {
        location.href = '/index'
      })
    })
    .catch(() => {})
}

// 打开版本历史
function openVersionHistory() {
  // 点击后隐藏红点
  hasNewVersion.value = false
  
  // 在 sessionStorage 中添加已查看标记
  try {
    const stored = localStorage.getItem('app_latest_version')
    if (stored) {
      const storedInfo = JSON.parse(stored)
      const sessionKey = `version_shown_${storedInfo.version}`
      sessionStorage.setItem(sessionKey, 'true')
    }
  } catch (error) {
    console.log('设置版本已查看标记失败:', error)
  }
  
  ElMessage.info('版本历史功能开发中')
}

// 检查是否有新版本
function checkNewVersionStatus() {
  try {
    const stored = localStorage.getItem('app_latest_version')
    if (stored) {
      const storedInfo = JSON.parse(stored)
      const sessionKey = `version_shown_${storedInfo.version}`
      if (!sessionStorage.getItem(sessionKey)) {
        hasNewVersion.value = true
      }
    }
  } catch (error) {
    console.log('检查新版本状态失败:', error)
  }
}

// 检测操作系统
function detectOS() {
  const userAgent = window.navigator.userAgent.toLowerCase()
  const platform = window.navigator.platform.toLowerCase()

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac'
  } else if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows'
  }
  return 'windows'
}

// 下载桌面版
async function handleDownload() {
  try {
    const os = detectOS()
    const osText = os === 'mac' ? 'Mac' : 'Windows'

    const loading = ElLoading.service({
      lock: true,
      text: `正在获取${osText}版本...`,
      background: 'rgba(0, 0, 0, 0.7)'
    })

    try {
      const timestamp = new Date().getTime()
      let ymlUrl = ''
      if (os === 'mac') {
        ymlUrl = `https://digiwise-web.oss-eu-central-1.aliyuncs.com/file/updates/latest-mac.yml?t=${timestamp}`
      } else {
        ymlUrl = `https://digiwise-web.oss-eu-central-1.aliyuncs.com/file/updates/latest.yml?t=${timestamp}`
      }

      const response = await fetch(ymlUrl)

      if (!response.ok) {
        throw new Error('获取版本信息失败')
      }

      const ymlText = await response.text()

      const urlMatch = ymlText.match(/url:\s*(\S+)/)
      const versionMatch = ymlText.match(/version:\s*(\S+)/)

      const defaultFileName = os === 'mac' ? 'DigiSmart-1.0.3.dmg' : 'DigiSmart-Setup-1.0.3.exe'
      let fileName = urlMatch ? urlMatch[1] : defaultFileName
      const version = versionMatch ? versionMatch[1] : ''

      if (os === 'mac' && fileName.endsWith('.zip')) {
        fileName = fileName.replace(/\.zip$/, '.dmg')
      }

      const downloadUrl = `https://digiwise-web.oss-eu-central-1.aliyuncs.com/file/updates/${fileName}`

      loading.close()

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      ElMessage.success(`开始下载${osText}版 ${version}`)
    } catch (fetchError) {
      loading.close()
      console.error('获取版本信息失败:', fetchError)
      ElMessage.warning('无法获取最新版本信息，请联系管理员')
    }
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  }
}

onMounted(() => {
  checkNewVersionStatus()
})
</script>

<style lang="scss" scoped>
.navbar-wrap-style {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: transparent !important;
  color: #515a6e !important;
  box-shadow: none !important;
  border: none !important;

  .hamburger-container {
    display: flex;
    align-items: center;
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;
  }

  .breadcrumb-container {
    float: left;
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
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .version-btn-container {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      font-size: 20px;

      .el-icon {
        color: #515a6e;
        transition: all 0.3s;
      }

      &:hover .el-icon {
        color: #409eff;
        transform: scale(1.1);
      }

      .version-badge {
        position: absolute;
        top: 12px;
        right: 4px;
      }
    }

    .download-btn-container {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0px 12px;
      margin: 5px 8px;
      margin-top: 10px;
      height: auto;
      background: rgb(56, 128, 246);
      border-radius: 16px;
      text-decoration: none;
      color: #fff !important;
      font-size: 13px;
      font-weight: normal;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 1px solid rgb(56, 128, 246);
      height: 35px;
      line-height: 35px;
      position: relative;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        transform: skewX(-25deg);
        animation: shine 4s ease-in-out infinite;
      }

      &:hover {
        background: rgba(56, 128, 246, 0.85);
        border-color: rgba(56, 128, 246, 0.85);
      }

      &:active {
        background: rgba(56, 128, 246, 0.7);
        border-color: rgba(56, 128, 246, 0.7);
      }

      .download-icon {
        width: 18px;
        height: 18px;
        object-fit: contain;
        position: relative;
        z-index: 1;
      }

      .download-text {
        color: #fff;
        white-space: nowrap;
        line-height: 1;
        position: relative;
        z-index: 1;
      }
    }

    @keyframes shine {
      0% {
        left: -100%;
      }
      50% {
        left: 100%;
      }
      100% {
        left: 100%;
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
</style>
