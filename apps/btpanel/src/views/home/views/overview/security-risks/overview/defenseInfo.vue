<template>
	<div>
		<div class="flex items-center justify-between text-small">
			<div>
				已累计保护您的资产<strong class="text-iconLarge mx-[0.4rem] text-primary">{{ safeDay }}</strong
				>天
			</div>
			<div class="leading-[2rem]">
				<div class="flex items-center">
					<span>已开启安全能力</span>
					<ul class="flex ml-[0.6rem]">
						<li v-for="(item, index) in capabilitySwitch" class="mr-[0.1rem]">
							<img alt="" :title="item.name" :src="`/static/images/home/${item.icon}${item.status ? '-active' : ''}.svg`" width="14" />
						</li>
					</ul>
				</div>
				<div>首页风险扫描时间：{{ scanTime }}</div>
				<div>病毒库版本更新时间：{{ virusUpdateTime }}</div>
			</div>
		</div>
		<el-divider direction="horizontal" class="!mb-[1.8rem] !mt-0"></el-divider>
		<div class="flex ml-[1rem] text-base text-bold">
			<div class="flex items-center mr-[2rem]">
				<span class="mr-2">恶意文件检测</span>
				<bt-switch size="small" v-model="capabilitySwitch.file_detection.status" @change="dynamicKillSwitch"></bt-switch>
			</div>
			<div class="flex items-center mr-[2rem]">
				<span class="mr-2">漏洞扫描</span>
				<bt-switch size="small" v-model="capabilitySwitch.vul_scan.status" @change="safeScanAlertDialog"></bt-switch>
			</div>
			<div class="flex items-center">
				<span class="mr-2">入侵检测</span>
				<bt-switch size="small" v-model="capabilitySwitch.hids.status" @change="hidsSwitch"></bt-switch>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import HOME_SECURITY_OVERVIEW_STORE from './store'
import { storeToRefs } from 'pinia'
import { useConfirm, useDataHandle, useDialog, Message } from '@/hooks/tools'
import { setWebshellConfig, setHids } from '@/api/home'
import { getPluginInfo } from '@/api/site'
import { useGlobalStore } from '@/store/global'
const { enterpriseRec } = useGlobalStore()
const store = HOME_SECURITY_OVERVIEW_STORE()
const { capabilitySwitch } = store
const { safeDay, scanTime, virusUpdateTime, isMalwareConfirm } = storeToRefs(store)

// 恶意文件检测开关
const dynamicKillSwitch = async (val: any) => {
	let mode = val ? '开启' : '关闭'
	let text = val ? '将全天候检测系统是否存在恶意文件' : '将不再检测系统是否存在恶意文件'
	try {
		await useConfirm({
			title: `${mode}动态查杀`,
			content: `${mode}后，${text}，是否继续？`,
		})
		capabilitySwitch.file_detection.status = val
		await useDataHandle({
			loading: '正在保存配置，请稍后...',
			request: setWebshellConfig({ dynamic_detection: val }),
			message: true,
		})
	} catch {
		capabilitySwitch.file_detection.status = !val
	}
}

/**
 * @description 漏洞扫描开关
 * @returns {Promise<App>}
 */
const safeScanAlertDialog = () => {
	useDialog({
		title: '设置自动扫描',
		area: 54,
		component: () => import('../safe-scan-alert/index.vue'),
		showFooter: true,
		close: () => {
			if (isMalwareConfirm.value) {
				isMalwareConfirm.value = false
				return
			}
			capabilitySwitch.vul_scan.status = !capabilitySwitch.vul_scan.status
		},
	})
}

// 入侵检测开关
const hidsSwitch = async (val: any) => {
	if (val) {
		const { data: pluginData } = await getPluginInfo({ sName: 'bt_hids' })
		if (pluginData.setup) {
			await setHidsSwitch()
		} else {
			Message.error('请先安装入侵检测插件')
			capabilitySwitch.hids.status = false
		}
	} else {
		await setHidsSwitch()
	}
	async function setHidsSwitch() {
		const res = await setHids()
		Message.request(res)
	}
}
</script>
