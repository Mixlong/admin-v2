<template>
    <div class="rich-text-display" v-if="content">
        <div v-html="sanitizedContent" class="rich-text-content"></div>
    </div>
    <span v-else class="no-content">{{ placeholder }}</span>
</template>

<script>
export default {
    name: 'RichTextDisplay',
    props: {
        content: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: '-'
        },
        maxHeight: {
            type: String,
            default: 'none'
        }
    },
    computed: {
        sanitizedContent() {
            if (!this.content) return '';

            // 基本的HTML清理，移除潜在的危险标签和属性
            let cleaned = this.content
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                .replace(/<object[^>]*>.*?<\/object>/gi, '')
                .replace(/<embed[^>]*>/gi, '')
                .replace(/on\w+="[^"]*"/gi, '')
                .replace(/javascript:/gi, '');

            return cleaned;
        }
    }
}
</script>

<style lang="scss" scoped>
.rich-text-display {
    .rich-text-content {
        line-height: 1.6;
        color: #303133;
        word-break: break-word;

        ::v-deep {

            // 富文本内容样式
            p {
                margin: 0 0 8px 0;

                &:last-child {
                    margin-bottom: 0;
                }
            }

            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
                margin: 12px 0 8px 0;
                font-weight: 600;
                color: #303133;

                &:first-child {
                    margin-top: 0;
                }
            }

            h1 {
                font-size: 18px;
            }

            h2 {
                font-size: 16px;
            }

            h3 {
                font-size: 15px;
            }

            h4 {
                font-size: 14px;
            }

            h5 {
                font-size: 13px;
            }

            h6 {
                font-size: 12px;
            }

            ul,
            ol {
                margin: 8px 0;
                padding-left: 20px;

                li {
                    margin: 4px 0;
                    line-height: 1.5;
                }
            }

            blockquote {
                margin: 8px 0;
                padding: 8px 12px;
                border-left: 3px solid #e1e8ed;
                background: #f8f9fa;
                color: #666;
                font-style: italic;
            }

            code {
                background: #f1f2f3;
                padding: 2px 4px;
                border-radius: 3px;
                font-size: 0.9em;
                color: #e83e8c;
            }

            pre {
                background: #f8f9fa;
                padding: 12px;
                border-radius: 4px;
                overflow-x: auto;
                margin: 8px 0;

                code {
                    background: none;
                    padding: 0;
                    color: #333;
                }
            }

            strong,
            b {
                font-weight: 600;
                color: #303133;
            }

            em,
            i {
                font-style: italic;
            }

            a {
                color: #409eff;
                text-decoration: none;

                &:hover {
                    text-decoration: underline;
                }
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin: 8px 0;

                th,
                td {
                    border: 1px solid #e4e7ed;
                    padding: 8px 12px;
                    text-align: left;
                }

                th {
                    background: #f5f7fa;
                    font-weight: 600;
                }
            }

            img {
                max-width: 100%;
                height: auto;
                border-radius: 4px;
                margin: 4px 0;
            }
        }
    }
}

.no-content {
    color: #c0c4cc;
    font-style: italic;
}
</style>




