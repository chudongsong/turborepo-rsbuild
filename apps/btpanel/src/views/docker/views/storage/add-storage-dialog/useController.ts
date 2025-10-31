import { getDockerStore } from '@docker/useStore'
import { addStorage } from "@/api/docker";
import { useDataHandle } from "@/hooks/tools";

interface formDataProp {
	name: string
	driver: string
	driver_opts: string
	labels: string
	remark: string
	isAdv: boolean
}


const {
	refs: { isRefreshStorageList },
} = getDockerStore() // 表格刷新

// 提交
export const onConfirm = async (formDataRef:Ref<formDataProp>,popupClose:AnyFunction) => {
	useDataHandle({
		request: addStorage({
			data: JSON.stringify({ 
				name: formDataRef.value.name,
				driver: formDataRef.value.driver,
				driver_opts: formDataRef.value.driver_opts,
				labels: formDataRef.value.labels,
				remark: formDataRef.value.remark,
			}),
		}),
		message: true,
		loading: "正在设置网络...",
		success: ({ status }: { status: boolean }) => {
			if (status) {
				isRefreshStorageList.value = true;
				popupClose();
			}
		},
	});
}