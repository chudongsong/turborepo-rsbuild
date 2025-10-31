<template>
	<div ref="testRef">
		<!-- 搜素 -->
		<div class="flex flex-1 relative items-center mb-20px">
			<span class="w-[80px] pr-16px text-base flex justify-end flex-shrink-0">应用搜索</span>
			<bt-input-icon class="!w-[52rem]" ref="searchRef" icon="el-search" v-model="appParams.query" clearable @clear="refreshList(false)" @icon-click="refreshList(false)" placeholder="支持应用名称、字段模糊搜索" @keyup.enter.native="refreshList(false)"> </bt-input-icon>
			<!-- 需求反馈 -->
			<span class="text-small text-secondary leading-[2rem] mx-[2rem] flex items-center">
				如果您希望添加其它Docker应用，请
				<span class="bt-link" @click="onlineServiceDialog()">联系客服</span>
				,或进行
				<span class="bt-link" @click="NPSDialog()">需求反馈</span>
				<bt-link href="https://www.bt.cn/bbs/thread-137717-1-1.html" class="ml-4px">>>使用帮助</bt-link>
			</span>
		</div>

		<!-- 应用分类 -->
		<div class="w-full flex items-center">
			<span class="w-[80px] pr-16px text-base flex justify-end">应用分类</span>
			<div class="class-item" :class="{ on: deployMenuData.app_type === 'all' }" @click="handleClickType('all')">全部</div>
			<div class="class-item flex-shrink-0" :class="{ on: deployMenuData.app_type === 'installed' }" @click="handleClickInstalled">已安装</div>

			<div class="flex flex-1 relative flex-wrap">
				<div v-for="(item, index) in typeList?.slice(0, typeNum())" :key="index" @click="handleClickType(item.type)" class="class-item" :class="deployMenuData.app_type === item.type ? 'on' : ''">
					{{ item.desc }}
				</div>

				<el-dropdown :show-timeout="200" @command="handleClickType" v-if="splitArr?.length">
					<el-button
						type="default"
						class="AppClassButton"
						:class="{
							on: splitArr.some((item: any) => item.type === deployMenuData.app_type),
						}">
						更多
						<span v-show="installedType">（{{ installedType }}）</span>
						<i class="svgtofont-el-arrow-down ml-[.5rem]"></i>
					</el-button>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item v-for="(item, index) in splitArr" :key="index" :command="item.type">
								{{ item.desc }}
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>

			<el-button v-show="deployMenuData.app_type !== 'installed' && deployMenuData.app_type !== 'AppHub'" title="更新列表" class="refresh !mr-[1.2rem]" @click="refreshList(true)"> 更新应用列表 </el-button>
			<template v-if="deployMenuData.app_type === 'AppHub'">
				<el-tooltip content="支持从Git仓库或本地文件导入应用，自动扫描并识别多个应用，支持选择性导入和批量导入" placement="top">
					<template #content>
						<div class="flex flex-col pb-[4px]">
							<div>支持从Git仓库或本地文件导入应用</div>
							<div>自动扫描并识别多个应用</div>
							<div>支持选择性导入和批量导入</div>
						</div>
					</template>
					<template #default>
						<span class="bt-ico-ask">?</span>
					</template>
				</el-tooltip>
				<el-button type="primary" title="导入应用" class="refresh !mr-[1.2rem] ml-[1rem]" @click="importAppHandle()"> 导入应用 </el-button>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { NPSDialog } from '@docker/useMethods' // 弹窗方法
import { onlineServiceDialog } from '@/public/popup'
import { getDockerAppStore } from '@docker/views/app-store/useStore'
// import { getPageTotal } from '@utils/index'
import { appParams } from '@docker/views/app-store/useController'
import { useGlobalStore } from '@store/global'
import { unmountedHandle, handleClickInstalled, handleClickType, typeList, installedType, typeNum, splitArr, refreshList, getTypeList, importAppHandle } from './useController'

const {
	refs: { deployMenuData },
} = getDockerAppStore()

const { mainWidth } = useGlobalStore()

// 监听屏幕变化
watch(
	() => mainWidth.value,
	() => {
		splitArr.value = typeList.value.slice(typeNum(), typeList.value?.length)
		installedType.value = splitArr.value?.find((item: any) => item.type === deployMenuData.value.app_type)?.desc || ''
	}
)

onMounted(getTypeList)

const testRef = ref()

onUnmounted(unmountedHandle)

defineExpose({
	testRef,
})
</script>

<style lang="css" scoped>
/* // 应用分类 */
.class-item {
	@apply mr-[8px] px-[10px] h-[30px] leading-[30px] text-small cursor-pointer bg-darker rounded-large my-8px w-[8rem];
	@apply flex items-center justify-center;
}
.class-item.on {
	@apply bg-primary text-white;
}

.soft-item {
	@apply flex py-[6px] px-[8px] cursor-pointer items-center mr-[8px] rounded-small text-small;
}
.soft-item:hover {
	@apply bg-light;
	transition: background-color 0.3s;
}
.icon-img {
	@apply w-[22px] h-auto mr-[.5rem];
}
.AppClassButton {
	@apply h-[30px] text-small text-center bg-darker rounded-large mr-[1.2rem] my-8px;
}
.AppClassButton:hover {
	@apply bg-darker border-light text-secondary;
}
.AppClassButton.on {
	@apply bg-primary text-white;
}
</style>
