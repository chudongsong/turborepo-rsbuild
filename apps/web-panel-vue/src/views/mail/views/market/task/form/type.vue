<template>
	<div class="flex-1">
		<div class="flex items-center">
			<div class="w-260px">
				<el-select class="bt-multiple-select" v-model="value" :loading="loading" multiple filterable
					placeholder="请选择分组" @change="onUpdateValue">
					<el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</div>
			<div class="ml-10px">
				<bt-link @click="onShowCreate">创建</bt-link>
			</div>
		</div>
		<div class="mt-8px">发送邮件 (<b>{{ contactNumber }}</b> 个收件人)</div>
	</div>
</template>

<script lang="ts" setup>
import { isArray, isObject } from '@/utils'
import { useDialog } from '@hooks/tools'
import { useLoading } from '@mail/useMethod'
import { getMailTypeList, getContactNumber } from '@/api/mail'

import TypeCreate from './type-create.vue'

const value = defineModel<number[]>('value')

const name = defineModel<string[]>('name')

const typeOptions = ref<any[]>([])

const typeList = ref<any[]>([])

const contactNumber = ref(0)

const { loading, setLoading } = useLoading()

const getType = async () => {
	try {
		setLoading(true)
		const { data } = await getMailTypeList({})
		if (isArray<any>(data)) {
			typeList.value = data
			typeOptions.value = data.map(item => ({
				label: item.mail_type,
				value: item.id,
			}))

			// 如果已有选中值，手动触发更新
			if (value.value && value.value.length > 0) {
				onUpdateValue(value.value)
			}
		}
	} finally {
		setLoading(false)
	}
}

const onUpdateValue = async (typeIds: number[]) => {
	name.value = typeList.value.filter(item => typeIds.includes(item.id)).map(item => item.mail_type)
	const { data } = await getContactNumber({ etypes: typeIds.join(',') })
	if (isObject<{ data: number }>(data)) {
		contactNumber.value = data.data
	}
}

const onShowCreate = () => {
	useDialog({
		title: '创建新的分组',
		area: 48,
		showFooter: true,
		compData: {
			refresh: getType,
		},
		component: TypeCreate,
	})
}

getType()

defineExpose({
	getType,
})
</script>
