<template>
    <el-dialog title="MUA配置" width="600px" :visible.sync="dialogVisible" center append-to-body top="-5vh"
        :close-on-click-modal="true">
        <el-form ref="form" :model="form" :rules="rules" label-position="top">
            <el-row>
                <!-- <el-col>
                    <el-form-item label="配置类型" prop="configType">
                        <el-radio-group v-model="form.configType">
                            <el-radio v-for="item in configTypeData" :key="item.dictValue" :label="+item.dictValue" border>
                                {{ item.dictLabel }}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col> -->
                <el-col>
                    <el-form-item label="升级项目" prop="upgradeProject">
                        <el-checkbox-group v-model="form.upgradeProject">
                            <el-checkbox v-for="item in upgradeProjectData" :key="item.dictValue" :label="item.dictValue" border>
                                {{ item.dictLabel }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="供电电压" prop="supplyVoltage">
                        <el-radio-group v-model="form.supplyVoltage">
                            <el-radio v-for="item in supplyVoltageData" :key="item.dictValue" :label="item.dictValue" border>
                                {{ item.dictLabel }}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <!-- <el-col :span="12">
                    <el-form-item label="通讯类型" prop="communicationType">
                        <el-radio-group v-model="form.communicationType">
                            <el-radio v-for="item in communicationTypeData" :key="item.dictValue" :label="item.dictValue" border>
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
import { editCategory } from "@/api/third/category";

export default {
    name: "CategoryMuaSet",

    data() {
        return {
            dialogVisible: false,
            isBtnLoading: false,
            configTypeData: [],
            categoryId: "", // 品类ID
            form: {
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
        /**
         * 回显数据
         * @param {Object} data - 品类数据
         * @param {String} data.id - 品类ID
         * @param {String} data.muaJsonStr - MUA配置JSON字符串
         */
        echoData(data) {
            this.categoryId = data?.id;
            
            // 解析 muaJsonStr 字段
            if (data?.muaJsonStr) {
                try {
                    const muaConfig = JSON.parse(data.muaJsonStr);
                    this.form.configType = muaConfig.configType || 1;
                    this.form.upgradeProject = muaConfig.upgradeProject || ["0"];
                    this.form.supplyVoltage = muaConfig.supplyVoltage || "0";
                    this.form.communicationType = muaConfig.communicationType || "0";
                } catch (error) {
                    console.error('解析 muaJsonStr 失败:', error);
                    this.reset();
                }
            }
        },
        
        reset() {
            this.categoryId = "";
            this.form = {
                configType: 1,
                upgradeProject: ["0"],
                supplyVoltage: "0",
                communicationType: "0",
            }
            this.resetForm("form");
        },
        
        submitForm() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if (!this.categoryId) {
                        this.$message.error("品类ID不能为空");
                        return;
                    }
                    
                    this.isBtnLoading = true;
                    const { configType, upgradeProject, supplyVoltage, communicationType } = this.form;
                    
                    // 构造 muaJsonStr 字段
                    const muaJsonStr = JSON.stringify({
                        configType,
                        upgradeProject,
                        supplyVoltage,
                        communicationType,
                    });
                    
                    const data = {
                        id: this.categoryId,
                        muaJsonStr: muaJsonStr,
                    }

                    editCategory(data).then((res) => {
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
            //升级项目
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

            //配置类型
            this.getDicts("config_type").then((res) => {
                this.configTypeData = res.data; 
            })
        }
    },
};
</script>

