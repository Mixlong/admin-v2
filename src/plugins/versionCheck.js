/**
 * 版本检查插件
 * 自动在应用启动时检查版本更新
 */

import Vue from 'vue'
import { checkUpdate, manualCheck, useRemoteExcel, useLocalExcel, clearVersionHistory } from '@/utils/versionChecker'
import VersionUpdateDialog from '@/components/VersionUpdateDialog.vue'
import VersionHistoryDialog from '@/components/VersionHistoryDialog.vue'

// 创建一个全局的版本检查实例
class VersionCheckService {
  constructor() {
    this.vm = null
    this.historyVm = null
    this.timer = null
    this.isChecking = false
  }
  
  /**
   * 初始化版本检查服务
   */
  init() {
    if (this.vm) {
      console.warn('版本检查服务已初始化')  
      return
    }
    
    // 保存服务实例的引用
    const service = this
    
    // 创建一个 Vue 实例来管理弹窗
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
          // 保存版本信息
          this.saveVersion(versionInfo)
          this.hideDialog()
        },
        
        handleClose() {
          console.log('⏭️ 用户稍后查看')
          // 也保存版本信息，避免重复提示
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
            console.log('💾 已保存版本信息:', versionInfo.version)
          } catch (error) {
            console.error('保存版本信息失败:', error)
          }
        },
        
        handleViewHistory() {
          console.log('📖 打开完整版本历史')
          this.hideDialog()
          // 通过服务实例打开历史记录弹窗
          setTimeout(() => {
            service.openHistoryDialog()
          }, 300)
        }
      },
      
      render(h) {
        return h(VersionUpdateDialog, {
          props: {
            visible: this.showDialog,
            versionInfo: this.versionInfo || {}
          },
          on: {
            'update:visible': (val) => {
              this.showDialog = val
            },
            confirm: this.handleConfirm,
            close: this.handleClose,
            'view-history': this.handleViewHistory
          }
        })
      }
    })
    
    // 挂载到 body
    const instance = new VersionCheckComponent()
    const vm = instance.$mount()
    document.body.appendChild(vm.$el)
    
    this.vm = vm
    
    // 创建历史记录弹窗实例
    const HistoryComponent = Vue.extend(VersionHistoryDialog)
    const historyInstance = new HistoryComponent()
    const historyVm = historyInstance.$mount()
    document.body.appendChild(historyVm.$el)
    
    this.historyVm = historyVm
    
    console.log('✅ 版本检查服务已初始化')
  }
  
  /**
   * 打开历史记录弹窗
   */
  openHistoryDialog() {
    console.log('🔍 尝试打开历史记录弹窗')
    console.log('historyVm:', this.historyVm)
    console.log('historyVm.open:', this.historyVm?.open)
    
    if (this.historyVm && this.historyVm.open) {
      console.log('✅ 调用 historyVm.open()')
      this.historyVm.open()
    } else {
      console.error('❌ historyVm 或 open 方法不存在')
    }
  }
  
  /**
   * 执行版本检查（完全异步，不阻塞主线程）
   */
  async check(force = false) {
    if (this.isChecking) {
      console.log('⏳ 版本检查进行中...')
      return Promise.resolve()
    }
    
    this.isChecking = true
    
    // 使用 Promise 包装，确保异步执行
    return new Promise((resolve) => {
      // 使用 setTimeout 确保不阻塞主线程
      setTimeout(async () => {
        try {
          const newVersion = await checkUpdate(force)
          
          if (newVersion) {
            console.log('🎊 发现新版本，显示更新弹窗')
            // 弹窗显示也是异步的
            this.vm.showUpdate(newVersion)
          } else {
            console.log('✅ 当前已是最新版本')
          }
          resolve()
        } catch (error) {
          console.error('❌ 版本检查失败:', error)
          resolve()
        } finally {
          this.isChecking = false
        }
      }, 0)
    })
  }
  
  /**
   * 手动检查更新
   */
  async manualCheck() {
    console.log('🔍 手动检查更新...')
    return await this.check(true)
  }
  
  /**
   * 启动自动检查（定时检查）
   * @param {Number} interval - 检查间隔（毫秒），默认30分钟
   * @param {Boolean} checkNow - 是否立即检查，默认false（等待登录后触发）
   */
  startAutoCheck(interval = 30 * 60 * 1000, checkNow = false) {
    if (this.timer) {
      console.warn('自动检查已启动')
      return
    }
    
    console.log(`⏰ 启动自动检查，间隔: ${interval / 1000 / 60} 分钟`)
    
    // 只有明确指定 checkNow 为 true 时才立即检查
    // 否则等待登录成功后手动触发
    if (checkNow) {
      setTimeout(() => {
        this.check(true).catch(err => {
          console.error('自动检查失败:', err)
        })
      }, 1000)
    } else {
      console.log('⏳ 等待登录成功后触发版本检查')
    }
    
    // 定时检查
    this.timer = setInterval(() => {
      this.check().catch(err => {
        console.error('定时检查失败:', err)
      })
    }, interval)
  }
  
  /**
   * 停止自动检查
   */
  stopAutoCheck() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      console.log('⏹️ 已停止自动检查')
    }
  }
  
  /**
   * 切换为远程模式
   */
  useRemote(url) {
    useRemoteExcel(url)
  }
  
  /**
   * 切换为本地模式
   */
  useLocal() {
    useLocalExcel()
  }
  
  /**
   * 清除版本历史（用于测试）
   */
  clearHistory() {
    clearVersionHistory()
  }
}

// 创建单例
const versionCheckService = new VersionCheckService()

// Vue 插件
export default {
  install(Vue, options = {}) {
    // 初始化服务
    versionCheckService.init()
    
    // 挂载到 Vue 原型
    Vue.prototype.$versionCheck = versionCheckService
    
    // 挂载到全局
    window.$versionCheck = versionCheckService
    
    // 根据配置启动自动检查
    if (options.autoCheck !== false) {
      const interval = options.interval || 30 * 60 * 1000 // 默认30分钟
      versionCheckService.startAutoCheck(interval)
    }
    
    console.log('✅ 版本检查插件已安装')
  }
}

// 导出服务实例
export { versionCheckService }
