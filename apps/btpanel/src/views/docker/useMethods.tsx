import type { TableBatchOptionsProps, TableBatchDialogProps, TableBatchNextAllProps, TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d'
import type { SelectOptionProps } from '@/components/form/bt-select/types'

import { useDialog } from '@/hooks/tools'
import { getNpsQuestion } from '@api/global' // 需求反馈
import { formatTime, getByteUnit, copyText, isArray, isString } from '@utils/index'
import { useDataHandle } from '@/hooks/tools'
import { Message } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useTopMove, useOperate } from '@hooks/tools/table/column'
import { getDockerStore } from './useStore'
import { delContainer, setContainerStatus, setContainerRemark } from '@/api/docker'
import { setPs } from '@/api/global'
import { slice as sliceArray } from 'ramda'
import { useThrottleFn } from '@vueuse/core'

import { ElTooltip, ElDropdown, ElDropdownMenu, ElDropdownItem, ElProgress, ElTag, ElCheckboxGroup, ElCheckboxButton, ElButton, ElInput, ElSwitch, ElPopover } from 'element-plus'
import BtSelect from '@components/form/bt-select'

interface PaginationProps {
	list: any[]
	p: number
	limit: number
}

const {
	refreshActiveTable,
	refs: { cpuAndMemData },
} = getDockerStore()

/**
 * @description 渲染图标提示
 * @param label  标签
 * @param tips  提示/链接
 * @param suffix  后缀/链接
 */
export const renderIconTip = (label: string, tips: string, suffix?: string) => {
	if (tips === 'link') {
		return (
			<div>
				{label}
				<span class="ml-4px bt-ico-ask" onClick={() => window.open(suffix, '_blank', 'noopener,noreferrer')}>
					?
				</span>
			</div>
		)
	}
	return (
		<div class="flex items-center">
			<span>{label}</span>
			<ElTooltip content={tips} placement="top">
				<span class="ml-4px bt-ico-ask">{suffix || '?'}</span>
			</ElTooltip>
		</div>
	)
}

/**
 * @description 手动分页函数
 * @param {TableDataProps} tableData 表格数据
 * @param {TableDataProps} tableData.list 数据列表
 * @param {TableDataProps} tableData.limit 每页条数
 * @param {TableDataProps} tableData.p 当前页
 * @returns {TableDataProps} 当前页的数据
 */
export const chunkArray = <T extends PaginationProps>(tableData: T): any[] => {
	// 计算当前页的起始索引
	const start = (tableData.p - 1) * (tableData.limit as number)
	// 计算当前页的结束索引
	const end = start + tableData.limit
	// 使用 slice 直接获取当前页的数据
	return sliceArray(start, end, tableData.list)
}

/**
 * @description 获取表格备注配置
 * @param {ConfigPorp} config 对象
 * @returns {TableConfig} 表格配置
 */
export const getAllPsConfig = (config: { table?: string; prop?: string; edit?: AnyFunction; noPlace?: boolean; noCustom?: boolean; width?: number }): any => {
	const props = config.prop || 'ps'
	return {
		label: `备注`,
		prop: props,
		width: config.width ? config.width : 200,
		isCustom: config.noCustom ? false : true,
		render: (row: any) => {
			if (row[props] === undefined) return <div class="loading" v-bt-loading={true}></div>
			const arrEntities: any = {
				lt: '<',
				gt: '>',
				nbsp: ' ',
				amp: '&',
				quot: '"',
			}
			row[props] = row[props].replace(/&(lt|gt|nbsp|amp|quot);/gi, (all, t) => arrEntities[t])
			return h('input', {
				type: 'text',
				value: row[props],
				class: 'bt-table-input w-full',
				title: '点击修改备注，失去焦点后自动保存',
				placeholder: config.noPlace ? '' : `${'点击编辑备注'}`,
				onBlur: (e: any) => {
					if (row[props] === e.target.value) return false
					row[props] = e.target.value
					if (config.edit) {
						config.edit(row)
					} else {
						setPsEvent(row, config.table as string)
					}
				},
			})
		},
	}
}

/**
 * @description 设置备注
 * @param {number} data.id id
 * @param {string} data.ps 备注
 * @param {string} table 表名
 * @returns {Promise<void>}
 */
