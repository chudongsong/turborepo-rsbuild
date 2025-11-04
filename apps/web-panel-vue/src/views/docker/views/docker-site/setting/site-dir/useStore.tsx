import { getDockerSiteEnvList } from '@/api/docker';
import { useHandleError,useDataHandle,Message } from '@/hooks/tools';
import {getDockerSiteDir,setDockerSiteDir,setDockerSiteRunDir,setDockerSiteini,getDockerSiteDirUserINI} from '@/api/docker'
import { useDockerSiteStore } from '@docker/views/docker-site/useStore'

const DOCKER_SITE_SITE_DIR_STORE = defineStore('DOCKER-SITE-SITE-DIR-STORE', () => {
const { siteInfo } = useDockerSiteStore()// 站点信息
const dirOptions = ref([]) // 版本选项
const formData = ref({
	path: '',
	run_path: '',
	userini: false,
}) // 表单数据
/**
 * @description 获取网站目录
 */
const getDir = async () => {
	try {
		const params = {
			id: siteInfo.value.id,
		}
		const res:any = await useDataHandle({
			loading: `正在获取版本，请稍后...`,
			request: getDockerSiteDir(params), 
		})
		if(res.status){
			formData.value.path = res.data.path
			// dirOptions.value = res.data.data.repo_urls.map((item:any) => ({label:item.name,value:item.repo}))
		}else{
			useHandleError(res)
		}
	} catch (error) {
		useHandleError(error);
	}
};
/**
 * @description 获取网站的防跨站状态和运行目录信息
 */
const getUserini = async () => {
	try {
		const params = {
			id: siteInfo.value.id,
		}
		const res:any = await useDataHandle({
			loading: `正在获取版本，请稍后...`,
			request: getDockerSiteDirUserINI(params), 
		})
		if(res.status){
			formData.value.userini = res.data.userini
			formData.value.run_path = res.data.runPath.runPath
			dirOptions.value = res.data.runPath.dirs.map((item:any) => ({label:item,value:item}))
		}else{
			useHandleError(res)
		}
	} catch (error) {
		useHandleError(error);
	}
};

const saveDirPath = async (path:string,type:'path'|'run_path') => {
	if(!path){
		Message.error('请选择目录')
		return
	}
	const params:any = {
		site_name: siteInfo.value.name,
		id: siteInfo.value.id,
		...(type === 'path' ? {path} : {run_path:path})
	}
	
	useDataHandle({
		loading: `正在获取版本，请稍后...`,
		message: true,
		request: type === 'path' ? setDockerSiteDir(params) : setDockerSiteRunDir(params), 
	})
}

/**
 * @description 设置防跨站
 * @param status 状态 
 * @returns 
 */
const setDirUser = async (status:boolean) => {
	const params:any = {
		id: siteInfo.value.id,
		status: status ? 1 : 0
	}
	
	useDataHandle({
		loading: `正在设置，请稍后...`,
		message: true,
		request: setDockerSiteini(params), 
	})
}
/**
 * @description 表单数据
 */
const getFormData = () =>{
	return formData
}
// 初始化数据
const resetData = () => {
	dirOptions.value = ([])
	formData.value.path = ''
	formData.value.run_path = ''
}

  return {
		dirOptions,
		resetData,
		getFormData,
		getDir,
		formData,
		saveDirPath,
		setDirUser,
		getUserini,
  };
});

const useDockerSiteDirStore = () => {
  return storeToRefs(DOCKER_SITE_SITE_DIR_STORE());
};

export { DOCKER_SITE_SITE_DIR_STORE, useDockerSiteDirStore };
