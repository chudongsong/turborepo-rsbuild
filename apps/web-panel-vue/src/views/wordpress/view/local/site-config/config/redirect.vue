<template>
	<div class="h-full">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="editRedirectEvent()">添加重定向</el-button>
				<el-button v-if="['php', 'html'].includes(siteType)" type="default" @click="errorRedirectEvent()">404重定向</el-button>
			</template>
			<template #header-right>
				<BtRefresh />
			</template>
			<template #content>
				<BtTable :max-height="460" />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
		</bt-table-group>
		<bt-help class="mt-2rem" :options="helpList" list-style="disc"></bt-help>
		<bt-dialog title="编辑配置文件" v-model="configPopup" :area="54">
			<div class="p-[20px]">
				提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换
				<bt-editor v-bt-loading="contentLoading" class="!h-[36rem] my-[8px]" ref="aceEditor" v-model="configContent" @save="saveFile()" />
				<el-button type="primary" @click="saveFile()">保存</el-button>
				<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
					<li>此处为该重定向的配置文件，若您不了解配置规则,请勿随意修改。</li>
				</ul>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import BtEditor from '@/components/extension/bt-editor'
import { useBatch, useDialog, useMessage, useRefresh, useRefreshList, useTable } from '@/hooks/tools'
import { useCheckbox, useOperate, useStatus } from '@/hooks/tools/table/column'
import { checkVariable } from '@/utils'
import type { RedirectTableProps } from '@site/types.d'
import { SITE_STORE, useSiteStore } from '@site/useStore'
import { ElButton } from 'element-plus'
import { configPopup, contentLoading, configContent, saveFile, changeStatus, delRedirect, editRedirectEvent, errorRedirectEvent, getRedirectFile, helpList, initRedirect, useBatchEventHandle } from '@site/public/redirect/useController'
import { useSiteRedirectStore } from '@site/public/redirect/useStore'

const Message = useMessage()

const { siteType } = useSiteStore()

const { isRefreshList } = useSiteRedirectStore()

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '启用重定向规则',
		value: 'start',
		event: useBatchEventHandle,
	},
	{
		label: '停用重定向规则',
		value: 'stop',
		event: useBatchEventHandle,
	},
	{
		label: '删除重定向规则',
		value: 'delete',
		event: useBatchEventHandle,
	},
])

const { BtTable, BtRefresh, BtBatch } = useTable({
	request: initRedirect,
	columns: [
		useCheckbox(),
		{
			label: '被重定向',
			render: (row: RedirectTableProps) => {
				if (row.errorpage) return '404错误页面'
				return row.domainorpath === 'domain' ? checkVariable(row.redirectdomain, 'array', [])?.join('、') : row.redirectpath
			},
		},
		{
			label: '重定向类型',
			prop: 'domainorpath',
			render: (row: RedirectTableProps) => {
				if (row.errorpage) return '错误'
				return row.domainorpath === 'domain' ? '域名' : '路径'
			},
		},
		{
			label: '重定向到',
			render: (row: RedirectTableProps) => {
				if (row.topath) return row.topath
				return row.tourl
			},
		},
		useStatus({
			prop: 'type',
			event: changeStatus,
			data: ['已停止', '运行中'],
		}),
		useOperate([
			{
				width: 70,
				title: '配置文件',
				onClick: (row: RedirectTableProps) => {
					if (!row.type) return Message.warn('请先启用重定向规则再查看配置文件')
					getRedirectFile(row)
				},
			},
			{
				title: '编辑',
				onClick: (row: RedirectTableProps) => {
					// 若为404重定向则打开404重定向弹窗
					if (row.errorpage) {
						errorRedirectEvent(row)
					} else {
						editRedirectEvent(row)
					}
				},
			},
			{
				onClick: delRedirect,
				title: '删除',
			},
		]),
	],
	extension: [useRefresh(), useTableBatch, useRefreshList(isRefreshList)],
})
</script>
