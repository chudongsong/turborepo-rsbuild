<template>
	<div class="p-[20px]" v-bt-loading="viewLoading">
		<span class="mr-[12px]">HTTPS防窜站</span>
		<el-switch v-model="httpsValue" @change="handleChangeEvent"></el-switch>
		<bt-help class="ml-[20px] my-[20px]" :options="helpList"></bt-help>
		<el-divider />
		<span class="mr-[12px]">部署SSL后自动开启HTTPS</span>
		<el-switch v-model="http2Value" @change="handleChangeHttp2Event"></el-switch>
		<bt-help class="ml-[20px] my-[20px]" :options="http2HelpList"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle,Message } from '@/hooks/tools'
import { getHttpsInfo, setHttpsMode, setGlobalHttp2https } from '@api/docker'

const helpList = ref([
	{
		content: '开启后可以解决HTTPS窜站的问题',
	},
	{
		content: '不支持IP证书的防窜，直接使用IP访问的勿开',
	},
])
const http2HelpList = ref([
	{
		content: '开启后将在网站新部署SSL证书时生效',
	},
	{
		content: '不影响已部署SSL的网站',
	},
])
const httpsValue = ref() // HTTPS防窜站
const http2Value = ref() // HTTP2HTTPS
const viewLoading = ref(false) // 页面加载状态

/**
 * @description 获取HTTPS数据
 */
const getHttpsData = () => {
	useDataHandle({
		loading: viewLoading,
		request: getHttpsInfo(),
		success: (res: AnyObject) => {
			if(res.status){
				httpsValue.value = res.data.data.https_mode
				http2Value.value = res.data.data.http2https
			}else{
				Message.error(res.msg)
			}
		},
	})
}

/**
 * @description 切换事件
 */
const handleChangeEvent = async (val: any) => {
	const res: AnyObject = await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setHttpsMode(),
		message: true,
	})
	httpsValue.value = res.status ? val : !val
}

/**
 * @description 切换HTTP2HTTPS事件
 */
const handleChangeHttp2Event = async (val: any) => {
	const res: AnyObject = await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setGlobalHttp2https({ status: val ? 1 : 0 }),
		message: true,
	})
	http2Value.value = res.status ? val : !val
}

onMounted(() => {
	getHttpsData()
})
</script>
