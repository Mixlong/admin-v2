// 无数据显示指令

export default {
    inserted(el) {
        let value = el.innerText
        if(!value.length) {
            el.innerHTML = '---'
        }
    }
}