<template>
	<container label="圆角边框">
		<template #value>
			<span class="mr-12px">更多选项</span>
			<el-switch v-model="config.more" @change="onUpdateMore" />
		</template>
		<template #options>
			<more-options :show="config.more">
				<template #all>
					<base-number v-model:value="config.all" />
				</template>
				<template #top>
					<base-number v-model:value="config.top" />
				</template>
				<template #left>
					<base-number v-model:value="config.left" />
				</template>
				<template #right>
					<base-number v-model:value="config.right" />
				</template>
				<template #bottom>
					<base-number v-model:value="config.bottom" />
				</template>
			</more-options>
		</template>
	</container>
</template>

<script lang="ts" setup>
import { MoreConfigStyle } from '../base'

import Container from './BaseContainer.vue'
import MoreOptions from './MoreOptions.vue'
import BaseNumber from './BaseNumber.vue'

const config = defineModel<MoreConfigStyle<string>>('value', {
	default: () => ({
		more: false,
		all: '',
		top: '',
		left: '',
		right: '',
		bottom: '',
	}),
})

const onUpdateMore = (val: boolean | string | number) => {
	if (val) {
		config.value.top = config.value.all
		config.value.right = config.value.all
		config.value.bottom = config.value.all
		config.value.left = config.value.all
	} else {
		config.value.all = config.value.top
	}
}
</script>
