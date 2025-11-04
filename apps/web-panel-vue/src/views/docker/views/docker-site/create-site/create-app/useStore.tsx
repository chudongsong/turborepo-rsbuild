import { defineStore, storeToRefs } from 'pinia'

import { DOCKER_SITE_STORE } from '@docker/views/docker-site/useStore';
import { getDockerSiteConAndAppList } from '@/api/docker'
interface FormData {
  domain: string;
  name: string;
	container_id: string;
  port: string;
  remark: string;
}
interface SelectOptionProps {
	label: string;
	value: string;
}

// 新建文件当前组件新建store文件夹，按组件模块来设计数据
// 命名标准：(子路由/路由 + 组件名) FTP_ADD_USER
const DOCKERSITE_CREATE_SITE_BY_APP_STORE = defineStore('DOCKERSITE-CREATE-SITE-BY-APP-STORE', () => {
	
		// 表单数据
		const appOptions = shallowRef<{label:string,value:string,portList:{label:string,value:string}[]}[]>([])
		const portOptions = shallowRef<{label:string,value:string}[]>([])
		const popoverFocus = ref(false) // popover焦点

/**
 * @description: 设置容器列表
 */
const getAppOptions = async(optionsRef:Ref<SelectOptionProps[]>) => {
	const {data} = await getDockerSiteConAndAppList({type: 'app'})
	if(Array.isArray(data?.data)){
		optionsRef.value = data.data.map((item:any) => {
			const portList:{label:string,value:string}[] = item.port.map((portItem:number) => ({label: portItem, value: portItem}))
			return {
				label: `${item.service_name}(${item.apptitle})`, 
				value: item.service_name,
				portList,
			}
		})
	}
};
/**
 * @description: 设置接口选项
 */
const getPortOptions = async(con_id: string,optionsRef:Ref<SelectOptionProps[]>) => {
	const conOption = appOptions.value.find(item => item.value === con_id)
	if(conOption){
		optionsRef.value = JSON.parse(JSON.stringify(conOption.portList))
	}else{
		optionsRef.value = []
	}
}

/**
 * @description 视图数据重置模块
 */
const $reset = () => {
	// formData.value = {
	// 	domain: '',
	// 	name: '',
	// 	container_id: '',
	// 	port: '',
	// 	remark: '',
	// }
	appOptions.value = []
	portOptions.value = []
	popoverFocus.value = false
}
	return {
		// formData,// 表单数据
		appOptions,// 环境选项
		portOptions,// 接口选项
		popoverFocus,// popover焦点
		getAppOptions,// 设置环境选项
		getPortOptions,// 设置接口选项
		$reset,// 视图数据重置模块
	}
})

/**
 * @description 全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useDockersiteCreateByAppStore = () => {
	return storeToRefs(DOCKERSITE_CREATE_SITE_BY_APP_STORE())
}

export { useDockersiteCreateByAppStore, DOCKERSITE_CREATE_SITE_BY_APP_STORE }
