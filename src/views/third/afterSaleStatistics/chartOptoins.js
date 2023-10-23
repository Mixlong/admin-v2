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
          text: "问题根因状态",
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
        color: ["red", "green"],
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
        backgroundColor: setBackgroundColor(),
        title: {
          text: "不良仪表状态",
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
        backgroundColor: setBackgroundColor(),
        title: {
          text: "新增不良投诉",
          left: "center",
          top: 10,
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
        color: ["#5C9EDB"],
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
        backgroundColor: setBackgroundColor(),
        title: {
          text: "新增不良投诉",
          left: "center",
          top: 10,
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
        grid: {
          left: "5%",
          right: "5%",
        },
        dataZoom: [
          {
            type: "slider",
            show: true,
            start: 60,
            end: 100,
            textStyle: {
              color: "#fff"
            },
            handleSize: 20,
            handleStyle: {
              color: "#fff"
            },
            xAxisIndex: [0],
            filterMode: "filter"
          }
        ],
        xAxis: {
          type: "category",
          data: [],
          axisLabel: {
            textStyle: {
              color: "#fff"
            },
            formatter: (value, index) => {
              if(index > 25) {
                return "";
              } else {
                return value;
              }
            }
          },
          boundaryGap: false
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
        backgroundColor: setBackgroundColor(),
        title: {
          text: "所有客户排行",
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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
      //   所有产品排行
      allProductRankOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "所有产品排行",
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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
      //   所有问题排行
      allProblemRankOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "所有问题排行",
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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

      // top1问题 -- 产品排行
      productRankTop1Option: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "",
          left: "left",
          top: 5,
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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
      // 问题排行
      problemRankTop1Option: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "",
          left: "left",
          top: 5,
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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
      // 机型问题排行
      modelProblemRankTop1Option: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "",
          left: "left",
          top: 5,
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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

      // top2问题 -- 产品排行
      productRankTop2Option: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "",
          left: "left",
          top: 5,
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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
      // 问题排行
      problemRankTop2Option: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "",
          left: "left",
          top: 5,
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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
      // 机型问题排行
      modelProblemRankTop2Option: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "",
          left: "left",
          top: 5,
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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

      // top3问题 -- 产品排行
      productRankTop3Option: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "",
          left: "left",
          top: 5,
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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
      // 问题排行
      problemRankTop3Option: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "",
          left: "left",
          top: 5,
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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
      // 机型问题排行
      modelProblemRankTop3Option: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "",
          left: "left",
          top: 5,
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
        color: ["#5C9EDB", "#ED7D31"],
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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
      // 筛选
      searchChartOption: {
        backgroundColor: setBackgroundColor(),
        title: {
          text: "",
          x: "center",
          y: "center",
          textStyle: {
            fontSize: 14,
            fontWeight: "normal",
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
        grid: {
          left: "5%",
          right: "5%"
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
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: "#ed7d31"
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
