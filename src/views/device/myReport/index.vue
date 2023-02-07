<template>
    <div class="my-report-container flex">
        <div class="left-box margin-right-xs">
            <div class="switch-year flex justify-between bg-white align-center">
                <i class="el-icon-arrow-left pointer" @click="prevYear"></i>
                <span>{{ currentYear }}</span>
                <i class="el-icon-arrow-right pointer" @click="nextYear"></i>
            </div>
            <div class="line"></div>
            <div class="date-select-box bg-white">
                <el-form inline @submit.native.prevent>
                    <el-form-item label="部门">
                        <el-select v-model="deptVal" style="width: 112px" size="mini" placeholder="请选择">
                            <el-option v-for="(item, index) in deptList" :key="index" :label="item.deptName"
                                :value="item.deptId">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <div class="data-list">
                    <ul v-for="(itemM, index) in monthList" :key="itemM.reportTime">
                        <div class="data-list-month-item pointer"
                            @click="chooseMonth(itemM.reportTime, index, getMonth(itemM.reportTime), 3, itemM.isStatus)">
                            <div
                                :class="['month-actived', { endActived: itemM.isStatus === 1, saveActived: itemM.isStatus === 2, editoringActived: isActivedMonth({ isStatus: itemM.isStatus, index }) }]">
                            </div>
                            <li class="list-month-box">
                                <div class="single-icon-box flex align-center justify-between">
                                    <span
                                        :class="['month-txt', { endActivedTxt: itemM.isStatus === 1, saveActivedTxt: itemM.isStatus === 2, editoringActivedTxt: isActivedMonth({ isStatus: itemM.isStatus, index }) }]">{{
                                                getMonth(itemM.reportTime)
                                        }} 月</span>
                                    <i :class="['el-icon-caret-right', { actived: currentMonth === index + 1 }]"></i>
                                </div>
                                <el-collapse-transition>
                                    <div v-show="currentMonth === index + 1">
                                        <div v-for="(itemW, wIndex) in weekList" :key="itemW.reportTime"
                                            @click.stop="chooseWeek(itemW.reportTime, wIndex, weekData[wIndex], 2, itemW.isStatus)"
                                            class="list-week-box">
                                            <div class="flex list-week-item">
                                                <div
                                                    :class="['week-actived', { endActived: itemW.isStatus === 1, saveActived: itemW.isStatus === 2, editoringActived: isActivedWeek({ isStatus: itemW.isStatus, wIndex }) }]">
                                                </div>
                                                <div class="pointer week-txt-box">
                                                    <div class="week-single">
                                                        <span
                                                            :class="['week-txt', { endActivedTxt: itemW.isStatus === 1, saveActivedTxt: itemW.isStatus === 2, editoringActivedTxt: isActivedWeek({ isStatus: itemW.isStatus, wIndex }) }]">{{
                                                                    weekData[wIndex]
                                                            }}</span>
                                                    </div>
                                                    <div class="week-time-txt">{{ parseTime(itemW.reportTime,
                                                            '{y}-{m}-{d}')
                                                    }}</div>

                                                </div>
                                                <i
                                                    :class="['el-icon-caret-right', { actived: currentWeek === wIndex + 1 }]"></i>
                                            </div>

                                            <el-collapse-transition>
                                                <div v-show="currentWeek === wIndex + 1">
                                                    <div v-for="(itemD, dIndex) in dayList" :key="itemD.reportTime"
                                                        @click.stop="chooseDay(itemD.reportTime, dIndex, dayData[dIndex], 1, itemD.isStatus)"
                                                        class="list-day-box">
                                                        <div class="flex">
                                                            <div
                                                                :class="['week-actived', { endActived: itemD.isStatus === 1, saveActived: itemD.isStatus === 2, dayM: isActivedDay({ isStatus: itemD.isStatus, dIndex }), editoringActived: isActivedDay({ isStatus: itemD.isStatus, dIndex }) }]">
                                                            </div>
                                                            <div class="pointer week-txt-box">
                                                                <div>
                                                                    <span
                                                                        :class="['week-txt', { endActivedTxt: itemD.isStatus === 1, saveActivedTxt: itemD.isStatus === 2, editoringActivedTxt: isActivedDay({ isStatus: itemD.isStatus, dIndex }) }]">{{
                                                                                dayData[dIndex]
                                                                        }}</span>
                                                                </div>
                                                                <div class="week-time-txt">{{
                                                                        parseTime(itemD.reportTime, '{y}-{m}-{d}')
                                                                }}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </el-collapse-transition>
                                        </div>
                                    </div>
                                </el-collapse-transition>
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
        <div class="wang-editor-box bg-white">
            <span class="title" v-show="reportTitle">{{ nickName }}的{{ reportTitle }}工作报告</span>
            <editorForMe ref="editorForMeRef" class="editor-for-me" :isEdit="isEdit" editorH="calc(100vh - 330px)" />
            <div class="editor-btn-list flex justify-between">
                <div></div>
                <div class="flex justify-around center-btn">
                    <el-button v-if="!isEditor" type="primary" size="mini" @click="onSave">
                        <img src="@/assets/image/preservation.png" width="16px" alt="">
                        保存
                    </el-button>
                    <el-button v-else type="success" size="mini" @click="onEdit">
                        <img src="@/assets/image/edit.png" width="16px" alt="">
                        编辑
                    </el-button>
                    <el-button v-if="isEdit" class="bg-cyan text-white" size="mini" @click="onRelease">
                        <img src="@/assets/image/release.png" width="16px" alt="" />
                        发布
                    </el-button>
                </div>
                <div>
                    <el-button v-if="isSaveWeek" type="warning" size="mini" @click="onSaveWeek">
                        <img src="@/assets/image/edit.png" width="16px" alt="" />
                        另存到本周
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import editorForMe from '@/components/editorForMe/index.vue'
import { reportMonthList, reportWeekList, reportDayList, reportContent, uploadReportContent, resetReportContent, reportDepartment } from '@/api/device/myReport'
import { mapState } from 'vuex'
export default {
    name: "BikeCategory",
    components: {
        editorForMe
    },
    data() {
        return {
            isEditor: false,
            currentYear: this.moment().format('YYYY'),
            monthList: [],
            weekList: [],
            dayList: [],
            deptList: [],
            deptVal: null,
            currentMonth: 0,
            currentWeek: 0,
            currentDay: 0,
            currentStatusMon: 0,
            currentStatusWeek: 0,
            currentStatusDay: 0,
            weekData: ['第一周', '第二周', '第三周', '第四周', '第五周'],
            dayData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            chooseData: {},
            reportTitle: '',
            isResetActived: false,
            isMonth: false,
            isWeek: false,
            isDay: false,
            type: null,
            reportTime: null,
            form: {},
            status: 1,
            isEdit: true,
            saveCurrentObj: {}
        }
    },
    computed: {
        ...mapState({
            nickName: (state) => state.user.nickName,
            userId: (state) => state.user.userId
        }),
        getMonth() {
            return m => {
                return this.moment(m).format('M')
            }
        },
        isActivedMonth() {
            return ({ isStatus, index }) => {
                return !isStatus && this.currentStatusMon === index && this.isMonth
            }
        },
        isActivedWeek() {
            return ({ isStatus, wIndex }) => {
                return !isStatus && this.currentStatusWeek === wIndex && this.isWeek
            }
        },
        isActivedDay() {
            return ({ isStatus, dIndex }) => {
                return !isStatus && this.currentStatusDay === dIndex && this.isDay
            }
        },
        isSaveWeek() {
            return this.currentYear.toString() === this.moment().format('YYYY')
        }
    },
    created() {
        this.getListDept()
        this.getReportMonthList()
    },
    mounted() {
        window.addEventListener('keydown', this.saveContent)
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.saveContent)
    },
    methods: {
        // 按住ctrl s  保存
        saveContent(e) {
            const key = window.event.keyCode ? window.event.keyCode : window.event.which
            if (key === 83 && e.ctrlKey) {
                this.onSave()
                e.preventDefault()
            }
        },
        prevYear() {
            this.currentYear--
            this.getReportMonthList()
        },
        nextYear() {
            if (this.currentYear >= this.moment().format('YYYY')) return
            this.currentYear++
            this.getReportMonthList()
        },
        // 获取部门
        getListDept() {
            reportDepartment().then(res => {
                this.deptList = res.data
            })
        },
        // 获取月份
        getReportMonthList() {
            reportMonthList({ year: this.currentYear }).then(res => {
                this.monthList = res.data
                if (this.currentYear < this.moment().format('YYYY'))
                    this.resetYearData()
            })
        },
        // 获取周
        getReportWeekList(month) {
            reportWeekList({ month }).then(res => {
                this.weekList = res.data
            })
        },
        // 获取天
        getReportDaysList(week) {
            reportDayList({ week }).then(res => {
                this.dayList = res.data
            })
        },
        // 获取日周月报
        getReportDayList() {
            reportContent({ type: this.type, reportTime: this.reportTime, userId: this.userId }).then(res => {
                this.isEdit = false
                this.$refs.editorForMeRef.html = res.data.content
                this.deptVal = res.data.deptId
                this.form = res.data
            })
        },
        resetYearData() {
            this.weekList = []
            this.dayList = []
        },
        resetStatus() {
            this.isMonth = false
            this.isWeek = false
            this.isDay = false
        },
        checkStatus(status) {
            if (status === 1 || status === 2) {
                this.isEditor = true
                this.getReportDayList()
            } else {
                this.isEdit = true
                this.isEditor = false
                this.form = {}
            }
        },
        // 选择月份
        chooseMonth(month, index, cMonth, type, status) {
            this.chooseData.cMonth = cMonth
            this.reportTitle = `${this.chooseData.cMonth}月月度`
            this.resetStatus()
            this.isMonth = true
            this.type = type
            this.reportTime = month
            this.currentStatusMon = index
            this.saveCurrentObj.status = status > 0   // 另存到本周的
            if (this.currentMonth === 0) {
                this.currentMonth = index + 1
                this.getReportWeekList(month)
                this.checkStatus(status)
            } else {
                this.currentMonth = 0
                this.currentWeek = 0
            }
            this.resetEdiorContent()
        },
        // 选择周
        chooseWeek(week, index, wWeek, type, status) {
            this.chooseData.wWeek = wWeek
            this.reportTitle = `${this.chooseData.cMonth}月${this.chooseData.wWeek}`
            this.resetStatus()
            this.isWeek = true
            this.type = type
            this.reportTime = week
            this.currentStatusWeek = index
            if (this.currentWeek === 0) {
                this.currentWeek = index + 1
                this.getReportDaysList(week)
                this.checkStatus(status)
            } else {
                this.currentWeek = 0
            }
            this.resetEdiorContent()
        },
        chooseDay(day, index, dDay, type, status) {
            this.chooseData.dDay = dDay
            this.reportTitle = `${this.chooseData.cMonth}月${this.chooseData.wWeek}《${this.chooseData.dDay}》`
            this.resetStatus()
            this.isDay = true
            this.type = type
            this.reportTime = day
            this.currentDay = index + 1
            this.currentStatusDay = index
            this.checkStatus(status)
            this.resetEdiorContent()
        },
        changeEditorEdStatus() {
            if (this.isWeek) {
                this.getReportWeekList(this.reportTime)
            } else if (this.isDay) {
                this.getReportDaysList(this.reportTime)
            }
        },
        onCheckEach() {
            const isEmpty = this.$refs.editorForMeRef.editor.isEmpty()
            if (!this.deptVal) {
                this.msgError('请选择部门')
                return true
            } else if (isEmpty) {
                this.msgError('请填写日志内容')
                return true
            } else if (!this.reportTime) {
                this.msgError('请选择日期')
                return true
            }
        },
        // 保存草稿
        onSave() {
            if (this.onCheckEach()) {
                return
            }
            const content = this.$refs.editorForMeRef.html
            const data = {
                userId: this.userId,
                createBy: this.nickName,
                deptId: this.deptVal,
                content,
                reportType: this.type,
                reportTime: this.reportTime,
                status: 2
            }
            uploadReportContent(data).then(() => {
                this.msgSuccess(`保存成功`)
                this.getReportMonthList()
                this.changeEditorEdStatus()
                // 保存后清除文本内容
                this.resetEdiorContent()
            })
        },
        // 编辑
        onEdit() {
            this.$refs.editorForMeRef.html = this.form.content
            this.isEditor = false
            this.isEdit = true
        },
        // 清除富文本
        resetEdiorContent() {
            this.$refs.editorForMeRef.clear()
        },
        // 修改日志
        onResetReport(content) {
            this.form.content = content
            this.form.deptId = this.deptVal
            this.form.status = 1
            resetReportContent(this.form).then(() => {
                this.msgSuccess('发布成功')
                this.resetEdiorContent()
                this.getReportMonthList()
                this.changeEditorEdStatus()
                this.form = {}
                // 保存后清除文本内容
                this.resetEdiorContent()
            })
        },
        // 发布日志
        onReleaseReport(content) {
            const data = {
                userId: this.userId,
                createBy: this.nickName,
                deptId: this.deptVal,
                content,
                reportType: this.type,
                reportTime: this.reportTime,
                status: this.status
            }
            uploadReportContent(data).then(() => {
                this.msgSuccess(`${this.status === 1 ? '发布' : '保存'}成功`)
                this.getReportMonthList()
                this.changeEditorEdStatus()
                this.reportTime = null
                this.status = 1
                // 保存后清除文本内容
                this.resetEdiorContent()
            })
        },
        // 发布
        onRelease() {
            if (this.onCheckEach()) {
                return
            }
            const content = this.$refs.editorForMeRef.html
            if (this.form.id) {
                this.onResetReport(content)
            } else {
                this.onReleaseReport(content)
            }
        },
        // 保存到本周
        onSaveWeek() {
            // 第一步: 获取今天是本周的第几天
            const weekOfday = this.moment().format('E');
            // 第二步: 获取本周周一的日期
            const lastMonday = this.moment().subtract(weekOfday - 1, 'days').utc().startOf('days').toISOString()
            this.status = 2
            const reportTime = +new Date(lastMonday)
            reportContent({ type: 2, reportTime, userId: this.userId }).then(res => {
                if (res.data && res.data.content) {
                    this.status = 1
                    return this.msgError('本周工作报告已存在')
                } else {
                    const content = this.$refs.editorForMeRef.html
                    const isEmpty = this.$refs.editorForMeRef.editor.isEmpty()
                    if (!this.deptVal) {
                        return this.msgError('请选择部门')
                    } else if (isEmpty) {
                        return this.msgError('请填写日志内容')
                    } else {
                        const data = {
                            userId: this.userId,
                            createBy: this.nickName,
                            deptId: this.deptVal,
                            content,
                            reportType: 2,
                            reportTime,
                            status: this.status
                        }
                        uploadReportContent(data).then(() => {
                            this.msgSuccess('另存本周成功')
                            this.getReportMonthList()
                            this.changeEditorEdStatus()
                            this.reportTime = null
                            this.status = 1
                            // 保存后清除文本内容
                            this.resetEdiorContent()
                        })
                    }
                }
            })
        }
    }
};
</script>
<style lang="scss">
.my-report-container {
    margin-top: 10px;
    height: calc(100vh - 104px);

    .left-box {
        width: 200px;
        overflow: hidden;

        .switch-year {
            padding: 10px 9px;
            border-radius: 6px;
            box-sizing: border;

            i {
                font-size: 18px;
                color: #4B4B4B;
                font-weight: bold;
                padding: 5px;
            }

            span {
                font-size: 14px;
                font-weight: 500;
                color: #6190E8;
            }
        }

        .line {
            height: 10px;
            background: #9faec8;
        }

        .date-select-box {
            padding: 17px 9px;
            border-radius: 6px;
            height: calc(100vh - 162px);

            .el-form-item {
                margin-right: 0;
            }

            .data-list {
                overflow-y: auto;
                padding: 20px 10px 0 25px;
                box-sizing: border-box;
                height: calc(100vh - 260px);

                &::-webkit-scrollbar {
                    display: none;
                }

                ul {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .editoringActived {
                    background: #E8DA61 !important;
                    position: relative;
                    width: 8px !important;
                    height: 8px !important;

                    &::before {
                        content: '';
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        border: 1px solid #E8DA61;
                    }
                }

                .editoringActivedTxt {
                    color: #E8DA61 !important;
                }

                .endActived {
                    background: #6190E8 !important;
                }

                .endActivedTxt {
                    color: #719CEA !important;
                }

                .saveActived {
                    background: red !important;
                }

                .saveActivedTxt {
                    color: red !important;
                }

                .dayM {
                    margin-left: -5.5px !important;
                }

                .el-icon-caret-right {
                    font-size: 16px;
                    transition: all .3s ease-in-out;

                    &.actived {
                        transition: all .3s ease-in-out;
                        transform: rotate(90deg);
                    }
                }

                .data-list-month-item {
                    display: flex;
                    border-left: 1px dashed #D9D9D9;
                    padding: 15px 0;

                    .month-actived {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        margin-left: -4px;
                        margin-top: 4px;
                        background: #D9D9D9;
                    }

                    .list-month-box {
                        width: 121px;

                        .single-icon-box {
                            position: relative;

                            .month-txt {
                                font-size: 16px;
                                font-weight: bold;
                                color: #464646;
                                margin-left: 10px;
                            }

                            .el-icon-caret-right {
                                position: absolute;
                                right: -6px;
                            }
                        }
                    }
                }

                .list-week-box {
                    padding: 20px 0 10px;
                    transform: translateX(-4px);

                    .week-actived {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        margin-left: -4px;
                        margin-top: 4px;
                        background: #D9D9D9;
                    }

                    .list-week-item {
                        position: relative;

                        .el-icon-caret-right {
                            position: absolute;
                            right: -10px;
                            top: 0;
                        }
                    }

                    .week-txt-box {
                        margin-left: 10px;

                        .week-txt {
                            font-size: 14px;
                            font-weight: 500;
                            color: #464646;
                        }

                        .week-time-txt {
                            margin-top: 5px;
                            font-size: 11px;
                            font-weight: 500;
                            color: #A8A8A8;
                        }
                    }
                }

                .list-day-box {
                    padding: 10px 0;
                    transform: translateX(1px);

                    &:nth-child(1) {
                        margin-top: 15px;
                    }

                    .week-actived {
                        width: 5px;
                        height: 5px;
                    }
                }
            }

        }
    }

    .wang-editor-box {
        width: -webkit-fill-available;
        border-radius: 6px;
        padding: 28px 16px;
        overflow: hidden;

        span.title {
            font-size: 16px;
            font-weight: 500;
            color: #1C1C1C;
        }

        .editor-for-me {
            margin: 29px 38px;
        }

        .editorContent {
            margin: 29px 38px;
            height: calc(100vh - 280px);
            border-radius: 5px;
            border: 2px solid #DFDFDF;
        }
    }

    .editor-btn-list {
        margin: auto 38px;

        .center-btn {
            width: 200px;
        }

        button {
            span {
                display: flex;
                align-items: center;

                img {
                    margin-right: 3px;
                }
            }
        }
    }
}
</style>