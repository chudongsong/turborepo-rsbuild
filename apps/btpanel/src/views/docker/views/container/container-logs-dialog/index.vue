<template>
	<div class="container-log-dialog h-full" v-bt-loading="loading">
		<bt-tabs position="left" type="left-bg-card" v-model="activeTab" class="!h-[64.7rem] tab-switch">
			<el-tab-pane v-for="item in tableShow" :key="item.id" :label="item.name" :name="item.id" lazy>
				<template #label>
					<span class="flex items-center truncate" :title="item.name">
						<span class="truncate w-[5rem]">{{ item.name }}</span>
						<span class="flex-1">{{ `(${getByteUnit(item.size)})` }}</span>
					</span>
				</template>
				<ConLog v-if="activeTab === item.id" :compData="item" />
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>
<script setup lang="ts">
import { getByteUnit } from '@utils/index'
import { 
	getAllLog,
	activeTab,
	tableShow,
	loading,
	unMountHandle,
 } from './useController'

import ConLog from './con-log.vue'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const popupClose = inject('popupClose',() => {})


onMounted(async () => {
	await getAllLog(props.compData,popupClose)
})

onUnmounted(() => {
	unMountHandle()
})
</script>
<style lang="css" scoped>
.container-log-dialog {
	@apply flex flex-col lib-box max-h-[70rem];
}
:deep(.el-tabs__header.is-left) {
	width: 168px;
}

:deep(.el-tabs__nav-wrap.is-left) {
	width: 168px !important;
}

:deep(.el-tabs.tabs-left-bg-card .is-left.el-tabs__nav) {
	width: 168px !important;
}
</style>