const setPsEvent = async ({ id, ps, remark }: { id: number; ps: string; remark?: string }, table: string): Promise<void> => {
	await useDataHandle({
		loading: '正在修改备注信息，请稍后...',
		request: setPs({ id, table, ps: ps || remark || '' }),
		message: true,
	})
}
/**
 * @description 创建容器
 * @returns {Promise<VueConstructor>}
 */
export const openAddContainerView = (config?: { image: string }): Promise<Component> => {
	return useDialog({
		component: () => import('@docker/public/create-con-dialog/index.vue'),
		compData: config,
		title: `创建容器`,
		area: 74,
		btn: '创建',
	})
}

/**
 * @description 实时监控
 * @returns {Promise<VueConstructor>}
 */
export const CreateRealMonitorDialog = (row: any): Promise<Component> => {
	return useDialog({
		component: () => import('@docker/public/real-monitor-dialog.vue'),
		title: `【${row.name}】实时监控`,
		area: 100,
		compData: { row },
	})
}

/**
 * @description 容器重命名
 * @returns {Promise<VueConstructor>}
 */
export const reNameDialog = (row: any): Promise<Component> => {
	return useDialog({
		component: () => import('@docker/public/compose-detail-dialog/container-rename.vue'),
		compData: { row, type: 'dialog' },
		title: `重命名容器【${row.name}】`,
		area: 40,
		btn: '保存',
	})
}
/**
 * @description 需求反馈
 * @returns {Promise<VueConstructor>}
 */
export const NPSDialog = async (): Promise<void> => {
	useDataHandle({
		request: getNpsQuestion({ version: -1, product_type: 10 }),
		success: ({ data }: any) => {
			useDialog({
				component: () => import('@components/business/bt-nps-survey-v2/index.vue'),
				area: 52,
				compData: {
					name: 'Docker',
					type: 10,
					id: data.msg[0].id,
					description: data.msg[0].question,
				},
			})
		},
	})
}

/**
 * @description 容器详情
 * @returns {Promise<VueConstructor>}
 */
export const openContainerDetailView = (row: any, type?: string): Promise<Component> => {
	if (!isString(type)) type = ''
	return useDialog({
		component: () => import('@docker/public/compose-detail-dialog/index.vue'),
		title: `容器【${row.name}】详情`,
		area: [90, 64],
		compData: { row, type },
	})
}

/**
 * @description 容器终端
 * @returns {Promise<VueConstructor>}
 */
export const CreateTerminalDialog = (cmd: any): Promise<Component> =>
	useDialog({
		component: () => import('@docker/public/con-terminal-dialog/container-terminal-dialog.vue'),
		title: `宝塔终端`,
		area: [80, 50],
		compData: {
			cmd,
		},
	})

/**
 * @description 终端事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const terminalEvent = async (row: any): Promise<void> => {
	if (row.status !== 'running') return Message.error('容器未运行')
	useDialog({
		title: 'shell类型',
		area: 40,
		component: () => import('@docker/public/con-terminal-dialog/shell-type-select.vue'),
		compData: { row, openTerminalLog: CreateTerminalDialog },
		btn: ['确认'],
	})
}

/**
 * @description 拉取镜像日志
 * @returns {Promise<VueConstructor>}
 */
export const pullMirrorDialog = (isOther?: boolean): Promise<Component> =>
	useDialog({
		component: () => import('@docker/public/pull-mirror-dialog.vue'),
		title: `日志`,
		area: 64,
		compData: { isOther },
	})

/**
 * @description 添加模板
 * @returns {Promise<VueConstructor>}
 */
export const addTemplateDialog = (callback: any): Promise<Component> =>
	useDialog({
		component: () => import('@docker/public/add-template-dialog/index.vue'),
		title: `添加Yaml模板`,
		area: 64,
		btn: '添加',
		compData: { callback },
	})

/**
 * @description 打开NPS弹窗
 */
export const openNps = () => {
	const endtime = Number(localStorage.getItem('NPS-TIME'))
	const expArr: any = localStorage.getItem('NPS-EXP') || []
	if (endtime < new Date().getTime() && !expArr.includes(31)) {
		useDialog({
			title: false,
			area: 36,
			component: () => import('@components/business/bt-nps-survey-ltd/index.vue'),
			modal: false,
			compData: {
				name: 'Docker',
				type: 31,
			},
		})
	}
}

