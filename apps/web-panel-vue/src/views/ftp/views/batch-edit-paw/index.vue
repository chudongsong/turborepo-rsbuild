<template>
	<div :class="ftpForm.type == '1' ? 'pt-2rem pr-2rem' : 'p-2rem'">
		<el-alert class="!w-full" icon="svgtofont-el-warning" type="warning" :class="ftpForm.type == '1' ? 'warn' : ''" :closable="false">
			<template #title>
				<span>批量改密已选FTP用户，默认自动化改密，支持自定义</span>
			</template>
		</el-alert>
		<el-form ref="updateFtpInfoRef" :rules="rules" :model="ftpForm" class="bt-custom-form">
			<el-form-item label="类型" class="typeClass">
				<bt-radio :type="'button'" class="!flex" v-model="ftpForm.type" :options="typeOptions" />
			</el-form-item>
			<el-form-item :label="' '" class="typeClass" v-show="ftpForm.type === '1'">
				<bt-table :max-height="200" ref="showFtpTableRef" :column="tableColumn" :data="rowData.selectedList" :description="'FTP列表为空'" v-bt-loading:title="'正在加载FTP列表，请稍后...'" />
				<div class="mt-[1.6rem] flex">
					<el-button type="default" @click="copyAll" class="inline-block flex items-center">
						<i class="svgtofont-icon-copy"></i>
						<span class="mb-[2px] ml-[4px]">复制所有</span>
					</el-button>
					<el-button type="default" @click="refreshAll" class="refreshAllBtn">
						<i class="svgtofont-el-refresh"></i>
						<span class="mb-[2px] ml-[4px]">刷新所有</span>
					</el-button>
				</div>
			</el-form-item>

			<el-form-item label="密码" class="relative mt-[16px] typeClass" prop="password" v-show="ftpForm.type == '0'">
				<div class="flex items-center">
					<bt-input-icon v-model="ftpForm.password" style="width: 26rem" name="password" icon="el-refresh" @icon-click="refresh"></bt-input-icon>
					<BtIcon icon="icon-copy" class="w-1.8rem h-1.8rem cursor-pointer ml-[1rem]" @click="copyPwd" />
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>
<script lang="tsx" setup>
import { useFtpStore } from '@ftp/useStore'
import { copyAll, copyPwd, onConfirm, refresh, refreshAll, rules, tableColumn } from './useMethod'
import { useFtpBatchPwdStore } from './useStore'

const { rowData } = useFtpStore()
const { ftpForm, typeOptions, updateFtpInfoRef } = useFtpBatchPwdStore()

defineExpose({ onConfirm })
</script>
<style lang="css" scoped>
.bt-custom-form {
	@apply w-[40rem] pl-0 pr-0;
}

.warn {
	@apply w-[90%] ml-[1rem];
}

.typeClass :deep(.el-form-item__label) {
	@apply min-w-[5rem];
}

.table :deep(.el-table__cell) {
	@apply py-[1rem] px-[0];
}
.table :deep(.el-table__fixed) ::before {
	display: none;
}

.trigger :deep(.el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 0 !important;
}
</style>
