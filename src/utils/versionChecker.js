/**
 * 版本更新检查服务
 * 自动检测 Excel 版本号变化，弹窗提示用户
 */

import * as XLSX from 'xlsx'
import JSZip from 'jszip'

// 配置
const CONFIG = {
  // Excel 文件路径（可切换本地/远程）
  LOCAL_EXCEL_URL: '/static/迪太云变更履历表.xlsx',
  REMOTE_EXCEL_URL: '', // 后续配置远程地址，如：'https://your-domain.com/versions/changelog.xlsx'
  
  // 使用哪个源（'local' 或 'remote'）
  SOURCE: 'local',
  
  // 检查间隔（毫秒）
  CHECK_INTERVAL: 30 * 60 * 1000, // 30分钟
  
  // LocalStorage 键名
  STORAGE_KEY: 'app_latest_version',
  STORAGE_KEY_LAST_CHECK: 'app_version_last_check'
}

/**
 * 获取 Excel 文件 URL
 */
function getExcelUrl() {
  return CONFIG.SOURCE === 'remote' && CONFIG.REMOTE_EXCEL_URL
    ? CONFIG.REMOTE_EXCEL_URL
    : CONFIG.LOCAL_EXCEL_URL
}

/**
 * 切换为远程模式
 * @param {String} remoteUrl - 远程 Excel 文件地址
 */
export function useRemoteExcel(remoteUrl) {
  CONFIG.REMOTE_EXCEL_URL = remoteUrl
  CONFIG.SOURCE = 'remote'
  console.log('📡 已切换为远程模式:', remoteUrl)
}

/**
 * 切换为本地模式
 */
export function useLocalExcel() {
  CONFIG.SOURCE = 'local'
  console.log('💾 已切换为本地模式:', CONFIG.LOCAL_EXCEL_URL)
}

/**
 * 解析 Excel 获取最新版本信息（包含图片）
 */
