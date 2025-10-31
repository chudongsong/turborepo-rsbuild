<template>
	<div class="px-2rem" v-bt-loading="viewLoading">
		<div v-for="(item, index) in nginxForm" :key="index" class="flex items-center mb-[12px]">
			<el-switch v-model="item.value" @change="setHeaderEvent"></el-switch>
			<span class="ml-[8px]">{{ item.help }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getSecurityHeaders, setSecurityHeaders } from '@/api/site'
import { useDataHandle } from '@/hooks/tools'
import { useSiteStore } from '@site/useStore'

const { siteInfo } = useSiteStore()

const viewLoading = ref(false) // 页面加载loading
const nginxForm = ref([
	{
		help: '阻止浏览器上下文中执行恶意JavaScript代码',
		value: false,
		field: 'x_xss_protection',
	},
	{
		help: '阻止浏览器的内容嗅探',
		value: false,
		field: 'x_content_type_options',
	},
	{
		help: '让浏览器跳转时不携带referrer',
		value: false,
		field: 'referrer_policy',
	},
	{
		help: '让浏览器加载内容时只加载自己网站的内容',
		value: false,
		field: 'content_security_policy',
	},
	{
		help: '防止浏览器进行用户行为跟踪',
		value: false,
		field: 'permissions_policy',
	},
])

/**
 * @description 设置请求头事件
 */
const setHeaderEvent = () => {
	let data: any = {}
	nginxForm.value.forEach((item: any) => {
		data[item.field] = item.value
	}) // 循环nginxForm,给每个对应值赋值为[对应的key]
	const params = {
		site_name: siteInfo.value.name,
		security_info: JSON.stringify(data),
	}

	useDataHandle({
		loading: '正在设置，请稍后...',
		request: setSecurityHeaders(params),
		message: true,
		success: (res: any) => {
			if (res.status) getHeadersData()
		},
	})
}

/**
 * @description 获取请求头数据
 */
const getHeadersData = () => {
	useDataHandle({
		loading: viewLoading,
		request: getSecurityHeaders({ site_name: siteInfo.value.name }),
		success: (res: any) => {
			// 循环nginxForm,给每个对应值的value赋值为res.data.value[对应的key]
			nginxForm.value.forEach((item: any) => {
				if (res.data[item.field]) {
					item.value = res.data[item.field]
				}
			})
		},
	})
}

onMounted(getHeadersData)

defineExpose({
	init: getHeadersData,
})
</script>

<style scoped></style>
