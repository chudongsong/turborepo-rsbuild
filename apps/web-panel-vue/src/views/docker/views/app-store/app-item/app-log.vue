<template>
	<div class="p-2rem">
		<bt-tabs v-model="logTabActive" type="card" @change="handleToggleTab">
			<el-tab-pane label="运行日志" name="run" v-if="!compData.isInit"></el-tab-pane>
			<el-tab-pane label="安装日志" name="install"></el-tab-pane>
		</bt-tabs>

		<bt-log :content="logContent" :isHtml="true" :fullScreen="{
					title: `全屏查看日志`,
					onRefresh: getFullLogInfo,
				}"  class="h-[46rem]"></bt-log>
	</div>
</template>

<script setup lang="ts">
import {logTabActive,handleToggleTab,logContent,getFullLogInfo,initData,logUnmountedHandle } from './useController'

interface Props {
	compData: {
		service_name: string
		appname: string
		isInit: boolean
		appinfo: any[]
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		service_name: '',
		appname: '',
		isInit: false,
		appinfo: [],
	}),
})

onMounted(() => {
	initData(props.compData)
})

// 页面销毁时关闭socket
onBeforeUnmount(() => {
	// 重置数据
	logUnmountedHandle()
})
</script>

<style scoped></style>
