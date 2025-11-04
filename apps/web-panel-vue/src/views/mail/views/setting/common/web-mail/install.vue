<template>
	<div class="p-20px pt-24px pb-8px">
		<el-form ref="installFormRef" :model="installForm" :rules="installRules">
			<el-form-item label="域名" prop="domain">
				<div class="w-280px">
					<!-- <bt-select v-model:value="form.domain" :loading="loading" :options="domainOptions">
					</bt-select> -->
					<el-input v-model="installForm.domain"></el-input>
				</div>
			</el-form-item>
			<el-form-item label="PHP 版本" prop="php_version">
				<div class="w-280px">
					<bt-select v-model="installForm.php_version" :loading="installLoading" :options="phpOptions">
					</bt-select>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import MAIL_SETTING_WEB from '@mail/views/setting/common/web-mail/store'
import { storeToRefs } from 'pinia'
import { installInit, installOnConfirm } from '@mail/views/setting/common/web-mail/useMethod'

const { installForm, installLoading, phpOptions, installFormRef } = storeToRefs(MAIL_SETTING_WEB())
const { installRules, resetInstallForm } = MAIL_SETTING_WEB()

resetInstallForm()
installInit()

defineExpose({
	onConfirm: installOnConfirm,
})
</script>
