import Vue from "vue";

import Pagination from "@/components/Pagination";
import RightToolbar from "@/components/RightToolbar";
import DrUpload from "@/components/Upload";
import Tooltip from "@/components/Tooltip";
import ModalStyle from "@/components/ModalStyle";
import PreviewImg from "@/components/PreviewImg";
import SelectLoadMore from "@/components/selectLoadMore";
import ElUploadSortable from "@/components/el-upload-sortable";
import ModelCategory from "@/components/ModelCategory";
import ScreenFull from "@/components/Screenfull";
// 字典标签组件
import DictTag from "@/components/DictTag";
// 字典数据组件
import DictData from "@/components/DictData";
import VueDraggableResizable from "vue-draggable-resizable";
// optionally import default styles
import "vue-draggable-resizable/dist/VueDraggableResizable.css";
import MacInput from "@/components/MacInput";
import TypedSelectLoadMore from '@/components/TypedSelectLoadMore';

// 全局组件挂载
const globalComponents = [
  Pagination,
  RightToolbar,
  DrUpload,
  Tooltip,
  ModalStyle,
  PreviewImg,
  SelectLoadMore,
  ElUploadSortable,
  ModelCategory,
  ScreenFull,
  VueDraggableResizable,
  MacInput,
  TypedSelectLoadMore
];
const install = (Vue) => {
    globalComponents.forEach(item => {
        Vue.component(item.name, item)
    })
};
DictData.install();
export default install;
