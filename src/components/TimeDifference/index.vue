<template>
    <div>
      {{ timeDifference }}
    </div>
  </template>
  
  <script>
  import moment from "moment";
  
  export default {
    props: {
      startTime: {
        type: String, // 传入的时间字符串，格式为 "YYYY-MM-DD HH:mm:ss"
        required: true,
      },
    },
    data() {
      return {
        timeA: this.startTime,
        timeDifference: "",
        timer: null,
      };
    },
    mounted() {
      this.updateTimeDifference();
      this.timer = setInterval(this.updateTimeDifference, 1000); // 每秒更新一次
    },
    beforeDestroy() {
      clearInterval(this.timer); // 清除定时器
    },
    methods: {
      updateTimeDifference() {
        const now = moment();
        const timeA = moment(this.timeA);
        let diff = timeA.diff(now);
  
        if (diff < 0) {
          this.timeDifference = "时间已过期";
          return;
        }
  
        const days = moment.duration(diff).days();
        const hours = moment.duration(diff).hours();
        const minutes = moment.duration(diff).minutes();
        const seconds = moment.duration(diff).seconds();
  
        this.timeDifference = `${days}天${hours}小时${minutes}分${seconds}秒`;
      },
    },
  };
  </script>