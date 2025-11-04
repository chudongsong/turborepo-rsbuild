import { useHandleError,useDataHandle } from '@/hooks/tools';
import {getEnvExtend,getEnvExtendTemplate} from '@/api/docker'

const DOCKER_SITE_ENV_GO_STORE = defineStore('DOCKER-SITE-ENV-GO-STORE', () => {

	const isEdit = ref<boolean>(false) // 是否编辑
	const rowData = ref() // 行数据
const versionOptions = ref([]) // 版本选项
const extendOptions = ref([]) // 扩展源选项
const templateOptions = ref([]) // 扩展模板选项
const extendsupOptions = shallowRef([]) // 支持的扩展源选项
const allData = shallowRef<any>({}) // 所有数据
const popoverFocus = ref(false) // 弹出框焦点
/**
 * @description 获取php扩展源
 */
const getExtend = async (version:string = 'all') => {
	try {
		const params = {version}
		const res:any = await useDataHandle({
			loading: `正在获取版本，请稍后...`,
			request: getEnvExtend(params), 
			message: false,
		})
		if(res.status){
			allData.value = res.data
			extendOptions.value = res.data.repo_urls.map((item:any) => ({label:item.name,value:item.repo}))
		}else{
			useHandleError(res)
		}
	} catch (error) {
		useHandleError(error);
	}
};
/**
 * @description 获取扩展模板
 */
const getTemplate = async (params?:{p:number,row:number}) => {
	try {
		const res:any = await useDataHandle({
			loading: `正在获取版本，请稍后...`,
			request: getEnvExtendTemplate(params || {p:1,row:100}), 
			message: false,
		})
		if(res.status){
			templateOptions.value = res.data.data.map((item:any) => ({label:item.name,value:item.id,ext:item.exts}))
		}else{
			useHandleError(res)
		}
	} catch (error) {
		useHandleError(error);
	}
};

// 初始化数据
const resetData = () => {
	versionOptions.value = ([])
	extendOptions.value = ([])
	templateOptions.value = ([])
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
  };
});

const useDockerSiteEnvStore = () => {
  return storeToRefs(DOCKER_SITE_ENV_GO_STORE());
};

export { DOCKER_SITE_ENV_GO_STORE, useDockerSiteEnvStore };
