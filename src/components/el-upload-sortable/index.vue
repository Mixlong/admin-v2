<style lang="scss">
@import "./index.scss";
</style>

<template>
  <div 
    class="upload-queue"
    @dragover.prevent="onPageDragOver"
    @drop.prevent="onPageDrop">
    <div
      v-model="imgList"
      :disabled="isDisabled"
      @start="drag = true"
      @end="drag = false"
      @update="updateList(imgList)"
      class="el-upload-list el-upload-list--picture-card"
    >
      <transition-group>
        <div
          class="el-upload-list__item"
          :style="imgListStyle"
          v-for="(item, index) in imgList"
          :key="`${item}-${index}`"
          draggable="true"
          @dragstart="onDragStart($event, item, index)"
          @dragover.prevent="onDragOver($event)"
          @dragenter.prevent="onDragEnter($event)"
          @dragleave="onDragLeave($event)"
          @drop="onDrop($event, index)"
          @dragend="onDragEnd($event)"
        >
          <video class="video-box" v-if="isVideo" :src="item"></video>
          <el-image
            v-else
            :src="item"
            fit="contain"
            class="el-upload-list__item-thumbnail"
          />
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="handlePreview(item)"
            >
              <i class="el-icon-zoom-in"></i>
            </span>
            <span
              v-if="!isDisabled"
              class="el-upload-list__item-delete"
              @click="handleRemove(item, index)"
            >
              <i class="el-icon-delete"></i>
            </span>
          </span>
        </div>
      </transition-group>
    </div>

    <el-upload
      v-if="imgList.length < max"
      :style="imgListStyle"
      class="el-upload el-upload--picture-card"
      :multiple="multiple"
      :action="action"
      :accept="accept"
      :disabled="isDisabled"
      :limit="isLimit"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
    >
      <i :class="isUploadIcon"></i>
    </el-upload>

    <el-dialog class="video-box" :visible.sync="dialogVisible" top="0" append-to-body>
      <video
        ref="videoRef"
        controls
        :controlslist="controlslist"
        disablePictureInPicture
        :src="dialogImageUrl"
      />
    </el-dialog>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import reqUrl from "@/utils/requestUrl";

