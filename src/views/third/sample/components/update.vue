<template>
  <el-dialog
    class="update_sample"
    :class="{ fixed_bottom_dialog: !isFixedDialig }"
    :top="showName ? '5vh' : '35vh'"
    :title="title"
    :visible.sync="dialogVisible"
    append-to-body
    center
    :width="dialogWidth"
    :close-on-click-modal="false"
    :fullscreen="!isFixedDialig"
  >
    <el-form ref="form" :model="form" :rules="rules" label-position="top">
      <el-row :gutter="15">
        <el-col :span="showName ? 24 : 6">
          <el-form-item
            label="客户"
            prop="customerName"
            label-width="82px"
            v-if="!showName || showName == 'customerName'"
          >
            <el-input
              v-model="form.customerName"
              placeholder="请输入客户名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item
            label="产品品类"
            prop="baseModel"
            v-if="!showName || showName == 'baseModel'"
          >
            <el-select
              v-model="form.baseModel"
              :disabled="isDisabled"
              multiple
              filterable
              allow-create
              placeholder="请选择产品品类"
              style="width: 100%"
            >
              <el-option
                v-for="item in modelList"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item
            :label="showName ? '' : '计划送样时间'"
            prop="sendTime"
            v-if="!showName || showName == 'sendTime'"
          >
            <el-date-picker
              ref="datePicker"
              v-model="form.sendTime"
              type="date"
              placeholder="选择日期时间"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item
            label="送样单号"
            prop="number"
            v-if="!showName || showName == 'number'"
          >
            <select-loadMore
              v-model="form.number"
              :disabled="isDisabled"
              :data="sampleNumberData.data"
              :page="sampleNumberData.page"
              :hasMore="sampleNumberData.more"
              :request="getSampleNumberList"
              placeholder="请选择送样单号"
              style="width: 100%"
            />
            <!-- <el-button style="margin-left: 8px;" type="primary" :disabled="isDisabled" :loading="isCreateNumber"
              @click="onCreateSampleNumber">
              生成
            </el-button> -->
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="15">
        <el-col :span="showName ? 24 : 6">
          <el-form-item
            label="数量"
            prop="sendNum"
            label-width="82px"
            v-if="!showName || showName == 'sendNum'"
          >
            <el-input
              type="number"
              v-model="form.sendNum"
              clearable
              placeholder="请输入送样数量"
            />
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item
            label="下单时间"
            prop="orderTime"
            v-if="!showName || showName == 'orderTime'"
          >
            <el-date-picker
              ref="datePicker"
              v-model="form.orderTime"
              type="date"
              placeholder="请选择下单时间"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item
            label="销售人员"
            prop="salesperson"
            v-if="!showName || showName == 'salesperson'"
          >
            <el-select
              v-model="form.salesperson"
              placeholder="请选择销售人员"
              style="width: 100%"
            >
              <el-option
                v-for="item in saleList"
                :key="item.userId"
                :label="item.userName"
                :value="item.userId"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item
            :label="showName ? '' : '实际送样时间'"
            prop="actualTime"
            v-if="!isActural"
          >
            <el-date-picker
              ref="datePicker"
              v-model="form.actualTime"
              type="date"
              placeholder="请选择实际送样时间"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 添加版本号  -->
      <el-row :gutter="15" v-show="isShowVersion">
        <el-col :span="showName ? 24 : 6">
          <el-form-item label="硬件版本号" prop="harkVersion">
            <el-input
              v-model.trim="form.harkVersion"
              clearable
              placeholder="请输入硬件版本号"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item label="Boot版本号" prop="bootVersion">
            <el-input
              v-model.trim="form.bootVersion"
              clearable
              placeholder="请输入Boot版本号"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item label="APP版本号" prop="appVersion">
            <el-input
              v-model.trim="form.appVersion"
              clearable
              placeholder="请输入APP版本号"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="showName ? 24 : 6">
          <el-form-item label="UI版本号" prop="uiVersion">
            <el-input
              v-model.trim="form.uiVersion"
              clearable
              placeholder="请输入UI版本号"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-card
        v-show="!showName"
        style="padding-top: 30px; margin: 0 0 10px"
        class="step-wrap"
        shadow="nerver"
      >
        <el-steps :active="active" align-center finish-status="success">
          <el-step>
            <template slot="title">
              <div class="title-top">需求确认中</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(1)"></div>
              </div>
              <!-- <el-form-item
                label=""
                prop="pm"
                label-width="0"
                v-if="!showName || showName == 'pm' || showName == 'step'"
              >
                <el-select
                  v-model="form.pm"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(item, p) in roleList('product')"
                    :key="p"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  >
                  </el-option>
                </el-select>
              </el-form-item> -->
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-top">软件开发中</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(2)"></div>
              </div>
              <!-- <el-form-item
                label=""
                prop="se"
                label-width="0"
                v-if="!showName || showName == 'se' || showName == 'step'"
              >
                <el-select
                  v-model="form.se"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(item, p) in roleList('SE')"
                    :key="p"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  >
                  </el-option>
                </el-select>
              </el-form-item> -->
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-top">测试中</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(3)"></div>
              </div>
              <!-- <el-form-item
                label=""
                prop="follow"
                label-width="0"
                v-if="!showName || showName == 'follow' || showName == 'step'"
              >
                <el-select
                  v-model="form.follow"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(item, index) in roleList('PS')"
                    :key="index"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  >
                  </el-option>
                </el-select>
              </el-form-item> -->
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-top">组装</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(4)"></div>
              </div>
              <!-- <el-form-item
                label=""
                prop="test"
                label-width="0"
                v-if="!showName || showName == 'test' || showName == 'step'"
              >
                <el-select
                  v-model="form.test"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(item, index) in roleList('test')"
                    :key="index"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  >
                  </el-option>
                </el-select>
              </el-form-item> -->
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-top">评审</div>
            </template>
            <template slot="description">
              <div>
                <div class="wrap-click" @click="stateChange(5)"></div>
              </div>
              <!-- <el-form-item
                label=""
                prop="sell"
                label-width="0"
                v-if="!showName || showName == 'sell' || showName == 'step'"
              >
                <el-select
                  v-model="form.sell"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(item, p) in roleList('sale')"
                    :key="p"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  >
                  </el-option>
                </el-select>
              </el-form-item> -->
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

      <el-card v-show="showName == 'step'" shadow="nerver" style="margin: 40px">
        <h4>流程状态管理</h4>
        <el-steps :active="active" finish-status="success" simple>
          <el-step
            class="pointer"
            v-for="item in auditProcessData"
            :key="item.value"
            :title="item.label"
            @click.native="stateChange(item.value)"
          >
          </el-step>
        </el-steps>

        <transition name="fade">
          <el-col :span="6" v-show="active === 6" class="margin-top">
            <h4>实际送样时间</h4>
            <el-form-item label="" prop="actualTime">
              <el-date-picker
                ref="datePicker"
                v-model="form.actualTime"
                type="date"
                placeholder="请选择实际送样时间"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </transition>
      </el-card>

      <el-form-item
        label="当前进展"
        label-width="55px"
        prop="progress"
        :style="{ width: '100%', maxHeight: !showName ? '326px' : 'auto' }"
        v-if="showName == 'progress'"
        :class="{ 'style-reset': !showName }"
      >
        <tinymce
          v-if="dialogVisible"
          v-model="form.progress"
          placeholder="请输入"
          :height="showName === 'progress' ? 650 : 150"
        />
      </el-form-item>
      <el-form-item prop="detailCover" label="需求表：" v-if="!showName">
        <el-upload-sortable
          v-model="form.checklist"
          :action="actionUrl"
          :imgW="80"
          :imgH="80"
        />
      </el-form-item>
      <el-form-item label="评审表：" v-if="!showName">
        <el-upload-sortable
          v-model="form.reviewer"
          :action="actionUrl"
          :imgW="80"
          :imgH="80"
        />
      </el-form-item>
      <el-form-item
        label="详细需求"
        prop="demand"
        :style="{ width: '100%', maxHeight: !showName ? '526px' : 'auto' }"
        v-if="!showName || showName == 'demand'"
        :class="{ 'style-reset': !showName }"
      >
        <tinymce
          v-if="dialogVisible"
          v-model="form.demand"
          placeholder="请输入"
          :height="showName === 'demand' ? 650 : 350"
        >
        </tinymce>
      </el-form-item>
      <el-form-item
        label-width="0"
        prop="configVersion"
        v-if="!showName || showName == 'attachment'"
      >
        <DrUpload v-model="form.attachment" :limit="1" :isOnePic="1">
          <div class="text-left">
            <el-button size="small" type="primary">附件上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button :loading="isLoading" type="primary" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  sampleAdd,
  sampleUpdate,
  sampleNumberList,
  sampleNumber,
} from "@/api/third/sample";
import tinymce from "@/views/components/Editor";
import { typeCategory } from "@/api/third/category";
import { dictUserList } from "@/api/third/isType";
import ElUploadSortable from "@/components/el-upload-sortable";
import reqUrl from "@/utils/requestUrl";

