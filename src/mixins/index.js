const mixins = {
  data () {
    return {
      testMix: '混入对象的data',
    };
  },
  watch: {
    dialogVisible (val) {
      if (!val) {
        this.resetForm ('form');
      }
    },
  },
  methods: {
    mixinsFun () {
      console.log ('调用混入对象的methods的函数');
    },
  },
};

export default mixins;
