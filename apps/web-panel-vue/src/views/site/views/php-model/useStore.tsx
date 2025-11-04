import { getDataInfoNew, modifyProjectRunState, setSiteStatus } from '@/api/site'
import { SoftInstallOptionProps } from '@/hooks/business'
import { useDataHandle } from '@/hooks/tools'
import { getPageTotal } from '@/utils'
import { parseLocalStorageArray } from './useController'

const SITE_PHP_STORE = defineStore('SITE-PHP-STORE', () => {
	const pluginInfo = ref<SoftInstallOptionProps>({})
	const scanData = ref<any>({
		info: [],
		time: '',
		is_pay: true,
		loophole_num: 0,
		site_num: 0,
		web_scaning_times: 0,
	})
	/**
	 * @description 获取PHP列表
	 * @param params
	 * @returns
	 */
	const getPhpList = async (params: any) => {
		try {
			const cacheColumn = parseLocalStorageArray('phpTableColumn')
			const {
				data: { data, page, search_history, error },
			} = await getDataInfoNew(params)
			const res = data.map((item: any) => ({
				...item,
				isWaf: cacheColumn?.length ? cacheColumn[0].isCustom : true,
			}))
			return {
				data: res,
				total: getPageTotal(page),
				other: { search_history, error },
			}
		} catch (error) {
			console.log(error)
			return {
				data: [],
				total: 0,
				other: {
					search_history: { page: 1, page_size: 10, total: 0 },
					error: { code: 'get value error！', message: '获取数据失败' },
				},
			}
		}
	}

	/**
	 * @description 修改状态事件
	 * @param param0
	 * @param param1
	 * @returns
	 */
	const changeStatusEvent = async ({ row, action }: any, { isAsync, status }: any) => {
		try {
			const res: AnyObject = await useDataHandle({
				loading: '正在' + (status ? '停止' : '启动') + '，请稍后...',
				request: isAsync
					? modifyProjectRunState({
							sitename: row.name,
							project_action: action,
					  })
					: setSiteStatus({ id: row.id, name: row.name }, action),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '操作失败' }
		}
	}

	return {
		scanData,
		pluginInfo,
		getPhpList,
		changeStatusEvent,
	}
})

const useSitePhpStore = () => storeToRefs(SITE_PHP_STORE())

export { SITE_PHP_STORE, useSitePhpStore }
