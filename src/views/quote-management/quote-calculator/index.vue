<template>
    <div class="quote-calculator-page app-container">
        <!-- 页面头部 -->
        <PageHeader @export="handleExport" @clear-all="handleClearAll" @add-new="handleAddNew"
            @language-change="handleLanguageChange" />

        <!-- 报价表格 -->

        <QuoteTable ref="quoteTable" :quote-items="quoteItems" :temporary-key="temporaryKey" :dict-data="dictData"
            :current-language="currentLanguage" @edit="handleEdit" @copy="handleCopy" @delete="handleDelete"
            @batch-delete="handleBatchDelete" @data-updated="handleTableDataUpdated" />

        <!-- 新增报价单弹窗 -->
        <AddQuoteDialog :visible.sync="addDialogVisible" :temporary-key="temporaryKey" :next-id="nextId"
            :edit-data="currentEditData || currentCopyData || (selectedRowIndex >= 0 ? quoteItems[selectedRowIndex] : null)"
            :dict-data="dictData" @save="handleAddConfirm" />
    </div>
</template>

<script>
import PageHeader from './components/PageHeader'
import QuoteTable from './components/QuoteTable'
import AddQuoteDialogRefactored from './components/AddQuoteDialogRefactored'
import { getCustomerTypes, getProductTaxRates, getAfterSalesRates, exportQuotation, deleteQuotationByKey } from '@/api/quote-management/quotation'

