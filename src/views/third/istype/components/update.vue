<template>
  <el-dialog
    class="update_sample"
    :close-on-click-modal="true"
    :title="title"
    :visible.sync="dialogVisible"
    append-to-body
    width="400px"
    center
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="95px">
      <el-card
        style="padding-top: 38px; margin: 0 30px 10px"
        class="step-wrap"
        shadow="hover"
      >
        <el-steps
          :active="active"
          class="stepCard"
          :space="80"
          direction="vertical"
          finish-status="success"
        >
          <el-step>
            <template slot="title">
              <div class="title-txt title-txt1" @click="!formObj.testState && formObj.isState ? stateChange(1) : ''">测试</div>
              <div class="flex justify-between align-center margin-left check-name">
                {{ formObj.testUserName }} 
              </div>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-txt title-txt2"  @click="formObj.testState && !formObj.pmState && formObj.isState ? stateChange(2) : ''">产品经理</div>
              <div class="flex justify-between align-center margin-left check-name">
                {{ formObj.pmUserName }} 
              </div>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-txt title-txt3"  @click="formObj.testState && formObj.pmState && !formObj.dmState && formObj.isState ? stateChange(3) : ''">部门经理</div>
              <div class="flex justify-between align-center margin-left check-name">
                {{ formObj.dmUserName }}   
              </div>
            </template>
          </el-step>
          <!-- <el-step>
            <template slot="title">
              <div class="title-txt title-txt6">完成</div>
            </template>
          </el-step> -->
        </el-steps>
      </el-card>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { detailCategory } from '@/api/third/isType'
import { commonJs } from "@/mixins/common";
export default {
  mixins: [commonJs],  
  props: {
    formObj: {
      type: Object,
      default: () => {},
    },
    UserList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isTop: false,
      dialogVisible: false,
      showName: "",
      modelList: [],
      // 表单参数
      form: {},
      title: "",
      // 表单校验
      rules: {
        customerName: [
          { required: true, message: "请输入客户名称", trigger: "blur" },
        ],
        baseModel: [
          { required: true, message: "请输入基础型号", trigger: "blur" },
        ],
        sendTime: [
          { required: true, message: "请选择送样时间", trigger: "blur" },
        ],
        sendNum: [
          { required: true, message: "请输入送样数量", trigger: "blur" },
        ],
        follow: [{ required: true, message: "请选择", trigger: "change" }],
        pm: [{ required: true, message: "请选择", trigger: "change" }],
        se: [{ required: true, message: "请选择", trigger: "change" }],
        test: [{ required: true, message: "请选择", trigger: "change" }],
        sell: [{ required: true, message: "请选择", trigger: "change" }],
      },
      active: -1,
    };
  },
  watch: {
    dialogVisible(val) {
        if(val) {
            if(this.formObj.testState && this.formObj.pmState && this.formObj.dmState) {
                this.active = 4
            } else if(this.formObj.testState && this.formObj.pmState && !this.formObj.dmState) {
                this.active = 2
            } else if(this.formObj.testState && !this.formObj.pmState) {
                this.active = 1
            } else if(this.formObj.testState) {
                this.active = 0
            } 
        }
    }
  },
  methods: {
      stateChange(state) {

        this.active = state
        let reviewer = null
         if(!this.formObj.testState) {
            reviewer = 1
          } else if(this.formObj.testState && !this.formObj.pmState) {
            reviewer = 2
          } else if(this.formObj.testState && this.formObj.pmState && !this.formObj.dmState) {
            reviewer = 3
          } else {
              return
          }
          detailCategory({ id: this.formObj.id, state: 1, reviewer }).then(() => {
            this.warningMessage("审核通过!", 1);
            this.$parent.getList();
          });
      }
  }
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
.stepCard {
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
        left: 30px !important;
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
      .check-name {
          margin-top: 6px;
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

