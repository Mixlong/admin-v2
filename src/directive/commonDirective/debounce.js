/**
 * 防抖
 */

import _ from "lodash";

export default {
    inserted(el, binding) {
        const { Fn, delay = 300 } = binding.value;
        el.addEventListener('click', _.debounce(Fn, delay))
    }
}