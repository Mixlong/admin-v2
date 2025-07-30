<template>
    <div class="app-container">
        <div> </div>
        <!-- <div>{{ userStore }}</div> -->
        <DictTag :options="sys_user_sex" :value="1" />

    </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { useDict } from
    '@/utils/dict'
const userStore = useUserStore()
const { sys_user_sex } =
    useDict('sys_user_sex')
console.log("🚀 ~ sys_user_sex:", sys_user_sex)


const route = useRoute()
</script>
