<template>
	<div class="p-[20px]">
		<el-form ref="cacheFormRef" class="h-[38rem]" :model="cacheData" label-width="100px" :rules="cacheFormRules" v-bt-loading="formLoading" :disabled="formDisabled">
			<el-form-item label="缓存开关" prop="status">
				<el-switch v-model="cacheData.status" @change="setCacheEvent"> </el-switch>
			</el-form-item>
			<div class="mt-[1.6rem]">
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
				<el-form-item label="缓存的文件后缀" prop="fileSuffix">
					<div class="flex items-center">
						<bt-input width="50rem" v-model="cacheData.cache_suffix" placeholder="请输入缓存的文件后缀，多个后缀用逗号分隔"></bt-input>
					</div>
				</el-form-item>
			</div>

			<el-form-item label=" ">
				<el-button type="primary" v-show="cacheData.status" class="!mt-[1.6rem]" @click="onConfirm">保存</el-button>
			</el-form-item>
		</el-form>
		<div class="ml-[20px]">
			<bt-help :options="cacheHelpList"></bt-help>
		</div>
	</div>
</template>

<script setup lang="ts">
import { proxyData, formLoading, formDisabled, cacheFormRef, cacheData, timeUnit, cacheHelpList, setCacheEvent, onConfirmCache as onConfirm } from './useController'

watch(
	() => proxyData.value.proxy_cache,
	val => {
		if (val) {
			cacheData.status = val.cache_status
			let time = '1',
				unit = 'd'
			if (val.expires?.length > 1) {
				time = val.expires.slice(0, -1)
				unit = val.expires.slice(-1)
			}
			cacheData.time = time
			cacheData.unit = unit
			cacheData.cache_suffix = val.cache_suffix ?? 'css,js,jpe,jpeg,gif,png,webp,woff,eot,ttf,svg,ico,css.map,js.map'
		}
	}
)
</script>
