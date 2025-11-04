<template>

    <!-- 已安装状态 -->
    <div class="prot-record" v-if="isInstallSshBlast">
        <div class="flex items-center mb-[14px]">
            <div class="title-wrapper flex items-center">
                <span class="primary text-medium font-600">SSH防护记录</span>
                <bt-switch
                    v-model="antiBruteForce"
                    class="ml-4"
                    @change="(val: boolean) => onChangeSshBlast(val)"
                />
                <bt-button
                    class="ml-4"
                    type="primary"
                    size="small"
                    @click="openAntiBlastConfig"
                >
                    配置
                </bt-button>
            </div>
            <div class="btn ml-auto">
                <span class="bt-link" @click="openAntiBlastLogs">查看详情</span>
            </div>
        </div>
        
        <!-- 统计卡片 -->
        <div class="flex items-center justify-around gap-[1.2rem]" v-bt-loading="antiBlastLoading">
            <div v-for="(item, index) in antiBlastStats" :key="index" class="item-box flex flex-col items-center px-[.8rem] py-[1.2rem]">
                <span class="font-bold text-large">{{ item.num || 0 }}</span>
                <span class="text-small text-tertiary mt-[.8rem]">{{ item.title }}</span>
            </div>
        </div>
    </div>
    <div class="prot-record flex items-center" v-else>
        <div class="icon-wrapper mr-4 h-[4.8rem] leading-[4.8rem]">
            <i class="svgtofont-el-warning text-warning !text-[4.8rem]"></i>
        </div>
        <div class="title-wrapper flex flex-col">
            <span class="primary text-medium font-600 mb-2">SSH防爆破功能未安装</span>
            <span class="secondary text-secondary text-small">安装SSH防爆破功能后，可以有效防止恶意登录尝试</span>
        </div>
        <div class="btn ml-auto">
            <bt-button type="primary" @click="checkFailbn">安装SSH防爆破</bt-button>
        </div>
    </div>
</template>

<script setup lang="tsx">
import { getSSHInfo, getAntiBlastLogs, installFail2ban } from '@/api/firewall'
import { getPluginInfo } from '@/api/global'
import { pluginInstallDialog } from '@/public/index'
import { useMessage, useDataHandle, useDialog, useConfirm } from '@hooks/tools'
import { fetchSecDetect, antiBruteForce } from '../sec-detect/useController'
import { setAntiConf } from '@/api/firewall'


import { INSTALL_STORE, useIntstallStore } from '@components/business/bt-soft-install/store'

const installStore = INSTALL_STORE()
const { install, init } = installStore

const { compData: installCompData } = useIntstallStore()

const Message = useMessage()
const isInstallSshBlast = ref(true)
const antiBlastLoading = ref(false)

// 防爆破统计数据
const antiBlastStats = ref([
    { title: '封锁的IP总数', value: 'total_banned', num: 0 },
    { title: '连接失败总数', value: 'total_failed', num: 0 },
    { title: '当前封锁IP数', value: 'currently_banned', num: 0 },
    { title: '当前连接失败次数', value: 'currently_failed', num: 0 },
])

onMounted(() => {
    getSSHInfoEvent()
})

/**
 * @description 获取防火墙信息
 */
const getSSHInfoEvent = async () => {
    try {
        const { data } = await getSSHInfo()
        isInstallSshBlast.value = data.fail2ban.installed
        antiBruteForce.value = Boolean(data.fail2ban.status)
        if (isInstallSshBlast.value) {
            getAntiBlastLogsEvent()
        }
    } catch (error) {
        console.log(error)
    }
}

/**
 * @description 获取防暴破日志
 */
const getAntiBlastLogsEvent = async () => {
    try {
        antiBlastLoading.value = true
        const res: any = await getAntiBlastLogs()
        // 更新统计数据
        antiBlastStats.value.forEach((item: any) => {
            item.num = Number(res.data[item.value]) || 0
        })
    } catch (error) {
        console.error('获取防暴破日志失败:', error)
    } finally {
        antiBlastLoading.value = false
    }
}

/**
 * @description 检查防暴破插件是否安装
 */
const checkFailbn = async (callback?: any) => {
    try {
        const { data }: any = await getPluginInfo({ sName: 'fail2ban' })
        if (!data.setup) {
            await useConfirm({
                title: '安装SSH防爆破插件',
                width: '35rem',
                content: '安装SSH防爆破插件后，可以有效防止恶意登录尝试，是否继续安装？',
            })
            await installFail2ban({"sName":"fail2ban","version":"2","min_version":"2"})
            installCompData.value = {
                name: data.name,
                type: 'i',
                pluginInfo: data,
            }
            await init()
            await install()
            // pluginInstallDialog({
            //     name: data.name,
            //     type: 'i',
            //     pluginInfo: data,
            // })
            // Message.warn('请先安装防暴破插件')
        } else {
            callback && callback()
        }
    } catch (error) {}
}

/**
 * @description 打开防暴破日志
 */
const openAntiBlastLogs = async () => {
    checkFailbn(() =>
        useDialog({
            title: '防暴破日志',
            area: 60,
            compData: { type: 'AntiBlast', requestFn: () => getAntiBlastLogs() },
            component: () => import('@firewall/public/anti-plugin-log/index.vue'),
        })
    )
}

/**
 * @description: 设置防暴破
 */
const onChangeSshBlast = async (val: boolean) => {
	antiBruteForce.value = !val
	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + '防暴破，请稍后...',
		request: setAntiConf({ act: val }),
		message: true,
	})
	antiBruteForce.value = val
	fetchSecDetect()
}

/**
 * @description: 打开防暴破配置
 */
 const openAntiBlastConfig = async () => {
	checkFailbn(() =>
		useDialog({
			title: '配置SSH防暴破',
			area: 40,
			component: () => import('@firewall/views/ssh-manger/basic-setting/other-setting/anti-blast-view.vue'),
			showFooter: true,
		})
	)
}
</script>

<style scoped lang="scss">
.item-box {
    flex: 1;
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
}
</style>