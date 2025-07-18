<template>
  <el-input
    v-model.trim="formattedMac"
    :placeholder="placeholder"
    @input="formatMac"
    clearable
  />
</template>
  
  <script>
export default {
  name: "MacInput",
  props: {
    value: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "请输入",
    },
  },
  data() {
    return {
      formattedMac: this.value,
    };
  },
  watch: {
    value(newVal) {
      this.formattedMac = newVal;
    },
    formattedMac(newVal) {
      this.$emit("input", newVal);
    },
  },
  methods: {
    formatMac(val) {
      if (this.Is_Empty(val)) return;
      
      val = val.replace(/:/gi, "");
      let reg = new RegExp("\\w{1," + 2 + "}", "g");
      let ma = val.match(reg);
      ma = ma.join(":");
      this.formattedMac = ma.toUpperCase();
    },
  },
};
</script>