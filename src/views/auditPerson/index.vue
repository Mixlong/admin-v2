<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" :inline="true">
            <el-form-item label="品类" prop="categoryId">
                <el-select v-model="queryParams.categoryId" filterable clearable @change="queryParams.computerId = ''">
                    <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="型号" prop="computerId">
                <el-select v-model="queryParams.computerId" :loading="isCLoading" filterable remote clearable
                    @change="getList" @focus="getComputerData" :remote-method="getComputerNameList">
                    <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name"
                        :value="dict.model" />
                </el-select>
            </el-form-item>
            <el-form-item label="人员" prop="person">
                <el-select v-model="queryParams.person" filterable clearable>
                    <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                        :value="item.userName">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">
                    搜索
                </el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
                    重 置
                </el-button>
            </el-form-item>

            <el-row :gutter="20" class="fr">
                <el-col :span="1.5">
                    <el-button type="primary" icon="el-icon-user-solid" v-hasPermi="['audit:People:Add']"
                        @click="handleAddPeople">
                        人员管理
                    </el-button>
                </el-col>
            </el-row>
        </el-form>

        <el-table v-loading="loading" :data="dataList" :height="tableHeight()" border>
            <el-table-column label="序号" width="58" type="index" align="center">
                <template slot-scope="scope">
                    {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="品类" prop="categoryName" align="center" />
            <el-table-column label="型号" prop="computerName" align="center" />
            <el-table-column label="产前样" align="center">
                <el-table-column label="样品组装" align="center">
                    <template slot-scope="{ row }">
                        <template v-if="row.list[0]">
                            {{ row.list[0].personnel }}
                        </template>
                        <template v-else>
                            - - -
                        </template>
                    </template>
                </el-table-column>
                <el-table-column label="客户确认" prop="name" align="center">
                    <template slot-scope="{ row }">
                        <template v-if="row.list[1]">
                            {{ row.list[1].personnel }}
                        </template>
                        <template v-else>
                            - - -
                        </template>
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column label="SMT资料上传" align="center">
                <el-table-column label="PUCS脚本" prop="name" align="center">
                    <template slot-scope="{ row }">
                        <template v-if="row.list[2]">
                            {{ row.list[2].personnel }}
                        </template>
                        <template v-else>
                            - - -
                        </template>
                    </template>
                </el-table-column>
                <el-table-column label="硬件资料" prop="name" align="center">
                    <template slot-scope="{ row }">
                        <template v-if="row.list[3]">
                            {{ row.list[3].personnel }}
                        </template>
                        <template v-else>
                            - - -
                        </template>
                    </template>
                </el-table-column>
                <el-table-column label="软件资料" prop="name" align="center">
                    <template slot-scope="{ row }">
                        <template v-if="row.list[4]">
                            {{ row.list[4].personnel }}
                        </template>
                        <template v-else>
                            - - -
                        </template>
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column label="组装资料上传" align="center">
                <el-table-column label="配置文件" prop="name" align="center">
                    <template slot-scope="{ row }">
                        <template v-if="row.list[5]">
                            {{ row.list[5].personnel }}
                        </template>
                        <template v-else>
                            - - -
                        </template>
                    </template>
                </el-table-column>
                <el-table-column label="ITA脚本" prop="name" align="center">
                    <template slot-scope="{ row }">
                        <template v-if="row.list[6]">
                            {{ row.list[6].personnel }}
                        </template>
                        <template v-else>
                            - - -
                        </template>
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column label="审核环节" align="center">
                <el-table-column label="初审" prop="name" align="center">
                    <template slot-scope="{ row }">
                        <template v-if="row.list[7]">
                            {{ row.list[7].personnel }}
                        </template>
                        <template v-else>
                            - - -
                        </template>
                    </template>
                </el-table-column>
                <el-table-column label="终审" prop="name" align="center">
                    <template slot-scope="{ row }">
                        <template v-if="row.list[8]">
                            {{ row.list[8].personnel }}
                        </template>
                        <template v-else>
                            - - -
                        </template>
                    </template>
                </el-table-column>
                <el-table-column label="许可" prop="name" align="center">
                    <template slot-scope="{ row }">
                        <template v-if="row.list[9]">
                            {{ row.list[9].personnel }}
                        </template>
                        <template v-else>
                            - - -
                        </template>
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column label="操作" align="center" width="90">
                <template slot-scope="scope">
                    <Tooltip icon="el-icon-edit" content="编辑" v-hasPermi="['audit:People:edit']" @click="handleUpdate(scope.row)" />
                </template>
            </el-table-column>
        </el-table>

        <pagination :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l" @pagination="getList" />

        <el-dialog title="人员管理" top="-5vh" center :visible.sync="isDialog">
            <el-form ref="form" :model="form" :rules="rules" label-width="90px">
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="品类" prop="categoryId">
                            <!-- <el-select v-model="form.categoryId" filterable clearable disabled @change="form.computerId = ''">
                                <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name"
                                    :value="dict.id" />
                            </el-select> -->
                            {{ form.categoryName }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="型号" prop="computerId">
                            <!-- <el-select v-model="form.computerId" :loading="isCLoading" disabled filterable remote clearable
                                @change="getList" @focus="getComputerData" :remote-method="getComputerNameList"
                                style="width: 100%;">
                                <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name"
                                    :value="dict.model" />
                            </el-select> -->
                            {{ form.computerName }}
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="审核人员："></el-form-item>
                <el-row :gutter="15">
                    <el-col v-for="(item, index) in form.list" :span="6">
                        <el-form-item :label="auditTypePeopleData[index + 1]" :prop="`list[${index}].personnel`"
                            :rules="rules.personnel">
                            <el-select v-model="item.personnel" filterable clearable>
                                <el-option v-for="(item, index) in auditCheckData(index)" :key="index"
                                    :label="item.personnel" :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <!-- <el-col :span="6">
                        <el-form-item label="样品组装" prop="auditData1">
                            <el-select v-model="form.auditData1" filterable clearable>
                                <el-option v-for="(item, index) in auditData1" :key="index" :label="item.personnel"
                                    :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="客户确认" prop="auditData2">
                            <el-select v-model="form.auditData2" filterable clearable>
                                <el-option v-for="(item, index) in auditData2" :key="index" :label="item.personnel"
                                    :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="PUCS脚本" prop="auditData3">
                            <el-select v-model="form.auditData3" filterable clearable>
                                <el-option v-for="(item, index) in auditData3" :key="index" :label="item.personnel"
                                    :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="硬件资料" prop="auditData4">
                            <el-select v-model="form.auditData4" filterable clearable>
                                <el-option v-for="(item, index) in auditData4" :key="index" :label="item.personnel"
                                    :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="软件资料" prop="auditData5">
                            <el-select v-model="form.auditData5" filterable clearable>
                                <el-option v-for="(item, index) in auditData5" :key="index" :label="item.personnel"
                                    :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="配置文件" prop="auditData6">
                            <el-select v-model="form.auditData6" filterable clearable>
                                <el-option v-for="(item, index) in auditData6" :key="index" :label="item.personnel"
                                    :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="ITA脚本" prop="auditData7">
                            <el-select v-model="form.auditData7" filterable clearable>
                                <el-option v-for="(item, index) in auditData7" :key="index" :label="item.personnel"
                                    :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="初审" prop="auditData8">
                            <el-select v-model="form.auditData8" filterable clearable>
                                <el-option v-for="(item, index) in auditData8" :key="index" :label="item.personnel"
                                    :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="终审" prop="auditData9">
                            <el-select v-model="form.auditData9" filterable clearable>
                                <el-option v-for="(item, index) in auditData9" :key="index" :label="item.personnel"
                                    :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="许可" prop="auditData10">
                            <el-select v-model="form.auditData10" filterable clearable>
                                <el-option v-for="(item, index) in auditData10" :key="index" :label="item.personnel"
                                    :value="item.personnel">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col> -->

                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" :loading="isSubLoading" @click="submitForm">
                    确 定
                </el-button>
                <el-button @click="isDialog = false">取 消</el-button>
            </div>
        </el-dialog>

        <!-- 审核人员管理 -->
        <el-dialog title="审核人员管理" :visible.sync="isPeopleManageVisible" top="-5vh" center append-to-body width="1200px"
            :close-on-click-modal="false">
            <el-form ref="peopleForm" :model="peopleManageForm" :rules="peopleManageRules" label-width="100px"
                label-position="left" class="input-width">
                <el-row :gutter="15">
                    <el-col :span="6">
                        <el-form-item label="样品组装" prop="auditData1">
                            <el-select v-model="peopleManageForm.auditData1" filterable multiple clearable
                                collapse-tags>
                                <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                                    :value="item.userName">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="客户确认" prop="auditData2">
                            <el-select v-model="peopleManageForm.auditData2" filterable multiple clearable
                                collapse-tags>
                                <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                                    :value="item.userName">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="PUCS脚本" prop="auditData3">
                            <el-select v-model="peopleManageForm.auditData3" filterable multiple clearable
                                collapse-tags>
                                <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                                    :value="item.userName">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="硬件资料" prop="auditData4">
                            <el-select v-model="peopleManageForm.auditData4" filterable multiple clearable
                                collapse-tags>
                                <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                                    :value="item.userName">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="软件资料" prop="auditData5">
                            <el-select v-model="peopleManageForm.auditData5" filterable multiple clearable
                                collapse-tags>
                                <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                                    :value="item.userName">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="配置文件" prop="auditData6">
                            <el-select v-model="peopleManageForm.auditData6" filterable multiple clearable
                                collapse-tags>
                                <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                                    :value="item.userName">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="ITA脚本" prop="auditData7">
                            <el-select v-model="peopleManageForm.auditData7" filterable multiple clearable
                                collapse-tags>
                                <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                                    :value="item.userName">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="初审" prop="auditData8">
                            <el-select v-model="peopleManageForm.auditData8" filterable multiple clearable
                                collapse-tags>
                                <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                                    :value="item.userName">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="终审" prop="auditData9">
                            <el-select v-model="peopleManageForm.auditData9" filterable multiple clearable
                                collapse-tags>
                                <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                                    :value="item.userName">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="许可" prop="auditData10">
                            <el-select v-model="peopleManageForm.auditData10" filterable multiple clearable
                                collapse-tags>
                                <el-option v-for="(item, index) in auditPeopleData" :key="index" :label="item.userName"
                                    :value="item.userName">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" :loading="isCheckLoading" @click="submitPeopleForm">确 定</el-button>
                <el-button @click="isPeopleManageVisible = false">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {
    computerLicenseList,
    computerUpdate,
    computerLogList,
} from "@/api/third/testApi";
import { categoryComputerDict, computerNameList } from "@/api/third/fileConfig";
import { dictUserList } from "@/api/system/user";
import { responsibleList, responsibleEdit, responsibleUpdate, responsiblePersonnel, responsiblePersonnelList } from "@/api/home/index";
import { cloneDeep } from "lodash";

export default {
    name: "AuditPerson",
    data() {
        return {
            // 遮罩层
            loading: false,
            isCLoading: false,
            isSubLoading: false,
            isCheckLoading: false,
            isPeopleManageVisible: false,
            total: 0,
            dataList: [],
            // 任务变更
            isDialog: false,
            taskForm: {},
            // 型号
            computerOptions: [],
            auditPeopleData: [],
            auditTypePeopleData: {
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
            },
            auditData1: [],
            auditData2: [],
            auditData3: [],
            auditData4: [],
            auditData5: [],
            auditData6: [],
            auditData7: [],
            auditData8: [],
            auditData9: [],
            auditData10: [],
            peopleManageForm: {
                auditData1: [],
                auditData2: [],
                auditData3: [],
                auditData4: [],
                auditData5: [],
                auditData6: [],
                auditData7: [],
                auditData8: [],
                auditData9: [],
                auditData10: []
            },
            peopleManageRules: {
                auditData1: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData2: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData3: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData4: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData5: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData6: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData7: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData8: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData9: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData10: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ]
            },
            // 操作日志
            logList: [],
            dictList: [],
            form: {
                categoryId: "",
                computerId: "",
                list: [],
                // auditData1: "",
                // auditData2: "",
                // auditData3: "",
                // auditData4: "",
                // auditData5: "",
                // auditData6: "",
                // auditData7: "",
                // auditData8: "",
                // auditData9: "",
                // auditData10: ""
            },
            rules: {
                categoryId: [
                    { required: true, message: "请选择品类", trigger: "change" },
                ],
                computerId: [
                    { required: true, message: "请选择型号", trigger: "change" },
                ],
                personnel: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData1: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData2: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData3: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData4: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData5: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData6: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData7: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData8: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData9: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ],
                auditData10: [
                    { required: true, message: "请选择人员", trigger: "change" },
                ]
            },
            // 查询参数
            queryParams: {
                p: 1,
                l: 10,
                categoryId: "",
                computerId: "",
                person: "",
            },
        };
    },
    computed: {
        auditCheckData() {
            const auditData = [this.auditData1, this.auditData2, this.auditData3, this.auditData4, this.auditData5, this.auditData6, this.auditData7, this.auditData8, this.auditData9, this.auditData10];
            return index => {
                return auditData[index];
            }
        }
    },
    watch: {
        $route: {
            async handler(route) {
                console.log('route', route)
                if (route.name === "AuditPerson") {
                    this.queryParams.categoryId = "";
                    this.queryParams.computerId = "";

                    const { categoryId, computerId } = route?.params;

                    if (categoryId && computerId) {
                        this.dictList = await this.getCategoryData();
                        this.queryParams.categoryId = categoryId;
                        this.getComputerData();
                        this.queryParams.computerId = computerId;

                        this.handleQuery();
                    } else {
                        this.dictList = await this.getCategoryData();
                        // 默认选择第一个
                        this.queryParams.categoryId = this.dictList[0]?.id;
                        this.getComputerData();

                        this.handleQuery();
                    }
                }
            },
            immediate: true,
        },
        isPeopleManageVisible(bool) {
            if (bool) {
                this.getTotalPeopleData();
            }
        }
    },
    created() {
        this.getCheckPeopleList();
    },
    methods: {
        getCategoryData() {
            return new Promise((resolve, reject) => {
                try {
                    categoryComputerDict().then((res) => {
                        resolve(res.data);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },
        // 型号
        getComputerData() {
            if (this.queryParams.categoryId && this.dictList.length) {
                this.computerOptions = this.dictList.filter(
                    (item) => item.id === this.queryParams.categoryId
                )[0].computerList;
            }
        },
        getComputerNameList(name) {
            if (name) {
                this.isCLoading = true;
                computerNameList({
                    name,
                    categoryId: this.queryParams.categoryId,
                })
                    .then((res) => {
                        this.computerOptions = res.data;
                    })
                    .finally(() => {
                        this.isCLoading = false;
                    });
            } else {
                this.computerOptions = [];
            }
        },
        /** 查询品牌列表 */
        getList() {
            this.loading = true;
            responsibleList(this.queryParams)
                .then((res) => {
                    const { list, total } = res.data;
                    this.dataList = list;
                    this.total = total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 启用、禁用
        handleStatus(isLicense, row) {
            let text;

            const licenseData = {
                0: "取消许可",
                1: "许可",
                2: "强制许可",
            }

            text = licenseData[isLicense];

            this.$confirm("确认要" + `“${text}”` + "吗？", "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(function () {
                    return computerUpdate({
                        id: row.id,
                        isLicense
                    });
                })
                .then((res) => {
                    if (res.data === 1) {
                        this.msgSuccess("操作成功");
                        this.getList();
                    } else {
                        this.msgError("配置总览未审核");
                    }
                }).catch(() => {

                })
        },
        /** 搜索按钮操作 */
        handleQuery() {
            this.queryParams.p = 1;
            this.getList();
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.resetForm("queryForm");
            // 默认选择第一个
            this.queryParams.categoryId = this.dictList[0]?.id;
            this.handleQuery();
        },
        // 编辑
        async handleUpdate(row) {
            this.reset();
            this.isDialog = true;
            const rowData = cloneDeep(row);
            await this.getEditAuditData();

            if (!rowData.list.length) {
                const list = [];
                for (let item in this.auditTypePeopleData) {
                    list.push({
                        type: item,
                        personnel: ''
                    })
                }

                rowData.list = list;
            }
            this.form = rowData;
        },
        getEditAuditData() {
            const requestList = [
                this.getEditPeopleList(1),
                this.getEditPeopleList(2),
                this.getEditPeopleList(3),
                this.getEditPeopleList(4),
                this.getEditPeopleList(5),
                this.getEditPeopleList(6),
                this.getEditPeopleList(7),
                this.getEditPeopleList(8),
                this.getEditPeopleList(9),
                this.getEditPeopleList(10),
            ];

            Promise.all(requestList).then((res) => {
                const [auditData1,
                    auditData2,
                    auditData3,
                    auditData4,
                    auditData5,
                    auditData6,
                    auditData7,
                    auditData8,
                    auditData9,
                    auditData10] = res;

                this.auditData1 = auditData1;
                this.auditData2 = auditData2;
                this.auditData3 = auditData3;
                this.auditData4 = auditData4;
                this.auditData5 = auditData5;
                this.auditData6 = auditData6;
                this.auditData7 = auditData7;
                this.auditData8 = auditData8;
                this.auditData9 = auditData9;
                this.auditData10 = auditData10;
            })
        },
        getEditPeopleList(type) {
            return new Promise((resolve) => {
                try {
                    responsiblePersonnelList({ type, p: 1, l: 50 }).then((res) => {
                        const { list } = res.data;
                        resolve(list);
                    });
                } catch (error) {
                    console.error(error);
                }
            });
        },
        getCheckPeopleList() {
            dictUserList().then((res) => {
                this.auditPeopleData = res.data;
            });
        },
        reset() {
            this.form = {
                categoryId: "",
                computerId: "",
                list: [],
            }
            this.resetForm("form");
        },
        handleAddPeople() {
            this.isPeopleManageVisible = true;
            this.resetPeopleForm();
        },
        resetPeopleForm() {
            this.peopleManageForm = {
                auditData1: [],
                auditData2: [],
                auditData3: [],
                auditData4: [],
                auditData5: [],
                auditData6: [],
                auditData7: [],
                auditData8: [],
                auditData9: [],
                auditData10: []
            };
            this.resetForm("peopleForm");
        },
        getTotalPeopleData() {
            const requestList = [
                this.getPeopleList(1),
                this.getPeopleList(2),
                this.getPeopleList(3),
                this.getPeopleList(4),
                this.getPeopleList(5),
                this.getPeopleList(6),
                this.getPeopleList(7),
                this.getPeopleList(8),
                this.getPeopleList(9),
                this.getPeopleList(10),
            ];

            Promise.all(requestList).then((res) => {
                const [auditData1,
                    auditData2,
                    auditData3,
                    auditData4,
                    auditData5,
                    auditData6,
                    auditData7,
                    auditData8,
                    auditData9,
                    auditData10] = res;

                this.peopleManageForm = {
                    auditData1,
                    auditData2,
                    auditData3,
                    auditData4,
                    auditData5,
                    auditData6,
                    auditData7,
                    auditData8,
                    auditData9,
                    auditData10
                };
            })
        },
        getPeopleList(type) {
            return new Promise((resolve) => {
                try {
                    responsiblePersonnelList({ type, p: 1, l: 50 }).then((res) => {
                        const { list } = res.data;
                        resolve(list.map((item) => item.personnel));
                    });
                } catch (error) {
                    console.error(error);
                }
            });
        },
        submitPeopleForm() {
            this.$refs["peopleForm"].validate((valid) => {
                if (valid) {
                    this.isCheckLoading = true;
                    const {
                        auditData1,
                        auditData2,
                        auditData3,
                        auditData4,
                        auditData5,
                        auditData6,
                        auditData7,
                        auditData8,
                        auditData9,
                        auditData10
                    } = this.peopleManageForm;

                    const setPeopleList = (data, type) => {
                        return data.map((personnel) => {
                            return {
                                type,
                                personnel,
                            };
                        });
                    };

                    const list = [
                        ...setPeopleList(auditData1, 1),
                        ...setPeopleList(auditData2, 2),
                        ...setPeopleList(auditData3, 3),
                        ...setPeopleList(auditData4, 4),
                        ...setPeopleList(auditData5, 5),
                        ...setPeopleList(auditData6, 6),
                        ...setPeopleList(auditData7, 7),
                        ...setPeopleList(auditData8, 8),
                        ...setPeopleList(auditData9, 9),
                        ...setPeopleList(auditData10, 10),
                    ];

                    responsibleUpdate(list)
                        .then(() => {
                            this.msgSuccess("操作成功");
                            this.isPeopleManageVisible = false;
                        }).finally(() => {
                            this.isCheckLoading = false;
                        })
                }
            })
        },
        submitForm() {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    this.isSubLoading = true;
                    responsibleEdit(this.form)
                        .then(() => {
                            this.msgSuccess("修改成功");
                            this.isDialog = false;
                            this.getList();
                        })
                        .finally(() => {
                            this.isSubLoading = false;
                        });
                }
            });
        }
    },
};
</script>