<template>
  <div
    class="user-card"
    @mouseleave="mouseLeave"
    :class="[cellStyle(content)]"
  >
    <div class="user-card__inner">
      <div class="user-card__header">
        <button class="user-card__avatar" type="button" @click="changUpdate">
          <img :src="avatarUrl" alt="" />
        </button>
        <div class="user-card__meta">
          <div class="user-card__name" :title="content.nickName">
            {{ content.nickName }}
            <span v-if="content.status == 1" class="user-card__status">停用</span>
          </div>
          <div class="user-card__dept" :title="content.dept && content.dept.deptName">
            {{ content.dept && content.dept.deptName }}
          </div>
        </div>
        <div class="user-card__header-actions">
          <el-tooltip content="编辑" placement="top">
            <el-button size="mini" type="primary" plain icon="el-icon-edit" @click="changUpdate" />
          </el-tooltip>
          <el-tooltip content="重置密码" placement="top">
            <el-button size="mini" type="warning" plain icon="el-icon-unlock" @click="reset" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button size="mini" type="danger" plain icon="el-icon-delete" @click="handleDelete" />
          </el-tooltip>
          <el-tooltip
            v-if="checkRole(['admin']) && content.nickName === 'admin'"
            content="清除令牌"
            placement="top"
          >
            <el-button size="mini" type="danger" plain icon="el-icon-delete" @click="onClearSecurity" />
          </el-tooltip>
        </div>
      </div>

      <div class="user-card__roles" v-if="roles.length">
        <span
          v-for="(tag, i) in rolesPreview"
          :key="i"
          class="user-card__role-chip"
          :title="tag.roleName"
        >
          {{ tag.roleName }}
        </span>
        <el-popover v-if="roles.length > rolesPreview.length" placement="top" trigger="hover" width="320">
          <div class="user-card__roles-popover">
            <div class="user-card__roles-title">全部角色</div>
            <div class="user-card__roles-list">
              <span v-for="(tag, i) in roles" :key="i" class="user-card__role-chip">
                {{ tag.roleName }}
              </span>
            </div>
          </div>
          <el-button slot="reference" type="text" class="user-card__roles-more">更多</el-button>
        </el-popover>
      </div>

      <el-card class="all-content" :class="{ 'all-content-active': openFlag }">
        <div v-for="(pg, o) in content.projectNameList" :key="o" class="all-li">
          {{ pg.name }}
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { clearSecurity } from "@/api/system/user";
import baseApi from "@/utils/requestUrl";
export default {
  props: ["content"],
  data() {
    return {
      openFlag: false, //是否展开菜单
    };
  },
  computed: {
    cRoles() {
      return (list) => {
        return list.filter((item, index) => index < 7);
      };
    },
    roles() {
      return Array.isArray(this.content?.roles) ? this.content.roles : [];
    },
    rolesPreview() {
      return this.roles.slice(0, 6);
    },
    avatarUrl() {
      if (this.content && this.content.avatar) {
        return `${baseApi}${this.content.avatar}`;
      }
      return "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
    },
  },
  methods: {
    changUpdate() {
      this.$emit("changeEdit", this.content);
    },
    handleDelete() {
      this.$emit("delete", this.content);
    },
    reset() {
      this.$emit("reset", this.content);
    },
    // 移入
    mouseOver() {
      this.openFlag = true;
    },
    // 移出
    mouseLeave() {
      this.openFlag = false;
    },
    cellStyle(row) {
      let cellStyle;
      if (row.online == 1) {
        cellStyle = "work-end";
      }
      return cellStyle;
    },
    jumpProject(row) {
      this.$router.push({
        path: "/prodData/govern",
        query: {
          id: row.id,
        },
      });
    },
    onClearSecurity() {
      clearSecurity(this.content.userName).then((res) => {
        if (res.data) {
          this.$message({
            showClose: true,
            message: "清除用户令牌成功",
            type: "success",
          });
        } else {
          this.$message({
            showClose: true,
            message: "清除用户令牌失败",
            type: "error",
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.user-card {
  width: 100%;
  min-height: 200px;
  height: auto;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #eef1f6;
  box-shadow: 0 10px 24px rgba(31, 35, 41, 0.08);
  padding: 14px 14px 12px;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
}

.user-card__inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: auto;
}

.user-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #f0f2f5;
  padding: 0;
  background: #fff;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(23, 27, 35, 0.12);
  flex: none;
}

.user-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.user-card__meta {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.user-card__name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #1f2d3d;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card__status {
  font-size: 12px;
  color: #f56c6c;
  font-weight: 500;
  border: 1px solid rgba(245, 108, 108, 0.35);
  background: rgba(245, 108, 108, 0.08);
  padding: 1px 6px;
  border-radius: 999px;
}

.user-card__dept {
  margin-top: 2px;
  font-size: 12px;
  color: #9aa3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card__header-actions {
  display: inline-flex;
  gap: 8px;
  flex: none;
  margin-left: auto;
}

.user-card__header-actions :deep(.el-button) {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 10px;
}

.user-card__roles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 26px;
  max-height: none;
  overflow: visible;
}

.user-card__role-chip {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: #f7f8fb;
  border: 1px solid #eef1f6;
  font-size: 12px;
  color: #4a5568;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card__roles-more {
  padding: 0;
  font-size: 12px;
  color: #409eff;
}

.user-card__roles-popover {
  max-height: 260px;
  overflow: auto;
}

.user-card__roles-title {
  font-size: 12px;
  font-weight: 700;
  color: #1f2d3d;
  margin-bottom: 8px;
}

.user-card__roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.all-content {
  display: none;
}

</style>
