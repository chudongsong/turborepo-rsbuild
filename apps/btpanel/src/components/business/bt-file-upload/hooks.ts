import axios from 'axios'
import { getToken, getByteUnit, getRandomChart } from '@utils/index'
import { useMessage, useDialog } from '@/hooks/tools'
import { uploadFilesExists } from '@api/files'
import FILES_STORE from '@files/store'
import FileCoverDialog from './file-cover-confirm.vue'

import { UploadFileItem, UploadStatus, FileUploadEventProps } from './type.d'

const { refreshFilesList } = FILES_STORE()

// 开发模式
const isDev: boolean = import.meta.env.MODE === 'dev' // 是否为开发模式
const Message = useMessage()

/**
 * @description 上传文件
 */
export class UploadFile {
	target: string = '' // 上传文件的URl

	uploadPath: string = '' // 上传文件的路径

	uploadElement = null // 更新视图

	loading = {
		close: () => {},
	} // 加载中

	isUpload = true // 是否可上传

	isGetFiles = false // 是否可获取文件，如果当前拦截判断已经触发，则无法继续获取文件

	readFileTimeout = 0 // 读取文件超时

	limit = {
		size: 30 * 1024 * 1024 * 1024,
		number: 1000,
	}

	uploadStatus: UploadStatus = 'paused' // 上传状态

	uploadLimitSize = 1024 * 1024 * 2 // 上传限制字节

	uploadList: UploadFileItem[] = [] // 上传列表

	uploadTime = {
		endTime: 0,
		startTime: 0,
	}

	uploadInfo = {
		estimatedTime: 0, // 上传预计耗时，时间戳
		uploadedSize: 0, // 已上传文件大小
		speedInterval: null, // 平局速度定时器
		speedAverage: 0, // 平均速度
		uploadTime: 0, // 上传总耗时
		fileSize: 0, // 文件上传字节
		startTime: 0, // 文件上传开始时间
		endTime: 0, // 文件上传结束时间
		success: 0, // 上传成功数量
		error: 0, // 上传失败数量
	}

	fileList: any[] = [] // 文件列表

	fileTotalSize = 0 // 全部文件大小

	fileTotalNumber = 0 // 全部文件数量

	uploadInterval = 0

	uploadCycleSize: any[] = [] // 上传周期的字段

	speedLastTime = 0

	timerSpeed = 0

	uploadError = 0

	isOpenCoverLayer = 0 // 是否打开覆盖层

	uploadedFiles = [] // 上传过的文件

	constructor(options: any) {
		this.target = options.target
		this.uploadPath = options.uploadPath
		this.watchFileList = options.renewalData // 监控文件列表
		this.watchFileUploadSpeed = options.renewalSpeed // 监控文件上传速度
		this.watchFileUploadStatus = options.renewalStatus // 监控文件上传状态
		// this.eventBind();
		this.initData() // 初始化数据
	}

	/**
	 * @description 初始化数据
	 */
	initData = (isUploadStatus: boolean = false) => {
		this.uploadStatus = 'paused' // 上传状态 0:等待上传  1:上传成功  2:上传中
		this.uploadList = [] // 上传列表
		this.isUpload = true
		this.uploadTime = {
			endTime: 0,
			startTime: 0,
		}
		this.isGetFiles = false
		this.uploadInfo = {
			// 提示信息，用于通知当前上传状态
			estimatedTime: 0, // 上传预计耗时，时间戳
			uploadedSize: 0, // 已上传文件大小
			speedInterval: null, // 平局速度定时器
			speedAverage: 0, // 平均速度
			uploadTime: 0, // 上传总耗时
			fileSize: 0, // 文件上传字节
			startTime: 0, // 文件上传开始时间
			endTime: 0, // 文件上传结束时间
			success: 0, // 上传成功数量
			error: 0, // 上传失败数量
		}

		this.fileList = [] // 文件列表
		this.fileTotalSize = 0 // 全部文件大小
		this.fileTotalNumber = 0 // 全部文件数量

		this.uploadInterval = 0
		this.uploadCycleSize = [] // 上传周期的字段

		this.speedLastTime = 0
		this.timerSpeed = 0
		// this.uploadError = 0

		if (isUploadStatus) {
			// 初始化状态
			this.watchFileUploadStatus({
				status: 'paused',
				timeElapsed: 0,
				averageSpeed: 0,
				uploadSize: '0B',
				successNumber: 0,
				errorNumber: 0,
			})
		}
	}

	/**
	 * @description 监控文件列表
	 */
	watchFileList = (list: any) => {
		return list
	}

