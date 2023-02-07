<template>
    <div class="my-share-report-container flex">
        <div class="app-container select-box margin-right-xs">
            <div class="switch-year text-center">
                <span>组织架构</span>
            </div>
            <div class="date-select-box bg-white">
                <el-tree :data="deptList" :props="defaultProps" highlight-current expand-on-click-node
                    :filter-node-method="filterNode" ref="tree" default-expand-all @node-click="handleNodeClick" />
            </div>
        </div>
        <div class="app-container dayOrWeekOrMon margin-right-xs">
            <div class="flex justify-around margin-bottom-sm">
                <el-button :class="[{ actived: currentIdx === index }]" @click="chooseType(index)"
                    v-for="(item, index) in navList" :key="index">{{ item }}</el-button>
            </div>
            <div class="search-list-box">
                <el-date-picker v-model="dateTime" @change="onSearch" style="width: 100%;" type="daterange"
                    start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']"
                    value-format="timestamp">
                </el-date-picker>
                <div class="search-nav flex flex-wrap margin-top-xs">
                    <div v-for="(item, index) in historyNavList" :key="index" @click="chooseRange(index, item.value)"
                        class="margin-right-xss">
                        <el-button round :class="[{ actived: historyIdx === index }]">
                            {{ item.label }}
                        </el-button>
                    </div>
                </div>
                <div class="collapse-box">
                    <el-collapse v-if="isReportList" :accordion="false">
                        <el-collapse-item :title="isTitle(item.userName, item.list.length)" :name="index"
                            v-for="(item, index) in reportList" :key="index">
                            <div class="infinite-list-wrapper report-history-list" v-infinite-scroll="load"
                                infinite-scroll-disabled="disabled">
                                <ul class="list">
                                    <li v-for="(item, index) in item.list" class="list-item pointer" :key="index"
                                        @click="getReportDayList(item, index)">
                                        <i
                                            :class="[item.isRead === 1 ? 'gray' : 'black', { blue: readingStatus === index }]"></i>
                                        <div>
                                            <!-- <p
                                            :class="[item.isRead === 1 ? 'gray' : 'black', { blue: readingStatus === index }]">
                                            {{ item.userName }}的{{
                                                    moment(item.reportTime).locale('zh-cn').format("MMMDo")
                                            }}工作报告</p> -->
                                            <p
                                                :class="[item.isRead === 1 ? 'gray' : 'black', { blue: readingStatus === index }]">
                                                {{ parseTime(item.reportTime, '{y}-{m}-{d}') }}</p>
                                        </div>
                                    </li>
                                </ul>
                                <!-- <p class="text-center" v-if="loading">加载中...</p>
                            <p class="text-center" v-if="noMore">没有更多了</p> -->
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                    <p v-if="isLoading">加载中...</p>
                    <p v-if="isNoMore" v-cloak class="text-center margin-top-lg">~暂无数据~</p>
                </div>
            </div>
        </div>
        <div class="app-container report-content">
            <h3 v-show="userName">{{ userName }}的{{ reportTitle }}工作报告</h3>
            <div class="report-context-txt" v-html="reportTxt"></div>
        </div>
    </div>
</template>

<script>
import { reportShare } from '@/api/device/shareReport'
import { listDeptReport } from "@/api/system/dept"
import { reportContent } from '@/api/device/myReport'
import Part from '../../base/part/index.vue';
import { number } from 'yargs';

