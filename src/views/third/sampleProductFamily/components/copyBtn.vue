<template>
    <el-form>
        <el-form-item label="所属品类" prop="categoryId">
            <el-select v-model="queryParams.categoryId" filterable allow-create clearable placeholder="请选择品类"
                style="width: 160px" @change="changeCategory(queryParams.categoryId, false)">
                <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.name" />
            </el-select>
        </el-form-item>
        <el-form-item label="仪表型号" prop="computerId">
            <el-select v-model="queryParams.computerId" :loading="isCLoading" filterable remote clearable
                :disabled="!queryParams.categoryId" placeholder="请选择仪表型号" :remote-method="getComputerNameList"
                style="width: 160px">
                <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" :disabled="!queryParams.computerId" @click="handleCopy2">
                产品族谱复制
            </el-button>
        </el-form-item>
    </el-form>
</template>
<script>
import commonData from "@/mixins/commonData";
import {
  detailComputer,
} from "@/api/third/computer";
export default {
    mixins: [commonData],
    data() {
        return {
            queryParams: {},
            form: {},
        }
    },
    methods: {
        async handleCopy2() {
             this.$emit('config', this.queryParams.computerId);
        },
    }
}

</script>