<template>
	<el-alert type="error" :closable="false" class="!mb-10px">
		<template #title>
			<div class="text-small flex items-center">
				<i class="svgtofont-el-warning-filled text-[var(--el-color-error-light-8)] mr-4px !text-medium"></i>
				{{ tips || '本功能将在下个正式版本被移除' }},
				<div v-if="showSurvey" class="inline-flex items-cenetr">
					如有疑问请直接
					<i class="svgtofont-el-service mx-2px text-primary"></i>
					<span class="bt-link" @click="onlineServiceDialog()"> 联系客服</span>
				</div>
			</div>
		</template>
	</el-alert>
</template>

<script lang="ts" setup>
import { onlineServiceDialog } from '@/public/popup'

interface Props {
	tips?: string // 提示内容
	showSurvey?: boolean // 是否显示问卷
}

const props = withDefaults(defineProps<Props>(), {
	tips: '',
	showSurvey: true,
})
</script>
