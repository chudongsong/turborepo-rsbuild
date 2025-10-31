<template>
	<div class="flex flex-wrap mt-4">
		<div v-for="(item, index) in risk_details" class="flex flex-col items-center w-[11rem] mb-[1rem]">
			<div>
				<span>{{ item.title }}</span>
				<el-tooltip :content="item.tips" placement="top">
					<span class="ml-4px bt-ico-ask">?</span>
				</el-tooltip>
			</div>
			<div class="text-subtitleLarge cursor-pointer" :class="item.value > 0 ? 'text-default' : 'text-secondary'" @click="haneleSafeSwitch(item)">{{ item.value }}</div>
		</div>
	</div>
</template>
<script lang="tsx" setup>
import HOME_SECURITY_OVERVIEW_STORE from './store'
import HOME_SECURITY_RISKS_STORE from '../store'
import { storeToRefs } from 'pinia'
import { Message } from '@/hooks/tools'
import { openPluginView } from '@/public/index'

const store = HOME_SECURITY_OVERVIEW_STORE()
const { risk_details } = storeToRefs(store)
const { riskInstallDetails } = store
const { repairTypeActive } = storeToRefs(HOME_SECURITY_RISKS_STORE())

// 点击切换
const haneleSafeSwitch = (item: any) => {
	switch (item.type) {
		case 'vul_scan':
			repairTypeActive.value = 'web'
			break
		case 'file_detection':
			repairTypeActive.value = 'malware'
			break
		case 'homepage_risk':
			repairTypeActive.value = 'risk'
			break
		case 'safe_detect':
			repairTypeActive.value = 'safeDetect'
			break
		case 'hids':
			if (!riskInstallDetails.hids) return Message.error('请先安装入侵检测插件')
			openPluginView({ name: 'bt_hids' })
			break
		case 'tamper':
			if (!riskInstallDetails.tamper) return Message.error('请先安装堡塔企业级防篡改插件')
			openPluginView({ name: 'tamper_core' })
			break
	}
}
</script>
<style lang="scss" scoped>
.bt-ico-ask {
	display: inline-block;
}
</style>
