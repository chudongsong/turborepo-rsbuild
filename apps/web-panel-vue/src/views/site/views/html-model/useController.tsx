import { Message, useDialog } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { SITE_STORE, useSiteStore } from '../../useStore'

const { activeType, isRefreshList } = useSiteStore()
const { addGeneralProject, setSiteInfo } = SITE_STORE()

/**
 * @description 打开添加 项目弹窗
 */
export const openAddHtmlSiteView = () => {
	useDialog({
		title: '添加HTML项目',
		area: 62,
		component: () => import('@site/views/html-model/add-html/index.vue'),
		showFooter: true,
	})
}

/**
 * @description 打开设置
 */
export const openSettingView = (row: any, tab: string = '') => {
	// 设置网站信息
	setSiteInfo(row, tab)
	useDialog({
		title: 'HTML项目管理[' + row.name + '] -- 添加时间[' + row.addtime + ']',
		area: [84, 72],
		component: () => import('@site/views/html-model/setting/index.vue'),
	})
}

export const handleInputName = (val: any) => {
	// addSiteForm.value.webname = val;
	// addSiteForm.value.ps = val.split('\n')[0];
	// addSiteForm.value.path =
	//   defaultPathValue?.replace(/\/\//g, '/') +
	//   val.split('\n')[0]?.replace(/:/g, '_')?.trim();
	// addSiteForm.value.ftp_username = val
	//   .split('\n')[0]
	//   ?.toString()
	//   ?.replace(/\W/g, '_')
	//   .substring(0, 16);
	// addSiteForm.value.ftp_password = getRandomChart(12);
}

export const onPathChange = (path: string, callback?: AnyFunction) => {
	fileSelectionDialog({
		type: 'dir',
		path,
		change: path => {
			callback && callback(path)
		},
	})
}

export const addHtmlSite = async (param: any) => {
	try {
		const params = { ...param, port: 80 }
		// 默认端口为80，当输入的第一行域名含有端口数据时（最后以:xx结尾）,则端口为xx
		if (params.webname.split('\n')[0].indexOf(':') !== -1) {
			params.port = params.webname.split('\n')[0].split(':')[1]
		}
		// 获取webname除开第一行外的所有域名
		let name_list = params.webname.split('\n').filter((item: string) => item.length)
		let domainList = name_list.slice(1)
		params.webname = JSON.stringify({
			domain: params.webname.split('\n')[0],
			domainlist: domainList,
			count: domainList.length,
		})
		if (!params.ftp) {
			delete params.ftp_username
			delete params.ftp_password
		}

		const res = await addGeneralProject(params)
		if (res?.data?.siteStatus) {
			isRefreshList.value = true
			Message.success('添加成功')
			return true
		} else {
			Message.error(res.msg) // 提示错误信息
			return false
		}
	} catch (error) {
		console.error(error)
	}
}
