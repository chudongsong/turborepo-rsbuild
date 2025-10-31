<template>
	<div class="w-full h-full">
		<!-- 搜索，搜索值 -->
		<Search />

		<!-- 提示 -->
		<el-alert :show-icon="false" :closable="false" class="!mb-20px">
			<template #title>
				<div class="leading-[2.5rem] flex items-center text-[var(--el-base-supplement)] text-base">
					宝塔一键部署已上线，诚邀全球优秀项目入驻(限项目官方)
					<el-button title="免费入驻" size="small" type="primary" class="!ml-[.5rem]" @click="jumpPathEvent('https://www.bt.cn/bbs/thread-33063-1-1.html')"> 免费入驻 </el-button>
					<el-button title="导入项目" type="primary" size="small" class="!ml-[.5rem]" @click="importProjectEvent()"> 导入项目 </el-button>
				</div>
			</template>
		</el-alert>

		<!-- 应用分类 -->
		<div class="w-full flex items-center mb-[20px] mt-[16px]">
			<span class="w-[80px] pr-16px text-base flex justify-end mt-4px">应用分类</span>
			<div class="flex w-full justify-between">
				<div class="flex flex-1 relative flex-wrap">
					<div v-for="item in typeList" :key="item.tid" class="class-item mt-4px" :class="tabDeployActive === item.tid ? 'on' : ''" @click="toggleClassEvent(item.tid)">
						{{ item.title }}
					</div>
				</div>
				<el-select v-model="projectType" class="mr-[6px] !w-[16rem]" :class="{ 'custom-types-bg-green': projectType !== 'all' }" @change="onChangeProjectType">
					<el-option v-for="item in projectTypeOptions" :label="`${projectType !== 'all' ? '已选：' : ''}${item.label}`" :value="item.value" :key="item.value">
						{{ item.label }}
					</el-option>
				</el-select>
			</div>
		</div>

		<!-- 应用表格 -->
		<bt-table-group>
			<template #content>
				<bt-table
					ref="deployTableListRef"
					class="soft-table mt-1rem"
					:class="{ 'other-soft-table': tabDeployActive == 100 }"
					:column="TableColumn"
					:max-height="mainHeight"
					:data="deployShowTableList"
					v-bt-loading="isLoading"
					:description="'列表为空'"
					v-bt-loading:title="'正在获取软件列表，请稍候...'">
				</bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch v-if="tabDeployActive == 100" :table-ref="deployTableListRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="tablePageConfig.page" v-model:row="tablePageConfig.row" :total="tablePageConfig.total" :rowList="[10, 15, 20, 30, 50, 100]" @change="pageChangeEvent" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@store/global'
import SOFT_DEPLOY_STORE from './store'
import { SOFT_STORE } from '@soft/store'

import Search from '@soft/public/search/index.vue'

import { jumpPathEvent } from '@/views/soft/useMethod'
import { storeToRefs } from 'pinia'

const { mainHeight } = useGlobalStore()
const { tabDeployActive, isLoading } = storeToRefs(SOFT_STORE())

const store = SOFT_DEPLOY_STORE()
const { TableBatchOptions, projectTypeOptions, pageChangeEvent, importProjectEvent, toggleClassEvent, onChangeProjectType, refreshDeployList } = store
const { typeList, projectType, TableColumn, deployShowTableList, deployTableListRef, tablePageConfig } = storeToRefs(store)

onMounted(refreshDeployList)
onUnmounted(store.$reset)
</script>

<style lang="css" scoped>
:deep(.el-alert--info.is-light) {
	@apply border;
	background-color: rgba(var(--el-base-supplement-rgb), 0.1);
	border-color: ;
}
.deploy-tabs {
	@apply mb-[10px] mt-[2rem];
}
.deploy-tabs :deep(.el-tabs__content) {
	display: none;
}
.deploy-tabs :deep(.el-tabs__active-bar) {
	padding: 0 32px !important;
	margin-left: -18px;
}
.deploy-tabs :deep(.el-tabs__item) {
	padding: 0 20px !important;
	font-size: var(--el-font-size-base);
}
.deploy-tabs :deep(.el-tabs__item.is-active) {
	color: var(--el-color-primary) !important;
	font-weight: 600;
}

/* // 应用分类 */
.class-item {
	@apply mr-[16px] px-[20px] h-[30px] leading-[30px] text-small cursor-pointer bg-darker rounded-large;
}
.class-item.on {
	@apply bg-primary text-white;
}
.other-soft-table :deep(.el-table__row) {
	height: 44.5px;
}
</style>
