<template>
	<div class="flex items-center !w-[100%] pr-[.5rem]" @click.stop v-show="row.isReName">
		<bt-input ref="reNameInputRef" class="rename-input h-[20px] ml-2px" width="auto" v-model="row.fileName" @keydown.stop.native @keyup.enter.native="onKeyup" v-focus></bt-input>
		<span class="svgtofont-el-select ml-[.5rem] !text-extraLarge font-800" style="color: #20a53a" @click.stop="changeReName"></span>
		<span class="svgtofont-el-close-bold ml-[.5rem] !text-extraLarge font-800" style="color: #f34a4a" @click.stop="closeReName"></span>
	</div>
</template>

<script setup lang="ts">
import { createNewFile, setFileName } from '@api/files'
import { matchUnqualifiedString } from '@files/useMethods'
import { ref, watch } from 'vue'
import { isNewMenuShow, treeRef, reNameInputRef } from '@files/public/ace/sidebar/useMethods'
import { useDataHandle, useMessage } from '@/hooks/tools'

const Message = useMessage()

const props: any = defineProps({
	rowData: {
		type: Object,
		default: () => ({}),
	},
	refreshData: {
		type: Function,
		default: () => {},
	},
	value: {
		type: Object,
		default: () => ({}),
	},
})

const emit = defineEmits(['update:value'])

const row = ref(props.rowData)
let oldName = '' // 用于记录重命名前的文件名

const getChangePath = (path: string, fileName: string) => {
	const pathRegex = /^(.*\/)/
	const match = path.match(pathRegex)
	const fullPath = match ? match[1] : ''
	return `${fullPath}${fileName}`
}

const onKeyup = (e: any) => {
	e.stopPropagation()
	e.preventDefault()
	// row.value.isReName = false
	// 获取重命名后的值
	row.value.fileName = e.target.value
	// isNewMenuShow.value = false
	fileRename({ row: row.value })
}

const changeReName = () => {
	// row.value.isReName = false
	// isNewMenuShow.value = false
	fileRename({ row: row.value })
}

const closeReName = () => {
	row.value.isReName = false
	if (row.value.isNew) {
		const node = treeRef.value.getNode(row.value?.path)
		treeRef.value.remove(node.data)
	}
	isNewMenuShow.value = false
}

/* 文件重命名/新建文件
 * @param {FileDataProps} item 文件数据
 */
const fileRename = async ({ row }: { row: any }): Promise<void> => {
	if (row.fileName === '') {
		Message.error('文件名不能为空')
		// props.refreshData()
		return
	}
	if (matchUnqualifiedString(row.fileName)) {
		Message.error('文件名不能包含以下字符：\\ / : * ? " < > |')
		// props.refreshData()
		return
	}
	if (row.isNew) {
		// 新建
		const path = `${row.path}/${row.fileName}`
		await useDataHandle({
			loading: '正在新建文件，请稍候...',
			request: createNewFile({
				path: path.replace(/\/\//g, '/'),
				type: row.type,
			}),
			message: true,
			success: (res: any) => {
				if (res.status) {
					row.isReName = false
					isNewMenuShow.value = false
					props.refreshData()
				}
			},
		})
	} else {
		// 重命名
		// 名称没变化
		if (row.fileName === oldName) {
			Message.error('文件名没有变化')
			return
		}
		await useDataHandle({
			loading: '正在重命名，请稍候...',
			request: setFileName({
				sfile: getChangePath(row.path, oldName),
				dfile: getChangePath(row.path, row.fileName),
				rename: true,
			}),
			message: true,
			success: (res: any) => {
				if (res.status) {
					row.isReName = false
					isNewMenuShow.value = false
					props.refreshData()
				}
			},
		})
	}
}

watch(
	() => props.rowData,
	() => {
		if (props.rowData) {
			row.value = props.rowData
			emit('update:value', row.value)
		}
	},
	{ immediate: true }
)

// 监听row.isReName为true时，自动聚焦
watchEffect(() => {
	if (row.value.isReName) {
		nextTick(() => {
			// reNameInputRef.value?.focus()
			oldName = row.value.fileName // 在开始重命名时更新oldName
		})
	}
	isNewMenuShow.value = row.value.isReName
})

defineExpose({
	reNameInputRef,
})
</script>