export default {
    name: 'QuoteCalculator',
    components: {
        PageHeader,
        QuoteTable,
        AddQuoteDialog: AddQuoteDialogRefactored
    },
    data() {
        return {
            // 报价单数据
            currentQuote: {
                id: '',
                title: '新建报价单',
                customerInfo: {
                    name: '',
                    company: '',
                    contact: '',
                    email: ''
                },
                summary: {
                    subtotal: 0,
                    taxRate: 0,
                    taxAmount: 0,
                    totalAmount: 0,
                    discount: 0
                },
                createdAt: null,
                updatedAt: null,
                createdBy: '',
                status: 'draft' // draft/submitted/approved/rejected
            },

            // 报价项目列表
            quoteItems: [],
            selectedRowIndex: -1, // 当前选中的行索引
            currentEditData: null, // 当前编辑的API数据
            currentCopyData: null, // 当前复制的数据
            temporaryKey: '', // 报价单临时key
            nextId: 1, // 下一个ID计数器

            // UI状态管理
            loading: false,
            calculating: false,
            saving: false,
            exporting: false,
            operating: false, // 正在执行操作（编辑、删除等）

            // 弹窗状态
            dialogVisible: {
                addQuote: false,
                editItem: false,
                specification: false,
                priceConfig: false,
                export: false,
                imagePreview: false
            },

            // 状态管理
            hasUnsavedChanges: false,

            // 字典数据对象
            dictData: {
                customerTypes: [],
                productTaxRates: [],
                afterSalesRates: []
            },

            // 语言设置
            currentLanguage: 'zh' // zh: 中文, en: 英文
        }
    },
    computed: {
        // 计算属性
        totalItems() {
            return this.quoteItems.length
        },

        validItems() {
            return this.quoteItems.filter(item => item.model && item.quantity > 0)
        },

        grandTotal() {
            return this.currentQuote.summary.totalAmount || 0
        },

        selectedItem() {
            return this.selectedRowIndex >= 0 ? this.quoteItems[this.selectedRowIndex] : null
        },

        // 弹窗状态简化访问
        addDialogVisible: {
            get() {
                return this.dialogVisible.addQuote
            },
            set(value) {
                this.dialogVisible.addQuote = value
            }
        },

        // 是否有未保存的更改
        canSave() {
            return this.hasUnsavedChanges && !this.saving
        },

        // 是否可以导出
        canExport() {
            return this.validItems.length > 0 && !this.exporting
        }
    },

    watch: {
        // 监听报价项目变化
        quoteItems: {
            handler() {
                this.calculateTotal()
                this.markAsChanged()
            },
            deep: true
        }
    },

    created() {
        this.initializeData()
        this.loadDictData()
    },

    mounted() {
        // 生成临时key
        this.generateTemporaryKey()

        // 加载字典数据
        this.loadDictData()

        // 初始化语言设置
        this.initializeLanguage()

        // 初始化数据（在临时key生成后）
        this.initializeData()
    },
    methods: {
        // 生成临时key
        generateTemporaryKey() {
            // 生成基于时间戳和随机数的唯一key
            let temporaryKey = sessionStorage.getItem('quote_temporary_key')
            if (!temporaryKey) {
                const timestamp = Date.now()
                const random = Math.random().toString(36).substring(2, 15)
                this.temporaryKey = `quote_${timestamp}_${random}`
                sessionStorage.setItem('quote_temporary_key', this.temporaryKey)
            } else {
                this.temporaryKey = temporaryKey
            }
        },

        // 初始化数据
        initializeData() {
            // 加载报价数据
            this.loadQuoteData()
        },

        // 加载字典数据
        async loadDictData() {
            try {
                // 并行加载所有字典数据
                const [customerTypesRes, taxRatesRes, afterSalesRes] = await Promise.all([
                    getCustomerTypes().catch(e => ({ code: 500, data: [] })),
                    getProductTaxRates().catch(e => ({ code: 500, data: [] })),
                    getAfterSalesRates().catch(e => ({ code: 500, data: [] }))
                ])

                // 转换客户类型数据
                if (customerTypesRes.code === 200) {
                    this.dictData.customerTypes = (customerTypesRes.data || []).map(item => ({
                        value: item.dictCode,
                        label: item.dictLabel
                    }))
                }

                // 转换产品税率数据
                if (taxRatesRes.code === 200) {
                    this.dictData.productTaxRates = (taxRatesRes.data || []).map(item => ({
                        value: item.dictCode,
                        label: item.dictLabel
                    }))
                }

                // 转换售后费用数据
                if (afterSalesRes.code === 200) {
                    this.dictData.afterSalesRates = (afterSalesRes.data || []).map(item => ({
                        value: item.dictCode,
                        label: item.dictLabel
                    }))
                }

                console.log('字典数据加载完成:', this.dictData)
            } catch (error) {
                console.error('加载字典数据失败:', error)
            }
        },

        // 加载报价数据
        async loadQuoteData() {
            // 如果有临时key，尝试从API加载数据
            if (this.temporaryKey) {
                // 等待表格组件加载数据，数据会通过handleTableDataUpdated同步到quoteItems
                console.log('等待表格组件加载数据，临时key:', this.temporaryKey)
            } else {
                // 初始化为空数据，等待用户添加报价单
                this.quoteItems = []
                this.nextId = 1 // 重置ID计数器
                this.calculateTotal()
            }
        },

        // 从API数据中设置nextId
        setNextIdFromData(items) {
            if (items && items.length > 0) {
                // 找到最大的ID值，设置下一个ID
                const maxId = Math.max(...items.map(item => parseInt(item.id) || 0))
                this.nextId = maxId + 1
                console.log('根据API数据更新nextId:', this.nextId, '数据长度:', items.length, '最大ID:', maxId)
            } else {
                this.nextId = 1
                console.log('重置nextId为1（无数据）')
            }
        },

        // 处理表格数据更新事件
        handleTableDataUpdated(tableData) {
            console.log('表格数据已更新:', tableData)
            // 同步表格数据到quoteItems
            this.quoteItems = tableData || []
            // 根据最新的表格数据更新nextId
            this.setNextIdFromData(tableData)
            // 重新计算总价
            this.calculateTotal()
        },



        // 导出报价单
        async handleExport() {
            // 先刷新数据确保最新
            this.refreshData()

            // 等待一下让数据加载完成
            await this.$nextTick()

            if (this.quoteItems.length === 0) {
                this.$message.warning('暂无数据可导出')
                return
            }

            try {
                console.log('导出数据，临时key:', this.temporaryKey)
                console.log('当前报价项目数量:', this.quoteItems.length)

                // 调用导出API
                const response = await exportQuotation({
                    key: this.temporaryKey,
                    isEn: this.currentLanguage === 'en' ? 1 : 0
                })

                console.log("🚀 ~ handleExport ~ response:", response)
                if (response.code === 200) {
                    // 使用全局的download方法下载文件
                    this.download(response.msg)
                } else {
                    this.$message.error(response.msg || '导出失败')
                }
            } catch (error) {
                console.error('导出失败:', error)
                this.$message.error('导出失败，请重试')
            }
        },
        // 刷新数据
        refreshData() {
            console.log('手动刷新数据')
            if (this.$refs.quoteTable) {
                this.$refs.quoteTable.refreshData()
            }
        },

        // 清空表单
        async handleClearAll() {
            if (this.operating) {
                this.$message.warning('正在执行其他操作，请稍候')
                return
            }

            if (this.quoteItems.length === 0) {
                this.$message.info('当前表单已为空')
                return
            }

            const confirmMessage = `确定要清空整个报价表单吗？\n\n此操作将：\n• 删除所有报价项目（${this.quoteItems.length} 项）\n• 清空所有临时数据\n• 重置表单状态\n\n删除后将无法恢复。`

            this.$confirm(confirmMessage, '清空表单确认', {
                confirmButtonText: '确定清空',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: false
            }).then(async () => {
                try {
                    this.operating = true

                    // 清空本地数据
                    this.resetQuote()

                    // 重新生成临时key
                    this.generateTemporaryKey()

                    // 刷新表格
                    if (this.$refs.quoteTable) {
                        this.$refs.quoteTable.refreshData()
                    }

                    this.$message.success('表单已清空')

                } catch (error) {
                    console.error('清空表单失败:', error)
                    this.$message.error('清空表单失败，请重试')
                } finally {
                    this.operating = false
                }
            }).catch(() => {
                console.log('用户取消清空操作')
            })
        },

        // 新增报价单
        handleAddNew() {
            // 清除选中状态，确保是新增模式
            this.selectedRowIndex = -1
            this.currentEditData = null
            this.currentCopyData = null
            this.addDialogVisible = true
        },

        // 处理语言切换
        handleLanguageChange(language) {
            console.log('语言切换:', language)
            this.currentLanguage = language
            // 保存语言设置到本地存储
            localStorage.setItem('spec-language', language)
        },

        // 初始化语言设置
        initializeLanguage() {
            // 从本地存储恢复语言设置
            const savedLanguage = localStorage.getItem('spec-language')
            if (savedLanguage && ['zh', 'en'].includes(savedLanguage)) {
                this.currentLanguage = savedLanguage
                console.log('恢复语言设置:', savedLanguage)
            } else {
                this.currentLanguage = 'zh' // 默认中文
                console.log('使用默认语言设置: zh')
            }
        },

        // 编辑报价项目
        handleEdit(index, row) {
            // 保存当前编辑的数据
            this.currentEditData = row
            this.selectedRowIndex = -1 // 重置为-1，表示这是API数据编辑
            // 打开编辑弹窗
            this.addDialogVisible = true
        },

        // 复制报价项目
        handleCopy(index, row) {
            if (this.operating) {
                this.$message.warning('正在执行其他操作，请稍候')
                return
            }

            console.log('复制项目，准备弹出新增表单:', index, row)

            try {
                // 创建复制的数据，生成新的ID，用于新增表单
                const copiedData = {
                    ...JSON.parse(JSON.stringify(row)), // 深拷贝避免引用问题
                    id: this.generateId(), // 生成新的递增ID，这样新增表单知道这是复制的数据
                    createdAt: new Date(), // 更新创建时间
                    updatedAt: new Date(),
                    _isCopy: true // 添加标记表示这是复制操作
                }

                // 设置复制数据，但不设置editData（避免显示编辑标题）
                this.currentCopyData = copiedData
                this.currentEditData = null
                this.selectedRowIndex = -1 // 确保是新增模式

                // 弹出新增表单
                this.addDialogVisible = true

                const itemName = this.getItemDisplayName(row, index)
                console.log(`准备复制项目"${itemName}"，已弹出新增表单`)

            } catch (error) {
                this.handleError(error, '复制项目')
                this.$message.error('复制项目失败')
            }
        },

        // 删除报价项目（从表格组件触发的本地删除）
        handleDelete(index, row) {
            if (this.operating) {
                this.$message.warning('正在执行其他操作，请稍候')
                return
            }

            console.log('本地删除项目:', row.id || index, row.model)

            try {
                this.operating = true

                // 记录删除的项目信息用于日志
                const deletedItem = { ...row }
                const itemName = this.getItemDisplayName(row, index)

                // 删除项目
                this.quoteItems.splice(index, 1)

                // 重新编号
                this.updateIndexes()

                // 重新计算总价
                this.calculateTotal()

                // 如果删除的是当前选中的行，清空选中状态
                if (this.selectedRowIndex === index) {
                    this.selectedRowIndex = -1
                } else if (this.selectedRowIndex > index) {
                    // 如果删除的行在当前选中行之前，需要调整选中行索引
                    this.selectedRowIndex--
                }

                console.log('本地删除完成:', deletedItem.id, deletedItem.model)

            } catch (error) {
                this.handleError(error, '删除项目')
                this.$message.error('删除项目失败')
            } finally {
                this.operating = false
            }
        },

        // 新增报价单确认
        async handleAddConfirm(quoteItem) {
            try {

                if (this.currentEditData) {
                    // 编辑API数据模式：直接刷新表格
                    this.$message.success('报价项目更新成功')

                    // 清除编辑状态
                    this.currentEditData = null
                    this.selectedRowIndex = -1

                    // 刷新表格数据
                    await this.$nextTick() // 确保DOM更新完成
                    console.log("🚀 ~ handleAddConfirm ~  this.$refs.quoteTable:", this.$refs.quoteTable)


                } else if (this.currentCopyData) {
                    // 复制模式：创建新项目，使用复制数据的ID（已经是新的递增ID）
                    const newItem = {
                        ...quoteItem,
                        id: this.currentCopyData.id, // 使用复制时生成的新ID
                        index: this.quoteItems.length + 1,
                        createdAt: new Date()
                    }

                    this.quoteItems.push(newItem)
                    this.updateIndexes()
                    this.$message.success('报价项目复制成功')

                    // 清除复制状态
                    this.currentCopyData = null

                } else if (this.selectedRowIndex >= 0) {
                    // 编辑临时数据模式：更新现有项目，保持原有ID
                    const existingItem = this.quoteItems[this.selectedRowIndex]
                    const updatedItem = {
                        ...quoteItem,
                        id: existingItem.id, // 保持原有ID
                        index: this.selectedRowIndex + 1,
                        updatedAt: new Date()
                    }

                    this.$set(this.quoteItems, this.selectedRowIndex, updatedItem)
                    this.$message.success('报价项目更新成功')

                    // 清除选中状态
                    this.selectedRowIndex = -1
                } else {
                    // 新增模式：添加新项目，生成新ID
                    const newItem = {
                        ...quoteItem,
                        id: this.generateId(), // 生成新的递增ID
                        index: this.quoteItems.length + 1,
                        createdAt: new Date()
                    }

                    this.quoteItems.push(newItem)
                    this.updateIndexes()
                    this.$message.success('报价项目创建成功')
                }

                // 重新计算总价
                this.calculateTotal()
                this.markAsChanged()

                // 关闭弹窗
                this.addDialogVisible = false

            } catch (error) {
                this.handleError(error, '处理报价单数据')
                this.$message.error('操作失败')
            }
            this.$refs.quoteTable?.refreshData()
        },

        // 新增报价单取消
        handleAddCancel() {
            // 清除选中状态
            this.selectedRowIndex = -1
            this.addDialogVisible = false
        },

        // 更新序号
        updateIndexes() {
            this.quoteItems.forEach((item, index) => {
                item.index = index + 1
            })
        },

        // 生成唯一ID
        generateId() {
            const id = this.nextId
            console.log(`正在新增报价单，将分配ID: ${id}，保存时将创建新记录`)
            this.nextId++
            console.log(`nextId已更新为: ${this.nextId}`)
            return id
        },

        // 计算总价
        calculateTotal() {
            const subtotal = this.quoteItems.reduce((sum, item) => {
                return sum + (item.totalPrice || 0)
            }, 0)

            this.currentQuote.summary.subtotal = subtotal
            this.currentQuote.summary.totalAmount = subtotal + this.currentQuote.summary.taxAmount - this.currentQuote.summary.discount
        },

        // 标记为已更改
        markAsChanged() {
            this.hasUnsavedChanges = true
        },

        // 启动自动保存（简化版）
        startAutoSave() {
            // 自动保存功能暂时禁用
        },

        // 停止自动保存（简化版）
        stopAutoSave() {
            // 自动保存功能暂时禁用
        },

        // 自动保存（简化版）
        async autoSave() {
            // 自动保存功能暂时禁用
        },

        // 保存报价数据（简化版）
        async saveQuoteData(silent = false) {
            // 保存功能暂时禁用，等待API接入
            if (!silent) {
                this.$message.info('保存功能开发中...')
            }
        },

        // 页面离开前处理（简化版）
        handleBeforeUnload(event) {
            // 暂时禁用离开提示
        },

        // 添加新的报价项目
        addQuoteItem(itemData) {
            const newItem = {
                id: this.generateId(),
                index: this.quoteItems.length + 1,
                image: null,
                model: itemData.model || '',
                specification: itemData.specification || {},
                priceConfig: itemData.priceConfig || {},
                quantity: itemData.quantity || 1,
                unitPrice: itemData.unitPrice || 0,
                totalPrice: itemData.totalPrice || 0,
                remarks: itemData.remarks || '',
                createdAt: new Date()
            }

            this.quoteItems.push(newItem)
            this.updateIndexes()
            this.calculateTotal()
            this.markAsChanged()
            return newItem
        },

        // 更新报价项目
        updateQuoteItem(index, itemData) {
            if (index >= 0 && index < this.quoteItems.length) {
                const updatedItem = {
                    ...this.quoteItems[index],
                    ...itemData,
                    updatedAt: new Date()
                }

                this.$set(this.quoteItems, index, updatedItem)
                this.calculateTotal()
                this.markAsChanged()
                return updatedItem
            }
            return null
        },

        // 验证报价项目数据
        validateQuoteItem(item) {
            return { isValid: true, errors: [] }
        },

        // 获取项目显示名称
        getItemDisplayName(item, index) {
            return item.model || `第${index + 1}项`
        },

        // 获取项目详细信息用于删除确认
        getItemDetailForDelete(item, index) {
            const name = this.getItemDisplayName(item, index)
            const price = item.totalPrice ? `￥${item.totalPrice.toFixed(2)}` : '未定价'
            const quantity = item.quantity || 1
            const spec = item.standardSpec || item.standardSpecEn || ''
            return `${name}${spec ? ` (${spec})` : ''} - 数量: ${quantity}, 总价: ${price}`
        },

        // 检查是否有未保存的更改
        hasUnsavedData() {
            return this.hasUnsavedChanges
        },

        // 获取项目统计信息
        getItemsStatistics() {
            const total = this.quoteItems.length
            const valid = this.validItems.length
            const invalid = total - valid
            const totalValue = this.grandTotal

            return {
                total,
                valid,
                invalid,
                totalValue,
                averageValue: total > 0 ? totalValue / total : 0
            }
        },

        // 删除报价项目
        removeQuoteItem(index) {
            if (index >= 0 && index < this.quoteItems.length) {
                const removedItem = this.quoteItems.splice(index, 1)[0]
                this.updateIndexes()
                this.calculateTotal()
                return removedItem
            }
            return null
        },

        // 批量操作
        batchUpdateItems(indexes, updateData) {
            indexes.forEach(index => {
                if (index >= 0 && index < this.quoteItems.length) {
                    this.updateQuoteItem(index, updateData)
                }
            })
        },

        // 批量删除
        batchDeleteItems(indexes) {
            // 从大到小排序，避免删除时索引变化
            const sortedIndexes = indexes.sort((a, b) => b - a)
            const deletedItems = []

            sortedIndexes.forEach(index => {
                const deletedItem = this.removeQuoteItem(index)
                if (deletedItem) {
                    deletedItems.push(deletedItem)
                }
            })

            return deletedItems
        },

        // 重置报价单
        resetQuote() {
            this.currentQuote = {
                id: '',
                title: '新建报价单',
                customerInfo: {
                    name: '',
                    company: '',
                    contact: '',
                    email: ''
                },
                summary: {
                    subtotal: 0,
                    taxRate: 0,
                    taxAmount: 0,
                    totalAmount: 0,
                    discount: 0
                },
                createdAt: null,
                updatedAt: null,
                createdBy: '',
                status: 'draft'
            }

            this.quoteItems = []
            this.selectedRowIndex = -1
            this.hasUnsavedChanges = false
        },

        // 加载配置选项
        async loadConfigOptions() {
            try {
                // TODO: 从API加载配置选项
                // const response = await this.$api.getConfigOptions()
                // this.configOptions = response.data

                // 临时使用默认配置
                console.log('Config options loaded:', this.configOptions)
            } catch (error) {
                console.error('Load config options error:', error)
            }
        },

        // 错误处理
        handleError(error, context = '') {
            console.error(`Error in ${context}:`, error)
        },

        // 清除错误
        clearErrors() {
            this.errors = []
        },



        // 批量删除
        handleBatchDelete(selectedIndexes) {
            if (this.operating) {
                this.$message.warning('正在执行其他操作，请稍候')
                return
            }

            if (selectedIndexes.length === 0) {
                this.$message.warning('请先选择要删除的项目')
                return
            }

            console.log('批量删除项目:', selectedIndexes)

            // 验证索引有效性
            const validIndexes = selectedIndexes.filter(index =>
                index >= 0 && index < this.quoteItems.length
            )

            if (validIndexes.length === 0) {
                this.$message.error('选中的项目无效')
                return
            }

            if (validIndexes.length !== selectedIndexes.length) {
                this.$message.warning('部分选中项目无效，将只删除有效项目')
            }

            // 获取要删除的项目详细信息用于确认提示
            const itemDetails = validIndexes.map(index => {
                const item = this.quoteItems[index]
                return this.getItemDetailForDelete(item, index)
            })

            // 计算总价值
            const totalValue = validIndexes.reduce((sum, index) => {
                const item = this.quoteItems[index]
                return sum + (item.totalPrice || 0)
            }, 0)

            const confirmMessage = validIndexes.length <= 3
                ? `确定要删除以下项目吗？\n\n${itemDetails.join('\n')}\n\n总价值: ￥${totalValue.toFixed(2)}\n删除后将无法恢复。`
                : `确定要删除选中的 ${validIndexes.length} 个项目吗？\n总价值: ￥${totalValue.toFixed(2)}\n删除后将无法恢复。`

            this.$confirm(confirmMessage, '批量删除确认', {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: false
            }).then(() => {
                try {
                    this.operating = true

                    // 从大到小排序，避免删除时索引变化
                    const sortedIndexes = validIndexes.sort((a, b) => b - a)
                    const deletedItems = []

                    // 执行删除操作
                    sortedIndexes.forEach(index => {
                        if (index >= 0 && index < this.quoteItems.length) {
                            const deletedItem = this.quoteItems.splice(index, 1)[0]
                            if (deletedItem) {
                                deletedItems.push(deletedItem)
                            }
                        }
                    })

                    // 重新编号
                    this.updateIndexes()

                    // 重新计算总价
                    this.calculateTotal()

                    // 清空选中状态
                    this.selectedRowIndex = -1

                    const successMessage = deletedItems.length === validIndexes.length
                        ? `已删除 ${deletedItems.length} 个项目`
                        : `已删除 ${deletedItems.length} 个项目（共选中 ${validIndexes.length} 个）`

                    this.$message.success(successMessage)

                    console.log('批量删除完成:', deletedItems.map(item => ({
                        id: item.id,
                        model: item.model
                    })))

                } catch (error) {
                    this.handleError(error, '批量删除项目')
                    this.$message.error('批量删除失败')
                } finally {
                    this.operating = false
                }
            }).catch(() => {
                // 用户取消删除
                console.log('用户取消批量删除操作')
            })
        }
    }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';

.quote-calculator-page {
    // 页面样式
}
</style>