	/**
	 * @description 监控文件上传速度
	 */
	watchFileUploadSpeed = (speedInfo: AnyObject) => {
		return speedInfo
	}

	/**
	 * @description 监控文件上传状态
	 */
	watchFileUploadStatus = (info: any) => {
		return info
	}

	/**
	 * @description 文件上传限制
	 * @param {Object} e 文件对象
	 */
	fileUploadLimit = (e: any, path: string) => {
		const path_l = path
		if (!this.isGetFiles) return false
		const extName = e.name.split('.')
		path = path || e.webkitRelativePath
		const paths = path.split('/')
		path = `/${paths.slice(0, paths.length - 1).join('/')}`.replace('//', '/')
		let flag = false
		this.fileList.forEach((_item, _index) => {
			if (_item.path + _item.name == path_l && _item.size == getByteUnit(e.size)) {
				Message.error('该文件已存在')
				return (flag = true)
			}
		})

		if (flag) {
			return true
		}
		this.fileList = this.fileList.filter((ie, i) => {
			return ie.path + ie.name !== path_l
		})
		this.fileList.push({
			vid: getRandomChart(8),
			file: e,
			path,
			name: e.name,
			size: getByteUnit(e.size),
			type: extName.length > 1 ? extName[extName.length - 1] : 'txt',
			status: 'paused',
			progress: 0,
		})
		this.watchFileList(this.fileList)
		this.fileTotalSize += e.size
		this.fileTotalNumber++
		if (this.fileTotalNumber >= this.limit.number) {
			Message.error(`当前文件数量已超过文件上传上限${this.limit.number}个， 请压缩文件夹后重试！`)
			return false
		}
		if (this.fileTotalSize >= this.limit.size) {
			Message.error(`当前文件大小已超过文件上传${getByteUnit(this.limit.size)}限制， 请使用SFTP/FTP等工具上传文件！`)
			return false
		}
		return true
	}

	/**
	 * @description 上传状态信息
	 * @param {string} status 状态文本
	 * @returns {string}
	 */
	uploadStatusInfo(status: string) {
		const statusTextMap: any = {
			success: '上传成功',
			error: '上传失败',
			uploading: '上传中',
			paused: '等待上传',
			waiting: '等待上传',
		}
		return statusTextMap[status]
	}

	/**
	 * @description 上传文件
	 * @param fileStart 文件开始上传位置
	 * @param index 文件索引
	 */
	uploadFile = (fileStart: number = 0, index: number = 0) => {
		if (this.fileList.length === 0) return false
		// 开始上传
		if (fileStart == 0 && this.uploadList.length == 0) {
			this.isOpenCoverLayer = 0
			this.uploadStatus = 'uploading'
			this.uploadedFiles = [] // 上传过的文件
			this.uploadCycleSize = [] // 上传速度匹配
			this.uploadTime.startTime = this.getTimeReal() // 设置上传开始时间
		}
		// 结束上传
		if (this.fileList.length === index) {
			clearTimeout(this.uploadInterval)
			this.uploadStatus = 'success'
			this.uploadTime.endTime = this.getTimeReal() // 设置上传结束时间
			this.renderUploadSpeed()
			this.initData()
			refreshFilesList()
			return false
		}

		// 递归执行
		this.uploadFileItem(fileStart, index)
	}

	/**
	 * @description 上传文件项
	 * @param fileStart 文件开始上传文件大小
	 * @param index 文件索引
	 */
	uploadFileItem = async (fileStart: number, index: number) => {
		// 创建文件对象和切割文件
		let item = this.fileList[index]
		let fileEnd = 0
		if (item == undefined) return false

		// 设置切割文件时间段
		const { uploadedSize } = this.uploadInfo
		this.uploadInterval = setInterval(() => {
			if (this.uploadCycleSize.length === 4) this.uploadCycleSize.splice(0, 1)
			this.uploadCycleSize.push(Math.abs(this.uploadInfo.uploadedSize - uploadedSize))
		}, 1000)

		// 渲染上传时间和上传进度
		this.uploadInfo.endTime = this.getTimeReal()
		const s_time = (this.uploadInfo.endTime - this.uploadInfo.startTime) / 1000
		this.timerSpeed = Number((this.uploadInfo.fileSize / s_time).toFixed(2))
		this.uploadInfo.startTime = this.getTimeReal()

		// 获取上传速度
		const speed = this.getUpdateSpeed()
		// 获取上传速度
		let limitSize = this.uploadLimitSize
		// 判断速度是否操作阈值，超过阀值后，采用倍速的方案，最大只能支持4，8MB
		const maxDouble = Math.floor(speed / this.uploadLimitSize)
		if (maxDouble && index > 1) limitSize = (maxDouble > 4 ? 4 : maxDouble) * limitSize

		// 实时反馈
		if (fileStart == 0) {
			this.uploadInfo.startTime = this.getTimeReal()
			item = {
				...item,
				...{
					progress: 0,
					upload: 2,
					upload_size: '0B',
				},
			}
		}

		// this.renderUploadSpeed(index, item)

		fileEnd = Math.min(item.file.size, fileStart + limitSize)

		this.uploadInfo.fileSize = fileEnd - fileStart
		const f_path = this.uploadPath + item.path
		const form = new FormData()
		const { request_time, request_token } = getToken()
		form.append('f_path', f_path)
		form.append('f_name', item.name)
		form.append('f_size', item.file.size)
		form.append('f_start', fileStart.toString())
		form.append('blob', item.file.slice(fileStart, fileEnd))
		if (isDev) {
			form.append('request_time', `${request_time}`)
			form.append('request_token', request_token)
		}
		try {
			const { data } = await axios({
				method: 'post',
				url: (isDev ? '/api' : '') + this.target,
				headers: { 'x-http-token': window.vite_public_request_token },
				data: form,
			})
			await this.watchUploadStatus(data, item, index, { fileStart, fileEnd })
		} catch (e) {
			console.log(e)
		}
		// 上传状态判断
	}

