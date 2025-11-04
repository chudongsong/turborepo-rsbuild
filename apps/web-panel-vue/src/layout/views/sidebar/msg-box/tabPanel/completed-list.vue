<template>
	<bt-table-group>
		<template #content>
			<BtTable />
			<ul class="mt-8px leading-8 text-small list-disc ml-20px">
				<li>
					如安装或启动失败，请点击详情，截图相关错误信息

					<BtPopover placement="bottom-start" effect="light" popper-class="!p-0" trigger="hover" width="160px">
						<div id="wechat-customer" class="wechat-customer">
							<div class="customer-title">
								<BtLink target="_blank" href="https://www.bt.cn/new/wechat_customer" class="text-medium cursor-pointer flex flex-row items-center flex-nowrap">
									<div class="flex border-solid border-b-1 border-primary text-primary justify-center items-center">
										点击咨询客服
										<BtIcon icon="arrow" :size="16" color="var(--el-color-primary)" class="ml-[5px]" />
									</div>
								</BtLink>
							</div>
							<div class="qrcode-wechat w-[128px] h-[128px] mt-[8px] mb-[4px]">
								<div id="wechatCustomerQrcode">
									<bt-image src="/customer/customer-qrcode.png" />
								</div>
							</div>
							<div class="wechat-title flex">
								<img
									class="w-[14px] h-[14px]"
									src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAATlJREFUSEvtVrFOw0AMfed8AxJsZWGAgQHBXP4DCQa+Ioou7g18BRIg9T/KDGJggIGFbiDxDXGQowSBuGvrFISEmtF+7/nis312RVEMiWgIoMT375aIjpj5KeJrTMy8JSJjAPsRzEhErl1Zlhd1XZ8kRKZEdMjM0xlBBiIyATCIYZxzl857X6uTiHaY+TElZrUz87aIPCjvI0gIwVmF5uG7H1gFmZepxv85XTdqCCEcLMQ0gLz3jbbTOm/rPdkLBt0v0E77xysq2it9T2nhuTzPN4ho10KyYEXkXvvkBcC6hWjEvmqQMwCnANZa8p1RJAbfa41vAM7/0cUzczOiZ43zvunrtPVOntuO3+wrluJ12qspvFBm/+bR+u03nhPrkKZk2ZVINUZO964sy44Ta9FSK5GuQ1VVXb0DLf+sHQ9tLL0AAAAASUVORK5CYII=" />
								<div class="text-base font-black">扫一扫</div>
							</div>
							<span class="layui-layer-setwin wechat-close" style="display: block"><a href="javascript:;" class="layui-layer-ico layui-layer-close layui-layer-close2"></a></span>
						</div>
						<template #reference>
							<span class="inline-block bt-link">咨询客服</span>
						</template>
					</BtPopover>

					求助
				</li>
			</ul>
		</template>
		<template #footer-right>
			<BtPage :pager-count="5" layout="prev, pager, next, total, jumper" />
		</template>
	</bt-table-group>
</template>

<script lang="tsx" setup>
import type { ResponsePageResult } from '@/hooks/tools/axios/types'

import { useDataHandle, useDialog, useDynamicTable } from '@/hooks/tools'
import { getDuration, getPageTotal } from '@/utils'
import { installedMsgList } from '@api/global'

import type { TableItemProps } from '../types'

// 表格配置
const tableColumn = ref([
	{
		label: '名称',
		prop: 'name',
		showOverflowTooltip: true,
		render: (row: any) => {
			return (
				<div>
					<span class={`mr-2 font-bold !text-small ${row.install_status ? 'text-primary svgtofont-el-check' : 'text-danger svgtofont-el-close'}`}></span>
					{row.name}
				</div>
			)
		},
	},

	{
		label: '创建时间',
		prop: 'addtime',
		width: 110,
		render: (row: any) => {
			return <span>{row.addtime.replace(/^\d{4}-/, '')}</span>
		},
	},
	{
		label: '任务耗时',
		width: 80,
		render: (row: TableItemProps) => {
			return <span>{getDuration(row.end - row.start)}</span>
		},
	},
	{
		label: '安装详情',
		width: 140,
		showOverflowTooltip: true,
		render: (row: any) => {
			return <span class={row.install_status ? 'text-primary' : 'text-danger'}>{row.msg || '安装成功'}</span>
		},
	},
	{
		label: '操作',
		align: 'right',
		width: 55,
		render: (row: TableItemProps) => {
			if (row.msg_info !== null) {
				return (
					<span class="text-primary cursor-pointer" onClick={() => openDetail(row)}>
						详情
					</span>
				)
			}
			return ''
		},
	},
])

/**
 * @description: 获取已完成任务列表
 * @returns {Promise<void>}
 */
const getCompletedList = async (param: any) => {
	try {
		const { data, page }: ResponsePageResult = await useDataHandle({
			request: installedMsgList({ table: 'tasks', search: '1', limit: 10, p: param.p }),
			data: { page: String, data: Array },
		})
		return { data, total: getPageTotal(page), other: {} }
	} catch (err) {
		return { data: [], total: 0, other: {} }
	}
}

const openDetail = (row: TableItemProps) =>
	useDialog({
		title: `当前状态：${row.msg_info.title}`,
		area: [72, 50],
		compData: row.msg_info,
		component: () => import('./details.vue'),
	})

const { BtTable, BtPage, refresh } = useDynamicTable({
	request: getCompletedList,
	columns: tableColumn.value,
})

defineExpose({
	init: refresh,
})

// onMounted(refresh)
</script>

<style lang="css" scoped>
/* 微信客服二维码 */
.wechat-customer {
	@apply text-center text-small box-border w-full h-[214px] flex flex-col items-center;
}

.wechat-customer .customer-title {
	@apply w-full h-[46px] flex items-center justify-center flex-row bg-[var(--el-color-primary-rgb,.1)];
}

.wechat-customer .wechat-title {
	@apply text-small font-bold text-secondary w-[100px] h-[26px] flex flex-row items-center justify-evenly mb-[10px];
}
</style>
