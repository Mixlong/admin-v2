<template>
  <div>
    <el-dialog
      title="测试数据"
      width="1200px"
      append-to-body
      center
      v-bind="$attrs"
      :close-on-click-modal="false"
      @close="$emit('update:visible', false)"
    >
      <el-table :data="detailData.list" style="width: 100%" height="350">
        <el-table-column
          prop="productName"
          label="模块"
          width="120"
          align="center"
        />
        <el-table-column
          prop="content"
          label="测试项"
          width="110"
          align="center"
        />
        <el-table-column
          prop="preconditions"
          label="前置条件"
          width="110"
          align="center"
        />
        <el-table-column
          prop="inter"
          label="输入与操作"
          align="center"
          width="110"
        />
        <el-table-column
          prop="result"
          label="预期结果"
          width="110"
          align="center"
        />
        <el-table-column prop="reality" label="实际测试情况" align="center">
          <template slot-scope="{ row }">
            <el-input placeholder="请输入实际测试情况" v-model="row.reality" />
          </template>
        </el-table-column>
        <el-table-column label="实际测试结果" align="center" width="380">
          <template slot-scope="{ row }">
            <el-radio-group v-model="row.isPass">
              <el-radio :label="1" border size="small"> 通过 </el-radio>

              <!-- <el-popover
                placement="top"
                width="160"
                trigger="click"
                v-model="isNoPass"
              >
                <el-input v-model="row.msg" clearable placeholder="请输入不通过原因" />    
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="isNoPass = false">
                    取消
                  </el-button>
                  <el-button
                    type="primary"
                    size="mini"
                    @click="isNoPass = false"
                  >
                    确定
                  </el-button>
                </div>
                <el-button slot="reference"> -->
                  <el-radio :label="2" border size="small"> 不通过 </el-radio>
                <!-- </el-button>
              </el-popover> -->

              <el-radio :label="3" border size="small"> 忽略 </el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm(1)">通 过</el-button>
        <el-button type="danger" @click="submitForm(2)">不通过</el-button>
        <el-button type="success" @click="submitForm()">保 存</el-button>
        <el-button @click="$emit('update:visible', false)">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
  
  <script>
import { taskInfo, taskState } from "@/api/third/testApi";

export default {
  inheritAttrs: false,
  data() {
    return {
      isNoPass: false,
      detailData: {
        list: [],
      },
    };
  },
  watch: {
    "$attrs.detailId": {
      handler(detailId) {
        if (detailId) {
          this.getDetail(detailId);
        }
      },
      immediate: true,
    },
  },
  methods: {
    getDetail(detailId) {
      taskInfo(detailId).then((res) => {
        console.log(res);
        this.detailData = res.data;
      });
    },
    checkListPass() {
      return this.detailData.list.some(
        (item) => !item.reality || item.isPass === 0
      );
    },
    /** 提交按钮 */
    submitForm(state) {
      if (this.checkListPass()) {
        return this.msgError("请填写或选择必须的内容");
      }
      const { id, list } = this.detailData
      const data = { id, state, list }
      taskState(data).then(res => {
        console.log(res)
        this.msgSuccess("操作成功")
        this.$emit('update:visible', false);
        this.$parent.getList();
      })
      console.log(this.detailData.list);
      //   taskState().then(res => {

      //   })
      //   this.$refs["form"].validate((valid) => {
      //     if (valid) {
      //       if (this.form.id) {
      //         editComputer(this.form).then((response) => {
      //           if (response.code === 200) {
      //             this.msgSuccess("修改成功");
      //             this.dialogVisible = false;
      //             this.$parent.getList();
      //           }
      //         });
      //       } else {
      //         addComputer(this.form).then((response) => {
      //           if (response.code === 200) {
      //             this.msgSuccess("添加成功");
      //             this.dialogVisible = false;
      //             this.$parent.getList();
      //             this.open = false;
      //           }
      //         });
      //       }
      //     }
      //   });
    },
  },
};
</script>
  