	/**
	 * @description 文件选择处理程序
	 * @param {object} ev 事件
	 */
	fileSelectHandler = (ev: any, callback: AnyFunction) => {
		this.readFileTimeout = 0 // 设置读取文件定时器
		this.isGetFiles = true // 设置获取文件状态
		this.loading = Message.load('正在获取上传文件，请稍候...')
		if (ev.target?.files) {
			// 判断是否为文件
			const items = ev.target?.files
			;[].forEach.call(items, item => {
				this.traverseFileTree(item, callback)
			})
		} else if (ev.dataTransfer.items) {
			// 判断是否为文件夹
			const { items } = ev.dataTransfer
			;[].forEach.call(items, (evItems: any) => {
				const getAsEntry = evItems.webkitGetAsEntry || evItems.getAsEntry
				const item = getAsEntry.call(evItems)
				if (item) {
					if (!this.isUpload) return false
					this.traverseFileTree(item, callback)
				}
			})
		}
	}

	/**
	 * @description 遍历文件树
	 * @param {Object} item 文件对象
	 */
	traverseFileTree = (item: any, callback: AnyFunction) => {
		const path = item.fullPath || ''
		if (item.isFile) {
			// 判断是否为文件，如果文件直接加入到列表中
			item.file((evItem: any) => {
				this.isGetFiles = this.fileUploadLimit(evItem, path)
				clearTimeout(this.readFileTimeout)
				this.readFileTimeout = setTimeout(() => {
					this.loading.close()
					if (!this.isGetFiles) {
						this.clearUploadFileList()
						this.watchFileList(this.fileList)
						return false
					}
					if (callback) callback(this.fileList)
				}, 100)
			})
		} else if (item.isDirectory) {
			// 判断是否为文件夹，如果是文件夹则继续递归遍历
			const dirReader = item.createReader()
			const fnReadEntries = (entries: any) => {
				;[].forEach.call(entries, evItem => {
					if (!this.isUpload) return false
					this.traverseFileTree(evItem, callback)
				})
				if (entries.length > 0) {
					dirReader.readEntries(fnReadEntries)
				}
			}
			dirReader.readEntries(fnReadEntries)
			setTimeout(() => {
				if (this.fileList.length === 0 && this.isGetFiles) return Message.error('拖拽上传文件夹内容为空')
			}, 500)
		}
	}

	/**
	 * @description 监控上传状态
	 * @param {Object} data 上传数据
	 */
	watchUploadStatus = (rdata: any, item: any, index: number, file: { fileStart: number; fileEnd: number }) => {
		// 判断是否为数字
		if (typeof rdata === 'number') {
			this.renderUploadSpeed(index, {
				...item,
				...{
					progress: ((rdata / item.file.size) * 100).toFixed(2),
					upload: 2,
					upload_size: getByteUnit(rdata),
				},
			})

			// 判断是否为文件结束，已上传文件大小
			if (file.fileEnd != rdata) {
				this.uploadInfo.uploadedSize += rdata
			} else {
				this.uploadInfo.uploadedSize += parseInt((file.fileEnd - file.fileStart).toString())
			}

			// 继续上传文件
			setTimeout(() => {
				this.uploadFile(rdata, index)
			}, 50)
		} else {
			// 请求状态，判断文件是否上传成功
			if (rdata.status) {
				this.uploadInfo.success++
				this.uploadInfo.endTime = this.getTimeReal()
				this.uploadInfo.uploadedSize += parseInt((file.fileEnd - file.fileStart).toString())
				this.renderUploadSpeed(index, {
					...item,
					...{
						upload: 1,
						upload_size: item.size,
					},
				})
			} else {
				this.renderUploadSpeed(index, {
					...item,
					...{
						progress: 100,
						upload: -1,
						errorMsg: rdata.msg,
					},
				})
				this.uploadInfo.error++
			}
			this.uploadFile(0, ++index)
		}
		// 实时更新文件上传状态
	}