export default {
  props: ["pmDictListOptions"],
  components: {
    tinymce,
    ElUploadSortable,
  },
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      isCreateNumber: false,
      isLoading: false,
      isCopyFlag: false,
      isActural: true,
      isType: null,
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
        more: true,
      },
      // 表单校验
      rules: {
        customerName: [
          { required: true, message: "请输入客户名称", trigger: "blur" },
        ],
        baseModel: [
          {
            required: true,
            message: "请选择产品品类",
            trigger: ["change", "blur"],
          },
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
        // follow: [{ required: true, message: "请选择", trigger: "change" }],
        // pm: [{ required: true, message: "请选择", trigger: "change" }],
        // se: [{ required: true, message: "请选择", trigger: "change" }],
        // test: [{ required: true, message: "请选择", trigger: "change" }],
        // sell: [{ required: true, message: "请选择", trigger: "change" }],
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
      auditProcessData: [
        {
          label: "需求确认中",
          value: 1,
        },
        {
          label: "软件开发中",
          value: 2,
        },
        {
          label: "测试中",
          value: 3,
        },
        {
          label: "组装",
          value: 4,
        },
        {
          label: "评审",
          value: 5,
        },
        {
          label: "完成",
          value: 6,
        },
      ],
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
    isFixedDialig() {
      return ["actualTime", "sendTime", "isVersion"].includes(this.showName);
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
            list = list.map((item) => {
              return {
                label: item,
                value: item,
              };
            });
          }
          if (more) {
            this.sampleNumberData.data = [
              ...this.sampleNumberData.data,
              ...list,
            ];
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
        url: "",
        baseModel: [],
      };
      this.resetForm("form");
    },
    stateChange(data) {
      data = data == 6 ? 6 : data;
      if (this.form.id) {
        this.active =
          data == this.active ? (data == 7 ? data - 2 : data - 1) : data;
      }
    },
    /** 提交按钮 */
    submitForm: function (isCloseDialog = true) {
      this.$refs["form"].validate((valid) => {
        let params = Object.assign({}, this.form);

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
            sampleUpdate(params)
              .then((response) => {
                if (response.code === 200) {
                  if (this.isType === 6) {
                    this.$parent.getSampleState(this.isParams);
                  } else {
                    this.msgSuccess(
                      this.showName === "isVersion" ? "操作成功" : "修改成功"
                    );
                  }
                  isCloseDialog && (this.dialogVisible = false);
                  this.$parent.getList();
                }
              })
              .finally(() => {
                this.isLoading = false;
              });
          } else {
            if (this.isCopyFlag) {
              const { id, ...newParams } = params;
              params = newParams;
            }
            sampleAdd(params)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("新增成功");
                  this.dialogVisible = false;
                  this.$parent.getList();
                }
              })
              .finally(() => {
                this.isLoading = false;
              });
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
</style>
