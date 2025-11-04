import { defineStore } from 'pinia'
import { FileDataProps } from '@files/types.d'
import { Message } from '@hooks/tools'
import { getWholePath } from '@files/useMethods'
import { getFileLog } from '@api/files'
import { formatTime } from '@utils/index'

const FILES_LOG_ANALYZE_STORE = defineStore('FILES-LOG-ANALYZE-STORE', () => {
	const compData = ref<any>({})

	// 定时器
	let timer: any = null
	// 表单
	const quickForm = reactive<any>({
		limit: 200, // 最新行数
		auto: false, // 自动刷新
		time: 5, // 刷新时间
		search: '', // 搜索关键字
		data: '', // 日志数据
		last: '', // 最后刷新时间
		file: '', // 文件路径
	})
	const loading = ref<boolean>(false)

	// 获取最新选项
	const limitOptions = [
		{ label: '200/行', value: 200 },
		{ label: '500/行', value: 500 },
		{ label: '1000/行', value: 1000 },
		{ label: '2000/行', value: 2000 },
		{ label: '5000/行', value: 5000 },
	]

	/**
	 * @description 选择最新行数
	 * @param {number} value 行数
	 */
	const changeLimit = (value: number) => {
		quickForm.limit = value
	}

	/**
	 * @description 检查时间
	 * @param {string} value 时间
	 */
	const checkTime = (value: string) => {
		const num = Number(value.replace(/[^\d]/g, ''))
		quickForm.time = num < 2 ? 2 : num
		Message.warn('最小刷新时间为2秒')
	}

	/**
	 * @description 设置自动刷新
	 */
	const setAutoRefresh = () => {
		if (quickForm.auto) {
			// 开启自动刷新
			timer = setInterval(() => {
				getLog()
			}, quickForm.time * 1000)
		} else {
			// 关闭自动刷新
			clearInterval(timer)
		}
	}

	/**
	 * @description 获取最新日志
	 */
	const getLog = async () => {
		const params = {
			file: quickForm.file,
			limit: quickForm.limit,
			search: quickForm.search,
		}
		quickForm.last = formatTime(new Date().getTime())
		try {
			loading.value = true
			const res = await getFileLog({ data: JSON.stringify(params) })
			quickForm.data = res.data.data
		} catch (error) {
		} finally {
			loading.value = false
		}
	}

	const init = () => {
		Object.assign(quickForm, {
			limit: 200, // 最新行数
			auto: false, // 自动刷新
			time: 5, // 刷新时间
			search: '', // 搜索关键字
			data: '', // 日志数据
			last: '', // 最后刷新时间
			file: getWholePath(compData.value.fileItem.fileName), // 文件路径
		})
		getLog()
	}

	const $reset = () => {
		loading.value = false
		if (timer) clearInterval(timer)
	}

	return {
		compData,
		loading,
		quickForm,
		limitOptions,
		changeLimit,
		getLog,
		setAutoRefresh,
		checkTime,
		init,
		$reset,
	}
})

export default FILES_LOG_ANALYZE_STORE
