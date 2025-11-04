<template>
	<div class="container-dialog docker-container-detail">
		<bt-tabs type="card" v-model="tabActive">
			<el-tab-pane label="视图展示" name="view">
				<div class="Table pl-[2rem] w-full h-[50rem] overflow-auto">
					<div class="title text-extraLarge mb-[1rem]">容器详情</div>
					<div class="item">
						<div class="w-[15%]">镜像</div>
						<div class="flex-1">{{ currentConDetail.Image || '' }}</div>
					</div>
					<div class="item">
						<div class="w-[15%]">端口配置</div>
						<div class="flex-1">
							<div v-for="item in port" :key="item" class="port">{{ item }}</div>
						</div>
					</div>
					<div class="item">
						<div class="w-[15%]">CMD</div>
						<div class="flex-1">{{ currentConDetail.Config?.Cmd?.join('') || '' }}</div>
					</div>
					<div class="item">
						<div class="w-[15%]">ENTERYPOINT</div>
						<div class="flex-1">
							{{ currentConDetail.Config?.Entrypoint ? currentConDetail.Config?.Entrypoint[0] : '' }}
						</div>
					</div>
					<div class="item pt-[2rem]" :class="Env.length > 8 ? '!items-start' : ''">
						<div class="w-[10%] sticky left-0 top-0">ENV</div>
						<el-descriptions :column="1" border class="w-full">
							<el-descriptions-item v-for="item in Env" :key="item.key" :label="item.key">
								<span class="inline-block whitespace-pre-line w-[40rem]">
									{{ item.value }}
								</span>
							</el-descriptions-item>
						</el-descriptions>
					</div>
				</div>
			</el-tab-pane>

			<el-tab-pane label="文件展示" name="file">
				<div class="h-[54rem] overflow-auto">
					<bt-editor :filePath="currentConDetail.container_info" :editorOption="config" />
				</div>
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>
<script setup lang="ts">
import { isDark } from '@/utils/theme-config'
import { getDockerStore } from '@/views/docker/useStore'

const {
	refs: { currentConDetail },
} = getDockerStore()
// 编辑器
const config = {
	mode: 'ace/mode/json',
	theme: !isDark.value ? 'ace/theme/monokai' : 'ace/theme/clouds_midnight', // 主题
	wrap: true, // 是否自动换行
	showInvisibles: false, // 是否显示空格
	showFoldWidgets: false, // 是否显示代码折叠线
	useSoftTabs: true, // 是否使用空格代替tab
	tabSize: 2, // tab宽度
	showPrintMargin: false, // 是否显示打印边距
	readOnly: true, // 是否只读
	fontSize: '12px', // 字体大小
}

// 端口列表
const port = ref<any>([])
// ENV列表
const Env = ref<any>([])
// 默认选中tab
const tabActive = ref('view')

// 端口处理
const getPortList = () => {
	const arr = Object.entries(currentConDetail.value.NetworkSettings?.Ports || {})
	arr.forEach((item: any) => {
		let str = ''
		if (item[1]) {
			str += `${item[1][0].HostPort}-->${item[0]} `
			port.value.push(str)
		}
	})
}

// ENV处理
const getEnvList = () => {
	currentConDetail.value.Config?.Env.forEach((item: any) => {
		const arr = item.split('=')
		Env.value.push({
			key: arr[0],
			value: arr[1],
		})
	})
}

onMounted(() => {
	getPortList() // 获取端口列表
	getEnvList() // 获取环境变量
})
</script>
<style lang="css" scoped>
.container-dialog {
	@apply flex flex-col lib-box min-h-[60rem];
}
.Table .item {
	@apply flex items-center min-h-[5rem] w-full border-t border-dark;
}

:deep(.el-descriptions .el-descriptions__cell) {
	font-size: var(--el-font-size-small) !important;
}
.docker-container-detail :deep(.el-descriptions__body) {
	width: 100% !important;
}
.docker-container-detail :deep(.el-descriptions__cell) {
	word-break: break-all !important;
}
</style>
