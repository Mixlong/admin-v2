/**
 * 防抖
 */

import debounce from "lodash/debounce";

export default {
    inserted(el, binding) {
        const { Fn, delay = 300 } = binding.value;
        el.addEventListener('click', debounce(Fn, delay))
    }
}
