import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getDomaiNuniversalModule } from '@/api/domain'
import { domainFun } from '@api/ssl'
import { useMessage, useDialog } from '@/hooks/tools'
import { useConfirm } from '@hooks/tools'
import { checkObjKey, deepClone, isArray } from '@utils/index'
import { useDnsResolveStore } from './useStore'
const { securityToken, isRefreshDomainList, typeOptions, lineTypeOptions, currentHint, subDomainTableList, tableList, isDisabledAdd, isUpdate, isAdd, expandRowKeys, recordValueExamples, recordValueDescriptions, hostRecordExamples, fieldDescriptions } = useDnsResolveStore()
const message = useMessage()
// 密保验证弹框
const showSecurityVerificationDialog = (param: any, retryFunction: () => Promise<void>) => {
	return useDialog({
		title: '验证密保问题',
		area: 50,
		btn: ['确认', '取消'],
		showFooter: true,
		compData: {
			questionId: param.questions?.[0]?.question_id,
			questionText: param.questions?.[0]?.question_text,
			operationType: param.operation_type,
			onSuccess: async (token: string) => {
				securityToken.value = token
				await retryFunction()
			}
		},
		component: () => import('../security-verification/index.vue'),
	})
}

// 获取选项数据
export const fetchOptionsData = async () => {
	try {
		const recordTypesResponse = await getDomaiNuniversalModule({
			url: '/api/v1/dns/record/get_record_type_list'
		})
		
		if (recordTypesResponse.data.status && recordTypesResponse.data.data) {
			const recordTypes = recordTypesResponse.data.data.map((item: any) => ({
				label: item.type,
				value: item.type,
				description: item.desc,
				default: item.default
			}))
			
			typeOptions.value = recordTypes.map((item: any) => ({
				title: item.label,
				key: item.value,
				description: item.description,
				default: item.default
			}))
			
			return { recordTypes }
		}
		
		return { recordTypes: [] }
	} catch (error) {
		console.error('获取选项数据失败:', error)
		return { recordTypes: [] }
	}
}

// 获取DNS记录列表
export const getSubDomainListData = async (state: any, props: any) => {
	if (state.isUpdate.value) return ElMessage.error('请先保存当前修改的数据，再进行其他操作！')
	
	state.isUpdate.value = false
	state.isAdd.value = false
	state.expandRowKeys.value = []
	state.isSubDomainLoading.value = true
	
	try {
		const params = {
			url: '/api/v1/dns/record/list',
			domain_id: state.requestData.value.domain_id,
			searchKey: state.requestData.value.searchKey,
			domain_type: state.requestData.value.domain_type,
			p: state.requestData.value.p,
			row: state.requestData.value.limit,
			...(state.requestData.value.searchValue && { searchValue: state.requestData.value.searchValue })
		}
		
		const res = await getDomaiNuniversalModule(params)
		
		if (res.data.status) {
			const { data } = res.data
			
			if (isArray(data.data)) {
				const convertedData = data.data.map((item: any) => ({
					RecordId: item.record_id,
					name: item.record,
					type: item.type,
					value: item.value,
					ttl: item.TTL,
					priority: item.MX,
					state: item.state,
					status: item.state === 0 ? '启用' : '暂停',
					remark: item.remark,
					created_at: item.created_at,
					lineWeight: 1,
					line: 0,
					line_type: item.line_type || 0
				}))
				
				state.subDomainTableList.value = convertedData
				state.tableList.value = deepClone(convertedData)
				state.isDisabledAdd.value = false
			} else {
				state.subDomainTableList.value = []
				state.tableList.value = []
				state.isDisabledAdd.value = true
			}
			
			state.requestData.value.total = data.count || 0
		} else {
			console.error('获取DNS记录失败:', res.data.msg)
			ElMessage.error(res.data.msg || '获取DNS记录失败')
		}
	} catch (error) {
		console.error('获取DNS记录出错:', error)
		ElMessage.error('获取DNS记录失败')
	} finally {
		state.isSubDomainLoading.value = false
	}
}

