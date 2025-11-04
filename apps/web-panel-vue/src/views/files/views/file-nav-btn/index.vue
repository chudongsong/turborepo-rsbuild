<template>
	<div class="nav nav-btn">
		<!-- 左侧操作栏 -->
		<div class="left flex items-center flex-wrap">
			<el-dropdown class="" @command="handleCommand" :show-timeout="250">
				<el-button class="upload-btn" @click="openFilesUpload"> <span class="upload-icon"></span>上传/下载<i class="svgtofont-el-arrow-down el-icon--right"></i> </el-button>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="upload" class="upload-btn"><span class="upload-icon !mr-[.6rem]"></span>上传文件/文件夹</el-dropdown-item>
						<el-dropdown-item command="openUrlLinkDown" divided>
							<div class="inline-flex items-center">
								<bt-image src="/file/url-down.svg" class="w-[1.6rem] align-middle mr-4px"></bt-image>
								URL链接下载
							</div>
						</el-dropdown-item>
						<!-- cloudList -->
						<el-dropdown-item v-for="item in cloudList" :key="item.command" :command="item.command">
							<div class="items-center inline-flex">
								<bt-image :src="`/file/${item.icon}.svg`" class="mr-4px w-[1.6rem] align-middle"></bt-image>
								{{ item.name }}
								<i class="svgtofont-icon-ltd ml-4px text-ltd !text-large"></i>
							</div>
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>

			<el-dropdown @command="createCommand" :show-timeout="250">
				<el-button>
					<bt-image class="mr-4px w-[1.4rem] align-bottom" src="/file_icon/folder_create.png"></bt-image>
					<!-- <i class="iconfont icon-file text-base  mr-[4px]" /> -->
					新建<i class="svgtofont-el-arrow-down el-icon--right"></i
				></el-button>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="file"><bt-image src="/file_icon/file_text2.png" class="mr-4px mt-4px w-[1.6rem] align-text-bottom"></bt-image>新建空白文本</el-dropdown-item>
						<el-dropdown-item command="dir"> <bt-image src="/file_icon/folder_win10.png" class="mr-4px mt-4px w-[1.6rem] align-text-bottom"></bt-image>新建文件夹 </el-dropdown-item>
						<el-dropdown-item command="link"><bt-image class="mr-4px w-[1.6rem] align-text-bottom" src="/file/url-down.svg"></bt-image>新建软链接文件</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>

			<el-button class="search-btn" @click="FileSearchView">
				<span class="flex items-center">文件内容搜索</span>
			</el-button>
			<el-dropdown @command="collectCommand" :show-timeout="250">
				<el-button @click="ManageFavoritesView"> <span class="file-menu-icon favorites-file-icon mr-4px"></span>收藏夹<i class="svgtofont-el-arrow-down el-icon--right"></i> </el-button>
				<template #dropdown>
					<el-dropdown-menu class="max-h-[23rem] overflow-auto">
						<el-dropdown-item v-if="!favoriteList.length" disabled>
							<span>暂无收藏</span>
						</el-dropdown-item>
						<el-dropdown-item v-for="item in favoriteList" :key="item.path" :command="item">
							<div class="h-[2.7rem]" :title="item.path">
								<bt-image :src="`${item.type === 'file' ? '/file_icon/file_text2.png' : '/file_icon/folder_win10.png'}`" class="mr-4px mt-4px w-[1.6rem] align-top"></bt-image>
								<span class="max-w-[16rem] text-space"
									>{{ item.name }}<span class="text-tertiary"> ({{ item.path }})</span></span
								>
							</div>
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<!-- <el-button class="search-btn nav-btn-hide-1600" @click="ShareListView"> 分享列表 </el-button> -->

			<el-button class="terminal-btn !ml-0" @click="CreateTerminalDialog">
				<div class="flex items-center"><span class="fileTerminal-icon"></span>终端</div>
			</el-button>

			<!-- <el-button class="record-btn nav-btn-hide-1600" @click="FileOperationRecordView">
				<div class="flex items-center">
					<span class="record-icon"></span>
					文件操作记录
				</div>
			</el-button> -->

			<!-- <el-button class="record-btn nav-btn-hide-1600" @click="FilesHistoryRecordView">
				<div class="flex items-center">
					<i class="svgtofont-left-crontab mr-4px text-tertiary"></i>
					文件足迹
				</div>
			</el-button> -->

			<!-- 腾讯专享版 且 已安装插件【腾讯云COSFS】时有下拉按钮 -->
			<div id="extension-cosfs"></div>

			<!-- 磁盘，多有个的时候为下拉，只有一个时为按钮 -->
			<div class="flex items-center">
				<el-button class="search-btn !mr-0" @click="pathJumpEvent('/')" v-if="diskList?.length === 1">
					<span class="flex items-center truncate">
						<i class="svgtofont-file-hdd text-large mr-4px svg-icon"></i>
						{{ `/(根目录)${diskList[0]?.size[2] || ''}` }}
					</span>
				</el-button>
				<el-dropdown v-else @command="pathJumpEvent">
					<el-button class="!mr-0" @click="pathJumpEvent('/')">
						<i class="svgtofont-file-hdd text-large mr-4px svg-icon"></i>
						{{ `/(根目录)${diskList[0]?.size[2] || ''}` }}<i class="svgtofont-el-arrow-down el-icon--right"></i>
					</el-button>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item v-for="(item, index) in diskList" :command="item.path" :key="index">
								<div class="inline-block w-full flex items-center" :title="`${item.path}（${item.size[2] || ''}）`">
									<div class="!max-w-[12rem] truncate inline-block">{{ index ? item.path : '/(根目录)' }}({{ item.size[2] || '' }})</div>
								</div>
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>

			<el-dropdown :show-timeout="250" class="nav-btn-more-btn">
				<el-button>更多功能<i class="svgtofont-el-arrow-down el-icon--right"></i></el-button>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item @click="ShareListView">分享列表</el-dropdown-item>
						<el-dropdown-item @click="FileOperationRecordView">文件操作记录</el-dropdown-item>
						<el-dropdown-item @click="FilesHistoryRecordView">文件足迹</el-dropdown-item>
						<el-dropdown-item class="flex items-center" @click="openPlugin('tamper_core', 75)"><i class="svgtofont-icon-ltd !text-medium !mr-0 text-ltd"></i>企业级防篡改</el-dropdown-item>
						<el-dropdown-item class="flex items-center" @click="openPlugin('rsync', 70)"><i class="svgtofont-icon-ltd !text-medium !mr-0 text-ltd"></i>文件同步</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>

			<!-- <bt-divider class="nav-btn-hide-1600" />
			<el-tooltip class="item" effect="dark" placement="bottom-end">
				<template #content>
					<div class="w-[26rem] whitespace-pre-wrap">企业级防篡改保护核心数据和系统避免受恶意复改和破坏，确保数据的安全性和完整性</div>
				</template>
				<el-button class="temper-btn nav-btn-hide-1600" @click="openPlugin('tamper_core', 75)">
					<span class="flex items-center"><span class="temper-icon mr-4px"></span>企业级防篡改</span>
				</el-button>
			</el-tooltip>

			<el-tooltip class="item nav-btn-hide-1600" effect="dark" content="文件同步能在两台服务器之间保持文件一致性" placement="bottom-end">
				<el-button class="rsync-btn nav-btn-hide-1600" @click="openPlugin('rsync', 70)"
					><span class="flex items-center"><span class="rsync-icon mr-4px"></span>文件同步</span></el-button
				>
			</el-tooltip> -->
		</div>
		<!-- 右侧操作栏 -->
		<div class="right flex items-center">
			<div class="flex items-center text-warning mr-8px" v-if="!batchNum.length" v-show="isShowTips">
				<i class="svgtofont-el-info-filled text-warning mt-2px mr-4px text-base"></i>
				文件操作可使用右键
			</div>
			<div class="right flex items-center" v-show="batchNum.length > 1">
				<el-button-group class="flex-nowrap !inline-flex">
					<el-button v-for="action in actionsBtn" :key="action.type" class="!mr-[-1px]" v-show="mainWidth > (action.hide || 0) && mainWidth >= 1720" @click="action.handler()"> <span :class="action.icon" class="file-menu-icon mr-4px"></span>{{ action.label }}</el-button>
					<el-dropdown @command="fileBatchEvent" v-if="mainWidth < 1720">
						<el-button class="!m-0 border" style="border-left: 1px solid var(--el-color-border-dark)">更多<i class="svgtofont-el-arrow-down el-icon--right"></i></el-button>
						<template #dropdown>
							<el-dropdown-menu class="batch-btn-list">
								<el-dropdown-item command="copy"><span class="file-menu-icon copy-file-icon"></span>复制</el-dropdown-item>
								<el-dropdown-item command="cut"><span class="file-menu-icon cut-file-icon"></span>剪切</el-dropdown-item>
								<el-dropdown-item command="compress"><span class="file-menu-icon compress-file-icon"></span>压缩</el-dropdown-item>
								<el-dropdown-item command="auth"><span class="file-menu-icon authority-file-icon"></span>权限</el-dropdown-item>
								<el-dropdown-item command="del"><span class="file-menu-icon delete-file-icon"></span>删除</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</el-button-group>
			</div>
			<bt-divider v-show="batchNum.length > 1" />
			<el-button v-show="copyFilesData.files.length > 0" @click="pasteFiles">粘贴</el-button>
			<el-button @click="FileRecyclingBinView()"> <i class="svgtofont-el-delete mr-4px"></i>回收站 </el-button>

			<div class="flex items-center">
				<span @click="handleChangeMenu('list')" :class="fileTabActiveData.type === 'list' ? 'active' : ''" class="menu-type menu-left list-view">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="menu-icon">
						<!-- 第一行 -->
						<rect x="1" y="1.5" width="2" height="2" rx="0.2" />
						<rect x="4.5" y="1.5" width="8.5" height="2" rx="0.2" />
						<!-- 第二行 -->
						<rect x="1" y="6" width="2" height="2" rx="0.2" />
						<rect x="4.5" y="6" width="8.5" height="2" rx="0.2" />
						<!-- 第三行 -->
						<rect x="1" y="10.5" width="2" height="2" rx="0.2" />
						<rect x="4.5" y="10.5" width="8.5" height="2" rx="0.2" />
					</svg>
				</span>
				<span @click="handleChangeMenu('icon')" :class="fileTabActiveData.type !== 'list' ? 'active' : ''" class="menu-type menu-right icon-view">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="menu-icon">
						<rect x="1" y="1" width="5" height="5" rx="1" />
						<rect x="8" y="1" width="5" height="5" rx="1" />
						<rect x="1" y="8" width="5" height="5" rx="1" />
						<rect x="8" y="8" width="5" height="5" rx="1" />
					</svg>
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'