export default {
  name: "ElUploadSortable",
  components: { draggable },
  props: {
    imgW: {
      type: Number,
      default: 80,
    },
    imgH: {
      type: Number,
      default: 80,
    },
    max: {
      type: Number,
      default: 15,
    },
    action: {
      type: String,
      default: reqUrl + "/oss/batch-upload",
    },
    value: {
      type: String,
      default: "",
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    param: {
      type: String,
      default: "",
    },
    isVideo: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    isLimit: {
      type: Number,
      required: false,
    },
    accept: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      imgList: [],
      isLoading: false,
      drag: false,
      // 拖拽相关的状态数据
      dragItem: null,
      dragIndex: -1,
      dragOptions: {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      },
      dialogImageUrl: "",
      dialogVisible: false,
      controlslist: "nodownload",
    };
  },
  computed: {
    imgListStyle() {
      return {
        width: this.imgW + "px",
        height: this.imgH + "px",
      };
    },
    isUploadIcon() {
      return this.isLoading ? "el-icon-loading" : "el-icon-plus";
    },
  },
  watch: {
    value(value) {
      this.transImgVal(value);
    },
    dialogVisible(dialogVisible) {
      if (!dialogVisible) {
        this.$refs.videoRef.pause();
      }
    },
  },
  mounted() {
    this.transImgVal(this.value);
    // 添加全局拖拽事件监听
    document.addEventListener('dragover', this.onGlobalDragOver);
    document.addEventListener('drop', this.onGlobalDrop);
  },
  
  beforeDestroy() {
    // 移除全局事件监听器
    document.removeEventListener('dragover', this.onGlobalDragOver);
    document.removeEventListener('drop', this.onGlobalDrop);
  },
  methods: {
    // 拖拽开始时存储当前拖拽元素的信息
    onDragStart(event, item, index) {
      console.log('开始拖拽元素:', item, '索引:', index);
      
      // 打印详细的源DOM节点信息
      console.log('拖拽源DOM节点:', event.target);
      console.log('源节点类型:', event.target.tagName);
      console.log('源节点类名:', event.target.className);
      console.log('源节点HTML结构:', event.target.outerHTML.substring(0, 150) + '...');
      
      // 打印源节点的父节点信息
      const parentElement = event.target.parentNode;
      console.log('源父节点:', parentElement);
      console.log('源父节点类型:', parentElement?.tagName);
      console.log('源父节点类名:', parentElement?.className);
      
      // 打印源节点最近的列表项容器
      const closestItem = event.target.closest('.el-upload-list__item');
      console.log('源最近的列表项容器:', closestItem);
      if (closestItem) {
        console.log('容器类型:', closestItem.tagName);
        console.log('容器类名:', closestItem.className);
        console.log('容器ID:', closestItem.id);
        console.log('容器数据属性:', Object.entries(closestItem.dataset));
      }
      
      // 存储当前拖拽的项目信息到组件实例上
      this.dragItem = item;
      this.dragIndex = index;
      
      // 设置拖拽数据，使用json格式存储
      // 存储当前项的索引和内容
      event.dataTransfer.setData('application/json', JSON.stringify({
        index: index,
        item: item,
        listId: 'imgList', // 标记列表ID，用于识别跨列表拖拽
        containerType: 'media', // 可以用于识别容器类型
        sourceElement: { // 源元素信息
          tagName: event.target.tagName,
          className: event.target.className,
          id: event.target.id || '',
          parentId: event.target.parentNode?.id || ''  
        }
      }));
      
      // 设置拖拽效果
      event.dataTransfer.effectAllowed = 'move';
      
      // 添加拖拽中的样式
      event.target.classList.add('dragging');
    },

    // 元素拖拽经过可放置区域时触发
    onDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      
      // 打印当前拖拽路径上的所有元素
      const targetElement = event.target;
      console.log('==== 拖拽路径节点详情 ====');
      console.log('直接悬停元素:', targetElement);
      console.log('悬停元素类型:', targetElement.tagName);
      console.log('悬停元素类名:', targetElement.className);
      
      // 打印悬停点坐标位置的所有元素堆栈
      const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
      console.log('拖拽光标位置坐标:', event.clientX, event.clientY);
      console.log('拖拽路径上的元素堆栈:', elementsAtPoint);
      
      // 打印每个路径上元素的基本信息
      if (elementsAtPoint.length > 0) {
        console.log('拖拽路径元素详情:');
        elementsAtPoint.forEach((el, index) => {
          console.log(`${index}. ${el.tagName}.${el.className || '无类名'}${el.id ? ' #'+el.id : ''}`);
        });
      }
    },

    // 元素进入可放置区域时触发
    onDragEnter(event) {
      // 添加样式来配置反馈
      const listItem = event.target.closest('.el-upload-list__item');
      if (listItem) {
        listItem.classList.add('drag-over');
      }
    },

    // 元素离开可放置区域时触发
    onDragLeave(event) {
      // 移除样式
      const listItem = event.target.closest('.el-upload-list__item');
      if (listItem) {
        listItem.classList.remove('drag-over');
      }
    },

    // 元素放置到目标区域时触发
    onDrop(event, targetIndex) {
      event.preventDefault();
      
      // 打印详细的DOM节点信息
      console.log('拖拽目标DOM节点:', event.target);
      console.log('目标节点类型:', event.target.tagName);
      console.log('目标节点类名:', event.target.className);
      
      // 打印父节点信息
      const parentElement = event.target.parentNode;
      console.log('父节点:', parentElement);
      console.log('父节点类型:', parentElement?.tagName);
      console.log('父节点类名:', parentElement?.className);
      
      // 打印最近的列表项容器
      const closestItem = event.target.closest('.el-upload-list__item');
      console.log('最近的列表项容器:', closestItem);
      if (closestItem) {
        console.log('容器类型:', closestItem.tagName);
        console.log('容器类名:', closestItem.className);
      }
      
      // 打印在同一级别的所有兄弟元素
      if (closestItem && closestItem.parentNode) {
        const siblings = Array.from(closestItem.parentNode.children);
        console.log('同级兄弟元素数量:', siblings.length);
        console.log('当前项在同级中的索引:', siblings.indexOf(closestItem));
      }
      
      // 移除高亮样式
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      
      try {
        // 获取被拖拽的数据
        const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
        const { index: dragIndex } = dragData;
        
        console.log('拖拽元素放置完成:', 
                  '从索引', dragIndex, 
                  '到索引', targetIndex);
        
        // 如果不是同一个元素，则进行排序操作
        if (dragIndex !== targetIndex) {
          console.log('重新排序列表');
          
          // 添加排序逻辑
          const newList = [...this.imgList];
          // 删除拖拽的元素
          const [removed] = newList.splice(dragIndex, 1);
          // 在新位置插入元素
          newList.splice(targetIndex, 0, removed);
          
          // 更新列表并触发变化事件
          this.imgList = newList;
          this.updateList(newList);
          
          // 触发排序完成事件
          this.$emit('sort-change', {
            oldIndex: dragIndex,
            newIndex: targetIndex,
            list: newList
          });
        }
      } catch (error) {
        console.error('拖拽处理错误:', error);
      }
    },

    // 拖拽结束时触发
    onDragEnd(event) {
      console.log('拖拽结束');
      // 移除所有拖拽相关的样式
      document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      
      // 清除拖拽相关的状态
      this.dragItem = null;
      this.dragIndex = -1;
    },

    // 整个上传组件区域的拖拽监听
    onPageDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      
      // 记录鼠标位置
      this.lastMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
      
      console.log('拖拽经过组件区域 - 位置:', event.clientX, event.clientY);
    },
    
    // 在组件区域放置
    onPageDrop(event) {
      event.preventDefault();
      console.log('在组件区域放置 - 位置:', event.clientX, event.clientY);
      
      try {
        // 获取拖拽数据
        const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
        
        // 如果没有命中具体项，则添加到列表末尾
        const targetItem = event.target.closest('.el-upload-list__item');
        if (!targetItem) {
          console.log('放置到组件区域空白处 - 考虑放置到列表末尾');
          // 这里可以实现其他逻辑，如移动到列表末尾
        }
      } catch (error) {
        console.error('处理拖拽数据错误:', error);
      }
      
      // 清除样式
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    },
    
    // 全局拖拽事件监听
    onGlobalDragOver(event) {
      // 防止浏览器默认行为
      event.preventDefault();
      
      // 判断是否是本组件内创建的拖拽
      if (this.dragItem !== null) {
        // 详细打印DOM节点信息
        console.log('==== 全局拖拽路径监控 ====');
        console.log('全局拖拽位置坐标:', event.clientX, event.clientY);
        
        // 打印直接悬停元素
        const directTarget = event.target;
        console.log('全局直接悬停元素:', directTarget);
        console.log('元素标签:', directTarget.tagName);
        console.log('元素类名:', directTarget.className);
        console.log('元素ID:', directTarget.id || '无ID');
        
        // 打印DOM路径
        console.log('元素DOM路径:');
        let currentEl = directTarget;
        let pathString = '';
        let pathArray = [];
        
        while (currentEl && currentEl !== document.body) {
          const elDesc = `${currentEl.tagName.toLowerCase()}${currentEl.id ? '#'+currentEl.id : ''}${currentEl.className ? '.'+currentEl.className.replace(/ /g, '.') : ''}`;
          pathString = pathString ? `${elDesc} > ${pathString}` : elDesc;
          pathArray.unshift(elDesc);
          currentEl = currentEl.parentElement;
        }
        
        console.log('DOM路径字符串:', pathString);
        console.log('DOM路径数组:', pathArray);
        
        // 判断悬停元素堆栈
        const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
        console.log('全部悬停元素数量:', elementsAtPoint.length);
        console.log('悬停元素堆栈:', 
          elementsAtPoint.map((el, idx) => `${idx+1}. ${el.tagName}${el.id ? '#'+el.id : ''}.${el.className || '无类名'}`).join('\n'));
          
        // 查找与拖拽相关的特殊元素
        const dropTarget = elementsAtPoint.find(el => el.classList.contains('el-upload-list__item'));
        if (dropTarget) {
          console.log('找到潜在的放置目标元素:', dropTarget);
          console.log('目标元素类型:', dropTarget.tagName);
          console.log('目标元素类名:', dropTarget.className);
          
          // 标记该元素为潜在放置目标
          document.querySelectorAll('.potential-drop-target').forEach(el => 
            el.classList.remove('potential-drop-target'));
          dropTarget.classList.add('potential-drop-target');
        }
      }
    },
    
    // 全局放置事件监听
    onGlobalDrop(event) {
      // 防止浏览器默认行为
      event.preventDefault();
      
      if (this.dragItem !== null) {
        console.log('全局放置 - 位置:', event.clientX, event.clientY);
        
        try {
          // 通过坐标判断要放置的位置
          const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
          const targetElement = elementsAtPoint.find(el => 
            el.closest('.el-upload-list__item') || 
            el.closest('.upload-queue'));
          
          if (targetElement) {
            console.log('放置到目标元素:', targetElement.tagName, targetElement.className);
            // 这里可以实现更精细的逻辑
          } else {
            console.log('放置到页面的其他区域');
          }
        } catch (error) {
          console.error('全局放置处理错误:', error);
        }
        
        // 重置拖拽状态
        this.dragItem = null;
        this.dragIndex = -1;
      }
      
      // 清除所有拖拽相关样式
      document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    },

    transImgVal(value) {
      this.imgList = value ? value.split(",") : [];
    },
    updateList(list) {
      this.$emit("input", list.toString());
    },
    beforeUpload(file) {
      if (file?.name.indexOf("+") !== -1) {
        this.msgError("上传的文件名称不能包含‘+’字符");
        return false;
      }
      
      if (this.isVideo) {
        return this.handleCheckVideo(file);
      } else {
        return this.handleCheckImage(file);
      }
    },
    handleCheckVideo(file) {
      const isValidFormat = file.type.indexOf("video") !== -1;
      const isLt100 = file.size / 1024 / 1024 < 100;
      if (!isValidFormat) {
        this.msgError("视频格式不正确!");
        return false;
      } else if (!isLt100) {
        this.msgError("视频大小不能超过 100MB!");
        return false;
      } else {
        this.isLoading = true;
        return true;
      }
    },
    handleCheckImage(file) {
      const isValidFormat = file.type.indexOf("image") !== -1;
      const isLt50M = file.size / 1024 / 1024 < 50;
      const maxLt = this.max === 1 && this.imgList.length > 0;

      if (!isValidFormat) {
        this.msgError("图片格式不正确!");
        return false;
      } else if (!isLt50M) {
        this.msgError("图片大小不能超过 50MB!");
        return false;
      } else if (maxLt) {
        this.msgError("只能上传一张图片，请删除后再上传!");
        return false;
      } else {
        this.isLoading = true;
        return isValidFormat && isLt50M && !maxLt;
      }
    },
    handleSuccess(res) {
      this.isLoading = false;
      this.imgList.push(res.data[0].url);
      this.$emit("input", this.imgList.toString());
    },

    handleError() {
      this.isLoading = false;
      this.$message.error("上传失败!");
    },

    handleRemove(file, index) {
      this.imgList.splice(index, 1);
      this.$emit("input", this.imgList.toString());
    },

    handlePreview(url) {
      if (this.isVideo) {
        this.dialogImageUrl = url;
        this.dialogVisible = true;
      } else {
        this.$viewerApi({
          images: [url],
        });
      }
    },
  },
};
</script>
