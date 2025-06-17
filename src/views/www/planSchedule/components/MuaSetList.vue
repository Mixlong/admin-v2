<template>
    <div>
        <el-dialog title="MUA配置列表" width="600px" :visible.sync="dialogVisible" center append-to-body top="-5vh"
            :close-on-click-modal="true">
            <el-table class="margin-top-xs" :data="configList" border max-height="400px">
                <el-table-column label="配置类型" align="center" width="90px">
                    <template slot-scope="{ row }">
                        {{ selectDictLabel(configTypeData, row.configType) }}
                    </template>
                </el-table-column>
                <el-table-column label="升级项目" align="center">
                    <template slot-scope="{ row }">
                        {{ analyzeConfig(row.jsonStr, 'upgradeProject') }}
                    </template>
                </el-table-column>
                <el-table-column label="供电电压" align="center" width="90px">
                    <template slot-scope="{ row }">
                        {{ analyzeConfig(row.jsonStr, 'supplyVoltage') }}
                    </template>
                </el-table-column>
                <el-table-column label="通讯类型" align="center" width="90px">
                    <template slot-scope="{ row }">
                        {{ analyzeConfig(row.jsonStr, 'communicationType') }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="90px">
                    <template slot-scope="{ row }">
                        <el-button type="primary" size="mini" @click="handleEdit(row)">
                            编辑
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <MuaSet ref="muaSetRef" />
    </div>
</template>

<script>
import { setMuaConfig } from "@/api/www/planSchedule";
import { commonData } from "../mixins/common";

export default {
    name: "MUASETLIST",
    mixins: [commonData],
    components: {
        MuaSet: () => import("./muaSet.vue"),
    },
    data() {
        return {
            dialogVisible: false,
            isBtnLoading: false,
            configList: [],
        }
    },
    watch: {
        dialogVisible(val) {
            if (val) {
                this.getDictData();
            }
        }
    },
    methods: {
        handleEdit(row) {
            console.log(row);
            // this.$emit('edit', row);
        }
    }
}
</script>

<style></style>