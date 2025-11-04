<template>
	<div class="p-20px">
		<el-row :gutter="10">
			<el-col :span="20">
				<el-input v-model="name" placeholder="请输入分组名称"></el-input>
			</el-col>
			<el-col :span="4">
				<el-button type="primary" @click="onAdd">添加</el-button>
			</el-col>
		</el-row>
		<div class="mt-12px">
			<bt-table :max-height="300"> </bt-table>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { Message, useAllTable, useConfirm, useDataHandle, useDialog, useForm } from '@/hooks/tools'
import { addMailType, delMailType, editMailType } from '@/api/mail'
import { mailTypeList, getTypeList } from './store'
import { useOperate } from '@/hooks/tools/table/column'
import BtDivider from '@/components/other/bt-divider'
import { FormInput } from '@/hooks/tools/form/form-item'

const name = ref('')

const { BtTable, refresh } = useAllTable({
	request: async (params: any) => {
		await getTypeList()
		return {
			data: mailTypeList.value || [],
			total: mailTypeList.value.length || 0,
		}
	},
	columns: [
		{
			prop: 'mail_type',
			label: '分组名称',
		},
		useOperate((row: any) => [
			{
				render: (row: any) => {
					return (
						<span class="">
							<span
								class={`bt-link ${row.id === 0 ? '!cursor-not-allowed !opacity-50' : ''}`}
								onClick={() => {
									if (row.id === 0) return
									onEdit(row)
								}}>
								编辑
							</span>
							<BtDivider />
						</span>
					)
				},
			},
			{
				render: (row: any) => {
					return (
						<span
							class={`bt-link ${row.id === 0 ? '!cursor-not-allowed !opacity-50' : ''}`}
							onClick={() => {
								if (row.id === 0) return
								onDel(row)
							}}>
							删除
						</span>
					)
				},
			},
		]),
	],
})

const onAdd = async () => {
	const type = name.value.trim()
	if (type === '') {
		Message.error('请输入分组名称')
		return
	}

	await addMailType({ mail_type: type })
	refresh()
	name.value = ''
}

const onEdit = (row: any) => {
	form.id = row.id
	form.mail_type = row.mail_type
	const { BtForm, submit } = useForm({
		data: () => form,
		options: (formData: any) => {
			return computed(() => [
				FormInput('分组名称', 'mail_type', {
					attrs: {
						placeholder: '请输入分组名称',
					},
					rules: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
				}),
			])
		},
		submit: async (formData: typeof form, validate: any) => {
			await validate()
			return useDataHandle({
				request: editMailType(toRaw(form)),
				loading: '编辑中...',
				message: true,
				success: () => {
					refresh()
				},
			})
		},
	})
	useDialog({
		title: '编辑分组',
		component: () => {
			return <BtForm class="pt-[14px]" />
		},
		area: 35,
		showFooter: true,
		onConfirm: submit,
	})
}

const onDel = (row: any) => {
	useConfirm({
		title: `删除分组【${row.mail_type}】`,
		content: '确定要删除该分组吗？',
		onConfirm: async () => {
			useDataHandle({
				request: delMailType({ ids: `${row.id}` }),
				loading: '删除中...',
				message: true,
				success: () => {
					refresh()
				},
			})
		},
	})
}

// 表单实例
const formRef = ref<any>(null)

// 表单
const form = reactive({
	id: -1,
	mail_type: '',
})

// 规则
const rules = {
	mail_type: {
		required: true,
		message: '请输入分组名称',
		trigger: ['blur', 'change'],
	},
}
</script>
