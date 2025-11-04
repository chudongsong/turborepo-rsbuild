import { Message } from '@/hooks/tools'
import { useSocket, Socket } from '@/hooks/tools'
interface imageObj {
	active: boolean
	id: string
	tags: string
	time: string
	name: string
	size: number
	used: number
	riskList: Array<any>
	noWarring?: boolean
}

export const productData = {
	title: '容器安全一键检测-功能介绍',
	ps: '检测敏感信息、后门、漏洞、可疑操作等常见风险。',
	source: 151,
	desc: ['异常历史命令', '敏感信息泄露', '后门排查', '容器逃逸'],
	tabImgs: [
		{
			title: '容器检测',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/docker/dockerContainerScan.png',
		},
	],
}

export const colors = [
	{ color: '#ff0000', percentage: 20 },
	{ color: '#ff0000', percentage: 40 },
	{ color: '#fc6d26', percentage: 60 },
	{ color: '#fc6d26', percentage: 80 },
	{ color: 'var(--el-color-primary)', percentage: 100 },
]
export const scanParam = reactive({
	title: '立即进行镜像检测,确保您的项目安全。',
	isFirst: true, // 是否首次
	isScan: false, // 是否检测中
	isEnd: false, // 是否检测结束
	iconType: 'normal', // 检测图标类型
	detect: 0, // 检测数量
	imageList: [] as imageObj[], // 检测的镜像列表
	msg: '', // 检测信息
	btnObj: {
		// 检测按钮
		text: '一键检测',
		type: 'primary',
		disabled: false,
	},
	score: 100, // 分数
	scanTime: 0, // 检测时间
})
let defaultImageList: Array<any> = [] // 默认镜像列表
let currentIndex = 0 // 当前检测的镜像索引
let timer: any = null // 定时器
export const format = (percent: number) => {
	return percent + '分'
}

/**
 * @description 每项点击事件
 */
export const titleClick = (key: any) => {
	scanParam.imageList[key].active = !scanParam.imageList[key].active
}

let socketInfo: Socket | null = null
/**
 * @description 创建websocket
 */
const createWebSocket = () => {
	socketInfo?.close()
	socketInfo = useSocket({
		route: '/ws_model',
		onMessage: onWSReceive,
	})
}

/**
 * @description 消息接收检测和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	const msg = JSON.parse(e.data)
	if (msg.hasOwnProperty('image_list')) {
		// 新增active参数
		scanParam.imageList = msg.image_list.map((item: any) => {
			item.active = false
			return item
		})
		defaultImageList = JSON.parse(JSON.stringify(msg.image_list))
		return
	}
	if (msg.hasOwnProperty('end')) {
		scanParam.msg = msg.msg
		scanParam.score = scanParam.score - msg.score
		const sItem = scanParam.imageList[currentIndex - 1]
		if (msg.status != 1) {
			scanParam.detect++
			// 根据当前索引获取当前镜像，将检测结果添加到当前镜像中
			if (sItem.riskList == undefined) sItem.riskList = []

			sItem.riskList?.push(msg)
		} else {
		}
		// 检测结束,递归下一个镜像
		if (msg.end && currentIndex > 0) {
			// 提示为无风险项
			if (typeof sItem.riskList == 'undefined') {
				sItem.noWarring = true
			}
			sendImageId()
		}
	}
}

/**
 * @description 开始检测
 */
export const scanDetectEvent = () => {
	currentIndex = 0
	scanParam.scanTime = 0
	scanParam.detect = 0
	scanParam.score = 100

	// 耗时
	timer = setInterval(() => {
		scanParam.scanTime++
	}, 1000)

	// 初次进入
	if (scanParam.isFirst) {
		if (scanParam.imageList.length == 0) {
			return Message.error('请先添加镜像')
		} else {
			// 取消检测后再次检测
			if (!scanParam.isScan) createWebSocket() // 创建websocket
			// 递归检查镜像
			sendImageId()
		}

		scanParam.isScan = true // 检测中
		scanParam.isFirst = false // 首次检测
		switchBtnStatus('scan') // 切换按钮状态
	} else {
		// 检测中
		if (scanParam.isScan) {
			socketInfo?.close() // 取消检测
			resetData() // 重置数据
		} else {
			scanParam.imageList = JSON.parse(JSON.stringify(defaultImageList))
			sendImageId() // 重新检测
			scanParam.isScan = true
			switchBtnStatus('scan')
		}
	}
}

/**
 * @description 发送镜像id
 */
const sendImageId = () => {
	if (currentIndex < scanParam.imageList.length) {
		socketInfo?.send({
			model_index: 'btdocker',
			mod_name: 'security',
			def_name: 'image_safe_scan',
			image_id: scanParam.imageList[currentIndex].id,
			ws_callback: '123',
		})
		currentIndex++
	} else {
		scanParam.isScan = false
		scanParam.isEnd = true
		// 调整展示数据，将无风险项放在最后
		scanParam.imageList = scanParam.imageList.sort((a: any, b: any) => {
			if (a.noWarring) return 1
			if (b.noWarring) return -1
			return 0
		})
		// 清除定时器
		clearInterval(timer)
		switchBtnStatus('end')
	}
}

/**
 * @description 切换按钮状态
 * @param {string} type 类型
 */
const switchBtnStatus = (type: string) => {
	switch (type) {
		case 'scan':
			scanParam.title = '正在检测镜像，请稍候...'
			scanParam.isEnd = false
			scanParam.btnObj.text = '取消检测'
			scanParam.btnObj.type = 'default'
			break
		case 'restart': // 重新检测
			scanParam.title = '立即进行镜像检测,确保您的项目安全。'
			scanParam.btnObj.text = '重新检测'
			scanParam.btnObj.type = 'primary'
			break
		case 'end':
			let msg = ''
			if (scanParam.detect == 0) {
				msg = '未发现安全漏洞'
			} else {
				msg = `一共发现<span class="text-warning">${scanParam.detect}</span>项风险`
			}
			scanParam.title = '检测完成,' + msg
			scanParam.msg = '检测完成，共耗时' + scanParam.scanTime + '秒'
			scanParam.btnObj.text = '重新检测'
			scanParam.btnObj.type = 'primary'
			break
	}
}

/**
 * @description 重置数据
 */
const resetData = () => {
	scanParam.title = '立即进行镜像检测,确保您的项目安全。'
	scanParam.msg = ''
	scanParam.isFirst = true
	scanParam.isScan = false
	scanParam.isEnd = false
	scanParam.iconType = 'normal'
	scanParam.detect = 0
	scanParam.imageList = JSON.parse(JSON.stringify(defaultImageList))
	scanParam.btnObj.text = '一键检测'
	scanParam.btnObj.type = 'primary'
	scanParam.btnObj.disabled = false
	scanParam.score = 100
}

/**
 * @description 获取镜像列表
 */
const getImageList = () => {
	socketInfo?.send({
		model_index: 'btdocker',
		mod_name: 'security',
		def_name: 'get_image_list',
		ws_callback: '123',
	})
}

// 初始化
export const init = () => {
	createWebSocket()
	getImageList()
}

// 销毁
export const unMountHandle = () => {
	resetData()
	clearInterval(timer)
}
