<template>
	<div class="p-20px pt-24px pb-8px">
		<el-form ref="configFormRef" :model="configForm" :rules="configRules">
			<el-form-item label="网站" prop="domain">
				<div class="w-280px">
					<bt-select v-model="configForm.domain" :loading="configLoading" :options="domainOptions"
						@change="onUpdateDomain"> </bt-select>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import MAIL_SETTING_WEB from '@mail/views/setting/common/web-mail/store'
import { storeToRefs } from 'pinia'
import { onUpdateDomain, configInit, configOnConfirm } from '@mail/views/setting/common/web-mail/useMethod'

const { configForm, configFormRef, configLoading, domainOptions } = storeToRefs(MAIL_SETTING_WEB())
const { configRules, resetConfigForm } = MAIL_SETTING_WEB()

resetConfigForm()
configInit()

defineExpose({
	onConfirm: configOnConfirm,
})
</script>
