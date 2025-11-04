import { defineStore, storeToRefs } from 'pinia'

import { DOCKER_SITE_STORE } from '@docker/views/docker-site/useStore';
import { FtpRowProps, FtpTableRowProps } from '@/types/ftp'
import { useGlobalStore } from '@/store/global'
interface FormData {
  domain: string;
  type: 'php' | 'java' | 'go' | 'python';
  port: string;
  env: string;
  remark: string;
  path: string;
}
interface SelectOptionProps {
	label: string;
	value: string;
}

// 新建文件当前组件新建store文件夹，按组件模块来设计数据
// 命名标准：(子路由/路由 + 组件名) FTP_ADD_USER
const DOCKERSITE_CREATE_SITE_BY_ENV_STORE = defineStore('DOCKERSITE-CREATE-SITE-BY-ENV-STORE', () => {
	
		// // 表单数据
		// const formData = ref<FormData>({
		// 	domain: '',
		// 	type: 'php',
		// 	port: '9000',
		// 	env: '',
		// 	remark: '',
		// 	path: '',
		// });
		const envOptions = shallowRef<{label:string,value:string,path:string,portList:{label:string,value:string}[]}[]>([])
		const portOptions = shallowRef<{label:string,value:string}[]>([])
		const popoverFocus = ref(false) // popover焦点

/**
 * @description: 设置环境选项
 */
const getEnvOptions = async(type:'php' | 'java' | 'go' | 'python',optionsRef:Ref<SelectOptionProps[]>) => {
  const { getEnvList } = DOCKER_SITE_STORE();
	const res = await getEnvList({runtime_type: type, p: 1, row: 100})
	if(Array.isArray(res?.data)){
		optionsRef.value = res.data.map((item:any) => {
			const portObj = item.ports ? JSON.parse(item.ports) : {}
			const portList:{label:string,value:string}[] = (Object.values(portObj) as any[]).map((portItem:{HostPort:string}[]) => ({label: portItem[0].HostPort, value: portItem[0].HostPort}))
			return {
				label: item.name, 
				value: `${item.name}:${item.version}`,
				path: item.path,
				portList,
			}
		})
	}
};
/**
 * @description: 设置接口选项
 */
const getPortOptions = async(env: string,optionsRef:Ref<SelectOptionProps[]>) => {
	const envOption = envOptions.value.find(item => item.value === env)
	if(envOption){
		optionsRef.value = JSON.parse(JSON.stringify(envOption.portList))
		return JSON.parse(JSON.stringify(envOption.portList))
	}else{
		optionsRef.value = []
		return []
	}
};

/**
 * @description 视图数据重置模块
 */
const $reset = () => {
	// formData.value = {
	// 	domain: '',
	// 	type: 'php',
	// 	port: '9000',
	// 	env: '',
	// 	remark: '',
	// 	path: '',
	// }
	envOptions.value = []
	portOptions.value = []
	popoverFocus.value = false
}
	return {
		// formData,// 表单数据
		envOptions,// 环境选项
		portOptions,// 接口选项
		popoverFocus,// popover焦点
		getEnvOptions,// 设置环境选项
		getPortOptions,// 设置接口选项
		$reset,// 视图数据重置模块
	}
})

/**
 * @description 全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useDockersiteCreateByEnvStore = () => {
	return storeToRefs(DOCKERSITE_CREATE_SITE_BY_ENV_STORE())
}

export { useDockersiteCreateByEnvStore, DOCKERSITE_CREATE_SITE_BY_ENV_STORE }
