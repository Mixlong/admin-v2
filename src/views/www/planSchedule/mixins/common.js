const commonData = {
    data() {
        return {
            configTypeData: [
                // { dictValue: 0, dictLabel: "未配置" },
                { dictValue: 1, dictLabel: "MUA" },
            ],
            upgradeProjectData: [],
            supplyVoltageData: [],
            communicationTypeData: [],
        }
    },
    computed: {
        analyzeConfig() {
            return (jsonStr, key) => {
                if (!jsonStr) {
                    return "";
                }

                const jsonObj = JSON.parse(jsonStr);
                const arr = jsonObj[key];

                if (Array.isArray(arr) && arr.length) {
                    let labelList = [];
                    this[key + "Data"].forEach(item => {
                        if (arr.includes(item.dictValue)) {
                            labelList.push(item.dictLabel)
                        }
                    })
                    return labelList.join(",");
                } else {
                    return this.selectDictLabel(this[key + "Data"], arr);
                }
            };
        }
    },
    methods: {
        getDictData() {
            //仪表电压
            this.getDicts("upgrade_project").then((res) => {
                this.upgradeProjectData = res.data;
            });

            //供电电压
            this.getDicts("supply_voltage").then((res) => {
                this.supplyVoltageData = res.data;
            });

            //通讯类型
            this.getDicts("communication_type").then((res) => {
                this.communicationTypeData = res.data;
            });
        }
    }
}

export { commonData }