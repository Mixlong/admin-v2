<template>
  <div
    class="user-card"
    @mouseleave="mouseLeave"
    :class="[cellStyle(content)]"
  >
    <div class="user-card__inner">
      <div class="user-card__header">
        <button class="user-card__avatar" type="button" @click="changUpdate">
          <img
            v-if="showAvatarImage"
            :src="avatarUrl"
            :alt="content.nickName || content.userName || '用户头像'"
            @error="handleAvatarError"
          />
          <span v-else class="user-card__avatar-fallback">
            <i class="el-icon-user-solid" />
          </span>
        </button>
        <div class="user-card__meta">
          <div class="user-card__name" :title="content.nickName">
            {{ content.nickName }}
            <span v-if="content.status == 1" class="user-card__status">停用</span>
          </div>
          <div class="user-card__account" :title="content.userName">
            {{ content.userName }}
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
      avatarLoadError: false,
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
      return "";
    },
    showAvatarImage() {
      return Boolean(this.avatarUrl) && !this.avatarLoadError;
    },
  },
  watch: {
    "content.avatar"() {
      this.avatarLoadError = false;
    },
  },
  methods: {
    changUpdate() {
      this.$emit("changeEdit", this.content);
    },
    handleAvatarError() {
      this.avatarLoadError = true;
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
  min-height: 188px;
  height: auto;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  border: 1px solid #e8eef8;
  box-shadow: 0 12px 28px rgba(31, 35, 41, 0.07);
  padding: 16px 16px 14px;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  border-color: #d8e4f6;
  box-shadow: 0 18px 36px rgba(37, 64, 108, 0.12);
}

.user-card__inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: auto;
}

.user-card__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.user-card__avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid #e3eaf6;
  padding: 0;
  background: linear-gradient(135deg, #eef3fb 0%, #d9e4f5 100%);
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(23, 27, 35, 0.12);
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.user-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.user-card__avatar-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #8d99ab;
  font-size: 28px;
}

.user-card__meta {
  flex: 1;
  min-width: 0;
  text-align: left;
  padding-top: 4px;
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

.user-card__account {
  margin-top: 4px;
  font-size: 12px;
  line-height: 18px;
  color: #73839a;
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
  margin-top: 6px;
  font-size: 12px;
  color: #98a3b5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card__header-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  flex: none;
  margin-left: auto;
  max-width: 84px;
}

.user-card__header-actions :deep(.el-button) {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.88);
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
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f5f7fb;
  border: 1px solid #e8edf5;
  font-size: 12px;
  color: #56657c;
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
