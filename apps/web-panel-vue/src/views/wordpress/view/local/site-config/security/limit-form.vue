<template>
	<div class="p-20px">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="名称" prop="name">
				<div class="w-280px">
					<el-input v-model="form.name" :disabled="isEdit" placeholder="请输入名称" />
				</div>
			</el-form-item>
			<el-form-item label="路径" prop="site_dir">
				<div class="w-280px">
					<el-input v-model="form.site_dir" :disabled="isEdit" placeholder="请输入路径：/text/" />
				</div>
			</el-form-item>
			<el-form-item label="用户名" prop="username">
				<div class="w-280px">
					<el-input v-model="form.username" placeholder="请输入用户名" />
				</div>
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<div class="w-280px">
					<el-input v-model="form.password" placeholder="请输入密码" />
				</div>
			</el-form-item>
		</el-form>
		<bt-help :options="[{ content: '目录设置加密访问后，会导致目录及子目录下的“反向代理”失效' }, { content: '目录设置加密访问后，访问时需要输入账号密码才能访问' }, { content: '例如我设置了加密访问 /test/ ,那我访问 http://aaa.com/test/ 时就要输入账号密码才能访问' }]" class="mt-4px"></bt-help>
	</div>
</template>

<script lang="ts" setup>
import { setDirAuth, modifyDirAuthPass } from '@/api/site'
import { useDataHandle } from '@/hooks/tools'

interface Props {
	compData: PropsData
}

interface PropsData {
	isEdit: boolean
	siteId: number
	row?: any
	getList?: () => void
}

const props = withDefaults(defineProps<Props>(), {})
const { isEdit, siteId, row, getList } = props.compData

const formRef = ref<any | null>(null)

const form = reactive({
	name: '',
	site_dir: '',
	username: '',
	password: '',
})

const rules: any = {
	name: [
		{ required: true, message: '名称不能为空', trigger: 'blur' },
		{ min: 3, message: '名称至少需要3个字符', trigger: 'blur' },
	],
	site_dir: [{ required: true, message: '路径不能为空', trigger: 'blur' }],
	username: [
		{ required: true, message: '用户名不能为空', trigger: 'blur' },
		{ min: 3, message: '用户名至少需要3个字符', trigger: 'blur' },
	],
	password: [
		{ required: true, message: '密码不能为空', trigger: 'blur' },
		{ min: 3, message: '密码至少需要3个字符', trigger: 'blur' },
	],
}

const onConfirm = async (close: any) => {
	await formRef.value?.validate()
	useDataHandle({
		request: isEdit
			? modifyDirAuthPass({
					id: siteId,
					name: form.name,
					username: form.username,
					password: form.password,
			  })
			: setDirAuth({ ...toRaw(form), id: siteId }),
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
		form.name = row.name
		form.site_dir = row.site_dir
	}
}

init()

defineExpose({
	onConfirm,
})
</script>
