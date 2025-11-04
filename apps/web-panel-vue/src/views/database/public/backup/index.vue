<template>
	<div class="p-[20px] h-full">
		<bt-tabs type="card" v-model="tabActive" class="bt-tabs bt-tabs-card">
			<el-tab-pane name="routeBackup" label="常规备份" :lazy="true">
				<RouteBack :compData="compData.row"></RouteBack>
			</el-tab-pane>

			<el-tab-pane name="increment" class="mt-4" v-if="tab == 'mysql'" :lazy="true">
				<template #label>
					<span class="flex items-center">
						<i class="mr-[4px] svgtofont-icon-ltd text-large text-[#9B7E48]"></i>
						<span>增量备份</span>
					</span>
				</template>
				<IncrementBackup :compData="compData.row" :isRowBackup="true"></IncrementBackup>
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>
<script lang="tsx" setup>
import { getDatabaseStore } from '@database/useStore'

import IncrementBackup from './increment-back/index.vue'
import RouteBack from './route-back.vue'

interface Props {
	compData: {
		row: any
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		row: {},
	}),
})

const {
	refs: { tabActive: tab },
} = getDatabaseStore()

const emit = defineEmits(['close'])

const tabActive = ref('routeBackup') // tab默认选中

onMounted(() => {})
</script>
