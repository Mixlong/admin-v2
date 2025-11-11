<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="📚 版本更新历史"
    width="1300px"
    :close-on-click-modal="false"
    append-to-body
    custom-class="version-history-dialog"
    top="0vh"
  >
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-tag type="success" effect="plain">
          当前版本：{{ currentVersion }}
        </el-tag>
        <span class="version-count">共 {{ versions.length }} 个版本</span>
      </div>
      <div class="toolbar-right">
        <el-button 
          type="primary" 
          icon="el-icon-refresh" 
          size="small"
          :loading="loading"
          @click="refreshVersions"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 版本列表 -->
    <div v-loading="loading" class="version-content-wrapper">
      <!-- 左侧版本导航 -->
      <div class="version-nav">
        <div class="nav-title">版本列表</div>
        <div class="nav-list">
          <div
            v-for="(version, index) in versions"
            :key="version.version"
            :class="['nav-item', { active: activeVersion === version.version }]"
            @click="scrollToVersion(version.version)"
          >
            <div class="nav-version">
              <span class="version-num">{{ version.version }}</span>
              <el-tag v-if="index === 0" type="danger" size="mini" effect="plain" style="margin-left:5px;">最新</el-tag>
            </div>
            <div class="nav-date">{{ version.date }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧版本详情 -->
      <div class="version-list-container">
        <el-timeline v-if="versionsWithGroupedUpdates.length > 0">
          <el-timeline-item
            v-for="(version, index) in versionsWithGroupedUpdates"
            :key="version.version"
            :ref="`version-${version.version}`"
            :type="index === 0 ? 'primary' : 'info'"
            placement="top"
          >
          <el-card :class="{ 'latest-version': index === 0 }">
            <!-- 版本头部：版本号、日期和更新内容标题 -->
            <div class="version-header">
              <div class="version-info">
                <div class="version-tag-wrapper">
                  <span class="version-number" :class="{ 'is-latest': index === 0 }">
                    {{ version.version }}
                  </span>
                  <el-tag 
                    v-if="index === 0" 
                    type="danger" 
                    size="mini" 
                    effect="plain"
                  >
                    最新
                  </el-tag>
                </div>
                <div v-if="version.date" class="version-date">
                  <i class="el-icon-time"></i>
                  <span>{{ version.date }}</span>
                </div>
              </div>
              <div v-if="version.items && version.items.length > 0" class="content-title">
                <i class="el-icon-document"></i>
                更新内容
                <el-tag type="primary" size="mini" effect="plain">
                  {{ version.updateCount }} 项
                </el-tag>
              </div>
            </div>
            
            <el-divider></el-divider>
            <!-- 更新内容列表 -->
            <div v-if="version.groupedItems && version.groupedItems.length > 0" class="update-content">
              <!-- 按系统分组显示 -->
              <div
                v-for="(group, groupIdx) in version.groupedItems"
                :key="groupIdx"
                class="system-group"
              >
                <!-- 系统名称标题 -->
                <div class="system-title">
                  <i class="el-icon-menu"></i>
                  <span>{{ group.system }}</span>
                  <span class="update-count">({{ group.items.length }}项)</span>
                </div>
                
                <!-- 该系统下的更新列表 -->
                <div class="system-updates">
                  <!-- 更新项列表（带图片） -->
                  <div 
                    v-for="(item, idx) in group.items" 
                    :key="idx"
                    class="update-item-wrapper"
                  >
                    <!-- 更新文字 -->
                    <div class="update-text-row">
                      <span class="item-text">{{ item.content }}</span>
                    </div>
                    
                    <!-- 对应的图片 -->
                    <div v-if="item.images && item.images.length > 0" class="update-images">
                      <el-image
                        v-for="(img, imgIdx) in item.images"
                        :key="imgIdx"
                        :src="img"
                        :preview-src-list="item.images"
                        fit="cover"
                        class="update-image"
                        :class="{ 'multi-image': item.images.length > 1 }"
                      >
                        <div slot="error" class="image-error">
                          <i class="el-icon-picture-outline"></i>
                        </div>
                      </el-image>
                      
                      <!-- 多图提示 -->
                      <div v-if="item.images.length > 1" class="image-count-tip">
                        共 {{ item.images.length }} 张截图
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="no-content">
              <i class="el-icon-info"></i>
              暂无更新说明
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- 空状态 -->
      <el-empty v-else description="暂无版本信息" :image-size="120"></el-empty>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import * as XLSX from 'xlsx'
import JSZip from 'jszip'

export default {
  name: 'VersionHistoryDialog',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      versions: [],
      currentVersion: '',
      extractedImages: [], // 提取的图片
      activeVersion: '' // 当前激活的版本
    }
  },
  computed: {
    /**
     * 为每个版本的更新内容按系统分组
     */
    versionsWithGroupedUpdates() {
      return this.versions.map(version => {
        if (!version.items || version.items.length === 0) {
          return { ...version, groupedItems: [] }
        }
        
        // 按系统分组
        const groups = {}
        version.items.forEach(item => {
          const systemName = item.system || '其他'
          if (!groups[systemName]) {
            groups[systemName] = []
          }
          groups[systemName].push(item)
        })
        
        // 转换为数组格式
        const groupedItems = Object.keys(groups).map(systemName => ({
          system: systemName,
          items: groups[systemName]
        }))
        
        return {
          ...version,
          groupedItems
        }
      })
    }
  },
  beforeDestroy() {
    // 组件销毁前移除滚动监听
    this.removeScrollListener()
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        // 对话框关闭时移除滚动监听
        this.removeScrollListener()
      }
    }
  },
  methods: {
    /**
     * 计算全局索引（跨分组的连续序号）
     */
    getGlobalIndex(version, groupIndex, itemIndex) {
      let globalIndex = 1
      for (let i = 0; i < groupIndex; i++) {
        globalIndex += version.groupedItems[i].items.length
      }
      return globalIndex + itemIndex
    },
    
    /**
     * 打开弹窗
     */
    async open() {
      this.dialogVisible = true
      if (this.versions.length === 0) {
        await this.loadVersions()
      }
      
      // 添加滚动监听
      this.$nextTick(() => {
        this.addScrollListener()
      })
    },
    
    /**
     * 添加滚动监听
     */
    addScrollListener() {
      const container = document.querySelector('.version-list-container')
      if (container) {
        container.addEventListener('scroll', this.handleScroll)
      }
    },
    
    /**
     * 移除滚动监听
     */
    removeScrollListener() {
      const container = document.querySelector('.version-list-container')
      if (container) {
        container.removeEventListener('scroll', this.handleScroll)
      }
    },
    
    /**
     * 处理滚动事件
     */
    handleScroll() {
      const container = document.querySelector('.version-list-container')
      if (!container) return
      
      const scrollTop = container.scrollTop
      const containerTop = container.getBoundingClientRect().top
      
      // 遍历所有版本，找到当前可见的版本
      for (let i = 0; i < this.versions.length; i++) {
        const version = this.versions[i]
        const refName = `version-${version.version}`
        const element = this.$refs[refName]
        
        if (element && element[0]) {
          const targetElement = element[0].$el
          const elementTop = targetElement.getBoundingClientRect().top
          const elementBottom = targetElement.getBoundingClientRect().bottom
          
          // 检查元素是否在视口内
          if (elementTop <= containerTop + 100 && elementBottom >= containerTop) {
            this.activeVersion = version.version
            break
          }
        }
      }
    },

    /**
     * 从 Excel 提取图片（使用精确位置解析）
     */
    async extractImages(arrayBuffer) {
      try {
        console.log('🖼️ 开始提取 Excel 中的图片...')
        
        const zipContent = await JSZip.loadAsync(arrayBuffer)
        const images = []
        const imageFiles = []
        
        // 1. 收集所有图片文件
        zipContent.forEach((relativePath, file) => {
          if (relativePath.match(/xl\/media\//)) {
            imageFiles.push({ name: relativePath.split('/').pop(), file: file })
          }
        })
        
        console.log(`📸 找到 ${imageFiles.length} 张图片`)
        
        // 2. 解析图片位置
        const positions = await this.parseDrawingXml(zipContent)
        console.log(`📍 解析到 ${positions.length} 个图片位置`)
        
        // 3. 解析图片引用关系
        const refs = await this.parseDrawingRels(zipContent)
        console.log(`🔗 解析到 ${Object.keys(refs).length} 个引用关系`)
        
        // 4. 创建图片文件映射
        const imageFileMap = {}
        imageFiles.forEach(img => {
          imageFileMap[img.name] = img
        })
        
        // 5. 关联图片
        for (const position of positions) {
          try {
            if (!position.rId || !refs[position.rId]) {
              continue
            }
            
            const imageName = refs[position.rId]
            if (!imageFileMap[imageName]) {
              continue
            }
            
            const imageFile = imageFileMap[imageName]
            const blob = await imageFile.file.async('blob')
            const base64 = await this.blobToBase64(blob)
            const ext = imageName.split('.').pop().toLowerCase()
            const mimeType = this.getMimeType(ext)
            
            images.push({
              name: imageName,
              dataUrl: `data:${mimeType};base64,${base64}`,
              row: position.row,
              col: position.col
            })
            
            console.log(`✅ 提取图片: ${imageName}, 位置: 行${position.row}`)
          } catch (error) {
            console.error(`❌ 提取图片失败:`, error)
          }
        }
        
        return images
      } catch (error) {
        console.error('❌ 提取图片失败:', error)
        return []
      }
    },

    /**
     * 解析 drawing.xml 获取图片位置
     */
    async parseDrawingXml(zipContent) {
      const positions = []
      
      try {
        const drawingFiles = []
        zipContent.forEach((relativePath, file) => {
          if (relativePath.match(/xl\/drawings\/drawing\d*\.xml$/)) {
            drawingFiles.push({ path: relativePath, file: file })
          }
        })
        
        for (const drawingFile of drawingFiles) {
          const xmlString = await drawingFile.file.async('text')
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xmlString, 'application/xml')
          
          const anchors = Array.from(xmlDoc.getElementsByTagName('xdr:twoCellAnchor'))
            .concat(Array.from(xmlDoc.getElementsByTagName('xdr:oneCellAnchor')))
          
          anchors.forEach(anchor => {
            try {
              const from = anchor.getElementsByTagName('xdr:from')[0]
              const rowFrom = from ? parseInt(from.getElementsByTagName('xdr:row')[0]?.textContent || '0') : 0
              const colFrom = from ? parseInt(from.getElementsByTagName('xdr:col')[0]?.textContent || '0') : 0
              
              const blip = anchor.getElementsByTagName('a:blip')[0]
              const rId = blip ? blip.getAttribute('r:embed') : null
              
              positions.push({
                row: rowFrom,
                col: colFrom,
                rId
              })
            } catch (error) {
              // 跳过解析失败的锚点
            }
          })
        }
      } catch (error) {
        console.error('❌ 解析图片位置失败:', error)
      }
      
      return positions
    },

    /**
     * 解析 drawing.xml.rels 获取引用关系
     */
    async parseDrawingRels(zipContent) {
      const refs = {}
      
      try {
        const relsFiles = []
        zipContent.forEach((relativePath, file) => {
          if (relativePath.match(/xl\/drawings\/_rels\/drawing\d*\.xml\.rels$/)) {
            relsFiles.push({ path: relativePath, file: file })
          }
        })
        
        for (const relsFile of relsFiles) {
          const xmlContent = await relsFile.file.async('string')
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
          
          const relationships = xmlDoc.getElementsByTagName('Relationship')
          
          for (let rel of relationships) {
            const id = rel.getAttribute('Id')
            const target = rel.getAttribute('Target')
            
            if (id && target) {
              const fileName = target.split('/').pop()
              refs[id] = fileName
            }
          }
        }
      } catch (error) {
        console.error('❌ 解析引用关系失败:', error)
      }
      
      return refs
    },

    /**
     * Blob 转 Base64
     */
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    },

    /**
     * 获取 MIME 类型
     */
    getMimeType(ext) {
      const types = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'bmp': 'image/bmp',
        'webp': 'image/webp'
      }
      return types[ext] || 'image/png'
    },

    /**
     * 加载所有版本
     */
    async loadVersions() {
      this.loading = true
      try {
        console.log('📖 加载版本历史...')
        
        const fileUrl = this.getExcelUrl()
        const url = fileUrl.includes('?') 
          ? `${fileUrl}&_t=${Date.now()}` 
          : `${fileUrl}?_t=${Date.now()}`
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        
        // 提取图片（精确位置）
        this.extractedImages = await this.extractImages(arrayBuffer)
        
        // 创建按行号的图片映射
        const imagesByRow = {}
        this.extractedImages.forEach(img => {
          if (!imagesByRow[img.row]) {
            imagesByRow[img.row] = []
          }
          imagesByRow[img.row].push(img)
        })
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
        
        // 解析所有版本（按行号精确关联图片）
        const versions = []
        let currentVersion = null
        let currentSystem = '' // 记住当前系统名称（处理合并单元格）
        
        for (let i = 1; i < data.length; i++) {
          const row = data[i]
          const versionNum = (row[0] || '').toString().trim()
          const content = (row[3] || '').toString().trim()
          const imageNote = (row[4] || '').toString().trim()
          
          // 获取该行的图片
          const rowImages = imagesByRow[i] || []
          
          if (versionNum && versionNum.toLowerCase().startsWith('v')) {
            // 保存上一个版本
            if (currentVersion) {
              versions.push(currentVersion)
            }
            
            // 拆分版本号和日期（如果版本号字段包含日期）
            let pureVersion = versionNum
            let versionDate = (row[1] || '').toString().trim()
            
            // 检查版本号是否包含换行符或空格（可能包含日期）
            if (versionNum.includes('\n') || versionNum.includes(' ')) {
              // 先按换行符拆分，再按空格拆分
              const parts = versionNum.split(/[\n\s]+/).filter(p => p.trim())
              pureVersion = parts[0] // 纯版本号 (如 V1.5.1)
              if (parts.length > 1 && !versionDate) {
                versionDate = parts.slice(1).join(' ') // 日期部分
              }
            }
            
            const system = (row[2] || '').toString().trim()
            if (system) {
              currentSystem = system // 更新当前系统名称
            }
            
            currentVersion = {
              version: pureVersion,
              date: this.formatDate(versionDate),
              system: currentSystem || '迪太云系统',
              items: [],
              updateCount: 0
            }
            
            console.log(`🔖 版本 ${pureVersion}, 日期 ${this.formatDate(versionDate)}, 系统 ${currentSystem}, 行 ${i}, 该行图片: ${rowImages.length} 张`)
          } else {
            // 非版本号行，检查是否有新的系统名称（合并单元格的第一行）
            const rowSystem = (row[2] || '').toString().trim()
            if (rowSystem) {
              currentSystem = rowSystem
            }
          }
          
          // 添加更新内容
          if (currentVersion && content) {
            const updateItem = {
              content: content,
              images: [],
              imageNote: imageNote || '',
              system: currentSystem // 为每条更新记录关联系统名称
            }
            
            // 精确关联该行的图片
            if (rowImages.length > 0) {
              rowImages.forEach(img => {
                updateItem.images.push(img.dataUrl)
              })
              console.log(`🖼️ 行${i} "${content.substring(0, 20)}..." 关联 ${rowImages.length} 张图片, 系统: ${currentSystem}`)
            }
            
            currentVersion.items.push(updateItem)
            currentVersion.updateCount++
          }
        }
        
        // 添加最后一个版本
        if (currentVersion) {
          versions.push(currentVersion)
        }
        
        // 按版本号从大到小排序
        versions.sort((a, b) => {
          const getVersionParts = (v) => {
            // 提取版本号中的数字部分，如 V1.5.1 -> [1, 5, 1]
            const match = v.version.match(/v?(\d+)\.(\d+)\.(\d+)/i)
            if (match) {
              return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
            }
            return [0, 0, 0]
          }
          
          const aParts = getVersionParts(a)
          const bParts = getVersionParts(b)
          
          // 比较主版本号、次版本号、修订号
          for (let i = 0; i < 3; i++) {
            if (bParts[i] !== aParts[i]) {
              return bParts[i] - aParts[i] // 从大到小排序
            }
          }
          return 0
        })
        
        console.log(`✅ 成功加载 ${versions.length} 个版本`)
        console.log('📋 版本列表:', versions.map(v => ({ version: v.version, date: v.date })))
        this.versions = versions
        
        // 设置当前版本和默认激活版本
        if (versions.length > 0) {
          this.currentVersion = versions[0].version
          this.activeVersion = versions[0].version
        }
        
        // 统计使用的图片数量
        let usedImageCount = 0
        versions.forEach(v => {
          v.items.forEach(item => {
            usedImageCount += item.images.length
          })
        })
        console.log(`📸 图片统计: 提取 ${this.extractedImages.length} 张, 使用 ${usedImageCount} 张`)
        
        // 版本加载完成后添加滚动监听
        this.$nextTick(() => {
          this.addScrollListener()
        })
        
      } catch (error) {
        console.error('❌ 加载版本历史失败:', error)
        this.$message.error('加载版本历史失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 刷新版本列表
     */
    async refreshVersions() {
      await this.loadVersions()
      this.$message.success('已刷新版本列表')
    },

    /**
     * 获取 Excel URL
     */
    getExcelUrl() {
      return process.env.VUE_APP_VERSION_EXCEL_URL || '/static/迪太云变更履历表.xlsx'
    },

    /**
     * 格式化日期
     */
    formatDate(dateStr) {
      if (!dateStr) return ''
      
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const year = parts[0]
          const month = parts[1].padStart(2, '0')
          const day = parts[2].padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        return dateStr.replace(/\//g, '-')
      }
      
      if (!isNaN(dateStr)) {
        const date = XLSX.SSF.parse_date_code(Number(dateStr))
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
      }
      
      return dateStr
    },

    /**
     * 滚动到指定版本（兼容所有浏览器）
     */
    scrollToVersion(versionNum) {
      this.activeVersion = versionNum
      this.$nextTick(() => {
        const refName = `version-${versionNum}`
        const element = this.$refs[refName]
        
        if (element && element[0]) {
          const container = document.querySelector('.version-list-container')
          const targetElement = element[0].$el
          
          if (container && targetElement) {
            // 计算滚动位置：统一定位到标题栏位置
            const containerTop = container.getBoundingClientRect().top
            const elementTop = targetElement.getBoundingClientRect().top
            const scrollTop = container.scrollTop
            const targetScrollTop = elementTop - containerTop + scrollTop - 20 // 20px 偏移
            
            // 兼容性平滑滚动（支持所有浏览器）
            // 注意：不需要限制最大滚动距离，因为底部 padding 已经提供了足够的空间
            this.smoothScrollTo(container, targetScrollTop, 300)
          }
        }
      })
    },

    /**
     * 平滑滚动（兼容所有浏览器）
     * @param {Element} element - 要滚动的元素
     * @param {Number} target - 目标滚动位置
     * @param {Number} duration - 滚动持续时间（毫秒）
     */
    smoothScrollTo(element, target, duration) {
      const start = element.scrollTop
      const change = target - start
      const startTime = performance.now()
      
      // 缓动函数（easeInOutQuad）
      const easeInOutQuad = (t) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      }
      
      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = easeInOutQuad(progress)
        
        element.scrollTop = start + change * easeProgress
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        }
      }
      
      requestAnimationFrame(animateScroll)
    }
  }
}
</script>

