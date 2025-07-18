<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    :width="isDigWidth"
    append-to-body
    top="-5vh"
    center
  >
    <el-form ref="form" :model="form" :rules="rules" label-position="top">
      <template v-if="!isBatchSync">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品类" prop="categoryId">
              <el-select
                :disabled="form.id ? true : false"
                v-model="form.categoryId"
                clearable
                class="w100"
              >
                <el-option
                  v-for="dict in dictList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="属性" prop="type">
              <el-select
                v-model="form.type"
                clearable
                size="small"
                disabled
                @change="$forceUpdate()"
                class="w100"
              >
                <el-option
                  v-for="dict in fileTypeList"
                  :key="dict.key"
                  :label="dict.value"
                  :value="dict.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="送样单号" prop="number">
              <select-loadMore
                v-model="form.number"
                disabled
                :data="sampleNumberData.data"
                :page="sampleNumberData.page"
                :hasMore="sampleNumberData.more"
                :request="getSampleNumberList"
                placeholder="请选择送样单号"
                class="w100"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户" prop="customerName">
              <el-autocomplete
                v-model="form.customerName"
                disabled
                clearable
                :fetch-suggestions="querySearchAsync"
                placeholder="请选择客户"
                class="w100"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- <el-row :gutter="0">
					<el-col>
						<el-form-item label="数据类型" prop="dataType">
							<el-radio-group v-model="form.dataType" size="small">
								<el-radio :label="0" border>STS程序</el-radio>
								<el-radio :label="1" border>PC上位机</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row> -->

        <!-- <template v-if="form.dataType === 0">
					<el-form-item label="芯片版本" prop="configExtend.schemeVersion">
						<el-select v-model="form.configExtend.schemeVersion" clearable size="mini">
							<el-option v-for="(dict, index) in cidOptions" :key="index" :label="dict.dictLabel"
								:value="dict.dictLabel" />
						</el-select>
					</el-form-item>
					<el-form-item label="测试协议" prop="configExtend.agreementVersion">
						<el-select v-model="form.configExtend.agreementVersion" clearable size="mini">
							<el-option v-for="(dict, index) in testAgreementList" :key="index" :label="dict.dictLabel"
								:value="dict.dictLabel" />
						</el-select>
					</el-form-item>
					<el-form-item label="PCBA SN格式" prop="configExtend.pcbaSn">
						<el-input v-model="form.configExtend.pcbaSn" clearable placeholder="请输入PCBA SN格式" />
					</el-form-item>
					<el-row>
						<el-col>
							<el-form-item label="测试项目" prop="configExtend.testInfo" style="width: 100%;">
								<el-card shadow="nerver">
									<el-checkbox-group v-model="form.configExtend.testInfo">
										<el-checkbox v-for="(dict, index) in testProjectList" :label="dict.dictValue"
											:key="index">
											{{ dict.dictLabel }}
										</el-checkbox>
									</el-checkbox-group>
								</el-card>
							</el-form-item>
						</el-col>
					</el-row>
				</template>
				 -->
        <!-- <template v-if="form.dataType === 1"> -->

        <!-- 模拟脚本 -->
        <template v-if="form.type === 'simulate_script_file'">
          <el-form-item
            label="模拟脚本"
            prop="content"
            :rules="[
              {
                required: true,
                message: '请选择模拟脚本',
                trigger: 'change',
              },
            ]"
          >
            <select-loadMore
              v-model="form.content"
              :data="simulateScriptData.data"
              :page="simulateScriptData.page"
              :hasMore="simulateScriptData.more"
              :moreParams="true"
              dictLabel="agreementName"
              dictValue="agreementName"
              :request="getSimulateScriptList"
              @getChange="getSimulateScript"
              placeholder="请选择模拟脚本文件"
              style="width: 100%"
              v-slot="{ proOption }"
            >
              <template>
                <el-row type="flex" justify="between">
                  <el-col :span="8">
                    <span>
                      <b>协议名称：</b>{{ proOption.agreementName }}
                    </span>
                  </el-col>
                  <el-col :span="8">
                    <span>
                      <b>协议版本：</b>{{ proOption.agreementVersion }}
                    </span>
                  </el-col>
                  <el-col :span="8">
                    <span> <b>备注：</b>{{ proOption.remark }} </span>
                  </el-col>
                </el-row>
              </template>
            </select-loadMore>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="属性描述" prop="content" :required="isHaveTo">
            <template v-if="form.type === 'hard_version'">
              <select-loadMore
                style="width: 100%"
                v-model="form.content"
                :data="hardData.data"
                :page="hardData.page"
                :hasMore="hardData.more"
                dictLabel="name"
                dictValue="name"
                :request="getHardList"
                placeholder="请选择硬件版本号"
              />
            </template>
            <template v-else>
              <el-input
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 8 }"
                v-model="form.content"
                placeholder="请输入文件描述"
              />
            </template>
          </el-form-item>
          <el-form-item
            label="文件"
            prop="url"
            v-if="form.up == 1"
            style="width: 100%"
          >
            <DrUpload
              :limit="1"
              v-model="form.url"
              :css="{ width: '100%' }"
              :isOnePic="1"
            >
              <div>
                <el-button size="small" type="primary">点击上传</el-button>
              </div>
            </DrUpload>
          </el-form-item>
        </template>
        <!-- </template> -->
      </template>

      <!-- 新增字段 -->
      <template v-if="!isBatchSync && boleConfig">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="烧录的文件名">
              <el-input
                v-model="form.firmwareConf.name"
                clearable
                placeholder="请输入烧录的文件名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label=" 厂商">
              <el-select
                v-model.number="form.firmwareConf.mid"
                @change="changeMidValue"
                clearable
                class="w100"
              >
                <el-option
                  v-for="dict in midOptions"
                  :key="dict.key"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="芯片系列">
              <el-select
                v-model.number="form.firmwareConf.cid"
                @change="changeCidValue"
                clearable
                class="w100"
              >
                <el-option
                  v-for="(dict, index) in splitCidOptions"
                  :key="index"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址位置">
              <el-input
                type="number"
                clearable
                v-model="form.firmwareConf.addr"
                placeholder="请输入烧录到芯片中的首地址位置 "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="烧录方式">
              <el-select
                v-model.number="form.firmwareConf.type"
                clearable
                class="w100"
              >
                <el-option
                  v-for="(dict, index) in typeOptions"
                  :key="index"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="烧录电压选择">
              <el-select
                v-model.number="form.firmwareConf.voltage"
                clearable
                class="w100"
              >
                <el-option
                  v-for="(dict, index) in voltageOptions"
                  :key="index"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可烧录次数">
              <el-input
                type="number"
                clearable
                v-model="form.firmwareConf.bs"
                placeholder="请输入表示可烧录次数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="否上电自动烧录">
              <el-radio-group v-model="form.firmwareConf.auto">
                <el-radio-button :label="0">自动烧录</el-radio-button>
                <el-radio-button :label="1">不自动烧录</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计算余剩可烧录次">
              <el-radio-group v-model="form.firmwareConf.burnOnOff">
                <el-radio-button :label="0"> 计算</el-radio-button>
                <el-radio-button :label="1">不计算 </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否校验">
              <el-radio-group v-model="form.firmwareConf.check">
                <el-radio-button :label="0"> 校验</el-radio-button>
                <el-radio-button :label="1">不校验 </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="擦除配置">
              <el-radio-group v-model="form.firmwareConf.erase">
                <el-radio-button :label="0"> 擦除全片</el-radio-button>
                <el-radio-button :label="1">擦除烧写部分</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="擦除配置">
              <el-radio-group v-model="form.firmwareConf.protect">
                <el-radio-button :label="0">
                  烧录后打开读写保护
                </el-radio-button>
                <el-radio-button :label="1"
                  >录后不打开读写保护
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="烧录完成重启程序">
              <el-radio-group v-model="form.firmwareConf.reset">
                <el-radio-button :label="0"> 重启运行</el-radio-button>
                <el-radio-button :label="1">不重启运行 </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label=" 烧录速度">
              <el-radio-group v-model="form.firmwareConf.speed">
                <el-radio-button :label="0"> 高速</el-radio-button>
                <el-radio-button :label="1">低速 </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <!-- <el-form-item label="仪表型号" v-if="isBatchSync" style="width: 100%" label-width="100px"
				:required="isHaveBatchSync" prop="idList">
				<el-select ref="select" v-model="form.idList" multiple placeholder="" class="similar-style"
					style="width: 100%">
					<el-option :disabled="disabledName == dict.computer" v-for="dict in similarList" :key="dict.id"
						:label="dict.computer" :value="dict.id">
					</el-option>
				</el-select>
			</el-form-item> -->
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
  addFileConfig,
  sampleSofteConfig,
  resetBatchSync,
} from "@/api/third/fileConfig";
import { sampleNumberList, listCustomer } from "@/api/third/sample";
import { scriptList } from "@/api/third/simulateScript";
import { listComputer } from "@/api/third/version";

