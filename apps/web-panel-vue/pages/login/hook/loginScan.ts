import Tools from './utils'

export default class LoginScan extends Tools {
	el: HTMLDivElement

	node: AnyObject

	pollingQuery: boolean = true

	timer: any = null

	constructor(parameters: string | HTMLDivElement) {
		super() // 调用父类的 constructor(name)

		if (typeof parameters === 'string') {
			this.el = document.querySelector<HTMLDivElement>(parameters) as HTMLDivElement
		} else {
			this.el = parameters
		}
		this.node = {
			cutTips: null,
			loginAccount: null,
			loginScan: null,
		}
		this.render()
	}

	// 渲染视图
	public render() {
		// 不再需要设置innerHTML，直接使用HTML中的模板
		this.getSacnLoginInfo() // 获取扫码登录信息
	}

	/**
	 * @description 渲染二维码
	 * @param {string} text 字符串显示
	 */
	public async qrCodeRender(text: string) {
		// 清空canvas节点的子元素
		const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
		if (canvasElement) {
			canvasElement.innerHTML = ''
		}

		// eslint-disable-next-line new-cap
		new window.QRCode(canvasElement, text, {
			color: {
				dark: '#000000',
				light: '#ffffff',
			},
			width: '140px',
			height: '140px',
			errorCorrectionLevel: 'Q',
		})
	}

	/**
	 * @description 获取扫码登录信息
	 */
	public async getSacnLoginInfo() {
		try {
			const { data }: any = await this.request({
				method: 'post',
				url: '/public?name=app&fun=login_qrcode',
			})
			if (typeof data === 'object') {
				const { status, msg } = data
				// if (msg.indexOf('未绑定用户') > -1) this.message({ type: 'error', message: '请先绑定用户' })
				// 渲染二维码
				if (status) {
					// 反向代理地址处理
					const replaced = msg.replace(/(panel_url=)[^&]*/i, (match: string, prefix: string) => `${prefix + window.location.protocol}//${window.location.host}`)
					this.qrCodeRender(status ? replaced : 'https://www.bt.cn/download/app.html')
					this.pollingQuerySacnInfo() // 轮询获取扫描信息
					document.querySelector('.login-scan-success')?.classList.remove('!hidden')
					document.querySelector('.login-scan-error')?.classList.add('!hidden')
				} else {
					document.querySelector('.login-scan-success')?.classList.add('!hidden')
					document.querySelector('.login-scan-error')?.classList.remove('!hidden')
				}
				// : Promise<void | boolean>
			}
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 轮询获取扫描信息
	 * @returns {void}
	 */
	// eslint-disable-next-line consistent-return
	public async pollingQuerySacnInfo() {
		try {
			if (!this.pollingQuery) return false
			const { data }: any = await this.request({
				method: 'post',
				url: '/public?name=app&fun=is_scan_ok',
			})

			const { status, msg } = data // status: 1 扫描成功 2 扫描失败
			if (typeof data === 'object' && status) {
				this.loginAdmin(msg) // 扫描成功，登录
			} else {
				// 扫描失败，继续轮询
				this.timer = setTimeout(() => {
					const loginType = localStorage.getItem('loginType')
					if (this.timer && loginType === 'account') return clearTimeout(this.timer)
					this.pollingQuerySacnInfo()
				}, 2500)
			}
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 扫描安全登录
	 * @param {string} key 安全码
	 */
	public async loginAdmin(key: string) {
		try {
			const { data }: any = await this.request({
				method: 'post',
				url: '/public?name=app&fun=set_login',
				// eslint-disable-next-line @typescript-eslint/naming-convention
				data: { secret_key: key },
			})
			const { status } = data
			if (typeof data === 'object' && status) {
				this.message({ type: 'success', message: '登录成功,正在跳转中' })
				window.location.href = '/'
			}
		} catch (error) {
			console.log(error)
		}
	}
}