<style lang="scss" scoped>
.version-history-dialog {
  ::v-deep .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px 24px;
    
    .el-dialog__title {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
    }
    
    .el-dialog__headerbtn .el-dialog__close {
      color: #fff;
      font-size: 20px;
      
      &:hover {
        color: #f0f0f0;
      }
    }
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
  
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .version-count {
      color: #909399;
      font-size: 13px;
    }
  }
}

.version-content-wrapper {
  display: flex;
  gap: 20px;
  height: 60vh;
}

.version-nav {
  width: 200px;
  flex-shrink: 0;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px 0;
  overflow-y: auto;
  
  .nav-title {
    padding: 0 16px 12px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    border-bottom: 2px solid #e4e7ed;
  }
  
  .nav-list {
    margin-top: 8px;
  }
  
  .nav-item {
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.3s;
    border-left: 3px solid transparent;
    
    &:hover {
      background: #ecf5ff;
    }
    
    &.active {
      background: #ecf5ff;
      border-left-color: #409eff;
      
      .version-num {
        color: #409eff;
        font-weight: 700;
      }
    }
  }
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 2px;
    
    &:hover {
      background-color: #909399;
    }
  }
}

.version-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 50vh 8px; // 添加底部 padding，确保最后的元素可以滚动到顶部
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 3px;
    
    &:hover {
      background-color: #909399;
    }
  }

  /* 调整时间轴样式 */
  ::v-deep .el-timeline-item {
    position: relative;
    padding-bottom: 20px;
  }
  
  ::v-deep .el-timeline-item__wrapper {
    padding-left: 28px;
    top: 0;
  }
  
  ::v-deep .el-timeline-item__tail {
    left: 4px;
  }
  
  ::v-deep .el-timeline-item__node {
    left: 0;
  }

  .el-card {
    margin-bottom: 0;
    border-radius: 8px;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.latest-version {
      border: 2px solid #409eff;
      background: linear-gradient(to bottom, #ecf5ff 0%, #ffffff 100%);
    }
  }
}

