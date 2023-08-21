<template>
  <el-container>
    <el-header>配置文件生成器(STS)</el-header>
    <el-main>
      <el-card class="box-card" shadow="never">
        <div slot="header">
          <el-form :inline="true" :model="queryParams">
            <el-form-item label="所属品类" prop="categoryId">
              <el-select
                v-model="queryParams.categoryId"
                @change="changeCategory"
                filterable
                allow-create
                clearable
                placeholder="请选择品类"
              >
                <el-option
                  v-for="dict in dictList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="仪表型号" prop="computerId">
              <el-select
                filterable
                remote
                clearable
                v-model="queryParams.computerId"
                placeholder="请选择仪表型号"
              >
                <el-option
                  v-for="dict in computerOptions"
                  :key="dict.model"
                  :label="dict.name"
                  :value="dict.model"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-search"
                @click="handleQuery"
                >检索</el-button
              >
            </el-form-item>
          </el-form>
        </div>
        <el-form ref="form" :model="formData" label-width="90px">
          <el-row>
            <el-col :span="4">
              <el-form-item label="背光亮度">
                <el-select
                  v-model="formData.instrumentModel.backlightBrightness"
                  placeholder="请选择背光亮度"
                >
                  <el-option
                    v-for="item in backlightBrightnessList"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="休眠时间">
                <el-select
                  v-model="formData.instrumentModel.sleepTime"
                  placeholder="请选择休眠时间"
                >
                  <el-option
                    v-for="item in sleepTimeList"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
                <b class="margin-left-xs">min</b>
              </el-form-item>

              <el-form-item label="系统电压">
                <el-select
                  v-model="formData.instrumentModel.voltage"
                  placeholder="请选择系统电压"
                >
                  <el-option
                    v-for="item in dicts_voltage"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
                <b class="margin-left-xs">V</b>
              </el-form-item>

              <el-form-item label="助力档位数">
                <el-select
                  v-model="formData.instrumentModel.voltage"
                  placeholder="请选择助力档位数"
                >
                  <el-option
                    v-for="item in powerGearData"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="助力正反">
                <el-select
                  v-model="formData.instrumentModel.assist"
                  placeholder="请选择助力正反"
                >
                  <el-option
                    v-for="item in assistData"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4"></el-col>
            <el-col :span="4"></el-col>
            <el-col :span="4"></el-col>
            <el-col :span="4"></el-col>
            <el-col :span="4"></el-col>
          </el-row>
        </el-form>
      </el-card>
    </el-main>
    <el-footer class="flex align-center justify-center">
      <el-upload
        class="margin-right-xs"
        action=""
        :on-change="handleChange"
        :auto-upload="false"
        :show-file-list="false"
      >
        <el-button size="mini" type="primary">导入配置</el-button>
      </el-upload>
      <el-button size="mini" type="primary">读取配置(STS)</el-button>
      <el-button size="mini" type="primary">上传配置</el-button>
      <el-button size="mini" type="primary">导出配置</el-button>
    </el-footer>
  </el-container>
</template>
<script>
import { listFileConfig, categoryComputerDict } from "@/api/third/fileConfig";
import Axios from "axios";
export default {
  data() {
    return {
      queryParams: {
        categoryId: "",
        computerId: "",
      },
      formData: {
        instrumentModel: {
          backlightBrightness: 5,
          sleepTime: 10,
          voltage: 48,
          powerGear: 5,
          assist: 0
        },
      },
      dictList: [],
      computerOptions: [],
      //   背光亮度
      backlightBrightnessList: [1, 2, 3, 4, 5],
      //   休眠时间
      sleepTimeList: [...Array(11)].map((v, i) => i),
      //   系统电压
      dicts_voltage: [24, 36, 48, 52, 60, 72],
      //   助力档位数
      powerGearData: [3, 4, 5, 6, 7, 8, 9],
      assistData: [
        {
            label: "助力正",
            value: 0
        },
        {
            label: "助力反",
            value: 1
        }
      ]
    };
  },
  created() {
    categoryComputerDict().then((res) => {
      this.dictList = res.data;
    });
    this.getOptions();
  },
  methods: {
    handleChange() {},
    changeCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      this.computerOptions = this.dictList.filter(
        (item) => item.id === val
      )[0].computerList;
    },
    handleQuery() {
      listFileConfig({ ...this.queryParams, type: "config_file" }).then(
        (res) => {
          const { list } = res.data;
          const stsDeployFile = list[0]?.url;
          if (stsDeployFile) {
            this.handleFetchData(stsDeployFile);
          } else {
            this.$message.error("暂无配置文件");
          }
        }
      );
    },
    handleFetchData(stsDeployFile) {
      Axios.get(stsDeployFile).then((res) => {
        console.log(res);
        this.formData = res.data;
      });
    },
    getOptions() {
      //仪表电压
      //   this.getDicts("instrument_voltage").then((res) => {
      //     this.dicts_voltage = res.data;
      //   });
    },
  },
};
</script>
<style lang="scss" scoped>
.el-container {
  min-height: 100vh;
  background: #fff;

  .el-header {
    font-size: 20px;
    font-weight: bold;
  }
  .el-header,
  .el-footer {
    line-height: 60px;
    text-align: center;
  }
}
</style>