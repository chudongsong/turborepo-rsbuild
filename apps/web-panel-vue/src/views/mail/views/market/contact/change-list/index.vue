<template>
	<div class="px-[20px] pt-[24px] pb-[8px]">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="邮箱">
				<div class="w-300px">
					<el-input v-model:value="compData.row.recipient" :disabled="true"></el-input>
				</div>
			</el-form-item>
			<el-form-item label="分组" prop="etypes">
				<div class="w-300px">
					<type-select ref="typeSelect" v-model="form.etypes" multiple filterable> </type-select>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>
<script lang="ts" setup>
import { setContactChange } from '@/api/mail'
import { useDataHandle } from '@/hooks/tools'

import TypeSelect from '@mail/public/type-select.vue'

interface PropsData {
	row: any
	onRefresh: () => void
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const { compData } = props

const formRef = ref<any>(null)

const form = reactive({
	etypes: [] as string[],
})

const rules = {
	etypes: {
		trigger: 'change',
		validator: () => {
			if (!form.etypes.length) {
				return new Error('请选择邮件类型')
			}
			return true
		},
	},
}

const getParams = () => {
	return {
		etypes: form.etypes.join(','),
		recipients: compData.row.recipient,
		active: compData.row.active,
	}
}

const onConfirm = async (close: () => void) => {
	useDataHandle({
		request: setContactChange(getParams()),
		loading: '更改中...',
		message: true,
		success: () => {
			compData.onRefresh()
			close()
		},
	})
}

onMounted(() => {
	nextTick(() => {
		form.etypes = compData.row.mail_type.map((item: any) => Number(Object.keys(item)[0])).filter((id: number) => !Number.isNaN(id))
		console.log(compData.row, form.etypes, 'compData.row')
	})
})

defineExpose({
	onConfirm,
})
</script>
