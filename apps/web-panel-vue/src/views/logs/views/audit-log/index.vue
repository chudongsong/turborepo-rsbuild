<template>
	<div>
		<!-- v-if="payment.authType === 'ltd'" -->
		<LogList logsType="audit" :menuOptions="menuOptions" :width="36" @tab-click="handleClickTab">
			<template #LogView>
				<div class="flex-1" :style="'width:' + (mainWidth - 500) + 'px'">
					<bt-table-group class="table-view">
						<template #header-left>
							<div class="flex items-center" @click="npsSurveyV2Dialog({ name: '日志', id: 999, isCard: false })">
								<i class="svgtofont-desired text-medium"></i>
								<span class="bt-link">需求反馈</span>
							</div>
						</template>

						<template #header-right>
							<BtSearch :placeholder="placeholder" class="!w-24rem"></BtSearch>
							<BtRefresh class="ml-[10px]"></BtRefresh>
						</template>

						<template #content>
							<BtTable v-if="tableView" class="my-8px" />
						</template>

						<template #footer-right>
							<BtPage v-if="tableView" type="unknown"></BtPage>
						</template>
					</bt-table-group>

					<!-- 黑屏日志类型 -->
					<BtLog v-if="!tableView" :content="logsMsg" :isHtml="true" :autoScroll="true" :style="'height:' + (mainHeight - 172) + 'px;min-height:400px'" />
				</div>
			</template>
		</LogList>

		<!-- 付费引导 -->
		<!-- <bt-product-introduce v-else :data="productData" class="px-[20%] my-[2rem]"></bt-product-introduce> -->
	</div>
</template>

<script setup lang="tsx">
import { useAllTable, useRefreshList, useTable } from '@/hooks/tools'
import { useGlobalStore } from '@store/global'
// import BtProductIntroduce from '@views/public/bt-product-introduce/index.vue'
import LogList from '@views/logs/public/log-list/index.vue'
import { handleClickTab, logsMsg, menuOptions, placeholder, productData, renderLogData, tableColumn, tableView } from './useController'
import { useAuditLogStore } from './useStore'
import { npsSurveyV2Dialog } from '@/public/index'

const { payment, mainHeight, mainWidth } = useGlobalStore()
const { currentItem, isInit, isRefreshList } = useAuditLogStore()

// 基础表格，仅包含表格组件，其他参数所有表格均会返回。
const { BtTable, BtPage, BtSearch, BtRefresh, refresh } = useAllTable({
	request: async data => {
		return await renderLogData(currentItem.value, data)
	},
	columns: tableColumn,
	extension: [useRefreshList(isRefreshList)],
})

// watch(
// 	() => payment.value.authType,
// 	val => {
// 		if (val === 'ltd')
// 	}
// )

onMounted(async () => {
	// refresh()
	// console.log(payment.value.authType, 'payment.value.authType')
	isInit.value = true
})
</script>

<style scoped lang="css">
.table-view :deep(.content) {
	padding: 4px 0 !important;
}
</style>
