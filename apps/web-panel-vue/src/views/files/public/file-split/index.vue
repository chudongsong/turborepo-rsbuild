<template>
	<div class="flex flex-col p-16px lib-box">
		<bt-alert type="warning" show-icon :closable="false">
			<template #title>
				<div>注意：</div>
				<div>1.被拆分成多个文件后，需要将它们合并才能使用</div>
				<div>2.拆分后如果其中一个文件被损坏或丢失，可能会影响整个文件的完整性</div>
			</template>
		</bt-alert>
		<el-form ref="quickFormRef" size="small" :model="quickForm" :rules="quickRules" :disabled="disable" label-width="8rem" class="relative w-full p-[1.5rem]" label-position="right" @submit.native.prevent>
			<el-form-item prop="type" label="拆分方式">
				<el-radio-group v-model="quickForm.type">
					<el-radio label="size">按大小拆分</el-radio>
					<el-radio label="num">按数量拆分</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item v-show="quickForm.type === 'size'" prop="size" label="大小">
				<div class="flex">
					<bt-input v-model.number="quickForm.size" width="14rem" type="number">
						<template #append> MB </template>
						<template #unit>拆分后的每个文件大小 </template>
					</bt-input>
				</div>
			</el-form-item>
			<el-form-item v-show="quickForm.type === 'num'" prop="num" label="数量">
				<div class="flex">
					<bt-input v-model.number="quickForm.num" width="14rem" type="number">
						<template #unit>文件大小 ÷ 数量 = 拆分大小 </template>
						<template #append>个 </template>
					</bt-input>
					<span class="ml-[2rem]"></span>
				</div>
			</el-form-item>
			<el-form-item prop="path" label="存放目录">
				<bt-input-icon v-model="quickForm.path" width="26rem" icon="icon-file_mode" @icon-click="openFile" :placeholder="`请选择目录`" />
			</el-form-item>
			<bt-help :options="help" list-style="disc" class="pl-2rem mt-2rem"> </bt-help>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_SPLIT_STORE from './store'

const store = FILES_SPLIT_STORE()
const { quickFormRef, quickForm, quickRules, disable } = storeToRefs(store)
const { help, openFile, init } = store

onMounted(init)
</script>

<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[9rem] text-default;
}

.el-form-item {
	@apply mb-[1.4rem];
}

.check :deep(.el-form-item__content) {
	@apply leading-[1.4];
}

:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 1.5rem !important;
}

:deep(.el-radio-group) {
	@apply align-middle;
}
</style>
