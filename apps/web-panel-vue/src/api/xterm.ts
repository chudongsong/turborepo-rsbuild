/* eslint-disable @typescript-eslint/naming-convention */
import type { TermHostProps, TermCommandProps } from '@term/types'
import { useAxios } from '@/hooks/tools'

/**
 * @description 获取主机列表
 * @returns { Promise }
 */
export const getHostList = (): Promise<any> => useAxios.post('xterm/get_host_list', { check: 'array' })

/**
 * @description 创建主机信息
 * @param { TermHostProps } data 主机信息
 * @returns { Promise }
 */
export const createHost = (data: TermHostProps): Promise<any> => useAxios.post('xterm/create_host', { data, check: 'msg' })

/**
 * @description 删除主机信息
 * @param { string } host 主机信息
 * @returns { Promise }
 */
export const removeHost = (host: string, port: any): Promise<any> => useAxios.post('xterm/remove_host', { data: { host, port }, check: 'msg' })

/**
 * @description 获取主机信息
 * @param {string} host
 */
export const getHostFind = (host: string, port: number): Promise<any> => useAxios.post('xterm/get_host_find', { data: { host, port }, check: 'object' })

/**
 * @description 获取录像开关状态
 * @returns { Promise }
 */
export const getLoginRecord = (): Promise<any> => useAxios.post('ssh_security/get_login_record', { check: 'object' })

/**
 * @description 设置录像开关状态
 * @returns { Promise }
 */
export const setLoginRecord = (status: boolean): Promise<any> => {
	const url = status ? 'stop_login_record' : 'start_login_record'
	return useAxios.post(`ssh_security/${url}`, { check: 'msg' })
}

/**
 * @description 获取录像列表
 * @returns { Promise }
 */
export const getVideoList = (data: { p: number; limit: number }): Promise<any> => useAxios.post('ssh_security/get_record_list', { data, check: 'object' })

/**
 * @description 获取命令列表
 * @returns { Promise }
 */
export const getCommandList = (): Promise<any> => useAxios.post('xterm/get_command_list', { check: 'array' })

/**
 * @description 创建命令
 * @returns { Promise }
 */
export const createCommand = (data: TermCommandProps): Promise<any> => useAxios.post('xterm/create_command', { data, check: 'msg' })

/**
 * @description 修改命令
 * @returns { Promise }
 */
export const modifyCommand = (data: TermCommandProps): Promise<any> => useAxios.post('xterm/modify_command', { data, check: 'msg' })

/**
 * @description 删除命令
 * @param { string } title 命令标题
 * @returns { Promise }
 */
export const removeCommand = (title: string): Promise<any> => useAxios.post('xterm/remove_command', { data: { title }, check: 'msg' })
/**
 * @description 导出常用命令
 * @returns { Promise }
 */
export const exportCommand = (): Promise<any> => useAxios.post('xterm/out_command', { check: 'msg' })

/**
 * @description 启用或关闭补全工具
 * @param { string } title 命令标题
 * @returns { Promise }
 */
export const setAutoComplete = (status: 1 | 0): Promise<any> => useAxios.post('xterm/set_completion_tool_status', { data: { status }, check: 'msg' })
/**
 * @description 获取补全工具是否启用
 * @returns { Promise }
 */
export const getAutoComplete = (): Promise<any> => useAxios.post('xterm/completion_tool_status', { check: 'msg' })

/**
 * @description 获取审计录像内容
 * @param { number } record_id 录像ID
 * @returns { Promise }
 */
export const getRecordVideo = (record_id: number): Promise<any> => useAxios.post('ssh_security/get_record_video', { data: { record_id }, check: 'object' })

/**
 * @description 删除指定的审计录像
 * @param { number[] } record_ids 录像ID列表
 * @returns { Promise }
 */
export const removeVideoRecord = (record_ids: number[]): Promise<any> => useAxios.post('ssh_security/remove_video_record', { data: { record_ids: JSON.stringify(record_ids) }, check: 'msg' })
