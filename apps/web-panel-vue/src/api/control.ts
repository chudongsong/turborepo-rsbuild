/* eslint-disable @typescript-eslint/naming-convention */
import type { ResponseResult } from '@hooks/tools/axios/types'
import { useAxios } from '@hooks/tools'
// 设置监控状态
export interface SetControlProps {
	type: string
	day?: number
}
// cpu时间
export interface Time {
	start: number
	end?: number
}
// 面板日报的日期
export interface PanelDailyTime {
	date: string
}
// 插件启动信息
export interface SeverAdmin {
	option: number
	name: string
}
// 获取插件状态
export interface GetStatus {
	type: string
	p: number
	limit: number
}

/**
 * @description 获取控制信息
 * @param {SetControlProps} data 监控状态
 * @returns {Promise<ResponseResult>}
 */
export const SetControlInfo = (data: SetControlProps): Promise<ResponseResult> => useAxios.post('config/SetControl', { data, check: 'object' })

/**
 * @description 获取cpu/内存监控信息
 * @param {object} data 时间
 * @returns {object} Promise
 */
export const GetInfo = (data: Time): Promise<ResponseResult> => useAxios.post('ajax/GetCpuIo', { data })

/**
 * @description 获取磁盘信息
 * @param data  时间
 * @returns {object} Promise
 */
export const GetDiskInfo = (data: Time): Promise<ResponseResult> => useAxios.post('ajax/GetDiskIo', { data })

/**
 * @description 获取网络信息
 * @param data 	时间
 * @returns {object} Promise
 * */
export const GetNetworkInfo = (data: Time): Promise<ResponseResult> => useAxios.post('ajax/GetNetWorkIo', { data })

/**
 * @description 获取平均负载信息
 * @param data 	时间
 * @returns Promise
 */
export const GetLoadInfo = (data: Time): Promise<ResponseResult> => useAxios.post('ajax/get_load_average', { data })

/**
 * @description 获取进程信息
 * @returns	{object} Promise
 */
export const GetNetWork = (): Promise<ResponseResult> => useAxios.post('system/GetNetWork', { check: 'ignore' })

/**
 * @description 获取面板日报信息数据
 * @param { string } data.date: 20230524   面板日报的时间字符串
 * @returns	{object} Promise
 */
export const GetPanelDailyData = (data: PanelDailyTime): Promise<ResponseResult> => useAxios.post('daily/get_daily_data', { data })

/**
 * @description 获取面板日报的时间
 *
 */
export const GetPanelDailyInfoList = (): Promise<ResponseResult> => useAxios.post('daily/get_daily_list')

/**
 * @descriptiON 设置插件的启动与关闭
 * @param { number } data.option  插件的状体 0 代表关闭 1 代表启动 2代表重启服务器
 * @param { string } data.name   插件的名称 如	mysqld_safe   nginx
 * @returns	{object} Promise
 */
export const SetSeverAdmin = (data: SeverAdmin): Promise<ResponseResult> => useAxios.post('monitor/soft/sever_admin', { data, customType: 'model' })

/**
 * @descriptiON 获取插件的状态
 * @param { string } data.type  插件的名称
 * @param { number } data.p   插件的docker 信息的 当前页  目前只有 docker 插件需要
 * @param { number } data.limit   插件的docker 信息的 一页多少条
 * @returns	{object} Promise
 */
export const GetSeverStatus = (data: GetStatus): Promise<ResponseResult> => useAxios.post('monitor/soft/get_status', { data, customType: 'model' })

/**
 * @description 获取网络IO每天总流量统计
 * @param {object} data.day 多少天
 */
export const GetNetWorkIoByDay = (data: AnyObject): Promise<ResponseResult> => {
	return useAxios.post('ajax/GetNetWorkIoByDay', { data })
}

/**
 * @description 获取日报状态
 */
export const checkDailyStatus = (): Promise<ResponseResult> => {
	return useAxios.post('daily/check_daily_status')
}

/**
 * @description 设置日报状态
 * @param {string} data.status 状态 start 开始 stop 停止
 */
export const setDailyStatus = (data: { status: string }): Promise<ResponseResult> => {
	return useAxios.post('daily/set_daily_status', { data, check: 'msg' })
}
