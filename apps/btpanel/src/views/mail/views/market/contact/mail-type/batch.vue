<template>
	<div class="px-20px pt-24px pb-8px">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="分组" prop="type">
				<div class="w-240px">
					<el-select v-model="form.type" :loading="loading" multiple filterable>
						<el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { useLoading } from '@mail/useMethod'
import { setUnsubscribeType } from '@/api/mail'
import { mailTypeList, getTypeList } from './store'
import { useDataHandle } from '@/hooks/tools'

interface PropsData {
	rows: any[]
	onRefresh: () => void
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const { compData } = props

const formRef = useTemplateRef('formRef')

const form = reactive({
	type: null as any,
})

const rules: any = {
	type: {
		trigger: 'change',
		validator: () => {
			if (form.type === null) {
				return new Error('请选择邮件类型')
			}
			return true
		},
	},
}

const typeOptions = computed(() => {
	return mailTypeList.value.map(item => ({
		label: item.mail_type,
		value: item.id,
	}))
})

const { loading, setLoading } = useLoading()

// 获取分类列表
const getList = async () => {
	try {
		setLoading(true)
		await getTypeList()
	} finally {
		setLoading(false)
	}
}

getList()

const getParams = () => {
	return {
		etypes: `${form.type || 0}`,
		recipients: compData.rows.map((item: any) => item.recipient).join(','),
		active: compData.rows[0].active,
	}
}

const onConfirm = async (close: () => void) => {
	await formRef.value?.validate()
	useDataHandle({
		loading: '修改中...',
		message: true,
		request: setUnsubscribeType(getParams()),
		success: () => {
			compData?.onRefresh()
			close()
		},
	})
}

defineExpose({
	onConfirm,
})
</script>
