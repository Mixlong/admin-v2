<template>
  <div>
    <img
      :src="options.img"
      @click="editCropper()"
      title="点击上传头像"
      class="img-circle img-lg"
    />
    <el-dialog
      v-model="open"
      :close-on-click-modal="false"
      :title="title"
      width="800px"
      append-to-body
      @opened="modalOpened"
    >
      <el-row>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
            v-if="visible"
            ref="cropperRef"
            :img="options.img"
            :info="true"
            :auto-crop="options.autoCrop"
            :auto-crop-width="options.autoCropWidth"
            :auto-crop-height="options.autoCropHeight"
            :fixed-box="options.fixedBox"
            @real-time="realTime"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload
            action="#"
            :http-request="requestUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button size="small">
              上传
              <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button icon="Plus" size="small" @click="changeScale(1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="Minus" size="small" @click="changeScale(-1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshLeft" size="small" @click="rotateLeft()"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshRight" size="small" @click="rotateRight()"></el-button>
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" size="small" @click="uploadImg()">提 交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { uploadAvatar } from '@/api/system/user'
import useUserStore from '@/store/modules/user'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const cropperRef = ref(null)
const open = ref(false)
const visible = ref(false)
const title = ref('修改头像')
const previews = ref({})

// 图片裁剪数据
const options = reactive({
  img: userStore.avatar, // 裁剪图片的地址
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixedBox: true // 固定截图框大小 不允许改变
})

/** 编辑头像 */
function editCropper() {
  open.value = true
}

/** 打开弹出层结束时的回调 */
function modalOpened() {
  visible.value = true
}

/** 覆盖默认上传行为 */
function requestUpload() {}

/** 向左旋转 */
function rotateLeft() {
  cropperRef.value.rotateLeft()
}

/** 向右旋转 */
function rotateRight() {
  cropperRef.value.rotateRight()
}

/** 图片缩放 */
function changeScale(num) {
  num = num || 1
  cropperRef.value.changeScale(num)
}

/** 上传预处理 */
function beforeUpload(file) {
  if (file.type.indexOf('image/') == -1) {
    ElMessage.error('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。')
  } else {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      options.img = reader.result
    }
  }
}

/** 上传图片 */
function uploadImg() {
  cropperRef.value.getCropBlob(data => {
    const formData = new FormData()
    formData.append('avatarfile', data)
    uploadAvatar(formData).then(response => {
      open.value = false
      // 后端返回的是完整 URL，直接使用
      options.img = response.imgUrl
      userStore.avatar = options.img
      // 重新获取用户信息，确保导航栏头像也更新
      userStore.getInfo()
      ElMessage.success('修改成功')
      visible.value = false
    })
  })
}

/** 实时预览 */
function realTime(data) {
  previews.value = data
}
</script>

<style lang="scss" scoped>
.avatar-upload-preview {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;
}
</style>
