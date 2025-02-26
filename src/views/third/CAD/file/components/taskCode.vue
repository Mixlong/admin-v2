<template>
  <el-dialog
    class="after-sale-box"
    title="任务令"
    :visible="visible"
    width="650px"
    append-to-body
    center
    top="-10vh"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-form ref="form" :model="form">
      <el-row :gutter="0">
        <el-col :span="12">
          <el-form-item label="所属品类" prop="category">
            <el-select
              v-model="form.category"
              filterable
              allow-create
              clearable
              placeholder="请选择品类"
              @change="changeCategory"
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
          <el-form-item label="仪表型号" prop="computer">
            <el-select
              :loading="isCLoading"
              filterable
              remote
              clearable
              v-model="form.computer"
              placeholder="请选择仪表型号"
              :remote-method="getComputerNameList"
            >
              <el-option
                v-for="dict in computerOptions"
                :key="dict.model"
                :label="dict.name"
                :value="dict.model"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="测试工序" prop="processId">
            <el-select
              v-model="form.processId"
              clearable
              placeholder="请选择测试工序"
            >
              <el-option
                v-for="(dict, index) in stsTestList"
                :key="index"
                :label="dict.dictLabel"
                :value="dict.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="芯片版本" prop="chipVersion">
            <el-select
              v-model="form.chipVersion"
              placeholder="请选择芯片版本"
              clearable
              filterable
            >
              <el-option
                v-for="dict in chipList"
                :key="dict.dictCode"
                :label="dict.dictLabel"
                :value="dict.dictLabel"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <transition name="fade">
      <el-card shadow="hover" v-if="qrCode" class="text-center">
        <vue-qr :text="qrCode" :size="250"></vue-qr>
      </el-card>
    </transition>
    <div slot="footer" class="dialog-footer">
      <el-button
        :disabled="isCreateDis"
        type="primary"
        @click="handleCreateCode"
      >
        生成
      </el-button>
      <el-button @click="resetQuery">重置</el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>
  
<script>
import { getOrderProcess } from "@/api/order";
import { categoryComputerDict, computerNameList } from "@/api/third/fileConfig";
import VueQr from "vue-qr";

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    saleIdList: {
      type: Array,
      default: () => [],
    },
    createTaskData: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    VueQr,
  },
  data() {
    return {
      isSubLoading: false,
      isCLoading: false,
      qrCode: "",
      dictList: [],
      computerOptions: [],
      chipList: [],
      // sts测试工序
      stsTestList: [],
      form: {},
    };
  },
  computed: {
    // this.form = {
    //     category: this.createTaskData.categoryId,
    //     computer: this.createTaskData.computerId,
    //   };
    isCreateDis() {
      const { category, computer, processId, chipVersion } = this.form;
      return !category || !computer || !processId || !chipVersion;
    },
  },
  watch: {
    visible(isFlag) {
      if (isFlag) {
        this.handleEchoData();
        // sts测试工序
        this.getDicts("sys_test_session").then((res) => {
          this.stsTestList = res.data;
        });

        // 芯片类型
        getOrderProcess({ dictType: "scheme_version" }).then((res) => {
          this.chipList = res.data;
        });
      } else {
        this.reset();
      }
    },
  },
  methods: {
    async handleEchoData() {
      const result = await categoryComputerDict();
      this.dictList = result.data;

      if (this.createTaskData.categoryId) {
        this.changeCategory(this.createTaskData.categoryId);
      }

      this.form = {
        category: this.createTaskData.categoryId,
        computer: this.createTaskData.computerId,
      };
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = true;
        computerNameList({
          name,
          categoryId: this.form.category,
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
    changeCategory(categoryId) {
      if (!categoryId) return;
      this.computerOptions = this.dictList.find(
        (item) => item.id === categoryId
      )?.computerList;
    },
    resetQuery() {
      this.resetForm("form");
    },
    close() {
      this.$emit("update:visible", false);
    },
    // 表单重置
    reset() {
      this.form = {};
      this.qrCode = "";
      this.resetForm("form");
    },
    /** 提交按钮 */
    handleCreateCode() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const { category, computer, processId, chipVersion } = this.form;
          const random = Math.floor(+new Date() / 1000);
          this.qrCode = `SMT:category=${category}_stsTest?computer=${computer}?processId=${processId}?random=${random}?chipVersion=${chipVersion}`;
        }
      });
    },
  },
};
</script>