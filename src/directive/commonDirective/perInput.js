/**
 * 输入框整数，小数（位数）限制
 */

// 防抖
const debounce = (fn, delay = 300) => {
    let timer;
    return function () {
        const th = this;
        const args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            timer = null;
            fn.apply(th, args);
        }, delay);
    };
}

const addListener = (el, type, fn) => {
    el.addEventListener(type, fn, false)
}

// 去掉空格
const spaceFilter = (el) => {
    addListener(el, 'keyup', debounce(() => {
        el.value = el.value.replace(/\s+/g, '')
        el.dispatchEvent(new Event('input'))
    }, 150))
}

// 输入正整数或小数（几位）
const priceFilter = (el, { min = 0, precision = 0 } = {}) => {
    addListener(el, 'keyup', debounce(() => {
        if (min >= 0) {
            if (precision === 0) {
                el.value = +el.value.replace(/[^\d]/g, '')
            } else if (precision > 0) {
                el.value = +el.value.match(/^\d*(\.?\d{0,2})/g)[0]
            } else {
                throw new Error('precision 必须为正整数')
            }
        }
        el.dispatchEvent(new Event('input'))
    }, 200))
}


// 限制只能输入字母数字（适用于运单号）
const integerLetterFilter = (el) => {
    addListener(el, 'keyup', () => {
        el.value = el.value.replace(/[\W]/g, '')
        el.dispatchEvent(new Event('input'))
    })
}

export default {
    bind(el, binding) {
        if (el.tagName.toLowerCase() !== 'input') {
            el = el.getElementsByTagName('input')[0]
        }
        spaceFilter(el)
        switch (binding.arg) {
            case 'price':
                priceFilter(el, binding.value)
                break
            case 'integerLetter':
                integerLetterFilter(el)
                break
            default:
                console.warn('未知指令类型', binding.arg)
                break
        }
    }
}