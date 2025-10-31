<template>
	<div class="p-20px">
		<el-form :model="fileMonitorForm" ref="addFileMonitorRef" :rules="rules">
			<el-form-item prop="path" label="监测路径">
				<bt-input-icon v-model="fileMonitorForm.path" class="!w-[28rem]" icon="icon-file_mode" @icon-click="openFile" :disabled="!!props.compData.row" @change.passive="clearSpace('path')" :placeholder="`请选择文件目录`" />
			</el-form-item>
			<el-form-item label="告警操作" prop="actions">
				<el-checkbox-group v-model="fileMonitorForm.actions">
					<el-checkbox v-for="(item, index) in alertType" :key="index" :label="item.name" :disabled="isDirs && index > 0">
						<div>
							<span>{{ item.title }}</span>
						</div>
					</el-checkbox>
				</el-checkbox-group>
			</el-form-item>
		</el-form>
		<bt-help :options="[{ content: '目录暂时只支持读取告警操作' }]" class="ml-20px mt-20px" list-style="disc"></bt-help>
	</div>
</template>
<script setup lang="ts">
import { setSiteFileMonitor } from '@/api/firewall'
import { fileSelectionDialog } from '@/public/index'
import { useDataHandle } from '@hooks/tools'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const fileMonitorForm = reactive<any>({
	path: '',
	type: 'dir',
	domain: props.compData.name,
	actions: [],
})

const addFileMonitorRef = ref() // 表单ref
const isDirs = computed(() => fileMonitorForm.type === 'dir') // 是否为文件夹
const alertType = [
	{ name: 'read', title: '读取' },
	{ name: 'del', title: '删除' },
	{ name: 'reit', title: '修改/增加' },
] // 告警操作
const rules = {
	path: [{ required: true, message: '请选择监测路径', trigger: 'blur' }],
	actions: [{ required: true, message: '请选择告警操作', trigger: 'change' }],
}

/**
 * @description: 触发目录选择
 */
const openFile = () => {
	if (!!props.compData.row) return
	fileSelectionDialog({
		type: 'all',
		path: fileMonitorForm.path,
		change: (path: string, type: string) => {
			fileMonitorForm.path = path
			fileMonitorForm.type = type
			if (type === 'dir') {
				fileMonitorForm.actions = ['read']
			} else {
				fileMonitorForm.actions = ['read', 'del', 'reit']
			}
		},
	})
}

/**
 * @description: 清除空格
 */
const clearSpace = (name: string) => {
	fileMonitorForm.path = fileMonitorForm.path.replace(/\s+/g, '')
}

/**
 * @description: 判断路径是文件还是文件夹
 */
const checkFileType = (pathString: string): string => {
	// 当结尾为/时为文件夹,结尾不为/时寻找该路径的最后一个/,并截取后续的内容判定其中是否包含'.',若包含,则为文件,否则为文件夹
	if (pathString.endsWith('/')) {
		return 'dir'
	} else {
		const index = pathString.lastIndexOf('/')
		const path = pathString.substring(index + 1)
		if (path.includes('.')) {
			return 'file'
		} else {
			return 'dir'
		}
	}
}

/**
 * @description: 添加文件监视器
 */
const onConfirm = async (close: any) => {
	await addFileMonitorRef.value.validate()
	let params: any = { ...fileMonitorForm }
	let actions = [0, 0, 0, 0] //actions: 1,1,1,1 读取 删除 修改 增加
	// 判定fileMonitorForm中的action内容,若为read,则将其余的内容置为0,若为del,则将其余的内容置为0,若为reit,则将其余的内容置为0
	if (fileMonitorForm.actions.includes('read')) actions[0] = 1
	if (fileMonitorForm.actions.includes('del')) actions[1] = 1
	if (fileMonitorForm.actions.includes('reit')) {
		actions[2] = 1
		actions[3] = 1
	}
	params.actions = actions.join(',')
	await useDataHandle({
		loading: '正在添加文件监视器，请稍后...',
		request: setSiteFileMonitor(!!props.compData.row, { ...params }),
		message: true,
		success: (res: any) => {
			if (res.status) {
				props.compData.refresh && props.compData.refresh()
				close()
			}
		},
	})
}

/**
 * @description: 初始化
 */
const init = () => {
	if (props.compData.path) {
		fileMonitorForm.path = props.compData.path.replace('//', '/')
	}
	if (props.compData.row) {
		const typeArr = ['del', 'read', 'reit']
		const arr: any = []
		Object.entries(props.compData.row).forEach(([key, value]) => {
			if (typeArr.includes(key)) Number(value) && arr.push(key)
		})
		fileMonitorForm.type = props.compData.row.type
		fileMonitorForm.actions = arr
	}
}

onMounted(() => init())

defineExpose({ onConfirm })
</script>
