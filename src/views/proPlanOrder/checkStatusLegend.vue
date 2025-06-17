<template>
  <table class="check-status-legend">
    <tr>
      <!-- <td>
        <img src="./imgs/blue.png" />
        <span>待上传</span>
      </td>

      <td>
        <img src="./imgs/yellow.png" />
        <span>待初审</span>
      </td>
      <td>
        <img src="./imgs/orange.png"  />
        <span>待终审</span>
      </td> -->
      <td>
        <!-- <img src="./imgs/red.png" /> -->
        <StatusFlag bgColor="red"></StatusFlag>
        <span>未完成</span>
      </td>
      <td>
        <StatusFlag bgColor="green"></StatusFlag>
        <span>已完成</span>
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  components: {
    StatusFlag: () => import("./StatusFlag"),
  },
};
</script>

<style lang="scss" scoped>
.check-status-legend {
  border-collapse: collapse; // 合并边框

  td {
    text-align: center;
    display: inline-flex;
    align-items: center;
    margin-right: 15px;

    &:last-child {
      margin-right: 0;
    }

    img {
      margin-right: 2px;
      width: 15px;
      height: 15px;
    }
  }
}
</style>