<template>
	<BtTabs />
</template>

<script setup lang="ts">
import { useTabs } from '@/hooks/tools'
import AlarmList from './alarm-list/index.vue'
import AlarmSet from './alarm-set/index.vue'
import AlarmLog from './alarm-log/index.vue'

const { BtTabs } = useTabs({
	type: 'card',
	options: [
		{
			label: '告警列表',
			name: 'list',
			lazy: true,
			render: AlarmList,
		},
		{
			label: '告警设置',
			name: 'set',
			lazy: true,
			render: AlarmSet,
		},
		{
			label: '告警日志',
			name: 'log',
			lazy: true,
			render: AlarmLog,
		},
	],
})
</script>

<style scoped></style>
