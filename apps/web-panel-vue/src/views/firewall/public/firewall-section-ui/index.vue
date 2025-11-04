<template>
    <div class="firewall-section-ui" :style="style">
        <div class="title">{{ title }}</div>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="tsx">
defineProps<{
    title: string,
    style?: {}
}>()
</script>

<style scoped lang="scss">
.firewall-section-ui {
    width: 1370px;
    @media (max-width: 1630px) {
        width: 100%;
    }
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    margin-bottom: 15px;
    overflow: hidden;
    .content {
        @apply p-2rem;
    }
    .title {
        @apply px-12px py-16px text-base font-600;
        color: var(--el-color-text-secondary);
        background-color: var(--el-fill-color-lighter);
        border-bottom: 1px solid var(--el-border-color-light);
    }
}
</style>