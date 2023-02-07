<template>
  <!--   -->
  <el-dialog :title="title" :visible.sync="dialogVisible" width="920px" append-to-body top="2vh"
    :close-on-click-modal="false">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px"
      :class="{ 'row-label-style': showName == 'progress' }">
      <el-row :gutter="50">
        <el-col :span="12">
          <el-form-item label="品类" prop="product" v-if="!showName">
            <el-select @change="onResetModel" filterable allow-create clearable v-model="form.product"
              style="width: 100%" placeholder="请选择品类">
              <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.name" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仪表型号" prop="model" v-if="!showName">
            <el-select :loading="isCLoading" @focus="changeCategory" filterable remote clearable style="width: 100%"
              v-model="form.model" placeholder="请选择仪表型号" :remote-method="getComputerNameList">
              <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.name" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户" prop="customer" v-if="!showName">
            <el-autocomplete clearable v-model="form.customer" style="width: 100%" :fetch-suggestions="querySearchAsync"
              placeholder="请选择客户"></el-autocomplete>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="责任人:" prop="principal" v-if="!showName">
            <el-select v-model="form.principal" placeholder="请选择" clearable style="width: 100%">
              <el-option v-for="(item, index) in pmDictListOptions" :key="index" :label="item.dictLabel"
                :value="item.dictValue">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户车型" prop="customerBikeModel" v-if="!showName">
            <el-input v-model="form.customerBikeModel" placeholder="请输入客户车型" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="不良类型:" prop="errorType" v-if="!showName">
            <div class="flex">
              <el-select v-model="form.errorType" placeholder="请选择" clearable filterable allow-create
                style="width: 100%">
                <el-option v-for="(item, index) in errorTypeList" :key="index" :label="item.dictLabel"
                  :value="item.dictLabel">
                </el-option>
              </el-select>
              <el-button class="margin-left-xs" type="primary" @click="isErrorType = true" icon="el-icon-plus">
              </el-button>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数量:" prop="num" v-if="!showName">
            <el-input v-model.number="form.num" placeholder="请输入数量" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产品SN:" prop="sn" v-if="!showName">
            <el-input v-model.trim="form.sn" placeholder="请输入产品SN （多个则以逗号隔开）" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="期望解决时间:" prop="expectTime" v-if="!showName">
            <el-date-picker v-model="form.expectTime" style="width: 100%" value-format="timestamp" type="date">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实际解决时间:" prop="actualTime" v-if="!showName">
            <el-date-picker v-model="form.actualTime" style="width: 100%" value-format="timestamp" type="date">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item label="现象&影响" prop="description" v-if="!showName">
            <el-input type="textarea" v-model="form.description" :autosize="{ minRows: 6.5 }" placeholder="请输入"
              show-word-limit></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="定位进展" prop="progress" style="width: 100%" v-if="showName == 'progress'">
        <tinymce width="878px" v-if="dialogVisible" v-model="form.progress" placeholder="请输入定位进展" height="210">
        </tinymce>
      </el-form-item>
      <el-form-item label="" label-width="0" prop="progress" style="width: 100%" v-if="showName == 'report'">
        <tinymce width="878px" v-if="dialogVisible" v-model="form.report" height="210"></tinymce>
      </el-form-item>
      <el-form-item label="" prop="reportAttachment" v-if="showName == 'report'" style="width: 100%">
        <DrUpload v-model="form.reportAttachment" :isOnePic="1">
          <div class="text-left">
            <el-button size="small" type="primary">文件上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>
      <el-form-item label="附件" prop="attachment" v-if="!showName" style="width: 100%">
        <DrUpload v-model="form.attachment" :isOnePic="1">
          <div class="text-left">
            <el-button size="small" type="primary">点击上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>
      <el-form-item label="记录文件" prop="fileUrl" v-if="!showName" style="width: 100%">
        <DrUpload v-model="form.fileUrl" :isOnePic="1">
          <div class="text-left">
            <el-button size="small" type="primary">点击上传</el-button>
          </div>
        </DrUpload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :close-on-click-modal="false" title="新增不良类型" :visible.sync="isErrorType" width="500px" append-to-body>
      <el-form ref="dictForm" :model="dictForm" :rules="rules" label-width="80px">
        <el-form-item label="类型编码" prop="dictValue">
          <el-input v-model.trim="dictForm.dictValue" placeholder="请输入类型编码" />
        </el-form-item>
        <el-form-item label="类型名称" prop="dictLabel">
          <el-input v-model.trim="dictForm.dictLabel" placeholder="请输入类型名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDictForm">确 定</el-button>
        <el-button @click="isErrorType = false">取 消</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { saleAdd, saleUpdate } from "@/api/third/sale";
