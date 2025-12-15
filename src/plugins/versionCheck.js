/**
 * 版本检查插件
 * 仅在用户手动触发时才加载和检查版本
 */

import Vue from 'vue'

// 创建一个全局的版本检查实例
class VersionCheckService {
  constructor() {
    this.vm = null
    this.historyVm = null
    this.isChecking = false
    this.modulesLoaded = false
  }
  
  /**
   * 初始化服务（仅注册，不加载任何模块）
   */
  init() {
    console.log('✅ 版本检查服务已注册（手动触发模式）')
  }
  
  /**
   * 动态加载所需模块（仅在用户手动触发时调用）
   */
  async loadModules() {
    if (this.modulesLoaded) return
    
    console.log('📦 正在加载版本检查模块...')
    
    // 动态导入模块
    const [versionCheckerModule, VersionUpdateDialog, VersionHistoryDialog] = await Promise.all([
      import('@/utils/versionChecker'),
      import('@/components/VersionUpdateDialog.vue'),
      import('@/components/VersionHistoryDialog.vue')
    ])
    
    this.versionChecker = versionCheckerModule
    this.VersionUpdateDialog = VersionUpdateDialog.default
    this.VersionHistoryDialog = VersionHistoryDialog.default
    
    this.modulesLoaded = true
    console.log('✅ 版本检查模块加载完成')
  }
  
  /**
   * 创建弹窗组件（懒加载）
   */
  createDialogs() {
    if (this.vm) return
    
    const service = this
    const VersionUpdateDialog = this.VersionUpdateDialog
    const VersionHistoryDialog = this.VersionHistoryDialog
    
    // 创建更新弹窗
    const VersionCheckComponent = Vue.extend({
      data() {
        return {
          showDialog: false,
          versionInfo: null
        }
      },
      methods: {
        showUpdate(versionInfo) {
          this.versionInfo = versionInfo
          this.showDialog = true
        },
        hideDialog() {
          this.showDialog = false
        },
        handleConfirm(versionInfo) {
          console.log('✅ 用户已确认查看版本:', versionInfo.version)
          this.saveVersion(versionInfo)
          this.hideDialog()
        },
        handleClose() {
          console.log('⏭️ 用户稍后查看')
          if (this.versionInfo) {
            this.saveVersion(this.versionInfo)
          }
          this.hideDialog()
        },
        saveVersion(versionInfo) {
          try {
            const saveData = {
              version: versionInfo.version,
              date: versionInfo.date,
              system: versionInfo.system,
              updates: [],
              updateCount: 0
            }
            localStorage.setItem('app_latest_version', JSON.stringify(saveData))
            localStorage.setItem('app_version_last_check', Date.now().toString())
          } catch (error) {
            console.error('保存版本信息失败:', error)
          }
        },
        handleViewHistory() {
          this.hideDialog()
          setTimeout(() => service.openHistoryDialog(), 300)
        }
      },
      render(h) {
        return h(VersionUpdateDialog, {
          props: {
            visible: this.showDialog,
            versionInfo: this.versionInfo || {}
          },
          on: {
            'update:visible': (val) => { this.showDialog = val },
            confirm: this.handleConfirm,
            close: this.handleClose,
            'view-history': this.handleViewHistory
          }
        })
      }
    })
    
    const instance = new VersionCheckComponent()
    this.vm = instance.$mount()
    document.body.appendChild(this.vm.$el)
    
    // 创建历史记录弹窗
    const HistoryComponent = Vue.extend(VersionHistoryDialog)
    const historyInstance = new HistoryComponent()
    this.historyVm = historyInstance.$mount()
    document.body.appendChild(this.historyVm.$el)
  }
  
  /**
   * 打开历史记录弹窗
   */
  async openHistoryDialog() {
    await this.loadModules()
    this.createDialogs()
    
    if (this.historyVm && this.historyVm.open) {
      this.historyVm.open()
    }
  }
  
  /**
   * 手动检查更新（用户主动触发）
   */
  async manualCheck() {
    if (this.isChecking) {
      console.log('⏳ 版本检查进行中...')
      return
    }
    
    this.isChecking = true
    console.log('🔍 手动检查更新...')
    
    try {
      await this.loadModules()
      this.createDialogs()
      
      const newVersion = await this.versionChecker.checkUpdate(true)
      
      if (newVersion) {
        console.log('🎊 发现新版本:', newVersion.version)
        this.vm.showUpdate(newVersion)
      } else {
        console.log('✅ 当前已是最新版本')
        Vue.prototype.$message?.info('当前已是最新版本')
      }
    } catch (error) {
      console.error('❌ 版本检查失败:', error)
      Vue.prototype.$message?.error('版本检查失败，请稍后重试')
    } finally {
      this.isChecking = false
    }
  }
  
  /**
   * 切换为远程模式
   */
  async useRemote(url) {
    await this.loadModules()
    this.versionChecker.useRemoteExcel(url)
  }
  
  /**
   * 切换为本地模式
   */
  async useLocal() {
    await this.loadModules()
    this.versionChecker.useLocalExcel()
  }
  
  /**
   * 清除版本历史（用于测试）
   */
  async clearHistory() {
    await this.loadModules()
    this.versionChecker.clearVersionHistory()
  }
}

// 创建单例
const versionCheckService = new VersionCheckService()

// Vue 插件
export default {
  install(Vue) {
    // 初始化服务（仅注册）
    versionCheckService.init()
    
    // 挂载到 Vue 原型
    Vue.prototype.$versionCheck = versionCheckService
    
    // 挂载到全局
    window.$versionCheck = versionCheckService
    
    console.log('✅ 版本检查插件已安装（手动触发模式）')
  }
}

// 导出服务实例
export { versionCheckService }
