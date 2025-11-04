<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<bt-tabs v-model="menu" type="card" @change="clearLog">
			<el-tab-pane name="common" label="常规拉取">
				<el-form ref="cmdFormRef" size="default" :model="cmdForm" :rules="cmdRules" :disabled="disabled" class="relative w-full" :label-position="`right`" @submit.native.prevent>
					<el-form-item prop="name" label="仓库名">
						<bt-select v-model="cmdForm.name" :options="options" class="!w-[32rem]" />
					</el-form-item>
					<el-form-item prop="image" label="镜像名">
						<el-input class="!w-[32rem]" v-model="cmdForm.image" @keydown.enter="onConfirm" placeholder="请输入镜像名，按回车拉取,如:image:v1">
							<template #append>
								<el-button type="default" @click="onConfirm">拉取</el-button>
							</template>
						</el-input>
					</el-form-item>
					<div class="resultTitle px-[.2rem] py-[.4rem] mt-[1.6rem]">拉取结果：</div>
					<div class="rounded-small h-[45.6rem]">
						<bt-log class="h-[45.6rem] !rounded-none" :content="logContent" />
					</div>
				</el-form>
			</el-tab-pane>
			<el-tab-pane name="cmd" label="命令拉取">
				<el-form ref="cmdRef" size="large" :model="cmdForm" :rules="cmdRules" :disabled="disabled" class="relative w-full" :label-position="`right`" @submit.native.prevent>
					<el-form-item prop="cmd">
						<el-input autofocus v-model="cmdForm.cmd" @keyup.enter="onConfirm" placeholder="请输入需要执行的命令,docker pull redis:latest，按回车执行">
							<template #append>
								<el-button type="default" @click="onConfirm">执行命令</el-button>
							</template>
						</el-input>
					</el-form-item>
					<div class="resultTitle px-[.2rem] py-[.4rem] mt-[1.6rem]">拉取结果：</div>
					<div class="rounded-small h-[45.6rem]">
						<bt-log class="h-[45.6rem] !rounded-none" :content="logContent" />
					</div>
				</el-form>
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>
<script setup lang="ts">
import { disabled, logContent, menu, cmdForm, cmdRules, clearLog, onConfirm as submitHandler, options, refreshTable, init, unmountHandler } from './useController'

const cmdFormRef = ref()

const onConfirm = () => {
	submitHandler(cmdFormRef)
}

onMounted(() => {
	init()
})

onUnmounted(() => {
	unmountHandler()
})

defineExpose({
	onConfirm,
	onCancel: refreshTable,
})
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}

.portTable :deep(.el-form-item__label) {
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-light border-darkSecondary border-[1px] border-light rounded-l-base px-[1rem] box-border;
}
.el-form-item {
	@apply mb-[1.5rem];
}
:deep(.el-input-group__append) {
	@apply bg-primary text-white;
}
:deep(.is-disabled .el-input-group__append) {
	@apply bg-light text-disabled;
}
</style>
