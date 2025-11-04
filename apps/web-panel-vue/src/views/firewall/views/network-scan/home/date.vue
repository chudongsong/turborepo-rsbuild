<template>
	<el-radio-group class="network-custom-radio" v-model="type" @change="onUpdateType">
		<el-radio-button label="今日" value="today"></el-radio-button>
		<el-radio-button label="昨日" value="yesterday"></el-radio-button>
	</el-radio-group>
	<div class="ml-8px">
		<el-date-picker v-model="time" type="daterange" :disabled-date="dateDisabled" @change="onUpdateTime">
		</el-date-picker>
	</div>
</template>

<script lang="ts" setup>
import { addDays, startOfDay, endOfDay } from '@/views/mail/views/market/useMethod'

const type = defineModel<string>('type')

const time = defineModel<[number, number]>('value', {
	default: () => [],
})

// 获取时间
function getTimeData(date = new Date()): [number, number] {
	const start = startOfDay(date)
	const end = endOfDay(date)
	return [start.getTime(), end.getTime()]
}

const onUpdateType = (val: string | number | boolean | undefined) => {
	switch (val) {
		case 'today':
			time.value = getTimeData()
			break
		case 'yesterday':
			time.value = getTimeData(addDays(new Date(), -1))
			break
	}
}

const dateDisabled = (ts: number) => {
	const today = new Date()
	const before = addDays(today, -30)
	return startOfDay(before).getTime() > ts || endOfDay(today).getTime() < ts
}

const onUpdateTime = (val: [number, number]) => {
	type.value = 'custom'
	time.value = [startOfDay(val[0]).getTime(), endOfDay(val[1]).getTime()]
}
</script>
<style scoped>
:deep(.network-custom-radio .el-radio-button__inner){
	padding: 8px 15px;
}
</style>
