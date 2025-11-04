<template>
	<div class="flex items-center">
		<div class="w-100px">
			<bt-select v-model="form.cycle" :options="cycleOptions"></bt-select>
		</div>
		<div v-show="form.cycle === 'week'" class="w-120px ml-16px">
			<bt-select v-model="form.week" :options="weekOptions"></bt-select>
		</div>
		<div>
			<el-input v-model="form.hour" class="ml-16px !w-140px" type="number" :min="0" :max="23" :controls="false"
				@input="validateHour">
				<template #append>小时</template>
			</el-input>
		</div>
		<div>
			<el-input v-model="form.minute" class="ml-16px !w-140px" type="number" :min="0" :max="59" :controls="false"
				@input="validateMinute">
				<template #append>分钟</template>
			</el-input>
		</div>
	</div>
</template>

<script lang="ts" setup>
import MAIL_BACKUP_PLAN from '@mail/views/setting/backup/backup-plan/store'
import { validateHour, validateMinute } from './useMethod'

const { weekOptions, cycleOptions } = MAIL_BACKUP_PLAN()

const form = defineModel<{
	cycle: string
	week: string
	hour: number
	minute: number
}>('value', {
	default: () => ({
		cycle: 'week',
		week: '1',
		hour: 1,
		minute: 30,
	}),
})
</script>
