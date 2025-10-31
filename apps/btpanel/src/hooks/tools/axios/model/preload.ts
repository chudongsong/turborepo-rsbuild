import axios, { AxiosResponse, CancelTokenSource } from 'axios'

interface RequestItem {
	url: string
	cancel: CancelTokenSource
}

let requestList: RequestItem[] = []

const pageLoadFile: any = {}

/**
 * @description 加载文件
 * @param {string[]} urls 文件地址
 * @returns {Promise<any[]>}
 */
const loadFile = (urls: string[] | string) => {
	if (typeof urls === 'string') urls = pageLoadFile[urls] as string[]
	const existingRecords: string[] = JSON.parse(sessionStorage.getItem('FileRecord') || '[]')
	const fileRecords: string[] = []
	const newUrls = urls.filter(record => existingRecords.indexOf(record) === -1)
	// eslint-disable-next-line no-restricted-syntax
	for (const item of newUrls) {
		const source = axios.CancelToken.source()
		const loadTypeUrl = item.indexOf('css') > -1 ? 'css' : 'js'
		requestList.push({
			url: item,
			cancel: source,
		})
		axios
			.get(`/static/${loadTypeUrl}/${item}`, {
				cancelToken: source.token,
			})
			.then((response: AxiosResponse) => {
				const { config }: any = response
				fileRecords.push(config.url)
			})
	}
	const uniqueRecords: string[] = [...existingRecords, ...fileRecords]
	sessionStorage.setItem('FileRecord', JSON.stringify(uniqueRecords))
}

/**
 * @description 取消请求
 * @param {string} url 请求地址
 * @returns {void}
 */
const cancelRequest = (url: string): void => {
	const request = requestList.find(item => item.url === url)
	if (request) {
		request.cancel.cancel('请求被取消')
		requestList = requestList.filter(item => item.url !== url)
	}
}

/**
 * @description 动态加载
 */
const dynamicLoading = (type: string) => {
	// const typelist: any = {
	// 	login: ['main.js', 'vue-bucket.js', 'public-lib.js', 'echarts.js'],
	// }
	// loadFile(typelist[type])
}
/**
 * @description 云版本变更
 */
const cloudVersionChanges = () => {
	// try {
	// 	const hook = new Date().getTime()
	// 	axios.get(`/static/vite/js/file-version.js?v=${hook}`).then(res => {
	// 		const cloudsVersion = parseInt(res.data || 0, 10)
	// 		const locaVersion = parseInt(window.vite_public_file_version, 10)
	// 		if (cloudsVersion && locaVersion) {
	// 			if (cloudsVersion !== locaVersion) {
	// 				sessionStorage.setItem('cloudsVersion', `${cloudsVersion}`)
	// 				window.location.reload()
	// 			}
	// 		}
	// 	})
	// } catch (error) {
	// 	console.error(error)
	// }
}

export { loadFile, cancelRequest, dynamicLoading, cloudVersionChanges }
