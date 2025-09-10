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
        this.checkedCities = data;
        this.updateCheckAllState();
      },
      immediate: true
    },
    typeList: {
      handler() {
        this.updateCheckAllState();
      },
      immediate: true
    }
  },
  methods: {
    handleCheckAllChange(all) {
      this.checkedCities = all ? this.typeList.map((item) => item.typeKey) : [];
      this.isIndeterminate = false;
      this.$emit("input", this.checkedCities);
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.typeList.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.typeList.length;
      this.$emit("input", value);
    },
    updateCheckAllState() {
      if (this.typeList.length > 0) {
        let checkedCount = this.checkedCities.length;
        this.checkAll = checkedCount === this.typeList.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.typeList.length;
      } else {
        this.checkAll = false;
        this.isIndeterminate = false;
      }
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
    transition: all 0.3s;
    overflow-y: auto;
  }
}
</style>
