<template>
  <table class="check-status-legend">
    <tr>
      <td>
        <img src="./imgs/blue.png" width="16px" height="16px" />
      </td>
      <td>
        <img src="./imgs/yellow.png" width="16px" height="16px" />
      </td>
      <td>
        <img src="./imgs/orange.png" width="16px" height="16px" />
      </td>
      <td>
        <img src="./imgs/red.png" width="16px" height="16px" />
      </td>
      <td>
        <img src="./imgs/green.png" width="16px" height="16px" />
      </td>
    </tr>
    <tr>
      <td>待上传</td>
      <td>待初审</td>
      <td>待终审</td>
      <td>未通过</td>
      <td>已审核</td>
    </tr>
  </table>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
    .check-status-legend {
        border-collapse: collapse; // 合并边框

        td {
            text-align: center;
            padding: 2px;
            border: 1px solid #808a80; 
        }
    }
</style>