<template>
	<div class="flex items-start w-full">
		<!-- 左侧菜单栏 -->
		<div :class="'flex flex-col mr-[16px]'" :style="`width:${width}rem;`">
			<!-- 搜索框 -->
			<bt-input-search v-if="logsType == 'crontab'" class="mb-[8px] !w-[24rem]" v-model="searchValue" @search="getMenuData" placeholder="请输入日志名称" />

			<!-- 主体菜单 -->
			<div class="menu" v-if="menuOptions.length > 0" :style="`height:${preHeight - (logsType == 'crontab' ? 56 : -5)}px;min-height:400px`">
				<span v-for="(item, index) in menuOptions" @click="emit('tab-click', item)" :tabindex="index" :key="index" :style="`width:${width}rem`" :class="`menu-hover ${String(item[tabProps]) === selectedItem ? 'activeClass' : ''}`">
					{{ item.tabProps }}
					{{ item.name }}
				</span>
			</div>

			<!-- 没有数据的情况 -->
			<span v-else class="menu p-[20px] bg-[#f1f1f120]">
				<el-empty>
					<template #image>
						<i class="svgtofont-empty !text-[4.8rem] text-#999"></i>
					</template>
					<template #description>暂无数据</template>
				</el-empty>
			</span>
		</div>

		<!-- 右侧内容栏 -->
		<!-- 传入插槽 -->
		<slot name="LogView">
			<!-- 默认内容 -->
			<div class="flex-1">
				<div class="log-view">
					<div class="flex items-center">
						<!-- 左侧顶部插槽 -->
						<slot name="LogLeft"></slot>
						<div class="flex items-center" @click="desiredNpsDialog()">
							<i class="svgtofont-desired text-medium"></i>
							<span class="bt-link">需求反馈</span>
						</div>
					</div>
					<slot name="LogRight"></slot>
				</div>
				<!-- 主体内容 -->

				<bt-log
					class="w-full flex-1"
					:content="logContent"
					:isHtml="true"
					:autoScroll="true"
					:fullScreen="{
						title: '全屏查看-日志',
						onRefresh: () => {
							refreshValue(menuOptions, logsType)
						},
					}"
					:style="'height:' + preHeight + 'px;min-height:400px'" />
			</div>
		</slot>
	</div>
</template>

<script setup lang="ts">
import { LOG_STORE } from '@/views/logs/useStore'
import { getMenuData } from '@logs/views/panel-log/useController'
import { useGlobalStore } from '@store/global'
import { storeToRefs } from 'pinia'
import { desiredNpsDialog } from '@logs/useController'
import { refreshValue } from '@logs/useController'

interface Props {
	menuOptions: MenuOptions[] // 菜单选项
	logsType: string // 日志类型
	width?: number | string
	height?: number | string
	logContent?: string
}

interface MenuOptions {
	name: string
	id?: string | number
	[x: string]: any
}

const { mainHeight } = useGlobalStore() // 获取全局高度

const props = withDefaults(defineProps<Props>(), {
	menuOptions: () => [],
	logsType: 'pre',
	width: '24',
	height: '68',
	logContent: '',
})

const emit = defineEmits(['tab-click', 'search']) // 声明组件emit事件

const store = LOG_STORE()
const { searchValue, selectedItem } = storeToRefs(store)

const preHeight = computed(() => {
	if (props.logsType === 'Mysql') return mainHeight.value - 300
	if (props.logsType === 'crontab') return mainHeight.value - 248
	return mainHeight.value - 188
}) // 预览高度

const tabProps = computed(() => {
	return props.logsType === 'crontab' ? 'id' : 'name'
}) // tab选项的key

// 初始化默认选中第一个
watch(
	() => props.menuOptions[0],
	val => {
		val && (selectedItem.value = String(val[tabProps.value]))
	},
	{ once: true }
)
</script>

<style lang="css" scoped>
.menu-hover {
	@apply inline-block cursor-pointer px-[12px] py-[8px] border border-lighter border-r-0 border-l-0 border-t-0 text-small;
	text-overflow: ellipsis;
	transition: all 0.3s;
	word-break: break-all;
}

.menu-hover:last-child {
	@apply border-b-0;
}

.menu-hover:hover {
	@apply bg-light;
}

.menu-hover:focus {
	@apply bg-darker text-primary;
}

.activeClass {
	@apply bg-darker text-primary;
}

.menu {
	@apply w-full h-full float-left flex flex-col overflow-hidden overflow-y-auto;
	@apply border border-lighter;
}

.log-view {
	@apply flex items-center mb-[16px] justify-between flex-1 flex-wrap;
}
</style>
