import { addProxyUrlData, addProxyUrlReplace, delProxyUrlData, delProxyUrlReplace, editProxyUrlDataRemark, editProxyUrlInfo, proxyTcpAction, proxyUrlAddLimit, proxyUrlBatchDelLimit, proxyUrlCache, proxyUrlCompress, proxyUrlDelLimit, setProxyUrlCustom } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm, useDataHandle, useDialog, useHandleError, useMessage } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { fileSelectionDialog } from '@/public'
import { useSiteStore } from '@/views/site/useStore'

const Message = useMessage()

const { siteInfo } = useSiteStore() // 站点信息

export const rowData = ref<any>({}) // 当前行数据

export const tabActive = ref<string>('proxy') // 当前tab

/*********  设置url代理  ************/
/**
 * @description 获取公共信息
 */
export const getCommonData = async () => {
	try {
		const res = await proxyTcpAction({
			handle: 'port',
			listen_port: rowData.value.listen_port,
			protocol: rowData.value.protocol,
			// listen_port: `${rowData.value.listen_port}${rowData.value.protocol === 'tcp' ? '' : ' udp'}`,
		})
		if (!res.status) {
			Message.error(res.msg)
			return
		}
		rowData.value = {...res.data, listen_port: String(res.data.listen_port).replace(' udp', '')}
	} catch (error) {
		useHandleError(error)
	}
}

/*********  设置url代理 end  ************/

/*********  设置自定义配置   ************/
export const customTip = `一行一条配置，请以;结尾，例如：\nproxy_set_header Cookie "cookie_name=cookie_value";\nallow 192.168.1.0/24;\naccess_log /www/wwwlogs/xxx.log;`
export const customData = reactive({
	config: '',
})
export const customHelpList = [
	{ content: '注意：一行一条配置，请以;结尾' },
	{
		content: () => (
			<>
				案例：
				<br />
				重定向请求：return 301 /new-page;
				<br />
				重写URL：rewrite ^/blog/(.*)$ /$1 break;
				<br />
				文件上传限制：client_max_body_size 10M;
				<br />
				处理特定http方法：
				<br />
				limit_except POST {'{'} <br />
				&nbsp;&nbsp;&nbsp;&nbsp;allow 192.168.1.0/24;
				<br />
				&nbsp;&nbsp;&nbsp;&nbsp;deny all;
				<br />
				{'}'}
				<br />
				限制请求速率：limit_rate 100k;
				<br />
			</>
		),
	},
	{ content: '保存配置前请核对配置是否正确，错误的配置可能会导致反向代理无法正常访问' },
]
/**
 * @description 确认添加
 * @param close
 */
export const onConfirmCustom = async (close: any) => {
	try {
		let params = {
			handle: 'update',
			protocol: rowData.value.protocol,
			listen_port: rowData.value.listen_port,
			proxy_pass: rowData.value.proxy_pass,
			custom: customData.config ? customData.config : ' ',
		}
		const res: AnyObject = await useDataHandle({
			loading: '正在保存，请稍后...',
			request: proxyTcpAction(params),
			message: true,
		})
		if (res.status) {
			close()
		}
	} catch (error) {
		useHandleError(error)
	}
}

export const initCustomData = () => {
	customData.config = rowData.value.custom || ''
}
/*********  设置自定义配置 end  ************/

/*********  设置IP黑名单 IP白名单   ************/
export const settingIpRef = ref<any>() // 表格实例
export const settingIpWhiteRef = ref<any>() // 表格实例
export const listData = reactive({
	loading: false, // 加载状态
	type: 'black' as 'white' | 'black', // 类型
	white: [], // 白名单
	black: [], // 黑名单
})

export const useIpTableColumn = () => {
	return ref<TableColumnProps[]>([
		useCheckbox({key: 'ip'}),
		{
			label: 'IP', // 用户名
			prop: 'ip',
			minWidth: 120,
		},
		useOperate([
			{
				title: '删除',
				onClick: (row: any) => {
					deleteIpEvent(row)
				},
			},
		]),
	])
}

/**
 * @description 设置数据
 * @param data
 */
export const setIpValueEvent = (data: any) => {
	listData.white = data.allow?.split(' ').filter((ip: string) => ip).map((ip: string) => {
		return {
			ip,
			type: 'white',
		}
	}) || []
	listData.black = data.deny?.split(' ').filter((ip: string) => ip).map((ip: string) => {
		return {
			ip,
			type: 'black',
		}
	}) || []
}

/**
 * @description 删除事件
 * @param data  选中的数据
 * @param isMult  是否是多选
 */
