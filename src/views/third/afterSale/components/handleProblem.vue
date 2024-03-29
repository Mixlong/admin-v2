<template>
  <el-dialog
    class="after-sale-box"
    :title="isTitle"
    :visible="visible"
    width="650px"
    append-to-body
    center
    top="2vh"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="right"
    >
      <!-- 处理类型 -->
      <template v-if="form.state === 1">
        <el-form-item label="处理类型：" prop="handleType">
          <el-select
            v-model="form.handleType"
            allow-create
            placeholder="请选择处理类型"
            clearable
            style="width: 70%"
          >
            <el-option label="维修" value="维修" />
            <el-option label="换货" value="换货" />
            <el-option label="退货" value="退货" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修是否收费：" prop="isPay">
          <el-select
            v-model="form.isPay"
            placeholder="请选择维修是否收费"
            clearable
            style="width: 70%"
          >
            <el-option label="是" :value="0" />
            <el-option label="否" :value="1" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 现象复测 -->
      <template v-if="form.state === 2">
        <el-form-item label="复测结果：" prop="retestResult">
          <el-select
            v-model="form.retestResult"
            filterable
            clearable
            style="width: 80%"
            placeholder="请选择复测结果"
          >
            <el-option
              v-for="(value, key) in againCheckResultData"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否问题：" prop="isProblem">
          <el-switch
            v-model="form.isProblem"
            active-color="#409EFF"
            inactive-color="#DCDFE6"
            :active-value="0"
            :inactive-value="1"
          >
          </el-switch>
        </el-form-item>
        <el-form-item label="问题描述：" prop="retestDesc">
          <el-input
            v-model="form.retestDesc"
            type="textarea"
            rows="5"
            placeholder="请输入问题描述"
            clearable
            style="width: 80%"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="复测图片：" prop="retestFile" style="width: 100%">
          <el-upload-sortable
            v-model="form.retestFile"
            :action="actionUrl"
            :imgW="98"
            :imgH="98"
          />
        </el-form-item>
        <el-form-item label="复测视频：" prop="retestVideo" style="width: 100%">
          <el-upload-sortable
            v-model="form.retestVideo"
            :action="actionUrl"
            :isVideo="true"
            accept="video/mp4"
            :imgW="150"
            :imgH="98"
          />
        </el-form-item>
      </template>

      <!-- 分类处理 -->
      <template v-if="form.state === 3">
        <el-form-item label="分类：" prop="classification">
          <el-select
            v-model="form.classification"
            filterable
            allow-create
            clearable
            style="width: 70%"
            placeholder="请选择分类处理"
          >
            <el-option
              v-for="(value, key) in classificationData"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- 问题处理 -->
      <template v-if="form.state === 4">
        <el-form-item label="定位结果：" prop="locationResult">
          <el-input
            v-model="form.locationResult"
            type="textarea"
            rows="5"
            style="width: 100%"
            placeholder="请输入定位结果"
          />
        </el-form-item>
      </template>

      <!-- 维修处理 -->
      <template v-if="form.state === 5">
        <el-form-item label="处理结果：" prop="handleResult">
          <el-input
            v-model="form.handleResult"
            type="textarea"
            rows="5"
            style="width: 100%"
            placeholder="请输入处理结果"
          />
        </el-form-item>
        <el-form-item label="维修工时：" prop="serviceTime">
          <el-input-number
            v-model="form.serviceTime"
            :min="1"
            :precision="0"
            placeholder="请输入维修工时"
            style="width: 50%"
          />
          <span class="margin-left-sm">min</span>
        </el-form-item>
        <el-form-item label="物料损耗：" required>
          <el-row
            type="flex"
            justify="space-between"
            :gutter="10"
            v-for="(item, index) in form.materialLossList"
            :key="index"
          >
            <el-col :span="22">
              <el-row type="flex">
                <el-col :span="8">
                  <el-form-item
                    label=""
                    :prop="`materialLossList[${index}].materialName`"
                    :rules="rules.materialName"
                  >
                    <el-input
                      v-model="item.materialName"
                      style="width: 90%"
                      clearable
                      placeholder="请输入物料名称"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label=""
                    :prop="`materialLossList[${index}].materialCode`"
                    :rules="rules.materialCode"
                  >
                    <el-input
                      v-model="item.materialCode"
                      style="width: 90%"
                      clearable
                      placeholder="请输入物料编码"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label=""
                    :prop="`materialLossList[${index}].materialNum`"
                    :rules="rules.materialNum"
                  >
                    <el-input-number
                      v-model="item.materialNum"
                      style="width: 150px"
                      :min="1"
                      :precision="0"
                      placeholder="请输入物料数量"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="2">
              <el-button
                v-if="index !== 0"
                type="danger"
                icon="el-icon-minus"
                circle
                style="height: 28px"
                @click="removeMaterialData(item)"
              />
            </el-col>
          </el-row>
          <el-button
            v-if="form.materialLossList.length < 7"
            type="primary"
            icon="el-icon-plus"
            circle
            @click="onAddMaterial"
          />
        </el-form-item>
      </template>

      <!-- 返厂入库 -->
      <template v-if="form.state === 6">
        <el-form-item label="入库描述：" prop="warehousingDesc">
          <el-input
            v-model="form.warehousingDesc"
            type="textarea"
            rows="5"
            style="width: 100%"
            placeholder="请输入入库描述"
          />
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { afterHandle, afterBatchHandle } from "@/api/third/sale";
import reqUrl from "@/utils/requestUrl";
import globalData from "../mixins/global";
import ElUploadSortable from "@/components/el-upload-sortable";

