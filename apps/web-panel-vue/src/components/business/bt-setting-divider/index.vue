<template>
	<div>
		<div v-if="isShowDivider">
			<el-divider class="!mb-[1rem]"></el-divider>
			<bt-link class="w-full text-center cursor-pointer flex items-center justify-center"
				@click="showConfig = !showConfig">点击{{ showConfig ? '收起' : '查看' }}，更多配置
				<i :class="`svgtofont-el-arrow-${showConfig ? 'up' : 'down'}`"></i>
			</bt-link>
		</div>

		<div v-show="showConfig" class="mt-[2rem]">
			<slot name="config"></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineModel } from 'vue'

interface Props {
	isShowDivider?: boolean // 是否显示分割线
}

const props = withDefaults(defineProps<Props>(), {
	isShowDivider: true,
})

// 是否显示配置
const showConfig = defineModel<boolean>('showConfig', { required: false })

onMounted(() => {
	if (!props.isShowDivider) showConfig.value = true // 不显示分割线时默认展开内容
})
</script>
