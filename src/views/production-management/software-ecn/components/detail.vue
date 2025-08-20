<template>
  <el-dialog class="ecn-detail-box Header_Fixed" title="ECN详情" :visible.sync="dialogVisible" append-to-body fullscreen
    top="2vh" center :close-on-click-modal="false">
    <el-row type="flex" justify="space-between">
      <el-col :xs="0" :span="2"></el-col>
      <el-col :xs="24" :span="20">
        <el-form ref="form" :model="form" label-width="90px" class="input-width" label-position="left">
          <el-row>
            <el-col :xs="24" :md="24" :lg="12">
              <el-form-item label="ECN编号:" prop="ecn">
                {{ form.ecn }}
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="24" :lg="12">
              <el-form-item label="品类:" prop="categoryName">
                {{ form.categoryName }}
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="24" :lg="12">
              <el-form-item label="型号:" prop="computerName">
                {{ form.computerName }}
              </el-form-item></el-col>
            <el-col :xs="24" :md="24" :lg="12">
              <el-form-item label="申请部门:" prop="reqUnit">
                {{ reqUnitFormatter(form.reqUnit) }}
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="分类:" prop="changeCause" class="flex align-center">
            <div class="flex" style="column-gap: 15px; margin-left: -90px">
              <el-tag v-for="(item, index) in form.changeCauseData" :key="index">
                {{ item.dictLabel }}
              </el-tag>
            </div>
          </el-form-item>

          <el-form-item label="涉及领域:" prop="involveUnit" class="flex align-center">
            <div class="flex" style="column-gap: 15px; margin-left: -90px">
              <el-tag>生产</el-tag>
              <el-tag>仓库</el-tag>
              <el-tag>市场</el-tag>
            </div>
          </el-form-item>

          <el-card shadow="never" class="margin-bottom">
            <div slot="header" class="clearfix">
              <span>变更内容</span>
            </div>
            <div style="min-height: 150px">
              {{ form.changeContent }}
            </div>
          </el-card>

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
            <div style="min-height: 50px" v-for="item in form.list" :key="item.id" class="margin-bottom-sm">
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
                <template v-if="form.secondState === 1 && form.finalRemark">
                  备注： {{ form.finalRemark }}
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
        4: "生产",
        7: "仓库",
        8: "市场",
      },
      TriageListTitle: {
        4: "在制产品处理方案",
        7: "在库物料处理方案",
        8: "已出货产品处理方案",
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