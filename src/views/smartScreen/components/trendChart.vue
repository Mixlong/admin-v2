<template>
    <div :class="className" :style="{ height: height, width: width }">
        <!-- 当所有数据都是0时显示提示 -->
        <div v-if="isAllZero" class="empty-data-tip">
            暂无直通率数据
        </div>
    </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '@/views/dashboard/mixins/resize'

export default {
    mixins: [resize],
    props: {
        className: {
            type: String,
            default: 'chart'
        },
        width: {
            type: String,
            default: '100%'
        },
        height: {
            type: String,
            default: '200px'
        },
        autoResize: {
            type: Boolean,
            default: true
        },
        chartData: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            chart: null
        }
    },
    computed: {
        // 检查是否所有数据都是0
        isAllZero() {
            if (!this.chartData || Object.keys(this.chartData).length === 0) {
                return true;
            }
            const values = Object.values(this.chartData);
            return values.every(value => parseFloat(value || 0) === 0);
        }
    },
    watch: {
        chartData: {
            deep: true,
            handler(val) {
                this.setOptions(val)
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.initChart()
        })
    },
    beforeDestroy() {
        if (!this.chart) {
            return
        }
        this.chart.dispose()
        this.chart = null
    },
    methods: {
        initChart() {
            this.chart = echarts.init(this.$el, 'macarons')
            this.setOptions(this.chartData)
        },
        setOptions(chartData = {}) {
            if (!chartData || Object.keys(chartData).length === 0) {
                return;
            }

            // 将Map数据转换为数组，并按日期排序
            const entries = Object.entries(chartData).sort((a, b) => new Date(a[0]) - new Date(b[0]));
            const dates = entries.map(([date]) => this.formatDate(date));
            const rates = entries.map(([, rate]) => parseFloat(rate || 0));

            this.chart.setOption({
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderColor: '#1FC6FF',
                    borderWidth: 1,
                    textStyle: {
                        color: '#FFFFFF',
                        fontSize: 12
                    },
                    formatter: function (params) {
                        const param = params[0];
                        return `${param.name}<br/>直通率: ${param.value}%`;
                    }
                },
                grid: {
                    left: '2%',
                    right: '3%',
                    bottom: '8%',
                    top: '5%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: dates,
                    boundaryGap: false,
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: '#9BA6AF',
                        fontSize: 10,
                        interval: 0,
                        rotate: 45,
                        margin: 10
                    }
                },
                yAxis: {
                    type: 'value',
                    min: function (value) {
                        // 如果所有数据都是0，设置最小值为0，最大值为10，这样图表更好看
                        return Math.max(0, value.min - 5);
                    },
                    max: function (value) {
                        // 动态计算最大值，如果数据都是0，设置为10
                        if (value.max === 0) {
                            return 10;
                        }
                        return Math.min(100, value.max + 5);
                    },
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: '#9BA6AF',
                        fontSize: 10,
                        formatter: '{value}%'
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(31, 198, 255, 0.2)',
                            width: 1,
                            type: 'dashed'
                        }
                    }
                },
                series: [
                    {
                        name: '直通率',
                        type: 'line',
                        data: rates,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: {
                            color: {
                                type: 'linear',
                                x: 0, y: 0, x2: 1, y2: 0,
                                colorStops: [
                                    { offset: 0, color: '#1FC6FF' },
                                    { offset: 1, color: '#409EFF' }
                                ]
                            },
                            width: 3,
                            shadowBlur: 10,
                            shadowColor: '#1FC6FF'
                        },
                        itemStyle: {
                            color: '#1FC6FF',
                            borderColor: '#FFFFFF',
                            borderWidth: 2,
                            shadowBlur: 5,
                            shadowColor: '#1FC6FF'
                        },
                        areaStyle: {
                            color: {
                                type: 'linear',
                                x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [
                                    { offset: 0, color: 'rgba(31, 198, 255, 0.3)' },
                                    { offset: 1, color: 'rgba(31, 198, 255, 0.05)' }
                                ]
                            }
                        },
                        emphasis: {
                            itemStyle: {
                                color: '#409EFF',
                                borderColor: '#FFFFFF',
                                borderWidth: 3,
                                shadowBlur: 10,
                                shadowColor: '#409EFF'
                            }
                        },
                        animation: true,
                        animationDuration: 2000,
                        animationEasing: 'cubicOut'
                    }
                ]
            })
        },
        // 格式化日期
        formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
    }
}
</script>

<style lang="scss" scoped>
.empty-data-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #FFFFFF;
    font-size: 14px;
    opacity: 0.6;
    pointer-events: none;
    z-index: 10;
}
</style>