/**
 * @description 容器批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useContainerBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const requestHandle = async (item: AnyObject, index: number) => {
		const { id } = item
		switch (value) {
			case 'delete':
				return await delContainer({ data: JSON.stringify({ id }) })
			default:
				const params = { id, status: value }
				return await setContainerStatus({ data: JSON.stringify(params) })
		}
	}
	await batchConfirm({
		title: `批量${label}容器`,
		content: `批量${label}已选的容器，是否继续操作！`,
		column: [{ label: '容器名', prop: 'name' }, useBatchStatus()], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			refreshActiveTable()
			// 返回false则不关闭弹窗
			return false
		},
	})
}
// 容器表格
export const useContainerTableColumn = ({ terminalEvent, logDataEvent, deleteDataEvent, conDetailEvent, setStatusEvent, setStatusTitle, openContainerBackups, changeTaskTopEvent, statusFilterKey, moreEvent }: any) => {
	return [
		useCheckbox(),
		useTopMove({
			event: (row: any, type: string) => changeTaskTopEvent(row, type),
			param: 'is_top',
		}),
		{
			label: `容器名`,
			prop: 'name',
			render: (row: any) => (
				<span class="bt-link" onClick={() => conDetailEvent(row)}>
					{row.name}
				</span>
			),
		},
		{
			label: '容器ID',
			isCustom: true,
			prop: 'id',
			width: 120,
			render: (row: any) => {
				return (
					<ElTooltip placement={'top'}>
						{{
							default: () => (
								<div class={'w-[100px] h-full'} onClick={() => copyText({ value: row.id })}>
									{row.id.slice(0, 12)}
								</div>
							),
							content: () => <div>{row.id}</div>,
						}}
					</ElTooltip>
				)
			},
		},
		{
			label: '备份',
			isCustom: false,
			width: 60,
			render: (row: any) => {
				return row.hasOwnProperty('backup_count') ? (
					<span class={`bt-link ${row.backup_count > 0 ? '' : '!text-warning'}`} onClick={() => openContainerBackups(row)}>
						{row.backup_count > 0 ? `有(${row.backup_count})` : `无备份`}
					</span>
				) : (
					<span class={`bt-link !text-warning`} onClick={() => openContainerBackups(row)}>
						{`无备份`}
					</span>
				)
			},
		},
		{
			label: `状态`,
			renderHeader() {
				const menu: any[] = [
					{ title: '全部', key: 'all' },
					{ title: '正在运行', key: 'running' },
					{ title: '暂停', key: 'paused' },
					{ title: '停止', key: 'exited' },
				]
				return h('div', { class: 'flex items-center flex-nowrap' }, [
					'',
					h(
						ElDropdown,
						{ onCommand: (key: string) => setStatusTitle(key) },
						{
							default: () =>
								h('span', { class: 'text-small flex items-center' }, [
									[
										<span class="status-header-text">
											状态
											{statusFilterKey.value === 'all' ? '' : `(${menu.find((items: any) => items.key === statusFilterKey.value).title})`}
										</span>,
									],
									h('i', { class: 'svgtofont-el-arrow-down ' }),
								]),
							dropdown: () => (
								<ElDropdownMenu>
									{menu.map(item => (
										<ElDropdownItem command={item.key}>{item.title}</ElDropdownItem>
									))}
								</ElDropdownMenu>
							),
						}
					),
				])
			},
			prop: 'status',
			isCustom: true,
			width: 120,
			render: (row: any) => {
				let menu: any[] = []
				let status: any[] = []
				if (row.status === 'running') {
					status = ['运行中', h('span', { class: 'svgtofont-icon-start text-primary' })]
					menu = [
						{ title: '停止', key: 'stop' },
						{ title: '重启', key: 'restart' },
						{ title: '强制停止', key: 'kill' },
						{ title: '暂停', key: 'pause' },
					]
				} else if (row.status === 'exited') {
					status = ['已停止', h('span', { class: 'svgtofont-icon-stop text-danger' }, {})]
					menu = [
						{ title: '启动', key: 'start' },
						{ title: '重启', key: 'restart' },
					]
				} else {
					status = ['已暂停', h('span', { class: 'svgtofont-icon-stop text-danger' }, {})]
					menu = [
						{ title: '重启', key: 'restart' },
						{ title: '恢复', key: 'unpause' },
						{ title: '强制停止', key: 'kill' },
					]
				}
				return h(
					ElDropdown,
					{ onCommand: (key: string) => setStatusEvent(row, key) },
					{
						default: () => <span class={(row.status === 'running' ? 'text-primary' : 'text-danger') + ' flex items-center'}>{status}</span>,
						dropdown: () => (
							<ElDropdownMenu>
								{menu.map((item: any) => (
									<ElDropdownItem key={item.key} command={item.key}>
										{item.title}
									</ElDropdownItem>
								))}
							</ElDropdownMenu>
						),
					}
				)
			},
		},
		{
			label: `镜像`,
			isCustom: true,
			prop: 'image',
			minWidth: 100,
			// showOverflowTooltip: true, // 超出是否展示tooltip，默认为false
		},
		{
			label: `IP`,
			isCustom: false,
			prop: 'ip',
			minWidth: 60,
			render: (row: any) => (row.ip.length > 0 ? row.ip[0] : ''),
		},
		{
			label: 'IPV6',
			isCustom: false,
			prop: 'ipv6',
			minWidth: 60,
			render: (row: any) => (row.ipv6.length > 0 ? row.ipv6[0] : ''),
		},
		{
			label: 'CPU / 内存',
			isCustom: false,
			prop: 'cpu_mem',
			columnKey: 'cpu_mem',
			showOverflowTooltip: false,
			render: (row: any) => {
				const valueObj = cpuAndMemData.value[row.id]
				let cpu = Number(valueObj.cpu_usage)
				let mem = Number(valueObj.mem_percent)
				if (cpu && cpu > 100) cpu = 100
				if (mem && mem > 100) mem = 100
				if (row.status === 'running') {
					return valueObj.cpu_usage === undefined || valueObj.mem_percent === undefined ? (
						<div class="loading h-[4.6rem] flex items-center">正在获取中...</div>
					) : (
						<ElTooltip placement={'top'}>
							{{
								default: () => (
									<div class={'w-[100px]'}>
										<div class={'flex items-center justify-between'}>
											<span class={'w-[3rem] inline-block whitespace-nowrap'}>cpu：</span>
											<ElProgress class={'w-[7rem] ml-[1rem]'} percentage={cpu || 0} show-text={false}></ElProgress>
										</div>
										<div class={'flex items-center justify-between'}>
											<span class={'w-[3rem] inline-block whitespace-nowrap'}>内存：</span>
											<ElProgress class={'w-[7rem] ml-[1rem]'} percentage={mem || 0} show-text={false}></ElProgress>
										</div>
									</div>
								),
								content: () => (
									<div>
										CPU：{cpu}%
										<br />
										内存：{mem}%
									</div>
								),
							}}
						</ElTooltip>
					)
				} else {
					return <div class="h-[4.6rem] flex items-center">--</div>
				}
			},
		},
		{
			label: `端口(主机-->容器)`,
			prop: 'ports',
			isCustom: true,
			minWidth: 130,
			columnKey: 'ports',
			showOverflowTooltip: false, // 超出是否展示tooltip，默认为false
			render: (row: any) => {
				const arr = Object.entries(row.ports) || []
				const str: string[] = []
				let num = 0
				for (let index = 0; index < arr.length; index++) {
					if (num >= 10) {
						str.push('......')
						break
					}
					const item: any = arr[index]
					if (item[1]) {
						str.push(`${item[1][0].HostIp || '0.0.0.0'}:${item[1][0].HostPort}-->${item[0]} `)
						num++
					}
				}
				return (
					<span key={row.id} class="flex items-center whitespace-pre-wrap gap-4 min-h-[3rem]" title={str.join(' ')}>
						{str.map((con, index) => {
							// 判断 HostIp 是否为 0.0.0.0
							const isAllIp = con.startsWith('0.0.0.0:')
							if (isAllIp) {
								return (
									<ElPopover trigger="hover" placement="bottom" width="12.5rem" popper-class="!min-w-[12.5rem]">
										{{
											reference: () => (
												<ElTag type="primary" size="default" class="mr-1 cursor-pointer bt-link">
													<span class="inline-flex items-center gap-x-1">
														<i class="svgtofont-el-link !text-base !text-primary"></i>
														{con}
													</span>
												</ElTag>
											),
											default: () => (
												<div class="-m-[12px] text-small">
													<div class="px-[16px] py-[8px] cursor-pointer text-center hover:bg-light" onClick={() => jumpToUrl(con, 'http')}>
														HTTP协议访问
													</div>
													<div class="px-[16px] py-[8px] cursor-pointer text-center hover:bg-light" onClick={() => jumpToUrl(con, 'https')}>
														HTTPS协议访问
													</div>
												</div>
											),
										}}
									</ElPopover>
								)
							} else {
								return (
									<ElTag type="primary" size="default" class="mr-1" title="本机内部访问">
										{con}
									</ElTag>
								)
							}
						})}
					</span>
				)
			},
		},
		{
			label: '创建时间',
			isCustom: false,
			prop: 'created_time',
			width: 150,
			render: (row: any) => formatTime(row.created_time),
		},
		getAllPsConfig({
			edit: async (row: any) => {
				try {
					useDataHandle({
						request: setContainerRemark({
							data: JSON.stringify({ id: row.id, remark: row.remark }),
						}),
						message: true,
					})
				} catch (error) {}
			},
			noPlace: true,
			noCustom: true,
			prop: 'remark',
			table: 'containers',
			width: 200,
		}),
		useOperate([
			{ onClick: conDetailEvent, title: '管理' }, // 移植到更多
			{ onClick: terminalEvent, title: `终端` },
			{ onClick: deleteDataEvent, title: `删除` },
			{
				width: 50,
				onClick: moreEvent,
				isMore: true,
				menu: [
					{ key: 'log', title: `日志` },
					{ key: 'reName', title: `重命名` },
					{ key: 'realMonitor', title: `实时监控` },
					{ key: 'dir', title: `目录` },
				],
			},
		]),
	]
}

// 搜索本地模板表格
export const useSearchTableColumn = () => {
	return [
		useCheckbox({ key: 'project_name' }),
		{ label: `Compose模板名`, prop: 'project_name', minWidth: 100 },
		{
			label: `路径`,
			prop: 'conf_file',
			showOverflowTooltip: true, // 超出是否展示tooltip，默认为false
			minWidth: 100,
		},
		{ label: `备注`, prop: 'remark', minWidth: 100 },
	]
}

// 容器编辑端口表格
export const usePortTableColumn = ({ setPort, delPort }: any) => [
	{
		label: '本地端口',
		prop: 'server',
		// width: 150,
		render: (row: any) => {
			return <ElInput size="small" modelValue={row.server} onInput={(val: any) => setPort(val, row, 'server')} placeholder="例如：80" />
		},
	},
	{
		label: '容器',
		prop: 'con',
		// width: 150,
		render: (row: any) => {
			return <ElInput size="small" modelValue={row.con} onInput={(val: any) => setPort(val, row, 'con')} placeholder="例如：80" />
		},
	},
	{
		label: '对外暴露',
		prop: 'output',
		width: 100,
		render: (row: any) => {
			return <ElSwitch size="small" modelValue={row.output} onChange={(val: any) => setPort(val, row, 'output')} />
		},
		renderHeader: () => renderIconTip('对外暴露', '允许外部访问会将端口映射出去，所有人都可以访问这个端口(不建议)'),
	},
	{
		label: '协议',
		prop: 'protocol ',
		width: 220,
		render: (row: any) => {
			return (
				<div class="flex items-center">
					<ElCheckboxGroup modelValue={row.protocol} onChange={(val: any) => setPort(val, row, 'protocol')}>
						<ElCheckboxButton value="tcp">TCP</ElCheckboxButton>
						<ElCheckboxButton value="udp">UDP</ElCheckboxButton>
					</ElCheckboxGroup>
					<ElButton class="!ml-[1rem] h-[2.8]" onClick={() => delPort(row)}>
						<i class="svgtofont-el-delete"></i>
					</ElButton>
				</div>
			)
		},
	},
]

// 容器编辑网络表格列
export const useTableNetColumn = ({ changeNet, delNet, netOptions }: { changeNet: AnyFunction; delNet: AnyFunction; netOptions: Ref<SelectOptionProps[]> }) => [
	{
		label: '网络名称',
		prop: 'network',
		minWidth: 110,
		render: (row: any) => {
			return (
				<div class="h-[3rem]">
					<BtSelect modelValue={row.network} class="!w-[20rem]" options={netOptions.value} onChange={(val: string) => changeNet(row, val, 'network')}></BtSelect>
				</div>
			)
		},
	},
	{
		label: 'IPV4地址',
		prop: 'con',
		width: 150,
		render: (row: any) => {
			return (
				<ElInput
					size="default"
					v-model={row.ip4}
					disabled={row.network == 'bridge' || row.network == 'none' || row.network == 'host'}
					onBlur={(e: InputEvent) => changeNet(row, e.target.value, 'ip4')}
					placeholder={row.network === 'bridge' || row.network === 'none' || row.network === 'host' ? '非自定义网卡' : '例如：172.20.x.x'}
				/>
			)
		},
	},
	{
		label: 'IPV6地址',
		prop: 'protocol ',
		minWidth: 100,
		render: (row: any) => {
			return (
				<div class="flex items-center">
					<ElInput
						size="default"
						v-model={row.ip6}
						disabled={row.network == 'bridge' || row.network == 'none' || row.network == 'host'}
						onBlur={(e: InputEvent) => changeNet(row, e.target.value, 'ip6')}
						placeholder={row.network === 'bridge' || row.network === 'none' || row.network === 'host' ? '自定义网卡可以设置' : '例如：2001:0db8::1'}
					/>
					<ElButton class="!ml-[1rem] h-[2.8]" onClick={() => delNet(row)}>
						<i class="svgtofont-el-delete"></i>
					</ElButton>
				</div>
			)
		},
	},
]

// // 获取图片base64
// const getBase64 = async (imgUrl: string) => {
// 	return new Promise((resolve, reject) => {
// 		if (!imgUrl) reject('请传入imgUrl内容')
// 		if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(imgUrl)) {
// 			window.URL = window.URL || window.webkitURL
// 			var xhr = new XMLHttpRequest()
// 			xhr.open('get', imgUrl, true)
// 			xhr.responseType = 'blob'
// 			xhr.onload = function () {
// 				if (this.status == 200) {
// 					// 得到一个blob对象
// 					const blob = this.response
// 					const oFileReader = new FileReader()
// 					oFileReader.onloadend = e => resolve(e.target?.result || '')
// 					oFileReader.readAsDataURL(blob)
// 				} else if (this.status == 404) {
// 					resolve('/static/img/soft_ico/ico-dkapp_rabbitmq.png')
// 				}
// 			}
// 			xhr.send()
// 		} else {
// 			// 非图片地址
// 			reject('非(png/jpe?g/gif/svg等)图片地址')
// 		}
// 	})
// }

// /**
//  * @description 图片缓存
//  * @returns @getCachedImage 获取缓存图片 传入     图片地址：url,     唯一标识（可选）：name    返回 base64或者url
//  * @returns @clearCache 清除缓存
//  * 使用注意，配合v-for使用时请在父元素定义，确保所有图片都在同用一个图片缓存对象
//  */
// export const useImagesCache = () => {
// 	// 图片缓存对象
// 	const imageCache = new Map<string, string>()
// 	// 加载图片,并将图片转换为base64,并缓存
// 	const loadImage = async (url: string, key: string, cacheMap: any) => {
// 		// 如果缓存中有直接返回
// 		if (cacheMap.has(key)) return Promise.resolve(cacheMap.get(key))
// 		const aa = await getBase64(url) // 加载图片,获取base64
// 		cacheMap.set(key, aa) // 缓存图片
// 	}

