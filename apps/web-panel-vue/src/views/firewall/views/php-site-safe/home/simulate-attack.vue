<template>
	<div class="p-[2rem]" v-bt-loading="loading">
		<div class="sn-test-line">
			<div class="sn-test-line-title">1.选择一个PHP版本进行模拟攻击（预计一分钟）</div>
			<div class="sn-test-line-content">
				<span>PHP版本</span>
				<bt-select v-model="php" :options="phpVersionOptions" class="ml-[2rem] !w-[155px]" placeholder="请选择PHP版本" />
				<el-button class="!ml-[1rem]" type="primary" @click="attackEvent">模拟攻击</el-button>
			</div>
		</div>
	</div>
</template>
<script lang="tsx" setup>
import type { SelectOptionProps } from '@/components/form/bt-select/types'

import { useDataHandle } from '@hooks/tools'
import { getPhpModuleList, startAttack } from '@/api/firewall'

const props = defineProps<{
	compData: () => void
}>()

const emits = defineEmits(['close'])

const loading = ref(false)
const php = ref('')
const phpVersionOptions = ref<SelectOptionProps[]>([])

/**
 * @description 获取php版本列表
 */
const getPhpVersion = async () => {
	phpVersionOptions.value = []
	await useDataHandle({
		loading,
		request: getPhpModuleList(),
		data: {
			php_versions: [
				Array,
				(data: any) => {
					phpVersionOptions.value = data.map((item: any) => ({
						label: item.version,
						value: item.v,
					}))
				},
			],
		},
	})
}

/**
 * @description 模拟攻击
 */
const attackEvent = async () => {
	await useDataHandle({
		loading: '正在模拟攻击，预计等待一分钟，请稍候...',
		request: startAttack({ version: php.value }),
		message: true,
	})
	props.compData()
	emits('close')
}

onMounted(() => getPhpVersion())
</script>
<style lang="css" scoped>
.sn-test-line-title {
	@apply text-base mb-[1rem];
}
.sn-test-line-content {
	@apply text-secondary mb-[2.6rem] relative;
}
</style>
