const colorList = [
  {
    offset: 0,
    color: "#53639F",
  },
  {
    offset: 1,
    color: "#1F305D",
  },
];

const setBackgroundColor = ({
  type = "linear",
  x = 0,
  y = 0,
  x2 = 1,
  y2 = 1,
  colorStops = colorList,
} = {}) => {
  return {
    type,
    x,
    y,
    x2,
    y2,
    colorStops,
  };
};

export default {
  data() {
    return {
      problemRootStatusOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "维修处理数量",
          left: "center",
          top: 10,
          textStyle: {
            color: "#fff",
          },
        },
        legend: {
          bottom: 10,
          textStyle: {
            color: "#fff",
          },
        },
        series: [
          {
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
        backgroundColor: setBackgroundColor(),
        title: {
          text: "线号不良数量",
          left: "center",
          top: 10,
          textStyle: {
            color: "#fff",
          },
        },
        legend: {
          bottom: 10,
          textStyle: {
            color: "#fff",
          },
        },
        series: [
          {
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
      weekNewBadComplaintOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "不良数量",
          left: "center",
          top: 10,
          textStyle: {
            color: "#fff",
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
            crossStyle: {
              color: "#999",
            },
          },
        },
        grid: {
          left: "5%",
          right: "5%",
          containLabel: true,
        },
        dataZoom: [
          {
            show: true,
            start: 0,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
          {
            type: "inside",
            start: 94,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
        ],
        xAxis: {
          type: "category",
          data: [],
          axisLabel: {
            color: "#fff",
          }
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#fff",
          },
        },
        color: ["#5C9EDB"],
        series: [
          {
            data: [],
            type: "bar",
            barMinWidth: 20,
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

      //   总体不良分布
      allCustomerRankOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "总体不良分布",
          left: "left",
          top: 5,
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
        dataZoom: [
          {
            show: true,
            start: 0,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
          {
            type: "inside",
            start: 94,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
        ],
        legend: {
          top: 10,
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
        color: ["#5C9EDB", "#ED7D31"],
        series: [
          {
            name: "不良数量",
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
            symbol: "circle",
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31",
            },
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
      //   一线不良分布
      allProductRankOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "一线不良分布",
          left: "left",
          top: 5,
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
          top: 10,
          textStyle: {
            color: "#fff",
          },
        },
        dataZoom: [
          {
            show: true,
            start: 0,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
          {
            type: "inside",
            start: 94,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
        ],
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
        color: ["#5C9EDB", "#ED7D31"],
        series: [
          {
            name: "不良数量",
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
            symbol: "circle",
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31",
            },
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
      //   二线不良分布
      allProblemRankOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "二线不良分布",
          left: "left",
          top: 5,
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
          top: 10,
          textStyle: {
            color: "#fff",
          },
        },
        dataZoom: [
          {
            show: true,
            start: 0,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
          {
            type: "inside",
            start: 94,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
        ],
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
        color: ["#5C9EDB", "#ED7D31"],
        series: [
          {
            name: "不良数量",
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
            symbol: "circle",
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31",
            },
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

      //   总仪表不良分布
      allCategoryRankOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "总仪表不良分布",
          left: "left",
          top: 5,
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
          top: 10,
          textStyle: {
            color: "#fff",
          },
        },
        dataZoom: [
          {
            show: true,
            start: 0,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
          {
            type: "inside",
            start: 94,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
        ],
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
        color: ["#5C9EDB", "#ED7D31"],
        series: [
          {
            name: "不良数量",
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
            symbol: "circle",
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31",
            },
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
      //   彩屏仪表不良分布
      colorCategoryRankOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "彩屏仪表不良分布",
          left: "left",
          top: 5,
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
          top: 10,
          textStyle: {
            color: "#fff",
          },
        },
        dataZoom: [
          {
            show: true,
            start: 0,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
          {
            type: "inside",
            start: 94,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
        ],
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
        color: ["#5C9EDB", "#ED7D31"],
        series: [
          {
            name: "不良数量",
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
            symbol: "circle",
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31",
            },
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
      //   数码管仪表不良分布
      displayCategoryRankOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "数码管仪表不良分布",
          left: "left",
          top: 5,
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
          top: 10,
          textStyle: {
            color: "#fff",
          },
        },
        dataZoom: [
          {
            show: true,
            start: 0,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
          {
            type: "inside",
            start: 94,
            end: 100,
            textStyle: {
              color: "#fff",
            },
          },
        ],
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
        color: ["#5C9EDB", "#ED7D31"],
        series: [
          {
            name: "不良数量",
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
            symbol: "circle",
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31",
            },
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
