import { getDockerStore } from '@docker/useStore'
import { getURL, setDockerGlobal, delURL } from "@/api/docker";
import { useDataHandle,useConfirm } from "@/hooks/tools";

interface formDataProp {
	registry_mirrors_address: string;
}


const {
	refs:{settingData},
	getSet
} = getDockerStore() // 表格刷新

export const options = ref<any[]>([])
const unDelOptionArr = ['不使用加速', settingData.value.bad_registry_path]

export const querySearch = (queryString: string, cb: any) => {
	cb(options.value)
}
// 是否显示删除
export const showDel = (path: string) => !unDelOptionArr.includes(path)


// 删除url
export const deleteUrl = async (url: string) => {
	try {
		await useDataHandle({
			loading: '正在删除加速URL，请稍候...',
			request: delURL({
				data: JSON.stringify({ registry_mirrors_address: url }),
			}),
			message: true,
			success: async (res: any) => {
				if (res.status) {
					const ress = await getURL()
					const arr: any[] = []
					Object.entries(ress.data.com_reg_mirrors).forEach((item: any) => {
						arr.push({
							label: `${item[0]}(${item[1]})`,
							value: item[0],
						})
					})
					options.value = arr
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

// 提交
export const onConfirm = async (formDataRef:Ref<formDataProp>,popupClose:AnyFunction) => {
	try {
		await useConfirm({
			title: `设置加速URL`,
			content: `设置后需要重启docker，请确保可以重启docker再操作！`,
		})

		await useDataHandle({
			loading: '正在设置加速URL，请稍候...',
			request: setDockerGlobal({
				registry_mirrors_address: formDataRef.value.registry_mirrors_address === '不使用加速' ? '' : formDataRef.value.registry_mirrors_address
			}),
			message: true,
			success: (res: any) => {
				if (res.status) {
					getSet()
					popupClose()
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

export const getInitData = (props:any) => {
	if (settingData.value.bad_registry) {
		return {
			registry_mirrors_address: settingData.value.bad_registry_path
		}
	}
	return {
		registry_mirrors_address: props.compData.url === '' || props.compData.url === '未设置加速URL' ? '不使用加速' : JSON.parse(JSON.stringify(props.compData.url))
	}
}

export const init = (props:any,formDataRef:Ref<formDataProp>) => {
	const arr: any[] = [{ label: '不使用加速', value: '不使用加速' }]
	options.value = [...settingData.value.options, ...arr]
	if (settingData.value.bad_registry) {
		options.value.unshift({
			label: `${settingData.value.bad_registry_path}(推荐)`,
			value: JSON.parse(JSON.stringify(settingData.value.bad_registry_path)),
		})
	}
}
