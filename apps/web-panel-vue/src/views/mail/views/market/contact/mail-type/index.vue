<template>
	<div class="w-200px">
		<el-select v-model="value" :loading="loading">
			<template #label="{ label, value }">
				{{ renderTag(label) }}
			</template>
			<template #footer>
				<div class="px-[12px] py-[8px]">
					<el-button class="!w-full" @click="onSetType">分组管理</el-button>
				</div>
			</template>
			<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
		</el-select>
	</div>
</template>

<script lang="ts" setup>
import { useDialog } from '@/hooks/tools'
import { useLoading } from '@mail/useMethod'
import { mailTypeList, getTypeList, resetMailType } from './store'

import TypeSet from './set.vue'

const value = defineModel<number>('value', {
	default: () => -1,
})

const options = computed(() => {
	const result = mailTypeList.value.map((item: any) => ({
		label: item.mail_type,
		value: item.id,
	}))
	result.unshift({
		label: '全部',
		value: -1,
	})
	return result
})

const renderTag = (value: any) => {
	return `分组: ${value}`
}

const onSetType = () => {
	useDialog({
		title: '分组管理',
		area: 36,
		component: TypeSet,
	})
}

const { loading, setLoading } = useLoading()

const getType = async () => {
	try {
		setLoading(true)
		await getTypeList()
	} finally {
		setLoading(false)
	}
}

getType()

onUnmounted(() => {
	resetMailType()
})
</script>

<style lang="scss" scoped></style>
