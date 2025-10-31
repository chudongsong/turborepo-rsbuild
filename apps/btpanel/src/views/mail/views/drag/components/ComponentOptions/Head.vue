<template>
	<container label="标题类型">
		<template #value>
			<el-radio-group size="default" v-model="value">
				<el-radio-button label="22px">H1</el-radio-button>
				<el-radio-button label="20px">H2</el-radio-button>
				<el-radio-button label="18px">H3</el-radio-button>
				<el-radio-button label="16px">H4</el-radio-button>
			</el-radio-group>
		</template>
	</container>
</template>

<script lang="ts" setup>
import Container from './BaseContainer.vue'

const value = defineModel<string>('value')
</script>

<style lang="scss" scoped></style>
