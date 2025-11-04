<template>
	<div v-bt-loading="viewLoad" v-bt-loading:title="'正在获取配置信息,请稍后...'">
		<!-- ssh登录配置模块 -->
		<FirewallSectionUI title="SSH基础设置">
			<SSHSetting class="top-label-title" :data="basicConfigData" @refresh="getBasicConfigEvent"></SSHSetting>
		</FirewallSectionUI>
		<!-- root配置模块 -->
		<FirewallSectionUI title="Root设置">
			<RootSetting :data="basicConfigData" @refresh="getBasicConfigEvent"></RootSetting>
		</FirewallSectionUI>
		<!-- 其他配置模块 : SSH登录告警/防爆破-->
		<FirewallSectionUI title="安全功能">
			<OtherSetting :data="basicConfigData" @refresh="getBasicConfigEvent"></OtherSetting>
		</FirewallSectionUI>
	</div>
</template>

<script setup lang="ts">
import { getSSHBasicConfig } from '@/api/firewall'
import { useDataHandle } from '@hooks/tools'

import OtherSetting from './other-setting/index.vue'
import RootSetting from './root-setting.vue'
import SSHSetting from './ssh-setting.vue'
import FirewallSectionUI from '@firewall/public/firewall-section-ui/index.vue'

const basicConfigData = ref()
const viewLoad = ref(true) // 页面加载loading

/**
 * @description: 获取基础配置信息
 */
const getBasicConfigEvent = async () => {
	const res: any = await useDataHandle({
		loading: viewLoad,
		request: getSSHBasicConfig(),
	})
	basicConfigData.value = res.data
}

onMounted(() => {
	getBasicConfigEvent() // 获取基础配置信息
})
</script>

<style scoped>
:deep(.el-form-item__label) {
	@apply font-600 mr-auto justify-start;
}
</style>
