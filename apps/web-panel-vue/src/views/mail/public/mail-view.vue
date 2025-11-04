<template>
	<div class="h-[68rem] overflow-y-auto">
		<div class="mail-head">
			<div class="mail-title">Theme: {{ row.subject }}</div>
			<div class="mail-desc">Sender: {{ row.from }}</div>
			<div class="mail-desc">Time: {{ formatTime(row.time) }}</div>
			<div class="mail-desc">Recipient: {{ row.to }}</div>
		</div>
		<div class="mail-body" v-html="html"></div>
	</div>
</template>

<script lang="ts" setup>
import { formatTime } from '@/utils'
import { Email } from '@mail/types'

interface PropsData {
	row: Email
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const { row } = props.compData

const html = computed(() => {
	return row.html || row.body
})
</script>

<style lang="css" scoped>
.mail-head {
	width: 100%;
	background: var(--el-fill-color-dark);
	border-bottom: 1px solid var(--el-color-border-dark-tertiaryer);
	padding: 16px 40px;
}

.mail-title {
	padding-bottom: 8px;
	border-bottom: 1px solid var(--el-base-tertiary);
	color: var(--el-color-text-primary);
	font-size: 16px;
	font-weight: 600;
}

.mail-desc {
	line-height: 20px;
	margin-top: 4px;
	color: var(--el-color-text-tertiary);
}

.mail-body {
	padding: 32px 40px;
	line-height: 24px;
	font-size: 13px;
}
</style>
