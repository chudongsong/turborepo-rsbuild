import type { DockerSiteCreateByProxyProps } from '@/views/docker/types';
import { useDataHandle,useConfirm } from '@/hooks/tools';
import { getDockerStore } from '@docker/useStore';
import { DOCKERSITE_CREATE_SITE_BY_PROXY_STORE } from './useStore';
import { createDockerSite } from '@/api/docker';
interface FormData {
  domain: string;
  name: string;
	container_id: string;
  port: string;
  remark: string;
}

		// 表单初始数据
		export const formData = ()=>{
			return {
					domain: '',
					name: '',
					container_id: '',
					port: '',
					remark: '',
				}
		}
/**
 * @description: 容器change事件
 */
export const changeHandle = (conId:string,formDataRef:Ref<FormData>)=>{
	const store = DOCKERSITE_CREATE_SITE_BY_PROXY_STORE();
	const { conOptions,portOptions } = storeToRefs(store);
	const { getPortOptions } = store;
	formDataRef.value.port = '';
	formDataRef.value.name = conOptions.value.find((item)=>item.value === conId)?.label || '';
	getPortOptions(conId,portOptions);
	nextTick(()=>{
		if(portOptions.value.length > 0){
			formDataRef.value.port = portOptions.value[0].value;
		}
	})
};
/**
 * @description: 从运行环境创建网站
 */
export const createSiteByProxy = async(formData:FormData,callback?:AnyFunction) => {
	const { refreshSiteTable } = getDockerStore();
  const params:DockerSiteCreateByProxyProps = {
		domains: formData.domain,
		type: 'proxy',
		name: formData.name,
		container_id: formData.container_id,
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