<template>
	<!-- 右键菜单选项 -->
	<v-contextmenu ref="contextmenu">
		<!-- 单文件右键菜单 -->
		<div v-if="!Array.isArray(row) && row?.fileName && !isBatch">
			<v-contextmenu-item v-if="showOpen || showUnzip" @click="openEvent(row, openBtnText, showUnzip)">
				<span class="file-menu-icon open-file-icon"></span>
				{{ openBtnText }}</v-contextmenu-item
			>
			<v-contextmenu-item v-if="row.type === 'dir'" @click="addTabEvent(row)"> <span class="file-menu-icon open-tab-icon"></span>在新窗口打开</v-contextmenu-item>
			<v-contextmenu-item v-if="row.ext === 'sql'" @click="FileInputDatabaseView(row)"><span class="file-menu-icon"></span>导入数据库</v-contextmenu-item>
			<div class="right-menu-divider" v-if="showOpen || showUnzip"></div>
			<!-- <v-contextmenu-item>编辑（code-server）</v-contextmenu-item> -->
			<v-contextmenu-item v-if="row.type !== 'dir'" @click="downFile(row)"> <span class="file-menu-icon download-file-icon"></span>下载</v-contextmenu-item>
			<v-contextmenu-item v-if="row.type !== 'dir' && row.ext !== 'bt_split' && row.ext !== 'bt_split_json'" @click="openFileSplit(row)"><span class="file-menu-icon"></span>文件拆分</v-contextmenu-item>
			<v-contextmenu-item v-if="row.type !== 'dir' && row.ext === 'bt_split_json'" @click="openFileMerge(row)"><span class="file-menu-icon"></span>文件合并</v-contextmenu-item>
			<v-contextmenu-item @click="collection"><span class="file-menu-icon favorites-file-icon"></span>{{ favBtnText }}</v-contextmenu-item>
			<v-contextmenu-item @click="share"><span class="file-menu-icon not-elf-icon svgtofont-el-share text-successDark font-bold !text-medium"></span>{{ shareBtnText }}</v-contextmenu-item>
			<!-- 当不是企业版时，隐藏部分功能（置顶目录/文件、创建副本、发送至邮箱） -->
			<v-contextmenu-item v-if="authType === 'ltd'" @click="toping"><span class="file-menu-icon toping-icon"></span>{{ topBtnText }}</v-contextmenu-item>
			<v-contextmenu-item v-if="showAsync" @click="openFileAsync(row)"><span class="file-menu-icon rsync-icon"></span>文件同步</v-contextmenu-item>
			<v-contextmenu-item v-if="row.ext === 'log'" @click="openLogAnalyze(row)"><span class="file-menu-icon"></span>监听日志</v-contextmenu-item>
			<div class="right-menu-divider"></div>
			<v-contextmenu-item v-if="row.type === 'dir'" @click="openTrojanScan(row)"><i class="file-menu-icon svgtofont-icon-bug-scan not-elf-icon svgtofont-el-orange text-warning !text-medium"></i>木马扫描</v-contextmenu-item>
			<VContextmenuSubmenu v-if="row.type !== 'dir' && enterpriseRec">
				<template #title>
					<span> <span class="file-menu-icon upload-file-icon"></span><span class="align-text-top">上传到云存储</span> </span>
				</template>
				<v-contextmenu-item @click="openCloud('bos', 'upload')">
					<div class="flex items-center w-full">
						<div class="flex items-center"><span class="file-menu-icon baidu-icon"></span>百度云存储</div>
						<i class="svgtofont-icon-ltd ml-4px text-ltd !text-large"></i>
					</div>
				</v-contextmenu-item>
				<v-contextmenu-item @click="openCloud('alioss', 'upload')">
					<div class="flex items-center w-full">
						<div class="flex items-center"><span class="file-menu-icon ali-icon"></span>阿里云存储</div>
						<i class="svgtofont-icon-ltd ml-4px text-ltd !text-large"></i>
					</div>
				</v-contextmenu-item>
				<v-contextmenu-item @click="openCloud('txcos', 'upload')">
					<div class="flex items-center w-full">
						<div class="flex items-center"><span class="file-menu-icon txcos-icon"></span>腾讯云存储</div>
						<i class="svgtofont-icon-ltd ml-4px text-ltd !text-large"></i>
					</div>
				</v-contextmenu-item>
				<v-contextmenu-item @click="openCloud('obs', 'upload')">
					<div class="flex items-center w-full">
						<div class="flex items-center"><span class="file-menu-icon huawei-icon"></span>华为云存储</div>
						<i class="svgtofont-icon-ltd ml-4px text-ltd !text-large"></i>
					</div>
				</v-contextmenu-item>
			</VContextmenuSubmenu>
			<v-contextmenu-item @click="openDetail(row, 'auth')"><span class="file-menu-icon authority-icon"></span>权限</v-contextmenu-item>
			<div class="right-menu-divider"></div>
			<v-contextmenu-item @click="copyFiles(row, 'copy')"><span class="file-menu-icon copy-file-icon"></span>复制</v-contextmenu-item>
			<v-contextmenu-item @click="copyFiles(row, 'cut')"><span class="file-menu-icon cut-file-icon"></span>剪切</v-contextmenu-item>
			<v-contextmenu-item v-show="copyFilesData.files.length !== 0" @click="pasteFiles"><span class="file-menu-icon paste-icon"></span>粘贴</v-contextmenu-item>
			<v-contextmenu-item @click="handleReName(row)"><span class="file-menu-icon rename-file-icon"></span>重命名</v-contextmenu-item>
			<v-contextmenu-item @click="delFileEvent(row)"><span class="file-menu-icon delete-file-icon"></span>删除</v-contextmenu-item>
			<div class="right-menu-divider"></div>
			<v-contextmenu-item @click="createCompress(row)"><span class="file-menu-icon compress-file-icon"></span>创建压缩</v-contextmenu-item>
			<v-contextmenu-item v-if="row.type !== 'dir' && isformatType" @click="formatFile(row)"><span class="file-menu-icon format-file-icon"></span>格式转换</v-contextmenu-item>
			<v-contextmenu-item v-if="showUnzip" @click="deCompressFile(row)"><span class="file-menu-icon decompress-file-icon"></span>解压</v-contextmenu-item>
			<v-contextmenu-item v-if="authType === 'ltd'" @click="createCopy(row)"><span class="file-menu-icon create-copy-icon"></span>创建副本</v-contextmenu-item>
			<!-- <v-contextmenu-item v-if="showOpenDir" @click="pathJumpEvent(row.path)"
				><span class="file-menu-icon open-file-icon"></span>打开所在目录</v-contextmenu-item
			> -->
			<div class="right-menu-divider"></div>
			<v-contextmenu-item v-if="authType === 'ltd' && row.type !== 'dir'" @click="sendEmail(row)"><span class="file-menu-icon email-icon"></span>发送到邮箱</v-contextmenu-item>
			<v-contextmenu-item @click="openDetail(row)"><span class="file-menu-icon status-icon"></span>属性</v-contextmenu-item>
		</div>
		<!-- 批量操作右键菜单 -->
		<div v-if="isBatch && Array.isArray(row)">
			<v-contextmenu-item @click="fileBatchSet(row, 'copy')"><span class="file-menu-icon copy-file-icon"></span>复制</v-contextmenu-item>
			<v-contextmenu-item @click="fileBatchSet(row, 'cut')"><span class="file-menu-icon cut-file-icon"></span>剪切</v-contextmenu-item>
			<v-contextmenu-item @click="BatchSetAuth(row)"><span class="file-menu-icon authority-icon"></span>权限</v-contextmenu-item>
			<v-contextmenu-item @click="createCompress(row)"><span class="file-menu-icon compress-file-icon"></span>创建压缩</v-contextmenu-item>
			<v-contextmenu-item @click="formatFile(row)"><span class="file-menu-icon format-file-icon"></span>格式转换</v-contextmenu-item>
			<v-contextmenu-item @click="batchDelFile(row)"><span class="file-menu-icon delete-file-icon"></span>删除</v-contextmenu-item>
		</div>
		<!-- 默认右键菜单 -->
		<div v-if="!row?.fileName && !isBatch">
			<v-contextmenu-item @click="refreshFilesList"><span class="file-menu-icon refresh-icon"></span>刷新</v-contextmenu-item>
			<div class="right-menu-divider"></div>
			<v-contextmenu-item @click="uploadFiles"><span class="file-menu-icon upload-icon"></span>上传</v-contextmenu-item>
			<VContextmenuSubmenu>
				<template #title>
					<span> <span class="file-menu-icon folder_create"></span><span class="align-text-top">新建文件夹/文件 </span> </span>
				</template>
				<v-contextmenu-item @click="create('dir')"><span class="file-menu-icon dirF-icon"></span>新建文件夹</v-contextmenu-item>
				<v-contextmenu-item @click="create('file')"><span class="file-menu-icon file-icon"></span>新建文件</v-contextmenu-item>
				<v-contextmenu-item @click="symbolicLinkView"><span class="file-menu-icon dirLink-icon"></span>软链接文件</v-contextmenu-item>
			</VContextmenuSubmenu>
			<VContextmenuSubmenu>
				<template #title>
					<span> <span class="file-menu-icon download-file-icon"></span><span class="align-text-top">从云存储下载</span> </span>
				</template>
				<v-contextmenu-item @click="openCloud('bos')">
					<div class="flex items-center w-full">
						<div class="flex items-center"><span class="file-menu-icon baidu-icon"></span>百度云存储</div>
						<i class="svgtofont-icon-ltd ml-4px text-ltd !text-large"></i>
					</div>
				</v-contextmenu-item>
				<v-contextmenu-item @click="openCloud('alioss')">
					<div class="flex items-center w-full">
						<div class="flex items-center"><span class="file-menu-icon ali-icon"></span>阿里云存储</div>
						<i class="svgtofont-icon-ltd ml-4px text-ltd !text-large"></i>
					</div>
				</v-contextmenu-item>
				<v-contextmenu-item @click="openCloud('txcos')">
					<div class="flex items-center w-full">
						<div class="flex items-center"><span class="file-menu-icon txcos-icon"></span>腾讯云存储</div>
						<i class="svgtofont-icon-ltd ml-4px text-ltd !text-large"></i>
					</div>
				</v-contextmenu-item>
				<v-contextmenu-item @click="openCloud('obs')">
					<div class="flex items-center w-full">
						<div class="flex items-center"><span class="file-menu-icon huawei-icon"></span>华为云存储</div>
						<i class="svgtofont-icon-ltd ml-4px text-ltd !text-large"></i>
					</div>
				</v-contextmenu-item>
			</VContextmenuSubmenu>
			<v-contextmenu-item @click="CreateTerminalDialog"><span class="file-menu-icon terminals-icon"></span>终端</v-contextmenu-item>
			<el-divider v-if="copyFilesData.files.length !== 0" class="!mt-0 !mb-0" />
			<v-contextmenu-item v-show="copyFilesData.files.length !== 0" @click="pasteFiles"><span class="file-menu-icon paste-icon"></span>粘贴</v-contextmenu-item>
		</div>
	</v-contextmenu>
