<template>
	<div class="p-[20px] pt-[24px] pb-[8px]">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="分组名" prop="mail_type">
				<div class="w-[200px]">
					<el-input v-model="form.mail_type" placeholder="请输入组名"></el-input>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>
<script lang="ts" setup>
import { addMailType, editMailType } from '@/api/mail'
import { useDataHandle } from '@/hooks/tools'

interface PropsData {
	row: any
	isEdit: boolean
	refresh?: () => void
}

interface Props {
	compData: PropsData
}

const popupClose = inject<() => void>('popupClose') // 设置弹窗底部

const props = withDefaults(defineProps<Props>(), {})

const { row, isEdit, refresh } = props.compData

const formRef = ref<any>(null)

const form = reactive({
	mail_type: '',
})

const rules: any = {
	mail_type: { required: true, trigger: 'blur', message: '请输入分组名' },
}

const onConfirm = async () => {
	await formRef.value?.validate()
	useDataHandle({
		loading: `正在${isEdit ? '编辑' : '添加'}分组`,
		message: true,
		request: isEdit && row ? editMailType({ ...toRaw(form), id: row.id }) : addMailType(toRaw(form)),
		success: (res: any) => {
			if (res.status) {
				popupClose?.()
				refresh?.()
			}
		},
	})
}

defineExpose({
	onConfirm,
})
</script>
