<template>
  <div id="viewer"></div>
</template>

<script>
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";
export default {
  props: ["source"],
  watch: {
    source(val) {

        this.init()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
       
      const viewer = new Viewer({
        el: document.querySelector("#viewer"),
 
        initialValue: this.source,
      });
    //   viewer.getHtml();
    },
  },
};
</script>

<style >
</style>