<template>
	<div>
		<div class="flex items-center">
			<el-button type="primary" @click="onImport">导入</el-button>
			<div class="ml-40px">
				文件名:
				<span :class="fileName ? 'text-primary' : 'text-dangerDark'">
					{{ fileName || '未选择任何文件' }}
				</span>
			</div>
		</div>
		<slot></slot>
	</div>
</template>

<script lang="ts" setup>
import { openUploadDialog } from '@mail/useMethod'

interface Props {
	path: string
	accept?: string[]
}

const props = withDefaults(defineProps<Props>(), {
	path: '',
	accept: () => [],
})

const { path, accept } = props

const fileName = defineModel<string>('value')

// 添加 watch 来监听值的变化
watch(fileName, newValue => {
	// 当 fileName 发生变化时触发
	emit('change', newValue)
})

// 定义 emit
const emit = defineEmits(['change'])

const onImport = () => {
	openUploadDialog({
		path,
		size: 5,
		uploadData: {
			accept: accept.map(item => `.${item}`).join(','),
			multiple: false,
			limit: 1,
		},
		refreshEvent: (fileList: any, popupClose: any) => {
			fileName.value = fileList[0].name
			popupClose()
		},
	})
}
</script>