export default {
  props: ["dictList"],
  data() {
    const validateContent = (rule, value, callback) => {
      if (!value && this.isHaveTo) {
        return callback(new Error("硬件版本号不能为空"));
      } else {
        callback();
      }
    };
    const validateIdList = (rule, value, callback) => {
      if (!value.length && this.isHaveBatchSync) {
        return callback(new Error("仪表型号不能为空"));
      } else {
        callback();
      }
    };
    return {
      boleConfig: false,
      dialogVisible: false,
      isLoading: false,
      // 批量同步
      isBatchSync: false,
      fileTypeList: [],
      // similarList: [],
      // 芯片版本
      schemeVersionList: [],
      // 测试协议
      testAgreementList: [],
      // 测试项目
      testProjectList: [],
      // 表单参数
      form: {
        url: "",
        testInfo: [],
      },
      title: "",
      sampleNumberData: {
        data: [],
        page: 1,
        more: true,
      },
      simulateScriptData: {
        data: [],
        page: 1,
        more: true,
      },
      // 表单校验
      rules: {
        computerModel: [
          {
            required: true,
            message: "所属仪表不能为空",
            trigger: "blur",
          },
        ],
        type: [
          {
            required: true,
            message: "文件类型不能为空",
            trigger: "blur",
          },
        ],
        dataType: [
          {
            required: true,
            message: "数据类型不能为空",
            trigger: "change",
          },
        ],
        "configExtend.schemeVersion": [
          {
            required: true,
            message: "芯片版本不能为空",
            trigger: "change",
          },
        ],
        "configExtend.agreementVersion": [
          {
            required: true,
            message: "测试协议不能为空",
            trigger: "change",
          },
        ],
        "configExtend.pcbaSn": [
          {
            required: true,
            message: "PCBA SN格式不能为空",
            trigger: "blur",
          },
        ],
        "configExtend.testInfo": [
          {
            required: true,
            message: "测试项目不能为空",
            trigger: "change",
          },
        ],
        content: [
          {
            validator: validateContent,
            trigger: "blur",
          },
        ],
        idList: [
          {
            type: "array",
            validator: validateIdList,
            trigger: "change",
          },
        ],
        url: [
          {
            required: true,
            message: "请上传文件",
            trigger: "change",
          },
        ],
      },
      cidOptions: [],
      splitCidOptions: [],
      typeOptions: [],
      voltageOptions: [],
      midOptions: [],
      disabledName: "",
      hardData: {
        data: [],
        page: 1,
        more: true,
      },
    };
  },
  computed: {
    isHaveTo() {
      return this.form.type === "hard_version";
    },
    isHaveBatchSync() {
      return this.isBatchSync;
    },
    isDigWidth() {
      if (this.isBatchSync) {
        return "450px";
      } else {
        if (this.boleConfig) {
          return "980px";
        } else {
          return "780px";
        }
      }
    },
  },
  watch: {
    "form.url"(url) {
      if (url) {
        this.clearValidateItem("form", "url");
      }
    },
  },
  mounted() {
    this.getDicts("sys_file_cid").then((res) => {
      for (let key of res.data) {
        key.dictValue = Number(key.dictValue);
      }
      this.cidOptions = res.data;
    });
    this.getDicts("sys_file_type").then((res) => {
      for (let key of res.data) {
        key.dictValue = Number(key.dictValue);
      }
      this.typeOptions = res.data;
    });
    this.getDicts("sys_file_voltage").then((res) => {
      for (let key of res.data) {
        key.dictValue = Number(key.dictValue);
      }
      this.voltageOptions = res.data;
    });
    this.getDicts("sys_file_mid").then((res) => {
      for (let key of res.data) {
        key.dictValue = Number(key.dictValue);
      }
      this.midOptions = res.data;
    });
    this.getDicts("sys_test_agreement").then((res) => {
      this.testAgreementList = res.data;
    });
    this.getDicts("sys_test_project").then((res) => {
      this.testProjectList = res.data;
    });
  },
  methods: {
    querySearchAsync(queryString, cb) {
      listCustomer({ key: queryString || "" }).then((res) => {
        cb(
          res.data.map((item) => {
            return {
              value: item.name,
            };
          })
        );
      });
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
    // 模拟脚本
    getSimulateScriptList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        scriptList({
          p: page,
          agreementName: keyword,
          status: 0,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.simulateScriptData.data = [
              ...this.simulateScriptData.data,
              ...list,
            ];
          } else {
            this.simulateScriptData.data = list;
          }
          this.simulateScriptData.more = pageNum * pageSize < total;
          this.simulateScriptData.page = pageNum;
          resolve();
        });
      });
    },
    getSimulateScript(info) {
      if (!info) {
        this.form.webVersion = "";
        return;
      }
      const { agreementName, agreementVersion, id, file } = JSON.parse(info);
      this.form.url = id;
      this.form.content = `${agreementName} - ${agreementVersion}`;
      this.form.file = file;
    },
    // 表单重置
    reset() {
      this.form = {
        url: "",
        testInfo: [],
      };
      this.resetForm("form");
    },
    changeMidValue(val, isChange) {
      let arr = [];
      for (let key of this.cidOptions) {
        let parentId = key.dictLabel.slice(0, 1);
        if (parentId == Number(val)) {
          let obj = Object.assign({}, key);
          obj.dictLabel = key.dictLabel.slice(2);
          arr.push({
            dictValue: obj.dictValue,
            dictLabel: obj.dictLabel,
          });
        }
      }

      this.splitCidOptions = Object.assign({}, arr);
      if (isChange == undefined) {
        this.form.firmwareConf.cid = "";
      }
    },
    changeCidValue(val) {
      this.$forceUpdate();
    },
    /** 订单号列表 */
    getHardList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        listComputer({
          p: page,
          key: this.form.categoryId,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.hardData.data = [...this.orderData.data, ...list];
          } else {
            this.hardData.data = list;
          }
          this.hardData.more = pageNum * pageSize < total;
          this.hardData.page = pageNum;
          resolve();
        });
      });
    },
    getHardNo(info) {
      if (!info) {
        this.form.hardNo = "";
        this.form.hardName = "";
        return;
      }
      const { id, name } = JSON.parse(info);
      this.form.hardNo = id;
      this.form.hardName = name;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isLoading = true;
          this.form.status = 0;
          // if (this.form.dataType === 0) {
          // 	this.form.configExtend.testInfo = this.form.configExtend.testInfo.join()
          // } else {
          // 	this.form.configExtend.testInfo = ''
          // }
          if (this.form.id) {
            delete this.form.createTime;
            delete this.form.updateTime;
            delete this.form.updateBy;
            delete this.form.updateTime;
            let fn = this.isBatchSync ? resetBatchSync : sampleSofteConfig;
            fn(this.form)
              .then((response) => {
                if (response.code === 200) {
                  const title = this.isBatchSync ? "批量同步成功" : "修改成功";
                  this.msgSuccess(title);
                  this.dialogVisible = false;
                  this.$parent.getList();
                }
              })
              .finally(() => {
                this.isLoading = false;
              });
          } else {
            addFileConfig(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
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

<style lang="scss" scope>
.style-upload {
  .el-upload-dragger {
    width: 100%;
  }
}

.similar-style {
  .el-select__tags {
    cursor: pointer;

    &::after {
      font-family: "element-icons" !important;
      speak: none;
      font-style: normal;
      font-weight: normal;
      font-variant: normal;
      text-transform: none;
      line-height: 1;
      vertical-align: baseline;
      content: "\e7a0";
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      background: #0098f7;
      margin-left: 6px;
      width: 50px;
      color: #fff;
      border-radius: 4px;
    }
  }

  .el-input__suffix {
    display: none;
  }
}
</style>