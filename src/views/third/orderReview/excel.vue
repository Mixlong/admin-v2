<template>
  <div class="app-container">
    <ve-table
      max-height="calc(100vh - 350px)"
      fixed-header
      :columns="columns"
      :table-data="tableData"
      :border-x="true" 
      :border-y="true"
      style="border-radius:20px;"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        { field: "name", key: "a", title: "Name", align: "center" },
        { field: "date", key: "b", title: "Date", align: "center" },
        {
          field: "hobby",
          key: "c",
          title: "Hobby",
          align: "center",
        },
        {
          field: "address",
          key: "d",
          title: "Address",
          align: "center",
        },
      ],
      tableData: [],
    };
  },
  methods: {
    initTableData() {
      let data = [];
      for (let i = 0; i < 20; i++) {
        data.push({
          name: i,
          date: i,
          hobby: i,
          address: i,
        });
      }
      this.tableData = data;
    },
  },
  created() {
    this.initTableData();
  },
};
</script>