const deleteIpEvent = async (data?: any) => {
	const isMult = Array.isArray(data) ? true : false
	await useConfirm({
		title: `${isMult ? '批量删除' : '删除'}${tabActive.value === 'ipWhiteList' ? '白' : '黑'}名单`,
		content: `${isMult ? '批量删除选中的ip，是否继续操作？' : `删除${tabActive.value === 'ipWhiteList' ? '白' : '黑'}名单【${data.ip}】，是否继续操作？`}`,
	})

	let params: any = {
		listen_port: rowData.value.listen_port,
		protocol: rowData.value.protocol,
		handle: tabActive.value === 'ipWhiteList' ? 'delete_allow' : 'delete_deny',
		...(isMult ? { ip: data.map((item: any) => item.ip).join(' ') } : { ip: data.ip }),
	}
	if (tabActive.value === 'ipWhiteList') {
		params.allow = params.ip
		delete params.ip
	} else {
		params.deny = params.ip
		delete params.ip
	}

	const res: AnyObject = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: proxyTcpAction(params),
		message: true,
	})
	if (res.status) {
		getCommonData()
	}
}
const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '删除IP',
			value: 'delete',
			event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
				const requestHandle = async (item: any) =>
					await proxyTcpAction({
						listen_port: rowData.value.listen_port,
						protocol: rowData.value.protocol,
						handle: tabActive.value === 'ipWhiteList' ? 'delete_allow' : 'delete_deny',
						...(tabActive.value === 'ipWhiteList' ? { allow: item.ip } : { deny: item.ip }),
					})
				await batchConfirm({
					title: '批量删除',
					content: '批量删除选中的ip，是否继续操作？',
					column: [{ prop: 'ip', label: 'IP' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
					onConfirm: async () => {
						await nextAll(requestHandle) // 递归操作所有选中的数据
						getCommonData() // 执行完毕的代码，刷新列表
						return false
					},
				})
			},
		},
	]
}

export const ipTableColumns = useIpTableColumn()
export const TableBatchOptions = batchOptions()

export const initIpData = () => {
	listData.type = tabActive.value === 'ipBlackList' ? 'black' : 'white'
	setIpValueEvent(rowData.value)
}

export const addIpView = () => {
	ipData.value.address = ''
	useDialog({
		isAsync: true,
		title: `添加IP${tabActive.value === 'ipBlackList' ? '黑' : '白'}名单【${rowData.value.listen_port}】`,
		area: 40,
		btn: '确认',
		component: () => import('@site/views/reverse-proxy-model/tcp-proxy/setting-ip-add.vue'),
		compData: {
			refreshEvent: () => {
				getCommonData()
			},
		},
	})
}

//  添加ip
// 表单数据
export const ipData = ref<any>({
	types: listData.type,
	address: '',
})
export const addIpFormRef = ref() // 表单ref
export const ipHelpList = [{ content: '一行一条配置，多个IP请换行' }]
export const addIpRules = {
	address: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value.length > 0) {
					callback()
				} else {
					callback(new Error('请输入IP地址'))
				}
			},
			trigger: ['blur', 'change'],
		},
	],
}

/**
 * @description: 提交表单
 */
export const onConfrimIp = async () => {
	const { address: ips } = ipData.value
	const params = {
		listen_port: rowData.value.listen_port,
		proxy_pass: rowData.value.proxy_pass,
		protocol: rowData.value.protocol,
		handle: tabActive.value === 'ipBlackList' ? 'deny' : 'allow',
		...(tabActive.value === 'ipBlackList' ? { deny: ips } : { allow: ips }),
	}
	await addIpFormRef.value.validate()
	const res: AnyObject = await useDataHandle({
		loading: '正在添加，请稍后...',
		request: proxyTcpAction(params),
		message: true,
	})
	if (res.status) {
		getCommonData()
	}
	return res.status
}

/*********  设置IP黑名单 IP白名单 end  ************/

/*********  日志查看  ************/
export const logContent = ref('') // 日志内容

/**
 * @description 获取日志内容
 */
export const getLogContent = async () => {
	try {
		const res: any = await useDataHandle({
			request: proxyTcpAction({
				handle: 'log',
				listen_port: rowData.value.listen_port,
				protocol: rowData.value.protocol
			}),
			loading: '正在获取日志内容,请稍后...'
		})
		
		if(res.status) {
			logContent.value = res.data.data || '暂无日志内容'
		}
	} catch (error) {
		useHandleError(error)
	}
}

export const unMountedler = () => {
	logContent.value = ''
	tabActive.value = 'proxy'
	rowData.value = {}
	customData.config = ''
	listData.white = []
	listData.black = []
	ipData.value.address = ''
}

