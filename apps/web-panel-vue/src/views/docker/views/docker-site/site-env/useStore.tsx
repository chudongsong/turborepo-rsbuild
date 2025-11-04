import { getDockerSiteEnvList } from '@/api/docker';
import { useHandleError,useDataHandle,useConfirm } from '@/hooks/tools';
import {delEnv,delBatchEnv,cleanBuildCache,refreshEnvTemplate,getEnvVersion,setEnvStatus} from '@/api/docker'
import { isUndefined, getPageTotal } from '@/utils'
import { getDockerStore } from '@docker/useStore';
import type { TableBatchOptionsProps, TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d';
import type { DockerSiteEnvVersionProps,DockerSiteTableRowProps } from '@docker/types';

const DOCKER_SITE_ENV_STORE = defineStore('DOCKER-SITE-ENV-STORE', () => {

	const tabActive = ref<'php'|'java'|'python'|'go'>('php') // 当前激活的tab

	const refreshEnvTable = ref<boolean>(false); // 刷新php环境列表
	const refreshJavaEnvTable = ref<boolean>(false); // 刷新java环境列表
	const refreshPythonEnvTable = ref<boolean>(false); // 刷新python环境列表
	const refreshGoEnvTable = ref<boolean>(false); // 刷新go环境列表

	// const setRefreshTable = () =>{
	// 	refreshEnvTable.value = true
	// }
	// const setRefreshJavaTable = () =>{
	// 	refreshJavaEnvTable.value = true
	// }
	// const setRefreshPythonTable = () =>{
	// 	refreshPythonEnvTable.value = true
	// }
	// const setRefreshGoTable = () =>{
	// 	refreshGoEnvTable.value = true
	// }
	const setTypeRefreshTable = (type:'php'|'java'|'python'|'go') =>{
		switch (type) {
			case 'php':
				refreshEnvTable.value = true
				break;
			case 'java':
				refreshJavaEnvTable.value = true
				break;
			case 'python':
				refreshPythonEnvTable.value = true
				break;
			case 'go':
				refreshGoEnvTable.value = true
				break;
		}
	}
	/**
	 * @description 删除环境
	 */
	const delDockerEnv = async (row:{id:number,name:string},type:'php'|'java'|'python'|'go',callback?:AnyFunction) => {
		try {
			await useConfirm({
				title: `删除【${row.name}】环境`,
				content: `风险操作删除【${row.name}】环境，此操作不可逆，是否继续操作？`,
				icon: 'warning-filled',
			})
			
			await useDataHandle({
				loading: `正在删除，请稍后...`,
				request: delEnv({id:row.id}), 
				message: true,
				success: (res: any) => {
					setTypeRefreshTable(type)
					callback && callback(res)
				},
			})
		} catch (error) {
			useHandleError(error);
		}
	};

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
const useBatchEventHandle: TableBatchEventProps = async (
  batchConfirm,
	nextAll, 
	selectedList, 
	options,
	clearSelection,
) => {
  // const { label, value } = options;
  // const template: Map<string, string> = new Map([
  //   ['start', '批量启动选中项目后，项目将正常访问'],
  //   ['stop', '批量停用选中的项目后，项目将会停止运行'],
  //   ['restart', '批量重启选中的项目后，项目将会重新启动'],
  //   ['delete', '批量删除选中的项目后，项目将无法恢复'],
  // ]);
  // const requestHandle = async (item: AnyObject, index: number) => {
  //   const requestList: Map<string, AnyFunction> = new Map([
  //     ['delete', delBatchEnv],
  //   ]);
  //   const { name: username } = item;
  //   const fn = requestList.get(value);
  //   switch (value) {
  //     case 'delete':
  //       if (fn) {
  //         return await fn(
  //           { data: JSON.stringify({ name: username }) },
  //         );
  //       }
  //   }
  // };
	await useConfirm({
		title: `删除环境`,
		content: `风险操作删除选中的${selectedList.value.length}个环境，此操作不可逆，是否继续操作？`,
		icon: 'warning-filled',
	})
	
	const params = {ids: (selectedList.value.map((env:{id:number})=>(env.id))).join(',')}
	// 数据处理
	await useDataHandle({
		loading: `正在删除，请稍后...`,
		request: delBatchEnv(params), 
		message: true,
		success: () => {
			clearSelection()// 清除选中
			setTypeRefreshTable(tabActive.value)
		},
	})
}
/**
 * @description 清理缓存
 */
const cleanCache = async (type:'php'|'java'|'python'|'go',callback?:AnyFunction) => {
	try {
		await useConfirm({
			title: `清理构建缓存`,
			content: `即将清理构建缓存，是否继续操作？`,
			icon: 'warning-filled',
		})
		
		await useDataHandle({
			loading: `正在清理，请稍后...`,
			request: cleanBuildCache(), 
			message: true,
			success: (res: any) => {
					setTypeRefreshTable(type)
				callback && callback(res)
			},
		})
	} catch (error) {
		useHandleError(error);
	}
};
/**
 * @description 设置状态
 */
const setStatus = async (type:'start'|'stop'|'restart',row:any,table:'php'|'java'|'python'|'go',callback?:AnyFunction) => {
	try {
		await useDataHandle({
			loading: `正在设置，请稍后...`,
			request: setEnvStatus({runtime_status:type, compose_file:row.compose}), 
			message: true,
			success: (res: any) => {
				setTypeRefreshTable(table)
				callback && callback(res)
			},
		})
	} catch (error) {
		useHandleError(error);
	}
};
/**
 * @description 刷新模板
 */
const refreshTemplate = async (type:'php'|'java'|'python'|'go',callback?:AnyFunction) => {
	try {
		await useDataHandle({
			loading: `正在刷新，请稍后...`,
			request: refreshEnvTemplate(), 
			message: true,
			success: (res: any) => {
				setTypeRefreshTable(type)
				callback && callback(res)
			},
		})
	} catch (error) {
		useHandleError(error);
	}
};
/**
 * @description 获取版本
 */
const getVersion = async (type:'all' | 'php' | 'java' | 'go' | 'python' = 'all') => {
	try {
		const params:DockerSiteEnvVersionProps = {runtime_type: type}
		return await useDataHandle({
			loading: `正在获取版本，请稍后...`,
			request: getEnvVersion(params), 
			message: false,
		})
	} catch (error) {
		useHandleError(error);
	}
};

const resetData = ()=>{
	tabActive.value = 'php'
	refreshEnvTable.value = false
	refreshJavaEnvTable.value = false
	refreshPythonEnvTable.value = false
	refreshGoEnvTable.value = false
}

  return {
		tabActive,
    refreshEnvTable,
		refreshJavaEnvTable,
		refreshPythonEnvTable,
		refreshGoEnvTable,
		// setRefreshTable,
		// setRefreshJavaTable,
		// setRefreshPythonTable,
		// setRefreshGoTable,
		setTypeRefreshTable,
		delDockerEnv,
		useBatchEventHandle,
		cleanCache,
		refreshTemplate,
		getVersion,
		setStatus,
		resetData,
  };
});

const useDockerSiteEnvStore = () => {
  return storeToRefs(DOCKER_SITE_ENV_STORE());
};

export { DOCKER_SITE_ENV_STORE, useDockerSiteEnvStore };
