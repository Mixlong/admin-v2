<template>
    <div>
        {{ formattedTime({ time: seconds }) }}
    </div>
</template>

<script>
export default {
    name: "CountdownTimer",
    props: {
        // 传入的初始秒数
        initialSeconds: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            // 当前秒数
            seconds: this.initialSeconds,
            // 定时器
            timer: null,
        };
    },
    computed: {
        // 将秒数转换为时分秒格式
        // formattedTime() {
        //     const hours = Math.floor(this.seconds / 3600).toString().padStart(2, "0");
        //     const minutes = Math.floor((this.seconds % 3600) / 60).toString().padStart(2, "0");
        //     const seconds = (this.seconds % 60).toString().padStart(2, "0");
        //     return `${hours}:${minutes}:${seconds}`;
        // },
    },
    methods: {
        // 启动计时器
        startTimer() {
            this.timer = setInterval(() => {
                this.seconds += 1; // 每秒加1
            }, 1000);
        },
        // 停止计时器
        stopTimer() {
            clearInterval(this.timer);
            this.timer = null;
        },
    },
    mounted() {
        this.startTimer(); // 组件挂载时启动计时器
    },
    beforeDestroy() {
        this.stopTimer(); // 组件销毁时停止计时器
    },
};
</script>

<style lang="scss" scoped>
h1 {
    font-size: 24px;
    color: #333;
}
</style>