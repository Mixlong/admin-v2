<template>
  <div class="post-form">
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      title="详情"
      top="5vh"
      custom-class="buy-open"
    >
      <!-- 模块1 -->
      <div class="post-form model-wrap">
        <div class="model-wrap-style">
          <div class="title" style="padding-left: 3px">
            <div><i class="mr10 margin-left-xs"></i>基础信息</div>
          </div>
        </div>

        <div class="model-content" style="padding: 30px 40px">
          <el-row class="margin-bottom-xs">
            <el-col :span="12">
              PUCS_ID：
              <span class="gray">
                <a>{{ detailData.cpuId }}</a></span
              >
            </el-col>
            <el-col :span="12">
              部署工厂：
              <span class="gray">{{ detailData.factoryName }}</span>
            </el-col>
          </el-row>
          <el-row class="margin-bottom-xs">
            <el-col :span="12">
              在测DUT：
              <span class="gray">{{ fnDutName(detailData) }}</span>
            </el-col>
            <el-col :span="12">
              局域网IP：
              <span class="gray"> {{ detailData.domainIp }} </span>
            </el-col>
          </el-row>
          <el-row class="margin-bottom-xs">
            <el-col :span="12">
              设备状态：
              <span class="gray">{{
                detailData.status == 0 ? "启用" : "禁用"
              }}</span>
            </el-col>
            <el-col :span="12">
              在线状态：
              <span class="gray">{{
                detailData.online == 0 ? "在线" : "离线"
              }}</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              生产工序：
              <span class="gray">{{ detailData.processName }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <!-- 模块2 -->
      <div class="post-form model-wrap margin-top">
        <div class="model-wrap-style">
          <div class="title" style="padding-left: 3px">
            <div><i class="mr10 margin-left-xs"></i>配置信息</div>
          </div>
        </div>

        <div class="model-content" style="">
          <el-table border style="width: 100%" :data="detailData.confList">
            <el-table-column label="地址" align="center" prop="address" />
            <el-table-column
              label="模块名称"
              align="center"
              prop="moduleName"
            />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pucsDetail } from "@/api/pucs";
export default {
  data() {
    return {
      dialogVisible: false,
      detailData: {},
    };
  },
  methods: {
    getList(rId) {
      this.dialogVisible = true;
      this.detailData = rId;
      //   pucsDetail(rId).then((res) => {
      //     this.detailData = res.data;
      //   });
    },
    fnDutName(row) {
      return this.$parent.fnDutName(row);
    },
  },
};
</script>

<style>
</style>