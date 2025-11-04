<template>
	<div class="p-[2rem]">
		<el-form class="exception-log-form">
			<el-form-item label="原因：">
				<el-popover placement="top-start" width="500" popper-class="white-tips-popover" trigger="hover" content="">
					<div>
						<span class="text-danger text-medium">{{ reason }}</span>
					</div>
					<template #reference>
						<div class="bg-light p-[.8rem] text-danger rounded-base truncate">{{ reason }}</div>
					</template>
				</el-popover>
			</el-form-item>
			<el-form-item label="日志：">
				<div class="bg-darkPrimary p-[1.2rem] min-h-[200px] max-h-[400px] overflow-y-auto w-full border-1 border-solid border-light rounded-base">
					<pre class="whitespace-pre-wrap text-small text-disabled">{{ logContent }}</pre>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	compData: {
		reason: string
		logContent: string
	}
}>()

const emit = defineEmits(['cancel'])

const reason = ref('')
const logContent = ref('')

watch(
	() => props.compData,
	val => {
		reason.value = val.reason
		logContent.value = val.logContent
	},
	{ immediate: true }
)

const handleClose = () => {
	emit('cancel')
}

defineExpose({
	handleClose,
})
</script>

<style scoped>
:deep(.exception-log-form .el-form-item__label) {
	min-width: 0px !important;
}
:deep(.exception-log-form .el-form-item) {
	align-items: center;
}
</style>
