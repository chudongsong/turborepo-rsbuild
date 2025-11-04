<template>
	<container :label="label || '文本对齐'">
		<template #value>
			<el-radio-group size="default" v-model="value">
				<el-radio-button label="left">左对齐</el-radio-button>
				<el-radio-button label="center">居中对齐</el-radio-button>
				<el-radio-button label="right">右对齐</el-radio-button>
			</el-radio-group>
		</template>
	</container>
</template>

<script lang="ts" setup>
import Container from './BaseContainer.vue'

interface Props {
	label?: string
}

withDefaults(defineProps<Props>(), {
	label: '',
})

const value = defineModel<string>('value')
</script>

<style lang="scss" scoped></style>
