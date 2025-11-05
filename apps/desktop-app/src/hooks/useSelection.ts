/**
 * useSelection (Desktop-specific)
 * 桌面图标选择管理 Hook（基于通用版本封装）
 * - 支持单选/多选（cmd/ctrl 切换）
 * - 记录拖拽开始时是否按住追加选择键
 * - 提供桌面图标特定的事件处理器
 */
import { useRef } from 'react'
import { useSelection } from '@linglongos/hooks'

/**
 * 桌面图标选择管理 Hook。
 *
 * 基于 @linglongos/hooks 的通用 useSelection 封装，专门用于桌面图标的选择场景。
 * 支持单选与多选（cmd/ctrl），并在点击、按下与拖拽开始时更新选中集合。
 *
 * @returns 桌面选择状态与事件处理函数
 */
export function useDesktopSelection() {
	const uiSelection = useSelection<string>()

	/**
	 * 桌面图标点击：支持 cmd/ctrl 追加或切换选择
	 */
	function handleIconClick(e: React.MouseEvent, id: string) {
		e.stopPropagation()
		uiSelection.handleClick(e, id)
	}

	/**
	 * 记录图标按下时是否按住多选相关修饰键（用于拖拽开始判定）
	 */
	function handleIconMouseDown(e: React.MouseEvent) {
		uiSelection.handleMouseDown(e)
	}

	/**
	 * 拖拽开始：如未选中则选中，被记录为多选则仅追加
	 */
	function handleDragStartSelect(id: string) {
		if (uiSelection.isSelected(id)) return
		if (uiSelection.dragMultiKeyRef.current) {
			uiSelection.toggleSelect(id)
		} else {
			uiSelection.selectOnly(id)
		}
	}

	return {
		selected: uiSelection.selected,
		setSelected: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => {
			if (typeof ids === 'function') {
				uiSelection.selected = ids(uiSelection.selected)
			} else {
				uiSelection.selected = ids
			}
		},
		suppressNextClickClearRef: uiSelection.suppressNextClickClearRef,
		dragMultiKeyRef: uiSelection.dragMultiKeyRef,
		handleIconClick,
		handleIconMouseDown,
		handleDragStartSelect,
	}
}