	/**
	 * @description 取10秒内上传平均值
	 */
	getUpdateSpeed = () => {
		let sum = 0
		for (let i = 0; i < this.uploadCycleSize.length; i++) {
			sum += this.uploadCycleSize[i]
		}
		const content = sum / this.uploadCycleSize.length
		return isNaN(content) ? 0 : content
	}

	/**
	 * @description 渲染上传进度
	 */
	renderUploadSpeed = (index?: number, config?: any) => {
		// 上传完成
		if (typeof index === 'undefined') {
			const time = this.getTimeReal()
			this.watchFileUploadStatus({
				status: 'success',
				timeElapsed: this.diffTime(this.uploadTime.startTime, time),
				averageSpeed: this.toSize(this.uploadInfo.uploadedSize / ((time - this.uploadTime.startTime) / 1000)),
				uploadSize: getByteUnit(this.uploadInfo.uploadedSize),
				successNumber: this.uploadInfo.success,
				errorNumber: this.uploadInfo.error,
			})
			return
		}
		try {
			const item = this.fileList[index]
			// 上传成功|上传失败
			if (config.upload === 1 || config.upload === -1) {
				item.is_upload = true
				this.uploadList.push(item)

				const dropUpLoadFile = document.querySelector('.file-upload-list')
				if (dropUpLoadFile) {
					// Add null check
					if (this.uploadList.length === 1) dropUpLoadFile.scrollTop = 0
					if (this.uploadList.length > 1) dropUpLoadFile.scrollTop += 45.5
				}
			}
			// 进度、状态
			item.progress = config.progress
			item.status = this.isUploadStatus(config.upload)
			item.message = config.errorMsg || ''
			this.watchFileList(this.fileList)
			// 监控文件上传状态
			this.watchFileUploadSpeed({
				totalProgress: ((this.uploadInfo.uploadedSize / this.fileTotalSize) * 100).toFixed(2),
				currentSpeed: getByteUnit(isNaN(this.timerSpeed) ? 0 : this.timerSpeed),
				timeRemaining: this.time(parseInt((((this.fileTotalSize - this.uploadInfo.uploadedSize) / this.timerSpeed) * 1000).toString())),
				uploadList: this.uploadList.length,
			})
		} catch (e) {
			console.log(e)
		}
	}

