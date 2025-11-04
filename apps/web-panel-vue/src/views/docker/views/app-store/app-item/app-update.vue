<template>
	<div class="p-2rem">
		<el-form :model="updateForm">
			<el-form-item label="可更新版本">
				<el-select v-model="updateForm.version" filterable class="!w-[12rem]">
					<el-option v-for="item in updateVersionList" :key="item.version" :label="item.version" :value="item.version" />
				</el-select>
			</el-form-item>
			<div class="flex flex-col ml-2rem">
				<el-checkbox v-model="updateForm.backup" class="my-1.6rem">更新前备份应用数据</el-checkbox>
				<el-checkbox v-model="updateForm.pull">强制拉取镜像</el-checkbox>
			</div>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { updateVersionList,getVersionData,updateConfirm,updateForm,updateUnmountedHandle } from './useController'
interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: '',
})
onMounted(()=> getVersionData(props.compData))

onUnmounted(() => {
	updateUnmountedHandle()
})

defineExpose({
	onConfirm:updateConfirm,
})
</script>

<style scoped></style>
