<template>
	<div v-if="authType !== 'free'">
		<el-alert type="warning" class="!mb-[1.2rem] !p-[1.2rem]" :closable="false" show-icon>
			<template v-slot:title>
				<span class="text-base">
					<span>提示：请先在宝塔官网->SSL模块->自动同步中创建同步任务，请不要泄露同步任务的密钥</span>
				</span>
			</template>
		</el-alert>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<bt-btn-group :options="tableBtnGroup" />
					<CustomerPopover :placement="'right'">
						<div class="flex ml-[12px] items-center">
							<bt-image :src="`/static/icons/we-com.svg`" class="mx-[4px] w-[1.5rem] h-[1.5rem]" :all="true" />
							<span class="bt-link">售前客服</span>
						</div>
					</CustomerPopover>
					<bt-link class="ml-[12px]" @click="openNps">
						<div class="flex items-center">
							<span class="svgtofont-desired text-medium"></span>
							<span>需求反馈</span>
						</div>
					</bt-link>
					<bt-link class="ml-[12px]" @click="openUseExplain">
						<div class="flex items-center">
							<span class="text-small">>></span>
							<span>使用说明</span>
						</div>
					</bt-link>
				</div>
			</template>
			<template #header-right>
				<div class="flex items-center">
					<BtSearch type="ssl-deploy" placeholder="请输入名称/域名" class="!w-[270px] mr-[10px]" />
					<BtColumn />
				</div>
			</template>
			<template #content>
				<BtTable :min-height="mainHeight" />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
		</bt-table-group>
	</div>
	<div v-else>
		<Install />
	</div>
</template>

<script lang="ts" setup>
import Install from './install/index.vue'
import CustomerPopover from '@site/public/ssl-arrange/business-cert/customer-popover.vue'

import { openNps } from '@ssl/views/certificate-manger/useMethod'
import { batchCertificateOptions, openUseExplain, tableBtnGroup, tableColumns, tableRequestData } from './useMethod'
import { useAllTable, useBatch, useRecommendSearch, useRefreshList } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { useDeployStore } from './useStore'

const { mainHeight, payment } = useGlobalStore()
const { authType } = toRefs(payment.value)
const { isRefreshDeployTaskList } = storeToRefs(useDeployStore())

/**
 * @description 批量操作
 */
const useTableBatch = useBatch(batchCertificateOptions)

const { BtTable, BtPage, BtRecommendSearch, BtColumn, BtBatch, BtSearch } = useAllTable({
	request: tableRequestData,
	columns: tableColumns,
	extension: [
		useRefreshList(isRefreshDeployTaskList),
		useTableBatch,
		useRecommendSearch('search', {
			name: 'ssl',
			key: 'get_deploy_list',
			list: [],
			showRecommend: false,
		}),
	],
})
</script>

<style scoped></style>
