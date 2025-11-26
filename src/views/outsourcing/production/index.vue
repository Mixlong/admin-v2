<template>
  <div class="outsourcing-production-container app-container">
    <!-- 搜索区域 -->
    <IntelligentSearchForm ref="searchForm" :searchForm="searchForm" :fields="searchFields" @search="handleSearch"
      @reset="handleReset" :defaultVisibleCount="4" @filters-cleared="handleReset">
      <!-- 日期范围字段 -->
      <template #field-sellDateRange="{ field }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-date-picker v-model="sellDateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 240px" size="mini"
            @change="handleDateRangeChange('sell')" />
        </el-form-item>
      </template>

      <!-- 发布时间范围字段 -->
      <template #field-publishTimeRange="{ field }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-date-picker v-model="publishTimeRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 240px" size="mini"
            @change="handleDateRangeChange('publish')" />
        </el-form-item>
      </template>

      <!-- 品类字段 -->
      <template #field-categoryId="{ field }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm.categoryId" @change="handleCategoryChange" filterable clearable
            placeholder="请选择品类" style="width: 200px">
            <el-option v-for="dict in categoryList" :key="dict.id" :label="dict.name" :value="dict.id" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 型号字段 -->
      <template #field-computerId="{ field }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm.computerId" :loading="modelLoading" filterable remote clearable
            placeholder="请选择型号" style="width: 200px" :remote-method="getComputerNameList" @change="handleSearch">
            <el-option v-for="dict in modelOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button type="primary" size="mini" @click="handleAdd" v-hasPermi="['outsourcing:production:add']">
          新增
        </el-button>
        <el-button type="primary" size="mini" icon="el-icon-document-copy" @click="handleSyncPurchase"
          v-hasPermi="['outsourcing:production:syncPurchase']">
          新增采购
        </el-button>
        <el-button type="warning" size="mini" icon="el-icon-upload2" @click="handleBatchImport"
          v-hasPermi="['outsourcing:production:import']">
          导入打板
        </el-button>
        <el-button type="success" size="mini" @click="handleAddContact"
          v-hasPermi="['outsourcing:production:addContact']">
          添加联系人
        </el-button>

      </template>
    </IntelligentSearchForm>

    <!-- 表格区域 -->
    <el-table ref="table" :data="tableData" v-loading="loading" border style="width: 100%" :height="tableHeight(-50)"
      row-key="id">
      <!-- 排产单号/料号 -->
      <el-table-column label="排产单号/料号" align="center" width="130">
        <template slot-scope="scope">
          <span v-if="scope.row.productionProcess === 'SMT'">{{
            scope.row.schedulingNo || "--"
            }}</span>
          <span v-else>{{ scope.row.partNo || "--" }}</span>
        </template>
      </el-table-column>

      <!-- 请购单号 -->
      <el-table-column prop="orderCode" label="请购单号" align="center" width="130">
        <template slot-scope="scope">
          <span>{{ scope.row.orderCode || "--" }}</span>
        </template>
      </el-table-column>

      <!-- 品类名称 -->
      <el-table-column prop="categoryName" label="品类" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.categoryName || "--" }}</span>
        </template>
      </el-table-column>

      <!-- 型号/硬件版本号 -->
      <el-table-column label="型号/硬件版本号" align="center" width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.productionProcess === 'SMT'">{{
            scope.row.computerName || "--"
            }}</span>
          <span v-else>{{ scope.row.hwVersion || "--" }}</span>
        </template>
      </el-table-column>

      <!-- 数量 -->
      <el-table-column prop="num" label="数量" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.num || "--" }}</span>
        </template>
      </el-table-column>

      <!-- 生产流程 -->
      <el-table-column prop="productionProcess" label="生产流程" align="center" width="90">
        <template slot-scope="scope">
          <el-tag size="small" :type="scope.row.productionProcess === 'SMT'
            ? 'primary'
            : scope.row.productionProcess === '打板'
              ? 'warning'
              : 'info'
            ">
            {{ scope.row.productionProcess || "--" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 采购单号 -->
      <el-table-column prop="purchaseOrderCode" label="采购单号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.purchaseOrderCode || "--" }}</span>
        </template>
      </el-table-column>

      <!-- 出货日期 -->
      <el-table-column prop="sellDate" label="出货日期" align="center" width="100">
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.sellDate, "{y}-{m}-{d}") || "--"
            }}</span>
        </template>
      </el-table-column>


      <!-- BOM文件 -->
      <el-table-column prop="orderStatus" label="BOM文件" align="center" width="90">
        <template slot-scope="scope">
          <el-tag v-if='scope.row.productionProcess == "SMT"' :type="!!scope.row.smtBomFile ? 'success' : 'danger'"
            size="small" :style="!scope.row.smtBomFile ? 'cursor: pointer;' : ''" @click="handleUploadBom(scope.row)">
            {{ !!scope.row.smtBomFile ? "已上传" : "未上传" }}
          </el-tag>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <!-- 资料状态 -->
      <el-table-column prop="materialStatus" label="资料状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag @click="handleSeeMaterialStatus(scope.row)"
            :type="scope.row.materialStatus === 1 ? 'success' : 'warning'" size="small" style="cursor: pointer">
            {{ scope.row.materialStatus === 1 ? "齐套" : "未齐套" }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 审核状态 -->
      <el-table-column prop="auditStatus" label="审核状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="getAuditStatusType(scope.row.auditStatus)" size="small">
            {{ getAuditStatusText(scope.row.auditStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 订单状态 -->
      <el-table-column prop="orderStatus" label="订单状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.orderStatus === -1 ? 'danger' : 'success'" size="small">
            {{ scope.row.orderStatus === -1 ? "已撤销" : "正常" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 发布时间 -->
      <el-table-column prop="publishTime" label="发布时间" align="center" width="140">
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.publishTime, "{y}-{m}-{d} {h}:{i}:{s}") || "--"
            }}</span>
        </template>
      </el-table-column>

      <!-- 创建人 -->
      <el-table-column prop="createBy" label="创建人" align="center" width="90">
        <template slot-scope="scope">
          <span>{{ scope.row.createBy || "--" }}</span>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" align="center" width="130" fixed="right">
        <template slot-scope="scope">
          <!-- 查看 -->
          <el-tooltip content="查看" placement="top" :open-delay="300">
            <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)"
              v-hasPermi="['outsourcing:production:view']"
              class="icon-btn icon-btn-primary" />
          </el-tooltip>

          <!-- 编辑 -->
          <el-tooltip content="编辑" placement="top" :open-delay="300">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)"
              v-hasPermi="['outsourcing:production:update']" class="icon-btn icon-btn-warning" />
          </el-tooltip>

          <!-- 初审 -->
          <el-tooltip content="初审" placement="top" :open-delay="300" v-if="scope.row.auditStatus === 0">
            <el-button size="mini" type="text" icon="el-icon-s-check" @click="handleFirstAudit(scope.row)"
              v-hasPermi="['outsourcing:production:first-audit']" class="icon-btn icon-btn-success" />
          </el-tooltip>

          <!-- 终审 -->
          <el-tooltip content="终审" placement="top" :open-delay="300" v-if="scope.row.auditStatus === 1">
            <el-button size="mini" type="text" icon="el-icon-circle-check" @click="handleFinalAudit(scope.row)"
              v-hasPermi="['outsourcing:production:final-audit']" class="icon-btn icon-btn-success" />
          </el-tooltip>

          <!-- 撤销 -->
          <el-tooltip content="撤销" placement="top" :open-delay="300"
            v-if="scope.row.auditStatus === 2 && scope.row.orderStatus !== -1">
            <el-button size="mini" type="text" icon="el-icon-refresh-left" @click="handleCancel(scope.row)"
              v-hasPermi="['outsourcing:production:cancel']" class="icon-btn icon-btn-orange" />
          </el-tooltip>

          <!-- 删除 -->
          <el-tooltip content="删除" placement="top" :open-delay="300">
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
              v-hasPermi="['outsourcing:production:delete']" class="icon-btn icon-btn-danger" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-section">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="pagination.current" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="850px" :close-on-click-modal="false"
      @close="handleDialogClose" top="0vh" custom-class="production-dialog">
      <div class="form-container">
        <el-form ref="productionForm" :model="formData" :rules="formRules" label-width="110px" label-position="right">
          <!-- 生产流程选择区域 -->
          <fieldset class="form-fieldset">
            <legend><i class="el-icon-s-tools"></i> 生产流程</legend>
            <el-form-item label="流程类型" prop="productionProcess">
              <!-- 新增模式：显示单选按钮组 -->
              <el-radio-group v-if="!isEdit" v-model="formData.productionProcess"
                @change="handleProductionProcessChange" size="mini" class="process-radio-group">
                <el-radio-button label="SMT" size="mini">
                  <i class="el-icon-cpu"></i> SMT
                </el-radio-button>
                <el-radio-button label="打板" size="mini">
                  <i class="el-icon-postcard"></i> 打板
                </el-radio-button>
              </el-radio-group>

              <!-- 编辑模式：直接显示文本 -->
              <div v-else class="process-text-display">
                <el-tag :type="formData.productionProcess === 'SMT' ? 'primary' : 'warning'
                  " size="medium" effect="plain">
                  <i :class="formData.productionProcess === 'SMT'
                    ? 'el-icon-cpu'
                    : 'el-icon-postcard'
                    "></i>
                  {{ formData.productionProcess }}
                </el-tag>
              </div>
            </el-form-item>
          </fieldset>

          <!-- SMT流程信息 -->
          <fieldset class="form-fieldset" v-if="formData.productionProcess === 'SMT'">
            <legend><i class="el-icon-document"></i> 排产信息</legend>
            <el-form-item label="排产单号" prop="schedulingNo">
              <el-input v-model="formData.schedulingNo" placeholder="请扫码任务令或手动输入排产单号，扫码后按回车确认" clearable
                prefix-icon="el-icon-tickets" @keyup.enter.native="handleScanEnter" />
            </el-form-item>
          </fieldset>
          <!-- SMT流程信息 -->
          <fieldset class="form-fieldset" v-if="formData.productionProcess === 'SMT'">
            <legend><i class="el-icon-document"></i> BOM文件</legend>
            <MyUpload v-model="formData.smtBomFile" :multiple="true" :limit="10" />
          </fieldset>

          <!-- 打板流程信息 -->
          <template v-if="formData.productionProcess === '打板'">
            <fieldset class="form-fieldset">
              <legend><i class="el-icon-menu"></i> 产品信息</legend>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="料号" prop="partNo">
                    <el-input v-model="formData.partNo" placeholder="请输入料号" clearable maxlength="100"
                      prefix-icon="el-icon-goods" />
                  </el-form-item>
                </el-col>
              </el-row>
            </fieldset>

            <fieldset class="form-fieldset">
              <legend><i class="el-icon-shopping-cart-2"></i> 订单信息</legend>
              <el-row :gutter="20">
                <el-col :span="12" v-if="!formData.id">
                  <el-form-item label="请购单号" prop="orderCode">
                    <el-input v-model="formData.orderCode" placeholder="请输入请购单号" maxlength="100"
                      prefix-icon="el-icon-document-copy" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="客户订单号" prop="orderNo">
                    <el-input v-model="formData.orderNo" placeholder="请输入客户订单号" maxlength="100"
                      prefix-icon="el-icon-s-order" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="数量" prop="num">
                    <el-input-number v-model="formData.num" :min="1" :max="999999" placeholder="请输入数量"
                      controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="生产地点" prop="address">
                    <el-select v-model="formData.address" placeholder="请选择生产地点" style="width: 100%" filterable clearable
                      prefix-icon="el-icon-location">
                      <el-option v-for="(item, index) in filteredProductAddressList" :key="index"
                        :label="item.dictLabel" :value="item.dictLabel" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="出货日期" prop="sellDate">
                    <el-date-picker v-model="formData.sellDate" type="date" placeholder="请选择出货日期" format="yyyy-MM-dd"
                      value-format="timestamp" style="width: 100%" prefix-icon="el-icon-date" />
                  </el-form-item>
                </el-col>
              </el-row>
            </fieldset>
          </template>

          <!-- 编辑模式下的采购信息 -->
          <fieldset class="form-fieldset" v-if="isEdit">
            <legend><i class="el-icon-goods"></i> 采购信息</legend>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="采购单号" prop="purchaseOrderCode">
                  <el-input v-model="formData.purchaseOrderCode" placeholder="请输入采购单号" maxlength="100"
                    prefix-icon="el-icon-document" :disabled="formData.auditStatus >= 1" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="请购单号" prop="orderCode">
                  <el-input v-model="formData.orderCode" placeholder="请输入请购单号" maxlength="100"
                    prefix-icon="el-icon-notebook-2" :disabled="formData.auditStatus >= 1" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="采购订单图" prop="purchaseOrderImg">
                  <ImageUpload v-model="formData.purchaseOrderImg" :accept="'image/*'" :max="1" :sortable="false"
                    :isDisabled="formData.auditStatus >= 1" class="purchase-order-img-upload" />
                </el-form-item>
              </el-col>
            </el-row>
          </fieldset>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer-new">
        <el-button size="mini" @click="dialogVisible = false"> 取消 </el-button>
        <el-button type="primary" size="mini" @click="handleSubmit" :loading="submitLoading">
          {{ submitLoading ? "提交中..." : "确定" }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 联系人管理对话框 -->
    <el-dialog title="联系人管理" :visible.sync="contactDialogVisible" width="80%" top="0vh" append-to-body
      :close-on-click-modal="false" @close="handleContactDialogClose" custom-class="contact-dialog">
      <div class="contact-dialog-content">
        <ContactManagement ref="contactManagement" :embedded="true" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="contactDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <BatchImportDialog :visible.sync="batchImportVisible" @success="handleImportSuccess" />

    <!-- BOM文件上传对话框 -->
    <el-dialog title="上传 BOM 文件" :visible.sync="bomUploadDialogVisible" width="600px" :close-on-click-modal="false"
      @close="handleBomUploadDialogClose" top='0'>
      <div v-if="bomUploadData" class="bom-upload-container">
        <!-- 基本信息展示（只读） -->
        <el-descriptions :column="2" border class="mb-20">
          <el-descriptions-item label="排产单号">
            {{ bomUploadData.schedulingNo || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="请购单号">
            {{ bomUploadData.orderCode || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="品类名称">
            {{ bomUploadData.categoryName || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="型号">
            {{ bomUploadData.computerName || '--' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- BOM文件上传区域 -->
        <div class="bom-upload-section">
          <div class="section-title">
            <i class="el-icon-upload"></i> BOM 文件
          </div>
          <MyUpload v-model="bomUploadData.smtBomFile" :multiple="true" :limit="10" />
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="bomUploadDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" size="mini" @click="handleBomUploadSubmit" :loading="bomUploadLoading">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 同步采购信息对话框 -->
    <el-dialog title="新增采购" :visible.sync="syncPurchaseDialogVisible" width="600px" :close-on-click-modal="false"
      @close="handleSyncPurchaseDialogClose" top="0">
      <div class="sync-purchase-container">
        <!-- 采购信息表单 -->
        <el-form ref="syncPurchaseFormRef" :model="syncPurchaseForm" :rules="syncPurchaseRules" label-width="120px">
          <el-form-item label="请购单号：" prop="orderCodeList">
            <el-select v-model="syncPurchaseForm.orderCodeList" multiple filterable placeholder="请选择请购单号"
              style="width: 100%">
              <el-option v-for="code in purchaseRequestCodeList" :key="code" :label="code" :value="code" />
            </el-select>
            <div class="form-tip">可同时选择多个请购单号</div>
          </el-form-item>

          <el-form-item label="采购单号：">
            <el-input v-model.trim="syncPurchaseForm.purchaseOrderCode" placeholder="请输入采购单号" clearable />
          </el-form-item>

          <el-form-item label="采购订单图：">
            <ImageUpload v-model="syncPurchaseForm.purchaseOrderImg" :accept="'image/*'" :max="5" :sortable="false" />
            <div class="form-tip">采购单号和采购订单图至少填写一个</div>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="syncPurchaseDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" size="mini" @click="handleSyncPurchaseSubmit" :loading="syncPurchaseLoading">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog title="详情" :visible.sync="viewDialogVisible" width="1200px" top="0" :close-on-click-modal="false">
      <div v-if="viewData" class="detail-container">
        <el-descriptions :column="3" border>
          <!-- 排产单号/料号 - 根据生产流程显示 -->
          <el-descriptions-item :label="viewData.productionProcess === 'SMT' ? '排产单号' : '料号'">
            {{
              viewData.productionProcess === "SMT"
                ? viewData.schedulingNo || "--"
                : viewData.partNo || "--"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="请购单号">{{
            viewData.orderCode || "--"
            }}</el-descriptions-item>
          <el-descriptions-item label="客户订单号">{{
            viewData.orderNo || "--"
            }}</el-descriptions-item>
          <el-descriptions-item label="品类名称">{{
            viewData.categoryName || "--"
            }}</el-descriptions-item>
          <!-- 型号/硬件版本号 - 根据生产流程显示 -->
          <el-descriptions-item :label="viewData.productionProcess === 'SMT' ? '硬件版本号' : '型号名称'
            ">
            {{
              viewData.productionProcess === "SMT"
                ? viewData.hwVersion || "--"
                : viewData.computerName || "--"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="芯片版本">{{
            viewData.chipVersion || "--"
            }}</el-descriptions-item>

          <el-descriptions-item label="数量">{{
            viewData.num || "--"
            }}</el-descriptions-item>
          <el-descriptions-item label="生产流程">{{
            viewData.productionProcess || "--"
            }}</el-descriptions-item>
          <el-descriptions-item label="生产地点">{{
            viewData.address || "--"
            }}</el-descriptions-item>
          <el-descriptions-item label="采购单号">{{ viewData.purchaseOrderCode || "--"
          }}</el-descriptions-item>
          <el-descriptions-item label="请购单号" :span="2">
            {{
              formatPurchaseRequestCodes(
                viewData.purchaseRequestCodeList,
                viewData.purchaseRequestCode
              )
            }}
          </el-descriptions-item>
          <el-descriptions-item label="出货日期">
            {{
              viewData.sellDate
                ? parseTime(viewData.sellDate, "{y}-{m}-{d}")
                : "--"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getAuditStatusType(viewData.auditStatus)" size="small">
              {{ getAuditStatusText(viewData.auditStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="BOM文件" v-if="viewData.productionProcess == 'SMT'">
            <el-tag :type="!!viewData.smtBomFile ? 'success' : 'danger'" size="small">
              {{ !!viewData.smtBomFile ? "已上传" : "未上传" }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="订单状态">
            <el-tag :type="viewData.orderStatus === -1 ? 'danger' : 'success'" size="small">
              {{ viewData.orderStatus === -1 ? "已撤销" : "正常" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="资料状态">
            <el-tag :type="viewData.materialStatus === 1 ? 'success' : 'warning'" size="small">
              {{ viewData.materialStatus === 1 ? "齐套" : "未齐套" }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="初审者">{{
            viewData.firstAuditor || "--"
            }}</el-descriptions-item>
          <el-descriptions-item label="初审时间">
            {{
              viewData.firstAuditTime
                ? parseTime(viewData.firstAuditTime, "{y}-{m}-{d} {h}:{i}:{s}")
                : "--"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">
            {{
              viewData.publishTime
                ? parseTime(viewData.publishTime, "{y}-{m}-{d} {h}:{i}:{s}")
                : "--"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="终审者">{{
            viewData.finalAuditor || "--"
            }}</el-descriptions-item>
          <el-descriptions-item label="终审时间">
            {{
              viewData.finalAuditTime
                ? parseTime(viewData.finalAuditTime, "{y}-{m}-{d} {h}:{i}:{s}")
                : "--"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="硬件版本号">{{
            viewData.hwVersion || "--"
            }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="3">{{
            viewData.remark || "--"
            }}</el-descriptions-item>
        </el-descriptions>

        <!-- 采购订单图 -->
        <div class="purchase-order-img-section" v-if="viewData.purchaseOrderImg">
          <h3 class="section-title">采购订单图</h3>
          <div class="img-gallery">
            <el-image v-for="(img, index) in (viewData.purchaseOrderImg || '').split(',')" :key="index" :src="img"
              :preview-src-list="(viewData.purchaseOrderImg || '').split(',')" class="purchase-img-item" fit="cover" />
          </div>
        </div>

        <!-- 资料齐套信息 -->
        <div class="material-section">
          <h3 class="section-title">资料齐套信息</h3>
          <el-table :data="viewData.materialStatusList || []" border size="small" max-height="500px">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="fileName" label="文件名称" align="center" min-width="180">
              <template slot-scope="scope">
                <span>{{ scope.row.fileName || "--" }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="fileType" label="文件类型" align="center" width="120">
              <template slot-scope="scope">
                <el-tag size="small" type="info">{{
                  scope.row.fileType || "--"
                  }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="isMaterial" label="是否齐套" align="center" width="100">
              <template slot-scope="scope">
                <el-tag size="small" :type="scope.row.isMaterial ? 'success' : 'danger'">
                  {{ scope.row.isMaterial ? "是" : "否" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120">
              <template slot-scope="scope">
                <el-button v-if="scope.row.fileUrl" size="mini" type="primary" icon="el-icon-download" @click="
                  handleDownloadFile(scope.row.fileUrl, scope.row.fileName)
                  ">
                  下载
                </el-button>
                <span v-else style="color: #909399">--</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="viewDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getOutsourcingProductionList,
  getOutsourcingProductionDetail,
  addOutsourcingProduction,
  updateOutsourcingProduction,
  deleteOutsourcingProduction,
  firstAudit,
  finalAudit,
  getPurchaseRequestCodeList,
  syncPurchaseInfo,
} from "@/api/outsourcing/production";
import { getSchedulingByCode } from "@/api/production/scheduling";
import IntelligentSearchForm from "@/components/IntelligentSearchForm";
import ContactManagement from "../contact/index.vue";
import ImageUpload from "@/components/el-upload-sortable/index.vue";
import BatchImportDialog from "./components/BatchImportDialog.vue";
import MyUpload from "@/components/MyUpload";
import digiSmartJumpMixin from "@/mixins/digiSmartJump";
export default {
  name: "OutsourcingProduction",
  components: {
    IntelligentSearchForm,
    ContactManagement,
    ImageUpload,
    BatchImportDialog,
    MyUpload,
  },
  mixins: [digiSmartJumpMixin],
  data() {
    return {
      // 搜索表单
      queryParams: {
        id: null,
      },
      searchForm: {
        categoryId: "",
        computerId: "",
        orderCode: "",
        schedulingNo: "",
        sellDateStart: "",
        sellDateEnd: "",
        productionProcess: "",
        purchaseOrderCode: "",
        auditStatus: "",
        publishTimeStart: "",
        publishTimeEnd: "",
      },
      // 日期范围
      sellDateRange: [],
      publishTimeRange: [],
      // 搜索字段配置
      searchFields: [
        // {
        //   key: "schedulingNo",
        //   label: "排产单号",
        //   component: "el-input",
        //   placeholder: "请输入排产单号",
        // },
        // {
        //   key: "orderCode",
        //   label: "请购单号",
        //   component: "el-input",
        //   placeholder: "请输入请购单号",
        // },
        {
          key: "purchaseOrderCode",
          label: "采购单号",
          component: "el-input",
          placeholder: "请输入采购单号",
        },
        {
          key: "productionProcess",
          label: "生产流程",
          component: "el-select",
          props: {
            placeholder: "请选择生产流程",
            clearable: true,
            options: [
              { label: "SMT", value: "SMT" },
              { label: "打板", value: "打板" },
            ],
          },
        },
        {
          key: "auditStatus",
          label: "审核状态",
          component: "el-select",
          props: {
            placeholder: "请选择审核状态",
            clearable: true,
            options: [
              { label: "待初审", value: 0 },
              { label: "待终审", value: 1 },
              { label: "已审核", value: 2 },
            ],
          },
        },
        // {
        //   key: "categoryId",
        //   label: "品类",
        //   component: "custom",
        //   sort: 6,
        // },
        {
          key: "computerId",
          label: "型号",
          component: "custom",
          sort: 7,
        },
      ],
      // 表格数据
      tableData: [],
      loading: false,
      // 品类列表
      categoryList: [],
      // 型号选项（搜索用）
      modelOptions: [],
      modelLoading: false,
      // 表单型号选项
      formModelOptions: [],
      formModelLoading: false,
      purchaseRequestCodeOptions: [],
      showPurchaseRequestSelector: false,
      // 生产地点列表（字典数据）
      productAddressList: [],
      // 分页
      pagination: {
        current: 1,
        size: 20,
        total: 0,
      },
      // 对话框
      dialogVisible: false,
      dialogTitle: "新增",
      isEdit: false,
      submitLoading: false,
      // 表单数据
      formData: {
        id: null,
        schedulingId: "",
        schedulingNo: "",
        productionProcess: "SMT",
        categoryId: "",
        computerId: "",
        partNo: "",
        orderCode: "",
        orderNo: "",
        num: null,
        address: "",
        sellDate: null,
        purchaseOrderCode: "",
        purchaseRequestCode: "",
        orderCodeList: [],
        purchaseOrderImg: "",
        auditStatus: 0,
      },
      // 表单验证规则
      formRules: {
        schedulingNo: [
          {
            required: true,
            message: "请扫码任务令或输入排产单号",
            trigger: "blur",
          },
        ],
        productionProcess: [
          { required: true, message: "请选择生产流程", trigger: "change" },
        ],
        partNo: [{ required: true, message: "请输入料号", trigger: "blur" }],
        address: [
          { required: true, message: "请选择生产地点", trigger: "change" },
        ],
        sellDate: [
          { required: true, message: "请选择出货日期", trigger: "change" },
        ],
      },
      // 查看详情
      viewDialogVisible: false,
      viewData: null,
      // 联系人管理
      contactDialogVisible: false,
      // 批量导入
      batchImportVisible: false,
      // BOM文件上传
      bomUploadDialogVisible: false,
      bomUploadData: null,
      bomUploadLoading: false,
      // 采购信息同步
      syncPurchaseDialogVisible: false,
      syncPurchaseForm: {
        orderCodeList: [], // 请购单号列表
        purchaseOrderCode: '',
        purchaseOrderImg: '',
      },
      syncPurchaseRules: {
        orderCodeList: [
          { required: true, message: '请选择请购单号', trigger: 'change' },
        ],
      },
      syncPurchaseLoading: false,
      purchaseRequestCodeList: [], // 请购单号列表
    };
  },
  computed: {
    // 过滤生产地点列表，去除"迪太工厂"
    filteredProductAddressList() {
      return this.productAddressList.filter(
        (item) => item.dictLabel !== "迪太工厂"
      );
    },
    isPurchaseRequestSelectorVisible() {
      return this.showPurchaseRequestSelector;
    },
  },
  mounted() {
    this.getCategoryList();
    this.getProductAddress();
    this.fetchData();
    this.loadPurchaseRequestCodes();
  },
  methods: {
    /** 获取生产地点字典数据 */
    getProductAddress() {
      this.getDicts("product_address").then((response) => {
        this.productAddressList = response.data || [];
      });
    },

    /** 获取列表数据 */
    fetchData() {
      this.loading = true;
      const params = {
        p: this.pagination.current,
        l: this.pagination.size,
        ...this.searchForm,
        id: this.queryParams.id || undefined,
      };

      getOutsourcingProductionList(params)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.tableData = response.data.list || [];
            this.pagination.total = response.data.total || 0;
          } else {
            this.tableData = [];
            this.pagination.total = 0;
          }
          // 查询完成后清除 DigiSmart 跳转ID
          this.clearDigiSmartId();
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /** 日期范围变化 */
    handleDateRangeChange(type) {
      if (type === "sell") {
        if (this.sellDateRange && this.sellDateRange.length === 2) {
          this.searchForm.sellDateStart = this.sellDateRange[0];
          this.searchForm.sellDateEnd = this.sellDateRange[1];
        } else {
          this.searchForm.sellDateStart = "";
          this.searchForm.sellDateEnd = "";
        }
      } else if (type === "publish") {
        if (this.publishTimeRange && this.publishTimeRange.length === 2) {
          this.searchForm.publishTimeStart = this.publishTimeRange[0];
          this.searchForm.publishTimeEnd = this.publishTimeRange[1];
        } else {
          this.searchForm.publishTimeStart = "";
          this.searchForm.publishTimeEnd = "";
        }
      }
      this.handleSearch();
    },

    /** 搜索 */
    handleSearch() {
      this.pagination.current = 1;
      this.fetchData();
    },

    /** 品类变化处理 */
    handleCategoryChange(val) {
      // 清空型号选择
      this.searchForm.computerId = "";

      // 如果选择了品类，从品类数据中获取对应的型号列表
      if (val) {
        const category = this.categoryList.find((item) => item.id === val);
        this.modelOptions = category?.computerList || [];
      } else {
        this.modelOptions = [];
      }

      // 触发搜索
      this.handleSearch();
    },

    /** 远程搜索型号 */
    async getComputerNameList(name) {
      if (name) {
        this.modelLoading = true;
        const { computerNameList } = await import("@/api/third/fileConfig");

        computerNameList({
          name,
          categoryId: this.searchForm.categoryId,
        })
          .then((res) => {
            this.modelOptions = res.data || [];
          })
          .finally(() => {
            this.modelLoading = false;
          });
      } else {
        // 如果没有输入搜索词，恢复品类下的型号列表
        if (this.searchForm.categoryId) {
          const category = this.categoryList.find(
            (item) => item.id === this.searchForm.categoryId
          );
          this.modelOptions = category?.computerList || [];
        } else {
          this.modelOptions = [];
        }
      }
    },

    /** 获取品类和型号字典数据 */
    async getCategoryList() {
      const { categoryComputerDict } = await import("@/api/third/fileConfig");

      try {
        const result = await categoryComputerDict();
        this.categoryList = result.data || [];
      } catch (error) {
        console.error("获取品类数据失败:", error);
        this.categoryList = [];
      }
    },

    /** 生产流程变化处理 */
    handleProductionProcessChange(val) {
      // 切换生产流程时，清空相关字段
      if (val === "打板") {
        // 切换到打板，清空排产单号
        this.formData.schedulingNo = "";
        this.formData.schedulingId = "";
      } else {
        // 切换到SMT，清空打板相关字段
        this.formData.partNo = "";
        this.formData.orderCode = "";
        this.formData.orderNo = "";
        this.formData.num = null;
        this.formData.address = "";
        this.formData.sellDate = null;
      }
    },

    /** 表单品类变化处理 */
    handleFormCategoryChange(val) {
      // 清空型号选择
      this.formData.computerId = "";

      // 如果选择了品类，从品类数据中获取对应的型号列表
      if (val) {
        const category = this.categoryList.find((item) => item.id === val);
        this.formModelOptions = category?.computerList || [];
      } else {
        this.formModelOptions = [];
      }
    },

    /** 表单远程搜索型号 */
    async getFormComputerNameList(name) {
      if (name) {
        this.formModelLoading = true;
        const { computerNameList } = await import("@/api/third/fileConfig");

        computerNameList({
          name,
          categoryId: this.formData.categoryId,
        })
          .then((res) => {
            this.formModelOptions = res.data || [];
          })
          .finally(() => {
            this.formModelLoading = false;
          });
      } else {
        // 如果没有输入搜索词，恢复品类下的型号列表
        if (this.formData.categoryId) {
          const category = this.categoryList.find(
            (item) => item.id === this.formData.categoryId
          );
          this.formModelOptions = category?.computerList || [];
        } else {
          this.formModelOptions = [];
        }
      }
    },

    /** 获取请购单号列表 */
    async loadPurchaseRequestCodes() {
      try {
        const response = await getPurchaseRequestCodeList();
        if (response && response.code === 200) {
          const listSource =
            response.data && response.data.list
              ? response.data.list
              : response.data;
          this.purchaseRequestCodeOptions = Array.isArray(listSource)
            ? listSource
            : [];
        }
      } catch (error) {
        console.error("获取请购单号列表失败:", error);
      }
    },

    enablePurchaseRequestSelector() {
      if (this.formData.auditStatus >= 1) return;
      if (!Array.isArray(this.formData.orderCodeList)) {
        this.$set(this.formData, "orderCodeList", []);
      }
      if (this.formData.orderCodeList.length === 0) {
        // 添加空白选项，而不是当前输入框的值
        this.formData.orderCodeList.push("");
      }
      this.showPurchaseRequestSelector = true;
    },

    handleOrderCodeInput(value) {
      if (!this.isPurchaseRequestSelectorVisible) {
        return;
      }
      if (!Array.isArray(this.formData.orderCodeList)) {
        this.$set(this.formData, "orderCodeList", []);
      }
      if (this.formData.orderCodeList.length === 0) {
        this.formData.orderCodeList.push(value || "");
      } else {
        this.$set(this.formData.orderCodeList, 0, value || "");
      }
    },

    shouldDisplayPurchaseRequestSelector() {
      const codes = this.getFilteredPurchaseRequestCodes();
      const trimmedOrder = (this.formData.orderCode || "").trim();
      if (codes.length > 1) return true;
      if (codes.length === 1 && codes[0] && codes[0] !== trimmedOrder) {
        return true;
      }
      return false;
    },

    /** 新增请购单号行 */
    addPurchaseRequestRow(index) {
      if (!Array.isArray(this.formData.orderCodeList)) {
        this.$set(this.formData, "orderCodeList", []);
      }
      // const insertIndex =
      //   typeof index === "number"
      //     ? index + 1
      //     : this.formData.orderCodeList.length;
      // this.formData.orderCodeList.splice(insertIndex, 0, "");
      console.log(
        "🚀 ~ file: index.vue:1027 ~ this.formData.orderCodeList:",
        this.formData.orderCodeList
      );
    },

    /** 删除请购单号行 */
    removePurchaseRequestRow(index) {
      if (!Array.isArray(this.formData.orderCodeList)) {
        return;
      }
      if (this.formData.orderCodeList.length <= 1) {
        this.formData.orderCodeList = [""];
        this.handlePurchaseRequestChange();
        return;
      }
      const removeIndex =
        typeof index === "number"
          ? index
          : this.formData.orderCodeList.length - 1;
      this.formData.orderCodeList.splice(removeIndex, 1);
      if (this.formData.orderCodeList.length === 0) {
        this.formData.orderCodeList.push("");
      }
      this.handlePurchaseRequestChange();
    },

    /** 处理请购单号变化，保持兼容字段同步 */
    handlePurchaseRequestChange() {
      const filteredCodes = this.getFilteredPurchaseRequestCodes();
      this.formData.purchaseRequestCode = filteredCodes.join(",");
    },
    /** 获取有效的请购单号数组 */
    getFilteredPurchaseRequestCodes() {
      if (!Array.isArray(this.formData.orderCodeList)) {
        return [];
      }
      const list = [];
      this.formData.orderCodeList.forEach((item) => {
        const value = (item || "").trim();
        if (value && list.indexOf(value) === -1) {
          list.push(value);
        }
      });
      return list;
    },
    /** 归一化接口返回的请购单号列表 */
    normalizePurchaseRequestCodeList(list, fallback) {
      if (list && typeof list === "object" && !Array.isArray(list)) {
        if (Array.isArray(list.list)) {
          list = list.list;
        } else if (Array.isArray(list.records)) {
          list = list.records;
        } else if (Array.isArray(list.rows)) {
          list = list.rows;
        } else if (Array.isArray(list.data)) {
          list = list.data;
        } else {
          list = Object.values(list);
        }
      }
      const normalizeString = (value) => {
        if (!value || typeof value !== "string") {
          return [];
        }
        return value
          .split(/[,，\s]+/)
          .map((item) => item.trim())
          .filter((item) => item);
      };
      const tryParseJsonArray = (value) => {
        if (!value || typeof value !== "string") {
          return [];
        }
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed
              .map((item) => (item == null ? "" : String(item).trim()))
              .filter((item) => item);
          }
        } catch (error) {
          // ignore parse error
        }
        return [];
      };

      let result = [];
      if (Array.isArray(list) && list.length > 0) {
        result = list.map((item) => (item || "").trim()).filter((item) => item);
      } else if (typeof list === "string") {
        const parsedArray = tryParseJsonArray(list);
        result =
          parsedArray && parsedArray.length > 0
            ? parsedArray
            : normalizeString(list);
      }

      if ((!result || result.length === 0) && typeof fallback === "string") {
        const parsedFallback = tryParseJsonArray(fallback);
        result =
          parsedFallback && parsedFallback.length > 0
            ? parsedFallback
            : normalizeString(fallback);
      }
      const filteredResult = (result || []).filter(
        (item) => item && item.trim()
      );
      return filteredResult;
    },

    /** 重置 */
    handleReset() {
      this.searchForm = {
        categoryId: "",
        computerId: "",
        orderCode: "",
        schedulingNo: "",
        sellDateStart: "",
        sellDateEnd: "",
        productionProcess: "",
        purchaseOrderCode: "",
        auditStatus: "",
        publishTimeStart: "",
        publishTimeEnd: "",
      };
      this.sellDateRange = [];
      this.publishTimeRange = [];
      this.pagination.current = 1;
      this.fetchData();
    },

    /** 新增 */
    handleAdd() {
      this.isEdit = false;
      this.dialogTitle = "新增";
      this.resetForm();
      this.dialogVisible = true;
    },

    /** 编辑 */
    handleEdit(row) {
      this.isEdit = true;
      this.dialogTitle = "编辑";

      // 清理生产流程字段，去除可能的空格
      const productionProcess = row.productionProcess
        ? row.productionProcess.trim()
        : "";

      // 先重置表单，确保清空之前的数据
      this.resetForm();

      // 使用 $nextTick 确保重置完成后再设置新数据
      this.$nextTick(() => {
        // 设置表单数据 - 需要正确处理日期格式
        this.showPurchaseRequestSelector = false;
        const normalizedOrderCodes = this.normalizePurchaseRequestCodeList(
          row.purchaseRequestCodeList,
          row.purchaseRequestCode
        );

        this.formData = {
          id: row.id,
          schedulingId: row.schedulingId || "",
          schedulingNo: row.schedulingNo || "",
          productionProcess: productionProcess,
          categoryId: row.categoryId || "",
          computerId: row.computerId || "",
          partNo: row.partNo || "",
          orderCode: row.orderCode || "",
          orderNo: row.orderNo || "",
          num: row.num || null,
          address: row.address || "",
          // 确保日期格式正确 - 处理字符串时间戳或数字时间戳
          sellDate: row.sellDate
            ? typeof row.sellDate === "string"
              ? parseInt(row.sellDate)
              : row.sellDate
            : null,
          purchaseOrderCode: row.purchaseOrderCode || "",
          purchaseRequestCode: row.purchaseRequestCode || "",
          orderCodeList: [],
          purchaseOrderImg: row.purchaseOrderImg || "",
          auditStatus: row.auditStatus || 0,
        };

        // 如果是打板流程，需要加载对应的型号列表
        if (productionProcess === "打板" && row.categoryId) {
          const category = this.categoryList.find(
            (item) => item.id === row.categoryId
          );
          this.formModelOptions = category?.computerList || [];
        }

        // 如果是SMT流程，也需要确保型号列表被清空
        if (productionProcess === "SMT") {
          this.formModelOptions = [];
        }

        // 再次使用 $nextTick 确保数据更新后再显示对话框
        this.$nextTick(() => {
          this.handlePurchaseRequestChange();
          this.dialogVisible = true;
        });
      });
    },

    /** 添加联系人 */
    handleAddContact() {
      this.contactDialogVisible = true;
    },

    /** 批量导入 */
    handleBatchImport() {
      this.batchImportVisible = true;
    },

    /** 导入成功 */
    handleImportSuccess() {
      this.batchImportVisible = false;
      this.fetchData();
    },

    /** 联系人对话框关闭 */
    handleContactDialogClose() {
      // 对话框关闭时可以执行一些清理操作
    },

    /** 查看详情 */
    handleView(row) {
      // 直接使用列表数据，不调用详情接口
      this.viewData = { ...row };
      this.viewDialogVisible = true;
    },

    /** 查看资料状态 */
    handleSeeMaterialStatus(row) {
      // 只有未齐套时才跳转
      if (row.materialStatus !== 1) {
        console.log('跳转资料状态页面，行数据：', row);

        // 构建查询参数
        const query = {};

        // 品类名称
        const categoryName = row.categoryName || row.category;
        if (categoryName) {
          query.categoryName = categoryName;
          console.log('传递品类名称：', categoryName);
        } else {
          console.warn('品类名称为空');
        }

        // 根据生产流程选择版本号字段
        // 注意：SMT流程在表格中显示的是computerName，打板流程显示的是hwVersion
        const version = row.productionProcess === 'SMT'
          ? (row.computerName || row.modelName)
          : (row.hwVersion || row.hardwareVersion);

        if (version) {
          query.version = version;
          console.log('传递版本号：', version);
        } else {
          console.warn('版本号为空');
        }

        // 页面内跳转
        this.$router.push({
          path: '/device/productData/versionManage',
          query: query
        });
      }
    },

    /** 删除 */
    handleDelete(row) {
      this.$confirm(`确定要删除吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteOutsourcingProduction(row.id).then((response) => {
            if (response.code === 200) {
              this.$message.success("删除成功");
              this.fetchData();
            }
          });
        })
        .catch(() => {
          // 用户取消删除
        });
    },

    /** 初审 */
    handleFirstAudit(row) {
      this.$confirm(`确定要进行初审吗？`, "初审确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          firstAudit(row.id).then((response) => {
            if (response.code === 200) {
              this.$message.success("初审成功");
              this.fetchData();
            }
          });
        })
        .catch(() => {
          // 用户取消
        });
    },

    /** 终审 */
    handleFinalAudit(row) {
      this.$confirm(`确定要进行终审吗？`, "终审确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 显示全屏 loading
          const loading = this.$loading({
            lock: true,
            text: "终审处理中，请稍候...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
            customClass: "final-audit-loading",
          });

          finalAudit(row.id)
            .then((response) => {
              if (response.code === 200) {
                this.$message.success("终审成功");
                this.fetchData();
              }
            })
            .finally(() => {
              // 关闭 loading
              loading.close();
            });
        })
        .catch(() => {
          // 用户取消
        });
    },

    /** 撤销 */
    handleCancel(row) {
      this.$confirm(`确定要撤销吗？撤销后订单状态将变为"已撤销"`, "撤销确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 调用修改接口，将 orderStatus 改为 -1
          const updateData = {
            id: row.id,
            orderStatus: -1,
          };

          updateOutsourcingProduction(updateData).then((response) => {
            if (response.code === 200) {
              this.$message.success("撤销成功");
              this.fetchData();
            }
          });
        })
        .catch(() => {
          // 用户取消
        });
    },

    /** 提交表单 */
    handleSubmit() {
      this.$refs.productionForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          const apiMethod = this.isEdit
            ? updateOutsourcingProduction
            : addOutsourcingProduction;

          // 过滤掉空值字段
          const submitData = {};
          Object.keys(this.formData).forEach((key) => {
            if (key === "orderCodeList") {
              return;
            }
            const value = this.formData[key];
            // 只添加非空值（不包括空字符串、null、undefined，但保留数字0和false）
            if (value !== "" && value !== null && value !== undefined) {
              submitData[key] = value;
            }
          });

          const filteredPurchaseRequestCodes =
            this.getFilteredPurchaseRequestCodes();
          if (filteredPurchaseRequestCodes.length > 0) {
            submitData.orderCodeList = filteredPurchaseRequestCodes;
          } else {
            delete submitData.orderCodeList;
            delete submitData.orderCodeList;
          }

          apiMethod(submitData)
            .then((response) => {
              if (response.code === 200) {
                this.$message.success(this.isEdit ? "修改成功" : "新增成功");
                this.dialogVisible = false;
                this.fetchData();
              }
            })
            .finally(() => {
              this.submitLoading = false;
            });
        }
      });
    },

    /** 对话框关闭 */
    handleDialogClose() {
      this.resetForm();
    },

    /** 重置表单 */
    resetForm() {
      this.formData = {
        id: null,
        schedulingId: "",
        schedulingNo: "",
        productionProcess: "SMT",
        categoryId: "",
        computerId: "",
        partNo: "",
        orderCode: "",
        orderNo: "",
        num: null,
        address: "",
        sellDate: null,
        purchaseOrderCode: "",
        purchaseRequestCode: "",
        orderCodeList: [],
        purchaseOrderImg: "",
        auditStatus: 0,
      };
      this.showPurchaseRequestSelector = false;
      this.handlePurchaseRequestChange();
      // 清空表单型号选项
      this.formModelOptions = [];
      this.$nextTick(() => {
        if (this.$refs.productionForm) {
          this.$refs.productionForm.clearValidate();
        }
      });
    },

    /** 分页大小改变 */
    handleSizeChange(val) {
      this.pagination.size = val;
      this.pagination.current = 1;
      this.fetchData();
    },

    /** 当前页改变 */
    handleCurrentChange(val) {
      this.pagination.current = val;
      this.fetchData();
    },

    /** 获取审核状态文本 */
    getAuditStatusText(status) {
      const statusMap = {
        "-1": "拒审",
        0: "待初审",
        1: "待终审",
        2: "已审核",
      };
      return statusMap[status] || "--";
    },

    /** 获取审核状态类型 */
    getAuditStatusType(status) {
      const typeMap = {
        "-1": "danger",
        0: "info",
        1: "warning",
        2: "success",
      };
      return typeMap[status] || "info";
    },

    /** 格式化请购单号显示 */
    formatPurchaseRequestCodes(list, fallback) {
      if (Array.isArray(list)) {
        const filtered = list
          .map((item) => (item || "").trim())
          .filter((item) => item);
        if (filtered.length > 0) {
          return filtered.join("、");
        }
      }
      if (fallback && typeof fallback === "string") {
        return fallback;
      }
      return "--";
    },

    /** 扫码回车处理 */
    async handleScanEnter() {
      console.log("回车键被触发，开始处理扫码逻辑");
      const code = this.formData.schedulingNo?.trim();
      if (!code) {
        this.$message.warning("请输入排产单号");
        return;
      }

      try {
        // 调用接口获取排产信息
        const res = await getSchedulingByCode(code);

        if (res.code === 200 && res.data && res.data.no) {
          // 将排产信息填入表单 - 使用接口返回的 no 字段作为排产单号
          this.formData.schedulingNo = res.data.no || code;
          this.$message.success("任务令信息已获取并填入表单");
        } else {
          this.$message.error("未找到对应的排产信息");
        }
      } catch (error) {
        console.error("获取排产信息失败:", error);
        this.$message.error("获取排产信息失败，请检查任务令是否正确");
      }
    },

    /** 计算表格高度 */
    tableHeight(offset = 0) {
      return window.innerHeight - 300 - offset;
    },

    /** 下载文件 */
    handleDownloadFile(fileUrl, fileName) {
      if (!fileUrl) {
        this.$message.warning("文件地址为空");
        return;
      }

      // 创建一个隐藏的 a 标签进行下载
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "下载文件";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.$message.success("开始下载文件");
    },

    /** 点击上传 BOM 文件 */
    handleUploadBom(row) {
      // 只有未上传时才能点击
      if (!!row.smtBomFile) {
        return;
      }

      // 只有 SMT 流程才能上传 BOM
      if (row.productionProcess !== 'SMT') {
        return;
      }

      // 检查权限（管理员直接放行）
      const roles = this.$store.state.user.roles || [];
      const permissions = this.$store.state.user.permissions || [];
      const isAdmin = roles.includes('admin');

      if (!isAdmin && !permissions.includes('outsourcing:production:upload-bom')) {
        this.$message.warning('您没有上传 BOM 文件的权限');
        return;
      }

      // 复制数据到上传对话框
      this.bomUploadData = {
        id: row.id,
        schedulingNo: row.schedulingNo,
        orderCode: row.orderCode,
        categoryName: row.categoryName,
        computerName: row.computerName,
        smtBomFile: row.smtBomFile || '',
      };

      // 打开上传对话框
      this.bomUploadDialogVisible = true;
    },

    /** BOM文件上传对话框关闭 */
    handleBomUploadDialogClose() {
      this.bomUploadData = null;
    },

    /** 打开同步采购信息对话框 */
    async handleSyncPurchase() {
      // 获取请购单号列表
      await this.getPurchaseRequestCodes();
      this.syncPurchaseDialogVisible = true;
    },

    /** 获取请购单号列表 */
    async getPurchaseRequestCodes() {
      try {
        const response = await getPurchaseRequestCodeList();
        if (response.code === 200) {
          this.purchaseRequestCodeList = response.data || [];
        }
      } catch (error) {
        console.error('获取请购单号列表失败:', error);
        this.purchaseRequestCodeList = [];
      }
    },

    /** 同步采购信息对话框关闭 */
    handleSyncPurchaseDialogClose() {
      this.syncPurchaseForm = {
        orderCodeList: [],
        purchaseOrderCode: '',
        purchaseOrderImg: '',
      };
      this.$refs.syncPurchaseFormRef && this.$refs.syncPurchaseFormRef.clearValidate();
    },

    /** 提交同步采购信息 */
    handleSyncPurchaseSubmit() {
      this.$refs.syncPurchaseFormRef.validate((valid) => {
        if (!valid) {
          return;
        }

        const { orderCodeList, purchaseOrderCode, purchaseOrderImg } = this.syncPurchaseForm;

        // 验证：采购单号和采购订单图至少填写一个
        if (!purchaseOrderCode && !purchaseOrderImg) {
          this.$message.warning('采购单号和采购订单图至少填写一个');
          return;
        }

        this.syncPurchaseLoading = true;

        syncPurchaseInfo({
          orderCodeList,
          purchaseOrderCode,
          purchaseOrderImg,
        })
          .then((response) => {
            if (response.code === 200) {
              this.$message.success('采购信息同步成功');
              this.syncPurchaseDialogVisible = false;
              this.fetchData(); // 刷新列表
            }
          })
          .finally(() => {
            this.syncPurchaseLoading = false;
          });
      });
    },

    /** 提交 BOM 文件上传 */
    handleBomUploadSubmit() {
      if (!this.bomUploadData || !this.bomUploadData.id) {
        this.$message.warning('数据异常，请重试');
        return;
      }

      if (!this.bomUploadData.smtBomFile) {
        this.$message.warning('请上传 BOM 文件');
        return;
      }

      this.bomUploadLoading = true;

      // 只提交 id 和 smtBomFile 字段
      const submitData = {
        id: this.bomUploadData.id,
        smtBomFile: this.bomUploadData.smtBomFile,
      };

      updateOutsourcingProduction(submitData)
        .then((response) => {
          if (response.code === 200) {
            this.$message.success('BOM 文件上传成功');
            this.bomUploadDialogVisible = false;
            this.fetchData();
          }
        })
        .finally(() => {
          this.bomUploadLoading = false;
        });
    },
  },
};
</script>

<style scoped>
.outsourcing-production-container {
  padding: 20px;
}

.pagination-section {
  margin-top: 20px;
  text-align: right;
}

.text-red {
  color: #f56c6c;
}

.text-orange {
  color: #409eff;
}

/* 操作列图标按钮样式 */
.icon-btn {
  font-size: 16px;
  padding: 8px;
  margin: 0 2px;
  transition: all 0.2s ease;
}

/* 查看按钮 - 蓝色 */
.icon-btn-primary {
  color: #409eff;
}

.icon-btn-primary:hover {
  color: #66b1ff;
}

/* 编辑按钮 - 橙色 */
.icon-btn-warning {
  color: #409eff;
}

/* 审核按钮 - 绿色 */
.icon-btn-success {
  color: #67c23a;
}

.purchase-request-code-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.purchase-request-code-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.purchase-request-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}

.purchase-order-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.purchase-order-input .el-input {
  flex: 1;
}

.purchase-order-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
}

.icon-btn-success:hover {
  color: #85ce61;
}

/* 撤销按钮 - 深橙色 */
.icon-btn-orange {
  color: #409eff;
}

.icon-btn-orange:hover {
  color: #409eff;
}

/* 删除按钮 - 红色 */
.icon-btn-danger {
  color: #f56c6c;
}

/* 操作列居中并紧凑 */
::v-deep .el-table__body .el-button--text {
  padding: 0;
  min-width: auto;
}

.dialog-footer {
  text-align: right;
}

.detail-container {
  padding: 20px;
}

/* ========== 新增/编辑对话框样式 - 简约风格 ========== */
::v-deep .production-dialog {
  border-radius: 8px;
  overflow: hidden;
}

::v-deep .production-dialog .el-dialog__header {
  background-color: #ffffff;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
}

::v-deep .production-dialog .el-dialog__title {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0;
}

::v-deep .production-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #909399;
  font-size: 18px;
  font-weight: normal;
}

::v-deep .production-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #606266;
}

::v-deep .production-dialog .el-dialog__body {
  padding: 20px 24px;
  max-height: 70vh;
  overflow-y: auto;
}

/* 自定义滚动条 */
::v-deep .production-dialog .el-dialog__body::-webkit-scrollbar {
  width: 6px;
}

::v-deep .production-dialog .el-dialog__body::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

::v-deep .production-dialog .el-dialog__body::-webkit-scrollbar-thumb:hover {
  background-color: #c0c4cc;
}

::v-deep .production-dialog .el-dialog__footer {
  padding: 16px 24px;
  background-color: #ffffff;
  border-top: 1px solid #e4e7ed;
}

/* 表单容器 */
.form-container {
  background-color: transparent;
}

/* Fieldset 样式 */
.form-fieldset {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 22px 24px 25px;
  margin-bottom: 18px;
  background-color: #fafbfc;
  transition: all 0.2s ease;
}

.form-fieldset:last-child {
  margin-bottom: 0;
}

/* Legend 标题样式 */
.form-fieldset legend {
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  border: none;
  width: auto;
  margin-left: -4px;
  margin-bottom: 0;
  line-height: 1.4;
}

.form-fieldset legend i {
  margin-right: 6px;
  color: #909399;
  font-size: 13px;
  vertical-align: middle;
}

/* 表单项优化 */
::v-deep .form-container .el-form-item {
  margin-bottom: 18px;
}

::v-deep .form-container .el-form-item:last-child {
  margin-bottom: 0;
}

::v-deep .form-container .el-form-item__label {
  color: #606266;
  font-weight: 400;
  font-size: 14px;
  line-height: 40px;
  text-align: right;
}

::v-deep .form-container .el-form-item__content {
  line-height: 40px;
}

::v-deep .form-container .el-input__inner,
::v-deep .form-container .el-textarea__inner {
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s ease;
  background-color: #ffffff;
}

::v-deep .form-container .el-input__inner:hover,
::v-deep .form-container .el-textarea__inner:hover {
  border-color: #c0c4cc;
}

::v-deep .form-container .el-input__inner:focus,
::v-deep .form-container .el-textarea__inner:focus {
  border-color: #409eff;
  background-color: #ffffff;
}

::v-deep .form-container .el-input-number {
  width: 100%;
}

::v-deep .form-container .el-input-number .el-input__inner {
  text-align: left;
  padding-left: 15px;
  padding-right: 50px;
}

/* 生产流程单选按钮组 */
.process-radio-group {
  width: 100%;
}

::v-deep .process-radio-group .el-radio-button {
  flex: 1;
}

::v-deep .process-radio-group .el-radio-button__inner {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s ease;
  font-size: 14px;
  background-color: #ffffff;
  color: #606266;
}

::v-deep .process-radio-group .el-radio-button__inner i {
  margin-right: 5px;
}

::v-deep .process-radio-group .el-radio-button:first-child .el-radio-button__inner {
  border-radius: 4px 0 0 4px;
}

::v-deep .process-radio-group .el-radio-button:last-child .el-radio-button__inner {
  border-radius: 0 4px 4px 0;
}

::v-deep .process-radio-group .el-radio-button__orig-radio:checked+.el-radio-button__inner {
  background-color: #409eff;
  border-color: #409eff;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.15);
}

::v-deep .process-radio-group .el-radio-button__orig-radio:disabled+.el-radio-button__inner {
  background-color: #f5f7fa;
  color: #c0c4cc;
  cursor: not-allowed;
}

/* 对话框底部按钮 */
.dialog-footer-new {
  text-align: right;
}

.dialog-footer-new .el-button {
  min-width: 90px;
  border-radius: 4px;
  font-size: 14px;
  padding: 10px 20px;
  transition: all 0.2s ease;
}

.dialog-footer-new .el-button i {
  margin-right: 4px;
  font-size: 13px;
}

.dialog-footer-new .el-button--default {
  color: #606266;
  background-color: #ffffff;
  border-color: #e4e7ed;
}

.dialog-footer-new .el-button--default:hover {
  color: #409eff;
  border-color: #c0c4cc;
  background-color: #f5f7fa;
}

.dialog-footer-new .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
}

.dialog-footer-new .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  box-shadow: 0 3px 6px rgba(64, 158, 255, 0.3);
}

/* 联系人对话框样式 */
::v-deep .contact-dialog {
  height: 85vh;
  display: flex;
  flex-direction: column;
}

::v-deep .contact-dialog .el-dialog__body {
  flex: 1;
  overflow: hidden;
  padding: 10px 20px;
}

.contact-dialog-content {
  height: 100%;
  overflow: hidden;
}

::v-deep .contact-dialog-content .company-contact-container {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 采购订单图上传样式 */
::v-deep .purchase-order-img-upload .upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #8c939d;
}

/* 采购订单图区域样式 */
.purchase-order-img-section {
  margin-top: 20px;
}

.purchase-order-img-section .img-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.purchase-order-img-section .purchase-img-item {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.purchase-order-img-section .purchase-img-item:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 齐套信息段落样式 */
.material-section {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #dcdfe6;
}

/* el-row 优化 */
::v-deep .form-fieldset .el-row {
  display: flex;
  flex-wrap: wrap;
}

::v-deep .form-fieldset .el-row+.el-row {
  margin-top: 0;
}

::v-deep .form-fieldset .el-col {
  display: flex;
  flex-direction: column;
}

/* 确保所有表单元素垂直居中 */
::v-deep .form-container .el-radio-group {
  line-height: 40px;
}

::v-deep .form-container .el-input,
::v-deep .form-container .el-select,
::v-deep .form-container .el-date-editor {
  width: 100%;
}

/* 下拉选择、日期选择优化 */
::v-deep .form-container .el-select .el-input__inner,
::v-deep .form-container .el-date-editor .el-input__inner {
  cursor: pointer;
}

::v-deep .form-container .el-input-number__decrease,
::v-deep .form-container .el-input-number__increase {
  background-color: #f5f7fa;
  border-left: 1px solid #e4e7ed;
}

::v-deep .form-container .el-input-number__decrease:hover,
::v-deep .form-container .el-input-number__increase:hover {
  color: #409eff;
}

/* 采购订单图上传优化 */
::v-deep .purchase-order-img-upload {
  text-align: left;
}

/* 响应式优化 */
@media screen and (max-width: 768px) {
  ::v-deep .production-dialog {
    width: 95% !important;
  }

  .form-fieldset {
    padding: 16px 16px 8px;
  }
}

/* ========== BOM文件上传对话框样式 ========== */
.bom-upload-container {
  padding: 10px 0;
}

.bom-upload-container .mb-20 {
  margin-bottom: 20px;
}

.bom-upload-section {
  margin-top: 20px;
}

.bom-upload-section .section-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  display: flex;
  align-items: center;
}

.bom-upload-section .section-title i {
  margin-right: 6px;
  font-size: 16px;
}

/* el-descriptions 样式优化 */
::v-deep .bom-upload-container .el-descriptions-item__label {
  background-color: #fafbfc;
  font-weight: 500;
  color: #606266;
}

::v-deep .bom-upload-container .el-descriptions-item__content {
  color: #303133;
}

/* ========== 采购信息同步对话框样式 ========== */
.sync-purchase-container {
  padding: 10px 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.5;
}
</style>
