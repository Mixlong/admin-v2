<!-- @author Shiyn/   huangmx 20200807优化-->
<template>
  <div class="top-right-btn">
    <el-row>
      <el-tooltip
        class="item"
        effect="dark"
        :content="showSearch ? '隐藏搜索' : '显示搜索'"
        placement="top"
      >
        <el-button
          size="mini"
          circle
          icon="el-icon-search"
          @click="toggleSearch()"
        />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="刷新" placement="top">
        <el-button
          size="mini"
          circle
          icon="el-icon-refresh"
          @click="refresh()"
        />
      </el-tooltip>
      <el-tooltip effect="dark" content="显隐列" placement="top" v-if="columns.length">
        <el-dropdown
          trigger="click"
          :hide-on-click="false"
          style="padding-left: 12px"
          v-if="showColumnsType === 'checkbox'"
        >
          <el-button size="mini" circle icon="el-icon-menu" />
          <template #dropdown>
            <el-dropdown-menu>
              <div v-for="item in columns" :key="item.key">
                <el-dropdown-item>
                  <el-checkbox
                    :checked="item.visible"
                    @change="checkboxChange($event, item.label)"
                    :label="item.label"
                  />
                </el-dropdown-item>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </el-row>
  </div>
</template>
<script>
export default {
  name: "RightToolbar",
  data() {
    return {};
  },
  props: {
    showSearch: {
      type: Boolean,
      default: true,
    },
    columns: {
      type: Array,
      default: () => []
    },
    showColumnsType: {
      type: String,
      default: "checkbox",
    },
  },
  methods: {
    //搜索
    toggleSearch() {
      this.$emit("update:showSearch", !this.showSearch);
    },
    //刷新
    refresh() {
      this.$emit("queryTable");
    },
    checkboxChange(event, label) {
      this.columns.filter(item => item.label === label)[0].visible = event;
    }
  },
};
</script>