import { pasteFiles, pathJumpEvent, FileSearchView, ShareListView, FileRecyclingBinView, CreateTerminalDialog, FileOperationRecordView, FilesHistoryRecordView, ManageFavoritesView, openFilesUpload, getDiskList } from '@files/useMethods'
import { isBoolean } from '@/utils'

const store = FILES_STORE()
const { mainWidth, copyFilesData, fileTabActiveData, diskList, favoriteList, fileBatchNum: batchNum } = storeToRefs(store)
const { cloudList, actionsBtn, fileBatchEvent, handleChangeMenu, handleCommand, openPlugin, collectCommand, createCommand, initNavBtn } = store

// 主体宽度小于1460时，隐藏提示
const isShowTips = computed(() => {
	return mainWidth.value > 1530
})

onMounted(() => {
	initNavBtn()

	// 专版挂载方法
	nextTick(() => {
		const time = setInterval(async () => {
			if (window.$extension) {
				const plugin = await window.$extension()
				if (isBoolean(plugin.extensionElement) && !plugin.extensionElement) clearTimeout(time)
				if (plugin.extensionElement) {
					plugin.extensionElement({
						custom: {
							getDiskList,
						},
					})
					clearTimeout(time)
				}
			}
		}, 1000)
	})
})
</script>

<style lang="css" scoped>
.text-space {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	display: inline-block;
}
.menu-type {
	@apply cursor-pointer;
	@apply flex items-center justify-center w-[3.2rem] h-[3.2rem] border border-dark rounded-small;
}
.menu-type:hover {
	@apply bg-light;
}
.menu-type:first-child {
	@apply rounded-r-0;
	border-right: 0;
}
.menu-type:last-child {
	@apply rounded-l-0;
	border-left: 0;
}
.menu-type.menu-left {
	border-right: none;
	border-top-left-radius: var(--el-border-radius-large);
	border-bottom-left-radius: var(--el-border-radius-large);
}
.menu-type.menu-right {
	border-top-right-radius: var(--el-border-radius-large);
	border-bottom-right-radius: var(--el-border-radius-large);
}
.menu-type.active {
	border-color: var(--el-color-primary);
	background-color: var(--el-color-primary-light-8);
	border-left: 1px solid var(--el-color-primary);
	border-right: 1px solid var(--el-color-primary);
}
/* SVG图标颜色定义 */
.menu-icon rect {
	fill: var(--el-color-text-secondary); /* 默认颜色 */
}
.menu-type.active .menu-icon rect {
	fill: var(--el-color-primary); /* 激活状态颜色 */
}

