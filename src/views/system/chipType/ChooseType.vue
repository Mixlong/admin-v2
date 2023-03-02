<template>
  <div>
    <el-checkbox
      v-model="checkAll"
      :indeterminate="isIndeterminate"
      @change="handleCheckAllChange"
    >
      全选
    </el-checkbox>
    <div style="margin: 15px 0"></div>
    <el-checkbox-group
      class="check_group"
      v-model="checkedCities"
      @change="handleCheckedCitiesChange"
    >
      <el-checkbox
        class="margin-bottom-xs"
        v-for="item in typeList"
        :label="item.typeKey"
        :key="item.id"
      >
        {{ item.typeValue }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
export default {
  name: "FILECONFUIChooseType",
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    typeList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      checkAll: false,
      isIndeterminate: false,
      checkedCities: [],
    };
  },
  watch: {
    value: {
      handler(data) {
        this.checkAll = data.length === this.typeList.length;
        this.checkedCities = data;
      },
      immediate: true,
    },
  },
  methods: {
    handleCheckAllChange(all) {
      this.checkedCities = all ? this.typeList.map((item) => item.typeKey) : [];
      this.indeterminate = false;
      this.$emit("input", this.checkedCities);
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.typeList.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.typeList.length;
      this.$emit("input", this.checkedCities);
    },
  },
};
</script>
<style lang="scss" scoped>
.check_group {
  max-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .el-checkbox {
    display: flex;
    white-space: inherit;
  }
  &:hover {
    overflow-y: auto;
  }
}
</style>
