<template>
	<div>
		<el-form-item label="文件拆分" v-if="!isEnterprise" class="!mb-[14px]">
			<div class="flex items-center">
				<el-select v-model="fileSplitValue" class="mr-[4px] !w-[13rem]" @change="changeFileSplit">
					<el-option v-for="item in fileOptions" :key="item.value" :label="item.name" :value="item.value"> </el-option>
				</el-select>
				<div v-if="fileSplitValue !== '0'" @input="changeNumber" class="text-small flex items-center">
					<bt-input v-model="fileSplitForm.split_value" type="number" width="14rem">
						<template #append> {{ fileSplitValue == 'num' ? '个' : 'MB' }} </template>
					</bt-input>
				</div>
				<span class="text-secondary text-small leading-8 ml-8x">*为避免文件过大导致上传失败，可以选择按大小或数量拆分。仅文件超过 5GB 时支持拆分，小文件请忽略 </span>
			</div>
		</el-form-item>

		<el-form-item label="备份设置">
			<div class="text-small text-secondary flex items-center">
				<el-checkbox v-model="fileSetting" class="!mr-12x" @change="changeFileSetting"> 同时保留本地备份（和云存储保留份数一致） </el-checkbox>
			</div>
		</el-form-item>
	</div>
</template>

<script setup lang="ts">
import { fileSplitForm } from './useController'

interface Props {
	rowData: any
	isEnterprise?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	rowData: () => {},
	isEnterprise: false,
})

const fileOptions = [
	{ name: '不拆分', value: '0' },
	{ name: '按文件大小拆分', value: 'size' },
	{ name: '按数量拆分', value: 'num' },
] // 文件拆分类型

const fileSplitValue = ref(props.rowData.split_type || '0') // 拆分类型
const fileSetting = ref(Boolean(props.rowData.save_local) || false) // 备份设置

/**
 * @description: 改变文件拆分-选中拆分类型时
 */
const changeFileSplit = (val: any) => {
	// 当选中的时数量时，将numValue的值设置为5
	if (val == 'num') {
		fileSplitForm.value.split_value = 5
	} else if (val == 'size') {
		fileSplitForm.value.split_value = 1024
	}
	fileSplitForm.value.split_type = val
}

const changeFileSetting = (val: any) => {
	fileSplitForm.value.save_local = Number(val)
}

/**
 * @description: 改变文件拆分-输入框输入时
 */
const changeNumber = (val: any) => {
	fileSplitForm.value.split_value = Number(val.target.value)
}
</script>
