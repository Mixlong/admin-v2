<template>
  <table class="check-status-legend">
    <tr>
      <td>
        <img src="./imgs/blue.png" width="16px" height="16px" />
        <span>待上传</span>
      </td>

      <td>
        <img src="./imgs/yellow.png" width="16px" height="16px" />
        <span>待初审</span>
      </td>
      <td>
        <img src="./imgs/orange.png" width="16px" height="16px" />
        <span>待终审</span>
      </td>
      <td>
        <img src="./imgs/red.png" width="16px" height="16px" />
        <span>未通过</span>
      </td>
      <td>
        <img src="./imgs/green.png" width="16px" height="16px" />
        <span>已审核</span>
      </td>
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
            display: inline-flex;
            align-items: center;
            margin-right: 15px;

            &:last-child {
                margin-right: 0; 
            }
            img {
              margin-right: 2px;
            }
        }
    }
</style>