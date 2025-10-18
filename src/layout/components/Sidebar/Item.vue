<script>
export default {
  name: "MenuItem",
  functional: true,
  props: {
    icon: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
  },
  render(h, context) {
    const { icon, title } = context.props;
    const vnodes = [];

    if (icon) {
      vnodes.push(<svg-icon icon-class={icon} style="margin-right: 12px;" />);
    } else {
      // 没有图标时添加占位元素，确保文字对齐
      vnodes.push(
        <span style="display: inline-block; width: 18px; margin-right: 12px;"></span>
      );
    }

    if (title) {
      vnodes.push(<span slot="title">{title}</span>);
    }
    return vnodes;
  },
};
</script>
