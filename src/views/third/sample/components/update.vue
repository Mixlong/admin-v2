<template>
  <el-dialog class="update_sample" :top="showName ? '5vh' : '35vh'" :close-on-click-modal="true" :title="title"
    :visible.sync="dialogVisible" append-to-body :width="dialogWidth">
    <el-form :class="{ 'row-label-style': showName && showName !== 'isVersion' }" ref="form" :model="form" :rules="rules"
      label-width="110px">
      <el-row>
        <el-col :span="showName ? 24 : 5">
          <el-form-item label="客户" prop="customerName" label-width="82px" v-if="!showName || showName == 'customerName'">
            <el-input v-model="form.customerName" placeholder="请输入客户名称" />
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item label="产品品类" prop="baseModel" v-if="!showName || showName == 'baseModel'">
            <el-select v-model="form.baseModel" :disabled="isDisabled" multiple collapse-tags placeholder="请选择产品品类"
              style="width: 100%">
              <el-option v-for="item in modelList" :key="item.name" :label="item.name" :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 5">
          <el-form-item :label="showName ? '' : '计划送样时间'" prop="sendTime" v-if="!showName || showName == 'sendTime'">
            <el-date-picker ref="datePicker" v-model="form.sendTime" type="date" placeholder="选择日期时间" format="yyyy-MM-dd"
              value-format="yyyy-MM-dd" style="width: 100%">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 8">
          <el-form-item label="送样单号" prop="number" v-if="!showName || showName == 'number'">
            <select-loadMore style="width: 262px;" v-model="form.number" :disabled="isDisabled" :data="sampleNumberData.data"
              :page="sampleNumberData.page" :hasMore="sampleNumberData.more" :request="getSampleNumberList"
              placeholder="请选择送样单号" />
            <!-- <el-button style="margin-left: 8px;" type="primary" :disabled="isDisabled" :loading="isCreateNumber"
              @click="onCreateSampleNumber">
              生成
            </el-button> -->
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="showName ? 24 : 5">
          <el-form-item label="数量" prop="sendNum" label-width="82px" v-if="!showName || showName == 'sendNum'">
            <el-input type="number" v-model="form.sendNum" clearable placeholder="请输入送样数量" />
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item label="下单时间" prop="orderTime" v-if="!showName || showName == 'orderTime'">
            <el-date-picker ref="datePicker" v-model="form.orderTime" type="date" placeholder="请选择下单时间"
              format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 100%">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 5">
          <el-form-item label="销售人员" prop="salesperson" v-if="!showName || showName == 'salesperson'">
            <el-select v-model="form.salesperson" placeholder="请选择销售人员" style="width: 100%">
              <el-option v-for="item in saleList" :key="item.userId" :label="item.userName" :value="item.userId">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 8">
          <el-form-item :label="showName ? '' : '实际送样时间'" label-width="120px" prop="actualTime" v-if="!isActural">
            <el-date-picker ref="datePicker" v-model="form.actualTime" type="date" placeholder="请选择实际送样时间"
              format="yyyy-MM-dd" value-format="yyyy-MM-dd" :style="actualTimeWith">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 添加版本号  -->
      <el-row style="margin: 0 30px" v-show="isShowVersion">
        <el-col :span="showName ? 24 : 6">
          <el-form-item label="硬件版本号" prop="harkVersion">
            <el-input v-model.trim="form.harkVersion" clearable placeholder="请输入硬件版本号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item label="Boot版本号" prop="bootVersion">
            <el-input v-model.trim="form.bootVersion" clearable placeholder="请输入Boot版本号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item label="APP版本号" prop="appVersion">
            <el-input v-model.trim="form.appVersion" clearable placeholder="请输入APP版本号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item label="UI版本号" prop="uiVersion">
            <el-input v-model.trim="form.uiVersion" clearable placeholder="请输入UI版本号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-card v-show="!showName" style="padding-top: 30px; margin: 0 30px 10px" class="step-wrap" shadow="hover">
        <el-steps :active="active" align-center finish-status="success">
          <el-step>
            <template slot="title">
              <div class="title-top">产品经理确认</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(1)"></div>
              </div>
              <el-form-item label="" prop="pm" label-width="0" v-if="!showName || showName == 'pm' || showName == 'step'">
                <el-select v-model="form.pm" placeholder="请选择" style="width: 100%">
                  <el-option v-for="(item, p) in roleList('product')" :key="p" :label="item.dictLabel"
                    :value="item.dictValue">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-top">SE确认</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(2)"></div>
              </div>
              <el-form-item label="" prop="se" label-width="0" v-if="!showName || showName == 'se' || showName == 'step'">
                <el-select v-model="form.se" placeholder="请选择" style="width: 100%">
                  <el-option v-for="(item, p) in roleList('SE')" :key="p" :label="item.dictLabel" :value="item.dictValue">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-top">样品加工</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(3)"></div>
              </div>
              <el-form-item label="" prop="follow" label-width="0"
                v-if="!showName || showName == 'follow' || showName == 'step'">
                <el-select v-model="form.follow" placeholder="请选择" style="width: 100%">
                  <el-option v-for="(item, index) in roleList('PS')" :key="index" :label="item.dictLabel"
                    :value="item.dictValue">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-top">测试</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(4)"></div>
              </div>
              <el-form-item label="" prop="test" label-width="0"
                v-if="!showName || showName == 'test' || showName == 'step'">
                <el-select v-model="form.test" placeholder="请选择" style="width: 100%">
                  <el-option v-for="(item, index) in roleList('test')" :key="index" :label="item.dictLabel"
                    :value="item.dictValue">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-top">销售</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(5)"></div>
              </div>
              <el-form-item label="" prop="sell" label-width="0"
                v-if="!showName || showName == 'sell' || showName == 'step'">
                <el-select v-model="form.sell" placeholder="请选择" style="width: 100%">
                  <el-option v-for="(item, p) in roleList('sale')" :key="p" :label="item.dictLabel"
                    :value="item.dictValue">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-top">完成</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(6)"></div>
              </div>
            </template>
          </el-step>
        </el-steps>
      </el-card>

      <el-card v-show="showName == 'step'" style="padding-top: 30px; margin: 0 30px 10px" class="step-wrap"
        shadow="hover">
        <el-steps :active="active" :class="{ stepCards: showName == 'step' }" :space="80" direction="vertical"
          finish-status="success">
          <el-step>
            <template slot="title">
              <div class="title-txt title-txt1" @click="stateChange(1)">
                产品经理确认
              </div>
              <div class="flex justify-between">
                <el-select v-if="!showName || showName == 'pm' || showName == 'step'" v-model="form.pm" placeholder="请选择"
                  style="width: 100px; margin-left: 20px">
                  <el-option v-for="(item, p) in roleList('product')" :key="p" :label="item.dictLabel"
                    :value="item.dictValue">
                  </el-option>
                </el-select>
                <div class="fz-red">
                  确认客户需求是否在产品已有规格或允许定制范围内
                </div>
              </div>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-txt title-txt2" @click="stateChange(2)">
                SE确认
              </div>
              <div class="flex justify-between">
                <el-select v-if="!showName || showName == 'se' || showName == 'step'" v-model="form.se" placeholder="请选择"
                  style="width: 100px; margin-left: 20px">
                  <el-option v-for="(item, p) in roleList('SE')" :key="p" :label="item.dictLabel" :value="item.dictValue">
                  </el-option>
                </el-select>
                <div class="fz-red">
                  确认客户需求是否技术可行，以及是否存在质量和供应风险
                </div>
              </div>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-txt title-txt3" @click="stateChange(3)">
                样品加工
              </div>
              <div class="flex justify-between">
                <el-select v-if="!showName || showName == 'follow' || showName == 'step'" v-model="form.follow"
                  placeholder="请选择" style="width: 100px; margin-left: 20px">
                  <el-option v-for="(item, index) in roleList('PS')" :key="index" :label="item.dictLabel"
                    :value="item.dictValue">
                  </el-option>
                </el-select>
                <div class="fz-red">
                  根据客户需求和产品设计方案，按照与量产相同的工艺流程进行加工
                </div>
              </div>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-txt title-txt4" @click="stateChange(4)">
                测试
              </div>
              <div class="flex justify-between">
                <el-select v-if="!showName || showName == 'test' || showName == 'step'" v-model="form.test"
                  placeholder="请选择" style="width: 100px; margin-left: 20px">
                  <el-option v-for="(item, index) in roleList('test')" :key="index" :label="item.dictLabel"
                    :value="item.dictValue">
                  </el-option>
                </el-select>
                <div class="fz-red">
                  根据产品测试用例、客户需求，对样品的功能、可靠性进行全面测试
                </div>
              </div>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-txt title-txt5" @click="stateChange(5)">
                销售
              </div>
              <div class="flex justify-between">
                <el-select v-if="!showName || showName == 'sell' || showName == 'step'" v-model="form.sell"
                  placeholder="请选择" style="width: 100px; margin-left: 20px">
                  <el-option v-for="(item, p) in roleList('sale')" :key="p" :label="item.dictLabel"
                    :value="item.dictValue">
                  </el-option>
                </el-select>
                <div class="fz-red">
                  销售人员以客户需求为依据，对样品组交付的样品进行型号、数量、配置‘功能、外观等方面验收
                </div>
              </div>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-txt title-txt6" @click="stateChange(6)">
                完成
              </div>
            </template>
          </el-step>
        </el-steps>
      </el-card>

      <el-form-item label="当前进展" label-width="55px" prop="progress"
        :style="{ width: '100%', maxHeight: !showName ? '326px' : 'auto' }" v-if="showName == 'progress'"
        :class="{ 'style-reset': !showName }">
        <tinymce v-if="dialogVisible" v-model="form.progress" placeholder="请输入"
          :height="showName === 'progress' ? 650 : 150" />
      </el-form-item>
      <el-form-item prop="detailCover" label="需求表：" v-if="!showName">
        <el-upload-sortable 
          v-model="form.checklist" 
          :action="actionUrl" 
          :imgW="98" 
          :imgH="98"
        />      
      </el-form-item>
      <el-form-item label="评审表：" v-if="!showName">
        <el-upload-sortable 
          v-model="form.reviewer" 
          :action="actionUrl" 
          :imgW="98" 
          :imgH="98"
        />        
      </el-form-item>
      <el-form-item label="详细需求" label-width="0" prop="demand"
        :style="{ width: '100%', maxHeight: !showName ? '526px' : 'auto' }" v-if="!showName || showName == 'demand'"
        class="padding-lr" :class="{ 'style-reset': !showName }">
        <tinymce v-if="dialogVisible" v-model="form.demand" placeholder="请输入" :height="showName === 'demand' ? 650 : 350">
        </tinymce>
      </el-form-item>
      <el-form-item label-width="0" prop="configVersion" class="padding-lr" v-if="!showName || showName == 'attachment'">
        <DrUpload v-model="form.attachment" :limit="1" :isOnePic="1">
          <div class="text-left">
            <el-button size="small" type="primary">附件上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :loading="isLoading" v-show="showName !== 'step'" type="primary" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { sampleAdd, sampleUpdate, sampleNumberList, sampleNumber } from "@/api/third/sample";
