import type { DockerSiteCreateByEnvProps } from '@/views/docker/types';
import { fileSelectionDialog } from '@/public/index';
import { useDataHandle,useConfirm } from '@/hooks/tools';
import { getDockerStore } from '@docker/useStore';
import { DOCKERSITE_CREATE_SITE_BY_ENV_STORE } from './useStore';
import { createDockerSite } from '@/api/docker';
interface FormData {
  domain: string;
  type: 'php' | 'java' | 'go' | 'python';
  port: string;
  env: string;
  remark: string;
  path: string;
}

const { getEnvOptions,getPortOptions } = DOCKERSITE_CREATE_SITE_BY_ENV_STORE();
const { envOptions,portOptions } = storeToRefs(DOCKERSITE_CREATE_SITE_BY_ENV_STORE());

/**
 * @description: 触发目录选择
 */
export const openFile = (formData:Ref<FormData>) => {
  fileSelectionDialog({
    type: 'dir',
    path: formData.value.path || '/www/dk_project/wwwroot',
    change: (path: string, type: string) => {
      formData.value.path = path;
    },
  });
};

		// 表单初始数据
export const formData = ()=>{
	const data = ({
		domain: '',
		type: 'php',
		port: '9000',
		env: '',
		remark: '',
		path: '',
	})
	return data
}

/**
 * @description: 类型选择
 */
export const typeChangeHamdle = async(val:'php' | 'java' | 'go' | 'python',formDataRef:Ref<FormData>) => {
	formDataRef.value.port = val === 'php' ? '9000' : '';
	await getEnvOptions(val,envOptions);
	nextTick(()=>{
		if(envOptions.value.length > 0){
			formDataRef.value.env = envOptions.value[0].value;
			formDataRef.value.path = val === 'php' ? (`/www/dk_project/wwwroot/${formDataRef.value.domain?.split('\n')[0]?.split(':')[0] || ''}`):(envOptions.value[0].path || '');
		}else{
			formDataRef.value.env = '';
			formDataRef.value.path = '';
		}
		getPortOptions(formDataRef.value.env,portOptions);
		nextTick(()=>{
			if(portOptions.value.length > 0){
				formDataRef.value.port = portOptions.value[0].value;
			}
		})
	})
};
/**
 * @description: 环境选择
 */
export const envChangeHamdle = async(val:string,formDataRef:Ref<FormData>) => {
	getPortOptions(val,portOptions);
	nextTick(()=>{
		if(portOptions.value.length > 0){
			formDataRef.value.port = portOptions.value[0].value;
		}
		formDataRef.value.path = formDataRef.value.type === 'php' ? (`/www/dk_project/wwwroot/${formDataRef.value.domain?.split('\n')[0]?.split(':')[0] || ''}`):(envOptions.value.find((item:any)=>item.value === val)?.path || '');
	})
};
/**
 * @description: 从运行环境创建网站
 */
export const createSiteByEnv = async(formData:FormData,callback?:AnyFunction) => {
	const { refreshSiteTable } = getDockerStore();
  const params:DockerSiteCreateByEnvProps = {
		domains: formData.domain,
		type: formData.type,
		name: formData.env,
		...(formData.type === 'php' ? {port: Number(formData.port)}:{}),
		site_path: formData.path,
		remark: formData.remark,
		port: Number(formData.port),
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

// 柯里化函数
export const curriedSetFormData = (formDataRef:Ref<any>) =>{
	return (key:string,val:any)=>{
		formDataRef.value[key] = val
	}
}