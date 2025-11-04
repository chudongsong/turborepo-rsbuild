<template>
	<div class="w-full h-full">
		<!-- 搜索，搜索值 -->
		<Search />

		<!-- 最近使用 -->
		<Recently />

		<!-- 安全提醒 -->
		<el-alert type="error" :show-icon="false" :closable="false">
			<template #title>
				<div class="leading-[2.5rem] flex items-center text-danger">
					安全提醒：第三方插件上架前，宝塔官方进行了安全审计，但可能还存在安全风险，在生产环境使用前请自行甄别
					<div class="flex items-center">
						<el-button type="primary" title="免费入驻" size="small" class="!ml-[.5rem]" @click="jumpPathEvent('https://www.bt.cn/developer/')">免费入驻</el-button>
						<el-button type="primary" title="获取第三方应用" size="small" class="!ml-[.5rem]" @click="jumpPathEvent('https://www.bt.cn/bbs/forum-40-1.html')">获取第三方应用</el-button>
						<el-button title="导入插件" size="small" class="!ml-[.5rem]" @click="importOtherEvent" type="primary"> 导入插件 </el-button>
						<!-- <SoftUpload class="!ml-[.5rem]"></SoftUpload> -->
					</div>
				</div>
			</template>
		</el-alert>

		<!-- 应用表格 -->
		<bt-table-group>
			<template #content>
				<bt-table class="soft-table" :column="TableColumn" :min-height="mainHeight" :data="softTableList" v-bt-loading="isLoading" :description="'列表为空'" v-bt-loading:title="'正在获取软件列表，请稍候...'"> </bt-table>
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="tablePageConfig.page" v-model:row="tablePageConfig.row" :total="tablePageConfig.total" :rowList="[10, 15, 20, 30, 50, 100]" @change="pageChangeEvent" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@store/global'
import { SOFT_STORE } from '@soft/store'
import Search from '@soft/public/search/index.vue'
import Recently from '@soft/public/recently/index.vue'
import SOFT_OTHER_STORE from './store'

import { jumpPathEvent } from '@/views/soft/useMethod'
import { storeToRefs } from 'pinia'

const { mainHeight, isRefreshSoftList } = useGlobalStore()
const { isLoading } = storeToRefs(SOFT_STORE())

const store = SOFT_OTHER_STORE()
const { refreshList, importOtherEvent, pageChangeEvent } = store
const { softTableList, tablePageConfig, TableColumn } = storeToRefs(store)

watch(
	() => isRefreshSoftList.value,
	val => {
		if (val) {
			refreshList('0')
			isRefreshSoftList.value = false
		}
	}
)

onMounted(() => refreshList('0'))
onUnmounted(store.$reset)
</script>
