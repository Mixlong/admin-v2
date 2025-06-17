<template>
    <span :style="FlagStyle"></span>
</template>

<script>
export default {
    props: {
        flagW: {
            type: String,
            default: "15px"
        },
        flagH: {
            type: String,
            default: "15px"
        },
        borderRadius: {
            type: String,
            default: "50%"
        },
        bgColor: {
            type: String,
            default: "#292828"
        }
    },
    computed: {
        FlagStyle() {
            return {
                width: this.flagW,
                height: this.flagH,
                borderRadius: this.borderRadius,
                background: this.bgColor,
                display: "inline-block",
            }
        }
    }
}
</script>