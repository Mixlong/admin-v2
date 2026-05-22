<template>
  <div>
    <el-dialog
      v-bind="$attrs"
      width="700px"
      append-to-body
      top="-5vh"
      center
      :close-on-click-modal="false"
      @close="$emit('update:visible', false)"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="110px"
        label-position="top"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模块：" prop="productName">
              <select-loadMore
                v-model="form.productName"
                :data="moduleData.data"
                :page="moduleData.page"
                :hasMore="moduleData.more"
                :moreParams="true"
                dictLabel="productType"
                dictValue="id"
                :request="getModuleList"
                @getChange="getModuleId"
                placeholder="请选择模块"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用例类型：" prop="type">
              <el-select
                v-model="form.type"
                size="mini"
                filterable
                placeholder="请选择用例类型"
                style="width: 100%"
              >
                <el-option
                  v-for="dict in useCaseTypeList"
                  :key="dict.dictCode"
                  :label="dict.dictValue"
                  :value="String(dict.dictCode)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="form.list.length < 6  && !form.id" class="margin-top-xs text-right">
          <el-button
            type="primary"
            icon="el-icon-plus"
            circle
            @click="onAddStationFile"
          />
        </el-form-item>
        <transition-group
          name="fade-transform-sop"
          tag="div"
          ref="stationBoxRef"
          :class="isListClass"
        >
          <el-row
            :gutter="20"
            type="flex"
            justify="space-between"
            align="middle"
            v-for="(item, index) in form.list"
            :key="item.__key"
            class="margin-bottom-sm"
          >
            <el-col :span="isSpan">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="测试项：" :prop="`list[${index}].content`">
                    <el-input
                      v-model="item.content"
                      clearable
                      placeholder="请输入测试项"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="前置条件：" :prop="`list[${index}].preconditions`">
                    <el-input
                      v-model="item.preconditions"
                      clearable
                      placeholder="请输入前置条件"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="输入与操作：" :prop="`list[${index}].inter`">
                    <el-input
                      v-model="item.inter"
                      clearable
                      placeholder="请输入输入与操作"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="预期结果：" :prop="`list[${index}].result`">
                    <el-input
                      v-model="item.result"
                      type="textarea"
                      clearable
                      :autosize="{minRows:1,maxRows:3}"
                      placeholder="请输入预期结果"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
            <el-col v-if="index !== 0 && !form.id" :span="1" class="text-center">
              <el-button
                type="danger"
                icon="el-icon-minus"
                circle
                @click="removeSopData(item)"
              />
            </el-col>
          </el-row>
        </transition-group>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="$emit('update:visible', false)">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  testCaseAdd,
  testCaseEdit,
} from "@/api/third/testApi";
import CommonMinins from "@/views/TestManage/mixins";

export default {
  inheritAttrs: false,
  props: ["useCaseTypeList"],
  mixins: [CommonMinins],
  data() {
    return {
      step: 1,
      modelList: [],
      dialogVisible: false,
      // 表单参数
      form: {
        list: [],
      },
      // 表单校验
      rules: {
        productName: [
          { required: true, message: "请选择模块", trigger: "change" },
        ],
        type: [
          { required: true, message: "请输入用例类型", trigger: "change" },
        ],
        content: [{ required: true, message: "请输入测试项", trigger: "blur" }],
        preconditions: [
          { required: true, message: "请输入前置条件", trigger: "blur" },
        ],
        inter: [
          { required: true, message: "请输入输入与操作", trigger: "blur" },
        ],
        result: [
          { required: true, message: "请输入预期结果", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    isSpan() {
      const { list, id } = this.form;
      return (id || list.length === 1) ? 24 : 23
    },
    isListClass() {
      const { list, id } = this.form;
      return [
        {
        'station_box': (list.length > 1) && !id 
        },
        'overflow-y'
      ]
    }
  },
  methods: {
    createUseCaseRow() {
      return {
        __key: `${Date.now()}-${Math.random()}`,
        content: "",
        preconditions: "",
        inter: "",
        result: "",
      };
    },
    // 表单重置
    reset() {
      this.resetForm("form");
      this.form = {
        list: [this.createUseCaseRow()],
      };
    },
    onAddStationFile() {
      this.form.list.push(this.createUseCaseRow());

      const scrollRef = this.$refs.stationBoxRef.$el;
      const scrollHeight = scrollRef.scrollHeight;

      this.$nextTick(() => {
        scrollRef.scrollTop = scrollHeight;
      });
    },
    removeSopData(item) {
      const index = this.form.list.indexOf(item);
      if (index !== -1) {
        this.form.list.splice(index, 1);
      }
    },
    getModuleId(info) {
      if (!info) {
        this.form.productId = "";
        return;
      }
      const data = JSON.parse(info);
      this.form.productId = data.id;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const form = Object.assign({}, this.form);
          form.list = form.list.map(({ __key, ...item }) => item);
          if (form.id) {
            this.$confirm(
              `修改后，审核状态会变为“待审核”，确认修改吗？`,
              "警告",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              }
            )
              .then(() => {
                const { list } = form;
                const paramsForm = { ...form, ...list[0] };
                return testCaseEdit(paramsForm);
              })
              .then((res) => {
                if (res.code === 200) {
                  this.msgSuccess("修改成功");
                  this.$emit("update:visible", false);
                  this.$parent.getList();
                }
              })
              .catch(() => {});
          } else {
            testCaseAdd(form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
                this.$emit("update:visible", false);
                this.$parent.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>

.fade-transform-sop-enter {
  opacity: 0;
  transform: translateY(-40px);
}

.fade-transform-sop-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

.fade-transform-sop-enter-active, .fade-transform-sop-leave-active {
  transition: all 0.5s ease-in-out;
}

.station_box {
  max-height: 500px;
  scroll-behavior: smooth;
  padding-right: 25px;
  box-shadow: 0 5px 5px -5px rgba(0, 0, 0, 0.5);
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    background-color: transparent;
  }
}
</style>
