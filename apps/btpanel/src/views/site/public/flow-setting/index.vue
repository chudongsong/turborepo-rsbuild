<template>
	<bt-tabs type="card" v-model="tabActive">
		<el-tab-pane label="流量限制" name="flowLimit">
			<FlowLimit />
		</el-tab-pane>
		<el-tab-pane label="流量限额" name="flowQuota" :lazy="true">
			<FlowQuota />
		</el-tab-pane>
	</bt-tabs>
</template>

<script setup lang="tsx">
import { useSiteStore } from '@site/useStore'
import FlowLimit from './flow-limit/index.vue'
import FlowQuota from './flow-quota/index.vue'
import { checkPluginStatus } from './useController'

const { siteInfo } = useSiteStore()

const tabActive = ref(siteInfo.value?.tabName || 'flowLimit') // 当前激活的tab

onMounted(() => {
	checkPluginStatus()
})
</script>