// 	// 获取缓存图片
// 	const getCachedImage = (url: string, name?: string) => {
// 		const key = name ? name : url
// 		if (imageCache.has(key)) {
// 			return imageCache.get(key)
// 		} else {
// 			loadImage(url, key, imageCache)
// 			return url
// 		}
// 	}
// 	const destroy = () => imageCache.clear() // 手动销毁
// 	onUnmounted(() => destroy())
// 	return { getCachedImage, clearCache: destroy }
// }

// 工具函数：将图片 URL 转换为 base64 字符串
const fetchImageAsBase64 = async (url: string): Promise<string> => {
	const response = await fetch(url)

	// 判断是否为图片
	const contentType = response.headers.get('content-type')
	if (!contentType || !contentType.startsWith('image/')) {
		// 不是图片，返回插件图标
		return '/static/img/soft_ico/icon_plug.svg'
	}
	const blob = await response.blob()
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result as string)
		reader.onerror = () => resolve('/static/img/soft_ico/icon_plug.svg')
		reader.readAsDataURL(blob)
	})
}

// 打开 IndexedDB 数据库
const openIndexedDB = (): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('ImageCacheDB', 1)
		request.onupgradeneeded = event => {
			const db = (event.target as IDBOpenDBRequest).result
			db.createObjectStore('images', { keyPath: 'url' })
		}
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}

