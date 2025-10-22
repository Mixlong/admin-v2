<template>
  <el-dialog
    title="SOP草稿箱"
    :visible="visible"
    width="1200px"
    append-to-body
    top="0vh"
    @close="handleClose"
  >
    <div class="draft-box-container">
      <el-table :data="draftList" border height="56vh" empty-text="暂无草稿">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column
          label="品类"
          min-width="120"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="{ row }">
            {{
              row.categoryName ||
              row.formData.categoryName ||
              row.categoryId ||
              "-"
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="versionCode"
          label="版本号"
          min-width="120"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="{ row }">
            {{ row.formData.versionCode || "-" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="desc"
          label="描述"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="{ row }">
            {{ row.formData.desc || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="工位数量" width="100" align="center">
          <template slot-scope="{ row }">
            {{ getWorkstationCount(row.formData) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160" align="center">
          <template slot-scope="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="160" align="center">
          <template slot-scope="{ row }">
            {{ formatTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" class="text-blue" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="text" class="text-red" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "DraftBox",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      draftList: [],
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadDraftList();
      }
    },
  },
  methods: {
    /** 加载草稿列表 */
    loadDraftList() {
      try {
        const draftsStr = localStorage.getItem("sop_drafts");
        this.draftList = draftsStr ? JSON.parse(draftsStr) : [];
      } catch (error) {
        console.error("读取草稿列表失败:", error);
        this.draftList = [];
        this.msgError("读取草稿列表失败");
      }
    },

    /** 获取工位数量 */
    getWorkstationCount(formData) {
      if (!formData || !formData.workstations) return 0;

      let count = 0;
      Object.values(formData.workstations).forEach((list) => {
        if (Array.isArray(list)) {
          count += list.length;
        }
      });

      return count;
    },

    /** 格式化时间 */
    formatTime(time) {
      if (!time) return "-";

      try {
        const date = new Date(time);
        return date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      } catch (error) {
        return "-";
      }
    },

    /** 编辑草稿 */
    handleEdit(row) {
      this.$emit("edit-draft", row.id);
      this.handleClose();
    },

    /** 删除草稿 */
    handleDelete(row) {
      this.$confirm("确定要删除这个草稿吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          try {
            // 从 localStorage 中删除
            const drafts = this.draftList.filter((d) => d.id !== row.id);
            localStorage.setItem("sop_drafts", JSON.stringify(drafts));

            // 更新列表
            this.loadDraftList();

            this.msgSuccess("草稿已删除");
          } catch (error) {
            console.error("删除草稿失败:", error);
            this.msgError("删除草稿失败，请重试");
          }
        })
        .catch(() => {
          // 取消删除
        });
    },

    /** 关闭弹窗 */
    handleClose() {
      this.$emit("update:visible", false);
    },
  },
};
</script>

<style lang="scss" scoped>
.draft-box-container {
  min-height: 200px;
}

.text-blue {
  color: #409eff;

  &:hover {
    color: #66b1ff;
  }
}

.text-red {
  color: #f56c6c;

  &:hover {
    color: #f78989;
  }
}
</style>
