<template>
  <el-popover placement="top" width="600" trigger="hover">
    <el-card class="box-card">
      <div slot="header" class="clearfix flex justify-between">
        <div class="flex flex-sub">
          {{ currentDataName }} （<ColumnState :state="row.map[currentIndex]" />）
        </div>

        <div>
          <span class="margin-right-xss"> 品类：{{ row.categoryName }} </span>
          <span> 型号：{{ row.computerName }} </span>
        </div>
      </div>
      <div class="missTag">
        <el-tag
          v-for="(item, index) in row.mapFile[currentIndex]"
          :key="index"
        >
          {{ item.typeValue }}
        </el-tag>
      </div>
    </el-card>

    <div slot="reference">
      <ColumnState :state="row.map[currentIndex]" />
    </div>
  </el-popover>
</template>

<script>
export default {
  props: {
    currentDataName: {
        type: String,
        required: true,
        default: ""
    },
    currentIndex: {
        type: Number,
        required: true
    },
    row: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  components: {
    ColumnState: () => import("./columnState"),
  },
};
</script>

<style lang="scss" scoped>
.missTag {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  grid-gap: 15px;
  max-height: 250px;
  overflow: hidden;
  overflow-y: auto;
}
</style>
