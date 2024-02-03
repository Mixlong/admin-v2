/*
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-04-14 16:08:04
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2024-01-30 10:53:13
 * @FilePath: \FILECONF-UI\src\utils\mainOperation\mainFn.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue'
import { getDicts } from '@/api/system/dict/data'
import { checkRole, checkPermi } from "@/utils/permission"
import { urlDownload, zipFile, readOfficeFile } from '@/utils';
import { download as fileDownload } from '@/utils/request';
import moment from 'moment'
import axios from 'axios'

import {
    extend,
    parseTime,
    resetForm,
    addDateRange,
    selectDictLabel,
    selectDictLabels,
    download,
    handleTree,
    tableHeight,
    dialogTop,
    transFileUrl,
    clearValidateItem,
    Enter_Fn,
    is_Empty,
    setCheckListArr
} from '@/utils/ruoyi'

// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.checkRole = checkRole
Vue.prototype.checkPermi = checkPermi
Vue.prototype.extend = extend
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree
Vue.prototype.tableHeight = tableHeight
Vue.prototype.dialogTop = dialogTop
Vue.prototype.transFileUrl = transFileUrl
Vue.prototype.urlDownload = urlDownload
Vue.prototype.clearValidateItem = clearValidateItem
Vue.prototype.zipFile = zipFile
Vue.prototype.ReadOfficeFile = readOfficeFile
Vue.prototype.moment = moment
Vue.prototype.axios = axios
Vue.prototype.Enter_Fn = Enter_Fn
Vue.prototype.Is_Empty = is_Empty
Vue.prototype.fileDownload = fileDownload
Vue.prototype.$setCheckListArr = setCheckListArr;