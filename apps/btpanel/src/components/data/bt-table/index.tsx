/*
 * @Descripttion: 表格
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElEmpty, ElTable, ElTableColumn } from 'element-plus'
import 'element-plus/theme-chalk/src/table.scss'
import 'element-plus/theme-chalk/src/empty.scss'

import { isBoolean, isFunction, isString } from '@/utils'
import { useMessage } from '@/hooks/tools'
import { TableColumnProps } from './types'

const { msg: $msg } = useMessage()

export default defineComponent({
	name: 'BtTable',
	props: {
		column: {
			type: Array as PropType<TableColumnProps[]>,
			default: [],
		},
		description: {
			type: String,
			default: '暂无数据',
		},
		refreshTime: {
			type: Number,
			default: 0,
		},
		total: {
			type: Number,
			default: 0,
		},
		data: {
			type: Array as PropType<AnyObject[]>,
			default: () => [],
		},
	},
	emits: ['selectionChange', 'sortChange'],
	setup(props, { attrs, slots, expose, emit }) {
		const tableRef = ref()
		const hasEmpty = useSlots().empty
		const keysId = ref('id')

		const checkAllCheckbox = ref(false) // 全选
		const checkAllPageChcekbox = ref(false) // 分页全选
		const checkAllIndeterminate = ref(false) // 全选中间态

		const excludeList = ref<any[]>([]) // 选中数据，如果是分页全选，则为过滤模式,排除为选中的
		const tableSelectList = ref<AnyObject[]>([]) // 选中数据
		const tableLimit = computed(() => props.data.length) // 数据长度
		const tableSelectNumber = computed(() => tableSelectList.value.length) // 选中数量

		// TODO:此处data必须使用ref数据，否则无法驱动视图更新
		const tableData = toRef(props, 'data')

		const isIdExist = (list: AnyObject[], id: number): boolean => {
			return list.some(item => item[keysId.value] === id)
		}
		const total = computed(() => props.total || props.data.length)

		// 表格选中数据
		const data = computed(() => {
			return tableData.value.map((item: AnyObject) => {
				let isStatus = false
				// 全选状态
				if (checkAllCheckbox.value) isStatus = true
				// 单选状态
				if (checkAllPageChcekbox.value) {
					isStatus = !isIdExist(excludeList.value, item[keysId.value])
				} else {
					isStatus = isIdExist(tableSelectList.value, item[keysId.value])
				}
				// eslint-disable-next-line @typescript-eslint/naming-convention
				if (!isString(item)) item.keys_scopes_status = isStatus
				return item
			})
			// return tableData.value
		})

		watch(
			() => props.refreshTime,
			(val: number) => {
				if (checkAllPageChcekbox.value) {
					const index = data.value.findIndex((item: AnyObject) => {
						return isIdExist(excludeList.value, item[keysId.value])
					})
					if (index === -1) {
						checkAllCheckbox.value = true
						checkAllIndeterminate.value = false
					} else {
						checkAllCheckbox.value = false
						checkAllIndeterminate.value = true
					}
					// 多页选择模式下添加配置
					tableSelectList.value = data.value.filter((item: AnyObject) => (item as AnyObject).keys_scopes_status)
				} else {
					excludeList.value = []
					tableSelectList.value = []
					checkAllCheckbox.value = false
					checkAllIndeterminate.value = false
				}
			}
		)

		/**
		 * @description 是否隐藏行
		 * @param {TableColumnProps} item 表格列
		 * @returns
		 */
		const isHideTr = (item: TableColumnProps) => {
			let isHides = true
			let isCustoms = true
			isHides = isFunction(item.isHide) ? item.isHide() : isBoolean(item.isHide) ? !item.isHide : true
			isCustoms = isBoolean(item.isCustom) ? item.isCustom : !item.isCustom
			return isHides && isCustoms
		}

		/**
		 * @description 排序改变
		 * @param {AnyObject} param 排序参数
		 */
		const sortChange = ({ column, prop, order }: AnyObject) => {
			emit('sortChange', { column, prop, order })
		}

		/**
		 * @description 全选
		 */
		const handleAllChange = (value: boolean, isCustom: boolean, key: string = 'id') => {
			keysId.value = key // 设置keysId
			checkAllCheckbox.value = value // 全选
			checkAllPageChcekbox.value = isCustom // 分页全选
			checkAllIndeterminate.value = false
			tableSelectList.value = value ? [...data.value.filter((item: any) => !item.disable_check)] : []
			if (checkAllPageChcekbox.value) excludeList.value = [] // 清空过滤数据
			emit('selectionChange', tableSelectList.value)
		}

		/**
		 * @description 单选
		 */
		const handleScopeChange = (value: AnyObject, row: any, index: number, key: string) => {
			keysId.value = key // 设置keysId
			// 选项为空时，全选中间态为false
			if (!tableSelectList.value.length) checkAllIndeterminate.value = false
			// 选中数据
			if (value) {
				tableSelectList.value.push(row) // 添加选中数据
			} else {
				// 删除选中数据
				tableSelectList.value.forEach((item, i) => {
					if (item[keysId.value] === row[keysId.value]) {
						tableSelectList.value.splice(i, 1)
						return false
					}
				})
			}

			// 选中标识
			if (checkAllPageChcekbox.value) {
				if (value) {
					excludeList.value.forEach((item, i) => {
						if (item[keysId.value] === row[keysId.value]) {
							excludeList.value.splice(i, 1)
							return false
						}
					})
				} else {
					excludeList.value.push(row) // 添加选中数据(过滤模式)
				}
			}

			const dataLength = data.value.filter((item: any) => !item.disable_check).length

			// 全选标识变化(选中值和原数据)
			if (tableSelectList.value.length === dataLength) {
				console.log('全选')
				checkAllCheckbox.value = true
				checkAllIndeterminate.value = false
			} else {
				console.log('不全选')
				checkAllCheckbox.value = false
				checkAllIndeterminate.value = true
			}

			if (tableSelectList.value.length === 0) {
				checkAllCheckbox.value = false
				checkAllIndeterminate.value = false
			}
			emit('selectionChange', tableSelectList.value)
		}

		/**
		 * @description 分页全选配置
		 * @param {AnyObject} value 选中数据
		 */
		const handleCommandChange = (value: any) => {
			switch (value) {
				case 'page-select':
					handleAllChange(true, false)
					$msg({ message: '已选中当前页面数据', type: 'success' })
					break
				case 'all-select':
					handleAllChange(true, true)
					$msg({ message: '已选中列表所有数据，支持分页切换选择或排除数据。', type: 'success', time: 5000 })
					break
				case 'clear-select':
					handleAllChange(false, false)
					break
			}
		}

		expose({
			tableSelectNumber,
			tableSelectList,
			tableLimit,
			tableTotal: total,
			tablePageSelect: checkAllPageChcekbox,
			tablePageExclude: excludeList,
			getTableSelect: () => ({
				tableSelectNumber,
				tableSelectList,
				tableLimit,
				tableTotal: total,
				tablePageSelect: checkAllPageChcekbox,
				tablePageExclude: excludeList,
			}),
			getTable: () => tableRef.value,
			handleAllChange: (isCheckbox: boolean) => handleAllChange(isCheckbox, false),
			clearAllSelect: () => handleAllChange(false, false),
		})
		return () => (
			<ElTable class="w-full" ref={tableRef} {...attrs} border={false} data={data.value} onSortChange={sortChange}>
				{{
					default: () => {
						return props.column.map((item: TableColumnProps, index: number) => {
							if (isHideTr(item)) {
								const { renderHeader } = item
								if (renderHeader) item.headerRender = renderHeader
								delete item.renderHeader
								return (
									<ElTableColumn {...item} key={index}>
										{{
											header: (scope: any) => {
												if (item.headerRender) {
													return item.headerRender(scope, { checkAllCheckbox, checkAllIndeterminate, handleCommandChange, handleAllChange, handleScopeChange })
												}
												if (item.isLtd) {
													return (
														<div class="flex items-center">
															<span>{item.label}</span>
															<i class="svgtofont-icon-ltd text-medium mr-[4px] text-ltd"></i>
														</div>
													)
												}
												return <div>{item.label}</div>
											},
											default: (scope: AnyObject) => {
												if (item.render) return item.render(scope.row, scope.$index, { checkAllCheckbox, checkAllIndeterminate, handleCommandChange, handleAllChange, handleScopeChange })
												return scope.row[item.prop as string]
											},
										}}
									</ElTableColumn>
								)
							}
						})
					},
					empty: () =>
						hasEmpty ? (
							slots?.empty && slots?.empty()
						) : (
							<ElEmpty image-size={50}>
								{{
									description: () => props.description,
								}}
							</ElEmpty>
						),
				}}
			</ElTable>
		)
	},
})
