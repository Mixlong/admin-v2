<template>
    <div class="production-alerts-container app-container">
        <!-- 搜索区域 -->
        <div class="search-section toolbar">
            <el-form :model="searchForm" ref="searchForm" :inline="true" class="search-form">
                <el-form-item label="工单号" prop="workOrderNo">
                    <el-autocomplete v-model="searchForm.workOrderNo" :fetch-suggestions="queryWorkOrders"
                        placeholder="请输入工单号" clearable style="width: 200px" @select="handleWorkOrderSelect">
                        <template slot-scope="{ item }">
                            <div class="work-order-item">
                                <span>{{ item.value }}</span>
                                <span class="work-order-desc">{{ item.desc }}</span>
                            </div>
                        </template>
                    </el-autocomplete>
                </el-form-item>

                <el-form-item label="品类名称" prop="categoryName">
                    <el-select v-model="searchForm.categoryName" placeholder="请选择品类" clearable filterable
                        style="width: 150px" @change="handleCategoryChange">
                        <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="型号名称" prop="computerName">
                    <el-select v-model="searchForm.computerName" placeholder="请选择型号" clearable filterable
                        style="width: 150px">
                        <el-option v-for="item in computerOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="处理状态" prop="processType">
                    <el-select v-model="searchForm.processType" placeholder="请选择状态" clearable style="width: 150px">
                        <el-option v-for="item in processTypeOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="上报人" prop="reporter">
                    <el-input v-model="searchForm.reporter" placeholder="请输入上报人" clearable style="width: 120px" />
                </el-form-item>

                <el-form-item label="责任归属部门" prop="responsibleDept">
                    <treeselect v-model="searchForm.responsibleDept" :options="deptOptions" :disable-branch-nodes="true"
                        placeholder="请选择责任归属部门" :clearable="true" :searchable="true" @input="handleSearchDeptChange"
                        :loading="deptLoading" style="width: 150px" />
                </el-form-item>

                <el-form-item label="责任归属人" prop="responsible">
                    <el-select v-model="searchForm.responsible" placeholder="请先选择部门" filterable clearable
                        style="width: 120px" :disabled="!searchForm.responsibleDept" :loading="computerLoading">
                        <el-option v-for="item in applicantList" :key="item.userId" :label="item.nickName"
                            :value="item.nickName" />
                    </el-select>
                </el-form-item>


                <el-form-item label="创建时间" prop="dateRange">
                    <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 240px" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSearch" icon="el-icon-search">搜索</el-button>
                    <el-button @click="handleReset" icon="el-icon-refresh">重置</el-button>
                    <el-button @click="toggleDebugMode" icon="el-icon-setting" type="warning"
                        size="mini">调试模式</el-button>
                </el-form-item>
            </el-form>

            <!-- 操作按钮区域 -->
            <div class="action-section">
                <!-- 调试按钮权限 -->
                <div v-if="debugMode"
                    style="margin-bottom: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                    <p><strong>🔍 权限调试信息:</strong></p>
                    <p>用户权限: {{ $store.getters.permissions }}</p>
                    <p>是否有新增权限: {{ $auth ? $auth.hasPermi(['production:alerts:add']) : '未知' }}</p>
                    <p>是否有编辑权限: {{ $auth ? $auth.hasPermi(['production:alerts:edit']) : '未知' }}</p>
                    <p>是否有删除权限: {{ $auth ? $auth.hasPermi(['production:alerts:remove']) : '未知' }}</p>
                </div>

                <el-button type="primary" @click="handleAdd" icon="el-icon-plus" v-hasPermi="['production:alerts:add']">
                    新增报警
                </el-button>
                <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0"
                    icon="el-icon-delete" v-hasPermi="['production:alerts:remove']">
                    批量删除 ({{ selectedRows.length }})
                </el-button>

            </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-section">
            <el-table :data="tableData" v-loading="loading" border style="width: 100%" :height="tableHeight(-60)"
                @selection-change="handleSelectionChange" :row-class-name="getRowClassName" row-key="id"
                @sort-change="handleSortChange">
                <el-table-column type="selection" width="55" align="center" />

                <el-table-column prop="workOrderNo" label="工单号" align="center" width="120">
                    <template slot-scope="scope">
                        <div class="work-order-cell">
                            <el-link type="primary" @click="handleViewWorkOrder(scope.row.workOrderNo)"
                                :underline="false">
                                {{ scope.row.workOrderNo }}
                            </el-link>
                        </div>
                    </template>
                </el-table-column>


                <el-table-column prop="categoryName" label="品类名称" align="center" width="120" />

                <el-table-column prop="computerName" label="型号名称" align="center" width="120" />

                <el-table-column prop="problemDesc" label="问题描述" align="center" min-width="200" show-overflow-tooltip />
                <el-table-column prop="remark" label="备注" align="center" min-width="200" show-overflow-tooltip />

                <el-table-column prop="processType" label="处理状态" align="center" width="130">
                    <template slot-scope="scope">
                        <div class="status-cell">
                            <el-tag :type="getProcessTypeColor(scope.row.processType)" size="small" effect="dark">
                                <i :class="getProcessTypeIcon(scope.row.processType)" style="margin-right: 4px;"></i>
                                {{ getProcessTypeLabel(scope.row.processType) }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="reporter" label="上报人" align="center" width="100" />

                <el-table-column prop="responsibleDept" label="责任部门" align="center" width="120">
                    <template slot-scope="scope">
                        <span>{{ scope.row.responsibleDept || '-' }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="responsible" label="责任人" align="center" width="100" />


                <el-table-column prop="remark" label="备注" align="center" width="120" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span v-if="scope.row.remark" class="remark-content">{{ scope.row.remark }}</span>
                        <span v-else class="no-remark">-</span>
                    </template>
                </el-table-column>

                <el-table-column prop="createdTime" label="创建时间" align="center" width="160" sortable>
                    <template slot-scope="scope">
                        <div class="time-cell">
                            <div>{{ formatDateTime(scope.row.createdTime) }}</div>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="280" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleView(scope.row)" icon="el-icon-view">
                            查看
                        </el-button>
                        <el-button size="mini" type="text" @click="handleEdit(scope.row)" icon="el-icon-edit"
                            v-hasPermi="['production:alerts:edit']">
                            编辑
                        </el-button>

                        <!-- 开始处理按钮 - 状态为待处理(1)且当前用户部门与责任部门匹配时显示 -->
                        <el-button v-if="canStartProcess(scope.row)" size="mini" type="text"
                            @click="handleStartProcess(scope.row)" icon="el-icon-video-play" style="color: #409EFF;">
                            开始处理
                        </el-button>

                        <!-- 完成处理按钮 - 状态为处理中(2)且当前用户是处理人时显示 -->
                        <el-button v-if="canCompleteProcess(scope.row)" size="mini" type="text"
                            @click="handleCompleteProcess(scope.row)" icon="el-icon-check" style="color: #67C23A;">
                            完成处理
                        </el-button>

                        <!-- 验证按钮 - 状态为已处理待验证(3)且当前用户是责任人时显示 -->
                        <el-button v-if="canVerifyProcess(scope.row)" size="mini" type="text"
                            @click="handleVerifyProcess(scope.row)" icon="el-icon-finished" style="color: #E6A23C;">
                            验证
                        </el-button>

                        <el-button size="mini" type="text" class="text-red" @click="handleDelete(scope.row)"
                            icon="el-icon-delete" v-hasPermi="['production:alerts:remove']">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 分页组件 -->
        <div class="pagination-section">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="pagination.current" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.size"
                layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" />
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && tableData.length === 0" class="empty-state">
            <el-empty description="暂无数据" />
        </div>

        <!-- 报警表单对话框 -->
        <AlertForm :visible.sync="alertFormVisible" :editData="currentEditData" :categoryOptions="categoryOptions"
            :computerOptions="computerOptions" :departmentOptions="departmentOptions" :userOptions="userOptions"
            @success="handleFormSuccess" />



        <!-- 详情对话框 -->
        <AlertDetail :visible.sync="detailDialogVisible" :alertData="currentDetailData" @edit="handleDetailEdit" />

        <!-- 验证处理结果对话框 -->
        <el-dialog title="验证处理结果" :visible.sync="verifyProcessDialogVisible" width="400px" top='0'
            :close-on-click-modal="false">
            <el-form :model="verifyForm" label-width="80px">
                <el-form-item label="验证结果" required>
                    <el-radio-group v-model="verifyForm.type">
                        <el-radio :label="1">验证完成</el-radio>
                        <el-radio :label="2">验证不通过重新处理</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="verifyForm.remark" type="textarea" :rows="3" placeholder="请输入验证备注（可选）" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="verifyProcessDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmVerifyProcess">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getProductionAlertsList, deleteProductionAlert, batchDeleteProductionAlerts, startProcessAlert, completeProcessAlert, verifyProcessResult, PROCESS_STATUS } from '@/api/production-management/alerts'
import { processTypeOptions, processTypeColors } from '@/types/production-alerts'
import { categoryComputerDict } from '@/api/third/fileConfig'
import { listDept } from '@/api/system/dept'
import { listUser } from '@/api/system/user'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import AlertForm from './components/AlertForm.vue'
import AlertDetail from './components/AlertDetail.vue'

export default {
    name: 'ProductionAlerts',
    components: {
        AlertForm,
        AlertDetail,
        Treeselect
    },
    data() {
        return {
            // 搜索表单
            searchForm: {
                workOrderNo: '',
                categoryName: '',
                computerName: '',
                processType: null,
                reporter: '',
                responsible: '',
                responsibleDept: null, // 改为null，与treeselect兼容
                processName: '',
                startTime: null,
                endTime: null
            },
            // 日期范围
            dateRange: [],
            // 表格数据
            tableData: [],
            loading: false,
            debugMode: false,
            // 分页信息
            pagination: {
                current: 1,
                size: 20,
                total: 0
            },
            // 选中的行
            selectedRows: [],
            // 下拉选项
            categoryOptions: [],
            computerOptions: [],
            departmentOptions: [],
            userOptions: [],
            searchUserOptions: [], // 搜索表单中的用户选项
            processTypeOptions: processTypeOptions,
            categoryComputerData: [], // 存储完整的品类型号数据
            // 从AlertForm拷贝的数据
            deptOptions: [],
            applicantList: [],
            deptLoading: true, // 初始化时设为true
            computerLoading: false,
            // 当前用户信息
            currentUser: null,
            // 验证处理对话框
            verifyProcessDialogVisible: false,
            currentProcessRow: null,
            verifyForm: {
                type: 1, // 1.验证完成 2.验证不通过重新处理
                remark: ''
            },
            // 表单相关
            alertFormVisible: false,
            currentEditData: null,

            // 详情相关
            detailDialogVisible: false,
            currentDetailData: {},
            // 数据管理
            originalTableData: [], // 保存原始数据用于排序
            columnSettings: {}, // 列显示设置

            // 部门映射表 - 将部门ID映射到部门名称
            deptIdToNameMap: new Map(), // Map<deptId, deptName>
        }
    },

    created() {
        // 加载用户偏好
        this.loadUserPreferences()

        // 获取数据
        this.fetchData()
        this.loadOptions()
        this.getTreeselect()

        // 预加载数据
        this.$nextTick(() => {
            this.preloadData()
        })
    },

    mounted() {
        // 设置最佳分页大小
        if (!localStorage.getItem('alertsPreferences')) {
            this.pagination.size = this.getOptimalPageSize()
        }

        // 初始化无障碍功能
        this.initAccessibility()

        // 添加窗口大小变化监听
        window.addEventListener('resize', this.handleResize)

        // 初始调整布局
        this.handleResize()

        // 获取当前用户信息
        this.initUserInfo()

        // 添加测试数据按钮（仅在开发环境显示）
        if (process.env.NODE_ENV === 'development') {
            this.addTestDataButton()
        }
    },

    beforeDestroy() {
        // 清理缓存
        this.clearCache()

        // 移除事件监听
        window.removeEventListener('resize', this.handleResize)
        document.removeEventListener('keydown', this.handleKeyboardNavigation)
    },
    methods: {
        // 获取列表数据
        async fetchData() {
            this.loading = true
            try {
                // 构建查询参数，过滤空值
                const params = {
                    p: this.pagination.current,
                    l: this.pagination.size
                }

                // 添加非空的搜索条件
                Object.keys(this.searchForm).forEach(key => {
                    const value = this.searchForm[key]
                    if (value !== null && value !== undefined && value !== '') {
                        params[key] = value
                    }
                })

                const response = await getProductionAlertsList(params)

                if (response.code === 200) {
                    this.tableData = response.data?.list || []
                    this.originalTableData = [...this.tableData] // 保存原始数据
                    this.pagination.total = response.data?.total || 0

                    // 缓存当前页数据
                    this.cacheData(`page_${this.pagination.current}`, response.data)

                    // 数据加载成功提示
                    if (this.tableData.length === 0 && Object.keys(this.searchForm).some(key => this.searchForm[key])) {
                        this.$message.info('未找到符合条件的数据')
                    }
                } else {
                    this.handleApiError(response, '获取数据失败')
                    this.tableData = []
                    this.pagination.total = 0
                }
            } catch (error) {
                this.handleNetworkError(error, '获取报警数据失败')
                this.tableData = []
                this.pagination.total = 0
            } finally {
                this.loading = false
            }
        },

        // 处理API错误
        handleApiError(response, defaultMessage) {
            const errorMessage = response.msg || defaultMessage

            // 根据错误码显示不同的错误信息
            switch (response.code) {
                case 401:
                    this.$message.error('登录已过期，请重新登录')
                    // 可以在这里触发重新登录逻辑
                    break
                case 403:
                    this.$message.error('没有权限执行此操作')
                    break
                case 404:
                    this.$message.error('请求的资源不存在')
                    break
                case 500:
                    this.$message.error('服务器内部错误，请稍后重试')
                    break
                default:
                    this.$message.error(errorMessage)
            }

            // 记录错误日志
        },

        // 处理网络错误
        handleNetworkError(error, context) {
            let errorMessage = '网络连接失败'

            if (error.code === 'ECONNABORTED') {
                errorMessage = '请求超时，请检查网络连接'
            } else if (error.message === 'Network Error') {
                errorMessage = '网络连接异常，请检查网络设置'
            } else if (error.response) {
                // 服务器响应了错误状态码
                errorMessage = `服务器错误 (${error.response.status})`
            }

            this.$message.error(errorMessage)

            // 记录详细错误信息

            // 可以在这里添加错误上报逻辑
            this.reportError(error, context)
        },

        // 错误上报
        reportError(error, context) {
            // TODO: 实现错误上报到监控系统
            const errorReport = {
                timestamp: new Date().toISOString(),
                context,
                error: {
                    message: error.message,
                    stack: error.stack,
                    code: error.code
                },
                userAgent: navigator.userAgent,
                url: window.location.href
            }


        },

        // 显示加载状态
        showLoading(message = '加载中...') {
            this.loading = true
            this.$message.info(message)
        },

        // 隐藏加载状态
        hideLoading() {
            this.loading = false
        },

        // 显示成功消息
        showSuccess(message, duration = 3000) {
            this.$message({
                message,
                type: 'success',
                duration,
                showClose: true
            })
        },

        // 显示警告消息
        showWarning(message, duration = 3000) {
            this.$message({
                message,
                type: 'warning',
                duration,
                showClose: true
            })
        },

        // 显示错误消息
        showError(message, duration = 5000) {
            this.$message({
                message,
                type: 'error',
                duration,
                showClose: true
            })
        },

        // 显示信息消息
        showInfo(message, duration = 3000) {
            this.$message({
                message,
                type: 'info',
                duration,
                showClose: true
            })
        },

        // 确认对话框
        async confirmAction(message, title = '确认操作', type = 'warning') {
            try {
                await this.$confirm(message, title, {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type
                })
                return true
            } catch {
                return false
            }
        },

        // 输入对话框
        async promptInput(message, title = '请输入', options = {}) {
            try {
                const { value } = await this.$prompt(message, title, {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    ...options
                })
                return value
            } catch {
                return null
            }
        },

        // 通知消息
        showNotification(title, message, type = 'info', duration = 4500) {
            this.$notify({
                title,
                message,
                type,
                duration,
                position: 'top-right'
            })
        },

        // 无障碍功能
        initAccessibility() {
            // 检测用户偏好
            this.detectUserPreferences()

            // 添加键盘导航支持
            this.setupKeyboardNavigation()

            // 添加屏幕阅读器支持
            this.setupScreenReaderSupport()
        },

        // 检测用户偏好
        detectUserPreferences() {
            // 检测高对比度偏好
            if (window.matchMedia('(prefers-contrast: high)').matches) {
                document.body.classList.add('high-contrast')
            }

            // 检测减少动画偏好
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.body.classList.add('reduced-motion')
            }

            // 检测大字体偏好
            const fontSize = window.getComputedStyle(document.body).fontSize
            if (parseInt(fontSize) > 16) {
                document.body.classList.add('large-font')
            }
        },

        // 设置键盘导航
        setupKeyboardNavigation() {
            // 添加键盘事件监听
            document.addEventListener('keydown', this.handleKeyboardNavigation)
        },

        // 键盘导航处理
        handleKeyboardNavigation(event) {
            // Ctrl + F: 聚焦到搜索框
            if (event.ctrlKey && event.key === 'f') {
                event.preventDefault()
                const firstInput = this.$el.querySelector('.search-form input')
                if (firstInput) {
                    firstInput.focus()
                }
            }

            // Ctrl + N: 新增报警
            if (event.ctrlKey && event.key === 'n') {
                event.preventDefault()
                this.handleAdd()
            }

            // Escape: 关闭所有对话框
            if (event.key === 'Escape') {
                this.alertFormVisible = false
                this.detailDialogVisible = false
            }
        },

        // 设置屏幕阅读器支持
        setupScreenReaderSupport() {
            // 为表格添加ARIA标签
            this.$nextTick(() => {
                const table = this.$el.querySelector('.el-table')
                if (table) {
                    table.setAttribute('role', 'table')
                    table.setAttribute('aria-label', '生产报警数据表格')
                }

                // 为搜索表单添加标签
                const searchForm = this.$el.querySelector('.search-form')
                if (searchForm) {
                    searchForm.setAttribute('role', 'search')
                    searchForm.setAttribute('aria-label', '报警搜索表单')
                }
            })
        },

        // 响应式布局调整
        handleResize() {
            // 根据屏幕大小调整表格高度
            this.$nextTick(() => {
                const screenWidth = window.innerWidth

                if (screenWidth < 768) {
                    // 移动端：隐藏部分列
                    this.hideColumnsOnMobile()
                } else if (screenWidth < 1200) {
                    // 平板端：调整列宽
                    this.adjustColumnsForTablet()
                } else {
                    // 桌面端：显示所有列
                    this.showAllColumns()
                }
            })
        },

        // 移动端隐藏列
        hideColumnsOnMobile() {
            const hiddenColumns = ['categoryName', 'computerName', 'responsible', 'responsibleDept', 'remark', 'createdTime']
            this.columnSettings = { ...this.columnSettings }
            hiddenColumns.forEach(col => {
                this.columnSettings[col] = { visible: false }
            })
        },

        // 平板端调整列
        adjustColumnsForTablet() {
            this.columnSettings = {
                workOrderNo: { width: '100px' },
                problemDesc: { width: '200px' },
                processType: { width: '100px' },
                reporter: { width: '80px' },
                responsibleDept: { width: '100px' },
                remark: { width: '100px' }
            }
        },

        // 显示所有列
        showAllColumns() {
            this.columnSettings = {}
        },

        // 语音播报（可选功能）
        speakAlert(alert) {
            if ('speechSynthesis' in window) {
                const text = `新报警：工单号${alert.workOrderNo}，问题：${alert.problemDesc}`
                const utterance = new SpeechSynthesisUtterance(text)
                utterance.lang = 'zh-CN'
                utterance.rate = 0.8
                speechSynthesis.speak(utterance)
            }
        },

        // 震动提醒（移动端）
        vibrateAlert() {
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200])
            }
        },

        // 加载下拉选项
        async loadOptions() {
            try {
                // 加载品类和型号选项
                await this.loadCategoryAndComputerOptions()
                // 加载部门选项
                await this.loadDepartmentOptions()
                // 加载用户选项
                await this.loadUserOptions()
            } catch (error) {
                // 加载选项失败
            }
        },

        // 加载品类和型号选项
        async loadCategoryAndComputerOptions() {
            try {
                const response = await categoryComputerDict()

                if (response.code === 200) {
                    const rawData = response.data

                    if (Array.isArray(rawData) && rawData.length > 0) {
                        // 提取品类选项
                        this.categoryOptions = rawData.map(item => ({
                            label: item.name,
                            value: item.name
                        }))

                        // 提取所有型号选项
                        const allComputers = []
                        rawData.forEach(category => {
                            if (category.computerList && Array.isArray(category.computerList)) {
                                category.computerList.forEach(computer => {
                                    allComputers.push({
                                        label: computer.name,
                                        value: computer.name,
                                        categoryName: category.name
                                    })
                                })
                            }
                        })
                        this.computerOptions = allComputers

                        // 保存原始数据供品类筛选使用
                        this.categoryComputerData = rawData
                    } else {
                        this.setDefaultOptions()
                    }
                } else {
                    this.setDefaultOptions()
                }
            } catch (error) {
                this.setDefaultOptions()
            }
        },

        // 设置默认选项
        setDefaultOptions() {
            this.categoryOptions = []
            this.computerOptions = []
            this.categoryComputerData = []
        },

        // 加载部门选项（与AlertForm保持一致）
        async loadDepartmentOptions() {
            try {
                const response = await listDept()
                if (response.code === 200) {
                    // 将树形结构转换为平级选项，使用deptId作为值（与AlertForm一致）
                    this.departmentOptions = this.flattenDeptTree(response.data)
                } else {
                    this.departmentOptions = []
                }
            } catch (error) {
                this.departmentOptions = []
            }
        },

        // 将部门树形结构转换为平级选项（与AlertForm保持一致）
        flattenDeptTree(deptTree, result = []) {
            deptTree.forEach(dept => {
                result.push({
                    label: dept.deptName,
                    value: dept.deptId, // 使用deptId作为值，与AlertForm保持一致
                    deptName: dept.deptName // 保留deptName用于显示
                })
                if (dept.children && dept.children.length > 0) {
                    this.flattenDeptTree(dept.children, result)
                }
            })
            return result
        },

        // 加载用户选项
        async loadUserOptions() {
            // TODO: 调用实际的API获取用户数据
            this.userOptions = [
                { label: '张三', value: 'zhangsan' },
                { label: '李四', value: 'lisi' },
                { label: '王五', value: 'wangwu' },
                { label: '赵六', value: 'zhaoliu' }
            ]
        },

        // 从AlertForm拷贝的方法 - 查询部门下拉树结构
        getTreeselect() {
            this.deptLoading = true;
            listDept().then((res) => {
                // 构建部门ID到名称的映射
                this.buildDeptMapping(res.data);

                const data = res.data.map((item) => {
                    return {
                        parentId: item.parentId,
                        id: item.deptId,
                        label: item.deptName,
                        // 确保没有默认选中状态
                        isSelected: false,
                        isDefaultExpanded: false
                    };
                });

                this.deptOptions = this.handleTree(data);
                this.deptLoading = false;
            }).catch((error) => {
                this.deptLoading = false;
            });
        },

        // 从AlertForm拷贝的方法 - 构造部门下拉树结构
        handleTree(data, parentId = 0) {
            const tree = [];
            data.forEach(item => {
                if (item.parentId === parentId) {
                    const children = this.handleTree(data, item.id);
                    if (children.length > 0) {
                        item.children = children;
                    }
                    tree.push(item);
                }
            });
            return tree;
        },

        // treeselect节点标准化
        normalizeNode(node) {
            return {
                id: node.id,
                label: node.label,
                children: node.children
            }
        },

        // 构建部门ID到名称的映射
        buildDeptMapping(deptList) {
            this.deptIdToNameMap.clear();

            const buildMap = (depts) => {
                depts.forEach(dept => {
                    this.deptIdToNameMap.set(dept.deptId, dept.deptName);
                    if (dept.children && dept.children.length > 0) {
                        buildMap(dept.children);
                    }
                });
            };

            buildMap(deptList);
        },

        // 根据部门ID或名称获取部门名称
        getDeptName(deptName, deptId) {
            // 如果已经有部门名称，直接返回
            if (deptName && typeof deptName === 'string' && deptName !== '-') {
                return deptName;
            }

            // 如果有部门ID，从映射表中获取名称
            if (deptId) {
                // 确保deptId是数字类型（可能是字符串格式的数字）
                const numericDeptId = typeof deptId === 'string' ? parseInt(deptId) : deptId;
                if (this.deptIdToNameMap.has(numericDeptId)) {
                    return this.deptIdToNameMap.get(numericDeptId);
                }
            }

            // 兜底处理：尝试从deptName中解析ID
            if (deptName && typeof deptName === 'number') {
                const name = this.deptIdToNameMap.get(deptName);
                return name || `部门${deptName}`;
            }

            return '-';
        },

        // 初始化用户信息
        async initUserInfo() {


            try {
                // 如果Store中没有用户信息，先调用GetInfo获取
                if (!this.$store.getters.userId || !this.$store.getters.deptId) {
                    await this.$store.dispatch('GetInfo')
                }

                // 获取用户信息
                this.getCurrentUser()

            } catch (error) {

                // 如果获取失败，仍然尝试从Store中读取已有信息
                this.getCurrentUser()
            }
        },

        // 获取当前用户信息
        getCurrentUser() {
            // 从Vuex getters获取用户信息
            this.currentUser = {
                userId: this.$store.getters.userId,
                userName: this.$store.getters.name,
                nickName: this.$store.getters.nickName,
                deptId: this.$store.getters.deptId,
                deptName: this.$store.getters.deptName,
                roles: this.$store.getters.roles,
                permissions: this.$store.getters.permissions
            }


        },

        // 判断是否可以开始处理 - 状态为待处理(1)且当前用户部门与责任部门匹配
        canStartProcess(row) {
            if (!this.currentUser || !row) return false

            // 优先使用部门ID匹配，如果没有则使用部门名称匹配
            let deptMatch = false
            if (this.currentUser.deptId && row.responsibleDeptId) {
                deptMatch = this.currentUser.deptId === row.responsibleDeptId
            } else if (this.currentUser.deptName && row.responsibleDept) {
                deptMatch = this.currentUser.deptName === row.responsibleDept
            }

            const canStart = row.processType === 1 && deptMatch


            return canStart
        },

        // 判断是否可以完成处理 - 状态为处理中(2)且当前用户是责任人
        canCompleteProcess(row) {
            if (!this.currentUser || !row) return false
            const canComplete = row.processType === 2 &&
                this.currentUser.nickName === row.responsible


            return canComplete
        },

        // 判断是否可以验证 - 状态为已处理待验证(3)且当前用户是上报人
        canVerifyProcess(row) {
            if (!this.currentUser || !row) return false
            const canVerify = row.processType === 3 &&
                this.currentUser.nickName === row.reporter


            return canVerify
        },

        // 添加测试数据按钮（开发环境）
        addTestDataButton() {
            // 在页面顶部添加测试按钮
            const testButtonContainer = document.createElement('div')
            testButtonContainer.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 9999;
                background: #fff;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `
            testButtonContainer.innerHTML = `
                <div style="margin-bottom: 10px; font-size: 12px; color: #666;">测试按钮状态</div>
                <button onclick="window.refreshUserInfo()" style="margin-right: 5px; padding: 5px 10px; font-size: 12px;">刷新用户信息</button>
                <button onclick="window.addTestData()" style="margin-right: 5px; padding: 5px 10px; font-size: 12px;">添加测试数据</button>
                <button onclick="window.showCurrentUser()" style="padding: 5px 10px; font-size: 12px;">查看用户信息</button>
            `
            document.body.appendChild(testButtonContainer)

            // 全局方法
            window.refreshUserInfo = this.refreshUserInfo.bind(this)
            window.addTestData = this.addTestData.bind(this)
            window.showCurrentUser = this.showCurrentUserInfo.bind(this)
        },

        // 刷新用户信息
        async refreshUserInfo() {
            try {
                // 手动调用Store的GetInfo action来刷新用户信息
                await this.$store.dispatch('GetInfo')

                // 重新获取用户信息
                this.getCurrentUser()

                this.$message.success('用户信息已刷新')

            } catch (error) {

                this.$message.error('刷新用户信息失败: ' + (error.message || '未知错误'))
            }
        },

        // 设置测试用户
        setTestUser() {
            this.currentUser = {
                userId: 1,
                userName: 'admin',
                nickName: 'admin',
                deptId: 103,
                deptName: '103部门'
            }


            this.$message.success('测试用户已设置：admin (103部门)')
        },

        // 添加测试数据
        addTestData() {
            // 使用当前用户的部门信息创建测试数据
            const currentDeptId = this.currentUser?.deptId || 103
            const currentDeptName = this.currentUser?.deptName || '研发部'
            const currentUserName = this.currentUser?.nickName || 'admin'

            // 确保部门映射表中有当前部门的信息
            if (currentDeptId && currentDeptName) {
                this.deptIdToNameMap.set(currentDeptId, currentDeptName);
            }
            // 添加一些其他测试部门
            this.deptIdToNameMap.set(999, '其他部门');
            this.deptIdToNameMap.set(101, '生产部');
            this.deptIdToNameMap.set(102, '质检部');

            const testData = [
                {
                    id: 'test-1',
                    workOrderNo: 'TEST-001',
                    categoryName: '测试品类',
                    computerName: '测试型号',
                    problemDesc: '测试问题描述 - 待处理状态（责任部门可开始处理）',
                    processType: 1, // 待处理
                    reporter: currentUserName,
                    responsible: currentUserName,
                    responsibleDept: currentDeptName, // 部门名称 (string)
                    responsibleDeptId: String(currentDeptId), // 部门ID (string)
                    processName: '',
                    remark: '这是一个测试备注信息',
                    createdTime: new Date().toISOString()
                },
                {
                    id: 'test-2',
                    workOrderNo: 'TEST-002',
                    categoryName: '测试品类',
                    computerName: '测试型号',
                    problemDesc: '测试问题描述 - 处理中状态（责任人可完成处理）',
                    processType: 2, // 处理中
                    reporter: 'other_user',
                    responsible: currentUserName, // 责任人是当前用户，可以完成处理
                    responsibleDept: currentDeptName, // 部门名称 (string)
                    responsibleDeptId: String(currentDeptId), // 部门ID (string)
                    processName: 'processor_user', // 处理人是其他用户
                    remark: '正在处理中的报警备注',
                    createdTime: new Date().toISOString()
                },
                {
                    id: 'test-3',
                    workOrderNo: 'TEST-003',
                    categoryName: '测试品类',
                    computerName: '测试型号',
                    problemDesc: '测试问题描述 - 待验证状态（上报人可验证）',
                    processType: 3, // 已处理待验证
                    reporter: currentUserName, // 上报人是当前用户，可以验证
                    responsible: 'other_responsible',
                    responsibleDept: currentDeptName, // 部门名称 (string)
                    responsibleDeptId: String(currentDeptId), // 部门ID (string)
                    processName: 'processor_user',
                    createdTime: new Date().toISOString()
                },
                {
                    id: 'test-4',
                    workOrderNo: 'TEST-004',
                    categoryName: '测试品类',
                    computerName: '测试型号',
                    problemDesc: '测试问题描述 - 其他部门待处理（不应显示按钮）',
                    processType: 1, // 待处理
                    reporter: 'other_user',
                    responsible: 'other_user',
                    responsibleDept: '其他部门', // 不同部门，不能开始处理
                    responsibleDeptId: 999,
                    processName: '',
                    createdTime: new Date().toISOString()
                },
                {
                    id: 'test-7',
                    workOrderNo: 'TEST-007',
                    categoryName: '测试品类',
                    computerName: '测试型号',
                    problemDesc: '测试问题描述 - 生产部门报警',
                    processType: 1, // 待处理
                    reporter: 'prod_user',
                    responsible: 'prod_manager',
                    responsibleDept: '生产部', // 部门名称 (string)
                    responsibleDeptId: '101', // 部门ID (string)
                    processName: '',
                    remark: '生产线设备异常，需要紧急处理',
                    createdTime: new Date().toISOString()
                },
                {
                    id: 'test-8',
                    workOrderNo: 'TEST-008',
                    categoryName: '测试品类',
                    computerName: '测试型号',
                    problemDesc: '测试问题描述 - 质检部门报警',
                    processType: 2, // 处理中
                    reporter: 'qc_user',
                    responsible: 'qc_manager',
                    responsibleDept: '质检部', // 部门名称 (string)
                    responsibleDeptId: '102', // 部门ID (string)
                    processName: 'qc_processor',
                    remark: '质量检查发现问题',
                    createdTime: new Date().toISOString()
                },
                {
                    id: 'test-5',
                    workOrderNo: 'TEST-005',
                    categoryName: '测试品类',
                    computerName: '测试型号',
                    problemDesc: '测试问题描述 - 其他人处理中（不应显示完成按钮）',
                    processType: 2, // 处理中
                    reporter: currentUserName,
                    responsible: 'other_responsible', // 责任人不是当前用户
                    responsibleDept: currentDeptName, // 部门名称 (string)
                    responsibleDeptId: String(currentDeptId), // 部门ID (string)
                    processName: 'processor_user',
                    createdTime: new Date().toISOString()
                },
                {
                    id: 'test-6',
                    workOrderNo: 'TEST-006',
                    categoryName: '测试品类',
                    computerName: '测试型号',
                    problemDesc: '测试问题描述 - 其他人上报待验证（不应显示验证按钮）',
                    processType: 3, // 已处理待验证
                    reporter: 'other_reporter', // 上报人不是当前用户
                    responsible: currentUserName,
                    responsibleDept: currentDeptName, // 部门名称 (string)
                    responsibleDeptId: String(currentDeptId), // 部门ID (string)
                    processName: 'processor_user',
                    createdTime: new Date().toISOString()
                }
            ]

            // 添加到表格数据前面
            this.tableData = [...testData, ...this.tableData]



            this.$message.success(`测试数据已添加！使用部门: ${currentDeptName}(ID:${currentDeptId})，用户: ${currentUserName}`)
        },

        // 显示当前用户信息
        showCurrentUserInfo() {
            const userInfo = `
当前用户信息：
- 用户名: ${this.currentUser?.userName || '未获取'}
- 昵称: ${this.currentUser?.nickName || '未获取'}
- 部门ID: ${this.currentUser?.deptId || '未获取'}
- 部门名称: ${this.currentUser?.deptName || '未获取'}

测试说明：
1. 待处理(状态1): 只有责任部门的人可以看到"开始处理"按钮
2. 处理中(状态2): 只有责任人可以看到"完成处理"按钮
3. 待验证(状态3): 只有上报人可以看到"验证"按钮
            `
            alert(userInfo)
        },

        // 搜索功能
        handleSearch() {
            // 处理日期范围 - 转换为时间戳
            if (this.dateRange && this.dateRange.length === 2) {
                // 将日期字符串转换为时间戳（毫秒）
                this.searchForm.startTime = new Date(this.dateRange[0] + ' 00:00:00').getTime()
                this.searchForm.endTime = new Date(this.dateRange[1] + ' 23:59:59').getTime()
            } else {
                this.searchForm.startTime = null
                this.searchForm.endTime = null
            }



            this.pagination.current = 1
            this.fetchData()
        },

        // 重置搜索
        handleReset() {
            // 重置表单
            this.$refs.searchForm.resetFields()

            // 重置日期范围
            this.dateRange = []

            // 重置搜索表单数据
            this.searchForm = {
                workOrderNo: '',
                categoryName: '',
                computerName: '',
                processType: null,
                reporter: '',
                responsible: '',
                responsibleDept: null, // 改为null，与treeselect兼容
                processName: '',
                startTime: null,
                endTime: null
            }

            this.pagination.current = 1
            this.fetchData()
        },



        // 工单号自动完成查询
        queryWorkOrders(queryString, callback) {
            // TODO: 调用实际的API获取工单号建议
            const workOrders = [
                { value: 'WO202401001', desc: '电子产品生产工单' },
                { value: 'WO202401002', desc: '机械设备维护工单' },
                { value: 'WO202401003', desc: '化工产品检测工单' },
                { value: 'WO202401004', desc: '纺织品质检工单' }
            ]

            const results = queryString
                ? workOrders.filter(item => item.value.toLowerCase().includes(queryString.toLowerCase()))
                : workOrders

            callback(results)
        },

        // 工单号选择处理
        handleWorkOrderSelect(item) {
            this.searchForm.workOrderNo = item.value
            // 可以根据工单号自动填充其他相关信息

        },

        // 品类变更处理
        handleCategoryChange(categoryName) {
            this.searchForm.computerName = ''

            if (!categoryName) {
                // 显示所有型号
                const allComputers = []
                this.categoryComputerData.forEach(category => {
                    if (category.computerList && Array.isArray(category.computerList)) {
                        category.computerList.forEach(computer => {
                            allComputers.push({
                                label: computer.name,
                                value: computer.name,
                                categoryName: category.name
                            })
                        })
                    }
                })
                this.computerOptions = allComputers
            } else {
                // 根据品类过滤型号
                const selectedCategory = this.categoryComputerData.find(item => item.name === categoryName)
                if (selectedCategory && selectedCategory.computerList) {
                    this.computerOptions = selectedCategory.computerList.map(computer => ({
                        label: computer.name,
                        value: computer.name,
                        categoryName: categoryName
                    }))
                } else {
                    this.computerOptions = []
                }
            }
        },

        // 搜索表单部门变化时加载对应人员（与AlertForm完全一致）
        async handleSearchDeptChange(deptId) {
            if (!deptId) {
                this.applicantList = []
                this.searchForm.responsible = ''
                return
            }

            try {
                this.computerLoading = true
                const response = await listUser({ deptId })
                if (response.code === 200) {
                    this.applicantList = response.rows || []
                } else {
                    this.$message.error('获取人员数据失败')
                    this.applicantList = []
                }
            } catch (error) {

                this.$message.error('获取人员数据失败')
                this.applicantList = []
            } finally {
                this.computerLoading = false
            }

            // 清空已选择的人员
            this.searchForm.responsible = ''
        },

        // 新增报警
        handleAdd() {
            // 调试信息
            console.log('🔍 按钮点击调试信息:')
            console.log('1. 用户权限:', this.$store.getters.permissions)
            console.log('2. 是否有新增权限:', this.$auth.hasPermi(['production:alerts:add']))
            console.log('3. 当前用户信息:', this.currentUser)

            this.currentEditData = null
            this.alertFormVisible = true

            console.log('4. 对话框状态:', this.alertFormVisible)
        },

        // 切换调试模式
        toggleDebugMode() {
            this.debugMode = !this.debugMode
            this.$message.info(`调试模式已${this.debugMode ? '开启' : '关闭'}`)
            if (this.debugMode) {
                console.log('🔍 调试模式已开启，可以查看权限和按钮状态信息')
            }
        },

        // 查看详情
        handleView(row) {
            this.currentDetailData = { ...row }
            this.detailDialogVisible = true
        },

        // 编辑报警
        handleEdit(row) {
            this.currentEditData = { ...row }
            this.alertFormVisible = true
        },

        // 表单提交成功回调
        handleFormSuccess(data) {
            this.fetchData()

            // 显示成功通知
            if (data && data.id) {
                this.showNotification(
                    '操作成功',
                    `报警 ${data.workOrderNo || data.id} 已成功${this.currentEditData ? '更新' : '创建'}`,
                    'success'
                )
            }
        },

        // 开始处理报警
        async handleStartProcess(row) {
            try {
                const confirmed = await this.$confirm(
                    `工单号：${row.workOrderNo}\n\n是否接受此报警并开始处理？`,
                    '接受处理',
                    {
                        confirmButtonText: '接受并开始处理',
                        cancelButtonText: '暂不处理',
                        type: 'warning',
                        dangerouslyUseHTMLString: false
                    }
                )

                if (confirmed) {
                    const processName = this.currentUser?.nickName || 'admin'
                    await startProcessAlert(row.id, processName)
                    this.$message.success('已接受处理')
                    this.fetchData()
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error('开始处理失败：' + (error.message || '未知错误'))
                }
            }
        },

        // 完成处理报警
        async handleCompleteProcess(row) {
            try {
                const confirmed = await this.$confirm(
                    `工单号：${row.workOrderNo}\n问题描述：${row.problemDesc}\n\n确认已完成处理此报警？`,
                    '完成处理确认',
                    {
                        confirmButtonText: '确认完成',
                        cancelButtonText: '取消',
                        type: 'success',
                        dangerouslyUseHTMLString: false
                    }
                )

                if (confirmed) {
                    await completeProcessAlert(row.id)
                    this.$message.success('处理完成')
                    this.fetchData()
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error('完成处理失败：' + (error.message || '未知错误'))
                }
            }
        },

        // 验证处理结果
        handleVerifyProcess(row) {
            this.currentProcessRow = row
            this.verifyForm = {
                type: 1,
                remark: ''
            }
            this.verifyProcessDialogVisible = true
        },

        // 确认验证处理结果
        async confirmVerifyProcess() {
            try {
                await verifyProcessResult(this.currentProcessRow.id, this.verifyForm.type)
                const message = this.verifyForm.type === 1 ? '验证完成' : '验证不通过，已重新处理'
                this.$message.success(message)
                this.verifyProcessDialogVisible = false
                this.fetchData()
            } catch (error) {
                this.$message.error('验证失败：' + (error.message || '未知错误'))
            }
        },



        // 删除报警
        async handleDelete(row) {
            // 检查是否可以删除
            if (row.processType === 2) {
                this.showError('正在处理中的报警无法删除')
                return
            }

            const confirmed = await this.confirmAction(
                `确定要删除工单号为 "${row.workOrderNo}" 的报警记录吗？\n删除后将无法恢复。`,
                '删除确认',
                'warning'
            )

            if (!confirmed) {
                this.showInfo('已取消删除')
                return
            }

            try {
                this.showLoading('正在删除...')
                const response = await deleteProductionAlert(row.id)

                if (response.code === 200) {
                    this.showSuccess('删除成功')
                    this.fetchData()

                    // 记录操作日志
                    this.logUserAction('delete', row)
                } else {
                    this.handleApiError(response, '删除失败')
                }
            } catch (error) {
                this.handleNetworkError(error, '删除报警失败')
            } finally {
                this.hideLoading()
            }
        },

        // 记录用户操作日志
        logUserAction(action, data) {
            const log = {
                timestamp: new Date().toISOString(),
                user: this.$store.getters.name || '未知用户',
                action,
                target: data.workOrderNo || data.id,
                details: data
            }


            // TODO: 发送到后端记录
        },

        // 批量删除
        handleBatchDelete() {
            if (this.selectedRows.length === 0) {
                this.$message.warning('请选择要删除的记录')
                return
            }

            // 检查选中项中是否有正在处理的报警
            const processingAlerts = this.selectedRows.filter(row => row.processType === 2)
            if (processingAlerts.length > 0) {
                this.$message.error(`选中项中有 ${processingAlerts.length} 条正在处理的报警，无法删除`)
                return
            }

            this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条记录吗？`, '批量删除确认', {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning',
                customClass: 'batch-delete-confirm'
            }).then(async () => {
                try {
                    const ids = this.selectedRows.map(row => row.id).join(',')
                    const response = await batchDeleteProductionAlerts(ids)
                    if (response.code === 200) {
                        this.$message.success(`成功删除 ${this.selectedRows.length} 条记录`)
                        this.selectedRows = []
                        this.fetchData()
                    } else {
                        this.$message.error(response.msg || '删除失败')
                    }
                } catch (error) {

                    this.$message.error('删除失败')
                }
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },















        // 详情编辑处理
        handleDetailEdit(alertData) {
            this.currentEditData = alertData
            this.alertFormVisible = true
        },









        // 表格选择项变化
        handleSelectionChange(selection) {
            this.selectedRows = selection
        },

        // 分页大小改变
        handleSizeChange(val) {
            this.pagination.size = val
            this.pagination.current = 1 // 重置到第一页
            this.fetchData()

            // 记录用户偏好
            this.saveUserPreference('pageSize', val)
        },

        // 当前页改变
        handleCurrentChange(val) {
            this.pagination.current = val
            this.fetchData()
        },

        // 保存用户偏好
        saveUserPreference(key, value) {
            try {
                const preferences = JSON.parse(localStorage.getItem('alertsPreferences') || '{}')
                preferences[key] = value
                localStorage.setItem('alertsPreferences', JSON.stringify(preferences))
            } catch (error) {

            }
        },

        // 加载用户偏好
        loadUserPreferences() {
            try {
                const preferences = JSON.parse(localStorage.getItem('alertsPreferences') || '{}')

                // 应用分页偏好
                if (preferences.pageSize) {
                    this.pagination.size = preferences.pageSize
                }

                // 应用搜索偏好
                if (preferences.searchForm) {
                    Object.assign(this.searchForm, preferences.searchForm)
                }

                // 应用列显示偏好
                if (preferences.columnSettings) {
                    this.columnSettings = preferences.columnSettings
                }
            } catch (error) {

            }
        },

        // 数据缓存管理
        cacheData(key, data, expireTime = 5 * 60 * 1000) { // 默认5分钟过期
            try {
                const cacheItem = {
                    data,
                    timestamp: Date.now(),
                    expireTime
                }
                sessionStorage.setItem(`alerts_cache_${key}`, JSON.stringify(cacheItem))
            } catch (error) {

            }
        },

        // 获取缓存数据
        getCachedData(key) {
            try {
                const cached = sessionStorage.getItem(`alerts_cache_${key}`)
                if (!cached) return null

                const cacheItem = JSON.parse(cached)
                const now = Date.now()

                // 检查是否过期
                if (now - cacheItem.timestamp > cacheItem.expireTime) {
                    sessionStorage.removeItem(`alerts_cache_${key}`)
                    return null
                }

                return cacheItem.data
            } catch (error) {

                return null
            }
        },

        // 清除缓存
        clearCache() {
            try {
                const keys = Object.keys(sessionStorage)
                keys.forEach(key => {
                    if (key.startsWith('alerts_cache_')) {
                        sessionStorage.removeItem(key)
                    }
                })
            } catch (error) {

            }
        },

        // 数据预加载
        async preloadData() {
            try {
                // 预加载下一页数据
                if (this.pagination.current < Math.ceil(this.pagination.total / this.pagination.size)) {
                    const nextPageParams = {
                        p: this.pagination.current + 1,
                        l: this.pagination.size,
                        ...this.searchForm
                    }

                    const response = await getProductionAlertsList(nextPageParams)
                    if (response.code === 200) {
                        this.cacheData(`page_${this.pagination.current + 1}`, response.data)
                    }
                }
            } catch (error) {
                // 预加载失败不影响主流程

            }
        },

        // 智能分页
        getOptimalPageSize() {
            // 根据屏幕高度计算最佳分页大小
            const screenHeight = window.innerHeight
            const headerHeight = 200 // 头部高度
            const footerHeight = 100 // 底部高度
            const rowHeight = 60 // 每行高度

            const availableHeight = screenHeight - headerHeight - footerHeight
            const optimalRows = Math.floor(availableHeight / rowHeight)

            // 限制在合理范围内
            return Math.max(10, Math.min(50, optimalRows))
        },

        // 数据排序管理
        handleSortChange({ column, prop, order }) {


            // 保存排序偏好
            this.saveUserPreference('sortConfig', { prop, order })

            // 客户端排序（如果数据量不大）
            if (this.tableData.length <= 100) {
                this.clientSideSort(prop, order)
            } else {
                // 服务端排序
                this.serverSideSort(prop, order)
            }
        },

        // 客户端排序
        clientSideSort(prop, order) {
            if (!prop || !order) {
                this.tableData = [...this.originalTableData] // 恢复原始顺序
                return
            }

            this.tableData.sort((a, b) => {
                let aVal = a[prop]
                let bVal = b[prop]

                // 处理不同数据类型
                if (prop === 'createdTime' || prop === 'processStartTime') {
                    aVal = new Date(aVal || 0).getTime()
                    bVal = new Date(bVal || 0).getTime()
                } else if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase()
                    bVal = (bVal || '').toLowerCase()
                }

                if (order === 'ascending') {
                    return aVal > bVal ? 1 : -1
                } else {
                    return aVal < bVal ? 1 : -1
                }
            })
        },

        // 服务端排序
        async serverSideSort(prop, order) {
            // TODO: 实现服务端排序
            this.searchForm.sortBy = prop
            this.searchForm.sortOrder = order
            this.pagination.current = 1
            await this.fetchData()
        },



        // 数据统计
        getDataStatistics() {
            return {
                total: this.pagination.total,
                currentPage: this.tableData.length,
                statusDistribution: this.getStatusDistribution(),
                avgProcessingTime: 0 // 已移除处理时长统计
            }
        },

        // 获取处理状态标签
        getProcessTypeLabel(processType) {
            if (processType === null || processType === undefined) {
                return '未知'
            }
            const option = this.processTypeOptions.find(item => item.value === processType)
            return option ? option.label : '未知'
        },

        // 获取处理状态颜色
        getProcessTypeColor(processType) {
            if (processType === null || processType === undefined) {
                return 'info'
            }
            return processTypeColors[processType] || 'info'
        },

        // 获取处理状态图标
        getProcessTypeIcon(processType) {
            if (processType === null || processType === undefined) {
                return 'el-icon-info'
            }
            const iconMap = {
                0: 'el-icon-info',
                1: 'el-icon-warning',
                2: 'el-icon-loading',
                3: 'el-icon-check',
                4: 'el-icon-success'
            }
            return iconMap[processType] || 'el-icon-info'
        },

        // 获取优先级标签
        getPriorityLabel(row) {
            // 根据处理状态和创建时间计算优先级
            if (row.processType === 1) {
                const hours = this.getHoursSinceCreated(row.createdTime)
                if (hours > 24) return '高'
                if (hours > 8) return '中'
                return '低'
            }
            return '-'
        },

        // 获取优先级颜色
        getPriorityColor(row) {
            const priority = this.getPriorityLabel(row)
            const colorMap = {
                '高': 'danger',
                '中': 'warning',
                '低': 'success'
            }
            return colorMap[priority] || 'info'
        },





        // 获取创建时间到现在的小时数
        getHoursSinceCreated(createdTime) {
            if (!createdTime) return 0
            const now = new Date()
            const created = new Date(createdTime)
            return Math.floor((now - created) / (1000 * 60 * 60))
        },

        // 获取时间距离现在的描述
        getTimeAgo(dateTime) {
            if (!dateTime) return ''

            const now = new Date()
            const time = new Date(dateTime)
            const diff = now - time

            const minutes = Math.floor(diff / (1000 * 60))
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))

            if (days > 0) return `${days}天前`
            if (hours > 0) return `${hours}小时前`
            if (minutes > 0) return `${minutes}分钟前`
            return '刚刚'
        },

        // 获取表格行样式类名
        getRowClassName({ row, rowIndex }) {
            let className = ''

            // 根据处理状态设置行样式
            switch (row.processType) {
                case 1: // 待处理
                    className += 'row-pending '
                    break
                case 2: // 处理中
                    className += 'row-processing '
                    break
                case 3: // 已处理待验证
                    className += 'row-awaiting '
                    break
                case 4: // 已验证
                    className += 'row-verified '
                    break
                default:
                    className += 'row-normal '
            }

            // 根据优先级添加样式
            const priority = this.getPriorityLabel(row)
            if (priority === '高') className += 'row-high-priority '

            return className.trim()
        },

        // 处理排序变化
        handleSortChange({ column, prop, order }) {

            // TODO: 实现服务端排序
            this.fetchData()
        },

        // 查看工单详情
        handleViewWorkOrder(workOrderNo) {
            // TODO: 跳转到工单详情页面
            // this.$message.info(`查看工单: ${workOrderNo}`)
        },



        // 格式化日期时间
        formatDateTime(dateTime) {
            if (!dateTime) return '-'
            return new Date(dateTime).toLocaleString('zh-CN')
        }
    }
}
</script>

<style lang="scss" scoped>
.production-alerts-container {
    .search-section {
        margin-bottom: 20px;
        padding: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);





    }

    .table-section {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .pagination-section {
        margin-top: 20px;
        text-align: right;
    }

    .empty-state {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 40px;
        text-align: center;
    }

    // 状态标签样式
    .el-tag {
        font-weight: 500;
    }

    // 操作按钮样式
    .text-red {
        color: #f56c6c;

        &:hover {
            color: #f78989;
        }
    }

    // 工单号自动完成样式
    .work-order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .work-order-desc {
            font-size: 12px;
            color: #909399;
        }
    }

    // 响应式设计
    @media (max-width: 1200px) {
        .search-section {
            .search-form {
                .el-form-item {
                    margin-right: 10px;
                    margin-bottom: 15px;
                }
            }

            .action-section {
                margin-top: 15px;
                flex-wrap: wrap;
                gap: 8px;

                .el-button {
                    margin-left: 0;
                    margin-bottom: 8px;
                }
            }
        }

        .table-section {
            overflow-x: auto;

            ::v-deep .el-table {
                min-width: 1000px;
            }
        }
    }

    @media (max-width: 768px) {
        .search-section {
            padding: 15px;

            .search-form {
                .el-form-item {
                    width: 100%;
                    margin-right: 0;

                    .el-input,
                    .el-select,
                    .el-autocomplete {
                        width: 100% !important;
                    }
                }
            }

            .advanced-search-form {
                .el-form-item {
                    width: 100%;
                    margin-right: 0;

                    .el-input,
                    .el-select,
                    .el-date-picker {
                        width: 100% !important;
                    }
                }
            }

            .action-section {
                width: 100%;
                justify-content: center;

                .el-button {
                    flex: 1;
                    max-width: 150px;
                }

                .el-dropdown {
                    flex: 1;
                    max-width: 150px;

                    .el-button {
                        width: 100%;
                    }
                }
            }
        }

        .pagination-section {
            text-align: center;

            ::v-deep .el-pagination {

                .el-pagination__sizes,
                .el-pagination__jump {
                    display: none;
                }
            }
        }
    }

    @media (max-width: 480px) {
        .search-section {
            padding: 10px;

            .action-section {
                flex-direction: column;

                .el-button,
                .el-dropdown {
                    width: 100%;
                    max-width: none;
                    margin-bottom: 10px;
                }
            }
        }

        .table-section {
            ::v-deep .el-table {

                .el-table__header-wrapper,
                .el-table__body-wrapper {
                    overflow-x: auto;
                }

                // 隐藏部分列在小屏幕上
                .el-table-column--selection,
                .el-table__column:nth-child(3),
                // 品类名称
                .el-table__column:nth-child(4),
                // 型号名称
                .el-table__column:nth-child(7),
                // 责任人
                .el-table__column:nth-child(8),
                // 责任部门
                .el-table__column:nth-child(10),
                // 处理时长
                .el-table__column:nth-child(11),
                // 备注
                .el-table__column:nth-child(12) {
                    // 创建时间
                    display: none;
                }
            }
        }
    }

    // 无障碍设计
    .accessibility-enhanced {

        // 高对比度模式
        &.high-contrast {
            .el-button--primary {
                background-color: #000080;
                border-color: #000080;

                &:hover {
                    background-color: #0000cd;
                    border-color: #0000cd;
                }
            }

            .el-tag {
                border: 2px solid;
                font-weight: bold;
            }

            .el-table {
                border: 2px solid #333;

                th,
                td {
                    border: 1px solid #333;
                }
            }
        }

        // 大字体模式
        &.large-font {
            font-size: 16px;

            .el-button {
                font-size: 16px;
                padding: 12px 20px;
            }

            .el-input__inner {
                font-size: 16px;
                height: 44px;
                line-height: 44px;
            }

            .el-table {
                font-size: 16px;

                .el-table__cell {
                    padding: 16px 0;
                }
            }
        }

        // 键盘导航增强
        .keyboard-focus {
            outline: 3px solid #409eff;
            outline-offset: 2px;
        }
    }

    // 打印样式
    @media print {

        .search-section,
        .pagination-section,
        .action-section {
            display: none;
        }

        .table-section {
            .el-table__column:last-child {
                display: none; // 隐藏操作列
            }
        }

        .el-tag {
            border: 1px solid #000;
            color: #000 !important;
            background: transparent !important;
        }
    }

    // 深色主题支持
    @media (prefers-color-scheme: dark) {
        .production-alerts-container {
            background-color: #1a1a1a;
            color: #e0e0e0;

            .search-section,
            .table-section,
            .empty-state {
                background-color: #2d2d2d;
                border-color: #404040;
            }

            .el-input__inner {
                background-color: #3d3d3d;
                border-color: #505050;
                color: #e0e0e0;
            }

            .el-table {
                background-color: #2d2d2d;
                color: #e0e0e0;

                th {
                    background-color: #3d3d3d;
                    color: #e0e0e0;
                }

                .el-table__row:hover>td {
                    background-color: #404040;
                }
            }
        }
    }

    // 表格行状态样式
    ::v-deep .row-pending {
        background-color: #fef0f0;

        &:hover {
            background-color: #fde2e2 !important;
        }
    }

    ::v-deep .row-processing {
        background-color: #f0f9ff;

        &:hover {
            background-color: #e1f5fe !important;
        }
    }

    ::v-deep .row-awaiting {
        background-color: #f7f7f7;

        &:hover {
            background-color: #eeeeee !important;
        }
    }

    ::v-deep .row-verified {
        background-color: #f0f9f0;

        &:hover {
            background-color: #e8f5e8 !important;
        }
    }

    ::v-deep .row-high-priority {
        border-left: 4px solid #f56c6c;
    }

    // 状态单元格样式
    .status-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        .processing-indicator {
            color: #409eff;
            animation: spin 1s linear infinite;
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    // 时长单元格样式
    .duration-cell {
        .duration-normal {
            color: #606266;
        }

        .duration-warning {
            color: #e6a23c;
            font-weight: 500;
        }

        .duration-critical {
            color: #f56c6c;
            font-weight: 600;
        }

        .no-duration {
            color: #c0c4cc;
        }
    }

    // 时间单元格样式
    .time-cell {
        .time-ago {
            font-size: 11px;
            color: #909399;
            margin-top: 2px;
        }
    }

    // 工单号单元格样式
    .work-order-cell {
        .el-link {
            font-weight: 500;
        }
    }

    // 备注单元格样式
    .remark-content {
        color: #606266;
        font-size: 12px;
        line-height: 1.4;
    }

    .no-remark {
        color: #c0c4cc;
        font-style: italic;
    }
}
</style>