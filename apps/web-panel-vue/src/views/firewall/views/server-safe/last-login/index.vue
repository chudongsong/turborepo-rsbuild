<template>
    <div class="last-login flex flex-col">
        <span class="primary text-medium font-600 mb-[16px]">最后登录信息</span>
        <div class="msg-section flex flex-col gap-[16px]">
            <div class="msg-item p-[2rem]">
                <div class="msg-title flex justify-between items-center">
                    <span class="text-base font-600 text-secondary h-[2rem] leading-[2rem]">SSH登录</span>
                    <span v-if="lastSSHLoginInfo.status" class="status text-primary">成功</span>
                </div>
                <div class="msg-content mt-4">
                    <span class="content-item ip">IP：{{ lastSSHLoginInfo.address || '-' }}</span>
                    <span class="content-item time">时间：{{ lastSSHLoginInfo.time || '-' }}</span>
                    <span class="content-item port">端口：{{ lastSSHLoginInfo.port || '-' }}</span>
                </div>
            </div>
            <div class="msg-item p-[2rem]">
                <div class="msg-title flex justify-between items-center">
                    <span class="text-base font-600 text-secondary h-[2rem] leading-[2rem]">面板登录</span>
                    <span v-if="lastPanelLoginInfo.login_type" class="status text-primary">成功</span>
                </div>
                <div class="msg-content mt-4">
                    <span class="content-item ip">IP：{{ lastPanelLoginInfo.remote_addr || '-' }}</span>
                    <span class="content-item time">时间：{{ lastPanelLoginInfo.login_time ? formatTime(lastPanelLoginInfo.login_time) : '-' }}</span>
                    <span class="content-item port">端口：{{ lastPanelLoginInfo.remote_port || '-' }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="tsx">
import { formatTime } from '@/utils'
import { useDataHandle } from '@/hooks/tools'
import { getSshLogs, getLoginInfo } from '@api/logs'

// 本地状态
const lastSSHLoginInfo = ref<any>({})
const lastPanelLoginInfo = ref<any>({})

// 获取数据
const fetchLoginInfo = async () => {
    try {
        lastSSHLoginInfo.value = await getLastSSHLoginInfo()
        lastPanelLoginInfo.value = await getLastPanelLoginInfo()
    } catch (error) {
        console.error('获取登录信息失败:', error)
    }
}

/**
 * @description 获取最近一条SSH登录成功信息
 */
 const getLastSSHLoginInfo = async () => {
    try {
        const params = {
            search: "",
            p: 1,
            limit: 1,
            select: "Accepted",
            historyType: "All"
        }
        const res: any = await useDataHandle({
            request: getSshLogs({ data: JSON.stringify(params) }),
            data: { data: Array },
        })
        return res.data[0] || {}
    } catch (error) {
        console.error('获取SSH登录信息失败:', error)
        return {}
    }
}

/**
 * @description 获取最近一条面板登录成功信息
 */
const getLastPanelLoginInfo = async () => {
    try {
        const params = {
            search: "",
            limit: 5,
            login_type: "1",
            page: 1
        }
        const res: any = await useDataHandle({
            request: getLoginInfo(params),
            data: { data: Array },
        })
        return res.data[0] || {}
    } catch (error) {
        console.error('获取面板登录信息失败:', error)
        return {}
    }
}

onMounted(() => {
    fetchLoginInfo()
})
</script>

<style scoped lang="scss">
.msg-item {
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
}
.msg-content {
    display: flex;
    justify-content: space-between;
    .content-item {
        @apply text-small text-secondary;
    }
}
</style>