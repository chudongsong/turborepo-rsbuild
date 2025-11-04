<template>
	<!-- 右键菜单选项 -->
	<v-contextmenu ref="contextmenu" style="z-index: 3100 !important">
		<!-- 单文件右键菜单 -->
		<div v-if="row?.fileName">
			<v-contextmenu-item v-if="row.type === 'dir'" @click="refresh(row, $event)"><span class="file-menu-icon refresh-icon"></span>刷新目录</v-contextmenu-item>
			<v-contextmenu-item v-if="row.type === 'dir'" @click="openFile(row, $event)"><span class="file-menu-icon open-folder-icon"></span>打开子目录</v-contextmenu-item>
			<v-contextmenu-item v-if="row.type === 'dir'" @click="create(row, 'dir', $event)"><span class="file-menu-icon folder-icon"></span>新建文件夹</v-contextmenu-item>
			<v-contextmenu-item v-if="row.type === 'dir'" @click="create(row, 'file', $event)"><span class="file-menu-icon file-icon"></span>新建文件</v-contextmenu-item>
			<v-contextmenu-item @click="reName(row, $event)"><span class="file-menu-icon rename-file-icon"></span>重命名</v-contextmenu-item>
			<v-contextmenu-item v-if="row.type !== 'dir'" @click="downFile(row)"> <span class="file-menu-icon download-file-icon"></span>下载</v-contextmenu-item>
			<v-contextmenu-item @click="delFile(row, $event)"><span class="file-menu-icon delete-file-icon"></span>删除</v-contextmenu-item>
		</div>
	</v-contextmenu>
</template>

<script setup lang="ts">
import type { FileDataProps } from '@files/types'

import { Contextmenu as VContextmenu, ContextmenuItem as VContextmenuItem, ContextmenuSubmenu as VContextmenuSubmenu } from 'v-contextmenu'

import 'v-contextmenu/dist/themes/default.css'

