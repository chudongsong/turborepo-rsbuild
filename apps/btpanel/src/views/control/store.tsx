import { checkDailyStatus, GetPanelDailyData, GetPanelDailyInfoList, setDailyStatus } from '@/api/control'
import { useConfirm, useDataHandle } from '@/hooks/tools'
import { defineStore } from 'pinia'
import { formatTime } from '@/utils/index'
import { TableData } from './types'
import { SelectOptionProps } from '@/components/form/bt-select/types'

const CONTROL_STORE = defineStore('CONTROL-STORE', () => {
	const tabActive = ref<string>('monitor') // 当前tab，未激活

	// -------------------面板日报-------------------
	const productData = reactive({
		title: '日报-功能介绍',
		ps: '能够对服务器运行情况进行监测，分析服务器异常的信息进行行为记录，协助管理员进行服务器分析。',
		source: 211,
		desc: ['服务器运行情况监测', '异常信息记录', '服务器分析'],
		tabImgs: [
			{
				title: '概览',
				imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/control/daily.png',
			},
		],
	})
	const dailyValue = ref<boolean>(false) // 日报开关
	const tableList = ref<TableData[]>([])
	const selectValue = ref<string>('') // 选择的值
	const topStatus = ref() // 顶部状态
	const topStatusColor = ref<string>('') // 顶部状态颜色
	const watchTime = ref() // 监测时间
	const summary = ref() // 健康信息提醒
	const selectData = ref<Array<SelectOptionProps>>([])
	const tableColumn = ref<Array<Record<string, string | boolean | AnyFunction | number>>>([])
	const dataList = ref<Array<AnyObject>>([])

	// 过滤器，判断类型是否为网站数据库
	const filterType = (item: TableData) => {
		const data = ['数据库', '网站', '空间存储状态', '安全风险', '网站漏洞扫描', '恶意文件检测']
		if (data.includes(item.name)) {
			if (item.name === '空间存储状态' || item.name === '数据库' || item.name === '网站') {
				return (item.data as Array<Record<string, string>>).length > 0
			} else {
				return (item.data as { detail: Array<Record<string, string>> }).detail?.items?.length > 0
			}
		} else {
			return (item.data as { detail: Array<Record<string, string>> }).detail.length > 0
		}
	}

	// 打开异常详情
	const goDetail = (data: any[] | { detail: any[] }, name: string) => {
		const environmentData = ['Nginx', 'Mysql', 'Apache', 'PHP', 'Ftpd', 'Redis', 'Tomcat', 'Memcached']
		const level: any = {
			1: '低危',
			2: '中危',
			3: '高危',
			4: '严重',
		}
		if (name == '数据库' || name == '网站') {
			if ((data as any[])[0].target) {
				tableColumn.value = [
					{ label: '名称', showOverflowTooltip: true, prop: 'name' },
					{
						label: '时间',
						render: (row: { time: number }, index: number) => formatTime(row.time, 'yyyy-MM-dd hh:mm:ss'),
					},
				]
			} else {
				tableColumn.value = [{ label: '名称', showOverflowTooltip: true, prop: 'name' }]
			}
		} else if (name == '面板异常登录' || name == 'SSH异常登录') {
			tableColumn.value = [
				{
					label: '时间',
					showOverflowTooltip: true,
					render: (row: { time: number }) => formatTime(row.time, 'yyyy-MM-dd hh:mm:ss'),
				},
				{ label: '用户', prop: 'username' },
				{ label: '详情', prop: 'desc' },
			]
		} else if (name == '空间存储状态') {
			tableColumn.value = [
				{ label: '名称', width: 130, prop: 'name' },
				{
					label: '占用空间',
					prop: 'value',
				},
			]
		} else if (name == '磁盘') {
			tableColumn.value = [
				{ label: '路径', showOverflowTooltip: true, prop: 'name' },
				{ label: '占用', render: (row: { percent: number | string }) => row.percent + '%' },
			]
		} else if (name == 'CPU' || name == '内存') {
			tableColumn.value = [
				{
					label: '过载时间',
					width: 100,
					render: (row: { time: number }) => {
						return <span>{formatTime(row.time, 'yyyy-MM-dd hh:mm:ss')}</span>
					},
				},
				{ label: 'PID', prop: 'pid', width: 60 },
				{ label: '进程', prop: 'name', showOverflowTooltip: true },
				{
					label: '占用',
					width: 60,
					render: (row: { percent: number | string }) => row.percent + '%',
				},
			]
		} else if (environmentData.includes(name)) {
			tableColumn.value = [
				{
					label: '停止时间',
					render: (row: { time: number }) => formatTime(row.time, 'yyyy-MM-dd hh:mm:ss'),
				},
			]
		} else if (name == '安全风险') {
			tableColumn.value = [
				{ label: '名称', prop: 'title' },
				{ label: '时间', render: (row: { check_time: number }) => formatTime(row.check_time, 'yyyy-MM-dd hh:mm:ss'), width: '140' },
				{ label: '风险级别', render: (row: any) => level[row.level], width: '80' },
			]
		} else if (name == '网站漏洞扫描') {
			tableColumn.value = [
				{ label: '名称', prop: 'risk_desc' },
				{ label: '站点名称', prop: 'site_name', showOverflowTooltip: true, width: '100' },
				{ label: '风险级别', render: (row: any) => level[row.risk_level], width: '80' },
			]
		} else if (name === '恶意文件检测') {
			tableColumn.value = [
				{ label: '威胁类型', prop: 'threat_type' },
				{ label: '文件路径', prop: 'filepath', showOverflowTooltip: true },
				{ label: '风险级别', render: (row: any) => level[row.risk_level] },
				{ label: '是否隔离', prop: 'quarantined', render: (row: any) => (row.quarantined ? '是' : '否') },
			]
		}
		if (name == '数据库' || name == '网站' || name == '空间存储状态') {
			dataList.value = data as any[]
		} else if (name === '安全风险' || name == '网站漏洞扫描' || name === '恶意文件检测') {
			dataList.value = (data as { detail: any[] }).detail.items
		} else {
			dataList.value = (data as { detail: any[] }).detail
		}
		tableColumn.value.unshift({
			width: 40,
			type: 'index',
		})
	}

	/**
	 * @description 获取面板日报数据
	 * @param time
	 */
	const getPanelDailyDatas = async (time: string) => {
		const { data } = await useDataHandle({
			request: GetPanelDailyData({ date: time }),
		})
		topStatus.value = data.evaluate
		if (data.evaluate === '正常') {
			topStatusColor.value = 'var(--el-color-primary)'
		} else if (data.evaluate === '良好') {
			topStatusColor.value = '#2034a5'
		} else {
			topStatusColor.value = '#ffa700'
		}
		const resTime = data.date.toString()
		watchTime.value = resTime.substr(0, 4) + '-' + resTime.substr(4, 2) + '-' + resTime.substr(6, 2) + ' 00:00:00 - 23:59:59'
		summary.value = data.summary
		tableList.value = [
			{ name: '资源', value: '过载次数(五分钟内平均使用率超过80%)' },
			{ name: 'CPU', is_status: true, data: data.data.cpu },
			{ name: '内存', is_status: true, data: data.data.ram },
			{ name: '磁盘', is_status: true, data: data.data.disk },
			{ name: '常用服务', value: '异常次数(服务出现停止运行的次数)' },
			{ name: 'Nginx', is_status: true, data: data.data.server.nginx },
			{ name: 'Mysql', is_status: true, data: data.data.server.mysql },
			{ name: 'Apache', is_status: true, data: data.data.server.apache },
			{ name: 'PHP', is_status: true, data: data.data.server.php },
			{ name: 'Ftpd', is_status: true, data: data.data.server.ftpd },
			{ name: 'Redis', is_status: true, data: data.data.server.redis },
			{ name: 'Tomcat', is_status: true, data: data.data.server.tomcat },
			{ name: 'Memcached', is_status: true, data: data.data.server.memcached },
			{ name: '备份类型', value: '备份失败', excess: '未开启备份', is_excess: true },
			{
				name: '数据库',
				is_status: true,
				data: data.data.backup.database.backup,
				data_excess: data.data.backup.database.no_backup,
				have_data_excess: true,
			},
			{
				name: '网站',
				is_status: true,
				data: data.data.backup.site.backup,
				data_excess: data.data.backup.site.no_backup,
				have_data_excess: true,
			},
			{ name: '异常类型', value: '次数' },
			{ name: '面板异常登录', is_status: true, data: data.data.exception.panel },
			{ name: 'SSH异常登录', is_status: true, data: data.data.exception.ssh },
			{ name: '安全', value: '次数' },
			{ name: '安全风险', is_status: true, data: data.data.safe.home_risks },
			{ name: '网站漏洞扫描', is_status: true, data: data.data.safe.vulnerabilities },
			{ name: '恶意文件检测', is_status: true, data: data.data.safe.malware },
		]
		if (data.data.disk?.app_data) {
			const spaceData = getSpaceData(data.data.disk.app_data)
			tableList.value.push({ name: '空间存储状态', is_status: true, data: spaceData })
		}
	}

	/**
	 * @description 获取空间存储状态数据
	 */
	const getSpaceData = (data: any) => {
		let arr: any = []
		const keyName: any = {
			sites: '站点',
			databases: '数据库',
			plugins: '面板插件',
			logs: '日志',
			backup: '备份',
		}
		Object.keys(keyName).forEach((key: any) => {
			arr.push({
				name: `${keyName[key]}`,
				value: data[key],
			})
		})
		return arr
	}

	/**
	 * @description 获取面板日报列表
	 */
	const getPanelDailyInfoLists = async () => {
		await useDataHandle({
			request: GetPanelDailyInfoList(),
			data: Array,
			success: (data: any) => {
				const statusInfo: any = {
					正常: 'success',
					良好: 'warning',
					异常: 'error',
				}
				selectData.value = data
					?.map((item: { time_key: string; evaluate: string }) => {
						return {
							label: item.time_key.toString().substr(0, 4) + '-' + item.time_key.toString().substr(4, 2) + '-' + item.time_key.toString().substr(6, 2),
							value: item.time_key,
							isStatus: statusInfo[item.evaluate] || 'error',
						}
					})
					.reverse()
				selectValue.value = selectData.value.length ? (selectData.value[0].value as string) : ''
				if (selectValue.value) getPanelDailyDatas(selectValue.value)
			},
		})
	}

	/**
	 * @description 设置日报状态
	 */
	const changeDailyStatus = async (val: boolean) => {
		await useConfirm({
			title: '日报',
			content: `您确定要${val ? '开启' : '关闭'}日报功能吗？`,
		})
		await useDataHandle({
			request: setDailyStatus({ status: val ? 'start' : 'stop' }),
			message: true,
			success: async () => {
				await getDailyStatus()
				if (dailyValue.value) {
					getPanelDailyInfoLists()
				}
			},
		})
	}

	/**
	 * @description 获取日报状态
	 */
	const getDailyStatus = async () => {
		await useDataHandle({
			request: checkDailyStatus(),
			data: [Boolean, dailyValue],
		})
	}

	// -------------------面板日报 end-------------------

	const $reset = () => {
		// 面板日报
		tableColumn.value = []
		dataList.value = []
		selectData.value = []
		tableList.value = []
	}

	return {
		tabActive,
		$reset,
		// 面板日报
		selectData,
		dataList,
		tableList,
		selectValue,
		topStatus,
		topStatusColor,
		watchTime,
		summary,
		tableColumn,
		productData,
		dailyValue,
		getDailyStatus,
		changeDailyStatus,
		getPanelDailyInfoLists,
		getPanelDailyDatas,
		filterType,
		goDetail,
	}
})

export default CONTROL_STORE
