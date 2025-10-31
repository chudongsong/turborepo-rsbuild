import { useMessage,useDataHandle, useDialog,useConfirm } from '@/hooks/tools';
import { getOllamaModelList,getOllamaModelDetail,downloadOllamaModel,getAllGpuDeviceInformation,delOllamaModel,getGpuInfoByIndex } from '@/api/docker';
import { getByteUnit, getPageTotal } from '@/utils'
import { Socket, useSocket } from '@/hooks/tools/socket'
import { ElTooltip,ElDropdown,ElDropdownMenu,ElDropdownItem } from 'element-plus'
import BtDivider from '@/components/other/bt-divider';
import { isDark } from '@/utils/theme-config';

const Message = useMessage(); // 消息提示
const currentStatus:Ref<'all' | 'installed' | 'downloading' | 'failed' | 'uninstall'> = ref('all')// 当前状态
let socketInfo: Socket | null = null


/**
 * @description 表格配置
 */
export const tableConfig = (injectFnRef:Ref<{refresh:AnyFunction,serviceName:string,param:AnyObject}>) => ({
	request: async (params:any) => {
		const res = await getModelList({...params,service_name:injectFnRef.value.serviceName},currentStatus.value)
		return res
	},
	columns: [
		{
			label: `名称`,
			prop: 'name',
			align: 'center',
			width: 200,
		},
		{
				label: `描述`,
				prop: 'description',
				render: (row: any) => {
					return (
						<ElTooltip
							effect="dark"
							content={row.description}
							popper-class="w-[35rem]"
							show-after={500}
							placement="top-start"
							disabled={!row._isOverflow}
						>
							<div 
								class="w-[95%] truncate"
								ref={(el: HTMLDivElement) => {
									if (el) {
										// 检测内容是否溢出
										row._isOverflow = el.scrollWidth > el.clientWidth;
									}
								}}
							>
								{row.description}
							</div>
						</ElTooltip>
					)
				},
			},
			{
				label: `版本`,
				prop: 'version',
				align: 'center',
				width: 100,
			},
			{
				label: `大小`,
				prop: 'size',
				align: 'center',
				width: 100,
			},
			{
				label: `状态`,
				prop: 'status',
				align: 'center',
				width: 100,
				renderHeader: () => {
					return (
						<ElDropdown onCommand={(command:string) => handleCommandChange(command,currentStatus,injectFnRef.value)}>
								{{
									default: () => (
												<div class="flex items-center">
													<span>状态</span>
													<span>{currentStatus.value === 'all' ? '' : `(${getStatusText(currentStatus.value)})`}</span>
													<span class="svgtofont-el-arrow-down" />
												</div>
											),

									dropdown: () => (
										<ElDropdownMenu>
											{statusList.map((item: {label:string,value:string}) => (
												<ElDropdownItem command={item.value}>{item.label}</ElDropdownItem>
											))}
										</ElDropdownMenu>
									),
								}}
							</ElDropdown>
					)
				},
				render: (row: any) => {
					let text = ''
					let color = ''
					let classNames = ''
					switch(row.status){
						case 'installed':
							text = '已安装'
							color = 'primary'
							break
						case 'downloading':
							text = '下载中'
							color = 'warning'
							classNames = 'cursor-pointer flex items-center'
							break
						case 'failed':
							text = '失败'
							color = 'danger'
							classNames = 'cursor-pointer'
							break
						default:
							text = '未安装'
							color = '#666'
							break
					}
							return (
									<span class={`text-${color} ${classNames}`} onClick={()=>getModelInstallLog(row,injectFnRef.value)}>
										{text}
										{row.status === 'downloading' && (
											<span class="inline-block svgtofont-el-loading"></span>
										)}
									</span>
							)
				},
			},
			{
				label: `操作`,
				prop: 'operate',
				fixed: 'right',
				width: 140,
				align: 'right',
				render: (row: any) => {
					return (
						<div class="w-full flex items-center justify-end">
							{row.status === 'installed' && (
								<span class="bt-link" onClick={()=>getModelDetail(row,injectFnRef.value)}>查看详情</span>
							)}
							{
								row.status === 'downloading' && (
									<span>--</span>
								)
							}
							{row.status !== 'installed' && row.status !== 'downloading' && (
								<span class="bt-link" onClick={()=>downloadModel(row,injectFnRef.value)}>下载</span>
							)}
							{row.status === 'installed' && (
								<span>
									<BtDivider />
									<span class="bt-link" onClick={()=>deleteModel(row,injectFnRef.value)}>删除</span>
								</span>
							)}

						</div>
					)
				},
			},
		]
})

