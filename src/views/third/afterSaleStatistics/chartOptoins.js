export default {
  data() {
    return {
      problemRootStatusOption: {
        title: {
          text: "问题根因状态",
          left: "center",
          textStyle: {
            color: "#fff",
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        color: ["green", "red"],
        series: [
          {
            name: "问题根因",
            type: "pie",
            radius: "50%",
            selectedMode: "single",
            label: {
              color: "#fff",
              formatter: "{b}：{c} ({d}%)",
            },
            data: [],
            animationEasing: "cubicInOut",
            animationDuration: 1500,
          },
        ],
      },
      badMeterStatusOption: {
        title: {
          text: "不良仪表状态",
          left: "center",
          textStyle: {
            color: "#fff",
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        series: [
          {
            name: "问题根因",
            type: "pie",
            radius: "50%",
            selectedMode: "single",
            label: {
              color: "#fff",
              formatter: "{b}：{c}",
            },
            data: [],
            animationEasing: "cubicInOut",
            animationDuration: 1500,
          },
        ],
      },
      newBadComplaintOption: {
        title: {
          text: "新增不良投诉",
          left: "center",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: {
          type: "category",
          data: ["今日", "本周累计", "本月累计"],
          axisLabel: {
            color: "#fff",
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#fff",
          },
        },
        series: [
          {
            data: [],
            type: "bar",
            barMinWidth: 50,
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            showBackground: true,
            backgroundStyle: {
              color: "rgba(180, 180, 180, 0.2)",
            },
          },
        ],
      },
      weekNewBadComplaintOption: {
        title: {
          text: "新增不良投诉",
          left: "center",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: {
          type: "category",
          data: [],
          axisLabel: {
            color: "#fff",
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#fff",
          },
        },
        series: [
          {
            data: [],
            type: "bar",
            barMinWidth: 50,
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            showBackground: true,
            backgroundStyle: {
              color: "rgba(180, 180, 180, 0.2)",
            },
          },
        ],
      },
      //   所有客户排行
      allCustomerRankOption: {
        title: {
          text: "所有客户排行",
          left: "left",
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barGap: 10,
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },
      //   所有产品排行
      allProductRankOption: {
        title: {
          text: "所有产品排行",
          left: "left",
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },
      //   所有问题排行
      allProblemRankOption: {
        title: {
          text: "所有问题排行",
          left: "left",
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },

      // top1问题 -- 产品排行
      productRankTop1Option: {
        title: {
          text: "",
          left: "left",
          textStyle: {
            color: "#F56C6C",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },
      // 问题排行
      problemRankTop1Option: {
        title: {
          text: "",
          left: "left",
          textStyle: {
            color: "#F56C6C",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },
      // 机型问题排行
      modelProblemRankTop1Option: {
        title: {
          text: "",
          left: "left",
          textStyle: {
            color: "#F56C6C",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },

      // top2问题 -- 产品排行
      productRankTop2Option: {
        title: {
          text: "",
          left: "left",
          textStyle: {
            color: "#F56C6C",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },
      // 问题排行
      problemRankTop2Option: {
        title: {
          text: "",
          left: "left",
          textStyle: {
            color: "#F56C6C",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },
      // 机型问题排行
      modelProblemRankTop2Option: {
        title: {
          text: "",
          left: "left",
          textStyle: {
            color: "#F56C6C",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },

      // top3问题 -- 产品排行
      productRankTop3Option: {
        title: {
          text: "",
          left: "left",
          textStyle: {
            color: "#F56C6C",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },
      // 问题排行
      problemRankTop3Option: {
        title: {
          text: "",
          left: "left",
          textStyle: {
            color: "#F56C6C",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          {
            type: "category",
            data: [],
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },
      // 机型问题排行
      modelProblemRankTop3Option: {
        title: {
          text: "",
          left: "left",
          textStyle: {
            color: "#F56C6C",
            fontSize: 14,
          },
        },
        grid: {
          left: "9%",
          right: "9%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          // {
          //   type: "category",
          //   data: ["1月", "2月"],
          //   axisPointer: {
          //     type: "shadow",
          //   },
          //   axisLabel: {
          //     color: "#fff",
          //   },
          //   position: "bottom",
          //   offset: 20,
          //   axisTick: {
          //     show: true,
          //     length: 40,
          //     lineStyle: {
          //       type: "dotted",
          //     },
          //   },
          // },
          {
            type: "category",
            data: [],
            position: "bottom",
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
            axisTick: {
              show: true,
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },
      // 筛选
      searchChartOption: {
        title: {
          text: "",
          x: "center",
          y: "center",
          textStyle: {
            fontSize: 14,
            fontWeight: "normal",
            color: "#fff"
          },
        },
        // grid: {
        //   left: "9%",
        //   right: "9%",
        // },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        legend: {
          top: "bottom",
          textStyle: {
            color: "#fff",
          },
        },
        xAxis: [
          // {
          //   type: "category",
          //   data: ["1月", "2月"],
          //   axisPointer: {
          //     type: "shadow",
          //   },
          //   axisLabel: {
          //     color: "#fff",
          //   },
          //   position: "bottom",
          //   offset: 20,
          //   axisTick: {
          //     show: true,
          //     length: 40,
          //     lineStyle: {
          //       type: "dotted",
          //     },
          //   },
          // },
          {
            type: "category",
            data: [],
            position: "bottom",
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              color: "#fff",
            },
            axisTick: {
              show: true,
            },
          },
        ],
        yAxis: [
          {
            name: "数量",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
            name: "占比",
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            splitLine: false,
            axisLabel: {
              color: "#fff",
              formatter: "{value} %",
            },
          },
        ],
        series: [
          {
            name: "累计数量",
            type: "bar",
            barMaxWidth: 80,
            label: {
              show: true,
              position: "inside",
              color: "#f00",
            },
            data: [],
          },
          {
            name: "累计百分比",
            type: "line",
            yAxisIndex: 1,
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{c}%",
            },
            data: [],
          },
        ],
      },
    };
  },
};