.version-header {
  margin-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .version-info {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .version-tag-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .version-number {
      font-size: 20px;
      font-weight: 700;
      color: #303133;
      
      &.is-latest {
        color: #f56c6c;
      }
    }
    
    .version-date {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #606266;
      font-size: 13px;
      
      i {
        color: #409eff;
        font-size: 14px;
      }
      
      span {
        color: #606266;
        font-weight: 500;
      }
    }
  }
  
  .content-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    
    i {
      color: #409eff;
    }
  }
}


.update-content {
  // 系统分组
  .system-group {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .system-title {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: #f5f7fa;
      border-left: 3px solid #409eff;
      border-radius: 4px;
      margin-bottom: 16px;
      color: #303133;
      font-size: 15px;
      font-weight: 600;
      
      i {
        font-size: 16px;
        color: #409eff;
      }
      
      .update-count {
        font-size: 13px;
        font-weight: 400;
        color: #909399;
      }
    }
    
    .system-updates {
      padding-left: 8px;
    }
  }
  
  .update-item-wrapper {
    background: #f5f7fa;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .update-text-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;
      line-height: 1.8;
      
      .item-index {
        color: #409eff;
        font-weight: 500;
        margin-right: 8px;
        flex-shrink: 0;
        font-size: 14px;
      }
      
      .item-text {
        color: #606266;
        flex: 1;
      }
    }
    
    .update-images {
      margin-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .update-image {
        width: 180px;
        height: 120px;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid #dcdfe6;
        transition: all 0.3s;
        
        &:hover {
          border-color: #409eff;
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
        }
        
        &.multi-image {
          width: 160px;
          height: 100px;
        }
      }
      
      .image-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: #fafafa;
        color: #c0c4cc;
        
        i {
          font-size: 32px;
        }
      }
      
      .image-count-tip {
        width: 100%;
        text-align: center;
        color: #909399;
        font-size: 12px;
        margin-top: 4px;
      }
    }
  }
}

.no-content {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 13px;
  
  i {
    font-size: 24px;
    display: block;
    margin-bottom: 8px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .footer-tips {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #909399;
    font-size: 13px;
    
    i {
      color: #409eff;
    }
  }
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>

