<template>
	<el-select v-model="value" :loading="loading" :filterable="true">
		<template #label="{ label, value }">
			{{ renderTag(label) }}
		</template>
		<el-option v-for="item in domainOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
	</el-select>
</template>

<script lang="tsx" setup>
import { isArray } from '@/utils'
import { getDomainName } from '@/api/mail'
import { useLoading } from '@mail/useMethod'

interface Props {
	all?: boolean
	showTag?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	all: true,
	showTag: true,
})

const value = defineModel<any>('value')

const domainOptions = ref<any[]>([])

const renderTag = (value: any) => {
	return props.showTag ? `域名：${value}` : value
}

const initDomain = () => {
	domainOptions.value.unshift({ label: '全部', value: 'value' })
}

const { loading, setLoading } = useLoading()
const getDomain = async () => {
	try {
		setLoading(true)
		const {
			data: { data },
		} = await getDomainName()
		if (isArray<string>(data)) {
			domainOptions.value = data.map((item: any) => ({ label: item, value: item }))
			if (props.all) {
				initDomain()
			} else {
				value.value = data[0] || ''
			}
		}
	} finally {
		setLoading(false)
	}
}

getDomain()
</script>
