import { TableColumnProps } from '@/components/data/bt-table/types'
import { Message, useConfirm } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools' // 工具函数
import { useDataHandle } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { openPathEvent } from '@/hooks/tools/table/event'
import { useSiteStore } from '@/views/site/useStore'
import { delPhpSiteSafe, getPhpSiteSafe } from '@api/site'
import { monitorData as props } from '../useController'

const { siteInfo } = useSiteStore()

export const ftpTable = ref() // 获取表格实例

export const monitorData = reactive({
	list: [] as any[],
	load: false,
})

export const helpList = [
	{
		content: '安全告警默认会监视当前网站访问非当前网站文件的行为(例：你的站点A.com访问了站点B.com的文件或者目录)，通过添加监视器路径，当路径被访问时发送告警',
	},
	{
		content: '告警频率：60秒某一个告警行为只会发送一次告警',
	},
	{
		isHtml: true,
		content: '<a class="bt-link"  href="https://www.bt.cn/bbs/thread-112442-1-1.html" target="_blank" rel="noreferrer noopener">使用教程</a>',
	},
]

export const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		{
			label: '路径', // 路径
			prop: 'path',
			render: (row: any) => {
				return (
					<div
						class="truncate bt-link"
						onClick={() => {
							if (row.type === 'dir') {
								openPathEvent({ path: row.path })
							} else {
								console.log('打开编辑器文件')
							}
						}}>
						{row.path}
					</div>
				)
			},
		},
		{
			label: '类型',
			prop: 'type',
			render: (row: any) => {
				return `${row.type === 'dir' ? '文件夹' : '文件'}`
			},
		},
		{
			label: '告警操作',
			prop: 'type',
			render: (row: any) => {
				const arr_actions = []
				if (parseInt(row.read)) arr_actions.push('读取')
				if (parseInt(row.del)) arr_actions.push('删除')
				if (parseInt(row.reit)) {
					arr_actions.push('修改')
					arr_actions.push('增加')
				}
				return arr_actions.join(' / ')
			},
		},
		useOperate([
			{ onClick: openSetting, title: '编辑' },
			{ onClick: deleteEvent, title: '删除' },
		]),
	])
}

/**
 * 删除监视器
 */
export const deleteEvent = async (row: any) => {
	await useConfirm({
		title: `删除监视器`,
		width: '35rem',
		icon: 'warning-filled',
		content: `您真的要删除路径【${row.path}】的监视器吗？`,
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除监视器，请稍后...',
		request: delPhpSiteSafe({
			domain: siteInfo.value.name,
			type: row.type,
			path: row.path,
		}),
		message: true,
	})
	if (res.status) getList()
}

/**
 * @description 添加 / 编辑监视器
 */
export const openSetting = async (row?: any) => {
	let compData: any = {
		name: siteInfo.value.name,
		path: row ? row.path : props.path,
		refresh: getList,
	}
	if (row) {
		compData.row = row
	}
	useDialog({
		title: `${row ? '编辑' : '添加'}文件监视器`,
		area: 47,
		isAsync: true,
		component: () => import('@firewall/views/php-site-safe/site-list/file-monitor/add-file-monitor.vue'),
		compData: compData,
		showFooter: true,
	})
}

/**
 * 获取监视器列表
 */
export const getList = async () => {
	try {
		monitorData.load = true
		const siteRes = await getPhpSiteSafe()
		if (!siteRes.status) {
			Message.error(siteRes.msg)
		}
		// 获取当前站点的防护数据
		const siteData = siteRes.data.sites.find((site: any) => {
			return site.path === props.path && site.site_name === siteInfo.value.name
		})
		if (siteData) {
			const arr = []
			for (const key in siteData.config.file_info) {
				if (Object.prototype.hasOwnProperty.call(siteData.config.file_info, key)) {
					arr.push({
						...siteData.config.file_info[key],
						path: key,
					})
				}
			}
			monitorData.list = arr
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		monitorData.load = false
	}
}

export const tableColumn = useTableColumn()
