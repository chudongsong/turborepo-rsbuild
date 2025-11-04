import { getNetVersion, modifyProject } from '@/api/site'
import { Message } from '@/hooks/tools'
import { useSiteStore } from '../../useStore'

const SITE_NET_STORE = defineStore('SITE-NET-STORE', () => {
	const { activeType } = useSiteStore()

	/**
	 * @description  编辑其他项目
	 * @param params
	 * @returns
	 */
	const editOtherProject = async (params: any) => {
		try {
			const res = modifyProject(params, activeType.value)
			Message.request(res)
			return { status: res.status, msg: res.msg || res.errorMsg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '编辑项目失败' }
		}
	}

	/**
	 * 获取dotnet版本
	 */
	const getVersion = async () => {
		try {
			const res = await getNetVersion()
			return { data: res.data, status: true }
			// versionData.value = res.data;
			// netAddForm.value.dotnet_version = res.data[0];
		} catch (error) {
			console.log(error)
			return { msg: '获取失败', status: false }
		}
	}

	return {
		getVersion,
	}
})

const useSiteNetStore = () => {
	return storeToRefs(SITE_NET_STORE())
}

export { SITE_NET_STORE, useSiteNetStore }
