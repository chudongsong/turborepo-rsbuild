import { TableColumnProps } from '@/components/data/bt-table/types'
import { Message, useConfirm, useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { checkVariable, formatTime, getPageTotal } from '@/utils'
import { useSiteStore } from '@/views/site/useStore'
import { addPhpSiteIpWhite, addPhpSiteSafeWhite, getPhpSiteSafeLog } from '@api/site'

const { siteInfo } = useSiteStore()

export const ftpTable = ref() // 获取表格实例
const rowData = ref() // 表格行数据
export const logRowData = ref() // 日志行数据
export const logData = reactive({
	list: [] as any[],
	p: 1,
	limit: 10,
	total: 100,
	load: false,
})

const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		{
			label: '时间', // 路径
			prop: 'addtime',
			render: (row: any) => {
				return <div class="flex !items-center inline-block truncate">{formatTime(row.addtime)}</div>
			},
		},
		{
			label: '用户IP',
			prop: 'address',
			render: (row: any) => {
				return (
					<div
						class="bt-link truncate"
						onClick={() => {
							addIpWhite(row)
						}}>
						{row.address}
					</div>
				)
			},
		},
		{
			label: '恶意类型',
			prop: 'intercept',
		},
		{
			label: 'url地址',
			prop: 'url',
			width: 270,
		},
		useOperate([
			{
				onClick: (row: any) => {
					addUrlWhite(row)
				},
				title: 'URL加白',
				width: 80,
			},
			{ onClick: detailEvent, title: '详情' },
			{ onClick: httpEvent, title: 'HTTP' },
		]),
	])
}

/**
 * 查看详情
 */
export const detailEvent = async (row: any) => {
	logRowData.value = { data: row }
	useDialog({
		title: `【${row.address}】详情`,
		area: 60,
		isAsync: true,
		component: () => import('./log-detail.vue'),
		// compData: { data: row, addIPWhite: addIpWhite, addURLWhite: addUrlWhite },
		showFooter: false,
	})
}

/**
 * 加入ip白名单
 */
export const addIpWhite = async (row: any) => {
	await useConfirm({
		title: `加入IP白名单`,
		width: '35rem',
		icon: 'warning-filled',
		content: `是否将【${row.address}】添加到IP白名单？`,
	})
	useDataHandle({
		loading: '正在加入IP白名单，请稍后...',
		request: addPhpSiteIpWhite({ start_ip: row.address, end_ip: row.address }),
		message: true,
	})
}
/**
 * 加入url白名单
 */
export const addUrlWhite = async (row: any) => {
	await useConfirm({
		title: `加入URL白名单`,
		width: '35rem',
		icon: 'warning-filled',
		content: `加入URL白名单后此URL将不再进行防御，是否继续操作？`,
	})
	useDataHandle({
		loading: '正在加入URL白名单，请稍后...',
		request: addPhpSiteSafeWhite({ url_rule: row.url }),
		message: true,
	})
}

/**
 * @description http详情事件
 */
export const httpEvent = async (row: any) => {
	logRowData.value = { data: row }
	useDialog({
		title: `【${row.address}】HTTP详情`,
		area: 80,
		isAsync: true,
		component: () => import('./http-detail.vue'),
		// compData: { data: row },
		showFooter: false,
	})
}

/**
 * 获取触发日志列表
 */
export const getList = async () => {
	logData.load = false
	try {
		logData.load = true
		const res = await getPhpSiteSafeLog({
			siteName: siteInfo.value.name,
			p: logData.p,
			rows: logData.limit,
		})
		if (!res.status) {
			Message.error(res.msg)
		}
		logData.list = checkVariable(res.data.data, 'array', [])
		logData.total = getPageTotal(res.data.page)
	} catch (error) {
		useHandleError(error)
	} finally {
		logData.load = false
	}
}

export const tableColumn = useTableColumn()

export const initSafeLog = (data: any) => {
	rowData.value = data
	logData.list = rowData.value?.data || []
	logData.total = getPageTotal(rowData.value.page)
}

/***************************httpDetail*********************************/

export const logContent = ref<string>('')

/**
 * @description: json格式化内容
 */
export const formatContent = (json: string, options?: any): string => {
	let reg = null,
		formatted = '',
		pad = 0,
		PADDING = '  ' // （缩进）可以使用'\t'或不同数量的空格
	// 可选设置
	options = options || {}
	// 在 '{' or '[' follows ':'位置移除新行
	options.newlineAfterColonIfBeforeBraceOrBracket = options.newlineAfterColonIfBeforeBraceOrBracket === true ? true : false
	// 在冒号后面加空格
	options.spaceAfterColon = options.spaceAfterColon === false ? false : true
	// 开始格式化...
	if (typeof json !== 'string') {
		// 确保为JSON字符串
		json = JSON.stringify(json)
	} else {
		//已经是一个字符串，所以解析和重新字符串化以删除额外的空白
		json = JSON.parse(json)
		json = JSON.stringify(json)
	}
	// 在花括号前后添加换行
	reg = /([\{\}])/g
	json = json.replace(reg, '\r\n$1\r\n')
	// 在方括号前后添加新行
	reg = /([\[\]])/g
	json = json.replace(reg, '\r\n$1\r\n')
	// 在逗号后添加新行
	reg = /(\,)/g
	json = json.replace(reg, '$1\r\n')
	// 删除多个换行
	reg = /(\r\n\r\n)/g
	json = json.replace(reg, '\r\n')
	// 删除逗号前的换行
	reg = /\r\n\,/g
	json = json.replace(reg, ',')
	// 可选格式...
	if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
		reg = /\:\r\n\{/g
		json = json.replace(reg, ':{')
		reg = /\:\r\n\[/g
		json = json.replace(reg, ':[')
	}
	if (options.spaceAfterColon) {
		reg = /\:/g
		json = json.replace(reg, ': ')
	}
	json.split('\r\n').forEach(function (node, index) {
		var i = 0,
			indent = 0,
			padding = ''
		if (node.match(/\{$/) || node.match(/\[$/)) {
			indent = 1
		} else if (node.match(/\}/) || node.match(/\]/)) {
			if (pad !== 0) {
				pad -= 1
			}
		} else {
			indent = 0
		}
		for (i = 0; i < pad; i++) {
			padding += PADDING
		}
		formatted += padding + node + '\r\n'
		pad += indent
	})
	return formatted
}

export const initHttpDetail = () => {
	logContent.value = formatContent(logRowData.value.data)
}

/*************************log-detail**********************************/
export const logDetail = ref<any>({})

export const initLogDetail = () => {
	logDetail.value = logRowData.value.data
}
