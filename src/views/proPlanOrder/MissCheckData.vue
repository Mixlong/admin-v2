<template>
  <el-popover placement="bottom" width="450" trigger="click" :disabled="state === 1">
    <el-card class="box-card" shadow="nerver">
      <div slot="header" class="clearfix flex justify-between">
        <div class="flex flex-sub">
          {{ currentDataName }}
        </div>

        <div>
          <span class="margin-right-xss"> 品类：{{ categoryName }} </span>
          <span> 型号：{{ computerName }} </span>
        </div>
      </div>
      <div class="missTag">
        <div
          v-for="(item, index) in checkData"
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
      <ColumnCheckState :state="state" />
    </div>
  </el-popover>
</template>

<script>
import ColumnCheckState from './columnCheckState.vue';

export default {
  props: {
    categoryName: {
      type: String,
      default: "",
    },
    computerName: {
      type: String,
      default: "",
    },
    currentDataName: {
      type: String,
      required: true,
      default: "",
    },
    state: {
      type: Number,
      required: true,
      default: 0 
    },
    checkData: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    ColumnCheckState
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
