<template>
	<div class="flex items-center">
		<div class="w-260px">
			<el-select v-model="value" :loading="loading" :filterable="true">
				<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
			</el-select>
		</div>
		<div class="ml-10px">
			<bt-link @click="onShowCreate">创建</bt-link>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { isArray } from '@/utils'
import { useLoading } from '@mail/useMethod'
import { getMailTemplateSelect } from '@/api/mail'
import { setMenu } from '../../useMethod'

const value = defineModel<any>('value')

const options = ref<any[]>([])

const { loading, setLoading } = useLoading()

const onShowCreate = () => {
	setMenu('template')
}

const getList = async () => {
	try {
		setLoading(true)
		const { data } = await getMailTemplateSelect()
		if (isArray<{ name: string; id: number }>(data) && data.length > 0) {
			options.value = data.map((item: any) => ({
				label: item.name,
				value: item.id,
			}))
			if (!value.value) {
				value.value = data[0].id
			}
		}
	} finally {
		setLoading(false)
	}
}

getList()

defineExpose({
	getList,
})
</script>