	/**
	 * @description 获取文件名
	 * @param {any} item
	 */
	getFileName = (item: { path: string; name: string }) => {
		return `${item.path}/${item.name}`.replace(/\/\//, '/')
	}

	/**
	 * @description 文件上传的确认，钩子函数
	 */
	useFileUploadExistsConfirm = async () => {
		const list = this.fileList.map((item: any) => this.uploadPath + this.getFileName(item))
		const { data }: any = await uploadFilesExists({
			files: list.join('\n'),
		})
		if (!data) return
		const existsList: { name: any; size: any; locaSize: any }[] = []
		this.fileList.forEach((item: any, index: number) => {
			const existsItem = data[index]
			if (existsItem.exists) {
				existsList.push({
					name: this.getFileName(item),
					size: existsItem.size,
					locaSize: item.file.size,
				})
			}
		})
		if (existsList.length) {
			const callback = (close: any, check: boolean) => {
				if (!check) {
					for (let i = this.fileList.length - 1; i >= 0; i--) {
						const items = this.fileList[i]
						if (existsList.findIndex(item => item.name.indexOf(items.name) > -1) >= 0) {
							this.fileList.splice(i, 1)
						}
					}
				}
				nextTick(() => {
					close()
					if (this.fileList.length) {
						this.uploadFile() // 继续上传
					} else {
						this.clearUploadFileList()
					}
				})
			}
			await useDialog({
				title: '文件冲突确认',
				area: 40,
				component: FileCoverDialog,
				compData: { data: existsList, confirm: callback, cancel: callback },
				showFooter: true,
				cancelText: '跳过',
				confirmText: '覆盖',
			})
		} else {
			this.fileList.length && this.uploadFile() // 继续上传
		}
	}

	/**
	 * @description 文件上传状态
	 * @param {number} status 状态
	 */
	isUploadStatus(status: number) {
		const statusMap: any = {
			'-1': 'error',
			0: 'paused',
			1: 'success',
			2: 'uploading',
			3: 'waiting',
		}
		return statusMap[status]
	}

	/**
	 * @description 获取实时时间
	 */
	getTimeReal() {
		return new Date().getTime()
	}

	/**
	 * @description 清空上传文件列表
	 */
	clearUploadFileList() {
		this.initData(true)
		this.watchFileList(this.fileList)
	}

	/**
	 * @description 取消上传
	 */
	cancelFile = (file: any) => {
		const list = this.fileList.filter((ie, i) => {
			return ie.vid !== file.vid
		})
		this.fileList = list
		this.watchFileList(this.fileList)
		// 如果没有剩余文件，重置上传状态
		if (this.fileList.length === 0) {
			this.clearUploadFileList()
		}
	}

	/**
	 * @description 文件大小转换
	 * @param {number} a 文件大小
	 * @returns
	 */
	toSize = (a: any) => {
		const d = [' B', ' KB', ' MB', ' GB', ' TB', ' PB']
		const e = 1024
		for (let b = 0; b < d.length; b += 1) {
			if (a < e) {
				const num = a.toFixed(2) + d[b]
				return !isNaN(a.toFixed(2)) && typeof num !== 'undefined' ? num : '0B'
			}
			a /= e
		}
	}

	/**
	 * @description 文件大小转换
	 * @param date
	 * @returns
	 */
	time = (date: any) => {
		const hours = Math.floor(date / (60 * 60 * 1000))
		const minutes = Math.floor(date / (60 * 1000))
		const seconds = (date % (60 * 1000)) / 1000
		let result = `${seconds}秒`
		if (minutes > 0) {
			result = `${minutes}分钟${seconds.toFixed(0)}秒`
		}
		if (hours > 0) {
			result = `${hours}小时${Math.floor((date - hours * (60 * 60 * 1000)) / (60 * 1000))}分钟`
		}
		return result
	}

	/**
	 * @description 时间差
	 * @param start_date
	 * @param end_date
	 * @returns
	 */
	diffTime(start_date: any, end_date: any) {
		if (typeof start_date !== 'number') start_date = start_date.getTime()
		if (typeof end_date !== 'number') end_date = end_date.getTime()
		const diff = end_date - start_date
		const minutes = Math.floor(diff / (60 * 1000))
		const leave3 = diff % (60 * 1000)
		const seconds = leave3 / 1000
		let result = `${seconds.toFixed(minutes > 0 ? 0 : 2)}秒`
		if (minutes > 0) {
			result = `${minutes}分${seconds.toFixed(0)}秒`
		}
		return result
	}
}

/**
 * @description 禁止默认事件
 * @param {Object} e 事件对象
 */
const disablePreventDefault = (e: Event) => {
	e.preventDefault()
}

/**
 * @description 文件拖拽事件挂载，钩子函数
 */
export const useFileUploadEventMount = (events: FileUploadEventProps): FileUploadEventProps => {
	const uploaderDrop = document.querySelector('#upload-mask')
	window.addEventListener('dragenter', (ev: Event) => {
		disablePreventDefault(ev)
		events.dragenter(ev)
	}) // 拖拽进入
	uploaderDrop?.addEventListener('dragenter', (ev: Event) => {
		disablePreventDefault(ev)
		events.dragenter(ev)
	}) // 拖拽进入
	// 拖拽移出
	uploaderDrop?.addEventListener('dragleave', (ev: Event) => {
		disablePreventDefault(ev)
		events.dragleave(ev)
	})

	// 拖拽经过
	uploaderDrop?.addEventListener('dragover', (ev: Event) => {
		disablePreventDefault(ev)
		events.dragover(ev)
	})

	// 拖拽放置
	uploaderDrop?.addEventListener('drop', (ev: Event) => {
		disablePreventDefault(ev)
		events.drop(ev)
	})
	return events
}

/**
 * @description 卸载文件拖拽移出事件，钩子函数
 */
export const useFileUploadEventRemove = (events: FileUploadEventProps) => {
	const uploaderDrop = document.querySelector('#upload-mask')
	window.removeEventListener('dragenter', events.dragenter)
	uploaderDrop?.removeEventListener('dragenter', events.dragenter)
	uploaderDrop?.removeEventListener('dragover', events.dragover)
	uploaderDrop?.removeEventListener('dragleave', events.dragleave)
	uploaderDrop?.removeEventListener('drop', events.drop)
}