// 修改当前提示
export const changeCurrentNameEvent = (val: string, state: any) => {
	currentHint.value = val
	subDomainTableList.value = deepClone(subDomainTableList.value) as any[]
}

// 修改记录类型
export const onTypeChange = (val: any, row: any) => {
	row.type = val
}

// 修改线路类型
export const onLineTypeChange = (val: any, row: any) => {
	row.line_type = val
}

// 修改记录值
export const changeRowEvent = (val: string, key: string) => {
	if (subDomainTableList.value.length > 0) {
		subDomainTableList.value[0][key] = val
	}
}

// 获取字段特殊说明
export const getValueHintDescription = () => {
	if (currentHint.value === 'value') {
		const currentRecord = subDomainTableList.value[0]
		const recordType = currentRecord?.type
		return recordValueDescriptions.value[recordType as keyof typeof recordValueDescriptions.value] || null
	}
	return fieldDescriptions.value[currentHint.value as keyof typeof fieldDescriptions.value] || null
}

// 获取提示项数据
export const getHintItems = () => {
	const hintType = currentHint.value
	
	// 主机记录示例
	if (hintType === 'name') {
		return hostRecordExamples.value
	}
	
	if (hintType === 'value') {
		const currentRecord = subDomainTableList.value[0]
		const recordType = currentRecord?.type
		return recordValueExamples.value[recordType as keyof typeof recordValueExamples.value] || []
	}
	
	if (hintType === 'type') {
		return typeOptions.value.map(item => ({
			key: item.key,
			label: item.title,
			value: item.key,
			description: (item as any).description || '暂无描述',
			clickable: true
		}))
	}
	return []
}

// 获取线路类型标签
export const getLineTypeLabel = (value: any): string => {
	const selectedOption = lineTypeOptions.value.find(opt => opt.value === value)
	return selectedOption?.label || '默认'
}

// 取消编辑
export const onCancelEvent = (row: any, index: number, state: any) => {
	isUpdate.value = false
	isAdd.value = false
	currentHint.value = 'name'
	expandRowKeys.value = []
	subDomainTableList.value = deepClone(tableList.value) as any[]
}

// 保存记录
export const onSaveEvent = async (row: any, state: any, props: any) => {
	if (!row.name) {
		ElMessage.error('主机记录不能为空')
		return
	}
	if (!row.value) {
		ElMessage.error('记录值不能为空')
			return
		}

	const saveRecord = async () => {
		const load = message.load('正在保存解析记录，请稍候...')
		
		const isCreate = row.RecordId === 0
		const apiUrl = isCreate ? '/api/v1/dns/record/create' : '/api/v1/dns/record/update'
		
		let params: any = {
			domain_type: 1,
			domain_id: props.compData.domainId,
			record: row.name,
			value: row.value,
			type: row.type,
			mx: row.priority || 1,
			ttl: row.ttl || 600,
			remark: row.remark || '',
			view_id: row.line_type || 0,
		}

		if (securityToken.value) {
			params.security_token = securityToken.value
		}
		
		if (!isCreate) {
			params.record_id = row.RecordId
		}
		
		try {
			const response = await getDomaiNuniversalModule({
				url: apiUrl,
				...params
			})
			
			load && load.close()
			
			if (response.data.status) {
				message.success(isCreate ? '创建成功' : '更新成功')
				isUpdate.value = false
				isAdd.value = false
				currentHint.value = 'name'
				expandRowKeys.value = []
				await getSubDomainListData(state, props)
				console.log('isRefreshDomainList', isRefreshDomainList)
				isRefreshDomainList.value = true
			} else {
				const responseData = response.data.data || response.data
				
				if (response.data.code === 3005 && responseData.security_required) {
					await showSecurityVerificationDialog(responseData, saveRecord)
				} else {
					message.error(response.data.msg || '保存失败')
				}
			}
	} catch (error) {
			load && load.close()
			console.error('保存解析记录失败:', error)
			message.error('保存失败，请重试')
		}
	}
	
	// 执行保存
	await saveRecord()
}

