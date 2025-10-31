<template>
	<div class="menu-col h-full">
		<!-- 容器区域 -->
		<div class="mt-[1.6rem] bg-[rgba(var(--el-color-white-rgb),var(--bt-main-content-opacity))] rounded-medium" :style="`height: calc(100% - ${mainHeight > 800 ? 410 : 255}px)`">
			<div class="card-title">容器列表</div>
			<div v-bt-loading="loading.con" v-bt-loading:title="`正在获取容器列表`" class="p-[1.6rem] !pt-0 overflow-y-auto" style="height: calc(100% - 50px)">
				<div class="card-item con-item w-full !rounded-0" v-for="con in conList" :key="con.ID">
					<div class="flex flex-col w-full">
						<div class="flex items-center w-full">
							<div class="flex items-center" style="width: calc(100% - 160px)" :title="con.Name">
								<span class="inline-block truncate leading-normal cursor-pointer" style="max-width: calc(100% - 60px)" @click="openContainerDetailView({ ...con, id: con.ID, name: con.Name })">{{ con.Name }}</span>
								<el-dropdown placement="bottom" @command="setStatusEvent($event, con)">
									<el-tag :type="composeStatusObject(con.State).type" class="status-tag w-[5rem] text-center ml-[.5rem]" title="">{{ composeStatusObject(con.State).text }}</el-tag>
									<template #dropdown>
										<el-dropdown-menu>
											<el-dropdown-item v-for="action in statusAction(con.State)" :key="action.command" :command="action.command">{{ action.text }}</el-dropdown-item>
										</el-dropdown-menu>
									</template>
								</el-dropdown>
							</div>
							<div class="flex items-center ml-[2rem]">
								<el-tooltip effect="dark" content="容器终端" placement="top" :open-delay="500">
									<el-button @click="terminalEvent({ id: con.ID, status: con.State })"
										><div class="flex items-center"><span class="fileTerminal-icon"></span>终端</div></el-button
									>
								</el-tooltip>
								<el-tooltip effect="dark" content="容器日志" placement="top" :open-delay="500">
									<el-button type="default" @click="getConLog(con)" class="ml-[1rem]"
										><div class="flex items-center"><span class="record-icon"></span>日志</div></el-button
									>
								</el-tooltip>
							</div>
						</div>
						<div class="text-disabled w-[40%] truncate mt-[-.4rem]" :title="con.ID">
							{{ con.ID }}
						</div>
					</div>
					<div class="flex items-center justify-between mt-[1.2rem]" :class="con.port.length > 0 ? 'mt-[1.6rem]' : ''">
						<div class="flex flex-wrap content-center gap-[1rem]" style="grid-template-columns: repeat(2, auto)">
							<el-popover v-for="port in con.port" :key="port" :disabled="!port.startsWith('0.0.0.0:')" trigger="hover" placement="bottom" width="12.5rem" popper-class="!min-w-[12.5rem]">
								<template #reference>
									<el-tag
										type="info"
										:class="{
											'cursor-pointer': port.startsWith('0.0.0.0:'),
										}"
										@click="jumpToUrl(port, 'http')"
										>{{ port }}</el-tag
									>
								</template>
								<div class="-m-[12px]">
									<div class="px-[16px] py-[8px] cursor-pointer text-center hover:bg-light" @click="jumpToUrl(port, 'http')">HTTP协议访问</div>
									<div class="px-[16px] py-[8px] cursor-pointer text-center hover:bg-light" @click="jumpToUrl(port, 'https')">HTTPS协议访问</div>
								</div>
							</el-popover>
						</div>
					</div>
				</div>
				<el-empty v-if="conList.length === 0 && !loading.con" style="height: calc(100% - 50px)" description="暂无容器"></el-empty>
			</div>
		</div>

		<!-- 编排日志区域 -->
		<div class="mt-[1.6rem] bg-[rgba(var(--el-color-white-rgb),var(--bt-main-content-opacity))] rounded-medium">
			<div class="card-title">编排日志</div>
			<div class="card-item !p-[.8rem] h-full" :style="{ height: mainHeight > 800 ? `33rem` : `18rem` }" v-bt-loading="loading.log" v-bt-loading:title="`正在获取编排日志`">
				<bt-log
					:title="`全屏查看-编排日志`"
					:content="logContent"
					:isHtml="true"
					:fullScreen="{
						title: `全屏查看-编排日志`,
						onRefresh: getLogInfo,
					}"
					class="h-full font-[PingFang SC]"></bt-log>
			</div>
		</div>

		<bt-dialog :title="containerLogTitle" :area="[60, 40]" v-model="containerLogView" :append-to-body="true">
			<bt-log :title="`全屏查看-日志`" :content="containerLog" :isHtml="true" :isRefreshBtn="false" class="h-[40rem] font-[PingFang SC]"></bt-log>
			<!-- <bt-log :content="containerLog" /> -->
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { getDockerStore } from '@docker/useStore'
import { useGlobalStore } from '@/store/global'
import { terminalEvent, openContainerDetailView } from '@docker/useMethods'
import { restartCompose, jumpToUrl } from '@docker/views/orchestration/useController'
import { containerLogTitle, containerLogView, containerLog, conList, logContent, loading, composeStatusObject, statusAction, getConInfo, getLogInfo, getConLog, commandEvent, setStatusEvent, unmountHandle } from './useController'

