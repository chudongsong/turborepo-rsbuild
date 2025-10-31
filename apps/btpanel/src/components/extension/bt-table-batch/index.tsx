import type { TableBatchConfirmProps, TableBatchExecution, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import type { App } from 'vue'

import { useDialog } from '@/hooks/tools'
import { isNumber } from '@/utils'
import { ElButton, ElCheckbox, ElPopover } from 'element-plus'
import { curry, has, isNotNil } from 'ramda'

import BatchConfirm from '@/components/extension/bt-table-batch-confirm/index.vue'
import BtSelect from '@/components/form/bt-select'

interface TableRefProps {
	getTable: () => void // 获取表格实例
	toggleAllSelection: () => void // 全选
	tablePageSelect: Ref<boolean> // 表格选中数量
	tablePageExclude: Ref<any> // 表格选中数量
	tableTotal: Ref<number> // 表格选中数量
	// 获取表格选中数据
	getTableSelect: () => {
		tableSelectNumber: Ref<number>
		tableSelectList: Ref<AnyObject[]>
		tablePageSelect: Ref<boolean> // 表格选中数量
		tablePageExclude: Ref<any> // 表格选中数量
		tableLimit: number
		tableTotal: Ref<number> // 表格选中数量
	}
	handleAllChange: (isCheckbox: boolean) => void // 全选
	clearAllSelect: () => void // 清空选择
}

export default defineComponent({
	name: 'BtTableBatch',
	props: {
		tableRef: {
			type: Object as () => TableRefProps | null,
			default: null,
		},
		options: {
			type: Array as () => TableBatchOptionsProps[],
			default: () => [],
		},
	},
	setup(props) {
		const batchDisabled = ref(true) // 批量操作数据
		const checkboxRef = ref() // 选择框实例
		const selectRef = ref() // 选择框实例
		const tableExpose = ref(props.tableRef) as unknown as Ref<TableRefProps> // 表格实例
		const tableRefs = ref()
		const tableSelectNumber = ref(0) // 表格选中数量
		const tableSelectList = ref<AnyObject[]>([]) // 表格选中数据
		// 批量执行处理
		const batchExecution = reactive<TableBatchExecution>({
			all: 0,
			current: 0,
			success: 0,
			error: 0,
		})
		// 选择框状态
		const checkbox = reactive({
			visible: false,
			value: false,
			indeterminate: false,
		})
		// 下拉框选择类型
		const select = reactive({
			list: [],
			visible: false,
			value: '',
		})

		watch(
			() => props.tableRef,
			val => {
				if (!isNotNil(val)) return
				tableExpose.value = val
				tableRefs.value = tableExpose.value.getTable()
				monitorTableSelect() // 监听表格选中数据
			}
		)

		/**
		 * @description 点击批量操作
		 */
		const clickBatchEvent = () => {
			togglePopover(checkbox, batchDisabled.value)
		}

		/**
		 * @description 选择框改变事件
		 * @param {string | number | boolean} val 选择框值
		 */
		const checkboxChangeEvent = (val: string | number | boolean) => {
			if (!val) select.value = ''
			tableExpose?.value.handleAllChange(val as boolean)
		}

		/**
		 * @description 批量操作事件
		 */
		const handleBatchEvent = () => {
			if (!select.value) togglePopover(select, true)
			props.options.forEach((item: TableBatchOptionsProps) => {
				if (item.value === select.value) {
					const curryBatchConfirm = curry(showBatchConfirm) // 科里化显示批量操作确认弹窗
					const curryRecursive = curry(recursiveOperation) // 科里化递归操作
					// 弱拷贝 表格选中数据
					const selectList = ref( JSON.parse(JSON.stringify(tableSelectList.value)) )
					selectList.value.map((item: AnyObject) => {
						item.batchStatus = 0
						return item
					})
					const { tablePageSelect, tablePageExclude, tableTotal } = tableExpose.value
					item.event(curryBatchConfirm(selectList), curryRecursive(selectList), selectList, item, clearSelection, { enable: tablePageSelect, exclude: tablePageExclude, total: tableTotal })
					return false
				}
			})
		}

		/**
		 * @description 清空选择
		 */
		const clearSelection = () => {
			tableExpose?.value.clearAllSelect()
			select.value = ''
		}

		// 显示弹窗
		const togglePopover = (ref: AnyObject, val: boolean): void => {
			ref.visible = val
			setTimeout(() => {
				ref.visible = false
			}, 1500)
		}

		// 递归操作
		const recursiveOperation = async (data: Ref<AnyObject[]>, fn: AnyFunction): Promise<boolean | AnyObject[]> => {
			batchExecution.all = tableSelectList.value.length
			const result: AnyObject[] = []
			const recursionFn = async (items: Ref<AnyObject[]>, fn: AnyFunction, index = 0) => {
				batchExecution.current = index
				if (isNumber(index)) {
					if (index < items.value.length) {
						try {
							const rdata: { msg: string; status: boolean; code: number } = await fn(items.value[index]) // 执行操作，返回结果
							if (has('code', rdata) && has('data', rdata)) {
								items.value[index] = {
									...items.value[index],
									batchStatus: rdata.status ? 1 : 2,
									msg: rdata.msg,
								} // 执行成功
							} else {
								items.value[index] = rdata
							}
							if (items.value[index].batchStatus === 1) batchExecution.success++
							if (items.value[index].batchStatus === 2) batchExecution.error++
						} catch (error) {
							items.value[index] = { ...items.value[index], batchStatus: 2 }
							batchExecution.error++
						}
						await recursionFn(items, fn, index + 1)
					}
				}
			}
			await recursionFn(data, fn as AnyFunction)
			return result
		}

		/**
		 * @description 显示批量操作确认弹窗
		 * @param {Ref<AnyObject[]>} data 表格选中数据
		 * @param {TableBatchConfirmProps} props 批量操作参数
		 * @returns
		 */
		const showBatchConfirm = async (data: Ref<AnyObject[]>, { title, content, column, onConfirm }: TableBatchConfirmProps): Promise<App> => {
			const { tablePageSelect, tablePageExclude, tableTotal } = tableExpose.value
			return useDialog({
				title,
				area: 45,
				component: BatchConfirm,
				compData: {
					title,
					content,
					column,
					data,
					tablePageSelect,
					tablePageExclude,
					tableTotal,
					batch: () => batchExecution,
					complete: () => {
						tableExpose?.value.clearAllSelect()
						select.value = ''
					},
				},
				showFooter: true,
				onConfirm: async (instance: App<Element>) => {
					instance.clearSelection = () => clearSelection()
					return onConfirm && onConfirm(instance, data)
				},
				onCancel: () => {
					batchExecution.all = 0
					batchExecution.current = 0
					batchExecution.success = 0
					batchExecution.error = 0
				},
			})
		}

		/**
		 * @description 监听表格选中数据
		 */
		const monitorTableSelect = () => {
			nextTick(() => {
				if (!isNotNil(tableRefs?.value)) return
				const { tableSelectNumber: selectNumber, tableSelectList: selectList, tableLimit, tablePageSelect, tablePageExclude } = tableExpose.value.getTableSelect()
				if (selectNumber.value === 0) batchDisabled.value = true
				watch(selectNumber, (val: number) => {
					batchDisabled.value = !(val > 0) // 批量禁用
					if (val !== 0) tableSelectList.value = [...unref(selectList)] // 表格选中数据
					tableSelectNumber.value = val // 表格选中数量
					checkbox.indeterminate = val > 0 && val < unref(tableLimit) // 半选状态
					checkbox.value = val > 0 && val === unref(tableLimit) // 选择框状态
				})
			})
		}

		return () => (
			<div class="flex items-center pl-[1px]">
				<ElPopover visible={checkbox.visible} popper-class="popper-danger" placement="top-start" width="185" auto-close={2000} content="请选择需要批量操作的数据!">
					{{
						reference: () => <ElCheckbox ref={checkboxRef} v-model={checkbox.value} indeterminate={checkbox.indeterminate} class="px-[8px]" onChange={checkboxChangeEvent} />,
					}}
				</ElPopover>
				<div class="flex relative items-center">
					<div class={`w-full h-[3rem] absolute z-99 ${!batchDisabled.value ? 'hidden' : ''}`} onClick={clickBatchEvent}></div>
					<ElPopover visible={select.visible} popper-class="popper-danger" placement="top-start" width="185" content="请选择需要批量操作的类型!">
						{{
							reference: () => (
								<div class="flex items-center">
									<BtSelect ref={selectRef} v-model={select.value} disabled={batchDisabled.value} options={props.options} class="mr-2 !w-[150px]" placeholder="请选择批量操作" />
								</div>
							),
						}}
					</ElPopover>
					<ElButton disabled={batchDisabled.value} class="h-[30px]" type="primary" onClick={handleBatchEvent}>
						批量操作 {!batchDisabled.value ? `(已选中${tableExpose.value.tablePageSelect ? Number(tableExpose.value.tableTotal) - Number(tableExpose.value.tablePageExclude?.length) : tableSelectNumber.value}项)` : ''}
					</ElButton>
				</div>
			</div>
		)
	},
})
