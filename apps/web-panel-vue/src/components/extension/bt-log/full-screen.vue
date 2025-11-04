<template>
  <div
    class="w-full flex flex-col p-2rem"
    :style="{ height: windowHeight + 'px !important' }"
  >
    <div class="mb-1rem">
      <el-button @click="refreshEvent">刷新日志</el-button>
    </div>
    <div class="flex-1">
      <BtLog
        :style="{ height: logHeight + 'px' }"
        :content="content"
        :is-html="compData.isHtml"
        :auto-scroll="compData.autoScroll"
      />
    </div>
  </div>
</template>

<script lang="tsx" setup>
import { Message } from '@/hooks/tools'
import type { FullScreenDialogProps } from './index'
import BtLog from './index.vue'

interface Props {
	compData: FullScreenDialogProps
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		isHtml: false,
		autoScroll: true,
		onRefresh: () => ({}),
		getContent: () => '',
	}),
})

const content = ref('')
const windowHeight = ref(window.innerHeight - 44)
const logHeight = ref(window.innerHeight - 124)

window.onresize = () => {
	windowHeight.value = window.innerHeight - 44
	logHeight.value = window.innerHeight - 124
}

// 刷新日志
const refreshEvent = async () => {
	await props.compData.onRefresh()
	content.value = props.compData.getContent()
	Message.success('刷新成功')
}

onMounted(() => {
	content.value = props.compData.getContent()
})
</script>

<style>
.el-dialog__wrapper {
  height: 100% !important;
  overflow: inherit !important;
}

.full-screen-dialog.el-dialog {
  height: 100% !important;
}

.full-screen-dialog.el-dialog .el-dialog__body {
  max-height: max-content !important;
  overflow-y: hidden !important;
}
</style>
