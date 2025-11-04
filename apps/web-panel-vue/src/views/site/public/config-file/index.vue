<template>
	<div class="h-full">
		<div v-if="isBindExtranet">
			<bt-tabs v-if="composerPath" type="card" v-model="defaultActive" :options="tabComponent" @change="tabClickEvent" />
			<div class="w-full">
				<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
				<!-- nginx apache opensite..需要测试 -->
				<div class="my-[12px]">
					<bt-editor v-bt-loading="textLoading" class="!h-[54rem] border-[1px] border-dark rounded-base" v-model="content" @save="saveConfigDataEvent()" id="configContent" :editorOption="{ mode: 'ace/mode/nginx' }" />
				</div>
				<div>
					<el-button type="primary" @click="saveConfigDataEvent()">保存</el-button>
					<el-button @click="openHistoryFileView" type="default">历史文件</el-button>
				</div>
				<bt-help :options="[{ content: '此处为站点主配置文件，若您不了解配置规则，请勿随意修改.' }]" list-style="disc" class="ml-[20px] mt-[20px]"></bt-help>
			</div>
		</div>

		<div class="bg-[var(--el-base-tertiary)] flex items-center justify-center h-full" style="min-height: 600px" v-else>
			<div class="bg-lighter px-[48px] py-[16px] text-default flex">
				请开启
				<span class="mx-[.4rem] bt-link" @click="jumpTabEvent('mapping')">外网映射</span>
				后查看配置信息
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { getAceConfig } from '@/public/method'
import { useDialog, useTable } from '@/hooks/tools'
import { formatTime } from '@/utils'
import { composerPath, historyData, historyContent, recoverFile, initConfig, viewHistoryFile, defaultActive, tabComponent, tabClickEvent, textLoading, content, saveConfigDataEvent } from './useController'
import { useSiteStore, SITE_STORE } from '@site/useStore'
import { ElButton } from 'element-plus'
import BtEditor from '@/components/extension/bt-editor'

const { isBindExtranet } = useSiteStore()
const { jumpTabEvent } = SITE_STORE()

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

onMounted(initConfig)

defineExpose({ init: initConfig })
</script>
