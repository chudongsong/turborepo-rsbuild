<template>
	<div class="p-[20px]">
		<el-form ref="cacheFormRef" class="h-[40rem]" :model="cacheData" label-width="100px" :rules="cacheRules" v-bt-loading="formLoading" :disabled="formDisabled">
			<el-form-item label="缓存开关" prop="status">
				<el-switch v-model="cacheData.status" @change="onConfirm"> </el-switch>
			</el-form-item>
			<div v-show="cacheData.status" class="pt-[1.6rem]">
				<el-form-item label="缓存时间" prop="time">
					<div class="flex items-center">
						<bt-input v-model="cacheData.time"></bt-input>
						<el-form-item prop="unit">
							<el-select class="ml-[1rem] !w-[8rem]" v-model="cacheData.unit" placeholder="请选择">
								<el-option v-for="item in timeUnit" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
					</div>
				</el-form-item>
			</div>

			<el-form-item v-show="cacheData.status" class="!pt-[1.6rem]" label=" ">
				<el-button type="primary" @click="onConfirm">保存</el-button>
			</el-form-item>
			<el-divider></el-divider>
			<!-- <el-form-item class="!mt-[1.6rem]" label="缓存清理"> -->
			<el-button type="default" @click="clearCache">清理缓存</el-button>
			<!-- </el-form-item> -->
		</el-form>
		<div class="ml-[20px]">
			<bt-help :options="cacheHelpList"></bt-help>
		</div>
	</div>
</template>

<script setup lang="ts">
import { globalConfig, formLoading, formDisabled, cacheFormRef, cacheData, timeUnit, cacheHelpList, cacheRules, clearCache, onConfirmCache as onConfirm } from './useController'

watch(
	() => globalConfig.value.proxy_cache,
	val => {
		if (val && Object.keys(val).length > 0) {
			cacheData.status = val.cache_status
			let time = '1',
				unit = 'd'
			if (val.expires.length > 1) {
				time = val.expires.slice(0, -1)
				unit = val.expires.slice(-1)
			}
			cacheData.time = time
			cacheData.unit = unit
		}
	},
	{ immediate: true }
)

defineExpose({
	onConfirm,
})
</script>
