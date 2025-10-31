import { has, is, isEmpty, isNil } from 'ramda'
import { isReactive, isRef } from 'vue'

import { useHandleError } from '@error/index'
import { useMessage } from '@message/index'
import { ResponseResult } from '@/types'
import { getPageTotal, isArray, isFunction, isObject, isString } from '@/utils'

import type { AnyType, DataHandleProps, FnProps, KeyArray, KeyListProps } from './types'

const Message = useMessage()

/**
 * @description 数据处理类
 */
export class DataHandle {
	public data: AnyObject | ResponseResult = {} // 存储原始数据

	public newData: AnyObject = {} // 存储处理后的数据

	public name = 'DataHandle' // 类名

	constructor(data: AnyObject | ResponseResult, config: KeyListProps) {
		this._asyncPromiseData(data, config)
	}

	/**
	 * @description 异步数据处理
	 * @returns
	 */
	private _asyncPromiseData = async (data: AnyObject | ResponseResult, keyList: KeyListProps = {}) => {
		// 如果data中包含data和code字段，则使用data.data作为原始数据，否则直接使用data作为原始数据
		if (has('data', data) && has('code', data)) {
			this.data = data.data as AnyObject
		} else {
			this.data = data
		}
		this.newData = {}
		if (!isEmpty(keyList)) this._dataVerify(keyList) // 如果键列表不为空，则进行数据验证
	}

	/**
	 * @description 查找属性并处理
	 * @param { AnyObject } data 原始数据
	 * @param { string[] } keyList 键列表
	 * @param { AnyType | ((data: any) => boolean) } types 数据类型
	 * @param { FnProps } fn 数据处理函数
	 * @returns { void }
	 */
	private _findAndAddProperty = (data: AnyObject, keyList: string[], types: AnyType | ((data: any) => boolean), fn: FnProps) => {
		try {
			let currentData = data
			for (let i = 0; i < keyList.length; i++) {
				const key = keyList[i]
				if (!has(key, currentData)) {
					throw new Error(`${keyList.join('.')}字段中不存在${key}`)
				}
				if (i === keyList.length - 1) {
					if (!is(types, currentData[key])) {
						throw new Error(`${keyList.join('.')}数据类型错误：${key} 期望类型为：${types}`)
					}
					return this._dataModify(keyList.join('.'), fn, currentData[key])
				}
				currentData = currentData[key]
			}
		} catch (error: any) {
			this._dataErrorHandle(error)
		}
	}

	/**
	 * @description 数据处理
	 * @param { string } key 字段名
	 * @param { FnProps } fn 数据处理函数
	 * @param { any } data 要处理的数据
	 */
	private _dataModify = (key: string, fn: FnProps, data: any) => {
		const fnData = isFunction(fn) ? fn(data) : data // 如果fn是函数，则调用fn(data)，否则直接使用data
		if (isRef(fn)) fn.value = data // 如果fn是Ref，则直接赋值
		if (isReactive(fn)) fn[key] = data // 如果fn是Reactive，则直接赋值
		if (isString(fn)) {
			this.newData[fn] = data // 如果fn是字符串，则直接使用data
		} else if (isObject(fnData)) {
			this.newData = { ...this.newData, ...fnData } // 如果处理后的数据是对象，则合并到newData中
		} else {
			this.newData[key] = fnData // 直接使用处理后的数据，避免重复调用fn(data)
		}
	}

	/**
	 * @description 使用数据类型
	 * @param { string } type 数据类型
	 * @returns
	 */
	public dataType = (type: AnyType | (() => boolean)) => {
		switch (type) {
			case Array:
				return []
			case Boolean:
				return false
			case Object:
				return {}
			case String:
				return ''
			case Number:
				return 0
			default:
				return null
		}
	}

	/**
	 * @description 数据错误处理
	 * @param { any } error 错误信息
	 */
	private _dataErrorHandle = (error: any) => {
		useHandleError(error, this.name)
	}

	/**
	 * @description 数据验证
	 * @param { KeyListProps } keyList 数据验证列表
	 */
	private _dataVerify = (keyList: KeyListProps) => {
		try {
			// 如果传入数据为空，则打印错误信息
			if (isEmpty(this.data)) throw new Error('传入数据为空或undefined')
			// 遍历键列表
			Object.entries(keyList).forEach(([key, item]) => {
				const [dataTypes, dataFn] = !isArray(item) ? [item, null] : item // 如果item是字符串，则直接使用item，否则解构item

				const keySplit = key.split('.') // 将键按照.分割
				if (keySplit.length > 1) return this._findAndAddProperty(this.data, keySplit, dataTypes, dataFn) // 查找属性并处理
				if (has(key, this.data)) {
					// 如果原始数据中包含当前键
					const data = (this.data as AnyObject)[key] // 获取原始数据中的值
					// 如果数据类型是函数，且dataTypes返回值不为空，则调用dataTypes函数
					if (isFunction(dataTypes) && isNil(this.dataType(dataTypes))) {
						const fn = dataTypes as (data: any) => any
						this._dataModify(key, dataFn, fn(data)) // 调用数据处理函数
						return
					}
					// 如果数据类型不匹配，则打印错误信息
					if (!is(dataTypes, data)) {
						this._dataModify(key, dataFn, this.dataType(dataTypes)) // 调用数据处理函数
						throw new Error(`数据类型错误：${key} 期望类型为：${dataTypes}`)
					}
					this._dataModify(key, dataFn, data) // 调用数据处理函数
				} else {
					this._dataModify(key, dataFn, this.dataType(dataTypes)) // 调用数据处理函数
					// this._dataErrorHandle(new Error(`原始数据中不存在${key}字段`))
				}
				// 如果原始数据中不包含当前键，则打印错误信息
			})
		} catch (error) {
			this._dataErrorHandle(error)
		}
	}

