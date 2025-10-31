import type { DockerSiteCreateProps } from '@/views/docker/types';
import { useDataHandle,useConfirm } from '@/hooks/tools';
import { getDockerStore } from '@docker/useStore';
import { DOCKERSITE_CREATE_SITE_BY_APP_STORE } from './useStore';
import { createDockerSite } from '@/api/docker';
interface FormData {
	domain: string,
	app: string,
	port: string,
	remark: string,
}

		// 表单初始数据
		export const formData = ()=>{
			return {
				domain: '',
				app: '',
				remark: '',
			}
		}
/**
 * @description: 容器change事件
 */
export const changeHandle = (conId:string,formData:Ref<FormData>)=>{
	const store = DOCKERSITE_CREATE_SITE_BY_APP_STORE();
	const { appOptions,portOptions } = storeToRefs(store);
	const { getPortOptions } = store;
	formData.value.port = '';
	formData.value.app = appOptions.value.find((item)=>item.value === conId)?.value || '';
	getPortOptions(conId,portOptions);
	nextTick(()=>{
		if(portOptions.value.length > 0){
			formData.value.port = portOptions.value[0].value;
		}
	})
};
/**
 * @description: 从运行环境创建网站
 */
export const createSiteByApp = async(formData:FormData,callback?:AnyFunction) => {
	const { refreshSiteTable } = getDockerStore();
  const params:DockerSiteCreateProps = {
		domains: formData.domain,
		type: 'app',
		name: formData.app,
		port: Number(formData.port),
		remark: formData.remark,
	}
	await useDataHandle({
		loading: `正在创建，请稍后...`,
		request: createDockerSite(params), 
		message: true,
		success: (res: any) => {
			refreshSiteTable()
			callback && callback(res)
		},
	})
};