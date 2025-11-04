<template>
    <div class="sec-detect">
        <div class="sec-head flex items-center mb-[16px]">
            <span class="text-medium font-600">安全评分：</span>
            <span class="sec-score ml-2 text-large font-600" :class="getScoreClass(score)">{{ score }}/{{ totalScore }}</span>
            <span class="sec-text text-base text-secondary ml-4">{{ scoreText }}</span>
            <bt-button class="ml-auto" type="primary" @click="openRecommendConfig()">
                <bt-icon icon="el-setting" :size="16" color="#ffffff" />
                <span class="ml-2">安全配置</span>
            </bt-button>
        </div>
        <div v-bt-loading="loading" :class="{ 'min-h-[10rem]': loading }">
            <el-row class="mt-[1.2rem]" :gutter="16">
                <el-col 
                    v-for="item in securityItems" 
                    :key="item.id"
                    :lg="6" 
                    :xl="6"
                    class="!flex mb-[16px]"
                    :class="{ 'cursor-pointer': !item.enabled }"
                    @click="handleItemClick(item)"
                >
                    <div 
                        class="security-item p-[2rem]"
                        :class="{ 'item-disabled': !item.enabled }"
                    >
                        <div class="item-header flex">
                            <div class="flex-shrink-0">
                                <bt-icon icon="el-success-filled" :size="16" color="#20a53a" v-if="item.enabled"></bt-icon>
                                <bt-icon icon="el-circle-close-filled" :size="16" color="#ef0808" v-else></bt-icon>
                            </div>
                            <div class="item-content ml-4">
                                <h3 class="text-base font-600">{{ item.title }}</h3>
                                <p class="sec-desc text-small text-secondary mt-4">{{ item.description }}</p>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script setup lang="tsx">
import { 
    loading, 
    securityItems, 
    totalScore, 
    score, 
    scoreText, 
    fetchSecDetect, 
    openRecommendConfig, 
    handleItemClick
 } from './useController'

const getScoreClass = (score: number) => {
    if (score <= 50) return 'text-danger'
    if (score > 50 && score < 80) return 'text-warning'
    return 'text-primary'
}

onMounted(fetchSecDetect)
</script>

<style scoped lang="scss">

.sec-score {
    letter-spacing: 1px;
}

.sec-head {
    padding-bottom: 1.2rem;
    border-bottom: 1px solid var(--el-border-color-light);
}

.security-item {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
    border: 1px solid var(--el-color-primary-light-8);
    border-radius: var(--el-border-radius-base);
    background-color: rgba(var(--el-color-primary-rgb), .05);
    .sec-desc {
        line-height: 1.5;
    }
    &:hover {
        border-color: var(--el-color-primary);
        box-shadow: var(--el-box-shadow-light);
    }
    
    &.item-disabled {
        border-color: var(--el-color-danger-light-8);
        border-radius: var(--el-border-radius-base);
        background-color: rgba(var(--el-color-danger-rgb), .05);
        
        &:hover {
            border-color: var(--el-color-danger);
            box-shadow: var(--el-box-shadow-light);
        }
    }
}
</style>