// 从 IndexedDB 获取缓存的图片
const getCachedImageFromDB = async (url: string): Promise<string | null> => {
	const db = await openIndexedDB()
	return new Promise((resolve, reject) => {
		const transaction = db.transaction('images', 'readonly')
		const store = transaction.objectStore('images')
		const request = store.get(url)
		request.onsuccess = () => resolve(request.result ? request.result.data : null)
		request.onerror = () => reject(request.error)
	})
}

// 将图片存入 IndexedDB
const storeImageInDB = async (url: string, data: string): Promise<void> => {
	const db = await openIndexedDB()
	return new Promise((resolve, reject) => {
		const transaction = db.transaction('images', 'readwrite')
		const store = transaction.objectStore('images')
		const request = store.put({ url, data })
		request.onsuccess = () => resolve()
		request.onerror = () => reject(request.error)
	})
}

// 清除 IndexedDB 缓存
export const clearImageCacheDB = async (): Promise<void> => {
	const db = await openIndexedDB()
	return new Promise((resolve, reject) => {
		const transaction = db.transaction('images', 'readwrite')
		const store = transaction.objectStore('images')
		const request = store.clear()
		request.onsuccess = () => resolve()
		request.onerror = () => reject(request.error)
	})
}

// 主函数：获取缓存的图片或请求并缓存图片
export const getCachedImage = async (url: string): Promise<string> => {
	let cachedImage = await getCachedImageFromDB(url)
	if (cachedImage) {
		return cachedImage
	} else {
		const base64Image = await fetchImageAsBase64(url)
		await storeImageInDB(url, base64Image)
		return base64Image
	}
}

