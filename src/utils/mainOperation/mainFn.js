import Vue from "vue";
import { getDicts } from "@/api/system/dict/data";
import { checkRole, checkPermi } from "@/utils/permission";
import { urlDownload, zipFile, readOfficeFile } from "@/utils";
import { download as fileDownload } from "@/utils/request";
import moment from "moment";
import axios from "axios";

import {
  extend,
  parseTime,
  resetForm,
  resetTableSelection,
  addDateRange,
  selectDictLabel,
  selectDictLabels,
  download,
  downloadFile,
  handleTree,
  tableHeight,
  dialogTop,
  transFileUrl,
  clearValidateItem,
  Enter_Fn,
  is_Empty,
  setCheckListArr,
  handleNameToPage,
  handlePathToPage,
  getConfigDicts,
  HandleDelete
} from "@/utils/ruoyi";

// 全局方法挂载
Vue.prototype.getDicts = getDicts;
Vue.prototype.checkRole = checkRole;
Vue.prototype.checkPermi = checkPermi;
Vue.prototype.extend = extend;
Vue.prototype.parseTime = parseTime;
Vue.prototype.resetForm = resetForm;
Vue.prototype.resetTableSelection = resetTableSelection;
Vue.prototype.addDateRange = addDateRange;
Vue.prototype.selectDictLabel = selectDictLabel;
Vue.prototype.selectDictLabels = selectDictLabels;
Vue.prototype.download = download;
Vue.prototype.downloadFile = downloadFile;
Vue.prototype.handleTree = handleTree;
Vue.prototype.tableHeight = tableHeight;
Vue.prototype.dialogTop = dialogTop;
Vue.prototype.transFileUrl = transFileUrl;
Vue.prototype.urlDownload = urlDownload;
Vue.prototype.clearValidateItem = clearValidateItem;
Vue.prototype.zipFile = zipFile;
Vue.prototype.ReadOfficeFile = readOfficeFile;
Vue.prototype.moment = moment;
Vue.prototype.axios = axios;
Vue.prototype.Enter_Fn = Enter_Fn;
Vue.prototype.Is_Empty = is_Empty;
Vue.prototype.fileDownload = fileDownload;
Vue.prototype.HandleDelete = HandleDelete;
Vue.prototype.$setCheckListArr = setCheckListArr;
Vue.prototype.handleNameToPage = handleNameToPage;
Vue.prototype.handlePathToPage = handlePathToPage;
Vue.prototype.getConfigDicts = getConfigDicts;
