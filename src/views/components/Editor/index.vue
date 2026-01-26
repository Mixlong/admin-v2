<template>
  <div class="tinymce-container" :style="{ width: containerWidth }">
    <QuillEditor
      ref="quill"
      :value="value"
      :height="resolvedHeight"
      :min-height="resolvedMinHeight"
      :toolbar="resolvedToolbar"
      :placeholder="placeholder"
      :read-only="readOnly"
      :file-size="fileSize"
      :type="type"
      :headers="headers"
      v-bind="editorAttrs"
      v-on="editorListeners"
    />
  </div>
</template>

<script>
import QuillEditor from "@/components/Editor";

export default {
  name: "Tinymce",
  components: { QuillEditor },
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      default: function () {
        return (
          "vue-tinymce-" +
          +new Date() +
          ((Math.random() * 1000).toFixed(0) + "")
        );
      },
    },
    value: {
      type: String,
      default: "",
    },
    toolbar: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    menubar: {
      type: String,
      default: "file edit insert view format table",
    },
    height: {
      type: [Number, String],
      required: false,
      default: null,
    },
    width: {
      type: [Number, String],
      required: false,
      default: "100%",
    },
    minHeight: {
      type: [Number, String],
      default: null,
    },
    placeholder: {
      type: String,
      default: "请输入内容",
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    fileSize: {
      type: Number,
      default: 5,
    },
    type: {
      type: String,
      default: "url",
    },
    headers: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    containerWidth() {
      const width = this.width;
      if (/^[\d]+(\.[\d]+)?$/.test(width)) {
        return `${width}px`;
      }
      return width;
    },
    resolvedHeight() {
      return this.toNumber(this.height);
    },
    resolvedMinHeight() {
      return this.toNumber(this.minHeight);
    },
    resolvedToolbar() {
      return this.toolbar && this.toolbar.length ? this.toolbar : null;
    },
    editorAttrs() {
      return this.$attrs;
    },
    editorListeners() {
      return { ...this.$listeners, input: this.handleInput };
    },
  },
  methods: {
    toNumber(value) {
      if (value === null || value === undefined || value === "") return null;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    },
    handleInput(html) {
      this.$emit("input", html);
    },
    getQuill() {
      const editor = this.$refs.quill;
      return editor ? editor.Quill : null;
    },
    setContent(value) {
      const quill = this.getQuill();
      if (!quill) return;
      const delta = quill.clipboard.convert(value || "");
      quill.setContents(delta, "silent");
    },
    getContent() {
      return this.value || "";
    },
    imageSuccessCBK(arr) {
      const quill = this.getQuill();
      if (!quill || !Array.isArray(arr)) return;
      let length = quill.getSelection()?.index || 0;
      arr.forEach((item) => {
        if (item && item.url) {
          quill.insertEmbed(length, "image", item.url);
          length += 1;
        }
      });
      quill.setSelection(length);
    },
  },
};
</script>

<style lang="scss" scoped>
.tinymce-container {
  position: relative;
  line-height: normal;
}
</style>
