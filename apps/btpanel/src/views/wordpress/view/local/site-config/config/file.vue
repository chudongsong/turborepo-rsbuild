<template>
	<div class="h-full">
		<bt-tabs v-if="composerPath" type="card" v-model="defaultActive" :options="tabComponent" @change="tabClickEvent" />
		<div class="w-full">
			<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
			<!-- nginx apache opensite..需要测试 -->
			<div class="my-[12px]">
				<bt-editor v-bt-loading="textLoading" class="!h-[54rem] rounded-base" v-model="content" :request="false" @save="saveConfigDataEvent()" id="configContent" />
			</div>
			<div>
				<el-button type="primary" @click="saveConfigDataEvent()">保存</el-button>
				<el-button @click="openHistoryFileView" type="default">历史文件</el-button>
			</div>
			<bt-help
				:options="[
					{
						content: '此处为站点主配置文件，若您不了解配置规则，请勿随意修改.',
					},
				]"
				list-style="none"
				class="ml-[20px] mt-[20px]"></bt-help>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { getAceConfig } from '@/public/method'
import { Message, useConfirm, useDialog, useTable } from '@/hooks/tools'
import { formatTime } from '@/utils'
import { composerPath, historyData, historyContent, defaultActive, tabComponent, tabClickEvent, textLoading, content, setInfoEvent, getConfigData } from '@/views/site/public/config-file/useController'
import { ElButton } from 'element-plus'
import BtEditor from '@/components/extension/bt-editor'
import { useSiteStore, SITE_STORE } from '@/views/site/useStore'
import { useGlobalStore } from '@/store/global'
import { SITE_CONFIG_FILE_STORE } from '@site/public/config-file/useStore'

const { viewFileHistoryEvent, recoverFileEvent } = SITE_CONFIG_FILE_STORE()
const { siteInfo } = useSiteStore()
const { plugin } = useGlobalStore()
const { saveFileEvent } = SITE_STORE()
const openHistoryFileView = () => {
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
								onClick={() => {
									recoverFile(data)
								}}>
								恢复
							</span>
						</div>
					)
				},
			},
		],
	})
	useDialog({
		title: `配置文件历史版本`,
		area: 42,
		showFooter: true,
		component: () => (
			<div class="p-[20px]">
				<BtTable />
			</div>
		),
	})
}

/**
 * @description 查看历史文件
 */
const viewHistoryFile = async (row: any) => {
	try {
		const res = await viewFileHistoryEvent({ row, path: path.value })
		historyContent.value = res.status ? res.data : '文件不存在'
		return res
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取文件历史失败' }
	}
}

/**
 * @description 恢复文件
 * @param row
 */
const recoverFile = async (row: any) => {
	try {
		await useConfirm({
			title: `恢复历史文件`,
			content: `是否恢复历史文件 ${formatTime(row)}`,
		})
		const res: any = await recoverFileEvent({ row, path: path.value })
		Message.request({ status: res.status, msg: res.status ? '恢复成功' : '恢复失败' })
		if (res.status) getConfigData({ path: path.value })
		return res.status
	} catch (error) {
		console.log(error)
	}
}

const openFileView = async (row: any) => {
	await viewHistoryFile(row)
	useDialog({
		title: `查看文件历史版本`,
		area: 64,
		showFooter: false,
		component: () => (
			<div class="p-[20px]">
				<ElButton type="primary" onClick={() => recoverFile(row)}>
					恢复文件
				</ElButton>
				<BtEditor class="!h-[54rem] !w-full my-[12px]" v-model={historyContent.value} editorOption={getAceConfig({ readonly: true })} />
			</div>
		),
	})
}

// 配置文件路径
const path = computed(() => {
	const configPath = `/www/server/panel/vhost/${plugin.value.webserver}/${siteInfo.value.name}.conf`
	return defaultActive.value === 'config' ? configPath.replace(/\/+/g, '/') : composerPath.value
})

/**
 * @description 初始化配置
 */
const initConfig = async () => {
	setInfoEvent()
	await getConfigData({ path: path.value })
}

/**
 * @description 保存配置文件
 * @param params
 * @returns
 */
const saveConfigDataEvent = async (
	params: {
		data: string
		encoding: string
		path: string
	} = {
		data: content.value,
		encoding: 'utf-8',
		path: path.value,
	}
) => {
	try {
		const res = await saveFileEvent(params)
		if (res.status) getConfigData({ path: params.path })
	} catch (error) {
		console.log(error)
		return { status: false, msg: '保存文件失败' }
	}
}

onMounted(initConfig)
</script>
