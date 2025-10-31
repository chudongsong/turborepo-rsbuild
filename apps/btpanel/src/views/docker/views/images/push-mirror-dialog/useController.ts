import { getDockerStore } from '@docker/useStore'
import { getPushMirror, getStashList } from '@/api/docker'
import { useDataHandle,Message } from '@/hooks/tools'

interface formDataProp {
	tag: string
	name: string
	id: string
}


const {
	refs: { isRefreshTableList },
} = getDockerStore() // 表格刷新

// 仓库名选项
export const options = ref<any>([])


// 初始化
export const init = async (formDataRef:Ref<formDataProp>,popupClose:AnyFunction) => {
	// 获取仓库列表
	useDataHandle({
		request: getStashList(),
		data: Array,
		success: (data: any[]) => {
			if (data.length === 1) {
				const stash = data[0]
				if (stash.url == 'docker.io' && stash.name == 'docker官方库' && stash.username == '') {
					Message.error('docker官方库不支持推送镜像')
					popupClose()
				}
			}
			data.forEach((item: any) => {
				if (item.url == 'docker.io' && item.name == 'docker官方库' && item.username == '') return
				options.value.push({
					value: item.url,
					label: `${item.name}${item.url === 'docker.io' ? '' : `(${item.url})`}`,
					url: item.url,
					name: item.name,
				})
			})
			formDataRef.value.name = options.value[0]?.value || ''
		},
	})
}

// 提交
export const onConfirm = async (formDataRef:Ref<formDataProp>,popupClose:AnyFunction) => {

	let params = {
		tag: formDataRef.value.tag,
		id: formDataRef.value.id,
		name: options.value.find((item: any) => item.url == formDataRef.value.name).name,
		url: options.value.find((item: any) => item.url == formDataRef.value.name).url,
	}
	useDataHandle({
		request: getPushMirror({ data: JSON.stringify(params) }),
		message: true,
		success: ({ status }: { status: boolean }) => {
			if (status) {
				isRefreshTableList.value = true
				unmountHandler()
				popupClose()
			}
		},
	})
}

// 卸载
export const unmountHandler = () => {
	options.value = []
}