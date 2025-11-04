/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
/* eslint-disable no-undef */

interface PluginHtml {
	title: string
	name: string
	rhtml: string
}

interface PluginData {
	pluginTitle: string
	pluginName: string
	pluginBuilt: string
}

class PluginView {
	loadList: string[] = [] // 加载列表

	pluginTimer: number | null = null // 插件定时器

	// 文件列表
	fileList: AnyObject = {
		laydate: ['static/laydate/laydate.js'], // 日期选择器
		echarts: ['static/js/echarts.min.js'], // 图表
		clipboard: ['static/js/clipboard.min.js'], // 复制
		qrcode: ['static/js/jquery.qrcode.min.js'], // 二维码
		xterm: ['static/css/xterm.css', '/static/js/xterm.js'], // 终端
		jsencrypt: ['static/js/jsencrypt.min.js'], // 加密
		ace: ['static/editor/ace.js'], // 编辑器
	}

	// 触发列表，加载文件时，需要加载的触发文件
	triggerList: AnyObject = {
		laydate: ['laydate.render'],
		echarts: ['echarts.init'],
		clipboard: ['ClipboardJS', 'bt.pub.copy_pass'],
		qrcode: ['qrcode({'],
		xterm: ['Term.run()', 'web_shell()'],
		jsencrypt: ['JSEncrypt', 'rsa.encrypt_public'],
		ace: ['ace.edit', 'bt.aceEditor', 'bt.fullScreenLog', 'bt.on_edit_file', 'bt.pub.on_edit_file', 'OnlineEditFile'],
	}

	constructor(data: PluginData | null = null) {
		if (data) this.renderPlugin(data)
	}

	/**
	 * @description 渲染页面
	 */
	public async renderPlugin({ pluginTitle, pluginName, pluginBuilt }: PluginData) {
		try {
			// 判断是否为内置插件
			if (Number(pluginBuilt)) {
				window.soft.set_soft_config(pluginName) // 设置插件配置
			} else {
				const rdata = (await this.getPluginHtml(pluginName)) as string // 获取插件html
				const dependList = await this.getPluginDependence(rdata) // 获取依赖文件
				await this.loadFileList(dependList) // 加载文件列表
				if (pluginName === 'phpguard') {
					window.parent.postMessage(`closePlugin&php守护已启动,无需设置!&success`, '*') // 关闭插件
					return
				}
				this.openPluginView({ title: pluginTitle, name: pluginName, rhtml: rdata }) // 打开插件
			}
		} catch (error) {
			window.parent.postMessage('closePlugin', '*')
		}
	}

	/**
	 * @description 打开插件
	 * @param {string} data.title 插件标题
	 * @param {string} data.name 插件名称
	 * @param {string} data.rhtml 插件html
	 */
	public async openPluginView({ title, name, rhtml }: PluginHtml) {
		const content = rhtml.replace(/[\"\']javascript\/text[\"\']/, '"text/javascript"')
		window.bt.open({
			type: 1,
			shift: 5,
			offset: 'auto',
			closeBtn: 2,
			area: title.indexOf('Node.js版本管理器') > -1 ? ['700px', '710px'] : '700px',
			title: `<img style="width: 24px;margin-right: 5px;margin-left: -10px;margin-top: -3px;" src="/static/img/soft_ico/ico-${name}.png" />${title}`,
			content,
			success: (layers: HTMLElement) => {
				// 弹窗高度大于窗口高度时，设置弹窗高度为窗口高度
				const winHeight = $(window).height() || 0
				const layerHeight = $(layers).height() || 0
				if (layerHeight >= winHeight) {
					setTimeout(function () {
						$(layers).css({ top: '0px' })
					}, 100)
				} else {
					$(layers).find('.layui-layer-content').removeAttr('style').css({ backgroundColor: '#fff' })
					$(layers).css({ top: `${(winHeight - layerHeight) / 2}px` })
					$(layers).find('.layui-layer-close').addClass('layui-layer-close2').removeClass('layui-layer-close1')
				}
				// 弹窗宽度大于窗口宽度时，设置弹窗宽度为窗口宽度
				const winWidth = $(window).width() || 0
				const layerWidth = $(layers).width() || 0
				if (layerWidth >= winWidth) {
					setTimeout(function () {
						$(layers).css({ left: '0px', width: '100%' })
					}, 100)
				}
				window.parent.postMessage('pluginLoad', '*') // 窗口加载完成后，发送消息
			},
			end: () => {
				this.checkPopup()
			},
		})
	}

	public closePluginView() {
		clearInterval(this.pluginTimer as number)
		window.parent.postMessage('closePlugin', '*') // 关闭窗口时，发送消息
	}

	/**
	 * @description 检查弹窗，如果弹窗存在则关闭弹窗
	 */
	public checkPopup() {
		this.pluginTimer = setInterval(() => {
			const newLayer = $(document).find('.layui-layer')
			if (!newLayer.length) this.closePluginView()
		}, 100)
	}

	/**
	 * @description 消息提示
	 * @param {string} data.message 提示信息
	 * @param {string} data.type 提示类型
	 * @param {number} data.time 提示时间
	 */
	public message({ message, type, time = 2000 }: { message: string; type: 'success' | 'error'; time?: number }) {
		document.getElementById('el-message')?.remove()
		const template = `<div id="el-message" class="el-message el-message--${type}" style="z-index: 9999999;position:fixed">
				<div class="el-message__icon el-icon-${type}"></div>
				<div class="el-message__content">${message || ''}</div>
			</div>`
		window.document.body.insertAdjacentHTML('beforeend', template)
		const elMessage = document.getElementById('el-message') as HTMLDivElement
		elMessage.style.top = `calc(50% - ${elMessage.offsetHeight / 2}px)`
		if (time) {
			setTimeout(() => {
				const message = document.getElementById('el-message')
				if (message) message.remove()
			}, time)
		}
	}

	public objectToQueryString(params: Record<string, any>): string {
		return Object.keys(params)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
			.join('&')
	}

	/**
	 * @description 判断是否为开发环境
	 * @returns {boolean} 是否为开发环境
	 */
	public isDev() {
		return process.env.NODE_ENV === 'development'
	}

	/**
	 * @description 获取token，API请求
	 * @returns { object } { requestTime, requestToken }
	 */
	public getToken = () => {
		const request_time = Date.now()
		const agentKey: string = window.vite_public_proxy_key // 秘钥
		const request_token = window.md5(String(request_time).concat(window.md5(agentKey)))
		return { request_time, request_token }
	}

	/**
	 * @description 加载脚本
	 * @param {string} src 脚本地址
	 */
	public ajax(url: string, data: AnyObject, method: string = 'POST'): Promise<string | object> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest()
			const isDev = this.isDev()
			if (isDev) url = `/api/${url}`.replace('//', '/') // 开发环境添加api前缀
			xhr.open(method, url, true)
			// 设置请求头
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded') // 设置请求头
			if (!isDev) {
				xhr.setRequestHeader('x-http-token', window.vite_public_request_token) // 设置请求头，线上环境需要
			} else {
				const token = this.getToken()
				data = { ...data, ...token } // 添加token
			}

			// 设置响应类型
			xhr.onreadystatechange = () => {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status === 200) {
						try {
							const response = xhr.responseText
							resolve(response)
						} catch (error) {
							reject(new Error(`Error parsing response: ${error}`))
						}
					} else {
						reject(new Error(`Request failed with status: ${xhr.status}`))
					}
				}
			}

