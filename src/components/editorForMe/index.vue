<template>
    <div class="full-screen-container">
        <Toolbar style="border-bottom: 1px solid #ccc" v-show="isEdit" :editor="editor" :defaultConfig="toolbarConfig" :mode="mode" />
        <Editor :style="{ 'height': editorH }" v-model="html" :readOnly="isEdit" :defaultConfig="editorConfig" :mode="mode"
            @onCreated="onCreated" />
    </div>
</template>
<script>
import Vue from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import reqUrl from "@/utils/requestUrl";
export default Vue.extend({
    components: { Editor, Toolbar },
    props: {
        editorH: {
            type: String | Number,
            default: 400
        },
        isEdit: {
            type: [Boolean, Number, String],
            default: true
        }
    },
    data() {
        const customCheckLinkFn = (text, url) => {
            if (!/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(url)) {
                return this.msgError('请输入正确的链接地址')
            }
            return true
        }
        const customParseLinkUrl = (url) => {
            if (url.indexOf('http') !== 0) {
                return `http://${url}`
            }
            return url
        }
        const customCheckImageFn = (src, alt, url) => {
            if (!src) {
                return
            }
            if (src.indexOf('http') !== 0) {
                return this.msgError('图片网址必须以 http/https 开头')
            }
            return true
        }
        const customParseImageSrc = (src) => {
            if (src.indexOf('http') !== 0) {
                return `http://${src}`
            }
            return src
        }
        return {
            editor: null,
            html: '',
            toolbarConfig: {
                excludeKeys: ["bold"]
            },
            editorConfig: {
                placeholder: '请输入内容...',
                focus: true,
                MENU_CONF: {
                    // 链接
                    insertLink: {
                        checkLink: customCheckLinkFn,
                        parseLinkUrl: customParseLinkUrl
                    },
                    editLink: {
                        checkLink: customCheckLinkFn,
                        parseLinkUrl: customParseLinkUrl
                    },
                    // 上传图片
                    uploadImage: {
                        server: reqUrl + "/oss/batch-upload",
                        fieldName: 'file',
                        maxFileSize: 5 * 1024 * 1024,
                        base64LimitSize: 5 * 1024, // 5kb
                        customInsert: (res, insertFn) => {
                            console.log(res, '图片地址')
                            const { url } = res.data[0]
                            insertFn(url)
                        }
                    },
                    insertImage: {
                        onInsertedImage(imageNode) {
                            if (imageNode == null) return
                            const { src, alt, url, href } = imageNode
                            console.log('inserted image', src, alt, url, href)
                        },
                        checkImage: customCheckImageFn, // 也支持 async 函数
                        parseImageSrc: customParseImageSrc, // 也支持 async 函数
                    },
                    editImage: {
                        onUpdatedImage(imageNode) {
                            if (imageNode == null) return

                            const { src, alt, url } = imageNode
                        },
                        checkImage: customCheckImageFn, // 也支持 async 函数
                        parseImageSrc: customParseImageSrc, // 也支持 async 函数
                    },
                    // 上传视频
                    uploadVideo: {
                        server: reqUrl + "/oss/batch-upload",
                        fieldName: 'file',
                        maxFileSize: 30 * 1024 * 1024,
                        maxNumberOfFiles: 3,
                        customInsert: (res, insertFn) => {
                            const { url } = res.data[0]
                            insertFn(url)
                        }
                    }
                }
            },
            mode: 'default', // or 'simple'
        }
    },
    watch: {
        isEdit(newVal, oldVal) {
            if(!newVal) {
                this.editor.disable()
            } else {
                this.editor.enable()
            }
        }
    },
    methods: {
        onCreated(editor) {
            this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
            const menu = this.editor.getAllMenuKeys()
            // console.log('menu', menu)
            // console.log(this.editor.getMenuConfig("bold"))
        },
        clear() {
            this.editor.clear()
        }
    },
    beforeDestroy() {
        const editor = this.editor
        if (editor == null) return
        editor.destroy() // 组件销毁时，及时销毁编辑器
    }
})
</script>
<style src="@wangeditor/editor/dist/css/style.css">
</style>
<style lang="scss">
    .full-screen-container {
        border: 1px solid #ccc;
        z-index: 6666;
        .w-e-text-container [data-slate-editor] {
            min-height: calc(100vh - 330px);
        }
    }
</style>