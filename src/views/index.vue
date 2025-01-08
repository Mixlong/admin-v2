<template>
  <div class="dashboard-editor-container font14 app-container">
    <ProdPlanOrder />
  </div>
</template>

<script>
import ProdPlanOrder from "@/views/proPlanOrder/index";

export default {
  name: "Index",
  components: {
    ProdPlanOrder,
  }
};
</script>

<style lang="scss">
.row-val-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-plan-box {
  background: #f5f5f5;
  padding: 10px 0 10px 20px;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  box-shadow: 0 2px 5px 0 #ddd;
}

.prod-order-box {
  .el-row {
    .el-col {
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.3s ease;
      padding: 4px;
      border-radius: 6px;
      box-sizing: border-box;
      &:hover {
        background: #f5f5f5;
      }

      .el-divider {
        margin: 4px 0;
        background: #f1f1f1;
      }
    }
  }
}

.dashboard-editor-container {
  padding: 10px;
  position: relative;

  .production-box {
    height: 100vh;
    max-height: calc(100vh - 70px);
    padding-bottom: 20px;
    box-sizing: border-box;

    .production-list {
      max-height: calc(100vh - 310px);

      /* 
        修改步骤条圆圈样式
      */
      .el-step__head {
        width: 12px;

        .el-step__line {
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
        }

        .el-step__icon {
          width: 12px;
          height: 12px;
        }
      }

      .el-step__description {
        padding-right: 0;
      }

      .plan-title,
      .date-title {
        font-size: 13px;
      }
    }

    .no-plan {
      font-size: 13px;
    }

    .today-txt {
      color: red;
      font-weight: bold;
    }
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }

  .el-card__body {
    padding: 15px 20px 0px 20px;
  }

  .more-style {
    height: 36px;
  }

  .home-html-style {
    p {
      margin: 0;
    }
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}

.progress-text {
  .add-icon {
    transition: all 0.15s linear;
    min-width: 0;
    width: 0;
    opacity: 0;
  }
}

.showIcon {
  &:hover {
    .add-icon {
      min-width: 25px;
      width: 25px;
      opacity: 1;
    }
  }
}
</style>