export default {
    name: "shareReport",
    data() {
        return {
            activeName: "0",
            count: 0,
            loading: false,
            searchReport: "",
            currentIdx: 0,
            historyIdx: -1,
            readingStatus: -1,
            navList: ["日报", "周报", "月报"],
            historyNavList: [],
            dayNavList: [{ label: "近一个月", value: 30 }, { label: "近三周", value: 21 }, { label: "近三天", value: 3 }, { label: "今天", value: 0 }],
            weekNavList: [{ label: "近三周", value: 21 }, { label: "近两周", value: 14 }, { label: "近一周", value: 7 }, { label: "本周", value: 'currentSevent' }],
            monNavList: [{ label: "近三个月", value: 90 }, { label: "近两个月", value: 60 }, { label: "近一个月", value: 30 }],
            reportTxt: "<p class=\"text-center\">暂无内容</p>",
            deptOptions: [],
            deptList: [],
            defaultProps: {
                children: "children",
                label: "deptName"
            },
            userName: null,
            reportTime: null,
            dateTime: [],
            isNoMore: false,
            isLoading: true,
            form: {
                p: 1,
                l: 10,
                type: 1,
                startTime: null,
                endTime: null
            },
            total: 0,
            totalPages: "",
            reportList: []
        };
    },
    computed: {
        noMore() {
            return this.form.p >= this.totalPages;
        },
        disabled() {
            return this.loading || this.noMore;
        },
        reportTitle() {
            if (!this.reportTime) {
                return;
            }
            else {
                const day = this.moment(this.reportTime).format("D");
                if (day == 1) {
                    return `${this.moment(this.reportTime).locale("zh-cn").format("MMM")}月度`;
                }
                else {
                    return `${this.moment(this.reportTime).locale("zh-cn").format("MMMDo")} 《${this.moment(this.reportTime).locale("zh-cn").format("dddd")}》`;
                }
            }
        },
        isTitle() {
            return (userName, len) => {
                return `${userName} (${len})`;
            };
        },
        isReportList() {
            if (!this.reportList.length) {
                this.isNoMore = true
            } else {
                this.isNoMore = false
                return this.reportList.length;
            }
        }
    },
    created() {
        this.historyNavList = this.dayNavList;
        this.getList();
        this.getReportShare();
    },
    methods: {
        /** 查询部门列表 */
        getList() {
            listDeptReport(this.queryParams).then((response) => {
                this.deptList = this.handleTree(response.data, "deptId");
            });
        },
        // 获取列表
        getReportShare() {
            reportShare(this.form).then(res => {
                this.reportList = res.data;
                this.isLoading = false
            }).catch(() => {
                this.isLoading = false
                this.isNoMore = true
            })
        },
        resetForm() {
            this.form.p = 1;
            this.totalPages = "";
        },
        // 搜索
        onSearch() {
            if (this.dateTime && this.dateTime.length) {
                this.form.startTime = this.dateTime[0];
                this.form.endTime = this.dateTime[1];
            }
            else {
                this.form.startTime = null;
                this.form.endTime = null;
                this.historyIdx = -1;
            }
            this.reportList = [];
            this.resetForm();
            this.getReportShare();
        },
        chooseType(index) {
            this.currentIdx = index;
            this.form.type = index + 1;
            this.reportList = [];
            this.dateTime = []
            this.readingStatus = -1;
            // 清空选中的日期
            this.form.startTime = null;
            this.form.endTime = null;
            // 清空历史选择项
            this.historyIdx = -1;
            switch (index) {
                case 0:
                    this.historyNavList = this.dayNavList;
                    break;
                case 1:
                    this.historyNavList = this.weekNavList;
                    break;
                case 2:
                    this.historyNavList = this.monNavList;
                    break;
            }
            this.resetForm();
            this.getReportShare();
        },
        chooseRange(index, day) {
            const nowTime = +new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 3600 * 1000);
            if (day > 0) {
                const startTime = nowTime - 3600 * 1000 * 24 * day;
                this.dateTime = [startTime, nowTime];
            }
            else if (day === 'currentSevent') {
                const startTime = +new Date(new Date(new Date().toLocaleDateString()).getTime());
                const endTime = +new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 3600 * 1000 * 7);
                this.dateTime = [startTime, endTime]
            } else {
                const startTime = +new Date(new Date(new Date().toLocaleDateString()).getTime());
                this.dateTime = [startTime, nowTime];
            }
            this.historyIdx = index;
            this.form.startTime = this.dateTime[0];
            this.form.endTime = this.dateTime[1];
            this.reportList = [];
            this.readingStatus = -1;
            this.resetForm();
            this.getReportShare();
        },
        // 获取日周月报
        getReportDayList({ userName, reportTime, userId }, index) {
            this.readingStatus = index;
            this.userName = userName;
            this.reportTime = reportTime;
            reportContent({ type: this.form.type, reportTime, userId, read: 1 }).then(res => {
                this.reportTxt = res.data.content;
            });
        },
        // 筛选节点
        filterNode(value, data) {
            if (!value)
                return true;
            return data.label.indexOf(value) !== -1;
        },
        // 节点单击事件
        handleNodeClick(data) {
            const { deptId } = data;
            this.form.id = deptId;
            this.reportList = [];
            this.readingStatus = -1;
            this.resetForm();
            this.getReportShare();
        },
        load() {
            this.loading = true;
            this.form.p += 1;
            this.getReportShare();
        }
    },
    components: { Part }
};
</script>
<style lang="scss">
[v-cloak] {
    display: none;
}

.my-share-report-container {
    .app-container {
        padding: 10px 15px 0 2px;

        .switch-year {
            padding: 10px 9px;
            font-size: 14px;
            font-weight: 500;
            color: #464646;
        }

        .date-select-box {
            height: calc(100vh - 200px);
            overflow-y: auto;

            &::-webkit-scrollbar {
                display: none;
            }
        }
    }

    .select-box {
        width: 300px;
    }

    .dayOrWeekOrMon {
        width: 350px;
        padding: 14px 11px;

        .actived {
            background: #76D7DD;
            color: #fff;
        }

        button {
            background: #DBDBDB;
        }

        .search-list-box {
            .search-report-txt {
                input {
                    border-radius: 8px;
                }
            }

            .search-nav {
                button {
                    padding: 3px 4px;
                    margin-bottom: 3px;
                }
            }
        }
    }

    .report-content {
        width: -webkit-fill-available;
        padding: 27px 29px;

        h3 {
            font-size: 16px;
            font-weight: 500;
            color: #464646;
            margin: 0 auto 23px;
        }

        .report-context-txt {
            height: calc(100% - 64px);
            border-radius: 26px;
            border: 1px solid #DFDFDF;
            padding: 32px 31px;
            overflow: hidden;
            overflow-y: auto;

            &::-webkit-scrollbar {
                display: none;
            }
        }
    }

    .collapse-box {
        max-height: calc(100vh - 300px);
        overflow-y: auto;
        border: none;
        margin-top: 30px;

        &::-webkit-scrollbar {
            display: none;
        }

        .el-collapse {
            border-top: none;

            .el-collapse-item__wrap {
                border: none;
            }
        }

        .el-collapse-item__header {
            border-color: #faf6f6;
        }
    }

    .report-history-list {
        overflow: auto;
        max-height: calc(100vh - 400px);
        padding: 0 20px;

        &::-webkit-scrollbar {
            display: none;
        }

        .list {
            margin: 0;
            padding: 0;

            .list-item {
                list-style: none;
                display: flex;
                align-items: baseline;

                i {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 8px;

                    &.black {
                        background: #464646;
                    }

                    &.gray {
                        background: #AEACAC;
                    }

                    &.blue {
                        background: #6190E8;
                    }
                }

                &.black {
                    color: #464646;
                }

                &.gray {
                    color: #AEACAC;
                }

                p.blue {
                    color: #6190E8 !important;
                }
            }
        }
    }
}
</style>