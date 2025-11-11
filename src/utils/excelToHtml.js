/**
 * Excel 转 HTML 渲染工具
 * 读取 Excel 文件，提取图片，生成精美的 HTML 展示
 */

import * as XLSX from 'xlsx'
import JSZip from 'jszip'

/**
 * 从 Excel ZIP 中提取图片
 */
async function extractImages(zipContent) {
  const images = []
  const imageFiles = []
  
  // 1. 收集所有图片文件
  zipContent.forEach((relativePath, file) => {
    if (relativePath.match(/xl\/media\//)) {
      imageFiles.push({ name: relativePath.split('/').pop(), file: file })
    }
  })
  
  console.log(`📸 找到 ${imageFiles.length} 张图片`)
  
  // 2. 解析 drawing.xml 获取图片位置
  const positions = await parseDrawingXml(zipContent)
  console.log(`📍 解析到 ${positions.length} 个图片位置`)
  
  // 3. 解析 drawing.xml.rels 获取引用关系
  const refs = await parseDrawingRels(zipContent)
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
        console.warn(`⚠️ 图片位置无引用: 行${position.row}`)
        continue
      }
      
      const imageName = refs[position.rId]
      if (!imageFileMap[imageName]) {
        console.warn(`⚠️ 图片文件不存在: ${imageName}`)
        continue
      }
      
      const imageFile = imageFileMap[imageName]
      const blob = await imageFile.file.async('blob')
      const base64 = await blobToBase64(blob)
      const ext = imageName.split('.').pop().toLowerCase()
      const mimeType = getMimeType(ext)
      
      images.push({
        name: imageName,
        dataUrl: `data:${mimeType};base64,${base64}`,
        row: position.row,
        col: position.col,
        rowFrom: position.rowFrom,
        colFrom: position.colFrom,
        rowTo: position.rowTo,
        colTo: position.colTo
      })
      
      console.log(`✅ 提取图片: ${imageName}, 位置: 行${position.row}`)
    } catch (error) {
      console.error(`❌ 提取图片失败:`, error)
    }
  }
  
  return images
}

/**
 * 解析 drawing.xml
 */
async function parseDrawingXml(zipContent) {
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
          const to = anchor.getElementsByTagName('xdr:to')[0]
          
          const rowFrom = from ? parseInt(from.getElementsByTagName('xdr:row')[0]?.textContent || '0') : 0
          const colFrom = from ? parseInt(from.getElementsByTagName('xdr:col')[0]?.textContent || '0') : 0
          const rowTo = to ? parseInt(to.getElementsByTagName('xdr:row')[0]?.textContent || rowFrom) : rowFrom
          const colTo = to ? parseInt(to.getElementsByTagName('xdr:col')[0]?.textContent || colFrom) : colFrom
          
          const blip = anchor.getElementsByTagName('a:blip')[0]
          const rId = blip ? blip.getAttribute('r:embed') : null
          
          positions.push({
            row: rowFrom,
            col: colFrom,
            rowFrom,
            colFrom,
            rowTo,
            colTo,
            rId
          })
        } catch (error) {
          console.error('解析锚点失败:', error)
        }
      })
    }
  } catch (error) {
    console.error('❌ 解析图片位置失败:', error)
  }
  
  return positions
}

/**
 * 解析 drawing.xml.rels
 */
async function parseDrawingRels(zipContent) {
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
}

/**
 * Blob 转 Base64
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 获取 MIME 类型
 */
function getMimeType(ext) {
  const types = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp'
  }
  return types[ext] || 'image/png'
}

/**
 * 主函数：Excel 转 HTML
 */
export async function excelToHtml(fileUrl) {
  console.log('📖 开始解析 Excel...')
  
  try {
    // 1. 读取 Excel 文件
    const response = await fetch(fileUrl)
    const arrayBuffer = await response.arrayBuffer()
    
    // 2. 解析 Excel 数据
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    
    console.log(`📊 读取到 ${data.length} 行数据`)
    
    // 3. 提取图片
    const zipContent = await JSZip.loadAsync(arrayBuffer)
    const images = await extractImages(zipContent)
    
    // 4. 生成 HTML
    const html = generateHtml(data, images)
    
    console.log('✅ 生成 HTML 成功')
    return html
    
  } catch (error) {
    console.error('❌ Excel 转 HTML 失败:', error)
    throw error
  }
}

/**
 * 生成 HTML 内容
 */
