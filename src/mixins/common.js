const commonJs = {
    data() {
        return {
            // 提交loading
            isSubLoading: false,
        }
    },
    methods: {
        tabSelection(selection, singleOrMultity = true) {     // singleOrMultity (true 多选 反之 单选)
            if (selection.length === 0) {
                return true      // 判断是否选择列
            }
            return false
        },
        warningMessage(msg, isType) {  // type 1 成功、2 警告、 3 失败
            let type = null
            switch (+isType) {
                case 1: type = 'success'; break;
                case 2: type = 'warning'; break;
                case 3: type = 'error'; break;
            }
            this.$message({
                message: msg,
                type
            })
        }
    }
}

export {
    commonJs
}