<template>
  <el-popover
    class="margin-right-xs margin-left-xs"
    trigger="manual"
    v-model="item.visible"
    :visible-arrow="false"
    popper-class="padding-xs"
    placement="right-start"
    show-timeout="100"
  >
    <div class="popover-coust-hover">
      <div class="text-center" @click="handelUpdate(item, 1)">
        <el-button type="text" size="small" icon="el-icon-edit  text-blue">
        </el-button>
      </div>
      <div v-if="add" class="text-center text-red" @click="handleAdd(item, 1)">
        <el-button
          type="text"
          size="small"
          class="text-red"
          icon="el-icon-plus"
        ></el-button>
      </div>
      <div class="text-center text-red" @click="handleDelete(item, 1)">
        <el-button
          type="text"
          size="small"
          class="text-red"
          icon="el-icon-delete"
        ></el-button>
      </div>
    </div>

    <el-button
      type="text"
      slot="reference"
      size="small"
      style="width: 100%; height: 40px; text-align: left"
      @contextmenu.prevent.native="rightClick(item, $event)"
    >
      {{ item.title }}</el-button
    >
  </el-popover>
</template>

<script>
export default {
  props: ["item", "add"],
  methods: {
    rightClick(row, event) {
      this.$emit("change");
      event.preventDefault(); //关闭浏览器右键默认事件
      row.visible = true;
    },
    handelUpdate(item) {
      this.$emit("update", item);
      this.$emit("change");
    },
    handleAdd(item) {
      this.$emit("add", item);
      this.$emit("change");
    },
    handleDelete(item) {
      this.$emit("delete", item);
      this.$emit("change");
    },
  },
};
</script>

<style lang='scss' scope>
.popover-coust-hover {
  > div {
    height: 30px;
    line-height: 30px;
    &:hover {
      background: rgba(110, 154, 255, 0.5);
    }
  }
}
</style>