/**
 * @description 状态列表
 */
const statusList = [
	{label: '全部',value: 'all'},
	{label: '已安装',value: 'installed'},
	{label: '下载中',value: 'downloading'},
	{label: '失败',value: 'failed'},
	{label: '未安装',value: 'uninstall'},
]

/**
 * @description 获取状态文本
 */
const getStatusText = (status: 'all' | 'installed' | 'downloading' | 'failed' | 'uninstall') => {
	const statusText = {
		all: '',
		installed: '已安装',
		downloading: '下载中',
		failed: '失败',
		uninstall: '未安装',
	}
	return statusText[status]
}


/**
 * @description 状态命令
 * @param command 命令
 * @param currentStatus 当前状态
 * @param injectFnRef 表格方法
 */
const handleCommandChange = (command:string,currentStatus:Ref<string>,injectFnRef:{refresh:AnyFunction,param:AnyObject}) => {
	currentStatus.value = command
	// 触发刷新，如果当前页码为1，则触发刷新，否则将页码设置为1触发自动刷新
	if(injectFnRef.param.p === 1){
		injectFnRef.refresh()
	}else{
		injectFnRef.param.p = 1
	}
}




/**
 * @description 编辑器配置
 */

export const editorConfig = {
	mode: 'ace/mode/json',
	theme: !isDark.value ? 'ace/theme/monokai' : 'ace/theme/clouds_midnight', // 主题
	wrap: true, // 是否自动换行
	showInvisibles: false, // 是否显示空格
	showFoldWidgets: false, // 是否显示代码折叠线
	useSoftTabs: true, // 是否使用空格代替tab
	tabSize: 2, // tab宽度
	showPrintMargin: false, // 是否显示打印边距
	readOnly: true, // 是否只读
	fontSize: '12px', // 字体大小
}
/**
 * @description 获取应用列表

 */
export const getModelList = async (params:any,status:string) => {
	const {data} = await useDataHandle({
		request: getOllamaModelList({
			...params,
			status,
			// row: params.limit
		}),
		loading: '正在获取模型列表',
	});
	if(data.status){
		return {
			total: getPageTotal(data.page),
			data: data.data
		}
	}else{
		Message.error(data.msg)
		return {
			total: 0,
			data: [],
		}
	}




};

/**
 * @description 获取模型详情
 */
export const getModelDetail = async (moudelData:any,injectFn:{refresh:AnyFunction,serviceName:string}) => {
	useDataHandle({
		request: getOllamaModelDetail({
			model_name: moudelData.name,
			model_version: moudelData.version,
			service_name: injectFn.serviceName,
		}),
		loading: '正在获取模型详情',
		success: (res:any) => {
			if(res.status){
				useDialog({
					title: `模型详情-${moudelData.name}`,
					area: 75,
					component: () => import('./model-detail-popup.vue'),
					compData: JSON.stringify(res.data, null, 2),
					btns: false,
				})
			}
		},
		
	})
}
/**
 * @description 获取模型安装日志
 */
export const getModelInstallLog = async (moudelData:any,injectFn:{refresh:AnyFunction,serviceName:string}) => {
	if(moudelData.status !== 'downloading'){
		return
	}
	const dataArr:any[] = []
	const logContent = ref('正在获取日志')
	let popupInstance:any = null
		/**
		 * @description 创建websocket
		 */
		const createWebSocket = () => {
			socketInfo?.close()

			socketInfo = useSocket({
				route: '/sock_shell',
				onMessage: (ws: WebSocket, e: MessageEvent) =>{
					
					const data = e.data
					dataArr.push(data)
					// 拼接安装信息
					// logsMsg.value += '\n' + data

					// 如果队列长度超过最大长度，删除多余的消息
					if (dataArr.length > 50) {
						logContent.value = dataArr.slice(dataArr.length - 50).join('\n')
					} else {
						logContent.value = dataArr.join('\n')
					}
					if(data.includes('bt_successful')){
						popupInstance && popupInstance.unmount()
						popupInstance = null
						injectFn.refresh()
					}
				},
			})
			socketInfo?.send({})
			socketInfo?.send(`tail -f /tmp/${injectFn.serviceName}.log`)
		}

		createWebSocket()

		popupInstance = await useDialog({
		title: `模型安装日志-${moudelData.name}`,
		area: 75,
		component: () => import('./model-install-log.vue'),
		compData: logContent,
		onCancel: () => {
			socketInfo?.close()
			popupInstance = null
		},
		btns: false,
	})
	return popupInstance
	// return useDialog({
	// 	title: `模型安装日志-${moudelData.name}`,
	// 	area: 75,
	// 	component: () => import('./model-install-log.vue'),
	// 	compData: {
	// 		serviceName: injectFn.serviceName,
	// 	},
	// 	onCancel: () => {
	// 		injectFn.refresh()
	// 	},
	// 	btns: false,
	// })
	
}