export default {
  components: {
    ElUploadSortable,
  },
  mixins: [globalData],
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },
    handleProblemData: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      form: {},
      isSubLoading: false,
      isMultipleDeal: false,
      idList: [],
      rules: {
        retestResult: [
          { required: true, message: "请选择客退清单", trigger: "change" },
        ],
        isProblem: [
          { required: true, message: "请选择是否关闭问题", trigger: "change" },
        ],
        classification: [
          { required: true, message: "请选择分类处理", trigger: "change" },
        ],
        locationResult: [
          { required: true, message: "请输入定位结果", trigger: "blur" },
        ],
        handleType: [
          { required: true, message: "请选择处理类型", trigger: "change" },
        ],
        isPay: [
          { required: true, message: "请选择维修是否收费", trigger: "change" },
        ],
        handleResult: [
          { required: true, message: "请输入处理结果", trigger: "blur" },
        ],
        warehousingDesc: [
          { required: true, message: "请输入入库描述", trigger: "blur" },
        ],
        serviceTime: [
          {
            required: true,
            message: "请输入维修工时",
            trigger: ["change", "blur"],
          },
        ],
        materialName: [
          { required: true, message: "请输入物料名称", trigger: "blur" },
        ],
        materialCode: [
          { required: true, message: "请输入物料编码", trigger: "blur" },
        ],
        materialNum: [
          { required: true, message: "请输入物料数量", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    isTitle() {
      const { state } = this.handleProblemData;
      let title;
      switch (state) {
        case 1:
          title = "处理类型";
          break;
        case 2:
          title = "现象复测";
          break;
        case 3:
          title = "分类处理";
          break;
        case 4:
          title = "问题处理";
          break;
        case 5:
          title = "维修处理";
          break;
        case 6:
          title = "返厂处理";
          break;
      }
      return title;
    },
  },
  watch: {
    visible(isShow) {
      if (isShow) {
        const { materialLoss } = this.handleProblemData;
        this.form = this.handleProblemData;
        if (this.Is_Empty(materialLoss)) {
          this.form.materialLossList = [
            {
              materialName: "",
              materialCode: "",
              materialNum: "",
            },
          ];
        }
      } else {
        this.reset();
      }
    },
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
    },
    // 新增物料损耗
    onAddMaterial() {
      this.form.materialLossList.push({
        materialName: "",
        materialCode: "",
        materialNum: "",
      });
    },
    // 删除物料损耗项
    removeMaterialData(item) {
      const index = this.form.materialLossList.indexOf(item);
      if (index !== -1) {
        this.form.materialLossList.splice(index, 1);
      }
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;
          const { id, state, list } = this.form;
          // 批量
          if (this.isMultipleDeal && list.length) {
            let data = { ...this.form, state: state + 1 };

            this.dealFn(state, data, afterBatchHandle);
          } else {
            if (id) {
              let data = { ...this.form, afterId: id, state: state + 1 };

              this.dealFn(state, data, afterHandle);
            }
          }
        }
      });
    },
    dealFn(state, data, fn) {
      if (state === 5) {
        data = {
          ...data,
          materialLoss: JSON.stringify(data.materialLossList),
        };
      }
      fn(data)
        .then(() => {
          this.msgSuccess("操作成功");
          this.$parent.getList();
        })
        .finally(() => {
          this.isSubLoading = false;
          this.$emit("clearSaleSelection");
          this.close();
        });
    },
  },
};
</script>

<style></style>
