<template>
	<div class="flex flex-col site-globa-setting-module" v-bt-loading="viewLoading">
		<el-form :model="totalFlowForm">
			<el-form-item label="日流量统计">
				<div class="flex items-center">
					<el-switch @change="handleChangeTotalFlow" v-model="totalFlowForm.total_flow"></el-switch>
					<span class="text-tertiary ml-[4px]">*提示：开启会适量占用服务器内存。</span>
				</div>
			</el-form-item>
		</el-form>
		<bt-help :options="[{ content: '不影响监控报表插件的配置。' }]" class="ml-[20px] mt-[20px]"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle } from '@/hooks/tools'
import { getFreeTotalStatus, setFreeTotalStatus } from '@api/site'
import { useSiteStore } from '@site/useStore'

const { siteInfo } = useSiteStore()

const viewLoading = ref(false) // 页面加载状态
const totalFlowForm = reactive({
	total_flow: false,
}) // 表单数据
/**
 * 获取全局设置
 */
const getGloalData = async () => {
	viewLoading.value = true
	try {
		const { data } = await getFreeTotalStatus({site_id:siteInfo.value.id})
				totalFlowForm.total_flow = data.data.status
	} catch (error) {
		console.log(error)
	} finally {
		viewLoading.value = false
	}
}
/**
 * @description 开启日流量统计
 */
const handleChangeTotalFlow = async () => {
	useDataHandle({
		loading: '正在设置，请稍后...',
		message: true,
		request: setFreeTotalStatus({
			site_id: siteInfo.value.id,
			status: totalFlowForm.total_flow ? 1 : 0,
		}),
		success: (res) => {
			if(!res.status){
				totalFlowForm.total_flow = !totalFlowForm.total_flow
			}
		}
	})
}

onMounted(() => {
	getGloalData()
})
</script>

<style lang="css" scoped>
.site-globa-setting-module :deep(.el-form-item__content) {
	font-size: var(--el-font-size-small);
}
</style>
