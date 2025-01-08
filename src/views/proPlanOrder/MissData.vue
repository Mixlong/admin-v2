<template>
  <el-popover placement="bottom" width="450" trigger="click">
    <el-card class="box-card" shadow="nerver">
      <div slot="header" class="clearfix flex justify-between">
        <div class="flex flex-sub">
          {{ currentDataName }}
        </div>

        <div>
          <span class="margin-right-xss"> 品类：{{ row.categoryName }} </span>
          <span> 型号：{{ row.computerName }} </span>
        </div>
      </div>
      <div class="missTag">
        <div
          v-for="(item, index) in row.mapFile[currentIndex]"
          :key="index"
          class="flex justify-between align-center"
        >
          <el-tag>
            {{ item.typeValue }}
          </el-tag>
          <span v-if="item.status === 0" class="text-red">待上传</span>
          <span v-if="item.status === 1" class="text-yellow">待初审</span>
          <span v-if="item.status === 2" class="text-blue">待终审</span>
          <span v-if="item.status === 3" class="text-gray">未通过</span>
          <span v-if="item.status === 4" class="text-green">已审核</span>
        </div>
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
      default: "",
    },
    currentIndex: {
      type: Number,
      required: true,
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
  flex-direction: column;
  grid-gap: 10px;
  max-height: 250px;
  overflow: hidden;
  overflow-y: auto;
}
</style>