// 修改记录  
export const onUpdateEvent = (row: any, index: number, state: any, props: any) => {
	if (state.isUpdate.value) return ElMessage.error('请先保存当前修改的数据，再进行其他操作！')

	state.isUpdate.value = true
	state.expandRowKeys.value = [row.RecordId]
	
	if (index !== 0) {
		const temp = state.subDomainTableList.value[0]
		state.subDomainTableList.value[0] = { ...row }
		state.subDomainTableList.value[index] = temp
	} else {
		state.subDomainTableList.value[0] = { ...row }
	}
}

// 添加子域名
export const addSubDomain = (state: any) => {
	if (state.isDisabledAdd.value) return ElMessage.error('暂无数据')
	if (state.isUpdate.value) return ElMessage.error('请先保存当前修改的数据，再进行其他操作！')
	state.isUpdate.value = true
	state.isAdd.value = true
	state.expandRowKeys.value = [0]
	state.subDomainTableList.value.unshift({
		RecordId: 0,
		name: '',
		type: 'A',
		line: 'default',
		line_type: 0,
		value: '',
		priority: 1,
		ttl: 600,
		status: '启用',
		remark: '',
	})
}

// 删除记录
export const onDel = async (row: any, state: any, props: any) => {
	if (state.isUpdate.value) return ElMessage.error('请先保存当前修改的数据，再进行其他操作！')
	
	await useConfirm({
		title: `删除【${row.name}】`,
		content: '删除该DNS记录，是否继续操作？',
		icon: 'warning',
	})
	
	// 定义删除逻辑函数
	const deleteRecord = async () => {
		try {
			const load = message.load('正在删除DNS记录，请稍候...')
			
			const params: any = {
				url: '/api/v1/dns/record/delete',
				record_id: row.RecordId,
				domain_type: 1,
				domain_id: props.compData.domainId
			}
			
			if (securityToken.value) {
				params.security_token = securityToken.value
			}
			
			const res = await getDomaiNuniversalModule(params)
			load && load.close()
			
			if (res.data.status) {
				message.success('删除成功')
				await getSubDomainListData(state, props)
				isRefreshDomainList.value = true
			} else {
				const responseData = res.data.data || res.data
				
				if (res.data.code === 3005 && responseData.security_required) {
					await showSecurityVerificationDialog(responseData, deleteRecord)
				} else {
					message.error(res.data.msg || '删除失败')
				}
			}
	} catch (error) {
			console.log('error', error)
			ElMessage.error('删除失败，请重试')
		}
	}
	
	// 执行删除
	await deleteRecord()
}

// 修改状态
export const onStatusChange = async (row: any, state: any, props: any) => {
	// 定义状态切换逻辑函数
	const changeStatus = async () => {
		let load
		try {
			const isEnabled = row.status === '启用'
			const apiUrl = isEnabled ? '/api/v1/dns/record/pause' : '/api/v1/dns/record/start'
			
			const params: any = {
				url: apiUrl,
				record_id: row.RecordId,
				domain_type: 1,
				domain_id: props.compData.domainId
			}
			
			if (securityToken.value) {
				params.security_token = securityToken.value
			}
			
			load = message.load('正在修改状态，请稍候...')
			const res = await getDomaiNuniversalModule(params)
			load && load.close()
			
			if (res.data.status) {
				message.success(isEnabled ? '暂停成功' : '启动成功')
				onCancelEvent(row, 0, state)
				await getSubDomainListData(state, props)
			} else {
				const resData = res.data.data || res.data
				
				if (res.data.code === 3005 && resData.security_required) {
					await showSecurityVerificationDialog(resData, changeStatus)
				} else {
					message.error(res.data.msg || '状态修改失败')
				}
			}
	} catch (error) {
			console.log('error', error)
			message.error('状态修改失败，请重试')
		} finally {
			load && load.close()
		}
	}
	
	// 执行状态切换
	await changeStatus()
}

