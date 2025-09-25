<template>
  <el-dialog
    class="ecn-detail-box Header_Fixed"
    title="ECN详情"
    :visible.sync="dialogVisible"
    append-to-body
    fullscreen
    top="2vh"
    center
    :close-on-click-modal="false"
  >
    <el-row type="flex" justify="space-between">
      <el-col :xs="0" :span="2"></el-col>
      <el-col :xs="24" :span="20">
        <el-form
          ref="form"
          :model="form"
          label-width="90px"
          class="input-width"
          label-position="left"
        >
          <el-row>
            <el-col :xs="24" :md="24" :lg="12">
              <el-form-item label="ECN编号:" prop="ecn">
                {{ form.ecn }}
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="24" :lg="12">
              <el-form-item label="项目名称:" prop="projectName">
                {{ form.projectName }}
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="24" :lg="12">
              <el-form-item label="产品代号:" prop="productCode">
                {{ form.productCode }}
              </el-form-item></el-col
            >
            <el-col :xs="24" :md="24" :lg="12">
              <el-form-item label="申请部门:" prop="reqUnit">
                {{ reqUnitFormatter(form.reqUnit) }}
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item
            label="分类:"
            prop="changeCause"
            class="flex align-center"
          >
            <div class="flex" style="column-gap: 15px; margin-left: -90px">
              <el-tag
                v-for="(item, index) in form.changeCauseData"
                :key="index"
              >
                {{ item.dictLabel }}
              </el-tag>
            </div>
          </el-form-item>

          <el-form-item
            label="涉及领域:"
            prop="involveUnit"
            class="flex align-center"
          >
            <div class="flex" style="column-gap: 15px; margin-left: -90px">
              <el-tag
                v-for="(item, index) in form.involveUnitData"
                :key="index"
              >
                {{ item.dictLabel }}
              </el-tag>
            </div>
          </el-form-item>

          <el-row style="width: 50%">
            <el-col :md="24" :lg="12">
              <el-form-item label="导入方式:" prop="importType">
                <el-tag v-show="form.importType === 1">立即导入</el-tag>
                <el-tag v-show="form.importType === 2">自然导入</el-tag>
                <el-tag v-show="form.importType === 3">条件导入</el-tag>
              </el-form-item>
            </el-col>
            <el-col :md="24" :lg="12">
              <el-form-item
                v-show="form.importType === 2 && form.importTime"
                label="自然导入时间："
                label-width="100"
              >
                {{ form.importTime }}
              </el-form-item>
              <el-form-item
                v-show="form.importType === 3 && form.importCondition"
                label="条件导入内容："
                label-width="100"
              >
                {{ form.importCondition }}
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="附件:" v-show="form.file">
            <el-button
              icon="el-icon-download"
              type="primary"
              @click="zipFile(form.file)"
            >
              下载
            </el-button>
          </el-form-item>

          <el-row :gutter="15" class="margin-bottom">
            <el-col :span="24" :md="12" :lg="6">
              <el-card shadow="never">
                <div slot="header" class="clearfix">
                  <span>变更前BOOT版本</span>
                </div>
                <div style="min-height: 150px">
                  {{ form.beforeVersion }}
                </div>
              </el-card>
            </el-col>
            <el-col :span="24" :md="12" :lg="6">
              <el-card shadow="never">
                <div slot="header" class="clearfix">
                  <span>变更原因</span>
                </div>
                <div style="min-height: 150px">
                  {{ form.changeCauseNote }}
                </div>
              </el-card>
            </el-col>
            <el-col :span="24" :md="12" :lg="6">
              <el-card shadow="never">
                <div slot="header" class="clearfix">
                  <span>变更内容</span>
                </div>
                <div style="min-height: 150px">
                  {{ form.changeContent }}
                </div>
              </el-card>
            </el-col>
            <el-col :span="24" :md="12" :lg="6">
              <el-card shadow="never">
                <div slot="header" class="clearfix">
                  <span>变更结果</span>
                </div>
                <div style="min-height: 150px">
                  {{ form.afterVersion }}
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-card shadow="never" class="margin-bottom-sm">
            <div slot="header" class="clearfix">
              <span>变更涉及领域:</span>
            </div>
            <div class="involve_list flex flex-direction" style="row-gap: 16px;">
              <div v-for="item in form.list" :key="item.field" class="flex align-center" style="column-gap: 60px;">
                <div>
                  <b class="margin-right-xs">领域:</b>
                  <el-tag>{{ TriageList[item.field] }}</el-tag>
                </div>

                <div class="flex-sub">
                  <b class="margin-right-xs">{{ `${TriageListTitle[item.field]}:` }}</b>
                  {{ item.programme }}
                </div>

                <template v-if="item.field === 7">
                  <div class="flex-sub">
                    <b class="margin-right-xs">在库成品处理方案：</b>
                    {{ item.treatment }}
                  </div>
                </template>

                <template v-if="item.field === 8">
                  <div class="flex-sub">
                    <b class="margin-right-xs">未出货产品处理方案：</b>
                    {{ item.treatment }}
                  </div>
                </template>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="margin-bottom-sm">
            <div slot="header" class="clearfix">
              <span class="text-red">初审状态</span>
            </div>
            <div style="min-height: 50px">
              <el-row class="margin-bottom-sm" type="flex" align="middle">
                <el-col :span="3">
                  <span>审核状态：</span>

                  <el-tag type="warning" v-show="form.firstState === 0">
                    待审核
                  </el-tag>
                  <el-tag type="success" v-show="form.firstState === 1">
                    已审核
                  </el-tag>
                  <el-tag type="danger" v-show="form.firstState === 2">
                    已驳回
                  </el-tag>
                </el-col>
                <el-col :span="6">
                  <span>审核人: {{ form.firstPerson }}</span>
                </el-col>
              </el-row>
              <el-card shadow="nerver" v-if="form.firstState !== 0">
                <template v-if="form.firstState === 1 && form.remark">
                  备注： {{ form.remark }}
                </template>
                <template v-if="form.firstState === 2 && form.result">
                  <span class="text-red">拒绝原因：</span> {{ form.result }}
                </template>
              </el-card>
            </div>
          </el-card>

          <el-card shadow="never" class="margin-bottom-sm">
            <div slot="header" class="clearfix">
              <span class="text-yellow">会审状态</span>
            </div>
            <div
              style="min-height: 50px"
              v-for="item in form.list"
              :key="item.id"
              class="margin-bottom-sm"
            >
              <el-row class="margin-bottom-sm" type="flex" align="middle">
                <el-col :span="3">
                  <span>{{ TriageList[item.field] }}：</span>
                  <el-tag type="warning" v-show="item.state === 0">
                    待审核
                  </el-tag>
                  <el-tag type="success" v-show="item.state === 1">
                    已审核
                  </el-tag>
                  <el-tag type="danger" v-show="item.state === 2">
                    已驳回
                  </el-tag>
                </el-col>
                <el-col :span="6">
                  <span>审核人: {{ item.fieldName }}</span>
                </el-col>
              </el-row>
              <el-card shadow="nerver" v-if="item.state !== 0">
                <template v-if="item.state === 1 && item.remark">
                  备注： {{ item.remark }}
                </template>
                <template v-if="item.state === 2 && item.result">
                  <span class="text-red">拒绝原因：</span> {{ item.result }}
                </template>
              </el-card>

              <el-divider></el-divider>
            </div>
          </el-card>

          <el-card shadow="never" class="margin-bottom-sm">
            <div slot="header" class="clearfix">
              <span class="text-green">PMC终审状态</span>
            </div>
            <div style="min-height: 50px">
              <el-row class="margin-bottom-sm" type="flex" align="middle">
                <el-col :span="3">
                  <span>审核状态：</span>

                  <el-tag type="warning" v-show="form.thirdState === 0">
                    待审核
                  </el-tag>
                  <el-tag type="success" v-show="form.thirdState === 1">
                    已审核
                  </el-tag>
                  <el-tag type="danger" v-show="form.thirdState === 2">
                    已驳回
                  </el-tag>
                </el-col>
                <el-col :span="6">
                  <span>审核人: {{ form.thirdPerson }}</span>
                </el-col>
              </el-row>
              <el-card shadow="nerver" v-if="form.thirdState !== 0">
                <template v-if="form.thirdState === 1 && form.thirdRemark">
                  备注： {{ form.thirdRemark }}
                </template>
                <template v-if="form.thirdState === 2 && form.thirdResult">
                  <span class="text-red">拒绝原因：</span>
                  {{ form.thirdResult }}
                </template>
              </el-card>
            </div>
          </el-card>

          <el-card shadow="never">
            <div slot="header" class="clearfix">
              <span class="text-green">最终审核状态</span>
            </div>
            <div style="min-height: 50px">
              <el-row class="margin-bottom-sm" type="flex" align="middle">
                <el-col :span="3">
                  <span>审核状态：</span>

                  <el-tag type="warning" v-show="form.secondState === 0">
                    待审核
                  </el-tag>
                  <el-tag type="success" v-show="form.secondState === 1">
                    已审核
                  </el-tag>
                  <el-tag type="danger" v-show="form.secondState === 2">
                    已驳回
                  </el-tag>
                </el-col>
                <el-col :span="6">
                  <span>审核人: {{ form.secondPerson }}</span>
                </el-col>
              </el-row>
              <el-card shadow="nerver" v-if="form.secondState !== 0">
                <template v-if="form.secondState === 1 && form.systemRemark">
                  备注： {{ form.systemRemark }}
                </template>
                <template v-if="form.secondState === 2 && form.finalResult">
                  <span class="text-red">拒绝原因：</span>
                  {{ form.finalResult }}
                </template>
              </el-card>
            </div>
          </el-card>
        </el-form>
      </el-col>
      <el-col :xs="0" :span="2"></el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["classifyList", "involveUnitList", "deptOptions"],
  data() {
    return {
      dialogVisible: false,
      // 表单参数
      form: {
        isShow: 0,
      },
      // 会审人员
      TriageList: {
        2: "采购",
        3: "品质",
        4: "生产",
        5: "工程",
        6: "研发",
        7: "仓库",
        8: "市场",
        9: "PMC",
      },
      TriageListTitle: {
        2: "在途物料处理方案",
        3: "涉及更新的文件",
        4: "在制产品处理方案",
        5: "涉及更新的文件",
        6: "涉及更新的文件",
        7: "在库物料处理方案",
        8: "已出货产品处理方案",
        9: "工单内容",
      },
    };
  },
  computed: {
    reqUnitFormatter() {
      return (reqUnit) => {
        return this.deptOptions.find((item) => item.deptId === +reqUnit)
          ?.deptName;
      };
    },
  },
};
</script>