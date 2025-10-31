import type { TableColumnProps } from '@/components/data/BtTable'

// 表格批量操作，执行下一步的选项
export type TableBatchNextAllProps = Curry<(fn: AnyFunction<any>, cofirm: AnyObject) => TableBatchNextAllProps>

// 表格批量操作，弹窗的选项
export type TableBatchDialogProps = (confirm: TableBatchConfirmProps) => Promise<App>

// 表格批量操作，批量多页操作的选项
export type TableBatchPageSelectProps = { enable: Ref<boolean>; exclude: Ref<AnyObject[]>; total: Ref<number> }

// 表格批量操作，事件的选项
export type TableBatchEventProps = (batchOptions: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<T[]>, options: TableBatchOptionsProps, clearSelection?: AnyFunction, tablePageSelect?: TableBatchPageSelectProps) => void

// 表格批量操作，表格进度显示
export type TableBatchExecution = {
	all: number
	current: number
	success: number
	error: number
}

// 表格批量操作，弹窗确认的选项
export type TableBatchConfirmProps = {
	title?: string
	content: string
	column: TableColumnProps[]
	data?: AnyObject[]
	onConfirm?: (instance: App<Element>, data?: Ref<AnyObject[]>) => Promise<void | boolean>
}

// 表格批量操作，批量操作的选项
export interface TableBatchOptionsProps {
	label: string
	value: string
	event: TableBatchEventProps
}

// 批量默认选项
interface BatchDefaultProps {
	column: TableColumnProps[] // 表格列
	data: Ref<AnyObject[]> // 表格数据
	batch: () => AnyObject // 批量操作
}

// 批量执行选项
interface BatchDefaultProps extends BatchExecuteProps {
	type: 'execute'
	content: string // 内容
	complete: () => void // 完成回调
}

// 批量完成选项
interface BatchDefaultProps extends BatchCompleteProps {
	type: 'complete'
	column: TableColumnProps[] // 表格列
	data: Ref<AnyObject[]> // 表格数据
}
