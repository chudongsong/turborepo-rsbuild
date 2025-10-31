<template>
	<div class="create-file-view flex">
		<div class="flex" :class="`${type === 'Dir' ? 'bt-open-dir folder-open-icon' : 'bt-open-dir file-text-icon'}`">
			<i class="icon"></i>
			<div class="flex-1 flex items-center">
				<el-input class="!w-[22rem] mr-[1.6rem]" v-focus clearable v-model="fileName" ref="createfile" @input="handleInput" @keyup.enter.native="$event.target.blur()" />
				<el-button type="primary" class="!mr-[.8rem]" @click="createContent"> 创建 </el-button>
				<el-button type="default" @click="cancelCreate">取消</el-button>
			</div>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { useMessage } from '@message/index'
import { createSelectionfile } from '@api/global'
interface Props {
	type: 'Dir' | 'File'
	path: string
	filelist: any
}

const { error: $error } = useMessage()
const emit = defineEmits(['createStatus'])
const props = withDefaults(defineProps<Props>(), {
	type: 'Dir',
})
let fileName = ref('')
const createfile = ref()

/**
 * @description: 新建文件/文件夹
 * @return {Void} void
 */
const createContent = async () => {
	const el = createfile.value
	if (!fileName.value) {
		$error(`${props.type === 'Dir' ? '文件夹' : '文件'}名称不能为空`)
		return
	}
	const res = await createSelectionfile({
		type: props.type,
		path: props.path + '/' + fileName.value,
	})
	if (res.status) {
		cancelCreate()
	} else {
		$error(res.msg)
		el.$el.querySelector('input').focus() //重新获取input焦点
	}
}

const cancelCreate = () => {
	props.filelist.value.shift()
	emit('createStatus')
}

/**
 * @description: 监听输入内容是否含有特殊字符
 * @param {String} val  名称
 * @return {Void} void
 */
const handleInput = (val: any) => {
	fileName.value = val
	if (/(\\|\/|\<|\>|\"|\&|\;)/g.test(val)) {
		$error('名称不能含有 /\\<>"&;符号')
		fileName.value = val.replace(/(\\|\/|\<|\>|\"|\&|\;)/g, '')
	}
}
</script>

<style lang="css" scoped>
.create-file-view .el-button + .el-button {
	margin-left: 0.5rem;
}

button.el-button--mini {
	padding: 0.2rem 0.4rem;
}
</style>
