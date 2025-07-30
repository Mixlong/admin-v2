<template>
    <div>
        <div> </div>
        <!-- <div>{{ userStore }}</div> -->
        <DictTag :options="sys_user_sex" :value="1" />

    </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useDict } from
    '@/utils/dict'
const { sys_user_sex } = useDict('sys_user_sex')
</script>
