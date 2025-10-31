<template>
	<div class="container-dialog">
		<bt-tabs type="card" v-model="tabActive" @tab-click="handleChangeTabs">
			<el-tab-pane label="手动创建" name="manual" class="overflow-y-auto">
				<ContainerEdit ref="manual" type="add" :compData="compData" @close="close" />
			</el-tab-pane>
			<el-tab-pane label="命令创建" name="cmd" :lazy="true">
				<CreateConCmd ref="cmd" />
			</el-tab-pane>
			<el-tab-pane label="容器编排" name="compose" class="mt-[.4rem]" :lazy="true">
				<AddCompose ref="compose" @close="close" />
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>
<script setup lang="ts">
import { getDockerStore } from '@docker/useStore'

import ContainerEdit from './container-edit.vue'
import CreateConCmd from './create-con-cmd.vue'
import AddCompose from './add-compose.vue'
interface Props {
	compData?: any
}

const popupSetFooter = inject<any>('popupSetFooter') //     弹窗切换底部按钮展示

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const emits = defineEmits(['close'])

const {
	refs: { isRefreshTableList },
} = getDockerStore()

// 组件ref
const manual = ref<any>()
const cmd = ref<any>()
const compose = ref<any>()

// 默认选中tab
const tabActive = ref('manual')

// 弹窗关闭
const close = () => {
	emits('close')
	isRefreshTableList.value = true
}

const handleChangeTabs = (tab: any) => {
	console.log(tab, '324324')
	tabActive.value = tab?.props.name
	if (tabActive.value === 'cmd') {
		popupSetFooter(false)
	} else {
		popupSetFooter(true)
	}
}

// 提交
const onConfirm = () => {
	if (tabActive.value === 'manual') {
		manual.value.onConfirm()
		// openNps()
	} else if (tabActive.value === 'cmd') {
		// cmd.value.onConfirm()
		close()
	} else {
		compose.value.onConfirm()
	}
}

defineExpose({
	onConfirm,
})
</script>
<style lang="css" scoped>
.container-dialog {
	@apply flex flex-col p-[1.6rem];
}
.lib-box table tr td,
.lib-box table tr th {
	@apply border-t-1 border-base leading-34px text-left px-[.8rem];
}
.lib-con {
	@apply border border-base p-[1rem] my-[1rem] rounded-base bg-light leading-20px;
}
</style>