</template>

<script setup lang="ts">
import { Contextmenu as VContextmenu, ContextmenuItem as VContextmenuItem, ContextmenuSubmenu as VContextmenuSubmenu } from 'v-contextmenu'

import 'v-contextmenu/dist/themes/default.css'

import {
	FileInputDatabaseView,
	symbolicLinkView,
	CreateTerminalDialog,
	BatchSetAuth,
	defaultPS,
	downFile,
	openFileSplit,
	openFileMerge,
	openFileAsync,
	copyFiles,
	delFileEvent,
	createCompress,
	formatFile,
	deCompressFile,
	createCopy,
	pathJumpEvent,
	sendEmail,
	openDetail,
	uploadFiles,
	pasteFiles,
	fileBatchSet,
	batchDelFile,
	addTabEvent,
	determineFileType,
} from '@files/useMethods'
import { storeToRefs } from 'pinia'
import FILES_RIGHT_MENU_STORE from './store'
import { useGlobalStore } from '@/store/global'

const { enterpriseRec } = useGlobalStore()
const store = FILES_RIGHT_MENU_STORE()
const { contextRow: row, isBatch, authType, contextmenu, showOpen, copyFilesData } = storeToRefs(store)
const { refreshFilesList, openEvent, handleReName, show, hide, handleClickOutside, openCloud, create, toping, share, collection, openLogAnalyze, openTrojanScan, watchCurrentRow } = store