function generateHtml(data, images) {
  // 创建图片索引（按行号）
  const imagesByRow = {}
  images.forEach(img => {
    if (!imagesByRow[img.rowFrom]) {
      imagesByRow[img.rowFrom] = []
    }
    imagesByRow[img.rowFrom].push(img)
  })
  
  let html = `
<div class="excel-version-display">
  <style>
    .excel-version-display {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
    }
    
    .version-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 16px;
      margin-bottom: 30px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    
    .version-header h1 {
      margin: 0;
      font-size: 36px;
      font-weight: 700;
    }
    
    .version-section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .version-section:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
    
    .version-title {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 16px;
      margin-bottom: 24px;
      border-bottom: 3px solid #1890ff;
    }
    
    .version-number {
      font-size: 28px;
      font-weight: 700;
      color: #1890ff;
    }
    
    .version-date {
      font-size: 16px;
      color: #666;
      background: #f0f0f0;
      padding: 4px 12px;
      border-radius: 12px;
    }
    
    .version-system {
      font-size: 14px;
      color: #999;
      margin-left: auto;
    }
    
    .update-item {
      padding: 20px;
      margin-bottom: 16px;
      border-left: 4px solid #52c41a;
      background: linear-gradient(90deg, #f6ffed 0%, #ffffff 100%);
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .update-item:hover {
      border-left-width: 6px;
      padding-left: 22px;
      background: linear-gradient(90deg, #f6ffed 0%, #fafafa 100%);
    }
    
    .update-content {
      font-size: 16px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 12px;
    }
    
    .update-images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .update-image {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .update-image:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    
    .update-image img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .image-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .update-note {
      margin-top: 12px;
      padding: 12px;
      background: #fffbe6;
      border-left: 3px solid #faad14;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
    }
    
    .no-image-note {
      padding: 12px;
      background: #f0f0f0;
      border-radius: 4px;
      font-size: 14px;
      color: #999;
      font-style: italic;
    }
    
    /* 图片预览弹窗 */
    .image-modal {
      display: none;
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.95);
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.2s;
    }
    
    .image-modal.active {
      display: flex;
    }
    
    .image-modal img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.5);
    }
    
    .image-modal-close {
      position: absolute;
      top: 20px;
      right: 30px;
      color: white;
      font-size: 40px;
      font-weight: 300;
      cursor: pointer;
      z-index: 10000;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    /* 响应式 */
    @media (max-width: 768px) {
      .excel-version-display {
        padding: 10px;
      }
      
      .version-section {
        padding: 20px;
      }
      
      .update-images {
        grid-template-columns: 1fr;
      }
    }
  </style>
  
  <div class="version-header">
    <h1>📋 迪太云版本更新说明</h1>
  </div>
`
  
  let currentVersion = null
  let versionHtml = ''
  
  // 遍历数据行
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    
    // 跳过空行
    if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
      continue
    }
    
    const versionNum = (row[0] || '').toString().trim()
    const date = (row[1] || '').toString().trim()
    const system = (row[2] || '').toString().trim()
    const content = (row[3] || '').toString().trim()
    const imageNote = (row[4] || '').toString().trim()
    
    // 检测新版本
    if (versionNum && versionNum.toLowerCase().startsWith('v')) {
      // 保存上一个版本
      if (currentVersion) {
        html += `
          ${versionHtml}
        </div>
      </div>
`
      }
      
      // 开始新版本
      currentVersion = { version: versionNum, date, system }
      versionHtml = `
  <div class="version-section">
    <div class="version-title">
      <span class="version-number">${versionNum}</span>
      <span class="version-date">📅 ${date}</span>
      <span class="version-system">${system}</span>
    </div>
    <div class="version-items">
`
    }
    
    // 添加更新内容
    if (content && currentVersion) {
      const rowImages = imagesByRow[i] || []
      
      versionHtml += `
      <div class="update-item">
        <div class="update-content">${content}</div>
`
      
      // 添加图片
      if (rowImages.length > 0) {
        versionHtml += `
        <div class="update-images">
`
        rowImages.forEach((img, idx) => {
          versionHtml += `
          <div class="update-image" onclick="window.viewImage('${img.dataUrl}')">
            <img src="${img.dataUrl}" alt="功能截图" loading="lazy" />
            ${rowImages.length > 1 ? `<span class="image-badge">图片 ${idx + 1}/${rowImages.length}</span>` : ''}
          </div>
`
        })
        versionHtml += `
        </div>
`
      }
      
      // 添加图片说明或无图片提示
      if (imageNote) {
        if (imageNote.includes('无页面') || imageNote.includes('接口改动')) {
          versionHtml += `
        <div class="no-image-note">💬 ${imageNote}</div>
`
        } else {
          versionHtml += `
        <div class="update-note">💡 ${imageNote}</div>
`
        }
      }
      
      versionHtml += `
      </div>
`
    }
  }
  
  // 关闭最后一个版本
  if (currentVersion) {
    html += `
      ${versionHtml}
    </div>
  </div>
`
  }
  
  // 添加JavaScript
  html += `
  <script>
    // 点击图片放大查看
    window.viewImage = function(src) {
      const modal = document.createElement('div')
      modal.className = 'image-modal active'
      modal.innerHTML = \`
        <span class="image-modal-close" onclick="this.parentElement.remove()">&times;</span>
        <img src="\${src}" />
      \`
      modal.onclick = (e) => {
        if (e.target === modal || e.target.className === 'image-modal-close') {
          modal.remove()
        }
      }
      document.body.appendChild(modal)
    }
  </script>
</div>
`
  
  return html
}

export default excelToHtml
