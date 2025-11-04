/**
 * useSelection
 * 通用的选择管理 Hook，支持单选/多选。
 */
import { useRef, useState } from 'react'

export type SelectionChangeHandler<T> = (id: T, selected: boolean) => void

/**
 * 通用选择管理 Hook。
 *
 * 管理选中状态，支持单选与多选（cmd/ctrl/shift），提供事件处理函数。
 *
 * @param options 配置选项
 * @param options.multiSelect 是否支持多选（默认true）
 * @param options.onSelectionChange 选择变化回调
 * @returns 选择状态与事件处理函数
 */
export function useSelection<T extends string | number>(options?: {
	multiSelect?: boolean
	onSelectionChange?: (selected: Set<T>) => void
}) {
	const { multiSelect = true, onSelectionChange } = options ?? {}
	const [selected, setSelected] = useState<Set<T>>(new Set())
	const suppressNextClickClearRef = useRef<boolean>(false)
	const dragMultiKeyRef = useRef<boolean>(false)

	/**
	 * 选择/取消选择单个项目
	 */
	function toggleSelect(id: T) {
		setSelected((prev) => {
			const next = new Set(prev)
			if (next.has(id)) {
				next.delete(id)
			} else {
				next.add(id)
			}
			onSelectionChange?.(next)
			return next
		})
	}

	/**
	 * 清除所有选择
	 */
	function clearSelection() {
		setSelected((prev) => {
			const next = new Set<T>()
			if (next.size !== prev.size) {
				onSelectionChange?.(next)
			}
			return next
		})
	}

	/**
	 * 设置选中特定项目（替换当前选择）
	 */
	function selectOnly(id: T) {
		setSelected((prev) => {
			const next = new Set<T>([id])
			onSelectionChange?.(next)
			return next
		})
	}

	/**
	 * 处理点击事件，支持单选/多选
	 */
	function handleClick(e: React.MouseEvent, id: T) {
		e.stopPropagation()
		const additive = e.metaKey || e.ctrlKey || e.shiftKey

		if (additive && multiSelect) {
			toggleSelect(id)
		} else {
			selectOnly(id)
		}
	}

	/**
	 * 记录是否按住修饰键（用于拖拽判断）
	 */
	function handleMouseDown(e: React.MouseEvent) {
		dragMultiKeyRef.current = !!(e.metaKey || e.ctrlKey || e.shiftKey)
	}

	/**
	 * 判断是否已选择
	 */
	function isSelected(id: T): boolean {
		return selected.has(id)
	}

	/**
	 * 获取当前选择数量
	 */
	function getSelectedCount(): number {
		return selected.size
	}

	/**
	 * 获取选中的项目列表
	 */
	function getSelectedItems(): T[] {
		return Array.from(selected)
	}

	return {
		selected,
		suppressNextClickClearRef,
		dragMultiKeyRef,
		handleClick,
		handleMouseDown,
		toggleSelect,
		clearSelection,
		selectOnly,
		isSelected,
		getSelectedCount,
		getSelectedItems,
	}
}