import tinymce from "@/views/components/Editor";
import { typeCategory } from "@/api/third/category";
import { dictUserList } from "@/api/third/isType";
import ElUploadSortable from "@/components/el-upload-sortable";
import reqUrl from "@/utils/requestUrl";

export default {
  props: ["pmDictListOptions"],
  components: {
    tinymce,
    ElUploadSortable
  },
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      isCreateNumber: false,
      isLoading: false,
      isCopyFlag: false,
      isActural: true,
      isType: null,
      isTop: false,
      dialogVisible: false,
      showName: "",
      modelList: [],
      saleList: [],
      // 表单参数
      form: {},
      title: "",
      sampleNumberData: {
        data: [],
        page: 1,
        more: true
      },
      // 表单校验
      rules: {
        customerName: [
          { required: true, message: "请输入客户名称", trigger: "blur" },
        ],
        baseModel: [
          { required: true, message: "请选择产品品类", trigger: "change" },
        ],
        sendTime: [
          { required: true, message: "请选择送样时间", trigger: "change" },
        ],
        // number: [
        //   { required: true, message: "请选择送样单号", trigger: "change" },
        // ],
        actualTime: [
          { required: false, message: "请选择实际送样时间", trigger: "change" },
        ],
        sendNum: [
          { required: true, message: "请输入送样数量", trigger: "blur" },
        ],
        orderTime: [
          { required: true, message: "请选择下单时间", trigger: "change" },
        ],
        salesperson: [
          { required: true, message: "请选择销售人员", trigger: "change" },
        ],
        follow: [{ required: true, message: "请选择", trigger: "change" }],
        pm: [{ required: true, message: "请选择", trigger: "change" }],
        se: [{ required: true, message: "请选择", trigger: "change" }],
        test: [{ required: true, message: "请选择", trigger: "change" }],
        sell: [{ required: true, message: "请选择", trigger: "change" }],
        harkVersion: [
          { required: true, message: "请输入硬件版本号", trigger: "blur" },
        ],
        bootVersion: [
          { required: false, message: "请输入Boot版本号", trigger: "blur" },
        ],
        appVersion: [
          { required: false, message: "请输入APP版本号", trigger: "blur" },
        ],
        uiVersion: [
          { required: false, message: "请输入UI版本号", trigger: "blur" },
        ],
      },
      active: -1,
    };
  },
  computed: {
    isDisabled() {
      return !!this.form.id && !this.isCopyFlag;
    },
    dialogWidth() {
      switch (this.showName) {
        case "demand":
        case "progress":
          return "800px";
        case "step":
          return "730px";
        case "sendTime":
        case "actualTime":
        case "isVersion":
          return "400px";
        default:
          return "1200px";
      }
    },
    actualTimeWith() {
      if (this.isType === 6) {
        return {
          width: "100%",
        };
      } else {
        return {
          width: "237px",
        };
      }
    },
    /* 
      版本输入是否展示
    */
    isShowVersion() {
      return (
        this.showName === "isVersion" ||
        (this.showName !== "demand" &&
          this.showName !== "progress" &&
          this.showName !== "step" &&
          this.showName !== "sendTime" &&
          this.showName !== "actualTime") ||
        this.isType === 4
      );
    },
    // 角色
    roleList() {
      return (roleKey) => {
        return this.pmDictListOptions.filter(
          (item) => item.roleKey === roleKey
        );
      };
    },
  },
  watch: {
    form(val) {
      if (val) {
        this.active = val.state;
      }
    },
    active(num) {
      if (num >= 4) {
        this.rules.bootVersion[0].required = true;
        this.rules.appVersion[0].required = true;
        this.rules.uiVersion[0].required = true;
      } else {
        this.rules.bootVersion[0].required = false;
        this.rules.appVersion[0].required = false;
        this.rules.uiVersion[0].required = false;
      }
    },
  },
  mounted() {
    this.getDictUserList();
    typeCategory().then((res) => {
      this.modelList = res.data;
    });
  },
  methods: {
    async onCreateSampleNumber() {
      this.isCreateNumber = true;
      const { data } = await sampleNumber();
      this.isCreateNumber = false;
      this.form.number = data;
    },
    getSampleNumberList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        sampleNumberList({
          p: page,
          num: keyword,
        }).then((res) => {
          let { list, total, pageNum, pageSize } = res.data;
          if (list.length) {
            list = list.map(item => {
              return {
                label: item,
                value: item
              }
            })
          }
          if (more) {
            this.sampleNumberData.data = [...this.sampleNumberData.data, ...list];
          } else {
            this.sampleNumberData.data = list;
          }
          this.sampleNumberData.more = pageNum * pageSize < total;
          this.sampleNumberData.page = pageNum;
          resolve();
        });
      });
    },
    getDictUserList() {
      dictUserList().then((res) => {
        this.saleList = res.data.filter((item) => item.roleKey === "sale");
      });
    },
    datePickerFocus() {
      this.$nextTick(() => {
        this.$refs.datePicker.focus();
      });
    },
    // 表单重置
    reset() {
      this.form = {
        url: ""
      };
      this.resetForm("form");
    },
    stateChange(data) {
      data = data == 6 ? 6 : data;
      if (this.form.id) {
        this.active =
          data == this.active ? (data == 7 ? data - 2 : data - 1) : data;
        if (this.showName === "step") {
          this.submitForm();
          this.dialogVisible = false;
        }
      }
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        let params = Object.assign({}, this.form);
        console.log("params", params)
        params.baseModel = this.form.baseModel.toString();
        if (valid) {
          this.isLoading = true;
          if (params.id && !this.isCopyFlag) {
            params.state = this.active;
            if (this.showName === "isVersion") {
              params.state = 4;
            }
            if (this.showName === "actualTime") {
              params.state = 6;
            }
            sampleUpdate(params).then((response) => {
              if (response.code === 200) {
                if (this.isType === 6) {
                  this.$parent.getSampleState(this.isParams);
                } else {
                  this.msgSuccess(
                    this.showName === "isVersion" ? "操作成功" : "修改成功"
                  );
                }
                this.dialogVisible = false;
                this.$parent.getList();
              }
            }).finally(() => {
              this.isLoading = false;
            })
          } else {
            if (this.isCopyFlag) {
              const { id, ...newParams } = params;
              params = newParams;
            }
            sampleAdd(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            }).finally(() => {
              this.isLoading = false;
            })
          }
        }
      });
    },
  },
};
</script>

