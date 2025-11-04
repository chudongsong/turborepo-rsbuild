
import { useHandleError,useDataHandle,useConfirm,Message } from '@/hooks/tools';
import {getDatabaseAuditLog,setDatabaseAuditLog,getAuditAdvUserList,getAuditAdvDatabaseList,getAuditAdvOrderList,setDatabaseAuditLogRules,getAuditLog} from '@/api/database'
import { serviceManage } from '@api/global'
import { multiply, toLower, compose } from 'ramda';
import { getByteUnit } from '@utils/index'

const DATABASE_MYSQL_ADVANCED_AUDIT_STORE = defineStore('DATABASE-MYSQL-ADVANCED-AUDIT-STORE', () => {

const auditBaseFormData = ref({
	status: false,
	oldStatus: false,
	audit_log_file: '',
	audit_log_format: 'JSON' as 'JSON' | 'OLD' | 'NEW' | 'CSV',
	audit_log_buffer_size: `1`,
	audit_log_flush: false,
	audit_log_policy: 'LOGINS' as 'ALL'|'LOGINS'|'QUERIES',
	audit_log_rotate_on_size: `0`,
	audit_log_rotations: `0`,
	audit_log_strategy: `ASYNCHRONOUS` as 'ASYNCHRONOUS'|'PERFORMANCE'|'SYNCHRONOUS',
}) // 表单数据
const auditAdvFormData = ref({
	mode: '' as 'include'|'exclude'|'',
	audit_log_exclude_accounts: [] as string[],
	audit_log_exclude_databases: [] as string[],
	audit_log_exclude_commands: [] as string[],
	audit_log_include_accounts: [] as string[],
	audit_log_include_databases: [] as string[],
	audit_log_include_commands: [] as string[],
}) // 表单数据
const logContent = ref('') // 日记内容
const loading = ref({
	user: false,
	database:false,
	order:false,
	log: false,
})// 加载状态
const allData = reactive({
	user:[] as string[],
	database:[] as string[],
	order:[] as string[],
})

const userOptions = shallowRef() // 用户列表
const databaseOptions = shallowRef() // 数据库列表
const orderOptions = shallowRef() // 查询列表
/**
 * @description 获取日记审计基础数据
 */
const getAuditBaseData = async () => {
	const toArr = (str:string) => str.split(',').filter((item:string) => item !== '' && item !== ' ')
	try {
		const res:any = await useDataHandle({
			loading: `正在获取数据，请稍后...`,
			request: getDatabaseAuditLog(), 
		})
		if(res.status){
			// 基础设置
			auditBaseFormData.value.status = res.data.status === 'ON'|| res.data.status === 'on'
			auditBaseFormData.value.oldStatus = res.data.status === 'ON'|| res.data.status === 'on'
			auditBaseFormData.value.audit_log_format = res.data.audit_log_format || 'JSON'
			auditBaseFormData.value.audit_log_file = res.data.audit_log_file
			auditBaseFormData.value.audit_log_buffer_size = getByteUnit(Number(res.data.audit_log_buffer_size||0),false,2,'MB')
			auditBaseFormData.value.audit_log_flush = res.data.audit_log_flush === 'ON' || res.data.audit_log_flush === 'on'
			auditBaseFormData.value.audit_log_policy = res.data.audit_log_policy
			auditBaseFormData.value.audit_log_rotate_on_size = getByteUnit(Number(res.data.audit_log_rotate_on_size||0),false,2,'MB')
			auditBaseFormData.value.audit_log_rotations = res.data.audit_log_rotations || '0'
			auditBaseFormData.value.audit_log_strategy = res.data.audit_log_strategy || 'ASYNCHRONOUS'
			// 高级设置
			auditAdvFormData.value.audit_log_exclude_accounts = toArr(res.data.audit_log_exclude_accounts||'')
			auditAdvFormData.value.audit_log_exclude_databases = toArr(res.data.audit_log_exclude_databases||'')
			auditAdvFormData.value.audit_log_exclude_commands = toArr(res.data.audit_log_exclude_commands||'')
			auditAdvFormData.value.audit_log_include_accounts = toArr(res.data.audit_log_include_accounts||'')
			auditAdvFormData.value.audit_log_include_databases = toArr(res.data.audit_log_include_databases||'')
			auditAdvFormData.value.audit_log_include_commands = toArr(res.data.audit_log_include_commands||'')
			const modeInclude = !areAllValuesEmpty([res.data.audit_log_include_accounts,res.data.audit_log_include_databases,res.data.audit_log_include_commands])
			const modeExclude = !areAllValuesEmpty([res.data.audit_log_exclude_accounts,res.data.audit_log_exclude_databases,res.data.audit_log_exclude_commands])
			auditAdvFormData.value.mode = modeInclude ? 'include' : modeExclude ? 'exclude' : ''
		}else{
			useHandleError(res)
		}
	} catch (error) {
		useHandleError(error);
	}
};
// 重启数据库
const restartDatabase = async () => {
	try {
		await useConfirm({
			title: `重启数据库`,
			content: `即将重启数据库，是否继续操作！`,
		})
		await useDataHandle({
			loading: `正在重启数据库，请稍后...`,
			message: true,
			request: serviceManage({name:'mysqld',type:'restart'}), 
		})
		getAuditBaseData()
	} catch (error) {
		useHandleError(error);
	}
}
// 设置日记审计基础数据
const setAuditBaseData = async (params:typeof auditBaseFormData.value) => {
	try {
		if(!params.status){
			try {
				await useConfirm({
					title: `关闭日志审计`,
					content: `即将关闭日志审计并重启数据库，数据库不会再记录相关操作日志，可能会失去一些安全性和审计能力，是否继续操作！`,
				})
				useDataHandle({
					loading: `正在关闭并重启数据库，请稍后...`,
					message: true,
					request: setDatabaseAuditLog({
						// ...params,
						status:params.status ? 'on' : 'off',
						// audit_log_flush:params.audit_log_flush ? 'ON' : 'OFF',
						// audit_log_buffer_size:toBytes(Number(params.audit_log_buffer_size), 'MB'),
						// audit_log_rotate_on_size:toBytes(Number(params.audit_log_rotate_on_size), 'MB'),
					}), 
					success: (res:{status:boolean}) => {
						if(!res.status){
							auditBaseFormData.value.status = true
						}
					}
				})
			} catch (error) {
				auditBaseFormData.value.status = true
			}
			return
		}
		useDataHandle({
			loading: `正在保存，请稍后...`,
			message: true,
			request: setDatabaseAuditLog({...params,
				status:params.status ? 'on' : 'off',
				audit_log_flush:params.audit_log_strategy === 'SYNCHRONOUS' && params.audit_log_flush ? 'ON' : 'OFF',
				audit_log_buffer_size:toBytes(Number(params.audit_log_buffer_size), 'MB'),
				audit_log_rotate_on_size:toBytes(Number(params.audit_log_rotate_on_size), 'MB'),
			}), 
		})
	} catch (error) {
		useHandleError(error);
	}
}
/**
 * @description 获取用户列表
 */
const getUser = async () => {
	try {
		useDataHandle({
			loading: toRef(loading.value,'user'),
			request: getAuditAdvUserList(), 
			data: [Array,(arr:any[])=>{
				allData.user = arr
				userOptions.value = arr.map((item:any) => {
					return {
						label: item,
						value: item
					}
				})
			}]
		})
	} catch (error) {
		useHandleError(error);
	}
};
/**
 * @description 获取数据库列表
 */
const getDatabase = async () => {
	try {
		useDataHandle({
			loading: toRef(loading.value,'database'),
			request: getAuditAdvDatabaseList(), 
			data: [Array,(arr:string[][])=>{
				allData.database = arr.flat(1)
				databaseOptions.value = allData.database.map((item:string) => {
					return {
						label: item,
						value: item
					}
				})
			}]
		})
	} catch (error) {
		useHandleError(error);
	}
};
/**
 * @description 获取查询列表
 */
const getCommands = async () => {
	try {
		useDataHandle({
			loading: toRef(loading.value,'order'),
			request: getAuditAdvOrderList(), 
			data: [Array,(arr:string[])=>{
				allData.order = arr
				orderOptions.value = allData.order.map((item:string) => {
					return {
						label: item,
						value: item
					}
				})
			}]
		})
	} catch (error) {
		useHandleError(error);
	}
};
/**
 * @description 获取审计日志
 */
const getAduitLogs = async () => {
	try {
		useDataHandle({
			loading: toRef(loading.value,'log'),
			request: getAuditLog(), 
			success: (res:{msg:string,status:boolean}) => {
				if(res.status){
					logContent.value = res.msg
				}else{
					logContent.value = `获取日志失败`
				}
			}
		})
	} catch (error) {
		useHandleError(error);
	}
};
// 清空高级数据
const clearSubmit = async() => {
	try {
		await useConfirm({
			title: `清空记录规则`,
			content: `即将清空已经设置的日志记录规则，是否继续`,
		})
		auditAdvFormData.value.mode = ''
		auditAdvFormData.value.audit_log_exclude_accounts = []
		auditAdvFormData.value.audit_log_exclude_databases = []
		auditAdvFormData.value.audit_log_exclude_commands = []
		auditAdvFormData.value.audit_log_include_accounts = []
		auditAdvFormData.value.audit_log_include_databases = []
		auditAdvFormData.value.audit_log_include_commands = []
		setAuditRules(auditAdvFormData.value)
	} catch (error) {
		
	}
}
// 设置日记审计高级数据
const setAuditRules = async (params:typeof auditAdvFormData.value) => {
	const toSplitString = (str:string[]) => JSON.stringify(str.filter((item:string) => item !== '' && item !== ' ').join(','))
	try {
		useDataHandle({
			loading: `正在保存，请稍后...`,
			message: true,
			request: setDatabaseAuditLogRules({
				type: params.mode as 'include'|'exclude',
				...(params.mode === 'include' ? {
					accounts:toSplitString(params.audit_log_include_accounts),
					databases:toSplitString(params.audit_log_include_databases),
					commands:toSplitString(params.audit_log_include_commands),
				}:{
					accounts:toSplitString(params.audit_log_exclude_accounts),
					databases:toSplitString(params.audit_log_exclude_databases),
					commands:toSplitString(params.audit_log_exclude_commands)
				})
			}), 
		})
	} catch (error) {
		useHandleError(error);
	}
}
/**
 * @description 过滤方法
 * @param {string} key 参数的key
 * @param {string} query 查询条件
 * @param {AnyFunction} setDataFn 设置数据函数 (newValue) => {}
 * @param {typeof extendsupData} dataRef 扩展数据ref
 * @returns {App}
 */
const extsFilterMethod = (key:'user'|'database'|'order',query:string,optionsRef:Ref<{label:string,value:string}[]>,setDataFn:AnyFunction,selectRef:any) => {
	try {
		if(query.includes(',')){
			// 正常筛选
			// optionsRef.value = allData[key]?.filter((item:any) => item.includes(query)).map((item:any) => ({label:item,value:item})) || []
			const denyArr:string[] = [],accessArr:string[] = [],queryArr = query.split(',').filter((item:any) => item!== ''&& item !== ' ')
			queryArr.forEach((val:string) => {
				if(!allData[key].includes(val)){
					// 不支持的选项
					denyArr.push(val)
				}else{
					// 支持的选项
					accessArr.push(val)
				}
			})
			// 设置选中的选项
			setDataFn(accessArr)
			// 隐藏下拉框
			selectRef?.blur()
			// 提示不支持的选项
			if(denyArr.length > 0){
				Message.success(`已选中${accessArr.length}个，未查询到【${denyArr.join(',')}】选项，已忽略`)
			}else if(accessArr.length > 0){
				Message.success(`已选中${accessArr.length}个`)
			}
		}else{
			// 正常筛选
			optionsRef.value = allData[key]?.filter((item:any) => item.includes(query)).map((item:any) => ({label:item,value:item})) || []
		}
	} catch (error) {
		
	}
};
/**
 * 判断多个字符串是否都为空或无效
 * 
 * @param {Array<string | null | undefined>} strings - 字符串数组
 * @returns {boolean} 是否所有值都为空
 */
const areAllValuesEmpty = (strings:string[]) =>
  strings.every((str) => !str || str.trim() === '');
/**
 * 将文件大小从指定单位转换为字节数
 * 
 * @param size - 文件大小（数值类型）
 * @param unit - 当前单位（字符串类型，支持 "B", "KB", "MB", "GB", "TB"）
 * @returns 转换后的字节数，类型为 number
 */
const toBytes = (size: number, unit: string): number => {
  const unitToBytesMap:any = {
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
  };

  const getBytesMultiplier = (u: string) => {
    const multiplier = unitToBytesMap[u];
    return multiplier;
  };

  return compose(
    multiply(size),                // 乘以单位对应的倍数
    getBytesMultiplier,            // 查找单位对应的字节倍数
    toLower                        // 将输入单位统一为小写
  )(unit);
};

// 初始化数据
const resetData = () => {
	auditBaseFormData.value.status = false
	auditBaseFormData.value.oldStatus = false
	auditBaseFormData.value.audit_log_format = 'JSON'
	auditBaseFormData.value.audit_log_buffer_size = `1`
	auditBaseFormData.value.audit_log_flush = false
	auditBaseFormData.value.audit_log_policy = 'ALL'
	auditBaseFormData.value.audit_log_rotate_on_size = `0`
	auditBaseFormData.value.audit_log_rotations = `0`
	auditBaseFormData.value.audit_log_strategy = `ASYNCHRONOUS`

	auditAdvFormData.value.mode = ''
	auditAdvFormData.value.audit_log_exclude_accounts = []
	auditAdvFormData.value.audit_log_exclude_databases = []
	auditAdvFormData.value.audit_log_exclude_commands = []
	auditAdvFormData.value.audit_log_include_accounts = []
	auditAdvFormData.value.audit_log_include_databases = []
	auditAdvFormData.value.audit_log_include_commands = []

	logContent.value = ''
}

  return {
		resetData,
		auditBaseFormData,
		getAuditBaseData,
		setAuditBaseData,
		userOptions,
		auditAdvFormData,
		loading,
		getDatabase,
		extsFilterMethod,
		getUser,
		databaseOptions,
		getCommands,
		orderOptions,
		setAuditRules,
		logContent,
		getAduitLogs,
		restartDatabase,
		clearSubmit
  };
});

const useAuditStore = () => {
  return storeToRefs(DATABASE_MYSQL_ADVANCED_AUDIT_STORE());
};

export { DATABASE_MYSQL_ADVANCED_AUDIT_STORE, useAuditStore };
