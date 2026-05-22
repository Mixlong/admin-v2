<template>
  <vxe-table
    ref="vxeTable"
    :data="data"
    :loading="loading"
    :height="height"
    border
    size="mini"
    :row-config="{ keyField: rowKey, isHover: true, height: 50 }"
    :column-config="{ resizable: false }"
    show-overflow="ellipsis"
    show-header-overflow="ellipsis"
    :filter-config="{ remote: false }"
    :virtual-y-config="{ enabled: true, gt: 50, rowHeight: 50 }"
    @filter-change="handleFilterChange"
    @sort-change="handleSortChange"
    class="virtual-after-problem-table"
  >
    <!-- 序号列 -->
    <vxe-column type="seq" title="序号" width="60" fixed="left" align="center"></vxe-column>

    <!-- 问题点分组 -->
    <vxe-colgroup title="问题点" header-class-name="group-problem" header-align="center">
      <vxe-column 
        field="problemSource" 
        title="问题来源" 
        width="110" 
        align="center"
        :filters="problemSourceFilters"
        :filter-multiple="false"
        class-name="col-problem"
        header-class-name="col-problem"
      >
        <template #default="{ row }">
          <span :title="getProblemSourceText(row.problemSource)">{{ getProblemSourceText(row.problemSource) }}</span>
        </template>
      </vxe-column>
      <vxe-column field="problemTime" title="时间点" width="130" align="center" class-name="col-problem" header-class-name="col-problem">
        <template #default="{ row }">
          <span>{{ parseTime(row.problemTime, "{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </vxe-column>
      <vxe-column field="problemDescription" title="问题描述" min-width="200" align="center" class-name="col-problem" header-class-name="col-problem">
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top" :open-delay="500">
            <div slot="content" style="max-width: 500px; max-height: 400px; overflow-y: auto;">
              <div v-html="row.problemDescription"></div>
            </div>
            <div class="html-content" v-html="row.problemDescription"></div>
          </el-tooltip>
          <el-link
            v-if="row.businessIds || row.businessIdList"
            type="primary"
            :underline="false"
            @click="$emit('view-business-records', row)"
            style="margin-top: 5px; font-size: 12px"
          >
            {{ getBusinessLinkText(row.problemSource) }}
          </el-link>
        </template>
      </vxe-column>
      <vxe-column 
        field="problemManager" 
        title="问题追踪人" 
        width="120" 
        align="center"
        :filters="problemManagerFilters" 
        :filter-multiple="true"
        class-name="col-problem" 
        header-class-name="col-problem"
      >
        <template #default="{ row }">
          <span :title="row.problemManager">{{ row.problemManager || '-' }}</span>
        </template>
      </vxe-column>
    </vxe-colgroup>

    <!-- 迪太研发&品质分组 -->
    <vxe-colgroup title="迪太研发&品质" header-class-name="group-research" header-align="center">
      <vxe-column field="problemAnalysis" title="问题分析（过程）" min-width="180" align="center" class-name="col-research" header-class-name="col-research">
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top" :open-delay="500">
            <div slot="content" style="max-width: 500px; max-height: 400px; overflow-y: auto;">
              <div v-html="row.problemAnalysis"></div>
            </div>
            <div class="html-content" v-html="row.problemAnalysis"></div>
          </el-tooltip>
        </template>
      </vxe-column>
      <vxe-column field="analysisResult" title="分析结果" min-width="180" align="center" class-name="col-research" header-class-name="col-research">
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top" :open-delay="500">
            <div slot="content" style="max-width: 500px; max-height: 400px; overflow-y: auto;">
              <div v-html="row.analysisResult"></div>
            </div>
            <div class="html-content" v-html="row.analysisResult"></div>
          </el-tooltip>
        </template>
      </vxe-column>
      <vxe-column field="analysisResponsible" title="责任人" width="120" align="center" class-name="col-research" header-class-name="col-research">
        <template #default="{ row }">
          <span :title="row.analysisResponsible">{{ row.analysisResponsible || '-' }}</span>
        </template>
      </vxe-column>
    </vxe-colgroup>

    <!-- 对策分组 -->
    <vxe-colgroup title="对策" header-class-name="group-solution" header-align="center">
      <vxe-column field="impactScope" title="影响面" min-width="150" align="center" class-name="col-solution" header-class-name="col-solution">
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top" :open-delay="500">
            <div slot="content" style="max-width: 500px; max-height: 400px; overflow-y: auto;">
              <div v-html="row.impactScope"></div>
            </div>
            <div class="html-content" v-html="row.impactScope"></div>
          </el-tooltip>
        </template>
      </vxe-column>
      <vxe-column field="internalMeasures" title="短期对策" min-width="150" align="center" class-name="col-solution" header-class-name="col-solution">
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top" :open-delay="500">
            <div slot="content" style="max-width: 500px; max-height: 400px; overflow-y: auto;">
              <div v-html="row.internalMeasures"></div>
            </div>
            <div class="html-content" v-html="row.internalMeasures"></div>
          </el-tooltip>
        </template>
      </vxe-column>
      <vxe-column field="externalMeasures" title="长期对策" min-width="150" align="center" class-name="col-solution" header-class-name="col-solution">
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top" :open-delay="500">
            <div slot="content" style="max-width: 500px; max-height: 400px; overflow-y: auto;">
              <div v-html="row.externalMeasures"></div>
            </div>
            <div class="html-content" v-html="row.externalMeasures"></div>
          </el-tooltip>
        </template>
      </vxe-column>
      <vxe-column field="countermeasureResponsible" title="责任人" width="120" align="center" class-name="col-solution" header-class-name="col-solution">
        <template #default="{ row }">
          <span :title="row.countermeasureResponsible">{{ row.countermeasureResponsible || '-' }}</span>
        </template>
      </vxe-column>
    </vxe-colgroup>

    <!-- 改善跟踪分组 -->
    <vxe-colgroup title="改善跟踪" header-class-name="group-tracking" header-align="center">
      <vxe-column field="completionTime" title="完成时间" width="140" align="center" class-name="col-tracking" header-class-name="col-tracking">
        <template #default="{ row }">
          <span>{{ parseTime(row.completionTime, "{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </vxe-column>
      <vxe-column field="effectivenessConfirmation" title="效果确认" width="85" align="center" class-name="col-tracking" header-class-name="col-tracking">
        <template #default="{ row }">
          <span 
            :class="getEffectivenessConfirmationClass(row.effectivenessConfirmation)"
            :title="getEffectivenessConfirmationText(row.effectivenessConfirmation)"
          >
            {{ getEffectivenessConfirmationText(row.effectivenessConfirmation) }}
          </span>
        </template>
      </vxe-column>
      <vxe-column field="responsiblePerson" title="责任人" width="120" align="center" class-name="col-tracking" header-class-name="col-tracking">
        <template #default="{ row }">
          <span :title="row.responsiblePerson">{{ row.responsiblePerson || '-' }}</span>
        </template>
      </vxe-column>
    </vxe-colgroup>

    <!-- 操作列 -->
    <vxe-column title="操作" width="120" fixed="right" align="center">
      <template #default="{ row }">
        <el-button
          v-hasPermi="['third:afterProblem:query']"
          class="text-green"
          type="text"
          size="small"
          style="margin-right: 10px"
          @click="$emit('detail', row)"
        >
          详情
        </el-button>
        <el-dropdown
          trigger="click"
          @command="(cmd) => $emit('module-edit', cmd, row)"
        >
          <el-button type="text" size="small">
            更多<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-if="checkPermi(['third:afterProblem:editProblem']) || checkPermi(['third:afterProblem:edit'])"
              command="problem"
            >修改问题</el-dropdown-item>
            <el-dropdown-item
              v-if="checkPermi(['third:afterProblem:editResearch']) || checkPermi(['third:afterProblem:edit'])"
              command="research"
            >添加分析</el-dropdown-item>
            <el-dropdown-item
              v-if="checkPermi(['third:afterProblem:editSolution']) || checkPermi(['third:afterProblem:edit'])"
              command="solution"
            >添加对策</el-dropdown-item>
            <el-dropdown-item
              v-if="checkPermi(['third:afterProblem:editTracking']) || checkPermi(['third:afterProblem:edit'])"
              command="tracking"
            >添加改善</el-dropdown-item>
            <el-dropdown-item
              v-if="row.problemManager === nickName || nickName === 'admin'"
              command="changeResponsible"
              divided
            >修改责任人</el-dropdown-item>
            <el-dropdown-item
              v-if="checkPermi(['third:afterProblem:edit'])"
              command="all"
              divided
            >全部编辑</el-dropdown-item>
            <el-dropdown-item
              v-if="checkPermi(['third:afterProblem:log'])"
              command="log"
              divided
            >日志</el-dropdown-item>
            <el-dropdown-item
              v-if="checkPermi(['third:afterProblem:remove'])"
              command="delete"
              divided
              class="text-red"
            >删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </vxe-column>
  </vxe-table>
</template>

<script>
import { VxeTable, VxeColumn, VxeColgroup } from "vxe-table";
import "vxe-table/es/style.css";
import { checkPermi } from "@/utils/permission";
import { parseTime } from "@/utils/ruoyi";
import { mapGetters } from "vuex";

export default {
  name: "VirtualAfterProblemTable",

  components: {
    VxeTable,
    VxeColumn,
    VxeColgroup,
  },

  props: {
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    height: {
      type: [Number, String],
      default: 400,
    },
    rowKey: {
      type: String,
      default: "id",
    },
    problemSourceFilters: {
      type: Array,
      default: () => [],
    },
    problemManagerFilters: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    ...mapGetters(["nickName"]),
  },

  methods: {
    checkPermi,
    parseTime,

    clearAllFilters() {
      if (this.$refs.vxeTable) {
        this.$refs.vxeTable.clearFilter();
      }
    },

    handleFilterChange(params) {
      this.$emit("filter-change", params);
    },

    handleSortChange(params) {
      this.$emit("sort-change", params);
    },

    /** 获取问题来源文本 */
    getProblemSourceText(source) {
      const sourceMap = {
        1: "客户反馈",
        2: "生产反馈",
        3: "品质反馈",
      };
      return sourceMap[source] || source || "-";
    },

    /** 效果确认显示文本 */
    getEffectivenessConfirmationText(value) {
      if (value === null || value === undefined || value === "") return "-";
      const text = String(value).trim();
      const upper = text.toUpperCase();
      if (upper === "NG") return "NG";
      if (upper === "PASS") return "PASS";
      return text;
    },

    /** 效果确认颜色（NG 红 / PASS 绿） */
    getEffectivenessConfirmationClass(value) {
      if (value === null || value === undefined || value === "") return "";
      const upper = String(value).trim().toUpperCase();
      if (upper === "NG") return "text-red";
      if (upper === "PASS") return "text-green";
      return "";
    },

    /** 获取业务记录链接文本 */
    getBusinessLinkText(source) {
      const linkMap = {
        1: "查看售后记录",
        2: "查看制程记录",
        3: "查看来料记录",
      };
      return linkMap[source] || "查看记录";
    },
  },
};
</script>

<style lang="scss" scoped>
.text-green {
  color: #67c23a;
}

.text-red {
  color: #f56c6c;
}

// 富文本内容显示样式
.html-content {
  text-align: left;
  word-break: break-word;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;

  ::v-deep p {
    margin: 0;
    padding: 0;
  }

  ::v-deep ul,
  ::v-deep ol {
    margin: 0;
    padding-left: 20px;
  }
}

// 表格样式
.virtual-after-problem-table {
  // 一级分组表头样式（使用渐变背景）
  ::v-deep .group-problem {
    background: linear-gradient(to bottom, #e3f2fd, #bbdefb) !important;
    color: #1976d2 !important;
    font-weight: bold;
  }

  ::v-deep .group-research {
    background: linear-gradient(to bottom, #e8f5e9, #c8e6c9) !important;
    color: #388e3c !important;
    font-weight: bold;
  }

  ::v-deep .group-solution {
    background: linear-gradient(to bottom, #fff3e0, #ffe0b2) !important;
    color: #f57c00 !important;
    font-weight: bold;
  }

  ::v-deep .group-tracking {
    background: linear-gradient(to bottom, #f3e5f5, #e1bee7) !important;
    color: #7b1fa2 !important;
    font-weight: bold;
  }

  // 二级表头样式（使用较淡的渐变）
  ::v-deep th.col-problem {
    background: linear-gradient(to bottom, #f1f8ff, #e3f2fd) !important;
    color: #1976d2;
  }

  ::v-deep th.col-research {
    background: linear-gradient(to bottom, #f4faf4, #e8f5e9) !important;
    color: #388e3c;
  }

  ::v-deep th.col-solution {
    background: linear-gradient(to bottom, #fff9f0, #fff3e0) !important;
    color: #f57c00;
  }

  ::v-deep th.col-tracking {
    background: linear-gradient(to bottom, #faf5fb, #f3e5f5) !important;
    color: #7b1fa2;
  }

  // 内容列样式（使用极淡的纯色背景）
  ::v-deep td.col-problem {
    background-color: #fafcff !important;
  }

  ::v-deep td.col-research {
    background-color: #fafdfb !important;
  }

  ::v-deep td.col-solution {
    background-color: #fffdfb !important;
  }

  ::v-deep td.col-tracking {
    background-color: #fdfafd !important;
  }

  // 鼠标悬停时的样式加深（提升交互体验）
  ::v-deep .vxe-body--row:hover {
    td.col-problem {
      background-color: #f0f7ff !important;
    }
    td.col-research {
      background-color: #f0f9f0 !important;
    }
    td.col-solution {
      background-color: #fff8f0 !important;
    }
    td.col-tracking {
      background-color: #f8f0f8 !important;
    }
  }
}
</style>
