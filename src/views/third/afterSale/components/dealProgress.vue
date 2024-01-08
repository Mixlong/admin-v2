<template>
  <el-dialog
    class="deal-progress-box"
    title="处理进展"
    :visible="visible"
    width="800px"
    append-to-body
    center
    top="2vh"
    :close-on-click-modal="false"
    @close="close"
  >
    <div class="flex justify-between">
      <el-steps direction="vertical" space="100px" :active="state">
        <el-step>
          <template slot="title">
            <div class="title-txt">处理类型</div>
          </template>
          <template slot="description" v-if="currentState > 1">
            <p>{{ afterHData.handleType }}</p>
          </template>
        </el-step>
        <el-step>
          <template slot="title">
            <div class="title-txt">现象复测</div>
          </template>
          <template slot="description" v-if="currentState > 2">
            <div class="desciption-box">
              <p>复测人：{{ afterHData.retestName }}</p>
              <p>
                复测结果：{{ againCheckResultData[afterHData.retestResult] }}
              </p>
              <p>是否问题：{{ afterHData.isProblem === 0 ? "是" : "否" }}</p>
            </div>
          </template>
        </el-step>
        <el-step>
          <template slot="title">
            <div class="title-txt">分类处理</div>
          </template>
          <template slot="description" v-if="currentState > 3">
            <p>复测结果：{{ classificationData[afterHData.classification] }}</p>
          </template>
        </el-step>
        <el-step>
          <template slot="title">
            <div class="title-txt">问题处理</div>
          </template>
          <template slot="description" v-if="currentState > 4">
            <div class="desciption-box">
              <p>处理人：{{ afterHData.handleName }}</p>
              <p>定位结果：{{ afterHData.locationResult }}</p>
            </div>
          </template>
        </el-step>
      </el-steps>
      <el-steps direction="vertical" space="100px" :active="isActive">
        <el-step>
          <template slot="title">
            <div class="title-txt">维修处理</div>
          </template>
          <template slot="description" v-if="currentState > 5">
            <div class="desciption-box">
              <p>维修人：{{ afterHData.serviceName }}</p>
              <p>处理结果：{{ afterHData.handleResult }}</p>
              <p>维修工时：{{ afterHData.serviceTime }} min</p>
              <p>
                物料损耗：
                <span v-for="(item, index) in materialLossList" :key="index">
                  {{ item.materialName }} {{ item.materialNum }}pcs
                  <span v-if="index < materialLossList.length - 1">,</span>
                </span>
              </p>
            </div>
          </template>
        </el-step>
        <el-step>
          <template slot="title">
            <div class="title-txt">返厂入库</div>
          </template>
          <template slot="description" v-if="currentState > 6">
            <div class="desciption-box">
              <template v-if="afterHData.warehousingName">
                <p>入库人：{{ afterHData.warehousingName }}</p>
                <p>入库描述：{{ afterHData.warehousingDesc }}</p>
              </template>
              <template v-else>
                <p class="text-red">
                  无
                </p>
              </template>
            </div>
          </template>
        </el-step>
        <el-step>
          <template slot="title">
            <div class="title-txt">处理完成</div>
          </template>
        </el-step>
      </el-steps>
    </div>
  </el-dialog>
</template>

<script>
import { afterHandleDetail } from "@/api/third/sale";
import globalData from "../mixins/global";

export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  mixins: [globalData],
  data() {
    return {
      afterHData: {},
      state: -1,
      isActive: -1,
      currentState: -1
    };
  },
  computed: {
    materialLossList() {
      const { materialLoss } = this.afterHData;
      if (!this.Is_Empty(materialLoss)) return JSON.parse(materialLoss);
    },
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    async getAfterHandleDetail(afterSaleId, state) {
      this.currentState = state;
      if (state < 5) {
        this.state = state - 1;
        this.isActive = -1;
      } else {
        this.state = 4;
        this.isActive = state === 5 ? 0 : state === 7 ? 3 : state - 5;
      }
      try {
        const { data } = await afterHandleDetail(afterSaleId);
        if (!this.Is_Empty(data)) {
          this.afterHData = data;
        } else {
          this.afterHData = {};
        }
      } catch (error) {}
    },
  },
};
</script>

<style lang="scss">
.deal-progress-box {
  .el-dialog__body {
    margin-top: 50px;
    .el-steps {
      padding-left: 30px;
      flex: 1;

      .el-step__head {
        width: 15px;
        .el-step__line {
          left: 7px;
        }
        .el-step__icon {
          width: 15px;
          height: 15px;
        }
        .el-step__icon-inner {
          display: none;
        }
      }
      .el-step__main {
        .el-step__title {
          position: absolute;
          left: -22px;
          top: 15px;
        }
        .el-step__description {
          position: absolute;
          left: 100px;
          top: -8px;
          color: #303133;
          font-size: 14px;

          .desciption-box {
            line-height: 13px;
          }
        }
      }

      .el-step:nth-child(1) {
        .el-step__icon {
          display: none;
        }
        .el-step__title {
          top: -26px;
        }
        .el-step__description {
          top: -33px;
        }
      }
    }
  }
}
</style>