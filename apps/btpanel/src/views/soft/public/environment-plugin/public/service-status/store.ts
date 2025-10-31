import { compData } from './../../../../../site/public/ssl-arrange/lets-encrypt-cert/useController'
import { defineStore } from 'pinia'
import { serviceManage } from '@/api/global'
import { useConfirm, useDataHandle } from '@/hooks/tools'
import { useRoute, useRouter } from 'vue-router'
import SOFT_PLUGIN_STORE from '@/views/soft/views/plugin/store'

const SOFT_SERVICE_STATUS_STORE = defineStore('SOFT-SERVICE-STATUS-STORE', () => {
	const pluginStore = SOFT_PLUGIN_STORE()

	const route = useRoute()

	const compData = ref<any>({}) // 组件数据
	const status = ref<boolean>(false) // 服务状态
	const typeText = {
		restart: '重启',
		stop: '停止',
		reload: '重载配置',
		start: '启动',
	} // 操作类型

	/**
	 * @description 服务管理-重启，停止，重载配置
	 */
	const serviceManageEvent = async (type: 'restart' | 'stop' | 'reload' | 'start') => {
		await useConfirm({
			title: `${compData.value.name}服务`,
			icon: 'warning-filled',
			content: `您确定${typeText[type]}${compData.value.name}服务吗?`,
		})
		let name = compData.value.name
		if (compData.value.name.indexOf('php-') != -1) {
			// php7.4则提取74 同理为php-8.2则提取82
			name = `php-fpm-${name.split('-')[1].replace('.', '')}`
		}
		await useDataHandle({
			loading: '正在设置状态，请稍后...',
			request: serviceManage({
				name: name,
				type: type,
			}),
			message: true,
			success: async (res: any) => {
				status.value = type === 'stop' ? false : true // 改变状态值 看情况可注释
				// 当前是软件商店页面 刷新软件列表
				if (route.path.indexOf('/soft') !== -1) {
					await pluginStore.getSoftListData() // 刷新软件列表
					const { softTableList } = storeToRefs(pluginStore)
					compData.value.status = softTableList.value.find((item: any) => {
						return item.name === compData.value.name || (item.name === 'pureftpd' && compData.value.name === 'pure-ftpd')
					})?.status // 改变状态值
				} else {
					compData.value.status = type === 'stop' ? false : true // 改变状态值
				}
				compData.value.refreshEvent && compData.value.refreshEvent() // 刷新当前页面
			},
		})
	}

	/**
	 * @description 初始化
	 */
	const init = (data: any) => {
		if (data) compData.value = data
		status.value = compData.value.status
	}

	const $reset_compdata = () => {
		compData.value = {}
	}

	return {
		compData,
		status,
		serviceManageEvent,
		init,
		$reset_compdata,
	}
})

export default SOFT_SERVICE_STATUS_STORE
