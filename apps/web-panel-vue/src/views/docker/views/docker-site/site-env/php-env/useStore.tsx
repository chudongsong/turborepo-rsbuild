import { useHandleError, useDataHandle, useConfirm, Message, useDialog } from '@/hooks/tools'
import { getEnvExtend, getEnvExtendTemplate, delPhpTemplate as delTemplate, delBatchPhpTemplate } from '@/api/docker'
import type { TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d'

const DOCKER_SITE_ENV_PHP_STORE = defineStore('DOCKER-SITE-ENV-PHP-STORE', () => {
	const isEdit = ref<boolean>(false) // 是否编辑
	const rowData = ref() // 行数据
	const versionOptions = ref([]) // 版本选项
	const extendOptions = ref([]) // 扩展源选项
	const templateOptions = ref([]) // 扩展模板选项
	const extendsupOptions = shallowRef([]) // 支持的扩展源选项
	const allData = shallowRef<any>({}) // 所有数据
	const popoverFocus = ref(false) // 弹出框焦点

	const refreshTemplateTable = ref<boolean>(false) // 刷新模板列表

	const setRefreshTemplateTable = () => {
		refreshTemplateTable.value = true
	}

	/**
	 * @description 获取php扩展源
	 */
	const getExtend = async (version: string = 'all') => {
		try {
			const params = { version }
			const res: any = await useDataHandle({
				loading: `正在获取版本，请稍后...`,
				request: getEnvExtend(params),
				message: false,
			})
			if (res.status) {
				allData.value = res.data
			} else {
				Message.error(res.msg)
				useHandleError(res)
			}
		} catch (error) {
			useHandleError(error)
		}
	}
	/**
	 * @description 获取扩展模板
	 */
	const getTemplate = async (params?: { p: number; row: number }) => {
		try {
			const res: any = await useDataHandle({
				loading: `正在获取版本，请稍后...`,
				request: getEnvExtendTemplate(params || { p: 1, row: 100 }),
				message: false,
			})
			if (res.status) {
				templateOptions.value = res.data.data.map((item: any) => ({ label: item.name, name: item.name, value: item.id, ext: item.exts, version: item.version, disabled: false }))
			} else {
				Message.error(res.msg)
				useHandleError(res)
				return false
			}
		} catch (error) {
			useHandleError(error)
		}
	}

	/**
	 * @description 删除环境
	 */
	const delPhpTemplate = async (row: { id: number; name: string }, type: 'php' | 'java' | 'python' | 'go', callback?: AnyFunction) => {
		try {
			await useConfirm({
				title: `删除【${row.name}】模板`,
				content: `删除【${row.name}】模板，此操作不可逆，是否继续操作？`,
				icon: 'warning-filled',
			})

			await useDataHandle({
				loading: `正在删除，请稍后...`,
				request: delTemplate({ id: row.id }),
				message: true,
				success: (res: any) => {
					setRefreshTemplateTable()
					callback && callback(res)
				},
			})
		} catch (error) {
			useHandleError(error)
		}
	}

	/**
	 * @description 批量处理事件
	 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
	 * @param {TableBatchNextAllProps} nextAll 选中处理事件
	 * @param {AnyObject[]} selectedList 选中的数据
	 * @param {TableBatchOptionsProps} options 选中的配置
	 * @returns {Promise<void>} void
	 */
	const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
		// const { label, value } = options;
		// const template: Map<string, string> = new Map([
		//   ['start', '批量启动选中项目后，项目将正常访问'],
		//   ['stop', '批量停用选中的项目后，项目将会停止运行'],
		//   ['restart', '批量重启选中的项目后，项目将会重新启动'],
		//   ['delete', '批量删除选中的项目后，项目将无法恢复'],
		// ]);
		// const requestHandle = async (item: AnyObject, index: number) => {
		//   const requestList: Map<string, AnyFunction> = new Map([
		//     ['delete', delBatchPhpTemplate],
		//   ]);
		//   const { name: username } = item;
		//   const fn = requestList.get(value);
		//   switch (value) {
		//     case 'delete':
		//       if (fn) {
		//         return await fn(
		//           { data: JSON.stringify({ name: username }) },
		//         );
		//       }
		//   }
		// };
		await useConfirm({
			title: `删除模板`,
			content: `删除选中的${selectedList.value.length}个模板，此操作不可逆，是否继续操作？`,
			icon: 'warning-filled',
		})

		const params = { ids: selectedList.value.map((env: { id: number }) => env.id).join(',') }
		// 数据处理
		await useDataHandle({
			loading: `正在删除，请稍后...`,
			request: delBatchPhpTemplate(params),
			success: async (res: any) => {
				if (Array.isArray(res.data.data))
					await useDialog({
						title: `批量删除结果`,
						area: 42,
						component: () => import('@components/extension/bt-result/index.vue'),
						compData: {
							resultData: res.data.data.map((item: any) => {
								const selectedEnv = selectedList.value.find((env: any) => env.id === Number(item.id))
								return {
									name: selectedEnv?.name,
									status: item.status,
									msg: item.msg,
								}
							}),
							resultTitle: '删除扩展模板',
						},
					})
				else Message.request(res)
				setRefreshTemplateTable()
				clearSelection()
			},
		})
	}

	// 初始化数据
	const resetData = () => {
		versionOptions.value = []
		extendOptions.value = []
		templateOptions.value = []
		popoverFocus.value = false
		isEdit.value = false
		rowData.value = {}
		extendsupOptions.value = []
		allData.value = {}
	}

	return {
		versionOptions,
		extendOptions,
		templateOptions,
		extendsupOptions,
		resetData,
		getExtend,
		getTemplate,
		popoverFocus,
		isEdit,
		rowData,
		allData,
		refreshTemplateTable,
		setRefreshTemplateTable,
		delPhpTemplate,
		useBatchEventHandle,
	}
})

const useDockerSiteEnvStore = () => {
	return storeToRefs(DOCKER_SITE_ENV_PHP_STORE())
}

export { DOCKER_SITE_ENV_PHP_STORE, useDockerSiteEnvStore }