<style lang="scss">
.style-reset {
  display: flex;
  flex-flow: column wrap;

  .el-form-item__label {
    white-space: nowrap;
    padding-left: 0;
  }
}

.step-wrap {
  .title-top {
    position: absolute;
    top: -38px;
    left: 0;
    width: 100%;
    height: 38px;
  }

  .wrap-click {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 24px;
    z-index: 10;
    cursor: pointer;
  }

  .el-step__description {
    padding-top: 15px;
  }
}

.update_sample {

  // .el-dialog {
  //   max-height: 800px;
  //   overflow: auto;
  // }
  .upload-img-box {
    .el-upload-list__item {
      width: 100px !important;
      height: 100px !important;
    }
  }
}

.stepCards {
  .el-step {
    .el-step__head {
      width: 108px !important;

      .el-step__icon {
        width: auto;
        min-width: 115px;
        min-height: 40px;
        white-space: nowrap;
        border-radius: 20px;
        padding: 10px;
        box-sizing: border-box;
      }

      .el-step__line {
        left: 50%;
        transform: translateX(-50%);
      }

      .el-step__icon-inner {
        display: none;
      }
    }

    .el-step__main {
      .title-txt {
        position: absolute;
        top: 0;
        z-index: 666;
        min-height: 40px;
        white-space: nowrap;
        border-radius: 20px;
        padding: 10px;
        box-sizing: border-box;
        cursor: pointer;
      }

      .title-txt1 {
        left: 0;
      }

      .title-txt2,
      .title-txt3 {
        left: 20px;
      }

      .title-txt4,
      .title-txt5,
      .title-txt6 {
        left: 30px;
      }
    }
  }

  .fz-red {
    color: #606266;
    width: 300px;
    font-size: 14px;
    font-weight: normal;
  }
}
</style>