// 判断传入的是否是文件
// const checkAllFile = computed(() => {
// 	let isFile = false
// 	if (Array.isArray(row.value)) {
// 		isFile = row.value.every((item: FileDataProps) => item.type !== 'dir')
// 	} else {
// 		isFile = row.value?.type !== 'dir'
// 	}
// 	return isFile
// })

//打开按钮文字
const openBtnText = computed(() => {
	let text = ''
	if (row.value?.type === 'dir') {
		text = '打开'
	} else {
		if (!row.value) return text
		// 文件类型判断
		switch (determineFileType(row.value.ext)) {
			case 'images':
				text = '预览'
				// delete config['vsopen']
				break
			case 'video':
				text = '播放'
				// delete config['vsopen']
				break
			case 'compress':
				if (showUnzip) {
					text = row.value.ext.toUpperCase() + '压缩预览'
				} else {
					showOpen.value = false // 判断是否压缩文件,禁用操作
				}
				// delete config['vsopen']
				break
			default:
				text = '编辑'
				// config['vsopen'] = '编辑（code-server）'
				break
		}
	}
	return text
})

// 格式转换
const isformatType = computed(() => {
	let bol = false
	if (!row.value) return bol
	if (determineFileType(row.value.ext) === 'images' || determineFileType(row.value.ext) === 'video') {
		bol = true
	}
	return bol
})

