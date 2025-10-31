<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<bt-tabs type="card" v-model="tabActive">
			<el-tab-pane label="添加Compose模板" name="first">
				<AddComposeTemplate ref="first" @close="close" @complate="callbackEvent" />
			</el-tab-pane>
			<el-tab-pane label="搜索本地模板" name="second">
				<SearchLocalTemplate ref="second" @close="close" @complate="callbackEvent" />
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>
<script setup lang="ts">
import AddComposeTemplate from './add-compose-template.vue'
import SearchLocalTemplate from './search-local-template.vue'

const emits = defineEmits(['close'])

const props = withDefaults(defineProps<{ compData?: any }>(), {
	compData: () => ({}),
})

// 默认选中tab
const tabActive = ref('first')
const first = ref()
const second = ref()

const callbackEvent = (res: any) => {
	if (props.compData?.callback) {
		props.compData.callback(res)
	}
}

// 提交
const onConfirm = async () => {
	try {
		if (tabActive.value == 'first') {
			first.value.onConfirm()
		} else {
			second.value.confirm()
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
<style lang="css" scoped>
.lib-box table tr td,
.lib-box table tr th {
	@apply border-t-1 border-base leading-34px text-left px-[.8rem];
}
.lib-con {
	@apply border border-base p-[1rem] my-[1rem] rounded-base bg-light leading-20px;
}
</style>
