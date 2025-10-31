<template>
	<div class="p-20px">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openAddEventView()">创建触发事件</el-button>
			</template>
			<template #content>
				<bt-table max-height="460" :column="tableColumns" :data="eventData" v-bt-loading="eventLoad" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { openAddEventView, getTaskEventList, $reset, tableColumns, eventData, eventLoad } from './useController'
onMounted(getTaskEventList)
onUnmounted($reset)
</script>
