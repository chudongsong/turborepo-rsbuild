<template>
	<div class="p-20px">
		<bt-tabs class="w-full" type="card" v-model="defaultActive" :options="tabComponent" />
		<div class="flex global-switch-malware">
			<div class="flex items-center">
				<span class="mr-[.8rem]">OSS扫描
					<el-tooltip content="开启扫描OSS挂载目录" placement="top"><span class="ml-4px bt-ico-ask">?</span></el-tooltip>
				</span>
				<el-switch class="mr-[.8rem]" v-model="malwareData.ossConfig.status" size="small" @change="ossSwitch" />
			</div>
			<span class="text-tertiary mx-[1.2rem]">|</span>
			<div class="flex items-center">
				<span class="mr-[.8rem]">自动隔离</span>
				<el-switch v-model="malwareData.autoIntercept" size="small" @change="autoInterceptSwitch" />
			</div>
		</div>
		<bt-help :options="[{ content: '避免添加全盘路径的监控，如 &#47' }]" class="ml-[3rem]"></bt-help>
	</div>
</template>

<script lang="ts" setup>
import HOME_SECURITY_RISKS_STORE from '../store'
import { useMessage } from '@/hooks/tools'

const Message = useMessage() // 消息提示
const store = HOME_SECURITY_RISKS_STORE()
const { malwareData } = storeToRefs(store)
const { setMalwareConfig } = store

const defaultActive = ref('monitorPath') // 菜单默认展开项

const tabComponent = ref([
	{
		label: '监控目录',
		name: 'monitorPath',
		lazy: true,
		render: () => import('@home/views/overview/security-risks/advanced-setting/monitor-path.vue'),
	},
	{
		label: '排除目录',
		name: 'excludePath',
		lazy: true,
		render: () => import('@home/views/overview/security-risks/advanced-setting/exclude-path.vue'),
	},
])


// oss扫描开关
const ossSwitch = async (val: any) => {
	if(val && !malwareData.value.ossConfig.isHasMounts) {
		Message.error('当前系统未挂载OSS目录，无法开启OSS扫描')
		malwareData.value.ossConfig.status = false
		return
	}
	malwareData.value.ossConfig.status = val
	await setMalwareConfig({ scan_oss: val })
}
// 自动拦截开关
const autoInterceptSwitch = async (val: any) => {
	malwareData.value.autoIntercept = val
	await setMalwareConfig({ quarantine: val })
}
</script>

<style lang="css" scoped>
.global-switch-malware{
	position: absolute;
	right: 24px;
	top: 72px;
}
</style>