import { downFile, getDataType, calculateContextMenuPosition } from '@files/useMethods'
import { deleteFile, getRecyclingBin } from '@/api/files'
import { appendData, createFile, expandedKeys, contextRow, currentPath, treeRef, getFileDirList } from '@files/public/ace/sidebar/useMethods'
import { editorTabs, editorTabsActive } from '@files/public/ace/useMethods'
import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'
import { storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import FILES_ACE_STORE from '../../store'

const Message = useMessage()

interface ContextMenuProps {
	row: any
}
const { recyclingBinStatus } = storeToRefs(FILES_STORE())
const { originalPath } = storeToRefs(FILES_ACE_STORE())
const { changeTab } = FILES_ACE_STORE()
const props = withDefaults(defineProps<ContextMenuProps>(), {
	row: () => {},
})

const emits = defineEmits(['refreshData', 'appendData', 'handleExpandChange'])

const contextmenu = ref<any>() // 右键菜单

// 创建文件夹/文件
const create = (row: FileDataProps, type: 'dir' | 'file', e: any) => {
	e.preventDefault()
	const { newFile } = createFile(type)
	treeRef.value.getNode(row.path).expanded = true
	if (treeRef.value.getNode(row.path).expanded) {
		// emits('handleExpandChange', row)
		appendData(newFile, contextRow.value?.path, treeRef)
	}
}

// 重命名事件
const reName = (item: FileDataProps, e: any) => {
	e.preventDefault()
	const index = editorTabs.value.findIndex((tab: any) => tab.path === item.path)
	if (index !== -1) {
		Message.warn('该文件已打开，无法修改名称')
		return
	}
	item.isReName = true
}

/**
 * @description xss过滤文件名
 * @param fileName 文件名
 * @returns 过滤后的文件名
 */
const filterFileName = (fileName: string) => {
  // 创建一个临时的 DOM 元素
  const temp = document.createElement('div');
  temp.textContent = fileName;
  console.log(temp.innerHTML)
  return temp.innerHTML;
}

// 删除事件
const delFile = async (fileItem: FileDataProps, e: any) => {
	e.preventDefault()
	if (recyclingBinStatus.value === null) {
		await useDataHandle({
			request: getRecyclingBin({
				type: 'all',
				search: '',
				time_search: JSON.stringify([]),
			}),
			success: (res: any) => {
				recyclingBinStatus.value = res.data.status
			},
		})
	}
	const msg = recyclingBinStatus.value
		? `删除【${filterFileName(fileItem.fileName)}】${fileItem.type === 'file' ? '文件' : '文件夹'}后，该文件将迁移至文件回收站，如需彻底删除请前往文件回收站，是否继续操作？`
		: `风险操作，当前未开启文件回收站，删除的【${filterFileName(fileItem.fileName)}】${fileItem.type === 'file' ? '文件' : '文件夹'}将彻底删除，无法恢复，是否继续操作？`

	await useConfirm({
		title: `删除${getDataType(fileItem.type)}【${filterFileName(fileItem.fileName)}】`,
		type: recyclingBinStatus.value ? 'default' : 'calc',
		content: msg + (fileItem.isShare ? '<br/><span class="text-danger">当前文件已开启【外链分享】，请谨慎操作！</span>' : ''),
		isHtml: true,
	})
	await useDataHandle({
		loading: '正在删除，请稍后...',
		request: deleteFile({
			path: fileItem.path,
			type: fileItem.type,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) {
				// 如果是删除,删除已展开的节点
				expandedKeys.value = expandedKeys.value.filter((item: string) => item !== contextRow.value?.path)
				const findIndex = editorTabs.value.findIndex((tab: any) => tab.path === fileItem.path)

				// 右侧内容tab存在当前删除的文件时过滤
				editorTabs.value = editorTabs.value.filter((tab: any) => tab.path !== fileItem.path)

				// 如果删除的是当前打开的文件，切换上一个文件
				if (editorTabs.value.length && editorTabsActive.path === fileItem.path) {
					// findIndex 为0时，使用findIndex
					changeTab(editorTabs.value[findIndex ? findIndex - 1 : findIndex]?.id)
				}

				emits('refreshData')
			}
		},
	})
}

// 刷新目录
const refresh = async (item: FileDataProps, e: any) => {
	e.preventDefault()
	const node = treeRef.value.getNode(item.path)
	node.loading = true
	const data = await getFileDirList(item.path)
	treeRef.value.updateKeyChildren(item.path, data)
	node.loading = false
}

// 打开文件
const openFile = (item: FileDataProps, e: any) => {
	e.preventDefault()
	expandedKeys.value.length = 0
	if (currentPath.value === '') originalPath.value = item.path
	currentPath.value = item.path
	emits('refreshData')
}

/**
 * @description 显示菜单
 * @param e 传入鼠标事件
 */
const show = (e: any) => {
	contextmenu.value.visible = true
	nextTick(() => {
		calculateContextMenuPosition(e, contextmenu.value.contextmenuRef)
	})
}

/**
 * @description 隐藏菜单
 */
const hide = () => {
	contextmenu.value.visible = false
}

/**
 * @description 全局点击事件处理程序
 * @param e 传入鼠标事件
 */
const handleClickOutside = (e: MouseEvent) => {
	if (contextmenu.value && contextmenu.value.visible) {
		hide()
	}
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutside)
})

defineExpose({
	show,
	hide,
})
</script>

<style lang="css" scoped>
:deep(.v-contextmenu-item) {
	@apply flex items-center h-[3rem] w-[15rem];
}

:deep(.v-contextmenu-item--hover) {
	background-color: var(--el-fill-color-extra-light) !important;
	color: var(--el-base-secondary) !important;
}

.file-menu-icon {
	@apply inline-block w-[1.6rem] h-[1.6rem] mr-[1rem];
	background-image: url('/static/images/file_icon/file_menu_icon.png');
	background-size: auto !important;
	background-position: inherit;
	background-repeat: no-repeat;
}

.open-file-icon,
.open-find-dir-file-icon,
.edit-file-icon {
	background-position: -16px -16px;
}
.oss_download-file-icon,
.download-file-icon {
	background-position: -16px -48px;
}
.favorites-file-icon {
	background-position: -17px -773px;
}
.not-elf-icon {
	background-image: none !important;
}

.toping-icon,
.rsync-icon,
.log-icon,
.format-file-icon,
.email-icon,
.open-tab-icon,
.status-icon {
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
}

