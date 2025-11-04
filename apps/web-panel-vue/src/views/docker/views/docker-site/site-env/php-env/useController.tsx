import type { TableColumnProps } from '@/components/data/bt-table/types'
import type { DockerSiteCreateEnvProps } from '@docker/types'
import {getPageTotal} from '@/utils'
import { useDialog,Message,useHandleError,useDataHandle } from '@/hooks/tools';
import { getEnvExtendTemplate,createEnv,setPhpTemplate } from '@/api/docker'
import {DOCKER_SITE_ENV_STORE} from '@docker/views/docker-site/site-env/useStore'
import {DOCKER_SITE_ENV_PHP_STORE} from './useStore'
import {storeToRefs} from 'pinia'
import { openBuildLog } from "@docker/views/docker-site/site-env/build-log/useController";
import { ElStep } from 'element-plus';
import { Component } from 'vue';

const store = DOCKER_SITE_ENV_PHP_STORE()
const {getVersion,setTypeRefreshTable} = DOCKER_SITE_ENV_STORE()
const {versionOptions,extendOptions,allData,extendsupOptions,isEdit,rowData,templateOptions} = storeToRefs(store)
const {resetData,getExtend,getTemplate,setRefreshTemplateTable} = store

export const extRef = ref() // 扩展下拉框组件ref

/**
 * @description 创建环境
 * @returns {App}
 */
export const openPhpForm = (row?:any): Promise<boolean> => {
	isEdit.value = !!row?.name
	rowData.value = row || {}
	return new Promise((resolve, error) => {
		useDialog({
			title: '创建',
			area: 80,
			btn: ['确认', '取消'],
			component: ()=>import('@docker/views/docker-site/site-env/php-env/php-form.vue'),
			// onConfirm: () => resolve(true),
			onCancel: () => {
				resetData()
				resolve(false)
			},
		});
	});
};
/**
 * @description 扩展模板
 * @returns {App}
 */
export const openExtendTemplate = (): Promise<boolean> => {
	return new Promise((resolve, error) => {
		useDialog({
			title: '扩展模板',
			area: 90,
			component: ()=>import('@docker/views/docker-site/site-env/php-env/extend-template.vue'),
			// onConfirm: () => resolve(true),
			// onCancel: () => resolve(false),
		});
	});
};
/**
 * @description 扩展模板表单
 * @returns {App}
 */
export const openCreateTemplateForm = (row?:any): Promise<boolean> => {
	isEdit.value = !!row?.name
	rowData.value = row || {}
	return new Promise((resolve, error) => {
		useDialog({
			title: '创建',
			area: 60,
			btn: ['确认', '取消'],
			component: ()=>import('@docker/views/docker-site/site-env/php-env/php-template-form.vue'),
			// onConfirm: () => resolve(true),
			// onCancel: () => resolve(false),
		});
	});
};
/**
 * @description 获取扩展模板
 * @returns {App}
 */
export const getExtendTemplate = async(params?:{p:number,row:number}): Promise<any> => {
	try {
		const {data}:any  = await useDataHandle({
			request: getEnvExtendTemplate(params || {p:1,row:100}), 
		})
		if(!data.status){
			return { data: [],total: 0 };
		}
		return { data: data.data,total: getPageTotal(data.page) };
		// return res
	} catch (error) {
		
	}
};
/**
 * @description 获取数据
 * @returns {App}
 */
export const getFormData = async(dataRef:Ref<{version:string,repo_url:string}>): Promise<any> => {
	try {
		await getExtend()
		await getTemplate()
		const res:any  = await getVersion('php')
		if(res.status){
			versionOptions.value = res.data['php'].map((item:any) => ({label:item,value:item}))
			extendOptions.value = res.data.repo_urls.map((item:any) => ({label:item.name,value:item.repo}))
			if(versionOptions.value.length > 0){
				if(!isEdit.value){
					dataRef.value.version = versionOptions.value[0].value
				}
				setSupport(versionOptions.value[0].value)
			}
			if(extendOptions.value.length > 0 && !isEdit.value){
				dataRef.value.repo_url = extendOptions.value[0].value
			}
		}
		if(isEdit.value){
			setSupport(rowData.value.version)
		}
	} catch (error) {
		
	}
};
/**
 * @description 获取模板表单数据
 * @returns {App}
 */
export const getTemplateFormData = async(dataRef:Ref<{version:string}>): Promise<any> => {
	try {
		await getExtend()
		const res:any  = await getVersion('php')
		if(res.status){
			versionOptions.value = res.data['php'].map((item:any) => ({label:item,value:item}))
			if(versionOptions.value.length > 0){
				if(!isEdit.value){
					dataRef.value.version = versionOptions.value[0].value
				}
				setSupport(versionOptions.value[0].value)
			}
		}
		if(isEdit.value){
			setSupport(rowData.value.version)
		}
	} catch (error) {
		
	}
};
/**
 * @description 设置支持的数据
 * @returns {App}
 */
