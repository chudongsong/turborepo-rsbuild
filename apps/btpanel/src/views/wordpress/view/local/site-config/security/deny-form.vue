<template>
	<div class="p-20px">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="名称" prop="deny_name">
				<div class="w-280px">
					<el-input v-model="form.deny_name" :disabled="isEdit" placeholder="请填写规则名称" />
				</div>
			</el-form-item>
			<el-form-item label="后缀" prop="suffix">
				<div class="w-280px">
					<el-input v-model="form.suffix" placeholder="不允许的后缀" />
				</div>
			</el-form-item>
			<el-form-item label="路径" prop="dir">
				<div class="w-280px">
					<el-input v-model="form.dir" placeholder="在此目录中引用的规则，例如：/a/" />
				</div>
			</el-form-item>
		</el-form>
		<bt-help :options="[{ content: '后缀：禁止访问的文件后缀' }, { content: '访问路径：如需要禁止https://www.bt.cn/api/，则填写/api即可' }]" class="mt-4px"></bt-help>
	</div>
</template>

<script lang="ts" setup>
import { setFileDeny } from '@/api/site'
import { useDataHandle } from '@/hooks/tools'

interface Props {
	compData: PropsData
}

interface PropsData {
	isEdit: boolean
	siteName: string
	row?: any
	getList?: () => void
}

const props = withDefaults(defineProps<Props>(), {})
const { isEdit, siteName, row, getList } = props.compData

const formRef = ref<any | null>(null)

const form = reactive({
	deny_name: '',
	suffix: 'php|jsp',
	dir: '',
})

const rules = {
	deny_name: [
		{ required: true, message: '请填写规则名称', trigger: 'blur' },
		{ required: true, message: '请填写规则名称', trigger: 'input' },
		{ min: 3, message: '规则名称至少需要3个字符', trigger: ['blur', 'input'] },
	],
	suffix: [
		{ required: true, message: '请填写不允许的后缀', trigger: 'blur' },
		{ required: true, message: '请填写不允许的后缀', trigger: 'input' },
	],
	dir: [
		{ required: true, message: '请填写在此目录中引用的规则', trigger: 'blur' },
		{ required: true, message: '请填写在此目录中引用的规则', trigger: 'input' },
	],
}

const getParams = (act: string) => {
	return {
		...toRaw(form),
		dir: form.dir.replace(/\/$/, '') + '/',
		website: siteName,
		act,
	}
}

const onConfirm = async (close: () => void) => {
	await formRef.value?.validate()
	useDataHandle({
		request: isEdit ? setFileDeny(getParams('edit')) : setFileDeny(getParams('add')),
		loading: isEdit ? '修改中...' : '添加中...',
		message: true,
		success: () => {
			getList?.()
			close && close()
		},
	})
}

const init = () => {
	if (isEdit && row) {
		form.deny_name = row.name
		form.suffix = row.suffix
		form.dir = row.dir
	}
}

init()

defineExpose({
	onConfirm,
})
</script>
