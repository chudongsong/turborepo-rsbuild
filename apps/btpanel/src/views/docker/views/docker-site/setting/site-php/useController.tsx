import { useDockerSiteStore } from '@docker/views/docker-site/useStore'
import { useDataHandle,Message,useConfirm } from '@/hooks/tools';
import {getDockerSitePhp,setDockerSitePhp} from '@/api/docker'




const { siteInfo } = useDockerSiteStore()// 站点信息

export const versionOptions = ref([]) // 版本选项

// 表单数据
export const phpFormData = ()=>{
	return {
		version: '',
		oldVersion: '',
	}
}

/**
 * @description 获取php版本内容
 */
export const getPhpVersion = async (dataRef:Ref<{version:string,oldVersion:string}>) => {
	const res:any = await useDataHandle({
		request: getDockerSitePhp({id:siteInfo.value.id}),
	})
	if(res.status){
		dataRef.value.version = `${res.data.used.name}:${res.data.used.version}`
		dataRef.value.oldVersion = `${res.data.used.name}:${res.data.used.version}`
		versionOptions.value = res.data.runtime_list.map((item:{name:string,version:string}) => ({label:`PHP-${item.version}(${item.name})`,value:`${item.name}:${item.version}`}))
	}else{
		Message.error(res.msg)
	}
}

/**
 * @description 切换php版本内容
 */
export const setPhpVersion = async ({version,oldVersion}:{version:string,oldVersion:string},dataRef:Ref<{version:string,oldVersion:string}>) => {
	try {
		if(version === oldVersion){
			Message.error('当前版本与原版本一致，无需切换')
			return
		}
		await useConfirm({
			title: '切换PHP版本',
			content: `切换PHP版本可能会导致无法访问，是否切换？`,
		})
		useDataHandle({
			loading: `正在切换PHP版本，请稍后...`,
			request: setDockerSitePhp({id:siteInfo.value.id,runtime_name:version}),
			message: true,
			success: (res:{status:boolean}) =>{
				if(res.status){
					dataRef.value.oldVersion = version
				}
			}
		})
	} catch (error) {
		
	}
}

export const resetData = () =>{
	versionOptions.value = []
}