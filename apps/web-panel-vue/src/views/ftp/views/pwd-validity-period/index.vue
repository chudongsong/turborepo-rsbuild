<template>
	<div class="container-dialog">
		<el-form ref="updateFtpInfo" :rules="rule" :model="ftpForm" :class="isTime ? 'btCustomForm' : 'btCustomForm bt-custom-form1'" :style="ftpForm.status != '0' && !isTime ? 'padding-left: 1rem' : ''">
			<el-form-item label="密码有效期" :class="isTime ? 'typeClass' : ''">
				<el-date-picker ref="pickerRef" v-model="datePicker" type="date" class="date" placeholder="选择日期" value-format="YYYY-MM-DD" :disabled-date="pickerOptions.disabledDate" :shortcuts="pickerOptions.shortcuts" @change="datePickerChangeEvent"></el-date-picker>
			</el-form-item>
			<template v-if="!isTime">
				<el-form-item label="到期动作">
					<bt-radio v-model="ftpForm.status" :options="typeOptions" size="small" style="gap: 0.8rem" />
				</el-form-item>
				<el-form-item v-if="ftpForm.status !== '0'" label="告警方式" prop="channel">
					<bt-alarm-select v-model="ftpForm.channel" class="!w-[22rem]" :limit="['wx_account', 'sms']"></bt-alarm-select>
				</el-form-item>
			</template>
		</el-form>
	</div>
</template>
<script lang="tsx" setup>
import { $reset, datePickerChangeEvent, init, rule, typeOptions, changePwdValidity } from './useMethod'
import { useFtpPwdValidStore } from './useStore'

const { updateFtpInfo, ftpForm, isTime, pickerOptions, datePicker, pickerRef } = useFtpPwdValidStore()

defineExpose({ onConfirm: changePwdValidity })

onMounted(init)
onUnmounted($reset)
</script>
<style lang="css" scoped>
.inputInlineBlock {
	display: inline-block !important;
}

.btCustomForm {
	@apply px-[4rem] pt-[3.2rem] pb-[3.4rem];
}

.bt-custom-form1 {
	@apply px-[0rem] pt-[2rem] pb-[1.6rem];
}

.date :deep(.el-input__inner) {
	@apply pl-[2.6rem];
}

.tip {
	@apply ml-[3.2rem] mb-[2rem];
}
.tip ul {
	@apply list-disc;
}
.tip ul li {
	@apply leading-[2.4rem] text-secondary;
}

.container-dialog {
	@apply flex flex-col;
}
.container-dialog :deep(.el-radio__label) {
	@apply text-small text-default;
}
.container-dialog :deep(.el-slider__runway) {
	@apply my-[1.3rem];
}
.container-dialog :deep(.el-radio-group) {
	@apply pt-[.4rem] leading-[3rem];
}

:deep(.el-select .el-select__wrapper) {
	height: auto !important;
}
</style>