// 分享按钮文字
const shareBtnText = computed(() => {
	let text = ''
	if (row.value?.isShare == 0) {
		text = '外链分享'
	} else {
		text = '取消分享'
	}
	return text
})

// 置顶按钮文字
const topBtnText = computed(() => {
	let text = ''
	if (!row.value?.isTop) {
		text = '置顶'
	} else {
		text = '取消置顶'
	}
	return text
})
// 收藏按钮文字
const favBtnText = computed(() => {
	let text = ''
	if (!row.value?.isFav) {
		text = '添加到收藏夹'
	} else {
		text = '取消收藏'
	}
	return text
})

// 是否展示文件同步
const showAsync = computed(() => {
	let show = true
	if (row.value?.type !== 'dir') {
		show = false
	}
	// 系统类型不显示同步
	if (row.value && defaultPS.get(row.value.path) != undefined) {
		show = false
	}
	return show
})

// 是否展示解压
const showUnzip = computed(() => {
	const compression = ['zip', 'rar', 'gz', 'tar', 'war', 'tgz', 'bz2', '7z', 'tar.gz']
	return compression.includes(row.value?.ext || '')
})

// 是否展示打开文件所在目录
const showOpenDir = computed(() => {
	let show = false
	if (row.value?.isSearch) {
		show = true
	}
	return show
})

