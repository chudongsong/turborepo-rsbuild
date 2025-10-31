import { getDockerStore } from '@docker/useStore'
import { fileSelectionDialog } from '@/public/index'
import { getExportMirror } from '@/api/docker'
import { useDataHandle } from '@/hooks/tools'

interface formDataProp {
	path: string,
	name: string,
	id: string,
}


const {
	refs: { isRefreshTableList },
} = getDockerStore() // 表格刷新

/**
 * @description: 触发目录选择
 */
export const openFile = (formDataRef:Ref<formDataProp>) => {
	fileSelectionDialog({
		type: 'dir',
		change: path => {
			formDataRef.value.path = path
		},
	})
}
// 提交
export const onConfirm = async (formDataRef:Ref<formDataProp>,popupClose:AnyFunction) => {
	useDataHandle({
		request: getExportMirror({ data: JSON.stringify(formDataRef.value) }),
		message: true,
		success: ({ status }: { status: boolean }) => {
			if (status) {
				isRefreshTableList.value = true
				popupClose()
			}
		},
	})
}