.nav {
	@apply flex items-center justify-between w-full py-[1.2rem] border-b border-lighter;
}
.nav-btn button {
	@apply flex items-center h-[3.2rem] p-[0.8rem];
}
.nav-btn .el-button {
	@apply ml-0;
}
.nav-btn .el-button {
	@apply mr-[1rem];
}

.upload-icon,
.record-icon,
.fileTerminal-icon {
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
}

.upload-icon {
	background-image: url('/static/images/file/file-upload.svg');
	@apply w-[1.4rem] h-[1.4rem] inline-block mr-4px text-base mb-[-.2rem];
}

.record-icon,
.fileTerminal-icon {
	@apply w-[1.4rem] h-[1.3rem] inline-block mr-4px text-base;
}

.record-icon {
	background-image: url('/static/images/file/file-record.svg');
}
.fileTerminal-icon {
	background-image: url('/static/images/file/terminal.svg');
}

.search-icon {
	background-image: url('/static/images/file/search.svg');
	@apply w-[1.4rem] h-[1.4rem] inline-block mr-4px text-base bg-cover;
}

.rsync-btn:hover .rsync-icon {
	background-image: url('/static/images/file/icon-rsync.svg');
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
}
.rsync-btn:focus .rsync-icon {
	background-image: url('/static/images/file/icon-rsync.svg');
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
}
.rsync-icon {
	@apply w-[1.4rem] h-[1.4rem] inline-block text-base;
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
	background-image: url('/static/images/file/icon-rsync.svg');
}

