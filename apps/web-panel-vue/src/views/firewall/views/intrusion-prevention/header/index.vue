<template>
	<div class="tab-header-operate" v-bt-loading="infoLoad">
		<div class="mr-4">入侵防御开关</div>
		<div>
			<el-switch v-model="infoData.isIntrusion" :width="36" @change="onChangeIntrusion"></el-switch>
		</div>
		<div class="bg-darker w-[1px] h-2rem mx-16px"></div>
		<div>
			总拦截次数:
			<span :class="infoData.num > 0 ? 'text-danger' : ''">
				{{ infoData.num }}
			</span>
		</div>
		<div class="bg-darker w-[1px] h-2rem mx-16px"></div>
		<div>保护天数: {{ infoData.days }}</div>
	</div>
</template>

<script setup lang="ts">
import { getIntrusionData, setIntrusionSwitch } from '@api/firewall'
import { useDataHandle } from '@hooks/tools'

interface Props {
	data: {
		isIntrusion: boolean
		num: number
		days: number
	}
}

const props = withDefaults(defineProps<Props>(), {
	data: {
		isIntrusion: false,
		num: 0,
		days: 0,
	},
})

const emits = defineEmits(['refresh'])

const infoLoad = shallowRef(false) // 加载状态
const infoData = shallowReactive({
	isIntrusion: false, // 入侵防御开关
	num: 0, // 总拦截次数
	days: 0, // 保护天数
})

/**
 * @description: 入侵防御开关
 */
const onChangeIntrusion = async (val: boolean) => {
	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + '入侵防御，请稍后...',
		request: setIntrusionSwitch(val),
		message: true,
	})
	emits('refresh')
}

watch(
	() => props.data,
	(val: any) => {
		infoData.isIntrusion = val.open
		infoData.num = val.totla_times
		infoData.days = val.totla_days
	},
	{ immediate: true }
)
</script>

<style scoped></style>
