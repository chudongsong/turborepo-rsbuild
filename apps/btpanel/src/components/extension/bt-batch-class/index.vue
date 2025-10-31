<template>
	<el-form ref="setClassFormRef" :rules="rules" :model="setClassForm" class="px-[2rem] pt-[2rem]">
		<el-form-item :label="name" prop="classValue">
			<el-select v-model="setClassForm.classValue" class="!w-[22rem]" placeholder="请选择您的分类">
				<el-option v-for="(item, index) in selectOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
			</el-select>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import type { BatchSetClassOptions } from '@/public/types'

interface Props {
	compData: BatchSetClassOptions
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		name: '',
		options: [],
		selectList: [],
		request: () => Promise.resolve({}),
	}),
})

const setClassFormRef = ref() // 表单ref
const { request } = unref(props.compData)
const { name, options } = toRefs(props.compData)

const selectOptions = computed(() => {
	// return options.value.filter(item => item.value !== 'all');
	return options.value
})

const setClassForm = reactive({
	classValue: '',
})

const rules = {
	classValue: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

/**
 * @description 确认事件
 */
const onConfirm = async (close: AnyFunction) => {
	await setClassFormRef.value.validate()
	await request({ id: setClassForm.classValue === 'all' ? 0 : setClassForm.classValue }, close)
}

defineExpose({
	onConfirm,
})
</script>