.temper-btn,
.temper-icon,
.search-icon,
.upload-icon,
.record-icon,
.terminal-icon,
.ltd-icon,
.authority-file-icon {
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
}

.temper-btn:hover .temper-icon {
	background-image: url('/static/images/file/ltd-temper.svg');
}
.temper-btn:focus .temper-icon {
	background-image: url('/static/images/file/ltd-temper.svg');
}
.temper-icon {
	@apply w-[1.4rem] h-[1.4rem] inline-block text-base;
	background-image: url('/static/images/file/ltd-temper.svg');
}

.search-btn:hover .search-icon {
	background-image: url('/static/images/file/search-active.svg');
}
.search-btn:focus .search-icon {
	background-image: url('/static/images/file/search-active.svg');
}
/* Removed .list-icon and .grid-icon styles - now using inline SVG */

.upload-btn:hover .upload-icon {
	background-image: url('/static/images/file/file-upload-active.svg');
}
.upload-btn:focus .upload-icon {
	background-image: url('/static/images/file/file-upload-active.svg');
}

.record-btn :hover .record-icon {
	background-image: url('/static/images/file/file-record-active.svg');
}

.terminal-btn :hover .terminal-icon {
	background-image: url('/static/images/file/terminal-active.svg');
}

.ltd-icon {
	@apply w-[2rem] h-[1.8rem] ml-[.6rem];
	background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTguMDAwMDAwIiBoZWlnaHQ9IjE4LjAwMDAwMCIgdmlld0JveD0iMCAwIDE4IDE4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KCTxkZXNjPgoJCQlDcmVhdGVkIHdpdGggUGl4c28uCgk8L2Rlc2M+Cgk8cGF0aCBpZD0i55+i6YePIDEwNTUiIGQ9Ik0xMy42NTg4IDMuNTk5OThMMTYuMiA3LjQ5NTQyTDkgMTUuMjg2NEwxLjc5OTk5IDcuNDk1NDJMNC4zNDExNiAzLjU5OTk4TDEzLjY1ODggMy41OTk5OFoiIHN0cm9rZT0iIzlCN0U0OCIvPgoJPHBhdGggaWQ9IuS8gSIgZD0iTTkuMjgzNzggOC44MTI4N0wxMS4xMjM0IDguODEyODdMMTEuMTIzNCA4LjM1ODk1TDkuMjgzNzggOC4zNTg5NUw5LjI4Mzc4IDYuODA1MTFMOC43OTIzOSA2LjgwNTExTDguNzkyMzkgMTAuNDk1OUw3LjU5NSAxMC40OTU5TDcuNTk1IDcuOTkyODZMNy4xMzAwNCA3Ljk5Mjg2TDcuMTMwMDQgMTAuNDk1OUw2LjMyNzY0IDEwLjQ5NTlMNi4zMjc2NCAxMC45NTgxTDExLjcxNTkgMTAuOTU4MUwxMS43MTU5IDEwLjQ5NTlMOS4yODM3OCAxMC40OTU5TDkuMjgzNzggOC44MTI4N1pNOC45NzEyMiA0Ljg5ODQ0QzguMzUyMjkgNS45Mjg4MyA3LjIwNjI0IDYuODU5OCA2LjAzNTI4IDcuMzYxNjlDNi4xNTUwMyA3LjQ4MjY3IDYuMjg4NzYgNy42NTMyNiA2LjM1ODczIDcuNzgyNDdDNy4zNjAxNyA3LjMwNzA3IDguMzA4NzggNi41NTk5NCA4Ljk5NjA5IDUuNjg1M0M5LjgxMDk0IDYuNzAyMzkgMTAuNjkxMSA3LjI4NzE3IDExLjY1ODQgNy43ODkxMkMxMS43MjIxIDcuNjQwMDEgMTEuODU1OCA3LjQ2OTM2IDExLjk2NDcgNy4zNjE2OUMxMC45NzcyIDYuODk5NTQgMTAuMDQ3MyA2LjMyMzA2IDkuMjUxMTMgNS4zMzI0NkM5LjMwMjQzIDUuMjU3OTMgOS4zNTM3NiA1LjE5IDkuMzk3MzEgNS4xMTU0Mkw4Ljk3MTIyIDQuODk4NDRaIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiM5QjdFNDgiLz4KCTxkZWZzLz4KPC9zdmc+Cg==');
}