const { mainHeight } = useGlobalStore()

const {
	refs: { orchestrationData },
} = getDockerStore()

const compose = computed(() => orchestrationData.value.currentCompose)

watch(
	() => compose.value.path,
	() => {
		getConInfo()
		getLogInfo()
	}
)

watch(
	() => orchestrationData.value.refreshItem,
	(val: boolean) => {
		getConInfo()
		getLogInfo()
	}
)

watch(
	() => restartCompose.value,
	val => {
		if (val) {
			restartCompose.value = false
			commandEvent('start', false)
		}
	}
)

onUnmounted(() => {
	unmountHandle()
})
</script>

<style lang="css" scoped>
/* $iconsPath: '/static/images/file'; */

.card-item {
	@apply rounded-medium border-lighter relative py-[1.6rem] border-b;
}
.card-item.con-item:not(:first-child) {
	@apply border-t border-b-0 mt-[-.1rem];
}
:deep(.el-dropdown .el-dropdown__caret-button) {
	@apply h-[30px];
	margin-left: -0.1rem !important;
}
.span-btn {
	@apply rounded-round border-dark border w-[3rem] h-[3rem] p-[2rem] cursor-pointer flex items-center justify-center inline-block;
}
.span-btn:hover {
	@apply bg-[var(--el-color-success-light-9)] text-primary border-[var(--el-color-success-light-7)];
}

.span-btn:hover.record-icon,
.span-btn:hover.fileTerminal-icon,
.fileTerminal-icon,
.record-icon {
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
}

.span-btn:hover.record-icon {
	background-image: url('/static/images/file/file-record-active.svg');
}
.span-btn:hover.fileTerminal-icon {
	background-image: url('/static/images/file/terminal-active.svg');
}
.fileTerminal-icon {
	background-image: url('/static/images/file/terminal.svg');
	@apply inline-block w-[1.5rem] h-[1.5rem] mr-[.5rem];
}
.record-icon {
	background-image: url('/static/images/file/file-record.svg');
	@apply inline-block w-[1.5rem] h-[1.5rem] mr-[.2rem];
}

:deep(.el-tag.el-tag--info.status-tag) {
	background-color: var(--el-color-text-secondary);
	color: var(--el-color-white);
}
.card-title {
	@apply w-full py-[1.2rem] px-[1.6rem] text-medium border-b border-light text-secondary;
}
</style>
