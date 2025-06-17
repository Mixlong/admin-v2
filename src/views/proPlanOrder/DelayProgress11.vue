<template>
    <el-tooltip effect="dark" :content="startTime">
        <div class="delay-progress">
            <ul>
                <li v-for="item in percentageList" :key="item"></li>
            </ul>
            <span class="daysCount">{{ daysCount }}</span>
        </div>
    </el-tooltip>
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
        percentageList() {
            const delayDays = this.calculateDaysDifference;
            this.days = delayDays;

            if (delayDays >= 5) {
                return 5;
            } else {
                return delayDays;
            }
        },
        daysCount() {
            if (this.days >= 5) {
                return `≥5天`;
            } else {
                return `${this.days}天`;
            }
        },
    },
    methods: {
    }
}
</script>

<style lang="scss" scoped>
.delay-progress {
    display: flex;
    justify-content: space-between;
    align-items: center;
    column-gap: 10px;

    ul {
        height: 100%;
        flex: 1;
        list-style: none;
        padding: 0;
        margin: 0;
        display: inline-grid;
        grid-template-columns: repeat(5, 1fr);

        li {
            background: green;
            height: 10px;
        }
    }

    .daysCount {
        /* font-size: ; */
    }
}
</style>