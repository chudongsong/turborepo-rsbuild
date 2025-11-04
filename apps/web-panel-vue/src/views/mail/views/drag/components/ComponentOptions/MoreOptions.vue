<template>
	<template v-if="!show">
		<base-label>所有边框</base-label>
		<slot name="all"></slot>
	</template>
	<template v-else>
		<el-row :gutter="8">
			<el-col :span="12" class="mb-2">
				<base-label>上边框</base-label>
				<slot name="top"></slot>
			</el-col>
			<el-col :span="12" class="mb-2">
				<base-label>右边框</base-label>
				<slot name="right"></slot>
			</el-col>
			<el-col :span="12" class="mb-2">
				<base-label>左边框</base-label>
				<slot name="left"></slot>
			</el-col>
			<el-col :span="12" class="mb-2">
				<base-label>下边框</base-label>
				<slot name="bottom"></slot>
			</el-col>
		</el-row>
	</template>
</template>

<script lang="ts" setup>
import BaseLabel from './BaseLabel.vue'

interface Props {
	show: boolean
}

withDefaults(defineProps<Props>(), {
	show: false,
})
</script>
