<template>
	<el-card class="mb-16px" shadow="never">
		<template #header>
			<div class="card-header">
				<span>备份计划</span>
			</div>
		</template>
		<div class="p-20px">
			<el-form :model="form">
				<el-form-item label="邮件备份">
					<el-switch v-model="form.open" @change="onUpdateOpen"></el-switch>
				</el-form-item>
				<el-form-item label="执行周期">
					<div class="flex-1">
						<period v-model:value="form" />
					</div>
				</el-form-item>
				<div class="flex items-center">
					<el-form-item label="备份到">
						<div class="w-140px">
							<bt-select v-model="form.backupTo" :options="toOptions"></bt-select>
						</div>
					</el-form-item>
					<el-form-item label="保留最新" label-width="auto">
						<el-input v-model="form.save" class="!w-140px" type="number" :min="1" :controls="false"
							@input="validateSaveCount">
							<template #append>份</template>
						</el-input>
					</el-form-item>
				</div>
				<el-form-item label=" " :show-feedback="false">
					<el-button type="primary" @click="onSave">保存</el-button>
				</el-form-item>
			</el-form>
		</div>
	</el-card>
</template>

<script lang="ts" setup>
import Period from './period.vue'
import MAIL_BACKUP_PLAN from '@mail/views/setting/backup/backup-plan/store'
import { storeToRefs } from 'pinia'
import { initForm, getToOptions, onSave, onUpdateOpen, validateSaveCount } from '@mail/views/setting/backup/backup-plan/useMethod'

const { form, toOptions } = storeToRefs(MAIL_BACKUP_PLAN())
const { reset } = MAIL_BACKUP_PLAN()

initForm()
getToOptions()

onUnmounted(() => {
	reset()
})
</script>
