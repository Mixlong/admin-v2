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
          left: "center",
          textStyle: {
            color: "#fff",
          },
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
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
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
            },
            tooltip: {
              valueFormatter: (value) => `${value} %`
            },
            data: [],
          },
        ],
      },
      //   所有产品排行
      allProductRankOption: {
        title: {
          text: "所有产品排行",
          left: "center",
          textStyle: {
            color: "#fff",
          },
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
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
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
            },
            tooltip: {
              valueFormatter: (value) => `${value} %`
            },
            data: [],
          },
        ],
      },
      //   所有问题排行
      allProblemRankOption: {
        title: {
          text: "所有问题排行",
          left: "center",
          textStyle: {
            color: "#fff",
          },
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
            type: "value",
            axisLabel: {
              color: "#fff",
              formatter: "{value}",
            },
          },
          {
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
            },
            tooltip: {
              valueFormatter: (value) => `${value} %`
            },
            data: [],
          },
        ],
      },
    };
  },
  created() {
    console.log("我是echart 公共数据");
  },
};
