/*
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2024-01-03 18:16:15
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2024-01-04 15:31:39
 * @FilePath: \FILECONF-UI\src\api\third\prodData.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'

export function materialList(params) {
    return request({
        url: '/production/scheduling/material/list',
        method: 'get',
        params
    })
}

export function materialUpdate(data) {
    return request({
        url: '/production/scheduling/update/material',
        method: 'put',
        data
    })
}

