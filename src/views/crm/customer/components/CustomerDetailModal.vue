<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="1400px"
      center
      :title="`客户详情 - ${customer.name}`"
      top="0vh"
      :before-close="handleClose"
      class="customer-detail-dialog dialog-scroll"
      :close-on-click-modal="false"
    >
      <div v-if="customer" class="customer-detail-container">
        <!-- 客户头部信息 -->
        <div class="customer-header">
          <div class="customer-info">
            <el-avatar
              :size="60"
              class="bg-blue-600"
              style="margin-right: 10px"
            >
              {{ customer.name && customer.name.charAt(0) }}
            </el-avatar>
            <div class="ml-4">
              <div class="customer-name">
                <div>
                  {{ customer.name }}
                </div>
                <div>
                  {{ customer.no }}
                </div>
                <el-tag
                  :type="getStatusType(customer.customerStatus)"
                  class="ml-2"
                >
                  {{ getStatusText(customer.customerStatus) }}
                </el-tag>
              </div>

              <div class="customer-meta">
                <span class="meta-item">
                  <i class="el-icon-location"></i>
                  {{ customer.address }}
                </span>
                <span class="meta-item">
                  <i class="el-icon-office-building"></i>
                  {{ customer.country }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 主要内容区域 - 左右分栏 -->
        <div class="customer-detail-wrapper">
          <!-- 左侧主要内容区域 -->
          <div class="customer-detail">
            <!-- 标签页内容 -->
            <el-tabs
              v-model="activeTab"
              tab-position="top"
              class="customer-tabs"
            >
              <!-- 基础信息 -->
              <el-tab-pane label="基础信息" name="basic">
                <div class="tab-content">
                  <div class="info-section">
                    <div class="section-title">基本信息</div>
                    <div class="info-grid">
                      <div class="info-item">
                        <div class="info-label">客户全称</div>
                        <div class="info-value">
                          {{ customer.fullName || "--" }}
                        </div>
                      </div>
                      <!-- <div class="info-item">
                        <div class="info-label">客户编号</div>
                        <div class="info-value">{{ customer.no || "--" }}</div>
                      </div> -->
                      <div class="info-item">
                        <div class="info-label">客户简称</div>
                        <div class="info-value">
                          {{ customer.name || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">所属国家</div>
                        <div class="info-value">
                          {{
                            getDictLabel("country_origin", customer.country) ||
                            customer.country ||
                            "--"
                          }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">合作状态</div>
                        <div class="info-value">
                          <el-tag
                            :type="getStatusType(customer.customerStatus)"
                            size="small"
                          >
                            {{ getStatusText(customer.customerStatus) }}
                          </el-tag>
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">客户级别</div>
                        <div class="info-value">
                          <el-tag
                            :type="getLevelType(customer.customerLevel)"
                            size="small"
                            v-if="customer.customerLevel"
                          >
                            {{
                              getDictLabel(
                                "customer_type_enum",
                                customer.customerLevel
                              ) || customer.customerLevel
                            }}
                          </el-tag>
                          <span v-else>--</span>
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">客户来源</div>
                        <div class="info-value">
                          {{ customer.customerSource || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">客户属性</div>
                        <div class="info-value">
                          {{ customer.customerAttribute || "--" }}
                        </div>
                      </div>
                      <div class="info-item info-item--span2">
                        <div class="info-label">客户网址</div>
                        <div class="info-value">
                          {{ customer.address || "--" }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="info-section">
                    <div class="section-title">产品信息</div>
                    <div class="info-grid">
                      <div class="info-item">
                        <div class="info-label">电控供应商</div>
                        <div class="info-value">
                          {{ customer.electricalSupplier || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">仪表供应商</div>
                        <div class="info-value">
                          {{ customer.instrumentSupplier || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">组装工厂</div>
                        <div class="info-value">
                          {{ customer.assemblyFactory || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">年出货量</div>
                        <div class="info-value">
                          {{ customer.annualShipments || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">产品意向</div>
                        <div class="info-value">
                          <template v-if="customer.productIntent">
                            <el-tag
                              v-for="(intent, index) in getProductIntentArray(
                                customer.productIntent
                              )"
                              :key="index"
                              size="mini"
                              type="info"
                              class="mr-1"
                            >
                              {{
                                getDictLabel("product_intention", intent) ||
                                intent
                              }}
                            </el-tag>
                          </template>
                          <span v-else>--</span>
                        </div>
                      </div>
                      <div class="info-item info-item--span3">
                        <div class="info-label">背景调查</div>
                        <div class="info-value text-content">
                          {{ customer.backgroundCheck || "--" }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="info-section">
                    <div class="section-title">财务信息</div>
                    <div class="info-grid">
                      <div class="info-item">
                        <div class="info-label">结算期限</div>
                        <div class="info-value">
                          <el-tag
                            :type="getPaymentTermType(customer.paymentTerm)"
                            size="small"
                          >
                            {{ customer.paymentTerm || "--" }}
                          </el-tag>
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">税种</div>
                        <div class="info-value">
                          <el-tag
                            :type="getTaxTypeColor(customer.taxType)"
                            size="small"
                          >
                            {{
                              getDictLabel("tax_type", customer.taxType) ||
                              customer.taxType ||
                              "--"
                            }}
                          </el-tag>
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">增值税税率(%)</div>
                        <div class="info-value">
                          {{
                            customer.vatRate !== undefined &&
                            customer.vatRate !== null
                              ? `${customer.vatRate}%`
                              : "--"
                          }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">发票抬头</div>
                        <div class="info-value">
                          {{ customer.invoiceTitle || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">发票税号</div>
                        <div class="info-value">
                          {{ customer.invoiceTaxNo || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">开户银行</div>
                        <div class="info-value">
                          <el-tag
                            :type="getBankColor(customer.bankName)"
                            size="small"
                          >
                            {{
                              getDictLabel("bank_account", customer.bankName) ||
                              customer.bankName ||
                              "--"
                            }}
                          </el-tag>
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">银行账户</div>
                        <div class="info-value">
                          {{ customer.bankAccount || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">开户电话</div>
                        <div class="info-value">
                          {{ customer.bankPhone || "--" }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="info-section">
                    <div class="section-title">管理信息</div>
                    <div class="info-grid">
                      <div class="info-item">
                        <div class="info-label">销售负责人</div>
                        <div class="info-value">
                          <div class="user-info">
                            <el-avatar :size="20" class="bg-blue-600">
                              {{
                                customer.salesLeader &&
                                customer.salesLeader.charAt(0)
                              }}
                            </el-avatar>
                            <span class="user-name">{{
                              customer.salesLeader || "--"
                            }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">销售经理</div>
                        <div class="info-value">
                          <div class="user-info" v-if="customer.assistant">
                            <el-avatar :size="20" class="bg-green-600">
                              {{
                                customer.assistant &&
                                customer.assistant.charAt(0)
                              }}
                            </el-avatar>
                            <span class="user-name">{{
                              customer.assistant
                            }}</span>
                          </div>
                          <span v-else>--</span>
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">交付经理</div>
                        <div class="info-value">
                          <div class="user-info">
                            {{ customer.deliveryManager || "--" }}
                          </div>
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">创建时间</div>
                        <div class="info-value">
                          {{ customer.createTime || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">更新时间</div>
                        <div class="info-value">
                          {{ customer.updateTime || "--" }}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">创建人</div>
                        <div class="info-value">
                          <el-avatar :size="20" class="bg-purple-600">
                            {{
                              customer.createBy && customer.createBy.charAt(0)
                            }}
                          </el-avatar>
                          <span class="user-name">{{
                            customer.createBy || "--"
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 联系人 -->
              <el-tab-pane label="联系人" name="contacts">
                <div class="tab-content">
                  <div class="section-header">
                    <el-button
                      icon="el-icon-plus"
                      type="primary"
                      size="mini"
                      @click="handleAddContact"
                      v-hasPermi="['crm:contact:add']"
                    >
                      添加联系人
                    </el-button>
                  </div>

                  <el-table
                    v-loading="contactLoading"
                    :data="contactList"
                    style="width: 100%"
                    height="53vh"
                    border
                    size="small"
                    element-loading-text="加载联系人数据..."
                    class="crm-contact-table"
                  >
                    <el-table-column
                      prop="customerName"
                      label="客户简称"
                      width="170"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        {{
                          row.customerName || (customer && customer.name) || "-"
                        }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="contactName"
                      label="联系人"
                      width="150"
                      align="center"
                    />
                    <el-table-column
                      prop="department"
                      label="部门"
                      width="140"
                      align="center"
                    />
                    <el-table-column
                      prop="position"
                      label="职位"
                      width="140"
                      align="center"
                    />
                    <el-table-column prop="email" label="邮箱" align="center">
                      <template slot-scope="{ row }">
                        <div v-if="row.email">
                          <span
                            class="cursor-pointer text-blue-600"
                            @click="handleEmail(row.email)"
                          >
                            {{ row.email }}
                          </span>
                        </div>
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="contactPhone"
                      label="其他联系方式"
                      width="150"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        <div v-if="row.contactPhone">
                          <span
                            class="cursor-pointer text-blue-600"
                            @click="handleCall(row.contactPhone)"
                          >
                            {{ row.contactPhone }}
                          </span>
                        </div>
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="cardImage"
                      label="名片"
                      width="200"
                      align="center"
                    >
                      <template slot-scope="scope">
                        <div
                          v-if="
                            scope.row.cardImage &&
                            getImageList(scope.row.cardImage).length > 0
                          "
                        >
                          <el-carousel
                            v-if="getImageList(scope.row.cardImage).length > 1"
                            height="50px"
                            :autoplay="false"
                            indicator-position="none"
                            arrow="hover"
                            :interval="4000"
                            style="
                              width: 120px;
                              border-radius: 4px;
                              overflow: hidden;
                              margin: auto;
                            "
                          >
                            <el-carousel-item
                              v-for="(img, index) in getImageList(
                                scope.row.cardImage
                              )"
                              :key="index"
                            >
                              <el-image
                                style="width: 60px; height: 50px"
                                :src="img"
                                :preview-src-list="
                                  getImageList(scope.row.cardImage)
                                "
                                :initial-index="index"
                                fit="cover"
                              >
                              </el-image>
                            </el-carousel-item>
                          </el-carousel>
                          <el-image
                            v-else
                            style="
                              width: 60px;
                              height: 50px;
                              border-radius: 4px;
                            "
                            :src="getImageList(scope.row.cardImage)[0]"
                            :preview-src-list="
                              getImageList(scope.row.cardImage)
                            "
                            fit="cover"
                          >
                          </el-image>
                        </div>
                        <span v-else>--</span>
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="isDecisionMaker"
                      label="决策人"
                      width="100"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        <el-tag
                          :type="row.isDecisionMaker === 1 ? 'success' : 'info'"
                          size="small"
                        >
                          {{ row.isDecisionMaker === 1 ? "是" : "否" }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="操作"
                      align="center"
                      width="190"
                      fixed="right"
                    >
                      <template slot-scope="{ row }">
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-view"
                          @click="handleViewContact(row)"
                          v-hasPermi="['crm:contact:query']"
                        >
                          查看
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-edit"
                          @click="handleEditContact(row)"
                          v-hasPermi="['crm:contact:edit']"
                        >
                          编辑
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          class="action-danger"
                          icon="el-icon-delete"
                          @click="handleDeleteContact(row)"
                          v-hasPermi="['crm:contact:remove']"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>

              <!-- 跟进记录 -->
              <el-tab-pane label="跟进记录" name="followups">
                <div class="tab-content">
                  <div class="section-header">
                    <el-button
                      icon="el-icon-plus"
                      type="primary"
                      size="mini"
                      @click="handleAddFollowUp"
                      v-hasPermi="['crm:followRecord:add']"
                    >
                      添加跟进
                    </el-button>
                  </div>

                  <el-table
                    v-loading="followUpLoading"
                    :data="followUpList"
                    border
                    height="53vh"
                    size="small"
                    element-loading-text="加载跟进记录..."
                    class="crm-followup-table"
                  >
                    <el-table-column
                      prop="customerName"
                      label="客户简称"
                      width="150"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        {{
                          row.customerName || (customer && customer.name) || "-"
                        }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="followContent"
                      label="跟进内容"
                      align="left"
                      header-align="center"
                    >
                      <template slot-scope="{ row }">
                        <div
                          class="cursor-pointer"
                          @click="handleViewFollowRecord(row)"
                        >
                          <div
                            class="font-medium text-blue-600 hover:underline"
                          >
                            {{ row.followContent || row.content || "--" }}
                          </div>
                        </div>
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="followMethod"
                      label="沟通方式"
                      width="100"
                    >
                      <template slot-scope="{ row }">
                        <el-tag
                          :type="getMethodColor(row.followMethod)"
                          v-if="getMethodText(row.followMethod)"
                        >
                          {{ getMethodText(row.followMethod) }}
                        </el-tag>
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="contactName"
                      label="客户联系人"
                      width="100"
                      align="center"
                    />

                    <el-table-column
                      prop="follower"
                      label="销售经理"
                      width="100"
                      align="center"
                    />

                    <el-table-column
                      prop="followTime"
                      label="跟进时间"
                      width="150"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        <span>
                          {{ parseTime(row.followTime, "{y}-{m}-{d}") }}
                        </span>
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="createTime"
                      label="创建时间"
                      width="150"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        <span>
                          {{ parseTime(row.createTime, "{y}-{m}-{d}") }}
                        </span>
                      </template>
                    </el-table-column>

                    <el-table-column label="操作" width="180" align="center">
                      <template slot-scope="{ row }">
                        <el-button
                          v-if="row.status === 'pending'"
                          type="success"
                          size="small"
                          icon="el-icon-check"
                          @click="handleCompleteFollowRecord(row)"
                          v-hasPermi="['crm:followRecord:complete']"
                        >
                          完成
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-view"
                          @click="handleViewFollowRecord(row)"
                          v-hasPermi="['crm:followRecord:query']"
                        >
                          查看
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-edit"
                          @click="handleEditFollowup(row)"
                          v-hasPermi="['crm:followRecord:edit']"
                        >
                          编辑
                        </el-button>
                        <el-button
                          v-if="row.status === 'pending'"
                          type="text"
                          size="small"
                          class="action-warning"
                          icon="el-icon-close"
                          @click="handleCancelFollowRecord(row)"
                          v-hasPermi="['crm:followRecord:cancel']"
                        >
                          取消
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          class="action-danger"
                          icon="el-icon-delete"
                          @click="handleDeleteFollowRecord(row)"
                          v-hasPermi="['crm:followRecord:remove']"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>

              <!-- 跟进计划 -->
              <el-tab-pane label="跟进计划" name="plans">
                <div class="tab-content">
                  <div class="section-header">
                    <el-button
                      icon="el-icon-plus"
                      type="primary"
                      size="mini"
                      @click="handleAddPlan"
                      v-hasPermi="['crm:followPlan:add']"
                    >
                      制定计划
                    </el-button>
                  </div>

                  <el-table
                    v-loading="planLoading"
                    :data="planList"
                    border
                    size="small"
                    height="53vh"
                    element-loading-text="加载跟进计划..."
                    class="crm-plan-table"
                    style="width: 100%"
                  >
                    <el-table-column
                      prop="customerName"
                      label="客户简称"
                      width="160"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        {{
                          row.customerName || (customer && customer.name) || "-"
                        }}
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="planContent"
                      label="计划内容"
                      min-width="200"
                      align="left"
                      header-align="center"
                      show-overflow-tooltip
                    />

                    <el-table-column
                      prop="planTime"
                      label="计划时间"
                      width="160"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        {{ parseTime(row.planTime, "{y}-{m}-{d}") }}
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="planState"
                      label="状态"
                      width="100"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        <el-tag
                          :type="row.planState === 1 ? 'success' : 'info'"
                          size="small"
                        >
                          {{ row.planState === 1 ? "已完成" : "待完成" }}
                        </el-tag>
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="createBy"
                      label="销售经理"
                      width="100"
                      align="center"
                    />

                    <el-table-column
                      prop="createTime"
                      label="创建时间"
                      width="160"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        {{ parseTime(row.createTime, "{y}-{m}-{d}") }}
                      </template>
                    </el-table-column>

                    <el-table-column
                      label="操作"
                      align="center"
                      width="140"
                      fixed="right"
                    >
                      <template slot-scope="{ row }">
                        <!-- <el-button
                          type="text"
                          size="small"
                          icon="el-icon-plus"
                          @click="handleAddFollowRecordFromPlan(row)"
                          v-hasPermi="['crm:followRecord:add']"
                        >
                          添加跟进记录
                        </el-button> -->
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-edit"
                          @click="handleEditPlan(row)"
                          v-hasPermi="['crm:followPlan:edit']"
                        >
                          编辑
                        </el-button>
                        <!-- <el-button
                          type="text"
                          size="small"
                          icon="el-icon-finished"
                          @click="handleCompletePlan(row)"
                          :disabled="row.planState === 1"
                          v-hasPermi="['crm:followPlan:complete']"
                        >
                          完成
                        </el-button> -->
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-delete"
                          style="color: #f56c6c"
                          @click="handleDeletePlan(row)"
                          v-hasPermi="['crm:followPlan:remove']"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>

              <!-- 项目跟进 -->
              <el-tab-pane label="项目跟进" name="projectFollow">
                <div class="tab-content">
                  <div class="section-header">
                    <el-button
                      icon="el-icon-plus"
                      type="primary"
                      size="mini"
                      @click="handleAddProjectFollow"
                      v-hasPermi="['crm:projectFollow:add']"
                    >
                      新增项目跟进
                    </el-button>
                  </div>

                  <el-table
                    v-loading="projectFollowLoading"
                    :data="projectFollowList"
                    style="width: 100%"
                    border
                    size="small"
                    height="53vh"
                    element-loading-text="加载项目跟进..."
                    class="crm-project-follow-table"
                  >
                    <el-table-column
                      prop="customerName"
                      label="客户简称"
                      width="150"
                      align="center"
                      show-overflow-tooltip
                    >
                      <template slot-scope="{ row }">
                        {{
                          row.customerName || (customer && customer.name) || "-"
                        }}
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="projectBackground"
                      label="项目背景"
                      min-width="150"
                      align="left"
                      header-align="center"
                      show-overflow-tooltip
                    />

                    <el-table-column
                      prop="projectName"
                      label="项目名称"
                      width="150"
                      align="center"
                      show-overflow-tooltip
                    >
                      <template slot-scope="{ row }">
                        <div
                          class="cursor-pointer text-blue-600 hover:underline"
                          @click="handleViewProjectFollow(row)"
                        >
                          {{ row.projectName || "-" }}
                        </div>
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="requirementLink"
                      label="需求总表"
                      width="120"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        <el-button
                          v-if="
                            row.requirementLink && row.requirementLink.trim()
                          "
                          type="text"
                          size="mini"
                          style="color: #409eff; padding: 0"
                          @click="openLink(row.requirementLink)"
                        >
                          查看链接
                        </el-button>
                        <span v-else style="color: #c0c4cc">-</span>
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="projectNode"
                      label="项目阶段"
                      width="120"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        <el-tag
                          :type="getProjectNodeType(row.projectNode)"
                          size="small"
                        >
                          {{ row.projectNode || "-" }}
                        </el-tag>
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="progress"
                      label="项目进度"
                      min-width="150"
                      align="left"
                      header-align="center"
                      show-overflow-tooltip
                    >
                      <template slot-scope="{ row }">
                        {{ row.progress || "-" }}
                      </template>
                    </el-table-column>

                    <el-table-column
                      prop="salesManager"
                      label="销售经理"
                      width="100"
                      align="center"
                    />
                    <el-table-column
                      prop="deliveryManager"
                      label="交付经理"
                      width="120"
                      align="center"
                    />

                    <el-table-column
                      prop="createTime"
                      label="创建时间"
                      width="100"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        {{ parseTime(row.createTime, "{y}-{m}-{d}") }}
                      </template>
                    </el-table-column>

                    <el-table-column
                      label="操作"
                      align="center"
                      width="190"
                      fixed="right"
                    >
                      <template slot-scope="{ row }">
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-view"
                          @click="handleViewProjectFollow(row)"
                          v-hasPermi="['crm:projectFollow:query']"
                        >
                          查看
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-edit"
                          @click="handleEditProjectFollow(row)"
                          v-hasPermi="['crm:projectFollow:edit']"
                        >
                          编辑
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-delete"
                          style="color: #f56c6c"
                          @click="handleDeleteProjectFollow(row)"
                          v-hasPermi="['crm:projectFollow:remove']"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>

              <!-- 收货地址 -->
              <el-tab-pane label="收货地址" name="addresses">
                <div class="tab-content">
                  <div class="section-header">
                    <el-button
                      icon="el-icon-plus"
                      type="primary"
                      size="mini"
                      @click="handleAddAddress"
                      v-hasPermi="['crm:customer:address:add']"
                    >
                      添加收货地址
                    </el-button>
                  </div>

                  <el-table
                    v-loading="addressLoading"
                    :data="addressList"
                    style="width: 100%"
                    height="53vh"
                    border
                    size="small"
                    element-loading-text="加载收货地址数据..."
                    class="crm-address-table"
                  >
                    <el-table-column
                      label="收货地址"
                      align="left"
                      min-width="400"
                    >
                      <template slot-scope="{ row }">
                        <div class="address-info">
                          <span v-if="row.contactName || row.contactPhone">
                            <span v-if="row.contactName">{{
                              row.contactName
                            }}</span>
                            <span v-if="row.contactName && row.contactPhone">
                              /
                            </span>
                            <span v-if="row.contactPhone">{{
                              row.contactPhone
                            }}</span>
                            <span
                              v-if="
                                (row.contactName || row.contactPhone) &&
                                row.address
                              "
                            >
                              -
                            </span>
                          </span>
                          <span>{{ row.address || "--" }}</span>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="remark"
                      label="备注"
                      align="left"
                      header-align="center"
                      min-width="180"
                    >
                      <template slot-scope="{ row }">
                        <div class="text-ellipsis" :title="row.remark">
                          {{ row.remark || "--" }}
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="createTime"
                      label="创建时间"
                      width="150"
                      align="center"
                    >
                      <template slot-scope="{ row }">
                        {{ parseTime(row.createTime, "{y}-{m}-{d}") }}
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" align="center">
                      <template slot-scope="{ row }">
                        <el-button
                          type="text"
                          size="mini"
                          icon="el-icon-edit"
                          @click="handleEditAddress(row)"
                          v-hasPermi="['crm:customer:address:edit']"
                        >
                          编辑
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 右侧快速操作面板 -->
          <!-- <div class="quick-panel">
      <el-tabs v-model="quickActiveTab" tab-position="top" class="quick-tabs">
        <el-tab-pane label="快速跟进" name="quick-followup">
          <div class="quick-panel-content">
            <div class="followup-input-section">
              <el-input
                v-model="quickFollowupContent"
                type="textarea"
                :rows="2"
                size="small"
                placeholder="请填写跟进记录"
                class="mb-3"
              />
              <el-button
                type="primary"
                size="small"
                :loading="quickFollowupLoading"
                @click="handleQuickFollowup"
              >
                {{ quickFollowupLoading ? '提交中...' : '添加跟进' }}
              </el-button>
            </div>


            <div class="quick-followup-list">
              <div
                v-for="item in filteredQuickFollowupList"
                :key="item.id"
                class="quick-followup-item"
              >
                <div class="followup-header">
                  <div class="user-info">
                    <el-avatar :size="20" class="bg-blue-600">
                      {{ (item.follower || item.user) && (item.follower || item.user).charAt(0) }}
                    </el-avatar>
                    <div class="user-details">
                      <div class="user-name">{{ item.follower || item.user || '--' }}</div>
                      <div class="followup-time">{{ formatDate(item.followTime || item.time) }}</div>
                    </div>
                  </div>
                </div>
                <div class="followup-content">
                  <div class="content-text">{{ item.followContent || item.content || '--' }}</div>
                  <div v-if="item.followMethod && item.followMethod !== 'other'" class="follow-method">
                    <span class="method-label">跟进方式：</span>
                    <span>{{ getMethodText(item.followMethod || item.method) }}</span>
                  </div>
                  <div class="record-actions">
                    <el-button type="text" size="small" @click="handleEditFollowup(item)">编辑</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
        </div> -->
        </div>
      </div>
    </el-dialog>

    <!-- 快速跟进弹窗 -->
    <QuickFollowUpModal
      :visible.sync="quickFollowUpVisible"
      :customer="customer"
      @refresh="handleRefresh"
    />

    <!-- 添加/编辑联系人弹窗 -->
    <ContactDetailModal
      :visible.sync="contactDetailVisible"
      :contact="currentContact"
      @refresh="handleContactRefresh"
    />

    <ContactFormModal
      :visible.sync="contactFormVisible"
      :default-customer-id="customer ? customer.id : null"
      :default-customer-name="customer ? customer.name : null"
      :contact="editingContact"
      @refresh="handleContactRefresh"
    />

    <!-- 添加/编辑跟进计划弹窗 -->
    <FollowPlanFormDialog
      :visible.sync="followPlanFormVisible"
      :mode="editingFollowPlan ? 'edit' : 'add'"
      :defaultCustomerId="customer ? customer.id : null"
      :defaultCustomerName="customer ? customer.name : null"
      :projectFollow="editingFollowPlan"
      @refresh="handlePlanRefresh"
    />

    <!-- 添加/编辑跟进记录弹窗 -->
    <AddFollowRecordDialog
      :visible.sync="addFollowRecordVisible"
      :default-customer-id="customer ? customer.id : null"
      :default-customer-name="customer ? customer.name : null"
      :default-plan-id="selectedPlan && selectedPlan.id"
      :followRecord="editingFollowRecord"
      @refresh="handleFollowRecordRefresh"
    />

    <ActivityDetailModal
      :visible.sync="followRecordDetailVisible"
      :activity="currentFollowRecord"
      @refresh="handleFollowRecordRefresh"
    />

    <CompleteActivityModal
      :visible.sync="followRecordCompleteVisible"
      :activity="currentFollowRecord"
      @refresh="handleFollowRecordRefresh"
    />

    <!-- 添加/编辑项目跟进弹窗 -->
    <ProjectFollowFormDialog
      :visible.sync="projectFollowFormVisible"
      :mode="editingProjectFollow ? 'edit' : 'add'"
      :defaultCustomerId="customer ? customer.id : null"
      :defaultCustomerName="customer ? customer.name : null"
      :projectFollow="editingProjectFollow"
      @refresh="handleProjectFollowRefresh"
    />

    <ProjectFollowDetailModal
      :visible.sync="projectFollowDetailVisible"
      :projectFollow="currentProjectFollow"
      @refresh="handleProjectFollowRefresh"
    />

    <!-- 添加/编辑收货地址弹窗 -->
    <CustomerAddressFormDialog
      :visible.sync="addressFormVisible"
      :mode="editingAddress && editingAddress.id ? 'edit' : 'add'"
      :customerAddress="editingAddress"
      :disableCustomerSelect="true"
      @refresh="handleAddressRefresh"
    />
  </div>
</template>

<script>
import QuickFollowUpModal from "./QuickFollowUpModal.vue";
import ContactDetailModal from "../../contact/components/ContactDetailModal.vue";
import ContactFormModal from "../../contact/components/ContactFormModal.vue";
import FollowPlanFormDialog from "../../followPlan/components/FollowPlanFormDialog.vue";
import AddFollowRecordDialog from "../../followRecord/components/AddFollowRecordDialog.vue";
import ActivityDetailModal from "../../followRecord/components/ActivityDetailModal.vue";
import CompleteActivityModal from "../../followRecord/components/CompleteActivityModal.vue";
import { getDicts } from "@/api/system/dict/data";
import {
  getContactsByCustomerId,
  deleteCustomerContact,
} from "@/api/third/customerContact";
import {
  getFollowRecordList,
  addFollowRecord,
  updateFollowRecord,
  deleteFollowRecord,
} from "@/api/crm/followRecord";
import {
  getFollowPlanList,
  deleteFollowPlan,
  updateFollowPlanState,
} from "@/api/crm/followPlan";
import {
  getProjectFollowList,
  deleteProjectFollow,
} from "@/api/crm/projectFollow";
import { listCustomerAddress } from "@/api/crm/customerAddress";
import ProjectFollowFormDialog from "../../projectFollow/components/ProjectFollowFormDialog.vue";
import ProjectFollowDetailModal from "../../projectFollow/components/ProjectFollowDetailModal.vue";
import CustomerAddressFormDialog from "../../customer-address/components/CustomerAddressFormDialog.vue";
import { parseTime } from "@/utils/ruoyi";

export default {
  name: "CustomerDetailModal",
  dicts: [
    "customer_type_enum",
    "control_type",
    "product_intention",
    "settlement_period",
    "tax_type",
    "bank_account",
    "follow_method",
    "country_origin",
  ],
  components: {
    QuickFollowUpModal,
    ContactDetailModal,
    ContactFormModal,
    FollowPlanFormDialog,
    AddFollowRecordDialog,
    ActivityDetailModal,
    CompleteActivityModal,
    ProjectFollowFormDialog,
    ProjectFollowDetailModal,
    CustomerAddressFormDialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    customer: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      activeTab: "basic",
      quickFollowUpVisible: false,
      quickActiveTab: "quick-followup",
      quickFollowupContent: "",
      followupSearchText: "",
      commentContent: "",
      // 真实数据
      contactList: [],
      followUpList: [],
      planList: [],
      projectFollowList: [],
      addressList: [],
      // 加载状态
      contactLoading: false,
      followUpLoading: false,
      planLoading: false,
      projectFollowLoading: false,
      addressLoading: false,
      quickFollowupLoading: false,
      // 弹窗控制
      contactDetailVisible: false,
      contactFormVisible: false,
      followPlanFormVisible: false,
      addFollowRecordVisible: false,
      followRecordDetailVisible: false,
      followRecordCompleteVisible: false,
      projectFollowFormVisible: false,
      projectFollowDetailVisible: false,
      addressFormVisible: false,
      // 编辑数据
      currentContact: null,
      currentFollowRecord: null,
      editingContact: null,
      editingFollowRecord: null,
      editingFollowPlan: null,
      editingProjectFollow: null,
      currentProjectFollow: null,
      editingAddress: null,
      selectedPlan: null,
      // 字典数据
      settlementPeriodDict: [],
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit("update:visible", value);
      },
    },
    // 过滤快速跟进记录
    filteredQuickFollowupList() {
      if (!this.followupSearchText) {
        return this.followUpList;
      }

      const search = this.followupSearchText.toLowerCase();
      return this.followUpList.filter((item) => {
        const content = (
          item.followContent ||
          item.content ||
          ""
        ).toLowerCase();
        const user = (item.follower || item.user || "").toLowerCase();
        const method = (item.followMethod || item.method || "").toLowerCase();
        const methodText = this.getMethodText(
          item.followMethod || item.method
        ).toLowerCase();

        return (
          content.includes(search) ||
          user.includes(search) ||
          method.includes(search) ||
          methodText.includes(search)
        );
      });
    },
  },
  watch: {
    customer: {
      handler(newCustomer) {
        if (newCustomer) {
          this.activeTab = "basic";
          console.log("CustomerDetailModal 接收到客户数据:", newCustomer);
          // 加载结算期限字典
          this.loadSettlementPeriodDict();
          // 加载客户相关的所有数据
          this.loadCustomerRelatedData(newCustomer.id);
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.loadSettlementPeriodDict();
  },
  methods: {
    // 处理多图显示 - 将逗号分隔的URL字符串转换为数组
    getImageList(imgStr) {
      if (!imgStr) return [];
      return imgStr.split(",").filter((url) => url.trim() !== "");
    },

    handleClose() {
      this.dialogVisible = false;
    },
    handleEdit() {
      if (this.customer) {
        this.$router.push(`/crm/customer/edit/${this.customer.id}`);
        this.handleClose();
      }
    },
    handleFollowUp() {
      this.quickFollowUpVisible = true;
    },
    handleAddContact() {
      // 打开添加联系人弹窗
      this.editingContact = null; // 清空编辑数据，确保是新增模式
      this.contactFormVisible = true;
    },
    handleViewContact(contact) {
      this.currentContact = contact;
      this.contactDetailVisible = true;
    },
    handleEditContact(contact) {
      // 编辑联系人
      console.log("编辑联系人", contact);
      this.editingContact = contact;
      this.contactFormVisible = true;
    },
    async handleDeleteContact(contact) {
      try {
        await this.$confirm(
          `确定要删除联系人"${contact.contactName}"吗？`,
          "确认删除",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        const response = await deleteCustomerContact(contact.id);
        if (response.code === 200) {
          this.$message.success("删除成功");
          this.handleContactRefresh();
        } else {
          this.$message.error(response.msg || "删除失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除联系人失败:", error);
          this.$message.error("删除失败");
        }
      }
    },
    handleCall(phone) {
      window.location.href = `tel:${phone}`;
    },
    handleEmail(email) {
      window.location.href = `mailto:${email}`;
    },
    handleAddOpportunity() {
      // 创建商机
      console.log("创建商机");
    },
    handleAddFollowUp() {
      // 打开添加跟进记录弹窗
      this.editingFollowRecord = null; // 清空编辑数据，确保是新增模式
      this.selectedPlan = null;
      this.addFollowRecordVisible = true;
    },
    handleAddPlan() {
      // 打开制定跟进计划弹窗
      console.log("打开跟进计划弹窗，当前客户:", this.customer);
      this.editingFollowPlan = null; // 清空编辑数据，确保是新增模式
      this.followPlanFormVisible = true;
    },
    handleAddFollowRecordFromPlan(plan) {
      this.selectedPlan = plan;
      this.editingFollowRecord = null;
      this.addFollowRecordVisible = true;
    },
    handleEditPlan(plan) {
      // 编辑跟进计划
      console.log("编辑跟进计划", plan);
      this.editingFollowPlan = plan;
      this.followPlanFormVisible = true;
    },
    async handleDeletePlan(plan) {
      try {
        await this.$confirm(
          `确认删除计划"${plan.planContent.substring(0, 20)}..."吗？`,
          "确认删除",
          { type: "warning" }
        );
        const response = await deleteFollowPlan(plan.id);
        if (response.code === 200 || response.code === 0) {
          this.$message.success("删除成功");
          this.handlePlanRefresh();
        } else {
          this.$message.error(response.msg || "删除失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除跟进计划失败:", error);
          this.$message.error("删除失败");
        }
      }
    },
    async handleCompletePlan(plan) {
      try {
        await this.$confirm("确认标记为已完成？", "确认", { type: "info" });
        const response = await updateFollowPlanState(plan.id, 1);
        if (response.code === 200 || response.code === 0) {
          this.$message.success("已完成");
          this.handlePlanRefresh();
        } else {
          this.$message.error(response.msg || "操作失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("完成跟进计划失败:", error);
          this.$message.error("操作失败");
        }
      }
    },
    handleEditFollowup(followup) {
      // 编辑跟进记录
      console.log("编辑跟进记录", followup);
      this.editingFollowRecord = followup;
      this.selectedPlan = null;
      this.addFollowRecordVisible = true;
    },
    handleViewFollowRecord(followup) {
      this.currentFollowRecord = followup;
      this.followRecordDetailVisible = true;
    },
    handleCompleteFollowRecord(followup) {
      this.currentFollowRecord = followup;
      this.followRecordCompleteVisible = true;
    },
    async handleCancelFollowRecord(followup) {
      try {
        await this.$confirm(
          `确定要取消跟进记录"${followup.followContent.substring(
            0,
            20
          )}..."吗？`,
          "确认取消",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        const updateData = {
          ...followup,
          status: "cancelled",
          updateTime: new Date().toISOString(),
        };

        const response = await updateFollowRecord(updateData);
        if (response.code === 200) {
          this.$message.success("取消成功");
          this.handleFollowRecordRefresh();
        } else {
          this.$message.error(response.msg || "取消失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("取消跟进记录失败:", error);
          this.$message.error("取消失败");
        }
      }
    },
    async handleDeleteFollowRecord(followup) {
      try {
        await this.$confirm(
          `确定要删除跟进记录"${followup.followContent.substring(
            0,
            20
          )}..."吗？`,
          "确认删除",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        const response = await deleteFollowRecord(followup.id);
        if (response.code === 200) {
          this.$message.success("删除成功");
          this.handleFollowRecordRefresh();
        } else {
          this.$message.error(response.msg || "删除失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除跟进记录失败:", error);
          this.$message.error("删除失败");
        }
      }
    },
    handleAddProjectFollow() {
      // 打开新增项目跟进弹窗
      this.editingProjectFollow = null;
      this.projectFollowFormVisible = true;
    },
    handleEditProjectFollow(projectFollow) {
      // 编辑项目跟进
      console.log("编辑项目跟进", projectFollow);
      this.editingProjectFollow = projectFollow;
      this.projectFollowFormVisible = true;
    },
    handleViewProjectFollow(projectFollow) {
      this.currentProjectFollow = { ...projectFollow };
      this.projectFollowDetailVisible = true;
    },
    async handleDeleteProjectFollow(projectFollow) {
      try {
        await this.$confirm(
          `确定要删除项目跟进"${projectFollow.projectName}"吗？`,
          "确认删除",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        const response = await deleteProjectFollow(projectFollow.id);
        if (response && response.code === 200) {
          this.$message.success("删除成功");
          this.handleProjectFollowRefresh();
        } else {
          this.$message.error(response.msg || "删除失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除项目跟进失败:", error);
          this.$message.error("删除失败");
        }
      }
    },
    // 打开链接
    openLink(url) {
      if (!url) return;
      const link = url.startsWith("http") ? url : `https://${url}`;
      window.open(link, "_blank");
    },
    // 日期格式化
    formatDate(dateStr) {
      return parseTime(dateStr, "{y}-{m}-{d} {h}:{i}:{s}") || "--";
    },
    // 获取跟进方式颜色
    getMethodColor(method) {
      const colorMap = {
        call: "success",
        visit: "primary",
        email: "info",
        wechat: "warning",
        meeting: "info",
        other: "",
      };
      return colorMap[method] || "";
    },

    // 获取跟进方式文本
    getMethodText(method) {
      // 首先尝试从字典获取
      const dictText = this.getDictLabel("follow_method", method);
      if (dictText && dictText !== method) {
        return dictText;
      }

      // 简化：直接返回，无需映射
      return method || "--";
    },

    // 获取产品意向数组
    getProductIntentArray(productIntent) {
      if (!productIntent) return [];
      if (typeof productIntent === "string") {
        return productIntent.split(",").filter((item) => item.trim());
      }
      if (Array.isArray(productIntent)) {
        return productIntent;
      }
      return [productIntent];
    },
    async handleQuickFollowup() {
      if (!this.quickFollowupContent.trim()) {
        this.$message.warning("请填写跟进记录");
        return;
      }

      if (!this.customer || !this.customer.id) {
        this.$message.error("客户信息缺失");
        return;
      }

      this.quickFollowupLoading = true;

      try {
        // 获取当前登录用户信息
        const currentUser = this.$store.state.user || {};
        const currentUserName =
          currentUser.nickName || currentUser.userName || "当前用户";

        // 调用API添加跟进记录
        const now = new Date();
        const followRecordData = {
          customerId: this.customer.id,
          followContent: this.quickFollowupContent,
          followMethod: "other", // 快速记录归类为其他
          follower: currentUserName,
          followTime:
            now.getFullYear() +
            "-" +
            String(now.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(now.getDate()).padStart(2, "0") +
            " " +
            String(now.getHours()).padStart(2, "0") +
            ":" +
            String(now.getMinutes()).padStart(2, "0") +
            ":" +
            String(now.getSeconds()).padStart(2, "0"),
        };

        console.log("快速跟进提交数据:", followRecordData);

        const response = await addFollowRecord(followRecordData);

        if (response.code === 200) {
          this.$message.success("跟进记录添加成功");
          this.quickFollowupContent = "";
          // 刷新跟进记录数据
          this.loadFollowRecords(this.customer.id);
          this.$emit("refresh");
        } else {
          this.$message.error(response.msg || "添加跟进记录失败");
        }
      } catch (error) {
        console.error("添加快速跟进记录失败:", error);
        this.$message.error("添加跟进记录失败");
      } finally {
        this.quickFollowupLoading = false;
      }
    },
    handleAddComment() {
      if (!this.commentContent.trim()) {
        this.$message.warning("请输入评论内容");
        return;
      }

      // 添加新评论
      const newComment = {
        id: Date.now().toString(),
        user: "当前用户", // 这里应该是当前登录用户
        time: new Date().toLocaleString("zh-CN"),
        content: this.commentContent,
      };

      this.comments.unshift(newComment);
      this.commentContent = "";

      this.$message.success("评论发表成功");
    },
    handleReturn() {
      this.$confirm("确定要退回此客户吗？", "退回客户", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$message.success("客户已退回");
          this.$emit("refresh");
        })
        .catch(() => {
          // 用户取消操作
        });
    },
    handleRecycle() {
      this.$confirm("确定要回收此客户吗？", "回收客户", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$message.success("客户已回收");
          this.$emit("refresh");
        })
        .catch(() => {
          // 用户取消操作
        });
    },
    handleChangeOwner() {
      // 这里应该打开更换负责人的弹窗
      this.$message.info("更换负责人功能开发中");
    },
    handleAddCollaborator() {
      // 这里应该打开添加协作人的弹窗
      this.$message.info("添加协作人功能开发中");
    },
    handleAddFromCustomer() {
      // 这里应该打开从客户添加的弹窗
      this.$message.info("从客户添加功能开发中");
    },
    handleRefresh() {
      // 处理刷新事件
      this.$emit("refresh");
    },
    handleContactRefresh() {
      // 刷新联系人数据
      if (this.customer && this.customer.id) {
        this.loadContacts(this.customer.id);
      }
    },
    handlePlanRefresh() {
      // 刷新跟进计划数据
      if (this.customer && this.customer.id) {
        this.loadFollowPlans(this.customer.id);
      }
    },
    handleFollowRecordRefresh() {
      // 刷新跟进记录数据
      if (this.customer && this.customer.id) {
        this.loadFollowRecords(this.customer.id);
      }
    },
    handleProjectFollowRefresh() {
      // 刷新项目跟进数据
      if (this.customer && this.customer.id) {
        this.loadProjectFollows(this.customer.id);
      }
    },
    handleAddressRefresh() {
      // 刷新收货地址数据
      if (this.customer && this.customer.id) {
        this.loadAddresses(this.customer.id);
      }
    },
    handleAddAddress() {
      // 打开添加收货地址弹窗
      // 新增模式下，传递默认客户ID，但不要设置id，这样不会误判为编辑模式
      this.editingAddress =
        this.customer && this.customer.id
          ? {
              customerId: this.customer.id,
              id: null, // 明确设置为null，确保不是编辑模式
            }
          : null;
      this.addressFormVisible = true;
    },
    handleEditAddress(address) {
      // 编辑收货地址
      console.log("编辑收货地址", address);
      this.editingAddress = address;
      this.addressFormVisible = true;
    },
    // 数据加载方法
    // 加载客户相关的所有数据
    async loadCustomerRelatedData(customerId) {
      if (!customerId) return;

      // 并行加载所有数据
      await Promise.all([
        this.loadContacts(customerId),
        this.loadFollowRecords(customerId),
        this.loadFollowPlans(customerId),
        this.loadProjectFollows(customerId),
        this.loadAddresses(customerId),
      ]);
    },

    // 加载联系人列表
    async loadContacts(customerId) {
      this.contactLoading = true;
      try {
        const response = await getContactsByCustomerId(customerId);
        if (response && response.data) {
          this.contactList = response.data;
          console.log("联系人数据:", this.contactList);
        }
      } catch (error) {
        console.error("加载联系人失败:", error);
        this.$message.error("加载联系人失败");
      } finally {
        this.contactLoading = false;
      }
    },

    // 加载跟进记录列表
    async loadFollowRecords(customerId) {
      this.followUpLoading = true;
      try {
        const response = await getFollowRecordList({
          customerId,
          p: 1,
          l: 999,
        });
        if (response && response.data) {
          this.followUpList = response.data.list || response.data;
          console.log("跟进记录数据:", this.followUpList);
        }
      } catch (error) {
        console.error("加载跟进记录失败:", error);
        this.$message.error("加载跟进记录失败");
      } finally {
        this.followUpLoading = false;
      }
    },

    // 加载跟进计划列表
    async loadFollowPlans(customerId) {
      this.planLoading = true;
      try {
        const response = await getFollowPlanList({
          customerId,
          p: 1,
          l: 999,
        });
        if (response && response.data && response.data.list) {
          this.planList = response.data.list;
          console.log("跟进计划数据:", this.planList);
        }
      } catch (error) {
        console.error("加载跟进计划失败:", error);
        this.$message.error("加载跟进计划失败");
      } finally {
        this.planLoading = false;
      }
    },

    // 加载项目跟进列表
    async loadProjectFollows(customerId) {
      this.projectFollowLoading = true;
      try {
        const response = await getProjectFollowList({
          customerId,
          p: 1,
          l: 999,
        });
        if (response && response.data) {
          this.projectFollowList = response.data.list || response.data;
          console.log("项目跟进数据:", this.projectFollowList);
        }
      } catch (error) {
        console.error("加载项目跟进失败:", error);
        this.$message.error("加载项目跟进失败");
      } finally {
        this.projectFollowLoading = false;
      }
    },

    // 加载收货地址列表
    async loadAddresses(customerId) {
      this.addressLoading = true;
      try {
        const response = await listCustomerAddress({
          customerId,
          p: 1,
          l: 999,
        });
        if (response && response.code === 200 && response.data) {
          this.addressList = response.data.list || response.data || [];
          console.log("收货地址数据:", this.addressList);
        }
      } catch (error) {
        console.error("加载收货地址失败:", error);
        this.$message.error("加载收货地址失败");
      } finally {
        this.addressLoading = false;
      }
    },

    // 加载结算期限字典
    async loadSettlementPeriodDict() {
      try {
        const response = await getDicts("settlement_period");
        if (response && response.data) {
          this.settlementPeriodDict = response.data;
          console.log("结算期限字典数据:", this.settlementPeriodDict);
        }
      } catch (error) {
        console.error("加载结算期限字典失败:", error);
      }
    },

    // 获取结算期限标签（根据dictCode）
    getSettlementPeriodLabel(dictCode) {
      if (!dictCode || !this.settlementPeriodDict.length) {
        return dictCode;
      }
      const dict = this.settlementPeriodDict.find(
        (item) => item.dictCode === dictCode
      );
      return dict ? dict.dictLabel : dictCode;
    },

    // 获取字典标签
    getDictLabel(dictType, value) {
      if (value === undefined || value === null || value === "") return "";
      const list =
        (this.dict && this.dict.type && this.dict.type[dictType]) || [];
      const match = list.find(
        (item) =>
          String(item.value) === String(value) ||
          String(item.dictCode || item.raw?.dictCode) === String(value)
      );
      if (!match) return value;
      const label = match.dictLabel || match.label;
      return label || value;
    },

    getStatusType(status) {
      const statusMap = {
        potential: "",
        interested: "warning",
        closed: "success",
        lost: "danger",
      };
      return statusMap[status] || "";
    },
    getStatusText(status) {
      const statusMap = {
        potential: "潜在客户",
        interested: "意向客户",
        closed: "成交客户",
        lost: "终止合作",
      };
      return statusMap[status] || status;
    },
    getLevelType(level) {
      const typeMap = {
        重要客户: "danger",
        VIP客户: "warning",
        普通客户: "success",
        潜在客户: "info",
      };
      return typeMap[level] || "";
    },
    getPaymentTermType(term) {
      const item = this.settlementPeriodItem(term);
      if (!item) return "";
      const typeMap = {
        月结: "warning",
        现金: "success",
        季结: "info",
        半年结: "primary",
        年结: "success",
      };
      return typeMap[item.dictLabel] || "";
    },
    settlementPeriodItem(value) {
      const list =
        (this.dict && this.dict.type && this.dict.type.settlement_period) || [];
      return (
        list.find(
          (item) =>
            String(item.value) === String(value) ||
            String(item.raw?.dictCode) === String(value)
        ) || null
      );
    },
    settlementPeriodCode(value) {
      const item = this.settlementPeriodItem(value);
      return item && item.raw ? item.raw.dictCode : item ? item.value : "";
    },
    getTaxTypeColor(type) {
      const typeMap = {
        纸质专票: "danger",
        电子专票: "info",
        普通发票: "success",
      };
      return typeMap[type] || "";
    },
    getBankColor(bank) {
      const typeMap = {
        建设银行: "success",
        工商银行: "danger",
        农业银行: "info",
        中国银行: "warning",
      };
      return typeMap[bank] || "";
    },

    // 获取项目阶段类型（颜色）
    getProjectNodeType(projectNode) {
      const typeMap = {
        需求澄清: "primary",
        EVT阶段: "success",
        DVT阶段: "warning",
        PVT阶段: "danger",
        量产阶段: "info",
      };
      return typeMap[projectNode] || "primary";
    },
  },
};
</script>

<style scoped>
.customer-detail-dialog ::v-deep.el-dialog {
  margin: 5vh auto;
  max-width: 95vw;
  width: 1400px;
  height: 85vh;

  overflow: hidden;
}

.customer-detail-dialog ::v-deep.el-dialog__body {
  max-height: 85vh !important;
  height: calc(100% - 60px);
  overflow: hidden;
  padding: 20px;
}

.customer-detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 20px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.dialog-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.dialog-actions .el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
}

.dialog-actions .el-button--primary {
  background: #409eff;
  border-color: #409eff;
}

.customer-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.customer-detail-wrapper {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.customer-detail {
  flex: 1;
  min-width: 0;
  height: 100%;
}

.quick-panel {
  width: 280px;
  flex-shrink: 0;
  border-left: 1px solid #e4e7ed;
  padding-left: 15px;
  height: 100%;
}

.customer-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.customer-name {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  display: flex;
  gap: 20px;
}

.customer-code {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.customer-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #606266;
}

.customer-meta {
  display: flex;
  gap: 20px;
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.customer-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.customer-tabs :deep(.el-tabs__header) {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 0 20px;
  flex-shrink: 0;
}

.customer-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.tab-content {
  padding: 0;
}

/* 表格样式 */
.crm-contact-table,
.crm-followup-table,
.crm-plan-table,
.crm-address-table {
  width: 100%;
}

.crm-contact-table :deep(.el-table__body-wrapper),
.crm-followup-table :deep(.el-table__body-wrapper),
.crm-plan-table :deep(.el-table__body-wrapper),
.crm-address-table :deep(.el-table__body-wrapper) {
  max-height: 400px;
  overflow-y: auto;
}

/* 表格内容样式 */
.font-medium {
  font-weight: 500;
}

.text-blue-600 {
  color: #409eff;
}

.hover\:underline:hover {
  text-decoration: underline;
}

.cursor-pointer {
  cursor: pointer;
}

.mr-1 {
  margin-right: 4px;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.info-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
  background: linear-gradient(90deg, #e8f4ff 0%, transparent 100%);
  padding: 6px 0 6px 12px;
  border-radius: 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: #ebeef5;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.info-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  min-height: 42px;
  background-color: #fff;
}

.info-item--span2 {
  grid-column: span 2;
}

.info-item--span3 {
  grid-column: span 3;
}

.info-label {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  font-weight: 500;
  color: #606266;
  font-size: 13px;
  padding: 10px 8px;
  border-right: 1px solid #ebeef5;
}

.info-value {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 13px;
  color: #303133;
  word-break: break-all;
}

.info-item.info-item--span2 .info-label,
.info-item.info-item--span3 .info-label {
  justify-content: center;
  padding-left: 16px;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  margin: 0;
}

.text-content {
  line-height: 1.6;
  color: #606266;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.collaborators {
  display: flex;
  align-items: center;
  gap: 6px;
}

.collaborator-avatar {
  margin: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 20px;
}

.section-header .section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.followup-list {
  max-height: 600px;
  overflow-y: auto;
}

.followup-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
}

.followup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.followup-user {
  display: flex;
  align-items: center;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.followup-time {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.followup-content {
  padding-left: 44px;
}

.followup-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.followup-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
}

.followup-method {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.method-label {
  font-weight: 500;
}

.attachments {
  margin-top: 8px;
}

.dialog-footer {
  text-align: right;
}

/* 快速面板样式 */
.quick-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.quick-tabs :deep(.el-tabs__header) {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 0 20px;
  flex-shrink: 0;
}

.quick-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.quick-panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
}

.followup-input-section {
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.followup-input-section .el-textarea {
  margin-bottom: 8px;
}

.followup-input-section .el-button {
  width: 100%;
}

.search-section {
  margin-bottom: 16px;
  padding: 0 16px;
}

.quick-followup-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 0 12px;
}

.quick-followup-item {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 6px;
  background: #fafafa;
}

.followup-header {
  margin-bottom: 8px;
}

.user-details {
  margin-left: 8px;
}

.user-details .user-name {
  font-size: 12px;
  font-weight: 500;
}

.user-details .followup-time {
  font-size: 10px;
  color: #999;
  margin-top: 1px;
}

.followup-content {
  padding-left: 28px;
}

.content-text {
  font-size: 12px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 4px;
}

.follow-method {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
}

.record-actions {
  display: flex;
  gap: 8px;
}

/* 数据日志样式 */
.log-item {
  padding: 4px 0;
}

.log-user {
  font-weight: 500;
  font-size: 13px;
  color: #333;
}

.log-action {
  color: #666;
  font-size: 12px;
  margin-top: 2px;
}

.log-details {
  color: #999;
  font-size: 11px;
  margin-top: 2px;
}

/* 评论样式 */
.comment-input-section {
  margin-bottom: 16px;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.comment-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-avatar {
  background: #52c41a;
}

.comment-user {
  font-weight: 500;
  font-size: 13px;
  color: #333;
}

.comment-time {
  font-size: 11px;
  color: #999;
}

.comment-content {
  color: #666;
  line-height: 1.5;
  font-size: 13px;
  padding-left: 32px;
}
</style>

<style>
/* 全局样式，针对客户详情弹窗中的tab-pane */
.customer-detail-dialog .el-tab-pane {
  height: calc(75vh - 180px);
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
