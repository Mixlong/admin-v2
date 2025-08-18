// 生产报警管理端到端测试
describe('生产报警管理 E2E 测试', () => {
  beforeEach(() => {
    // 访问报警管理页面
    cy.visit('/production-management/alerts')
    
    // 等待页面加载
    cy.get('.production-alerts-container').should('be.visible')
  })

  describe('页面基础功能', () => {
    it('页面正确加载', () => {
      cy.contains('生产报警管理')
      cy.get('.search-section').should('be.visible')
      cy.get('.table-section').should('be.visible')
      cy.get('.pagination-section').should('be.visible')
    })

    it('搜索功能正常', () => {
      // 输入工单号搜索
      cy.get('input[placeholder="请输入工单号"]').type('WO202401001')
      cy.get('.el-button').contains('搜索').click()
      
      // 验证搜索结果
      cy.get('.el-table__body').should('be.visible')
    })

    it('高级搜索展开收起', () => {
      // 点击高级搜索
      cy.get('.el-button').contains('高级搜索').click()
      cy.get('.advanced-search-form').should('be.visible')
      
      // 收起高级搜索
      cy.get('.el-button').contains('收起').click()
      cy.get('.advanced-search-form').should('not.exist')
    })

    it('分页功能正常', () => {
      // 改变每页大小
      cy.get('.el-pagination__sizes .el-select').click()
      cy.get('.el-select-dropdown__item').contains('50').click()
      
      // 验证分页变化
      cy.get('.el-pagination__total').should('contain', '条')
    })
  })

  describe('报警管理功能', () => {
    it('新增报警流程', () => {
      // 点击新增按钮
      cy.get('.el-button').contains('新增报警').click()
      
      // 填写表单
      cy.get('.alert-form-dialog').should('be.visible')
      cy.get('input[placeholder="请输入工单号"]').type('WO202401999')
      cy.get('.el-select').first().click()
      cy.get('.el-select-dropdown__item').first().click()
      cy.get('textarea[placeholder*="问题描述"]').type('测试问题描述')
      
      // 提交表单
      cy.get('.el-button').contains('创建').click()
      
      // 验证成功消息
      cy.get('.el-message--success').should('be.visible')
    })

    it('编辑报警流程', () => {
      // 点击第一行的编辑按钮
      cy.get('.el-table__body .el-button').contains('编辑').first().click()
      
      // 修改问题描述
      cy.get('.alert-form-dialog').should('be.visible')
      cy.get('textarea[placeholder*="问题描述"]').clear().type('修改后的问题描述')
      
      // 提交修改
      cy.get('.el-button').contains('更新').click()
      
      // 验证成功消息
      cy.get('.el-message--success').should('be.visible')
    })

    it('查看报警详情', () => {
      // 点击查看按钮
      cy.get('.el-table__body .el-button').contains('查看').first().click()
      
      // 验证详情对话框
      cy.get('.alert-detail-dialog').should('be.visible')
      cy.contains('基本信息')
      cy.contains('问题描述')
      
      // 关闭详情
      cy.get('.el-button').contains('关闭').click()
      cy.get('.alert-detail-dialog').should('not.exist')
    })

    it('删除报警流程', () => {
      // 点击删除按钮
      cy.get('.el-table__body .el-button').contains('删除').first().click()
      
      // 确认删除
      cy.get('.el-message-box').should('be.visible')
      cy.get('.el-button--primary').contains('确定').click()
      
      // 验证删除成功
      cy.get('.el-message--success').should('be.visible')
    })
  })

  describe('处理工作流程', () => {
    it('开始处理报警', () => {
      // 点击处理按钮
      cy.get('.el-table__body .el-button').contains('处理').first().click()
      
      // 填写处理信息
      cy.get('.process-dialog').should('be.visible')
      cy.get('.el-select').click()
      cy.get('.el-select-dropdown__item').first().click()
      cy.get('textarea[placeholder*="处理说明"]').type('开始处理这个报警')
      
      // 开始处理
      cy.get('.el-button').contains('开始处理').click()
      
      // 确认操作
      cy.get('.el-message-box .el-button--primary').click()
      
      // 验证成功消息
      cy.get('.el-message--success').should('be.visible')
    })

    it('完成处理流程', () => {
      // 假设已有处理中的报警，点击处理按钮
      cy.get('.el-table__body .el-button').contains('处理').first().click()
      
      // 填写处理结果
      cy.get('textarea[placeholder*="处理结果"]').type('问题已解决，设备恢复正常')
      
      // 完成处理
      cy.get('.el-button').contains('完成处理').click()
      
      // 确认操作
      cy.get('.el-message-box .el-button--primary').click()
      
      // 验证成功消息
      cy.get('.el-message--success').should('be.visible')
    })

    it('验证处理结果', () => {
      // 点击验证按钮
      cy.get('.el-table__body .el-button').contains('验证').first().click()
      
      // 选择验证结果
      cy.get('.verify-dialog').should('be.visible')
      cy.get('.el-radio').first().click() // 选择验证通过
      
      // 填写验证说明
      cy.get('textarea[placeholder*="验证说明"]').type('验证通过，问题已解决')
      
      // 选择检查项
      cy.get('.el-checkbox').first().click()
      
      // 提交验证
      cy.get('.el-button').contains('确认通过').click()
      
      // 确认操作
      cy.get('.el-message-box .el-button--primary').click()
      
      // 验证成功消息
      cy.get('.el-message--success').should('be.visible')
    })
  })

  describe('批量操作', () => {
    it('批量删除功能', () => {
      // 选择多行
      cy.get('.el-table__body .el-checkbox').first().click()
      cy.get('.el-table__body .el-checkbox').eq(1).click()
      
      // 点击批量操作
      cy.get('.el-dropdown').contains('批量操作').click()
      cy.get('.el-dropdown-item').contains('批量删除').click()
      
      // 确认删除
      cy.get('.el-message-box .el-button--primary').click()
      
      // 验证成功消息
      cy.get('.el-message--success').should('be.visible')
    })

    it('批量分配处理人', () => {
      // 选择待处理的报警
      cy.get('.el-table__body .el-checkbox').first().click()
      
      // 批量分配
      cy.get('.el-dropdown').contains('批量操作').click()
      cy.get('.el-dropdown-item').contains('批量分配处理人').click()
      
      // 选择处理人
      cy.get('.el-message-box .el-select').click()
      cy.get('.el-select-dropdown__item').first().click()
      cy.get('.el-message-box .el-button--primary').click()
      
      // 验证成功消息
      cy.get('.el-message--success').should('be.visible')
    })

    it('批量导出功能', () => {
      // 选择数据
      cy.get('.el-table__body .el-checkbox').first().click()
      
      // 批量导出
      cy.get('.el-dropdown').contains('批量操作').click()
      cy.get('.el-dropdown-item').contains('批量导出').click()
      
      // 确认导出
      cy.get('.el-message-box .el-button--primary').click()
      
      // 验证导出成功
      cy.get('.el-message--success').should('be.visible')
    })
  })

  describe('报表查询功能', () => {
    it('按处理人查询', () => {
      // 点击报表查询
      cy.get('.el-dropdown').contains('报表查询').click()
      cy.get('.el-dropdown-item').contains('按处理人查询').click()
      
      // 输入处理人姓名
      cy.get('.el-message-box input').type('张三')
      cy.get('.el-message-box .el-button--primary').click()
      
      // 验证查询结果
      cy.get('.el-message--success').should('be.visible')
    })

    it('按状态统计', () => {
      // 点击状态统计
      cy.get('.el-dropdown').contains('报表查询').click()
      cy.get('.el-dropdown-item').contains('按状态统计').click()
      
      // 选择状态
      cy.get('.el-message-box .el-select').click()
      cy.get('.el-select-dropdown__item').first().click()
      cy.get('.el-message-box .el-button--primary').click()
      
      // 验证统计结果
      cy.get('.el-message--success').should('be.visible')
    })

    it('处理效率分析', () => {
      // 点击效率分析
      cy.get('.el-dropdown').contains('报表查询').click()
      cy.get('.el-dropdown-item').contains('处理效率分析').click()
      
      // 验证分析结果对话框
      cy.get('.el-message-box').should('be.visible')
      cy.contains('处理效率分析')
    })
  })

  describe('大屏显示', () => {
    it('跳转到大屏页面', () => {
      // 点击大屏显示按钮
      cy.get('.el-button').contains('大屏显示').click()
      
      // 验证页面跳转
      cy.url().should('include', '/alerts/large-screen')
      cy.get('.large-screen-container').should('be.visible')
    })

    it('大屏自动刷新', () => {
      // 访问大屏页面
      cy.visit('/production-management/alerts/large-screen')
      
      // 验证自动刷新指示器
      cy.get('.refresh-indicator').should('be.visible')
      cy.get('.refresh-text').should('contain', 's后刷新')
      
      // 等待刷新
      cy.wait(2000)
      cy.get('.refresh-progress').should('have.css', 'width')
    })
  })

  describe('响应式设计', () => {
    it('移动端布局适配', () => {
      // 设置移动端视口
      cy.viewport(375, 667)
      
      // 验证移动端布局
      cy.get('.search-section').should('be.visible')
      cy.get('.action-section .el-button').should('have.css', 'width')
      
      // 验证表格横向滚动
      cy.get('.table-section').should('have.css', 'overflow-x', 'auto')
    })

    it('平板端布局适配', () => {
      // 设置平板端视口
      cy.viewport(768, 1024)
      
      // 验证平板端布局
      cy.get('.search-form .el-form-item').should('be.visible')
      cy.get('.action-section').should('be.visible')
    })

    it('桌面端完整功能', () => {
      // 设置桌面端视口
      cy.viewport(1920, 1080)
      
      // 验证所有功能可见
      cy.get('.search-form .el-form-item').should('have.length.greaterThan', 4)
      cy.get('.el-table__header .el-table__column').should('have.length.greaterThan', 8)
    })
  })

  describe('无障碍功能', () => {
    it('键盘导航', () => {
      // 测试Tab键导航
      cy.get('body').tab()
      cy.focused().should('have.class', 'el-input__inner')
      
      // 测试快捷键
      cy.get('body').type('{ctrl}f')
      cy.focused().should('have.attr', 'placeholder', '请输入工单号')
    })

    it('ARIA标签', () => {
      // 验证表格ARIA标签
      cy.get('.el-table').should('have.attr', 'role', 'table')
      cy.get('.search-form').should('have.attr', 'role', 'search')
    })

    it('屏幕阅读器支持', () => {
      // 验证重要元素有适当的标签
      cy.get('.el-table').should('have.attr', 'aria-label')
      cy.get('.search-form').should('have.attr', 'aria-label')
    })
  })

  describe('错误处理', () => {
    it('网络错误处理', () => {
      // 模拟网络错误
      cy.intercept('GET', '/production/alerts/list', { forceNetworkError: true })
      
      // 刷新页面触发请求
      cy.reload()
      
      // 验证错误消息
      cy.get('.el-message--error').should('be.visible')
    })

    it('API错误处理', () => {
      // 模拟API错误
      cy.intercept('GET', '/production/alerts/list', {
        statusCode: 500,
        body: { code: 500, msg: '服务器内部错误' }
      })
      
      // 刷新页面触发请求
      cy.reload()
      
      // 验证错误消息
      cy.get('.el-message--error').should('contain', '服务器内部错误')
    })

    it('表单验证错误', () => {
      // 打开新增表单
      cy.get('.el-button').contains('新增报警').click()
      
      // 不填写必填字段直接提交
      cy.get('.el-button').contains('创建').click()
      
      // 验证表单验证错误
      cy.get('.el-form-item__error').should('be.visible')
    })
  })

  describe('性能测试', () => {
    it('页面加载性能', () => {
      // 测量页面加载时间
      cy.window().then((win) => {
        const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart
        expect(loadTime).to.be.lessThan(3000) // 页面加载应在3秒内
      })
    })

    it('大数据量处理', () => {
      // 模拟大量数据
      cy.intercept('GET', '/production/alerts/list', {
        fixture: 'large-alerts-dataset.json'
      })
      
      // 刷新页面
      cy.reload()
      
      // 验证表格渲染正常
      cy.get('.el-table__body').should('be.visible')
      cy.get('.el-pagination__total').should('be.visible')
    })

    it('搜索响应性能', () => {
      // 输入搜索条件
      cy.get('input[placeholder="请输入工单号"]').type('WO')
      
      // 测量搜索响应时间
      const startTime = Date.now()
      cy.get('.el-button').contains('搜索').click()
      
      cy.get('.el-table__body').should('be.visible').then(() => {
        const endTime = Date.now()
        const responseTime = endTime - startTime
        expect(responseTime).to.be.lessThan(2000) // 搜索响应应在2秒内
      })
    })
  })

  describe('数据一致性', () => {
    it('状态转换一致性', () => {
      // 开始处理报警
      cy.get('.el-table__body .el-button').contains('处理').first().click()
      cy.get('.el-select').click()
      cy.get('.el-select-dropdown__item').first().click()
      cy.get('textarea').type('开始处理')
      cy.get('.el-button').contains('开始处理').click()
      cy.get('.el-message-box .el-button--primary').click()
      
      // 验证状态变化
      cy.get('.el-message--success').should('be.visible')
      cy.reload()
      cy.get('.el-tag').contains('处理中').should('be.visible')
    })

    it('数据同步', () => {
      // 在一个标签页修改数据
      cy.get('.el-button').contains('新增报警').click()
      cy.get('input[placeholder="请输入工单号"]').type('WO202401888')
      cy.get('.el-select').first().click()
      cy.get('.el-select-dropdown__item').first().click()
      cy.get('textarea').type('同步测试')
      cy.get('.el-button').contains('创建').click()
      
      // 验证数据出现在列表中
      cy.get('.el-message--success').should('be.visible')
      cy.contains('WO202401888').should('be.visible')
    })
  })
})

// 辅助命令
Cypress.Commands.add('tab', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).trigger('keydown', { key: 'Tab' })
})

// 测试数据准备
beforeEach(() => {
  // 设置测试数据
  cy.fixture('alerts-test-data.json').then((data) => {
    cy.intercept('GET', '/production/alerts/list', {
      statusCode: 200,
      body: {
        code: 200,
        data: {
          list: data.alerts,
          total: data.alerts.length
        }
      }
    })
  })
  
  // 设置用户权限
  cy.window().then((win) => {
    win.localStorage.setItem('user-permissions', JSON.stringify([
      'production:alerts:add',
      'production:alerts:edit',
      'production:alerts:remove',
      'production:alerts:process',
      'production:alerts:verify',
      'production:alerts:screen'
    ]))
  })
})