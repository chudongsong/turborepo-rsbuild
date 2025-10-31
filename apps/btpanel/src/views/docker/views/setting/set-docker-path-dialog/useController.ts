import { getDockerStore } from '@docker/useStore'
import { setComposePath } from "@/api/docker";
import { fileSelectionDialog } from '@/public/index'
import { useDataHandle } from "@/hooks/tools";

interface formDataProp {
	path: string;
}


const {
	getSet
} = getDockerStore() // 表格刷新


/**
 * @description: 触发目录选择
 */
export const openFile = (formDataRef:Ref<formDataProp>) => {
	fileSelectionDialog({
		type: 'file',
		path: formDataRef.value.path,
		change: (path: string) => (formDataRef.value.path = path),
	})
}

/**
 * @description: 设置IPV6范围
 */
export const onConfirm = async (formDataRef: Ref<formDataProp>,popupClose:AnyFunction) => {
  try {
		useDataHandle({
			request: setComposePath({
				data: JSON.stringify({ docker_compose_path: formDataRef.value.path }),
			}),
			loading: '正在设置，请稍候...',
			message: true,
			success: ({ status }: { status: boolean }) => {
				if (status) {
					getSet()
					popupClose()
				}
			},
		})
  } catch (error) {
    console.log(error);
  }
};