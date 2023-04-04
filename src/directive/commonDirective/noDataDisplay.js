//  无数据显示指令

export function NoData(el, binding) {
    const { value, modifiers } = binding
    if (value == null || value == undefined || value === '') {
        el.innerHTML = '---'
    } else {
        let cValue = value
        if (modifiers.upper) {
            el.innerHTML = cValue.toUpperCase()
        } else if (modifiers.lower) {
            el.innerHTML = cValue.toLowerCase()
        } else {
            el.innerHTML = value
        }
    }
}