onMounted(() => {
	watchCurrentRow()
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
	@apply flex items-center h-[3rem] w-[18.8rem] text-small;
}
:deep(.v-contextmenu-item .v-contextmenu-item) {
	@apply w-[15rem];
}
:deep(.v-contextmenu-item .v-contextmenu-submenu__title .v-contextmenu-submenu__icon) {
	@apply top-[1rem];
}

:deep(.v-contextmenu-item--hover) {
	background-color: var(--el-fill-color-darker) !important;
	color: var(--el-color-text-secondary) !important;
}

.file-menu-icon {
	@apply inline-block w-[1.6rem] h-[1.6rem] mr-[1rem];
	background-image: url('/static/images/file_icon/file_menu_icon.png');
	background-size: auto !important;
	background-position: inherit;
	background-repeat: no-repeat;
}

.right-menu-divider {
	border-bottom: 1px solid var(--el-color-border-dark);
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
.upload-file-icon {
	background-position: 0 -48px;
}
.favorites-file-icon {
	background-position: -17px -773px;
}
.not-elf-icon {
	background-image: none !important;
}
.toping-icon {
	background-image: url('/static/images/file_icon/topping.png');
	background-size: contain;
	background-repeat: no-repeat;
}
.rsync-icon {
	background-image: url('/static/images/soft_ico/ico-rsync.png');
	background-repeat: no-repeat;
	background-size: contain !important;
}
.authority-icon {
	background-image: url('/static/images/file_icon/authority.png');
	background-repeat: no-repeat;
	background-size: 1.8rem !important;
}
.log-icon {
	background-image: url('/static/images/soft_ico/ico-file_real_time_log.png');
	background-repeat: no-repeat;
	background-size: contain;
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
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
	background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYuMDAwMDAwIiBoZWlnaHQ9IjE1LjAwMDAwMCIgdmlld0JveD0iMCAwIDE2IDE1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KCTxkZXNjPgoJCQlDcmVhdGVkIHdpdGggUGl4c28uCgk8L2Rlc2M+Cgk8ZGVmcy8+Cgk8cGF0aCBpZD0icGF0aCIgZD0iTTIuMDI4ODEgMTQuOTkxNkMwLjkwNzIyNyAxNC45OTE2IDAgMTQuMDMxNCAwIDEyLjg2MDdMMCAxMC41MzYyQzAgOS4zNTcxIDAuOTA3MjI3IDguMzk2OTcgMi4wMjg4MSA4LjM5Njk3TDUuOTIxNjMgOC4zOTY5N0M3LjA0MzMzIDguMzk2OTcgNy45NTA1NiA5LjM1NzEgNy45NTA1NiAxMC41MzYyTDcuOTUwNTYgMTIuODYwN0M3Ljk1MDU2IDE0LjAzOTkgNy4wNDMzMyAxNSA1LjkyMTYzIDE1TDIuMDI4ODEgMTVMMi4wMjg4MSAxNC45OTE2Wk0yLjAyODgxIDkuNjQzNDZDMS41NjcwMiA5LjY0MzQ2IDEuMTg3NjIgMTAuMDM5MyAxLjE4NzYyIDEwLjUzNjJMMS4xODc2MiAxMi44NjA3QzEuMTg3NjIgMTMuMzQ5MiAxLjU2NzAyIDEzLjc1MzUgMi4wMjg4MSAxMy43NTM1TDUuOTEzNDUgMTMuNzUzNUM2LjM3NTI0IDEzLjc1MzUgNi43NTQ2NCAxMy4zNTc3IDYuNzU0NjQgMTIuODYwN0w2Ljc1NDY0IDEwLjUzNjJDNi43NTQ2NCAxMC4wNDc3IDYuMzc1MjQgOS42NDM0NiA1LjkxMzQ1IDkuNjQzNDZMMi4wMjg4MSA5LjY0MzQ2Wk05Ljg1NTcxIDE0LjcyMjFDOS41MzQwNiAxNC43MjIxIDkuMzUyNTQgMTQuNDYxIDkuMzQ0MzYgMTQuMjA4M0M5LjMzNjA2IDEzLjk2NDEgOS40NzYzMiAxMy42NjkzIDkuOTIxNjMgMTMuNjI3MkMxMC4zNDIzIDEzLjU1MTQgMTAuNjYzOSAxMy40ODQgMTEuMDUxNSAxMy4zNDkyTDExLjA2OCAxMy4zNDA4TDExLjA4NDYgMTMuMzQwOEMxMS4yMzMgMTMuMzQwOCAxMS43MzYxIDEyLjk3MDIgMTIuMTU2NyAxMi40NTY1TDEyLjE2NDkgMTIuNDM5NkwxMi4xODk3IDEyLjQyMjhMMTIuMTk4IDEyLjQyMjhDMTIuNDI4OCAxMi4zMDQ5IDEyLjgyNDcgMTEuNjIyNyAxMy4wMzA5IDEwLjgzOTRDMTMuMDM5MiAxMC43ODg5IDEzLjA0NzQgMTAuNzQ2OCAxMy4wNTU3IDEwLjcwNDdMMTMuMDY0IDEwLjY2MjZDMTMuMTEzNCAxMC4zODQ2IDEzLjE2MjggMTAuMTQwNCAxMy4xNjI4IDkuODU0MDJDMTMuMTYyOCA5LjgyMDMzIDEzLjE2MjggOS43Njk3OSAxMy4xNTQ3IDkuNjg1NThDMTMuMTQ2NCA5LjYzNTA0IDEzLjE0NjQgOS41OTI5MyAxMy4xNDY0IDkuNTQyMzlMMTIuNTQ0MyAxMC4yOTJDMTIuMzg3NiAxMC40Njg4IDEyLjIzOTEgMTAuNTAyNSAxMi4xNDAzIDEwLjUwMjVDMTIuMDc0MiAxMC41MDI1IDEyIDEwLjQ4NTcgMTEuOTM0IDEwLjQ1MkMxMS43NzczIDEwLjM2NzggMTEuNjg2NiAxMC4yNTgzIDExLjY1MzYgMTAuMTE1MUMxMS42MTI0IDkuOTI5ODEgMTEuNzExMyA5Ljc2MTM3IDExLjc1MjYgOS43MDI0MkwxMS43NjA5IDkuNjk0TDEzLjEyOTkgNy45NTkwMUMxMy4xNzkzIDcuOTA4NDggMTMuNDU5OCA3LjYzODk2IDEzLjc1NjcgNy42Mzg5NkMxNC4xNzc0IDcuNjM4OTYgMTQuNDA4MiA4LjAxNzk3IDE0LjQ2NTkgOC4xMTkwM0wxNS42OTQ4IDkuOTI5ODFDMTUuNjk0OCA5LjkyOTgxIDE1Ljg5MjggMTAuMjE2MiAxNS41NDY0IDEwLjU4NjdDMTUuNDMwOSAxMC43MDQ3IDE1LjI5OSAxMC43NzIgMTUuMTc1MyAxMC43NzJDMTUuMDE4NiAxMC43NzIgMTQuOTE5NiAxMC42Nzk0IDE0LjkwMzEgMTAuNjYyNkwxNC4yMTg1IDkuNzI3NjhMMTQuMjE4NSAxMC4wMDU2QzE0LjIxODUgMTEuMDA3OSAxMy44ODg3IDExLjk3NjQgMTMuMjM3MSAxMi44ODZDMTIuNTg1NiAxMy43MTk4IDExLjg0MzMgMTQuMjU4OSAxMC45NjkxIDE0LjU1MzZDMTAuOTM2IDE0LjU3MDUgMTAuODg2NiAxNC41ODczIDEwLjc1NDYgMTQuNjIxTDEwLjY4ODcgMTQuNjM3OEMxMC40OTA3IDE0LjY4ODQgMTAuMzA5MyAxNC43MjIxIDEwLjE1MjYgMTQuNzQ3M0w5Ljg1NTcxIDE0Ljc0NzNMOS44NTU3MSAxNC43MjIxWk0yLjQ5OTAyIDcuMjkzNjZDMi4wMzcxMSA3LjI5MzY2IDEuODA2MTUgNi44NTU3IDEuNzgxNDkgNi43OTY3NEwwLjYyNjgzMSA0LjkzNTQyQzAuNjI2ODMxIDQuOTM1NDIgMC40Mjg4MzMgNC42NDkwOCAwLjc3NTI2OSA0LjI4NjkxQzAuODk4OTI2IDQuMTY5MDEgMS4wMjI3MSA0LjEwMTYyIDEuMTQ2MzYgNC4xMDE2MkMxLjMwMzEgNC4xMDE2MiAxLjQwMjEgNC4xOTQyNyAxLjQxODU4IDQuMjExMTJMMi4xMDMxNSA1LjEzNzU2TDIuMTAzMTUgNS4xMTIzTDIuMTAzMTUgNS4wMTEyM0MyLjExMTMzIDQuNTkwMTIgMi4xNjA3NyA0LjE2OTAxIDIuMjQzMjkgMy43NjQ3NEMyLjQzMjk4IDIuOTY0NjMgMi44NzAxMiAyLjIxNTA0IDMuNTcxMTcgMS40NjU0N0M0LjI0NzQ0IDAuODI1Mzc4IDUuMDMwODggMC40MTI2ODkgNS44MjI2MyAwLjI3NzkzOUM2LjEwMzE1IDAuMjAyMTMzIDYuMzgzNTQgMC4yMDIxMzMgNi42NjM5NCAwLjIwMjEzM0M2LjgyMDY4IDAuMjAyMTMzIDYuOTExMzggMC40MjExMTIgNi45MTk1NiAwLjYzMTY2OEM2LjkzNjA0IDAuOTI2NDUzIDYuNzk1OSAxLjI1NDkxIDYuMzQyMjkgMS4zMDU0NUw2LjMwOTMzIDEuMzEzODdDNS45ODc2NyAxLjM4MTI0IDUuNjU3NzEgMS40NDg2MiA1LjM0NDM2IDEuNTgzMzdDNC43MjU4MyAxLjg0NDQ3IDQuMjU1NjIgMi4yNDAzMSAzLjgxODYgMi44NDY3MUwzLjc0NDM4IDIuOTU2MjFMMy43MTEzIDIuOTMwOTRDMy42MTI0MyAzLjA3NDExIDMuMzczMTcgMy41MjA0OSAzLjI0OTUxIDQuMTAxNjJMMy4yNDEyMSA0LjE1MjE2TDMuMjMzMDMgNC4xNzc0M0wzLjIzMzAzIDQuMTg1ODVDMy4yMjQ3MyA0LjIxOTU0IDMuMTUwNTEgNC41OTg1NCAzLjE1MDUxIDUuMDI4MDhMMy4xNTA1MSA1LjA5NTQ2QzMuMTUwNTEgNS4xNDU5OCAzLjE1ODgxIDUuMjA0OTQgMy4xNTg4MSA1LjI1NTQ4QzMuMTU4ODEgNS4yODA3NSAzLjE1ODgxIDUuMjk3NTkgMy4xNjY5OSA1LjMyMjg2TDMuNzExMyA0LjY0OTA4QzMuODY4MDQgNC40NzIyMSA0LjAxNjQ4IDQuNDM4NTIgNC4xMTU0OCA0LjQzODUyQzQuMTg5NyA0LjQzODUyIDQuMjU1NjIgNC40NTUzNyA0LjMyMTY2IDQuNDg5MDZDNC40NzgzOSA0LjU3MzI3IDQuNTY5MDkgNC42ODI3NyA0LjYwMjA1IDQuODE3NTJDNC42MjY4MyA0Ljk0Mzg1IDQuNTkzODcgNS4wOTU0NiA0LjUwMzA1IDUuMjMwMjFMNC41MDMwNSA1LjIzODYzTDMuMTM0MDMgNi45NjUxOUMzLjA3NjI5IDcuMDI0MTQgMi43OTU5IDcuMjkzNjYgMi40OTkwMiA3LjI5MzY2Wk0xMC4wODY1IDYuNTk0NkM4Ljk2NDk3IDYuNTk0NiA4LjA1Nzc0IDUuNjM0NDggOC4wNTc3NCA0LjQ1NTM3TDguMDU3NzQgMi4xMzkyNUM4LjA1Nzc0IDAuOTYwMTI5IDguOTY0OTcgMCAxMC4wODY1IDBMMTMuOTcxMiAwQzE1LjA5MjggMCAxNiAwLjk2MDEyOSAxNiAyLjEzOTI1TDE2IDQuNDYzNzlDMTYgNS42NDI5IDE1LjA5MjggNi42MDMwMyAxMy45NzEyIDYuNjAzMDNMMTAuMDg2NSA2LjYwMzAzTDEwLjA4NjUgNi41OTQ2Wk0xMC4wODY1IDEuMjQ2NDlDOS42MjQ3NiAxLjI0NjQ5IDkuMjQ1MzYgMS42NDIzMyA5LjI0NTM2IDIuMTM5MjVMOS4yNDUzNiA0LjQ2Mzc5QzkuMjQ1MzYgNC45NTIyNyA5LjYyNDc2IDUuMzU2NTQgMTAuMDg2NSA1LjM1NjU0TDEzLjk3MTIgNS4zNTY1NEMxNC40MzMgNS4zNTY1NCAxNC44MTI0IDQuOTYwNjkgMTQuODEyNCA0LjQ2Mzc5TDE0LjgxMjQgMi4xMzkyNUMxNC44MTI0IDEuNjUwNzYgMTQuNDMzIDEuMjQ2NDkgMTMuOTcxMiAxLjI0NjQ5TDEwLjA4NjUgMS4yNDY0OVoiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0iIzIwQTUzQSIvPgoJPHBhdGggaWQ9InBhdGgiIGQ9Ik0yLjAyODgxIDE0Ljk5MTZDMC45MDcyMjcgMTQuOTkxNiAwIDE0LjAzMTQgMCAxMi44NjA3TDAgMTAuNTM2MkMwIDkuMzU3MSAwLjkwNzIyNyA4LjM5Njk3IDIuMDI4ODEgOC4zOTY5N0w1LjkyMTYzIDguMzk2OTdDNy4wNDMzMyA4LjM5Njk3IDcuOTUwNTYgOS4zNTcxIDcuOTUwNTYgMTAuNTM2Mkw3Ljk1MDU2IDEyLjg2MDdDNy45NTA1NiAxNC4wMzk5IDcuMDQzMzMgMTUgNS45MjE2MyAxNUwyLjAyODgxIDE1TDIuMDI4ODEgMTQuOTkxNlpNMi4wMjg4MSA5LjY0MzQ2QzEuNTY3MDIgOS42NDM0NiAxLjE4NzYyIDEwLjAzOTMgMS4xODc2MiAxMC41MzYyTDEuMTg3NjIgMTIuODYwN0MxLjE4NzYyIDEzLjM0OTIgMS41NjcwMiAxMy43NTM1IDIuMDI4ODEgMTMuNzUzNUw1LjkxMzQ1IDEzLjc1MzVDNi4zNzUyNCAxMy43NTM1IDYuNzU0NjQgMTMuMzU3NyA2Ljc1NDY0IDEyLjg2MDdMNi43NTQ2NCAxMC41MzYyQzYuNzU0NjQgMTAuMDQ3NyA2LjM3NTI0IDkuNjQzNDYgNS45MTM0NSA5LjY0MzQ2TDIuMDI4ODEgOS42NDM0NlpNMTAuMDg2NSA2LjU5NDZDOC45NjQ5NyA2LjU5NDYgOC4wNTc3NCA1LjYzNDQ4IDguMDU3NzQgNC40NTUzN0w4LjA1Nzc0IDIuMTM5MjVDOC4wNTc3NCAwLjk2MDEyOSA4Ljk2NDk3IDAgMTAuMDg2NSAwTDEzLjk3MTIgMEMxNS4wOTI4IDAgMTYgMC45NjAxMjkgMTYgMi4xMzkyNUwxNiA0LjQ2Mzc5QzE2IDUuNjQyOSAxNS4wOTI4IDYuNjAzMDMgMTMuOTcxMiA2LjYwMzAzTDEwLjA4NjUgNi42MDMwM0wxMC4wODY1IDYuNTk0NlpNMTAuMDg2NSAxLjI0NjQ5QzkuNjI0NzYgMS4yNDY0OSA5LjI0NTM2IDEuNjQyMzMgOS4yNDUzNiAyLjEzOTI1TDkuMjQ1MzYgNC40NjM3OUM5LjI0NTM2IDQuOTUyMjcgOS42MjQ3NiA1LjM1NjU0IDEwLjA4NjUgNS4zNTY1NEwxMy45NzEyIDUuMzU2NTRDMTQuNDMzIDUuMzU2NTQgMTQuODEyNCA0Ljk2MDY5IDE0LjgxMjQgNC40NjM3OUwxNC44MTI0IDIuMTM5MjVDMTQuODEyNCAxLjY1MDc2IDE0LjQzMyAxLjI0NjQ5IDEzLjk3MTIgMS4yNDY0OUwxMC4wODY1IDEuMjQ2NDlaIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+Cg==');
}
.decompress-file-icon {
	background-position: -0px -32px;
}
.create-copy-icon {
	background-position: -0px -96px;
}
.email-icon,
.open-tab-icon,
.status-icon {
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
}
.email-icon {
	background-image: url('/static/images/file_icon/send_mail.png');
}

.open-tab-icon {
	/* background-image: url('/static/images/file_icon/open-tab.svg'); */
	background-position: -0px -609px;
}
.status-icon {
	background-image: url('/static/images/file_icon/property.png');
}
.refresh-icon {
	background-position: -16px -513px;
}
.upload-icon {
	background-position: -0px -48px;
}
.folder_create {
	background-image: url('/static/images/file_icon/folder_create.png');
	background-repeat: no-repeat;
	background-size: contain !important;
	background-position: center;
}

.dirF-icon {
	background-position: -0px -16px;
}
.file-icon,
.dirLink-icon,
.baidu-icon,
.ali-icon,
.huawei-icon,
.txcos-icon,
.terminals-icon {
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
}
.file-icon {
	background-image: url('/static/images/file_icon/file_text2.png');
}
.dirLink-icon {
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABVklEQVQ4T2NkYGBgCJj7we0/E1Mfw///2iA+NiArwMQgwc+QW+PMOwVZnhHE8Z/3aT8Dw38HXJpB4iADrBVZGe6++41iCMkG/PvHwHD/A8IQog0Q4GRk8NBggzsS5hKiDcD0HuOBjUl8jgQNyLLiYPj+h4Hh4rM/DOee/EEyhwgD/LTZGJLMOBhKN39l6PblZgiY/4k0AzYk8jEkr/rC8PbrP4aVsbwM4Ys/E2+AphgzQ5AeO8Pdt38Z1ESYGc4++cOw9fov4g0AxXujOzfD7lu/GE4//sNw581ftHDEEwYZlhwM117+Zfj++z9DtQsXQ9zyzwyffvwn3oBiB06G3gPfGawVWBlKHTnRAg9mDh4XTA/mYdhz6zdDrAk7Q/nWrww3X6E7H2QIgWgEhcHjD//wZA8i0gG+zIXigsB5n3z+MfyfzMDAoIBfE1z2ARMDY+76JL4tAFXGthEWh1PJAAAAAElFTkSuQmCC');
}
.baidu-icon {
	background-image: url('/static/images/soft_ico/ico-bos.png');
	background-size: contain !important;
}

.ali-icon {
	background-image: url('/static/images/soft_ico/ico-alioss.png');
	background-size: contain !important;
}
.huawei-icon {
	background-image: url('/static/images/soft_ico/ico-obs.png');
	background-size: contain !important;
}
.txcos-icon {
	background-image: url('/static/images/soft_ico/ico-txcos.png');
	background-size: contain !important;
}
.terminals-icon {
	background-image: url('/static/images/file_icon/ico-cmd.png');
}
.paste-icon {
	background-position: -16px -64px;
}
</style>
