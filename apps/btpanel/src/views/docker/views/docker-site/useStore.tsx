import { SelectOptionProps } from '@/components/form/bt-select/types'
import { SoftInstallOptionProps } from '@/hooks/business/soft-install-mask';
import { getSiteList,setSiteStatus,setSiteRemark,delDockerSite as delSite,getDockerSiteEnvList,getCateList,setCate,delCate } from '@/api/docker';
import { useHandleError,useDataHandle,useConfirm,Message } from '@/hooks/tools';
import { isUndefined, getPageTotal } from '@/utils'
import { getDockerStore } from '@docker/useStore';
import type { DockerSiteTableRowProps,DockerSiteListProps,DockerSiteStatusProps,DockerSiteRemarkProps,DockerSiteDelProps,DockerSiteEnvListProps } from '@docker/types';

const DOCKER_SITE_STORE = defineStore('DOCKER-SITE-STORE', () => {
	const pluginInfo = ref<SoftInstallOptionProps>({});
	const { refreshSiteTable } = getDockerStore();

	const settingTabActive = ref('') // 设置页面tab激活项
	const siteInfo = ref<any>({}) // 当前站点信息
	const statusFilterKey = ref('all') // 状态过滤key

	const classList = ref<SelectOptionProps[]>([]) // 分类列表
/**
   * @description 获取网站列表
   */
  const getDockerSiteList = async (params:DockerSiteListProps) => {
    try {
      const {data} = await getSiteList(params);
      return { data: data.data,total: getPageTotal(data.page) };
      // if (!res.data.cpy_installed.length && !res.data.pypy_installed.length)
      //   maskLayer.value = true;
    } catch (error) {
      useHandleError(error);
    }
  };
	
	/**
	 * @description 获取分类列表
	 * @returns
	 */
	const getClassList = async () => {
		try {
			await useDataHandle({
				request: getCateList(),
				success: ({data}:any) => {
					classList.value = [
						{ label: '全部分类', value: 'all' },
						...data.data.map((item: AnyObject) => ({
							label: item.name,
							value: String(item.id),
						})),
					]
				},
			})
			return { data: classList.value, status: true }
		} catch (error) {
			console.log(error)
			return { data: [], status: false }
		}
	}
	/**
	 * @description 新增、编辑、删除分类
	 * @returns
	 */
	const setClass = async (data:any,type:'add'|'edit'|'del') => {
		try {
			switch (type) {
				case 'add':
					return await useDataHandle({
						loading: '正在新增分类，请稍后...',
						request: setCate({name:(data.name)}),
						message: true,
					})
					break
				case 'edit':
					return await useDataHandle({
						loading: '正在编辑分类，请稍后...',
						request: setCate({name:data.name,id:data.id}),
						message: true,
					})
					break
				case 'del':
					return await useDataHandle({
						loading: '正在删除分类，请稍后...',
						request: delCate({id:data.id}),
						message: true,
					})
					break
				default:
					break
			}
		} catch (error) {
			console.log(error)
		}
	}
	/**
		 * @description 获取环境列表
		 */
		const getEnvList = async (params:DockerSiteEnvListProps) => {
			try {
				const {data} = await getDockerSiteEnvList(params);
				return { data: data.data,total: getPageTotal(data.page) };
				// if (!res.data.cpy_installed.length && !res.data.pypy_installed.length)
				//   maskLayer.value = true;
			} catch (error) {
				useHandleError(error);
			}
		};
  /**
   * @description 设置网站状态
   */
  const setDockerSiteStatus = async (params:DockerSiteStatusProps,callback?:AnyFunction) => {
    try {
			// 判定项目是否过期，过期则提示请设置站点到期时间
			const todayStart = new Date().setHours(0, 0, 0, 0)
			const isExpired = params.edate !== '0000-00-00' && new Date(params.edate).getTime() / 1000 < todayStart / 1000
			if (isExpired) {
				Message.error('项目已过期，请设置站点到期时间后再操作')
				return
			}
			await useConfirm({
				title: '提示',
				content: params.status ? `启动站点【${params.site_name}】后，用户可以正常访问网站内容，是否继续操作？`:`停用站点【${params.site_name}】后，用户访问会显示当前网站停用后的提示页，是否继续操作？`,
				icon: 'warning-filled',
			})
			// 数据处理
			await useDataHandle({
				loading: `正在${params.status ? '开启':'关闭'}，请稍后...`,
				request: setSiteStatus(params), 
				message: true,
				success: (res: any) => {
				refreshSiteTable()
					callback && callback(res)
				},
			})
    } catch (error) {
      useHandleError(error);
    }
  };
  /**
   * @description 设置网站状态
   */
  const setDockerSiteRemark = async (params:DockerSiteRemarkProps,callback?:AnyFunction) => {
    try {
			// 数据处理
			await useDataHandle({
				loading: `正在保存备注，请稍后...`,
				request: setSiteRemark(params), 
				message: true,
				success: (res: any) => {
					refreshSiteTable()
					callback && callback(res)
				},
			})
    } catch (error) {
      useHandleError(error);
    }
  };

  /**
   * @description 删除网站
   */
  const delDockerSite = async (row:DockerSiteTableRowProps,callback?:AnyFunction) => {
    try {
			await useConfirm({
				title: `删除【${row.name}】项目`,
				content: `风险操作，此操作不可逆，删除【${row.name}】项目后您将无法管理该项目，是否继续操作？`,
				icon: 'warning-filled',
				type: 'check',
				check: {
					content: '同时删除网站根目录',
					onConfirm: async (checkValue: boolean) => {
						const params:DockerSiteDelProps = {id: row.id,site_name:row.name,remove_path:checkValue ? 1:0}
						// 数据处理
						await useDataHandle({
							loading: `正在删除，请稍后...`,
							request: delSite(params), 
							message: true,
							success: (res: any) => {
								refreshSiteTable()
								callback && callback(res)
							},
						})
					},
				}
			})
    } catch (error) {
      useHandleError(error);
    }
  };


	/**
	 * @description 设置站点信息
	 * @param siteInfo
	 * @param tab
	 */
	const setSiteInfo = async (data: any, tab?: string) => {
		if (data) {
			siteInfo.value = { ...data }
		}
		settingTabActive.value = (typeof tab === 'string' ? tab : '') || ''
		return siteInfo.value
	}

	const resetData = () => {
		settingTabActive.value = ''
		siteInfo.value = {}
		classList.value = []
	}

  return {
    getDockerSiteList,
		pluginInfo,
		setDockerSiteStatus,
		setDockerSiteRemark,
		getEnvList,
		delDockerSite,
		setSiteInfo,
		siteInfo,
		settingTabActive,
		getClassList,
		setClass,
		classList,
		resetData,
		statusFilterKey,
  };
});

const useDockerSiteStore = () => {
  return storeToRefs(DOCKER_SITE_STORE());
};

export { DOCKER_SITE_STORE, useDockerSiteStore };
