<template>
    <div>
        <el-tooltip effect="dark" :content="startTime">
            <el-progress class="delay-progress" :stroke-width="10" :percentage="percentage" color="green"
                :format="format" :show-text="false" :text-inside="false" text-color="#000"></el-progress>
        </el-tooltip>
    </div>
</template>

<script>
export default {
    name: "DelayProgress",
    props: {
        // 传入的初始秒数
        startTime: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            days: 0, // 天数
        };
    },
    computed: {
        calculateDaysDifference() {
            if (this.startTime) {
                const now = this.moment().format('YYYY-MM-DD');
                const timeA = this.moment(this.startTime, 'YYYY-MM-DD');
                const diff = Math.abs(timeA.diff(now, "days"));
                return diff;
            } else {
                return 0;
            }
        },
        percentage() {
            const delayDays = this.calculateDaysDifference;
            this.days = delayDays;

            if (delayDays >= 5) {
                return 100;
            } else {
                return delayDays * 20;
            }
        }
    },
    methods: {
        format() {
            if (this.days >= 5) {
                return `≥5天`;
            } else {
                return `${this.days}天`;
            }
        }
    }
}
</script>

<style lang="scss">
.delay-progress {
    display: flex;
    justify-content: space-between;

    .el-progress-bar {
        flex: 1;
    }

    .el-progress__text {
        font-size: 12px !important;
        white-space: nowrap !important;
    }
}
</style>