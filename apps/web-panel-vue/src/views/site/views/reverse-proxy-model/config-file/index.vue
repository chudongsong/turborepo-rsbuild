<template>
	<div>
		<!-- <BtTabs @change="handleClickTab" /> -->
		<div class="w-full">
			<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
			<!-- nginx apache opensite..需要测试 -->
			<div class="my-[12px]">
				<bt-editor v-bt-loading="textLoading" class="!h-[54rem] border border-base rounded-base" v-model="content" @save="saveConfigDataEvent" id="configContent" :editorOption="{ mode: 'ace/mode/nginx' }" />
			</div>
			<div>
				<el-button type="primary" @click="saveConfigDataEvent">保存</el-button>
				<el-button @click="openHistoryFileView" type="default">历史文件</el-button>
			</div>
			<bt-help :options="[{ content: '此处为站点主配置文件，若您不了解配置规则，请勿随意修改.' }]" list-style="disc" class="ml-[20px] mt-[20px]"></bt-help>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { getAceConfig } from '@/public/method'
import { useDialog, useTable } from '@/hooks/tools'
import { formatTime } from '@/utils'
import { tabActive } from './useController'
import { composerPath, historyData, historyContent, viewHistoryFile, textLoading, content, saveConfigDataEvent, getConfigData, recoverFile } from './useController'

import BtEditor from '@/components/extension/bt-editor'
import { ElButton } from 'element-plus'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

// // 配置文件内容列表
// const configList = reactive({
// 	site_conf: '', // 主配置文件
// 	http_block: '', // http配置块
// 	server_block: '', // server配置块
// })
// provide('configList', configList)
// provide('tabActive', tabActive)

// const { BtTabs } = useTabs({
// 	type: 'card',
// 	value: tabActive,
// 	options: [
// 		{
// 			label: '主配置文件',
// 			name: 'master',
// 			lazy: true,
// 			render: () => import('@site/views/reverse-proxy-model/config-file/files.vue'),
// 		},
// 		{
// 			label: '自定义配置文件',
// 			name: 'custom',
// 			lazy: true,
// 			render: () => import('@site/views/reverse-proxy-model/config-file/files.vue'),
// 		},
// 	],
// })

const openHistoryFileView = () => {
	let historyInstance: any
	const { BtTable } = useTable({
		request: () => {
			return { data: historyData.value, total: historyData.value.length }
		},
		columns: [
			{
				label: '文件名',
				render: (row: any) => {
					let data = formatTime(Number(row))
					return data
				},
			},
			{
				label: '操作',
				align: 'right',
				render: (row: any) => {
					let data = Number(row)
					return (
						<div>
							<span
								class="cursor-pointer bt-link"
								onClick={() => {
									openFileView(row)
								}}>
								查看
							</span>
							<el-divider direction="vertical"></el-divider>
							<span
								class="cursor-pointer bt-link"
								onClick={async () => {
									const status = await recoverFile(data)
									if (status) {
										const popup = await historyInstance
										popup?.unmount()
									}
								}}>
								恢复
							</span>
						</div>
					)
				},
			},
		],
	})
	historyInstance = useDialog({
		title: `配置文件历史版本`,
		area: 42,
		showFooter: false,
		component: () => (
			<div class="p-[20px]">
				<BtTable max-height={400} />
			</div>
		),
	})
}

const openFileView = async (row: any) => {
	await viewHistoryFile(row)
	const historyInstance = useDialog({
		title: `查看文件历史版本`,
		area: 64,
		showFooter: false,
		component: () => (
			<div class="p-[20px]">
				<ElButton
					type="primary"
					onClick={async () => {
						const status = await recoverFile(row)
						if (status) {
							const popup = await historyInstance
							popup?.unmount()
						}
					}}>
					恢复文件
				</ElButton>
				<BtEditor class="!h-[50rem] !w-full my-[12px]" v-model={historyContent.value} editorOption={getAceConfig({ readonly: true })} />
			</div>
		),
	})
}

onMounted(() => {
	getConfigData()
})

defineExpose({
	init: getConfigData,
})
</script>

<style lang="css" scoped>
:deep(.el-tabs__nav) {
	display: flex;
	align-items: center;
}
</style>
