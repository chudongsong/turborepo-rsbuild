<template>
	<div class="p-[2rem]">
		<BtForm label-width="120px">
			<template #disk_space_quota>
				<el-form-item prop="disk_space_quota.value" label="磁盘配额空间(MB)">
					<bt-input type="number" v-model="formData.disk_space_quota.value" width="22rem" :disabled="formData.disk_space_quota.unlimited" clearable class="mr-[10px]" />
					<el-checkbox v-model="formData.disk_space_quota.unlimited" label="无限制" />
				</el-form-item>
			</template>
			<template #monthly_bandwidth_limit>
				<el-form-item prop="monthly_bandwidth_limit.value" label="每月带宽限制(MB)">
					<bt-input type="number" v-model="formData.monthly_bandwidth_limit.value" :disabled="formData.monthly_bandwidth_limit.unlimited" width="22rem" class="mr-[10px]" />
					<el-checkbox v-model="formData.monthly_bandwidth_limit.unlimited" label="无限制" />
				</el-form-item>
			</template>
			<template #max_site_limit>
				<el-form-item prop="max_site_limit.value" label="最大网站数">
					<bt-input type="number" v-model="formData.max_site_limit.value" :disabled="formData.max_site_limit.unlimited" width="22rem" class="mr-[10px]" />
					<el-checkbox v-model="formData.max_site_limit.unlimited" label="无限制" />
				</el-form-item>
			</template>
			<template #max_database>
				<el-form-item prop="max_database.value" label="最大数据库数">
					<bt-input type="number" v-model="formData.max_database.value" :disabled="formData.max_database.unlimited" width="22rem" class="mr-[10px]" />
					<el-checkbox v-model="formData.max_database.unlimited" label="无限制" />
				</el-form-item>
			</template>
		</BtForm>
	</div>
</template>
<script lang="ts" setup>
import { useForm, useMessage } from '@/hooks/tools'
import { FormHelp, FormInput } from '@/hooks/tools/form/form-item'
import { usePackageStore } from '../useStore'
import { createPackageApi, modifyPackageApi } from '@/api/vhost'
import { switchFormData } from '../useController'

const { isEdit, formData, refreshList, resetFormData } = usePackageStore()
const { request: $request, load: $load } = useMessage()

console.log(formData)

// 表单实体
const { BtForm, submit } = useForm({
	data: formData.value,
	options: (formData: any) => {
		return computed(() => [
			FormInput('资源包名称', 'package_name', {
				attrs: {
					class: '!w-[22rem]',
					clearable: true,
					placeholder: '请输入资源包名称',
				},
				rules: [
					{ required: true, message: '资源包名称不能为空！', trigger: 'blur' },
					{ min: 2, max: 20, message: '资源包名称在 2 到 20 个字符', trigger: 'blur' },
				],
			}),
			{
				type: 'slots',
				key: 'disk_space_quota',
				rules: {
					'disk_space_quota.value': [{ required: true, message: '磁盘配额空间不能为空！', trigger: 'blur' }],
				},
			},
			{
				type: 'slots',
				key: 'monthly_bandwidth_limit',
				rules: {
					'monthly_bandwidth_limit.value': [{ required: true, message: '每月带宽限制不能为空！', trigger: 'blur' }],
				},
			},
			{
				type: 'slots',
				key: 'max_site_limit',
				rules: {
					'max_site_limit.value': [{ required: true, message: '最大网站数不能为空！', trigger: 'blur' }],
				},
			},
			{
				type: 'slots',
				key: 'max_database',
				rules: {
					'max_database.value': [{ required: true, message: '最大数据库数不能为空！', trigger: 'blur' }],
				},
			},
			FormInput('PHP起始子进程', 'php_start_children', {
				attrs: {
					class: '!w-[22rem]',
					type: 'number',
					clearable: true,
					placeholder: '请输入最大子进程数',
				},
				rules: [{ required: true, message: 'PHP起始子进程不能为空！', trigger: 'blur' }],
			}),
			FormInput('PHP最大子进程', 'php_max_children', {
				attrs: {
					class: '!w-[22rem]',
					type: 'number',
					clearable: true,
					placeholder: '请输入最大子进程数',
				},
				rules: [{ required: true, message: 'PHP最大子进程不能为空！', trigger: 'blur' }],
			}),

			FormInput('备注', 'remark', {
				attrs: {
					class: '!w-[22rem]',
					clearable: true,
					placeholder: '请输入备注内容，可为空',
				},
			}),
			FormHelp('备注', [{ content: 'PHP起始子进程数量：此值越大网站响应性能越好，同时内存占用越高' }, { content: 'PHP最大子进程数量：此值越大网站并发性能越好，同时峰值内存占用越高' }]),
		])
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		await validate() // 校验表单
		let newData = switchFormData(param.value, true)
		let rdata = {}
		const loading = $load('正在提交表单，请稍候...')
		if (!isEdit.value) delete newData.package_id
		try {
			rdata = isEdit.value ? await modifyPackageApi(newData) : await createPackageApi(newData)
			resetFormData()
			$request(rdata)
			refreshList()
			if (!rdata.status) return false
		} catch (error) {
			console.error(error)
		} finally {
			loading.close()
		}
		return rdata
	},
})

defineExpose({ onConfirm: submit, onCancel: resetFormData })
</script>
