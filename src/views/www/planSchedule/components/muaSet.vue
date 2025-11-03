<template>
    <el-dialog title="MUA配置" width="600px" :visible.sync="dialogVisible" center append-to-body top="-5vh"
        :close-on-click-modal="true">
        <el-form ref="form" :model="form" :rules="rules" label-position="top">
            <el-row>
                <!-- <el-col>
                    <el-form-item label="配置类型" prop="configType">
                        <el-radio-group v-model="form.configType">
                            <el-radio v-for="item in configTypeData" :label="+item.dictValue" border>
                                {{ item.dictLabel }}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col> -->
                <el-col>
                    <el-form-item label="升级项目" prop="upgradeProject">
                        <el-checkbox-group v-model="form.upgradeProject">
                            <el-checkbox v-for="item in upgradeProjectData" :label="item.dictValue" border>
                                {{ item.dictLabel }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="供电电压" prop="supplyVoltage">
                        <el-radio-group v-model="form.supplyVoltage">
                            <el-radio v-for="item in supplyVoltageData" :label="item.dictValue" border>
                                {{ item.dictLabel }}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <!-- <el-col :span="12">
                    <el-form-item label="通讯类型" prop="communicationType">
                        <el-radio-group v-model="form.communicationType">
                            <el-radio v-for="item in communicationTypeData" :label="item.dictValue" border>
                                {{ item.dictLabel }}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col> -->
            </el-row>

        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="isBtnLoading" @click="submitForm">
                确 定
            </el-button>
            <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { setMuaConfig } from "@/api/www/planSchedule";
export default {
    name: "MUASET",

    data() {
        return {
            dialogVisible: false,
            isBtnLoading: false,
            configTypeData: [],
            form: {
                id: "",
                configType: 1,
                upgradeProject: ["0"],
                supplyVoltage: "0",
                communicationType: "0",
            },
            upgradeProjectData: [],
            supplyVoltageData: [],
            communicationTypeData: [],
            rules: {
                configType: [{ required: true, message: "请选择配置类型", trigger: "change" }],
                upgradeProject: [{ required: true, message: "请选择升级项目", trigger: "change" }],
                supplyVoltage: [{ required: true, message: "请选择供电电压", trigger: "change" }],
                communicationType: [{ required: true, message: "请选择通讯类型", trigger: "change" }],
            }
        };
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.getDictData();
            }
        }
    },
    methods: {
        echoData(data) {
            this.form.id = data?.id;
            if(data?.configList?.length) {
                const { configType, jsonStr } = data.configList[0];
                const { upgradeProject, supplyVoltage, communicationType } = JSON.parse(jsonStr);
                this.form.configType = configType;
                this.form.upgradeProject = upgradeProject;
                this.form.supplyVoltage = supplyVoltage;
                this.form.communicationType = communicationType;
            } 
        },
        reset() {
            this.form = {
                id: "",
                configType: 1,
                upgradeProject: [],
                supplyVoltage: "0",
                communicationType: "0",
            }
            this.resetForm("form");
        },
        submitForm() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.isBtnLoading = true;
                    const { id, configType, upgradeProject, supplyVoltage, communicationType } = this.form;
                    const data = {
                        id,
                        configType,
                        jsonStr: JSON.stringify({
                            upgradeProject,
                            supplyVoltage,
                            communicationType,
                        }),
                    }

                    setMuaConfig(data).then((res) => {
                        this.$message({
                            message: "操作成功",
                            type: "success",
                        });
                        this.dialogVisible = false;
                        this.$emit("refresh");
                    }).finally(() => {
                        this.isBtnLoading = false;
                    })
                }
            })
        },
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

            this.getDicts("config_type").then((res) => {
                this.configTypeData = res.data; 
            })
        }
    },
};
</script>