async function parseLatestVersion(fileUrl) {
  try {
    console.log('📖 正在读取 Excel:', fileUrl)
    
    // 添加时间戳避免缓存
    const url = fileUrl.includes('?') 
      ? `${fileUrl}&_t=${Date.now()}` 
      : `${fileUrl}?_t=${Date.now()}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    
    // 1. 提取图片
    const images = await extractImagesFromExcel(arrayBuffer)
    console.log(`📸 提取到 ${images.length} 张图片`)
    
    // 2. 解析数据
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    
    // 收集所有版本
    const allVersions = []
    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      const versionNum = (row[0] || '').toString().trim()
      
      if (versionNum && versionNum.toLowerCase().startsWith('v')) {
        const date = (row[1] || '').toString().trim()
        const system = (row[2] || '').toString().trim()
        
        // 收集该版本的更新内容（带图片和系统名称）
        const updates = []
        let currentSystem = system // 记住当前系统名称
        
        // 先检查版本号所在行是否有更新内容
        const versionRowContent = (row[3] || '').toString().trim()
        if (versionRowContent) {
          const rowImages = images.filter(img => img.row === i + 1)
          updates.push({
            text: versionRowContent,
            images: rowImages.map(img => img.data),
            system: currentSystem
          })
        }
        
        // 然后遍历后续行
        for (let j = i + 1; j < data.length; j++) {
          const nextRow = data[j]
          const nextVersion = (nextRow[0] || '').toString().trim()
          
          // 遇到下一个版本号则停止
          if (nextVersion && nextVersion.toLowerCase().startsWith('v')) {
            break
          }
          
          // 检查是否有新的系统名称（合并单元格的第一行）
          const rowSystem = (nextRow[2] || '').toString().trim()
          if (rowSystem) {
            currentSystem = rowSystem
          }
          
          const content = (nextRow[3] || '').toString().trim()
          if (content) {
            // 查找该行对应的图片
            const rowImages = images.filter(img => img.row === j + 1)
            updates.push({
              text: content,
              images: rowImages.map(img => img.data),
              system: currentSystem // 为每条更新记录关联系统名称
            })
          }
        }
        
        allVersions.push({
          version: versionNum,
          date: date,
          system: system,
          updates: updates,
          updateCount: updates.length
        })
      }
    }
    
    if (allVersions.length === 0) {
      throw new Error('未找到版本信息')
    }
    
    // 按版本号从大到小排序，返回最大的版本
    allVersions.sort((a, b) => {
      const getVersionParts = (v) => {
        const match = v.version.match(/v?(\d+)\.(\d+)\.(\d+)/i)
        if (match) {
          return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
        }
        return [0, 0, 0]
      }
      
      const aParts = getVersionParts(a)
      const bParts = getVersionParts(b)
      
      for (let i = 0; i < 3; i++) {
        if (bParts[i] !== aParts[i]) {
          return bParts[i] - aParts[i] // 从大到小排序
        }
      }
      return 0
    })
    
    console.log('📋 所有版本:', allVersions.map(v => v.version))
    console.log('✅ 最新版本（版本号最大）:', allVersions[0].version)
    
    // 返回版本号最大的版本
    return allVersions[0]
    
  } catch (error) {
    console.error('❌ 解析版本失败:', error)
    throw error
  }
}

/**
 * 从 Excel 提取图片
 */
async function extractImagesFromExcel(arrayBuffer) {
  try {
    const zipContent = await JSZip.loadAsync(arrayBuffer)
    const images = []
    const imageFiles = []
    
    // 1. 收集所有图片文件
    zipContent.forEach((relativePath, file) => {
      if (relativePath.match(/xl\/media\//)) {
        imageFiles.push({ name: relativePath.split('/').pop(), file: file })
      }
    })
    
    // 2. 解析图片位置
    const positions = await parseDrawingXml(zipContent)
    
    // 3. 解析图片引用关系
    const refs = await parseDrawingRels(zipContent)
    
    // 4. 创建图片文件映射
    const imageFileMap = {}
    for (const img of imageFiles) {
      imageFileMap[img.name] = img
    }
    
    // 5. 关联图片
    for (const pos of positions) {
      const rId = pos.rId
      const imageName = refs[rId]
      
      if (imageName && imageFileMap[imageName]) {
        const imgFile = imageFileMap[imageName]
        const blob = await imgFile.file.async('blob')
        const dataUrl = await blobToDataUrl(blob)
        
        images.push({
          row: pos.row,
          col: pos.col,
          data: dataUrl
        })
      }
    }
    
    return images
  } catch (error) {
    console.warn('⚠️ 提取图片失败:', error)
    return []
  }
}

/**
 * 解析 drawing.xml 获取图片位置
 */
async function parseDrawingXml(zipContent) {
  try {
    const drawingFile = zipContent.file('xl/drawings/drawing1.xml')
    if (!drawingFile) return []
    
    const xmlText = await drawingFile.async('text')
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    
    const anchors = xmlDoc.getElementsByTagName('xdr:twoCellAnchor')
    const positions = []
    
    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i]
      const fromEl = anchor.getElementsByTagName('xdr:from')[0]
      
      if (fromEl) {
        const rowEl = fromEl.getElementsByTagName('xdr:row')[0]
        const colEl = fromEl.getElementsByTagName('xdr:col')[0]
        
        const blip = anchor.getElementsByTagName('a:blip')[0]
        const rId = blip ? blip.getAttribute('r:embed') : null
        
        if (rowEl && colEl && rId) {
          positions.push({
            row: parseInt(rowEl.textContent) + 1,
            col: parseInt(colEl.textContent),
            rId: rId
          })
        }
      }
    }
    
    return positions
  } catch (error) {
    return []
  }
}

/**
 * 解析 drawing.xml.rels 获取图片引用关系
 */
async function parseDrawingRels(zipContent) {
  try {
    const relsFile = zipContent.file('xl/drawings/_rels/drawing1.xml.rels')
    if (!relsFile) return {}
    
    const xmlText = await relsFile.async('text')
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    
    const relationships = xmlDoc.getElementsByTagName('Relationship')
    const refs = {}
    
    for (let i = 0; i < relationships.length; i++) {
      const rel = relationships[i]
      const id = rel.getAttribute('Id')
      const target = rel.getAttribute('Target')
      
      if (id && target) {
        const fileName = target.split('/').pop()
        refs[id] = fileName
      }
    }
    
    return refs
  } catch (error) {
    return {}
  }
}

/**
 * Blob 转 DataURL
 */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 比较版本号
 * @returns {Number} 1: v1 > v2, 0: v1 = v2, -1: v1 < v2
 */
function compareVersion(v1, v2) {
  // 移除 V 前缀并转为小写
  const ver1 = v1.toLowerCase().replace(/^v/, '').split('.')
  const ver2 = v2.toLowerCase().replace(/^v/, '').split('.')
  
  const maxLen = Math.max(ver1.length, ver2.length)
  
  for (let i = 0; i < maxLen; i++) {
    const num1 = parseInt(ver1[i] || 0)
    const num2 = parseInt(ver2[i] || 0)
    
    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }
  
  return 0
}

/**
 * 获取本地保存的最新版本
 */
function getStoredVersion() {
  try {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    return null
  }
}

/**
 * 保存最新版本到本地
 */
function saveStoredVersion(versionInfo) {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(versionInfo))
    localStorage.setItem(CONFIG.STORAGE_KEY_LAST_CHECK, Date.now().toString())
  } catch (error) {
    console.error('保存版本信息失败:', error)
  }
}

/**
 * 是否需要检查更新（基于时间间隔）
 */
function shouldCheck() {
  try {
    // 如果没有版本记录，必须检查
    const storedVersion = getStoredVersion()
    if (!storedVersion) {
      console.log('📌 首次使用，必须检查版本')
      return true
    }
    
    const lastCheck = localStorage.getItem(CONFIG.STORAGE_KEY_LAST_CHECK)
    if (!lastCheck) return true
    
    const elapsed = Date.now() - parseInt(lastCheck)
    return elapsed > CONFIG.CHECK_INTERVAL
  } catch (error) {
    return true
  }
}

/**
 * 检查版本更新
 * @param {Boolean} force - 强制检查（忽略时间间隔）
 * @returns {Object|null} 如果有新版本返回版本信息，否则返回 null
 */
export async function checkUpdate(force = false) {
  try {
    // 检查是否需要检查更新
    if (!force && !shouldCheck()) {
      console.log('⏭️ 距离上次检查时间过短，跳过本次检查')
      return null
    }
    
    console.log('🔍 开始检查版本更新...')
    
    // 获取 Excel 最新版本
    const latestVersion = await parseLatestVersion(getExcelUrl())
    console.log('📦 最新版本:', latestVersion.version)
    
    // 获取本地保存的版本
    const storedVersion = getStoredVersion()
    console.log('💾 本地版本:', storedVersion?.version || '无')
    
    // 第一次使用，弹出通知让用户知道当前版本
    if (!storedVersion) {
      console.log('🎉 首次使用，显示当前版本信息')
      // 标记为首次使用
      latestVersion.isFirstTime = true
      return latestVersion
    }
    
    // 比较版本号
    const comparison = compareVersion(latestVersion.version, storedVersion.version)
    
    if (comparison > 0) {
      // 有新版本
      console.log('🎊 发现新版本!')
      latestVersion.isFirstTime = false
      return latestVersion
    } else if (comparison === 0) {
      // 版本相同
      console.log('✅ 当前已是最新版本')
      saveStoredVersion(latestVersion) // 更新检查时间
      return null
    } else {
      // 本地版本更新（异常情况）
      console.warn('⚠️ 本地版本高于远程版本，可能是回滚')
      return null
    }
    
  } catch (error) {
    console.error('❌ 检查更新失败:', error)
    return null
  }
}

/**
 * 标记用户已查看新版本
 */
export function markVersionViewed(versionInfo) {
  saveStoredVersion(versionInfo)
  console.log('✅ 已标记版本为已查看:', versionInfo.version)
}

/**
 * 手动触发更新检查
 */
export async function manualCheck() {
  return await checkUpdate(true)
}

/**
 * 清除本地版本记录（用于测试）
 */
export function clearVersionHistory() {
  localStorage.removeItem(CONFIG.STORAGE_KEY)
  localStorage.removeItem(CONFIG.STORAGE_KEY_LAST_CHECK)
  console.log('🗑️ 已清除版本历史')
}

/**
 * 获取 Excel 文件 URL（供外部使用）
 */
export function getExcelFileUrl() {
  return getExcelUrl()
}

export default {
  checkUpdate,
  markVersionViewed,
  manualCheck,
  clearVersionHistory,
  useRemoteExcel,
  useLocalExcel,
  getExcelFileUrl
}
