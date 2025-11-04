<template>
	<div class="flex w-full h-full" :class="'theme-' + tab?.activeTypeInfo?.type">
		<ProductIntroduce v-if="!aliyunEcsLtd"></ProductIntroduce>
		<ProductSelect ref="productSelectRef"></ProductSelect>
		<UnbuyMask v-if="errorMask.status" />
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { router } from '@/router/index'
import { useGlobalStore } from '@/store/global'
import PRODUCT_PAYMENT_STORE from './store'
import HOME_SOFTWARE_STORE from '@home/views/software/store'

import UnbuyMask from './unbuy-mask/index.vue'
import ProductIntroduce from './product-introduce/index.vue'
import ProductSelect from './product-select/index.vue'

const { aliyunEcsLtd } = useGlobalStore()
const softwareStore = HOME_SOFTWARE_STORE()
// 插件参数
const props = withDefaults(defineProps<{ compData: any }>(), {
	compData: () => ({
		disablePro: true, // 是否禁用专业版，默认推荐企业版
		sourceId: '0', // 来源ID:默认 0，原默认来源为 27
		plugin: true,
		pluginInfo: {
			title: '',
			describe: '',
			pid: 0,
		},
		isHomeBubble: {},
	}),
})

const store = PRODUCT_PAYMENT_STORE()
const { productInfo: tab, emits, errorMask } = storeToRefs(store)
const { onCancel, init, $reset } = store

const emit = defineEmits<{ (event: 'close'): void }>()
emits.value = emit

onMounted(() => {
	init(props.compData)
})
onUnmounted(() => {
	$reset()
	sessionStorage.removeItem('PAY-VIEW-INFO-TIME')
	if (router.currentRoute.value.name === 'home') {
		softwareStore.getRecommendInfo() // 获取推荐信息
	}
})
defineExpose({
	onCancel,
})
</script>
