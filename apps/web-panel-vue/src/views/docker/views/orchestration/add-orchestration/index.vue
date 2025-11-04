<template>
	<div class="flex flex-col p-[16px] lib-box">
		<bt-tabs type="card" v-model="tabActive">
			<el-tab-pane label="常规创建" name="first">
				<AddCommon ref="first" @close="close" @submit="compData.wsConfirm" />
			</el-tab-pane>
			<el-tab-pane label="使用模板" name="second">
				<AddCompose ref="second" @close="close" />
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>
<script setup lang="ts">
import AddCommon from './add-common.vue'
import AddCompose from '@docker/public/create-con-dialog/add-compose.vue'
interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const emits = defineEmits(['close'])

// 默认选中tab
const tabActive = ref('first')
const first = ref()
const second = ref()

// 提交
const onConfirm = async () => {
	try {
		if (tabActive.value == 'first') {
			first.value.onConfirm()
		} else {
			second.value.onConfirm()
		}
	} catch (error) {
		console.log(error)
	}
}
const close = () => {
	emits('close')
}
defineExpose({
	onConfirm,
})
</script>
<style scoped>
.lib-box table tr td,
.lib-box table tr th {
	@apply border-t-1 border-dark leading-34px text-left px-[8px];
}
.lib-box .lib-con {
	@apply border border-dark p-[1rem] my-[1rem] rounded-base bg-light leading-20px;
}
</style>