.toping-icon {
	background-image: url('/static/images/file_icon/topping.png');
}
.rsync-icon {
	background-image: url('/static/images/soft_ico/ico-rsync.png');
	background-size: contain !important;
}
.log-icon {
	background-image: url('/static/images/soft_ico/ico-file_real_time_log.png');
}
.copy-file-icon {
	background-position: 0 -96px;
}
.cut-file-icon {
	background-position: -16px -80px;
}
.rename-file-icon {
	background-position: 0 -64px;
}
.delete-file-icon {
	background-position: 0 -80px;
}
.compress-file-icon {
	background-position: -16px -32px;
}
.format-file-icon {
	background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYuMDAwMDAwIiBoZWlnaHQ9IjE1LjAwMDAwMCIgdmlld0JveD0iMCAwIDE2IDE1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KCTxkZXNjPgoJCQlDcmVhdGVkIHdpdGggUGl4c28uCgk8L2Rlc2M+Cgk8ZGVmcy8+Cgk8cGF0aCBpZD0icGF0aCIgZD0iTTIuMDI4ODEgMTQuOTkxNkMwLjkwNzIyNyAxNC45OTE2IDAgMTQuMDMxNCAwIDEyLjg2MDdMMCAxMC41MzYyQzAgOS4zNTcxIDAuOTA3MjI3IDguMzk2OTcgMi4wMjg4MSA4LjM5Njk3TDUuOTIxNjMgOC4zOTY5N0M3LjA0MzMzIDguMzk2OTcgNy45NTA1NiA5LjM1NzEgNy45NTA1NiAxMC41MzYyTDcuOTUwNTYgMTIuODYwN0M3Ljk1MDU2IDE0LjAzOTkgNy4wNDMzMyAxNSA1LjkyMTYzIDE1TDIuMDI4ODEgMTVMMi4wMjg4MSAxNC45OTE2Wk0yLjAyODgxIDkuNjQzNDZDMS41NjcwMiA5LjY0MzQ2IDEuMTg3NjIgMTAuMDM5MyAxLjE4NzYyIDEwLjUzNjJMMS4xODc2MiAxMi44NjA3QzEuMTg3NjIgMTMuMzQ5MiAxLjU2NzAyIDEzLjc1MzUgMi4wMjg4MSAxMy43NTM1TDUuOTEzNDUgMTMuNzUzNUM2LjM3NTI0IDEzLjc1MzUgNi43NTQ2NCAxMy4zNTc3IDYuNzU0NjQgMTIuODYwN0w2Ljc1NDY0IDEwLjUzNjJDNi43NTQ2NCAxMC4wNDc3IDYuMzc1MjQgOS42NDM0NiA1LjkxMzQ1IDkuNjQzNDZMMi4wMjg4MSA5LjY0MzQ2Wk05Ljg1NTcxIDE0LjcyMjFDOS41MzQwNiAxNC43MjIxIDkuMzUyNTQgMTQuNDYxIDkuMzQ0MzYgMTQuMjA4M0M5LjMzNjA2IDEzLjk2NDEgOS40NzYzMiAxMy42NjkzIDkuOTIxNjMgMTMuNjI3MkMxMC4zNDIzIDEzLjU1MTQgMTAuNjYzOSAxMy40ODQgMTEuMDUxNSAxMy4zNDkyTDExLjA2OCAxMy4zNDA4TDExLjA4NDYgMTMuMzQwOEMxMS4yMzMgMTMuMzQwOCAxMS43MzYxIDEyLjk3MDIgMTIuMTU2NyAxMi40NTY1TDEyLjE2NDkgMTIuNDM5NkwxMi4xODk3IDEyLjQyMjhMMTIuMTk4IDEyLjQyMjhDMTIuNDI4OCAxMi4zMDQ5IDEyLjgyNDcgMTEuNjIyNyAxMy4wMzA5IDEwLjgzOTRDMTMuMDM5MiAxMC43ODg5IDEzLjA0NzQgMTAuNzQ2OCAxMy4wNTU3IDEwLjcwNDdMMTMuMDY0IDEwLjY2MjZDMTMuMTEzNCAxMC4zODQ2IDEzLjE2MjggMTAuMTQwNCAxMy4xNjI4IDkuODU0MDJDMTMuMTYyOCA5LjgyMDMzIDEzLjE2MjggOS43Njk3OSAxMy4xNTQ3IDkuNjg1NThDMTMuMTQ2NCA5LjYzNTA0IDEzLjE0NjQgOS41OTI5MyAxMy4xNDY0IDkuNTQyMzlMMTIuNTQ0MyAxMC4yOTJDMTIuMzg3NiAxMC40Njg4IDEyLjIzOTEgMTAuNTAyNSAxMi4xNDAzIDEwLjUwMjVDMTIuMDc0MiAxMC41MDI1IDEyIDEwLjQ4NTcgMTEuOTM0IDEwLjQ1MkMxMS43NzczIDEwLjM2NzggMTEuNjg2NiAxMC4yNTgzIDExLjY1MzYgMTAuMTE1MUMxMS42MTI0IDkuOTI5ODEgMTEuNzExMyA5Ljc2MTM3IDExLjc1MjYgOS43MDI0MkwxMS43NjA5IDkuNjk0TDEzLjEyOTkgNy45NTkwMUMxMy4xNzkzIDcuOTA4NDggMTMuNDU5OCA3LjYzODk2IDEzLjc1NjcgNy42Mzg5NkMxNC4xNzc0IDcuNjM4OTYgMTQuNDA4MiA4LjAxNzk3IDE0LjQ2NTkgOC4xMTkwM0wxNS42OTQ4IDkuOTI5ODFDMTUuNjk0OCA5LjkyOTgxIDE1Ljg5MjggMTAuMjE2MiAxNS41NDY0IDEwLjU4NjdDMTUuNDMwOSAxMC43MDQ3IDE1LjI5OSAxMC43NzIgMTUuMTc1MyAxMC43NzJDMTUuMDE4NiAxMC43NzIgMTQuOTE5NiAxMC42Nzk0IDE0LjkwMzEgMTAuNjYyNkwxNC4yMTg1IDkuNzI3NjhMMTQuMjE4NSAxMC4wMDU2QzE0LjIxODUgMTEuMDA3OSAxMy44ODg3IDExLjk3NjQgMTMuMjM3MSAxMi44ODZDMTIuNTg1NiAxMy43MTk4IDExLjg0MzMgMTQuMjU4OSAxMC45NjkxIDE0LjU1MzZDMTAuOTM2IDE0LjU3MDUgMTAuODg2NiAxNC41ODczIDEwLjc1NDYgMTQuNjIxTDEwLjY4ODcgMTQuNjM3OEMxMC40OTA3IDE0LjY4ODQgMTAuMzA5MyAxNC43MjIxIDEwLjE1MjYgMTQuNzQ3M0w5Ljg1NTcxIDE0Ljc0NzNMOS44NTU3MSAxNC43MjIxWk0yLjQ5OTAyIDcuMjkzNjZDMi4wMzcxMSA3LjI5MzY2IDEuODA2MTUgNi44NTU3IDEuNzgxNDkgNi43OTY3NEwwLjYyNjgzMSA0LjkzNTQyQzAuNjI2ODMxIDQuOTM1NDIgMC40Mjg4MzMgNC42NDkwOCAwLjc3NTI2OSA0LjI4NjkxQzAuODk4OTI2IDQuMTY5MDEgMS4wMjI3MSA0LjEwMTYyIDEuMTQ2MzYgNC4xMDE2MkMxLjMwMzEgNC4xMDE2MiAxLjQwMjEgNC4xOTQyNyAxLjQxODU4IDQuMjExMTJMMi4xMDMxNSA1LjEzNzU2TDIuMTAzMTUgNS4xMTIzTDIuMTAzMTUgNS4wMTEyM0MyLjExMTMzIDQuNTkwMTIgMi4xNjA3NyA0LjE2OTAxIDIuMjQzMjkgMy43NjQ3NEMyLjQzMjk4IDIuOTY0NjMgMi44NzAxMiAyLjIxNTA0IDMuNTcxMTcgMS40NjU0N0M0LjI0NzQ0IDAuODI1Mzc4IDUuMDMwODggMC40MTI2ODkgNS44MjI2MyAwLjI3NzkzOUM2LjEwMzE1IDAuMjAyMTMzIDYuMzgzNTQgMC4yMDIxMzMgNi42NjM5NCAwLjIwMjEzM0M2LjgyMDY4IDAuMjAyMTMzIDYuOTExMzggMC40MjExMTIgNi45MTk1NiAwLjYzMTY2OEM2LjkzNjA0IDAuOTI2NDUzIDYuNzk1OSAxLjI1NDkxIDYuMzQyMjkgMS4zMDU0NUw2LjMwOTMzIDEuMzEzODdDNS45ODc2NyAxLjM4MTI0IDUuNjU3NzEgMS40NDg2MiA1LjM0NDM2IDEuNTgzMzdDNC43MjU4MyAxLjg0NDQ3IDQuMjU1NjIgMi4yNDAzMSAzLjgxODYgMi44NDY3MUwzLjc0NDM4IDIuOTU2MjFMMy43MTEzIDIuOTMwOTRDMy42MTI0MyAzLjA3NDExIDMuMzczMTcgMy41MjA0OSAzLjI0OTUxIDQuMTAxNjJMMy4yNDEyMSA0LjE1MjE2TDMuMjMzMDMgNC4xNzc0M0wzLjIzMzAzIDQuMTg1ODVDMy4yMjQ3MyA0LjIxOTU0IDMuMTUwNTEgNC41OTg1NCAzLjE1MDUxIDUuMDI4MDhMMy4xNTA1MSA1LjA5NTQ2QzMuMTUwNTEgNS4xNDU5OCAzLjE1ODgxIDUuMjA0OTQgMy4xNTg4MSA1LjI1NTQ4QzMuMTU4ODEgNS4yODA3NSAzLjE1ODgxIDUuMjk3NTkgMy4xNjY5OSA1LjMyMjg2TDMuNzExMyA0LjY0OTA4QzMuODY4MDQgNC40NzIyMSA0LjAxNjQ4IDQuNDM4NTIgNC4xMTU0OCA0LjQzODUyQzQuMTg5NyA0LjQzODUyIDQuMjU1NjIgNC40NTUzNyA0LjMyMTY2IDQuNDg5MDZDNC40NzgzOSA0LjU3MzI3IDQuNTY5MDkgNC42ODI3NyA0LjYwMjA1IDQuODE3NTJDNC42MjY4MyA0Ljk0Mzg1IDQuNTkzODcgNS4wOTU0NiA0LjUwMzA1IDUuMjMwMjFMNC41MDMwNSA1LjIzODYzTDMuMTM0MDMgNi45NjUxOUMzLjA3NjI5IDcuMDI0MTQgMi43OTU5IDcuMjkzNjYgMi40OTkwMiA3LjI5MzY2Wk0xMC4wODY1IDYuNTk0NkM4Ljk2NDk3IDYuNTk0NiA4LjA1Nzc0IDUuNjM0NDggOC4wNTc3NCA0LjQ1NTM3TDguMDU3NzQgMi4xMzkyNUM4LjA1Nzc0IDAuOTYwMTI5IDguOTY0OTcgMCAxMC4wODY1IDBMMTMuOTcxMiAwQzE1LjA5MjggMCAxNiAwLjk2MDEyOSAxNiAyLjEzOTI1TDE2IDQuNDYzNzlDMTYgNS42NDI5IDE1LjA5MjggNi42MDMwMyAxMy45NzEyIDYuNjAzMDNMMTAuMDg2NSA2LjYwMzAzTDEwLjA4NjUgNi41OTQ2Wk0xMC4wODY1IDEuMjQ2NDlDOS42MjQ3NiAxLjI0NjQ5IDkuMjQ1MzYgMS42NDIzMyA5LjI0NTM2IDIuMTM5MjVMOS4yNDUzNiA0LjQ2Mzc5QzkuMjQ1MzYgNC45NTIyNyA5LjYyNDc2IDUuMzU2NTQgMTAuMDg2NSA1LjM1NjU0TDEzLjk3MTIgNS4zNTY1NEMxNC40MzMgNS4zNTY1NCAxNC44MTI0IDQuOTYwNjkgMTQuODEyNCA0LjQ2Mzc5TDE0LjgxMjQgMi4xMzkyNUMxNC44MTI0IDEuNjUwNzYgMTQuNDMzIDEuMjQ2NDkgMTMuOTcxMiAxLjI0NjQ5TDEwLjA4NjUgMS4yNDY0OVoiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0iIzIwQTUzQSIvPgoJPHBhdGggaWQ9InBhdGgiIGQ9Ik0yLjAyODgxIDE0Ljk5MTZDMC45MDcyMjcgMTQuOTkxNiAwIDE0LjAzMTQgMCAxMi44NjA3TDAgMTAuNTM2MkMwIDkuMzU3MSAwLjkwNzIyNyA4LjM5Njk3IDIuMDI4ODEgOC4zOTY5N0w1LjkyMTYzIDguMzk2OTdDNy4wNDMzMyA4LjM5Njk3IDcuOTUwNTYgOS4zNTcxIDcuOTUwNTYgMTAuNTM2Mkw3Ljk1MDU2IDEyLjg2MDdDNy45NTA1NiAxNC4wMzk5IDcuMDQzMzMgMTUgNS45MjE2MyAxNUwyLjAyODgxIDE1TDIuMDI4ODEgMTQuOTkxNlpNMi4wMjg4MSA5LjY0MzQ2QzEuNTY3MDIgOS42NDM0NiAxLjE4NzYyIDEwLjAzOTMgMS4xODc2MiAxMC41MzYyTDEuMTg3NjIgMTIuODYwN0MxLjE4NzYyIDEzLjM0OTIgMS41NjcwMiAxMy43NTM1IDIuMDI4ODEgMTMuNzUzNUw1LjkxMzQ1IDEzLjc1MzVDNi4zNzUyNCAxMy43NTM1IDYuNzU0NjQgMTMuMzU3NyA2Ljc1NDY0IDEyLjg2MDdMNi43NTQ2NCAxMC41MzYyQzYuNzU0NjQgMTAuMDQ3NyA2LjM3NTI0IDkuNjQzNDYgNS45MTM0NSA5LjY0MzQ2TDIuMDI4ODEgOS42NDM0NlpNMTAuMDg2NSA2LjU5NDZDOC45NjQ5NyA2LjU5NDYgOC4wNTc3NCA1LjYzNDQ4IDguMDU3NzQgNC40NTUzN0w4LjA1Nzc0IDIuMTM5MjVDOC4wNTc3NCAwLjk2MDEyOSA4Ljk2NDk3IDAgMTAuMDg2NSAwTDEzLjk3MTIgMEMxNS4wOTI4IDAgMTYgMC45NjAxMjkgMTYgMi4xMzkyNUwxNiA0LjQ2Mzc5QzE2IDUuNjQyOSAxNS4wOTI4IDYuNjAzMDMgMTMuOTcxMiA2LjYwMzAzTDEwLjA4NjUgNi42MDMwM0wxMC4wODY1IDYuNTk0NlpNMTAuMDg2NSAxLjI0NjQ5QzkuNjI0NzYgMS4yNDY0OSA5LjI0NTM2IDEuNjQyMzMgOS4yNDUzNiAyLjEzOTI1TDkuMjQ1MzYgNC40NjM3OUM5LjI0NTM2IDQuOTUyMjcgOS42MjQ3NiA1LjM1NjU0IDEwLjA4NjUgNS4zNTY1NEwxMy45NzEyIDUuMzU2NTRDMTQuNDMzIDUuMzU2NTQgMTQuODEyNCA0Ljk2MDY5IDE0LjgxMjQgNC40NjM3OUwxNC44MTI0IDIuMTM5MjVDMTQuODEyNCAxLjY1MDc2IDE0LjQzMyAxLjI0NjQ5IDEzLjk3MTIgMS4yNDY0OUwxMC4wODY1IDEuMjQ2NDlaIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+Cg==');
}
.decompress-file-icon {
	background-position: -0px -32px;
}
.create-copy-icon {
	background-position: -0px -96px;
}
.email-icon {
	background-image: url('/static/images/file_icon/send_mail.png');
}
.refresh-icon {
	background-position: -16px -513px;
}
.open-tab-icon {
	/* background-image: url('/static/icons/file/tabs.svg'); */
}
.status-icon {
	background-image: url('/static/images/file_icon/property.png');
}
.folder-icon {
	background-position: -0px -16px;
}
.file-icon {
	background-image: url('/static/images/file_icon/file_text2.png');
	height: 17px;
}
</style>
