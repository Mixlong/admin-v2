<template>
    <div class="carousel-box" @mouseover="pauseTimer" @mouseleave="startTimer">
        <div class="carousel-left-icon" @click.stop="handlePrev">
            <i class="el-icon-arrow-left"></i>
        </div>
        <div class="carousel-right-icon" @click.stop="handleNext">
            <i class="el-icon-arrow-right"></i>
        </div>
        <ul class="carousel-item-content">
            <li>{{ typeData }}</li>
            <li class="text-red" style="font-weight: bold;">{{ delayList[currentIndex].person }}</li>
            <!-- <li>{{ formattedTime({ time: delayList[currentIndex].time }) }}</li> -->
             <li>
                <CountdownTimer :initialSeconds="delayList[currentIndex].time" />
             </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        delayList: {
            type: Array,
            default: () => []
        },
        intervalTime: {
            type: Number,
            default: 3000
        }
    },
    components: {
        CountdownTimer: () => import('./CountdownTimer.vue')
    },
    data() {
        return {
            currentIndex: 0,
            timer: null,
            delayTimer: null,
            addTime: 0,  // 定义全局时间变量
            typeList: {
                1: '样品组装',
                2: '客户确认',
                3: 'PUCS脚本',
                4: '硬件资料',
                5: '软件资料',
                6: '配置文件',
                7: 'ITA脚本',
                8: '初审',
                9: '终审',
                10: '许可'
            }
        }
    },
    computed: {
        typeData() {
            return this.typeList[this.delayList[this.currentIndex].type];
        },
        // delayTime() {
        //     return time => {
        //         if(time) {
        //             this.addTime = time;
        //             if(this.delayTimer) {
        //                 clearInterval(this.delayTimer);
        //             }
        //             this.delayTimer = setInterval(() => {
        //                 this.addTime ++;
        //                 this.formattedTime({ time: this.addTime })
        //             }, 1000)
        //         }
        //     }
        // }
    },
    created() {
        if (this.delayList.length > 1) {
            this.startTimer()
        }
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        if (this.delayTimer) {
            clearInterval(this.delayTimer);
            this.delayTimer = null;
        }
    },
    methods: {
        delayTime(time) {
            // if (time) {
            //     this.addTime = time;
            //     if (this.delayTimer) {
            //         clearInterval(this.delayTimer);
            //     }
            //     this.delayTimer = setInterval(() => {
            //         this.addTime++;
            //     }, 1000)

            //     return this.formattedTime({ time: this.addTime });
            // }
        },
        startTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.timer = setInterval(() => {
                this.currentIndex = (this.currentIndex + 1) % this.delayList.length;
            }, this.intervalTime)
        },
        pauseTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },
        handlePrev() {
            this.currentIndex = (this.currentIndex - 1 + this.delayList.length) % this.delayList.length;
        },
        handleNext() {
            this.currentIndex = (this.currentIndex + 1) % this.delayList.length;
        }
    }
}
</script>

<style lang="scss" scoped>
.carousel-box {
    position: relative;
    width: 100%;
    display: flex;

    .carousel-left-icon,
    .carousel-right-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #292828;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        transition: opacity .2s ease;

        &:hover {
            cursor: pointer;
            opacity: .8;
        }
    }

    .carousel-left-icon {
        position: absolute;
        left: -1000px;
        transition: left .2s ease;
        transition-delay: .2s;
    }

    .carousel-right-icon {
        position: absolute;
        right: -1000px;
        transition: right .2s ease;
        transition-delay: .2s;
    }

    &:hover {
        .carousel-left-icon {
            left: 2px;
        }

        .carousel-right-icon {
            right: 2px;
        }
    }

    .carousel-item-content {
        width: 100%;
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        justify-content: center;
        align-items: center;

        li {
            flex: 1;

            &:nth-child(2) {
                border-left: 1px solid #EBEEF5;
                border-right: 1px solid #EBEEF5;
            }
        }
    }
}
</style>