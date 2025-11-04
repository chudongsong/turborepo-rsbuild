<template>
	<el-select v-bind="$attrs" v-model="value" :loading="loading">
		<el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
	</el-select>
</template>

<script lang="ts" setup>
import { getMailTypeList } from '@/api/mail'
import { useLoading } from '@/views/mail/useMethod'
import { isArray } from '@/utils'

const value = defineModel<any>('value', { default: () => [] })

const typeOptions = ref<any[]>([])

const { loading, setLoading } = useLoading()
const getType = async () => {
	try {
		setLoading(true)
		const { data } = await getMailTypeList({})
		if (isArray<any>(data)) {
			typeOptions.value = data.map((item: any) => ({
				label: item.mail_type,
				value: item.id,
			}))
		}
	} finally {
		setLoading(false)
	}
}

getType()

onMounted(() => {
	console.log(value.value, 'value')
})

defineExpose({
	getType,
})
</script>
