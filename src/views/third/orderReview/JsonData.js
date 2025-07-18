const resultList = [
    // 市场
    {
        departmentName: "市场",
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "订单规格描述是否清晰",
        moduleType: 1, // 1： radio，  2： input， 3：选择 + input
        nickName: "", // 责任人,
        rowSpan: 10,
        list: [
            {
                label: "已清晰",
                value: 0,
            },
            {
                label: "不清晰",
                value: 1,
            },
            {
                label: "其他",
                value: 2,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "较上次量产相比",
        moduleType: 1, // 1： radio，  2： input， 3：选择 + input
        list: [
            {
                label: "有变更",
                value: 0,
            },
            {
                label: "首次生产",
                value: 1,
            },
            {
                label: "其他",
                value: 2,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "交货时间是否可调整",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "按期交货",
                value: 0,
            },
            {
                label: "可协商调整",
                value: 1,
            },
            {
                label: "其他",
                value: 2,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: `送样版本：\nHW：\nBOOT：\nAPP：\nUI：`,
        completeTime: "",
        name: "样品&产前样是否确认",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "已确认",
                value: 0,
            },
            {
                label: "未确认",
                value: 1,
            },
            {
                label: "其他",
                value: 2,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "线材（中控线&按键线）",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "迪太自采",
                value: 0,
            },
            {
                label: "客户提供",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "送货单模板要求",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "迪太模板",
                value: 0,
            },
            {
                label: "客户指定",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "箱唛模板要求",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "迪太模板",
                value: 0,
            },
            {
                label: "客户指定",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "标签要求",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "迪太模板",
                value: 0,
            },
            {
                label: "客户指定",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "出厂检验报告",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "纸质（随货发出）",
                value: 0,
            },
            {
                label: "电子档",
                value: 1,
            },
        ],
    },
    {
        selectValue: "", // 选择的值
        inputValue: "",
        view: "", // 评审意见
        completeTime: "",
        name: "其它注意事项",
        moduleType: 2, // 1： radio，  2： input
    },

    // 产品经理
    {
        departmentName: "产品经理",
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "订单需求总表",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人
        rowSpan: 3,
        list: [
            {
                label: "已输出",
                value: 0,
            },
            {
                label: "未输出",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "型号配置总表",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "已更新",
                value: 0,
            },
            {
                label: "未更新",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "迪太云型号创建",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "已更新",
                value: 0,
            },
            {
                label: "未更新",
                value: 1,
            },
        ],
    },

    // 硬件
    {
        departmentName: "硬件",
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "打板&贴片资料",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人,
        rowSpan: 4,
        list: [
            {
                label: "有",
                value: 0,
            },
            {
                label: "无",
                value: 1,
            },
            {
                label: "其他",
                value: 2,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "硬件BOM",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "有",
                value: 0,
            },
            {
                label: "无",
                value: 1,
            },
            {
                label: "其他",
                value: 2,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "可生产版本：",
        moduleType: 2, // 1： radio，  2： input
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "其它注意事项",
        moduleType: 2, // 1： radio，  2： input
    },

    // 软件
    {
        departmentName: "软件",
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "是否有遗留事项",
        moduleType: 3, // 1： radio，  2： input
        nickName: "", // 责任人,
        rowSpan: 1,
        list: [
            {
                label: "有",
                value: 0,
            },
            {
                label: "无",
                value: 1,
            },
        ],
    },

    // 结构
    {
        departmentName: "结构",
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "产品规格图纸",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人,
        rowSpan: 7,
        list: [
            {
                label: "有",
                value: 0,
            },
            {
                label: "无",
                value: 1,
            },
            {
                label: "其他",
                value: 2,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "中控线加工图纸",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人,
        list: [
            {
                label: "有",
                value: 0,
            },
            {
                label: "无",
                value: 1,
            },
            {
                label: "其他",
                value: 2,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "按键线加工图纸",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人,
        list: [
            {
                label: "有",
                value: 0,
            },
            {
                label: "无",
                value: 1,
            },
            {
                label: "其他",
                value: 2,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "结构BOM",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人,
        list: [
            {
                label: "有",
                value: 0,
            },
            {
                label: "无",
                value: 1,
            },
            {
                label: "其他",
                value: 2,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "模具状态",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人,
        list: [
            {
                label: "可直接生产",
                value: 0,
            },
            {
                label: "不可生产,需修模",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "试产问题",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人,
        list: [
            {
                label: "已关闭",
                value: 0,
            },
            {
                label: "未关闭",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "其它注意事项",
        moduleType: 2, // 1： radio，  2： input
    },

    // ERP
    {
        departmentName: "ERP",
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "销售BOM",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人,
        rowSpan: 1,
        list: [
            {
                label: "有",
                value: 0,
            },
            {
                label: "无，现有BOM升级/修改",
                value: 1,
            },
            {
                label: "无，新做",
                value: 2,
            },
        ],
    },

    // 装备
    {
        departmentName: "装备",
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "FCT测试架",
        moduleType: 2, // 1： radio，  2： input
        nickName: "", // 责任人,
        rowSpan: 1,
        list: [
            {
                label: "有",
                value: 0,
            },
            {
                label: "无",
                value: 1,
            },
        ],
    },

    // 计划
    {
        departmentName: "计划",
        selectValue: "",
        inputValue: "定于（）月 （） 日 提供物料需求计划给采购部",
        view: "",
        completeTime: "",
        name: "物料需求计划评估",
        moduleType: 2, // 1： radio，  2： input
        nickName: "", // 责任人,
        rowSpan: 1,
    },

    // 生产
    {
        departmentName: "生产",
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "生产设备&夹具评估",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人,
        rowSpan: 4,
        list: [
            {
                label: "现有设备能满足",
                value: 0,
            },
            {
                label: "现有设备不满足，需新增设备",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "生产工艺评估",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "现有工艺能满足",
                value: 0,
            },
            {
                label: "现有工艺不满足，需新增设备",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "测试工具评估（串口&老化线）",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "现有测试线能满足",
                value: 0,
            },
            {
                label: "现有测试线不满足，需增加测试线",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "其他注意事项",
        moduleType: 2, // 1： radio，  2： input
    },

    // 品质
    {
        departmentName: "品质",
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "检验标准",
        moduleType: 1, // 1： radio，  2： input
        nickName: "", // 责任人,
        rowSpan: 3,
        list: [
            {
                label: "迪太标准",
                value: 0,
            },
            {
                label: "客户指定标准",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "检验方案",
        moduleType: 1, // 1： radio，  2： input
        list: [
            {
                label: "抽检",
                value: 0,
            },
            {
                label: "全检",
                value: 1,
            },
        ],
    },
    {
        selectValue: "",
        inputValue: "",
        view: "",
        completeTime: "",
        name: "其他注意事项",
        moduleType: 2, // 1： radio，  2： input
    }
]

export {
    resultList
}