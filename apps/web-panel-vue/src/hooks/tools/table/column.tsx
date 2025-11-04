import type { TableCheckboxTypes, TableColumnProps, TableColumnSwitchProps } from '@/components/data/bt-table/types'
import { getByteUnit, isFunction, isUndefined } from '@/utils'
import { openPathEvent, setPsEvent } from '@table/event'
import type { ConfigEventProps, ConfigProps } from '@table/types'
import { ElCheckbox, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'

// import BtIcon from '@/components/base/bt-icon'
import BtTableColumn from '@/components/extension/bt-table-column'
import BtTablePassword from '@/components/extension/bt-table-password'
import BtTableStatus from '@/components/extension/bt-table-status'
import BtSwitch from '@/components/form/bt-switch'
import BtDivider from '@/components/other/bt-divider'
import BtIcon from '@/components/base/bt-icon'
import { dropdownOptionProps } from '@/components/navigation/bt-dropdown/types'

export default (props: AnyObject, tableCol: Ref<TableColumnProps[]>) => <BtTableColumn {...props} name={props.name} column={tableCol.value} />

/**
 * @description 表格列
 * @param props
 * @param tableCol
 * @returns
 */
export const useColumn = (tableConfig: { tableCol: TableColumnProps<any>[] }, name: string) => {
	return <BtTableColumn name={name} column={tableConfig.tableCol} />
}

/**
 * @description 获取多页表格配置
 * @param {ConfigProps} config 对象
 */

export const useCheckbox = (config: { type?: 'all' | 'page'; key?: string; isHide?: boolean; disabled?: AnyFunction } = { type: 'page', key: 'id', isHide: false, disableds: () => {} }): TableColumnProps => {
	return {
		type: 'CheckBox',
		width: config.type === 'all' ? 42 : 36,
		isHide: config.isHide,
		renderHeader: (row: any, data: TableCheckboxTypes) => {
			const dropdownList = [
				{ label: '全选当前页', command: 'page-select' },
				{ label: '全选所有项', command: 'all-select' },
				{ label: '清空选中项', command: 'clear-select' },
			]
			const { checkAllCheckbox, checkAllIndeterminate, handleAllChange, handleCommandChange } = data
			return (
				<div class="flex items-center justify-center">
					<ElCheckbox v-model={checkAllCheckbox.value} indeterminate={checkAllIndeterminate.value} onChange={(value: any) => handleAllChange(value, false, config.key)} class="!mr-[4px]" />
					{config?.type === 'all' ? (
						<ElDropdown onCommand={handleCommandChange}>
							{{
								default: () => <BtIcon icon="el-arrow-down" />,
								dropdown: () => (
									<ElDropdownMenu>
										{dropdownList.map((item: dropdownOptionProps) => (
											<ElDropdownItem {...item}>{item.label}</ElDropdownItem>
										))}
									</ElDropdownMenu>
								),
							}}
						</ElDropdown>
					) : null}
				</div>
			)
		},
		render: (row: any, index: number, { handleScopeChange }: TableCheckboxTypes) => {
			// const selection = config?.selectable(row) || false
			// disabled = { selection }
			// if (selection) row.disable_check = true
			const disable = config.disabled?.(row) || false
			if (disable) row.disable_check = true
			return <ElCheckbox v-model={row.keys_scopes_status} disabled={disable} onChange={(value: any) => handleScopeChange(value, row, index, config.key || '')} />
		},
	}
}

// /**
//  * @description 获取表格配置
//  * @param {ConfigProps} config 对象
//  * @return {TableColumnProps} 表格配置
//  */
// export const useCheckbox = () => {
// 	return {
// 		type: 'selection',
// 		width:  36,
// 	}
// }

/**
 * @description 获取表格配置
 * @param {ConfigProps} config 对象
 * @return {TableColumnProps} 表格配置
 */
export const usePath = (config: ConfigProps = { prop: 'path' }): TableColumnProps => {
	return {
		label: config.label || '根目录', // 路径
		prop: config.prop,
		minWidth: config.width || 200,
		isCustom: true,
		render: row => {
			return (
				<span class="flex !justify-start inline-block bt-link leading-[16px]" onClick={() => openPathEvent(row, config.prop)} title={'点击打开目录'}>
					{row[config.prop as string]}
				</span>
			)
		},
	}
}

/**
 * @description 获取置顶配置
 * @param {ConfigProps} config 置顶配置 {event:置顶事件,param?:字符串，row里面的置顶状态参数，与下方的field相同功能}
 * @param {} field 字符串，row里面的置顶状态参数
 * @returns {TableColumnProps} 表格配置
 */
export const useTopMove = (config: any, field?: string): TableColumnProps => {
	// 置顶
	return {
		width: 22,
		type: 'toping',
		label: config.label || '', // 置顶
		subtitle: '置顶',
		className: 'cols-toping',
		// isCustom: false,
		render: (row: any) => {
			if (!field) field = 'sort'
			// 获取置顶参数并判断置顶状态
			const prop = config.param || field || ''
			const status = Boolean(row[prop]) && row[prop] !== '0'
			return (
				<div onClick={() => config.event(row, status ? 'untop' : 'top')}>
					<i style={`color:${status ? '#EFB958' : '#C7BDA9'}`} class={`svgtofont-icon-top cursor-pointer text-medium ${status ? '' : 'table-no-top opacity-80'}`} />
				</div>
			)
		},
	}
}

/**
 * @description 获取表格配置
 * @param {ConfigProps} config 对象
 * @returns {TableColumnProps} 表格配置
 */
export const usePs = (config: { table?: string; request?: AnyFunction; minWidth?: number; width?: number | string; prop?: string }): TableColumnProps => ({
	label: '备注',
	prop: 'ps',
	isCustom: true,
	showOverflowTooltip: false,
	width: config.width || 120,
	minWidth: config.minWidth || 120,
	render: (row: AnyObject) => {
		const arrEntities: AnyObject = {
			lt: '<',
			gt: '>',
			nbsp: ' ',
			amp: '&',
			quot: '"',
			'#x27': "'",
			apos: "'",
		}
		const psProp: string = config.prop ? config.prop : 'ps'
		let item =
			row[psProp]?.replace(/&(lt|gt|nbsp|amp|quot|#x27);/gi, function (_all: unknown, t: string | number) {
				return arrEntities[t]
			}) || ''

		return (
			<input
				type="text"
				value={item}
				class="bt-table-input w-full"
				placeholder={`点击编辑备注`}
				onBlur={(e: FocusEvent) => {
					const target = e.target as HTMLInputElement
					if (item === target?.value) return
					item = target.value
					if (config.request) {
						config.request(row, item)
						return
					}
					setPsEvent({ id: row.id, ps: item }, config.table as string)
				}}
				onKeyup={(e: KeyboardEvent) => {
					if (e.key === 'Enter') {
						// 检查是否按下了Enter键
						const target = e.target as HTMLInputElement
						target?.blur()
					}
				}}
			/>
		)
	},
})

/**
 * @description 获取状态表格配置
 * @param {ConfigProps} config 对象
 * @returns {TableColumnProps} 表格配置
 */
export const useStatus = (config: ConfigEventProps): TableColumnProps => {
	if (isUndefined(config.prop)) config.prop = 'status'
	if (isUndefined(config.data)) config.data = ['未启动', '运行中']
	return {
		label: '状态', // 状态
		prop: config.prop,
		width: config.width || 80,
		minWidth: config.sortable ? 80 : 70,
		isCustom: true,
		sortable: config.sortable || false,
		render: (row: AnyObject) => {
			let status = !!Number(row[config.prop as string])
			// 自定义渲染
			if (config.function) return config.function(row)
			// 判断状态，如果重启或启动状态则显示绿色，否则显示灰色
			if (['running', 'start'].includes(row[config.prop as string])) status = true
			// 判断状态，如果停止或未启动状态则显示灰色，否则显示绿色
			if (['exited', 'stop', 'created'].indexOf(row[config.prop as string]) > -1) status = false
			return <BtTableStatus modelValue={status} data={config.data} onClick={() => config.event(row)} />
		},
	}
}

/**
 * @description 获取密码表格配置
 * @param {ConfigProps} config 对象
 * @returns {TableColumnProps} 表格配置
 */
export const usePassword = (config: ConfigProps = { prop: 'password' }): TableColumnProps => ({
	label: '密码', // 密码
	prop: config.prop || 'password',
	minWidth: 130,
	width: config.width,
	isCustom: true,
	render: (row: any) => {
		return <BtTablePassword modelValue={row[(config.prop as string) || 'password']} onClickPwd={() => config.event && config.event(row)} />
	},
})

/**
 * @description 获取容量配额配置
 * @param {ConfigProps} config 对象
 * @returns {TableColumnProps} 表格配置
 */
export const useQuota = (config: ConfigEventProps): TableColumnProps => {
	return {
		label: '容量', // 容量
		isLtd: true,
		minWidth: 80,
		width: config.width || 'auto',
		// eslint-disable-next-line no-prototype-builtins
		isCustom: config?.hasOwnProperty('isCustom') ? config.isCustom : true,
		render: (row: { quota: AnyObject }) => {
			if (row?.project_config?.type === 'PHPMOD') return '--'
			let quotaFull = false
			const { quota } = row
			const isSetup = !quota?.size
			if (isSetup) {
				return (
					<span
						class="bt-link"
						onClick={() => {
							config.event(row, isSetup)
						}}>
						{'未配置'}
					</span>
				)
			}
			const size = quota.size * 1024 * 1024
			const percentage = Number(((quota.used / size) * 100).toFixed(2)) || 0
			const usedNum = quota.used / 1024 / 1024 > 0 ? (quota.used / 1024 / 1024).toFixed(2) : '0.00'
			if (quota.size > 0 && quota.used >= size) quotaFull = true
			if (quotaFull) {
				return (
					<span
						class="bt-link !text-danger"
						onClick={() => {
							config.event(row, isSetup)
						}}>
						{'容量已满'}
					</span>
				)
			}
			return (
				<span
					class={percentage > 80 ? 'el-link--danger bt-link' : 'el-link--primary bt-link'}
					onClick={() => {
						config.event(row, isSetup)
					}}>
					{usedNum} / {quota.size} MB
				</span>
			)
		},
	}
}

/**
 * @description 获取表格备份配置
 * @param { ConfigEventProps } config 设置事件
 * @returns {TableColumnProps} 表格配置
 */
export const useBackups = (config: ConfigEventProps): TableColumnProps => {
	return {
		label: '备份',
		prop: config.prop,
		minWidth: 180,
		isCustom: true,
		render: (row: any) => {
			return (
				<div class="flex items-center">
					<span class={row.backup_count > 0 ? 'text-primary cursor-pointer' : 'text-warning cursor-pointer'} onClick={() => (config.event ? config.event(row, 'back') : null)}>
						{row.backup_count > 0 ? `有备份(${row.backup_count})` : `点击备份`}
					</span>
					<span class="mx-[4px]">|</span>
					<span class="bt-link" onClick={() => (config.event ? config.event(row, 'import') : null)}>
						导入
					</span>
				</div>
			)
		},
	}
}

/**
 * @description 获取表格常用配置
 * @param { ConfigEventProps } config 设置事件
 * @returns
 */
export const useLink = (config: ConfigEventProps): TableColumnProps => {
	return {
		isCustom: true,
		...config,
		render: (row: any) => {
			return (
				<span class="bt-link" onClick={() => (config.event ? config.event(row) : null)} title={config.title}>
					{config.text}
				</span>
			)
		},
	}
}

/**
 * @description 获取操作表格配置
 * @param {ConfigProps} config 对象
 * @returns {TableColumnProps} 表格配置
 */
export const useOperate = (
	config: Array<any> | ((row: any) => Array<any>),
	columnObj?: {
		fixed?: boolean | 'left' | 'right'
		label?: string
		width?: number
	}
): TableColumnProps => {
	let width: number = 0
	if (!isFunction(config)) {
		width = config.reduce((accumulator, item) => accumulator + (item.width || 40), 0) + 20
	}
	return {
		label: columnObj?.label || '操作', // 操作
		align: 'right',
		fixed: columnObj && typeof columnObj.fixed === 'boolean' ? columnObj.fixed : 'right',
		width: columnObj?.width || width,
		render: (row: any, index: number) => {
			const vnode: Array<any> = []
			// 进入函数判断config是否为函数，如果是则执行函数内容
			let configData: any = config
			if (isFunction(config)) configData = config(row)
			// eslint-disable-next-line consistent-return
			configData.forEach((item: AnyObject, indexs: number) => {
				if (item.render) return vnode.push(item.render(row, index))
				if (item.isHide && item.isHide(row)) return false
				if (item.isMore) {
					// 过滤不显示的菜单选项
					const menu = item.menu.filter((items: any) => {
						if (typeof items.isHide === 'function') return !items.isHide(row)
						return !items.isHide
					})
					// 更多
					vnode.push(
						<ElDropdown class="h-[1.6rem]" onCommand={(key: string) => item.onClick(key, row)}>
							{{
								default: () => (
									<span class="text-primary flex items-center">
										更多
										<span class="svgtofont-el-arrow-down" />
									</span>
								),
								dropdown: () => (
									<ElDropdownMenu>
										{{
											default: () => menu.map((items: any) => <ElDropdownItem command={items.key}>{items.title}</ElDropdownItem>),
										}}
									</ElDropdownMenu>
								),
							}}
						</ElDropdown>
					)
					return false
				}
				const isHide = typeof item.isHide === 'function' ? item.isHide(row) : false
				vnode.push(
					<span onClick={e => item.onClick(row, index, e)} title={item.title} class={isHide ? 'hidden' : 'bt-link'}>
						{item.title}
					</span>
				)
				if (configData.length - 1 !== indexs) vnode.push(<BtDivider />)
			})
			return h('div', vnode)
		},
	}
}

/**
 * @description 获取表格备份配置
 * @param { ConfigEventProps } config 设置事件
 * @returns {TableColumnProps} 表格配置
 */

export const usePathSize = (config: { prop: string; width?: number | string }): TableColumnProps => {
	return {
		label: '大小',
		prop: config.prop,
		width: config.width || 80,
		render: (row: any): any => {
			return getByteUnit(Number(row[config.prop || 'size']), true)
		},
	}
}

/**
 * @description 获取批量状态配置
 * @param { ConfigEventProps } config 设置事件
 * @returns
 */
export const useBatchStatus = (): TableColumnProps => {
	return {
		label: '操作结果',
		prop: 'batchStatus',
		width: 124,
		showOverflowTooltip: true,
		render: (row: { batchStatus: number; message: string | undefined }) => {
			const htmlEntities: { [key: string]: string } = {
				'&amp;': '&',
				'&lt;': '<',
				'&gt;': '>',
				'&quot;': '"',
				'&#39;': "'",
				'&#x27;': "'",
			}
			const statusMsg = () => {
				switch (row.batchStatus) {
					case 0:
						return '等待执行'
					case 1:
						return '执行成功'
					case 2:
						return row?.message || row?.msg || '执行失败'
				}
				return '-'
			}

			const text = statusMsg().replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;/g, (match: string) => htmlEntities[match])
			return <div innerHTML={text} class={`inline-clock truncate !w-[10rem] ${!row.batchStatus ? 'text-warning' : row.batchStatus === 1 ? 'text-primary' : 'text-danger'}`}></div>
		},
	}
}

/**
 * @description 获取开关配置
 * @param { TableColumnSwitchProps } config 设置事件
 */
export const useSwitch = (config: TableColumnSwitchProps): TableColumnProps => {
	return {
		label: config.label || '状态',
		prop: config.prop || 'status',
		width: 80,
		render: (row: any) => {
			const prop = config.prop || 'status'
			return <BtSwitch v-model={row[prop]} onChange={(e: Event) => config.event(e, row)} size={config.size || 'small'} />
		},
	}
}