	/**
	 * @description 导出数据，并销毁当前实例
	 */
	public exportData = (isNormal: boolean = true) => {
		const data = this.newData // 获取处理后的数据
		this.destroy() // 销毁当前实例
		if (!isNormal) return data.data // 如果原值类型为未非object类型，则解构动态添加的{data:newData}。
		return data // 返回处理后的数据
	}

	/**
	 * @description 首字母大写
	 * @param { string } str 字符串
	 * @returns { string }
	 */
	public capitalizeFirstLetter(str: string): string {
		if (!str) return str
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	/**
	 * @description 销毁当前实例
	 * @returns {void}
	 */
	public destroy = (): void => {
		this.data = {} // 清空原始数据
		this.newData = {} // 清空处理后的数据
	}
}

/**
 * @description 数据处理
 * @param { Props } config 配置参数
 * @returns
 */
export const useDataHandle = async <T,>(config: DataHandleProps): Promise<T> => {
	if (isNil(config.request)) {
		Message.error('请求挂载参数不能为空：request 为空')
		return {} as T
	}
	// 是否数据处理
	const isDataHandle = shallowRef(true)
	let newData = {}
	let { loading } = config
	// 检查是否需要显示提示信息
	if (config.message && isNil(config.data)) {
		config.data = { status: [Boolean, 'status'], msg: [String, 'msg'] }
	}
	if (isNil(config.data)) isDataHandle.value = false
	// 加载全局提示。如果loading是字符串，则显示全局提示
	if (isString(config.loading)) loading = Message.load(loading as string)
	try {
		if (isRef(loading)) loading.value = true // 请求加载中
		const response = await config.request // 请求数据
		let { data: rdata } = response
		if (!(has('code', response) && has('status', response)) && isObject(response)) rdata = response
		const isNormal = isObject(rdata) // 数据结构是否为对象
		// 如果返回值不是对象，则改变为对象类型
		if (!isNormal) {
			rdata = { data: rdata }
			if (isObject(config.data)) {
				Message.error('当前请求返回值为非对象类型，请直接使用 data:[KeyArray] 进行数据验证')
			} else {
				config.data = { data: config.data as KeyArray }
			}
			// 如果返回值为数组，则改变为对象类型
		} else if (!isObject(config.data) && !isDataHandle.value && !isNil(config.data)) {
			Message.error(`数据验证格式错误，必须为 Record<string, KeyArray> 对象`) // 显示错误信息
		} else {
			rdata = response
		}
		newData = !isDataHandle.value ? rdata : new DataHandle(rdata, config.data as KeyListProps).exportData(isNormal) // 数据处理

		if (has('status', rdata) && has('msg', rdata) && !rdata.status && !isDataHandle.value) {
			Message.error(rdata.msg as string) // 显示错误信息
		}
		if (config.message) Message.request(rdata) // 显示提示信息
		if (config.success) config.success(newData) // 成功回调		return Promise.resolve(newData as T)
		return Promise.resolve(newData as T)
	} catch (error) {
		useHandleError(error, JSON.stringify(config)) // 错误处理
		if (config.error) config.error(error) // 错误回调		return Promise.reject(error)
		return Promise.reject(error)
	} finally {
		if (isRef(loading)) {
			loading.value = false
		} else if (isObject(loading)) (loading as AnyObject).close() // 关闭加载提示
	}
	// return newData as T
}

/**
 * @description 数据处理-分页
 * @returns { KeyArray }
 */
export const useDataPage = (refVal: Ref<number> | AnyObject | null | undefined = null): KeyArray => [
	String,
	(val: string) => {
		const pageVal = getPageTotal(val)
		if (isRef(refVal)) {
			refVal.value = pageVal
			return { total: refVal.value }
		}
		if (isReactive(refVal) && !isNil(refVal)) {
			refVal.total = pageVal
			return { total: refVal.total }
		}
		if (isNil(refVal)) {
			return { total: pageVal }
		}
		return Message.error('分页数据处理错误，请检查数据类型')
	},
]
