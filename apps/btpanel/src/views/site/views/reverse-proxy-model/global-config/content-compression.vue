<template>
	<div class="p-[20px]">
		<el-form ref="compressFormRef" class="h-[48rem]" :model="compressData" :rules="compressRules" label-width="100px" v-bt-loading="formLoading" :disabled="formDisabled">
			<el-form-item label="内容压缩" prop="status">
				<el-switch v-model="compressData.status" @change="onConfirm"> </el-switch>
			</el-form-item>
			<div v-show="compressData.status" class="mt-[1.6rem]">
				<el-form-item label="压缩类型" prop="type">
					<bt-input v-model="compressData.type" type="textarea" width="42rem" :rows="6" resize="none" />
				</el-form-item>
				<el-form-item label="压缩级别" prop="level">
					<el-select class="!w-[42rem]" v-model="compressData.level">
						<el-option v-for="level in 9" :key="level" :label="level" :value="String(level)"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="压缩最小长度" prop="minLength">
					<div class="flex items-center">
						<bt-input v-model="compressData.minLength"></bt-input>
						<el-form-item prop="unit">
							<el-select class="ml-[1rem] !w-[8rem]" v-model="compressData.unit" placeholder="请选择">
								<el-option v-for="item in lengthUnit" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
					</div>
				</el-form-item>
			</div>
			<el-form-item v-show="compressData.status" label=" " class="mt-[1.6rem]">
				<el-button type="primary" @click="onConfirm">保存</el-button>
			</el-form-item>
		</el-form>
		<div class="ml-[20px]">
			<bt-help :options="compressHelpList"></bt-help>
		</div>
	</div>
</template>

<script setup lang="ts">
import { globalConfig, formLoading, formDisabled, compressFormRef, compressData, lengthUnit, compressHelpList, compressRules, setValueEvent, onConfirmCompress as onConfirm } from './useController'

watch(
	() => globalConfig.value.gzip,
	val => {
		if (val) {
			setValueEvent(val)
		} else {
			compressData.status = false
		}
	}
)

onMounted(() => {
	setValueEvent(globalConfig.value.gzip)
})
</script>
