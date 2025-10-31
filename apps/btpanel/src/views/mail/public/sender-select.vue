<template>
	<bt-select v-model="value" :filterable="true" :options="options" placeholder="请选择发件人"> </bt-select>
</template>

<script lang="ts" setup>
import { isArray } from '@/utils'
import { getUserList } from '@/api/mail'

interface Props {
	isInit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	isInit: false,
})

const value = defineModel<string | null>('value')

const options = ref<any[]>([])

const getList = async () => {
	const { data } = await getUserList()
	if (isArray(data.data) && data.data.length > 0) {
		options.value = data.data.map((item: any) => ({
			label: item.username,
			value: item.username,
		}))
		value.value = data.data[0].username
	}
}

if (props.isInit) {
	getList()
}

defineExpose({
	getList,
})
</script>
