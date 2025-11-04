<template>
    <setting-card title="自动续期SSL证书">
        <div class="flex items-center">
            <div class="text-base mr-[3rem]">自动续期</div>
            <el-switch :model-value="status" :loading="loading" @change="onUpdateStatus"></el-switch>
        </div>
    </setting-card>
</template>

<script lang="ts" setup>
import { status, loading, onUpdateStatus, getStatus } from './useMethod'
import SettingCard from '@mail/public/setting-card.vue'

onMounted(() => {
    getStatus()
})
</script>
