<template>
    <div class="production-alerts-container app-container">
        <!-- 智能搜索区域 -->
        <IntelligentSearchForm :searchForm="searchForm" :fields="searchFields" @search="handleSearch"
            @reset="handleReset" @field-change="handleFieldChange" @layout-changed="handleSearchFormLayoutChanged">
            <!-- 自定义工单号字段渲染 -->
            <template #field-workOrderNo="{ field, searchForm }">
                <el-form-item :label="field.label" :prop="field.key">
                    <el-autocomplete v-model="searchForm[field.key]" placeholder="请输入工单号" clearable style="width: 200px"
                        size="mini">
                    </el-autocomplete>
                </el-form-item>
            </template>

            <!-- 自定义品类字段渲染 -->
            <template #field-categoryName="{ field, searchForm }">
                <el-form-item :label="field.label" :prop="field.key">
                    <el-select v-model="searchForm[field.key]" placeholder="请选择品类" clearable filterable
                        style="width: 150px" @change="handleCategoryChange" size="mini">
                        <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
            </template>

            <!-- 自定义型号字段渲染 -->
            <template #field-computerName="{ field, searchForm }">
                <el-form-item :label="field.label" :prop="field.key">
                    <el-select v-model="searchForm[field.key]" placeholder="请选择型号" clearable filterable
                        style="width: 150px" size="mini">
                        <el-option v-for="item in computerOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
            </template>

            <!-- 自定义责任归属部门字段渲染 -->
            <template #field-responsibleDept="{ field, searchForm }">
                <el-form-item :label="field.label" :prop="field.key" label-width="90px">
                    <treeselect v-model="searchForm[field.key]" :options="deptOptions" :disable-branch-nodes="true"
                        placeholder="请选择责任归属部门" :clearable="true" :searchable="true" @input="handleSearchDeptChange"
                        :loading="deptLoading" style="width: 150px" />
                </el-form-item>
            </template>

            <!-- 自定义责任归属人字段渲染 -->
            <template #field-responsible="{ field, searchForm }">
                <el-form-item :label="field.label" :prop="field.key" label-width="80px">
                    <el-select v-model="searchForm[field.key]" placeholder="请先选择部门" filterable clearable
                        style="width: 150px" :disabled="!searchForm.responsibleDept" :loading="computerLoading"
                        size="mini">
                        <el-option v-for="item in applicantList" :key="item.userId" :label="item.nickName"
                            :value="item.nickName" />
                    </el-select>
                </el-form-item>
            </template>

            <!-- 自定义创建时间字段渲染 -->
            <template #field-dateRange="{ field, searchForm }">
                <el-form-item :label="field.label" :prop="field.key">
                    <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 240px"
                        size="mini" />
                </el-form-item>
            </template>

            <!-- 页面操作按钮 -->
            <template #page-actions>
                <el-button type="primary" @click="handleAdd" icon="el-icon-plus" v-hasPermi="['production:alerts:add']"
                    size="mini">
                    新增报警
                </el-button>
            </template>
        </IntelligentSearchForm>

        <!-- 数据表格 -->
        <div class="table-section">
            <el-table ref="table" :data="tableData" v-loading="loading" border style="width: 100%"
                :height="dynamicTableHeight" :row-class-name="getRowClassName" row-key="id"
                @sort-change="handleSortChange">

                <el-table-column prop="workOrderNo" label="工单号" align="center">
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

                <el-table-column prop="computerName" label="型号名称" align="center" />

                <el-table-column prop="problemDesc" label="问题描述" align="center" min-width="200" show-overflow-tooltip />


                <el-table-column prop="remark" label="备注" align="center" width="120" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span v-if="scope.row.remark" class="remark-content">{{ scope.row.remark }}</span>
                        <span v-else class="no-remark">-</span>
                    </template>
                </el-table-column>


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
                <el-table-column prop="responsibleDept" label="责任部门" align="center" width="120">
                    <template slot-scope="scope">
                        <span>{{ scope.row.responsibleDept || '-' }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="responsible" label="责任人" align="center" width="100" />



                <el-table-column prop="reporter" label="上报人" align="center" width="100" />

                <el-table-column prop="createdTime" label="创建时间" align="center" width="160" sortable>
                    <template slot-scope="scope">
                        <div class="time-cell">
                            <div>{{ formatDateTime(scope.row.createdTime) }}</div>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" v-hasPermi="['production:alerts:view']"
                            @click="handleView(scope.row)" icon="el-icon-view">
                            查看
                        </el-button>
                        <el-button size="mini" type="text" @click="handleEdit(scope.row)" icon="el-icon-edit"
                            v-hasPermi="['production:alerts:edit']" :disabled="scope.row.processType === 4">
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
                            icon="el-icon-delete" v-if="canDelete(scope.row)">
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
import { getProductionAlertsList, deleteProductionAlert, startProcessAlert, completeProcessAlert, verifyProcessResult, PROCESS_STATUS } from '@/api/production-management/alerts'
import { processTypeOptions, processTypeColors } from '@/types/production-alerts'
import categoryService from '@/utils/categoryService'
import { listDept } from '@/api/system/dept'
import { listUser } from '@/api/system/user'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import AlertForm from './components/AlertForm.vue'
import AlertDetail from './components/AlertDetail.vue'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import dynamicTableHeightMixin from '@/mixins/dynamicTableHeight'

export default {
    name: 'ProductionAlerts',
    components: {
        AlertForm,
        AlertDetail,
        Treeselect,
        IntelligentSearchForm
    },
    mixins: [dynamicTableHeightMixin],
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
            // 分页信息
            pagination: {
                current: 1,
                size: 20,
                total: 0
            },

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

            // 高级搜索展开状态
            isAdvancedExpanded: false,

            // IntelligentSearchForm 配置（包含排序权重）
            searchFields: [
                {
                    key: 'workOrderNo',
                    label: '工单号',
                    component: 'el-autocomplete',
                    sort: 1     // 第1位 - 工单号最重要
                },
                {
                    key: 'categoryName',
                    label: '品类名称',
                    component: 'el-select',
                    sort: 2     // 第2位 - 品类重要
                },
                {
                    key: 'processType',
                    label: '处理状态',
                    component: 'el-select',
                    sort: 3     // 第3位 - 处理状态重要
                },
                {
                    key: 'computerName',
                    label: '型号名称',
                    component: 'el-select',
                    sort: 4     // 第4位 - 型号中等重要
                },
                {
                    key: 'responsibleDept',
                    label: '责任归属部门',
                    component: 'treeselect',
                    sort: 5     // 第5位 - 部门
                },
                {
                    key: 'responsible',
                    label: '责任归属人',
                    component: 'el-select',
                    sort: 6     // 第6位 - 责任人
                },
                {
                    key: 'dateRange',
                    label: '创建时间',
                    component: 'el-date-picker',
                    sort: 7     // 第7位 - 时间范围
                }
            ],


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

        // 初始化动态表格高度 (使用自定义配置)
        this.initDynamicTableHeight({
            topOffset: 244  // 根据用户修正的值
        })

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
            // 这里可以发送错误信息到监控系统
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

                // 重新计算表格高度 (使用mixin方法)
                this.refreshTableHeight()
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

        // 加载品类和型号选项（使用共享的CategoryService）
        async loadCategoryAndComputerOptions() {
            try {
                const { categoryOptions, computerOptions } = await categoryService.getFormattedOptions()

                this.categoryOptions = categoryOptions
                this.computerOptions = computerOptions

                // 保存原始数据供品类筛选使用（从CategoryService获取）
                const { categories } = await categoryService.getCategoryData()
                this.categoryComputerData = categories

            } catch (error) {
                console.error('获取品类和型号选项失败:', error)
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

        // 判断是否可以删除 - 只有创建人可以删除
        canDelete(row) {
            if (!this.currentUser || !row) return false

            // 检查是否是创建人（上报人）
            const isCreator = this.currentUser.nickName === row.reporter
            console.log("🚀 ~ file: index.vue:933 ~ isCreator:", isCreator)

            return isCreator
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

        // 处理IntelligentSearchForm字段变化
        handleFieldChange(fieldKey, value) {
            if (fieldKey === 'categoryName') {
                this.handleCategoryChange(value);
            } else if (fieldKey === 'responsibleDept') {
                this.handleSearchDeptChange(value);
            }
        },

        // 切换高级搜索展开状态
        toggleAdvanced() {
            this.isAdvancedExpanded = !this.isAdvancedExpanded

            // 保存用户偏好
            this.saveUserPreference('advancedSearchExpanded', this.isAdvancedExpanded)
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
                // 显示所有型号 - 使用CategoryService重新获取
                categoryService.getFormattedOptions().then(({ computerOptions }) => {
                    this.computerOptions = computerOptions
                }).catch(error => {
                    console.error('获取所有型号失败:', error)
                    this.computerOptions = []
                })
            } else {
                // 根据品类过滤型号 - 使用CategoryService
                const filteredComputers = categoryService.getComputersByCategory(categoryName)
                this.computerOptions = filteredComputers.map(computer => ({
                    label: computer.name,
                    value: computer.name,
                    categoryName: computer.categoryName
                }))
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
            this.currentEditData = null
            this.alertFormVisible = true
        },


        // 查看详情
        handleView(row) {
            this.currentDetailData = { ...row }
            this.detailDialogVisible = true
        },

        // 编辑报警
        handleEdit(row) {
            // 检查是否已完成，已完成的报警不能编辑
            if (row.processType === 4) {
                this.$message.warning('已完成的报警不能编辑')
                return
            }

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
            // 检查删除权限
            if (!this.canDelete(row)) {
                if (!this.currentUser) {
                    this.showError('用户信息获取失败，无法执行删除操作')
                    return
                }

                if (this.currentUser.nickName !== row.reporter) {
                    this.showError('只有报警创建人才能删除该记录')
                    return
                }

                if (row.processType === 2) {
                    this.showError('正在处理中的报警无法删除')
                    return
                }

                this.showError('您没有删除该记录的权限')
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
        logUserAction() {
            // TODO: 实现用户操作日志记录
            // 可以发送到后端记录用户操作
        },

















        // 详情编辑处理
        handleDetailEdit(alertData) {
            // 检查是否已完成，已完成的报警不能编辑
            if (alertData.processType === 4) {
                this.$message.warning('已完成的报警不能编辑')
                return
            }

            this.currentEditData = alertData
            this.alertFormVisible = true
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

                // 应用高级搜索展开状态偏好
                if (preferences.advancedSearchExpanded !== undefined) {
                    this.isAdvancedExpanded = preferences.advancedSearchExpanded
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
        handleSortChange({ prop, order }) {


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
        getRowClassName({ row }) {
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
                case 4: // 已完成
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


        // 查看工单详情
        handleViewWorkOrder() {
            // TODO: 跳转到工单详情页面
        },



        // 格式化日期时间
        formatDateTime(dateTime) {
            if (!dateTime) return '-'
            return new Date(dateTime).toLocaleString('zh-CN')
        },

        // 处理搜索表单布局变化
        handleSearchFormLayoutChanged() {
            // 使用mixin提供的方法重新计算表格高度
            this.refreshTableHeight()
        },



    }
}
</script>

<style lang="scss" scoped>
.production-alerts-container {
    .search-section {
        background: #fff;
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 6px;

        .search-form {
            .search-row {
                display: flex;
                align-items: flex-start;
                flex-wrap: wrap;
                gap: 8px;

                &.primary-row {
                    justify-content: space-between;

                    .action-buttons {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        flex-shrink: 0;
                        margin-left: auto;

                        .toggle-button {
                            color: #606266;
                            padding: 7px 8px;

                            &:hover {
                                color: #409EFF;
                                background-color: #ecf5ff;
                            }
                        }
                    }
                }

                &.advanced-row {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #f0f0f0;
                }
            }

            ::v-deep .el-form-item {
                margin-bottom: 8px;
                margin-right: 12px;

                .el-form-item__label {
                    padding-right: 8px;
                    font-size: 13px;
                    color: #606266;
                }

                .el-input,
                .el-select,
                .el-autocomplete,
                .el-date-picker {

                    &.el-input--mini,
                    &.el-select--mini {
                        .el-input__inner {
                            height: 32px;
                            line-height: 32px;
                            font-size: 13px;
                        }
                    }
                }
            }
        }

        // 响应式设计
        @media (max-width: 1200px) {
            .search-row.primary-row {
                flex-direction: column;
                align-items: stretch;

                .action-buttons {
                    margin-left: 0;
                    margin-top: 8px;
                    justify-content: flex-start;
                    flex-wrap: wrap;
                }
            }
        }

        @media (max-width: 768px) {
            padding: 12px;

            ::v-deep .el-form-item {
                width: 100%;
                margin-right: 0;

                .el-input,
                .el-select,
                .el-autocomplete,
                .el-date-picker {
                    width: 100% !important;
                }
            }

            .action-buttons {
                width: 100%;
                justify-content: space-between;

                .el-button {
                    flex: 1;
                    margin: 0 4px;
                    max-width: 80px;

                    &.toggle-button {
                        flex: 0 0 auto;
                        max-width: none;
                        padding: 7px 12px;
                    }
                }
            }
        }
    }

    .table-section {
        background: #fff;
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