import { categoryNameList } from "@/api/third/fileConfig"
import { listCustomer } from "@/api/third/sample";
import tinymce from "@/views/components/Editor";
import { addData } from "@/api/system/dict/data";

export default {
  components: { tinymce },
  props: ["pmDictListOptions", "dictList"],
  data() {
    return {
      isErrorType: false,
      showName: "",
      dialogVisible: false,
      isReset: false,
      // 表单参数
      form: {
        model: null
      },
      dictForm: {},
      title: "",
      // 不良类型
      errorTypeList: [],
      product: null,
      isCLoading: false,
      // 仪表型号
      computerOptions: [],
      // 表单校验
      rules: {
        product: [{ required: true, message: "请选择品类", trigger: "change" }],
        model: [{ required: true, message: "请选择仪表型号", trigger: "change" }],
        customer: [{ required: true, message: "请输入客户", trigger: "change" }],
        expectedTime: [
          { required: true, message: "请选择期望解决时间", trigger: "blur" },
        ],
        principal: [
          { required: true, message: "请选择责任人", trigger: "blur" },
        ],
        dictLabel: [
          { required: true, message: "请输入类型名称", trigger: "blur" },
        ],
        dictValue: [
          { required: true, message: "请输入类型编码", trigger: "blur" },
        ]
      },
    };
  },
  computed: {
    categoryList() {
      return this.dictList
    }
  },
  watch: {
    isErrorType(val) {
      if (val) {
        this.dictForm = {}
        this.resetForm('dictForm')
      }
    }
  },
  created() {
    // 不良类型
    this.getErrorType()
  },
  methods: {
    getErrorType() {
      this.getDicts("errorType").then(res => {
        this.errorTypeList = res.data
      });
    },
    onResetModel() {
      this.form.model = null
    },
    changeCategory() {
      const name = this.form.product
      if (name) {
        this.product = name
        const data = this.categoryList.filter(item => item.name === name)
        this.computerOptions = data[0].computerList
      } else {
        this.computerOptions = []
      }
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = true
        categoryNameList({ name, categoryName: this.product }).then(res => {
          this.computerOptions = res.data
          this.isCLoading = false
        }).catch(() => {
          this.isCLoading = false
        })
      } else {
        this.computerOptions = []
      }
    },
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
    // 表单重置
    reset() {
      this.form = {
        product: null,
        url: "",
        model: null
      };
      this.resetForm("form");
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.status = 0;
          if (this.form.id) {
            delete this.form.createTime;
            delete this.form.updateTime;
            delete this.form.updateBy;
            delete this.form.updateTime;
            saleUpdate(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            saleAdd(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("创建成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          }
        }
      });
    },
    submitDictForm() {
      this.$refs["dictForm"].validate((valid) => {
        if (valid) {
          addData({ dictType: 'errorType', ...this.dictForm }).then((response) => {
            this.msgSuccess("新增成功");
            this.isErrorType = false;
            this.getErrorType();
          });
        }
      })
    }
  },
};
</script>

<style lang="scss" scope>
</style>

