import { getDockerStore } from '@docker/useStore'
import { addStash, editStash } from "@/api/docker";
import { useDataHandle } from "@/hooks/tools";

interface formDataProp {
	registry: string
	name: string
	username: string
	password: string
	namespace: string
	remark: string
	id: string
}

const {
	refs: { isRefreshWarehouseList },
} = getDockerStore() // 表格刷新

// 提交
export const onConfirm = async (formDataRef:Ref<formDataProp>,popupClose:AnyFunction) => {
	useDataHandle({
		request: !formDataRef.value.id
				? addStash({
						data: JSON.stringify({
							registry: formDataRef.value.registry,
							name: formDataRef.value.name,
							username: formDataRef.value.username,
							password: formDataRef.value.password,
							namespace: formDataRef.value.namespace,
							remark: formDataRef.value.remark,
						}),
					})
				: editStash({
						data: JSON.stringify(formDataRef.value),
					}),
		message: true,
		loading: "正在设置",
		success: ({ status }: { status: boolean }) => {
			if (status) {
				isRefreshWarehouseList.value = true;
				popupClose();
			}
		},
	});
}