			xhr.onerror = () => {
				reject(new Error('Network error'))
			}

			// 发送请求
			if (method === 'POST' && data) {
				xhr.send(this.objectToQueryString(data))
			} else {
				xhr.send()
			}
		})
	}

	/**
	 * @description 获取plugin列表
	 */
	public async getPluginHtml(name: string) {
		try {
			return await this.ajax('/plugin?action=getConfigHtml', { name })
		} catch (error) {
			return ''
		}
	}

	/**
	 * @description 获取依赖文件
	 * @param {string} name 插件名称
	 * @returns	{string[]} 依赖文件列表
	 */
	public getPluginDependence(str: string) {
		const dependList: string[] = []
		const { triggerList, fileList, loadList } = this
		// eslint-disable-next-line no-restricted-syntax
		for (const [key, items] of Object.entries(triggerList)) {
			if (items.some((trigger: string) => str.includes(trigger))) {
				if (!loadList.includes(key)) dependList.push(...fileList[key])
				loadList.push(key)
			}
		}
		return dependList
	}

	/**
	 * @description 加载cript文件
	 * @param {string} url 文件地址
	 * @returns
	 */
	public loadScriptFile(url: string) {
		return new Promise<boolean>((resolve, reject) => {
			const script = document.createElement('script')
			script.type = 'text/javascript'
			script.src = url
			document.head.appendChild(script)
			script.onload = () => resolve(true)
			script.onerror = () => reject()
		})
	}

	/**
	 * @description 加载css文件
	 * @param {string} url 文件地址
	 * @returns
	 */
	public loadCssFile(url: string) {
		return new Promise<boolean>((resolve, reject) => {
			const link = document.createElement('link')
			link.rel = 'stylesheet'
			link.type = 'text/css'
			link.href = url
			document.head.appendChild(link)
			link.onload = () => resolve(true)
			link.onerror = () => reject()
		})
	}

	/**
	 * @description 加载文件列表
	 */
	public async loadFileList(dependList: string[]) {
		try {
			const promiseList: Promise<boolean>[] = []
			dependList.forEach(url => {
				if (url.endsWith('.css')) {
					promiseList.push(this.loadCssFile(url))
				} else {
					promiseList.push(this.loadScriptFile(url))
				}
			})
			await Promise.all(promiseList)
			return Promise.resolve(true)
		} catch (error) {
			return Promise.reject(error)
		}
	}
}

// 实例化插件
window.plugin_view = new PluginView()

// 监听消息
window.addEventListener('message', event => {
	const message = event.data
	if (message.includes('pluginName')) {
		window.plugin_view.renderPlugin(JSON.parse(message)) // 渲染插件
	}
})