export const setSupport = (val:string) => {
	try {
		if(val){

			extendsupOptions.value = allData.value[val]?.map((item:any) => ({label:item,value:item})) || []
			templateOptions.value = templateOptions.value.map((item:any) => {
				return {...item,label:`${item.name}${item.version !== val ? `(当前PHP版本不支持)`:''}`,disabled:item.version !== val}
			})
		}
	} catch (error) {
		
	}
};
/**
 * @description 扩展模板过滤方法
 * @param {string} query 查询条件
 * @param {typeof extendsupOptions} optionsRef 扩展选择数据
 * @param {string} phpVersion 当前选中PHP版本
 * @returns {App}
 */
export const extsFilterMethod = (query:string,optionsRef:typeof extendsupOptions,phpVersion:string,dataRef:Ref<AnyObject>,extRef:Ref<{blur:AnyFunction}>) => {
	try {
		if(query.includes(',')){
			// 自动选中
			if(phpVersion === ''){
				dataRef.value.exts = []
				return Message.error('请先选择PHP版本')
			}
			// 正常筛选
			optionsRef.value = allData.value[phpVersion]?.filter((item:any) => item.includes(query)).map((item:any) => ({label:item,value:item})) || []
			const denyExts:string[] = [],accessExts:string[] = [],queryExt = query.split(',').filter((item:any) => item!== ''&& item !== ' ')
			queryExt.forEach((ext:string) => {
				if(!allData.value[phpVersion].includes(ext)){
					// 不支持的扩展
					denyExts.push(ext)
				}else{
					// 支持的扩展
					accessExts.push(ext)
				}
			})
			// 设置选中的扩展
			dataRef.value.exts = accessExts
			extRef.value?.blur()
			// 提示不支持的扩展
			if(denyExts.length > 0){
				Message.success(`已选中${accessExts.length}个扩展，当前PHP版本不支持这${denyExts.length}个扩展：【${denyExts.join(',')}】`)
			}else if(accessExts.length > 0){
				Message.success(`已选中${accessExts.length}个扩展`)
			}
		}else{
			// 正常筛选
			optionsRef.value = allData.value[phpVersion]?.filter((item:any) => item.includes(query)).map((item:any) => ({label:item,value:item})) || []
		}
	} catch (error) {
		
	}
};
/**
 * @description 表单数据
 * @returns {App}
 */
export const formData = () => {
	try {
		
		if(isEdit.value){
			return {
				name: rowData.value.name,
				version: rowData.value.version,
				repo_url: rowData.value.repo_url,
				template: '',
				exts: rowData.value.exts.split(','),
				id: rowData.value.id,
			}
		}
		return {
			name: '',
			version: '',
			repo_url: '',
			template: '',
			exts: '',
		}
	} catch (error) {
		
	}
};
/**
 * @description 表单数据
 * @returns {App}
 */
export const templateFormData = () => {
	try {
		
		if(isEdit.value){
			return {
				name: rowData.value.name,
				version: rowData.value.version,
				exts: rowData.value.exts.split(','),
				id: rowData.value.id,
			}
		}
		return {
			name: '',
			version: '',
			exts: '',
		}
	} catch (error) {
		
	}
};

/**
 * @description 创建环境
 */
export const createPhpEnv = async(formData:any,close:AnyFunction): Promise<any> => {
	try {
		const obj:DockerSiteCreateEnvProps = {
			runtime_name:formData.name,
			runtime_version:formData.version,
			repo_url:formData.repo_url,
			exts:formData.exts.join(','),
			runtime_type: 'php',
			...(formData.id ? {id:formData.id}:{})
		}
		await useDataHandle({
			request: createEnv(obj), 
			success: (res:any) => {
				if(res.status){
					close()
					openBuildLog(`tail -f /www/dk_project/runtime/build/php/${formData.name}/build.log`,()=>{
						setTypeRefreshTable('php')
					})
				}else{
					Message.error(res.msg)
				}
			},
		})
	} catch (error) {
		
	}
}

/**
 * @description 创建模板
 */
export const createPhpTemplate = async(formData:any,close:AnyFunction): Promise<any> => {
	try {
		const obj = {
			name:formData.name,
			version:formData.version,
			exts:formData.exts.join(','),
			...(formData.id ? {id:formData.id}:{})
		}
		await useDataHandle({
			request: setPhpTemplate(obj), 
			message: true,
			success: (res:any) => {
				if(res.status){
					close()
					setRefreshTemplateTable()
				}
			},
		})
	} catch (error) {
		
	}
}