// 主页逻辑部分
export const disabled = ref(false)
export const modelVal = ref('docker-appstore')
const {
	getDockerState,
	refs: { settingData },
} = getDockerStore()
// 设置storageName
const setStorage = (tab: string, route: any) => {
	const key = `${route.path.split('/')[1] as string}_router`.toUpperCase()
	localStorage.setItem(key, tab)
}

// 判断是否是store
const isCheckRouter = (route: { path: string }) => {
	const pathList = route.path.split('/')
	if (pathList.length > 2 && pathList[2] != '') return true
	return false
}

// 设置tabs页面
const setTabsPage = (tabsNames: string, route: any, router: any) => {
	modelVal.value = tabsNames === 'container' ? 'containers' : tabsNames
	setStorage(tabsNames, route)
	if (route.name === `docker-${tabsNames}`) return
	router.push({ name: `docker-${tabsNames}` })
}

// 获取docker状态节流处理
const throttledGetDockerState = useThrottleFn(getDockerState, 1000)
/**
 * @description docker服务检测
 */
export const dockerTests = async (route: any, router: any) => {
	try {
		let localStore = localStorage.getItem('DOCKER_ROUTER') // 获取docker路由
		await throttledGetDockerState() // 获取docker状态
		if (!settingData.value.docker_installed || !settingData.value.docker_compose_installed || !settingData.value.service_status) {
			disabled.value = true
			if (route.name != `docker-setting`) {
				localStorage.setItem('DOCKER_ROUTER', 'setting') // 设置docker配置
				localStore = 'setting'
			}
			if (!settingData.value.service_status && settingData.value.docker_installed && settingData.value.docker_compose_installed) Message.error('请先启动Docker服务') // 提示启动docker服务
		} else {
			disabled.value = false
		}
		// 判断是否为二级路由
		if (isCheckRouter(route)) {
			setTabsPage(disabled.value ? 'setting' : (route.name as string).replace('docker-', ''), route, router)
		} else {
			setTabsPage(localStore || 'appstore', route, router)
		}
	} catch (error) {
		console.log(error)
	}
}

// 安装
export const goInstall = async () => {
	useDialog({
		component: () => import('@docker/views/setting/set-install-url/index.vue'),
		title: '安装',
		area: 64,
		btn: '确定',
	})
}

const jumpToUrl = (con: string, type: string) => {
	const host = window.vite_public_ip
	const port = con.split('-->')[0].split(':')[1]
	const url = `${type}://${host}:${port}`
	window.open(url, '_blank')
}
