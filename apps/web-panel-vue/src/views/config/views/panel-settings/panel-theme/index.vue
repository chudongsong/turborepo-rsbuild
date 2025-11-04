<template>
	<config-rows label="面板主题">
		<template #value>
			<el-radio-group v-model="themeValue">
				<el-radio-button label="默认" value="default" />
				<el-radio-button label="暗黑" value="dark" />
				<el-radio-button label="自定义" value="user" />
			</el-radio-group>
		</template>
		<template #desc>
			<span>提示xxx</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import ConfigRows from '@config/public/config-rows-new'

const themeValue = ref('default') // 主题值
</script>
