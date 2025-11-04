<template>
	<config-rows label="地区登录限制">
		<template #value>
			<el-switch v-model="limitAreaSwitch" @change="onChange"></el-switch>
			<el-button type="default" size="small" class="!ml-12px" :disabled="loading" @click="onSet">设置地区登录限制</el-button>
		</template>
		<template #desc>
			<span>设置面板地区登录策略</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { useDataHandle } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { setLimitData, getLimitData } from '@api/config'
import { useDialog } from '@hooks/tools'

import ConfigRows from '@config/public/config-rows-new'

const limitArea = ref<any>({}) // 地区限制数据

const limitAreaSwitch = computed(() => {
	return limitArea.value?.limit_area_status == 'true' ? true : false
})

/**
 * @description: 设置地区登录限制
 */
const onSet = async () => {
	useDialog({
		title: '设置地区登录限制',
		component: () => import('./area-config.vue'),
		compData: { limitArea: limitArea.value, onRefresh: getLimitArea },
		showFooter: true,
		area: 70,
	})
}

/**
 * @description: 开启/关闭地区登录限制
 */
const onChange = async (val: boolean) => {
	await useConfirm({
		title: `${val ? '开启' : '关闭'}地区登录限制`,
		content: `${val ? `开启后，将会对面板登录地区进行限制` : `关闭后，设置的地区登录将失效`}，是否继续操作？`,
		icon: 'warning-filled',
	})

	await useDataHandle({
		loading: '正在设置，请稍候...',
		request: setLimitData({ limit_area_status: val }),
		message: true,
		success: getLimitArea,
	})
}

/**
 * @description: 获取地区限制数据
 */
const getLimitArea = async () => {
	const res = await useDataHandle({
		request: getLimitData(),
		data: {
			limit_area: Object,
			limit_area_status: String,
			limit_type: String,
		},
	})
	limitArea.value = res
}

onMounted(async () => getLimitArea())
</script>