.el-dropdown-menu--small .el-dropdown-menu__item {
	@apply max-w-[20rem] truncate;
}
.file-menu-icon {
	@apply inline-block;
	background-image: url('/static/images/file_icon/file_menu_icon.png');
	background-size: 2.6rem !important;
	background-position: inherit;
	background-repeat: no-repeat;
	width: 14px;
	height: 14px;
	vertical-align: bottom;
}

.favorites-file-icon {
	background-position: -13px -628px !important;
}
.copy-file-icon {
	background-position: 0 -77px;
}
.cut-file-icon {
	background-position: -12px -65px;
}
.delete-file-icon {
	height: 1.3rem;
	margin-top: 0.1rem;
	background-position: 0 -65px;
}
.compress-file-icon {
	background-position: -13px -25px;
}
.batch-btn-list .file-menu-icon {
	vertical-align: text-top;
	margin-right: 4px;
}
.authority-file-icon {
	background-image: url('/static/images/file_icon/authority.png');
	background-size: 1.8rem !important;
}
.nav-btn-more-btn {
	/* display: none; */ /* 统一换成下拉菜单 */
	margin-left: 1rem;
}
@media screen and (max-width: 1800px) {
	.nav-btn .el-button {
		padding: 0.4rem;
	}
}

@media screen and (max-width: 1600px) {
	.upload-icon,
	.search-icon,
	.svg-icon,
	.record-icon,
	.svgtofont-left-crontab,
	.temper-icon,
	.rsync-icon {
		display: none;
	}
	.el-button {
		margin-right: 0.5rem !important;
	}
	.nav-btn-more-btn {
		margin-left: 0;
	}
}

@media screen and (max-width: 1700px) {
	.nav-btn-hide-1600 {
		display: none !important;
	}
	.nav-btn-more-btn {
		display: block;
	}
}
</style>
