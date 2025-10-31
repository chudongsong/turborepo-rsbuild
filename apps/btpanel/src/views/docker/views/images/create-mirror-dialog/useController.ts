import { getDockerStore } from '@docker/useStore'
import { fileSelectionDialog } from '@/public/index'
import { getBuildMirror } from '@/api/docker'
import { useDataHandle } from '@/hooks/tools'

interface formDataProp {
	type: 'path' | 'data',
	path: string,
	data: string,
	tag: string,
}


const {
	refs: { isRefreshTableList },
} = getDockerStore() // 表格刷新



// 验证路径
export const validatePath = (formDataRef:Ref<formDataProp>,rule: any, value: string, callback: any) => {
	if(formDataRef.value.type === 'path' && !value){
		callback(new Error('请输入路径'))
	}
	callback()
}
// 验证数据
export const validateData = (formDataRef:Ref<formDataProp>,rule: any, value: string, callback: any) => {
	if(formDataRef.value.type === 'data' && !value){
		callback(new Error('请输入内容'))
	}
	callback()
}


// 类型
export const options = [
	{ label: '路径', value: 'path' },
	{ label: '内容', value: 'data' },
]
/**
 * @description: 触发目录选择
 */
export const openFile = (formDataRef:Ref<formDataProp>) => {
	fileSelectionDialog({
		type: 'file',
		change: path => {
			formDataRef.value.path = path
		},
	})
}
// 提交
export const onConfirm = async (formDataRef:Ref<formDataProp>,popupClose:AnyFunction) => {
	const isDataType = formDataRef.value.type === 'data'
	// 准备请求数据
	const requestData = isDataType ? { data: formDataRef.value.data, tag: formDataRef.value.tag } : { path: formDataRef.value.path, tag: formDataRef.value.tag }
	await useDataHandle({
		request: getBuildMirror({ data: JSON.stringify(requestData) }),
		message: true,
		success: ({ status }: { status: boolean }) => {
			if (status) {
				popupClose()
				isRefreshTableList.value = true // 刷新镜像列表
			}
		},
	})
}