/**
 * @description 下载模型
 */
export const downloadModel = async (moudelData:any,injectFn:{refresh:AnyFunction,serviceName:string}) => {
	if(!moudelData.can_down){
		return Message.error('当前已存在下载任务，请等待下载完成')
	}
	useDataHandle({
		request: downloadOllamaModel({
			model_name: moudelData.name,
			service_name: injectFn.serviceName,
			model_version: moudelData.version,
		}),
		loading: '正在下载模型',
		success: (res:any) => {
			if(res.status){
				Message.success('开始下载')
				injectFn.refresh()
				getModelInstallLog({name: moudelData.name,status: "downloading"},injectFn)
			}else{
				Message.error(res.msg)
			}

		},
		error: () => {
			Message.error('下载失败')
		},
	})
}




/**
 * @description 删除模型
 */
export const deleteModel = async (moudelData:any,injectFn:{refresh:AnyFunction,serviceName:string}) => {
	try {
		await useConfirm({
			title: `删除模型-${moudelData.name}`,
			content: '确定删除该模型吗？',
		})
		useDataHandle({
			request: delOllamaModel({
				service_name: injectFn.serviceName,
				model_name: moudelData.name,
				model_version: moudelData.version,
			}),

			loading: '正在删除模型',
			success: (res:any) => {
				if(res.status){
					injectFn.refresh()
					Message.success('删除成功')
				}else{
					Message.error(res.msg)
				}
			},

		})
	} catch (error) {
		console.log(error)
	}

}


export const gpuInfoData = ref<any>({})
/** 处理功率单位转换 */
const handlePower = (power: any) => {
    if (power?.current) power.current /= 1000;
    if (power?.max) power.max /= 1000;
};

/** 处理内存单位转换 */
const handleMemory = (memory: any) => {
    const convert = (val: number) => getByteUnit(val * 1024 ** 3);
    if (memory?.free) memory.free = convert(memory.free);
    if (memory?.used) memory.used = convert(memory.used);
    if (memory?.size) memory.size = convert(memory.size);
};

/** 统一处理 GPU 信息 */
const processGpuInfo = (value: any) => {
    handlePower(value.power);
    handleMemory(value.memory);
    return value;
};

export const getGpuSystemInfo = async (tabIndex?: string) => {
	try {
    const isSingle = Number.isInteger(Number(tabIndex));
    const { status, data, msg,...rest } = await useDataHandle({
        request: isSingle 
            ? getGpuInfoByIndex({ index: Number(tabIndex) })
            : getAllGpuDeviceInformation(),
        // loading: isSingle ? false : '正在获取gpu系统信息',
    });

    if (status === false) {
        Message.error(msg);
        return isSingle ? void 0 : (gpuInfoData.value = { system: false, list: [], tableList: [] });
    }

    if (isSingle) {
        gpuInfoData.value.list[Number(tabIndex)] = { key: tabIndex, value: processGpuInfo(data) };
        return;
    }
		

    const tableList: any[] = [];
    const list = Object.entries(data)
        .filter(([key]) => key !== 'system')
        .map(([key, value]: any) => {
            const processed = processGpuInfo(value);
            processed.processes?.forEach((item: any) => tableList.push({
                gpu: key,
                pid: item.pid,
                type: item.type,
                name: item.name,
                memory: getByteUnit(item.usedGpuMemory),
            }));
            return { key, value: processed };
        });
		// 处理cuda版本，按0分割
		data.system.version.cuda = `${data.system.version.cuda}`.split('0').filter(Boolean).join('.')
    gpuInfoData.value = { system: data.system, list, tableList };
    return { data: tableList, total: data.system.count };
	} catch (error) {
		gpuInfoData.value = { system: false, list: [], tableList: [] }
	}
};


export const unmountedHandle = () => {
	currentStatus.value = 'all'
	gpuInfoData.value = {}
}