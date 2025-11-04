import Tools from './utils'

export default class LoginAccout extends Tools {
	el!: HTMLDivElement

	formData!: AnyObject // 表单数据

	formVerify!: AnyObject // 表单验证

	node!: AnyObject

	codeCheck!: boolean

	hostCheck!: boolean

	googleCheck!: boolean

	loginErrorTimer!: boolean

	timer!: number

	submitError!: any

	constructor(parameters: string | HTMLDivElement) {
		super() // 调用父类的 constructor(name)
		this.initData(parameters) // 初始化数据
		this.nodeMount() // 节点挂载
		this.render() // 渲染视图
		this.event() // 事件挂载
	}

	// 初始化数据
	private initData(parameters: string | HTMLDivElement) {
		const safeMode = localStorage.getItem('safeMode')
		this.el = typeof parameters === 'string' ? (document.querySelector<HTMLDivElement>(parameters) as HTMLDivElement) : parameters
		this.formData = {}
		this.node = {}
		this.formData.safe_mode = Number(safeMode || 1) // 获取安全模式,并且设置默认值
		// 不再需要设置innerHTML，直接使用HTML中的模板
		this.codeCheck = window.vite_public_login_check
		this.formVerify = { form: null, vcode: null }
	}

	// 节点挂载
	private nodeMount() {
		this.node = {
			loginForm: this.el.querySelector('.login-form') as HTMLDivElement,
			inputUsername: this.el.querySelector<HTMLInputElement>('[name="username"]') as HTMLInputElement,
			inputPassword: this.el.querySelector<HTMLInputElement>('[name="password"]') as HTMLInputElement,
			codeView: this.el.querySelector('.login-code-view') as HTMLDivElement,
			inputCode: this.el.querySelector<HTMLInputElement>('[name="code"]') as HTMLInputElement,
			cutCode: this.el.querySelector('.cut-login-code') as HTMLImageElement,
			formSafeMode: this.el.querySelector('.login-safe-mode') as HTMLDivElement,
			formSubmit: this.el.querySelector('.login-submit') as HTMLButtonElement,
			formGoogleVerifySubmit: this.el.querySelector('.login-google-verify-submit') as HTMLButtonElement,
			closePopupBtn: this.el.querySelector('.close-popup-btn') as HTMLButtonElement,
			formGoogleVerifyView: this.el.querySelector('.google-verify-view') as HTMLDivElement,
			formGoogleVerifyInput: this.el.querySelector('[name="vcode"]') as HTMLInputElement,
			formCdnAccelerate: this.el.querySelector('.login-cdn-accelerate') as HTMLDivElement,
			formTipsQuestion: this.el.querySelector('.svgtofont-el-question-filled') as HTMLDivElement,
		}
	}

	// 渲染视图
	public render() {
		const { formSafeMode } = this.node
		// 渲染select，安全模式
		this.renderSelect({
			el: formSafeMode,
			options: [
				{
					key: 1,
					label: '安全登录模式(推荐)',
				},
				{
					key: 0,
					label: '普通登录模式(不推荐)',
				},
			],
			active: this.formData.safeMode,
			change: (key: string) => {
				this.formData.safe_mode = Number(key)
			},
		})

		this.renderHostsList() // 渲染静态加速列表
		this.codeVerify(this.codeCheck) // 开启验证码
		this.cutCheckCode() // 切换验证码
	}

	// 事件挂载
	private event() {
		const { cutCode, formSubmit, inputPassword, inputUsername, formGoogleVerifyInput, formGoogleVerifySubmit, formTipsQuestion, inputCode } = this.node

		// 默认表单验证
		this.formVerify.form = this.validateForm({
			el: this.node.loginForm,
			rules: {
				username: {
					validator: (value: string, callback: any) => {
						if (value === '') {
							callback(new Error('账号不能为空'))
						} else if (value.length < 3) {
							callback(new Error(`账号长度必须大于等于3位`))
						} else {
							callback()
						}
					},
					trigger: ['input', 'blur'],
				},
				password: {
					validator: (value: string, callback: any) => {
						if (value === '') {
							callback(new Error('密码不能为空'))
						} else {
							callback()
						}
					},
					trigger: ['input', 'blur'],
				},
				code: {
					isShow: () => this.codeCheck,
					validator: (value: string, callback: any) => {
						if (value === '') {
							callback(new Error('验证码不能为空'))
						} else if (value.length !== 4) {
							callback(new Error(`验证码长度错误，必须为4位`))
						} else {
							callback()
						}
					},
					trigger: ['input', 'blur'],
				},
			},
		})

		// 谷歌验证表单验证
		this.formVerify.vcode = this.validateForm({
			el: this.node.formGoogleVerifyView,
			rules: {
				vcode: {
					validator: (value: string, callback: any) => {
						if (value === '') {
							callback(new Error('动态口令不能为空'))
						} else if (value.length < 6) {
							callback(new Error(`动态口令长度必须为6位`))
						} else {
							callback()
						}
					},
					trigger: ['input', 'blur'],
				},
			},
		})

		// 切换验证码，设置src为当前时间戳
		this.bindEvent(cutCode, 'click', this.cutCheckCode.bind(this))

		// 关闭谷歌验证
		this.bindEvent(this.node.closePopupBtn, 'click', () => {
			this.googleVerify(false)
		})

		// 默认表单提交
		this.bindEvent(formSubmit, 'click', this.submitLoginInfo.bind(this, 'form'))

		// 用户名回车提交
		this.bindEvent(inputUsername, 'keyup', (e: any) => {
			if (e.keyCode === 13) {
				formSubmit.focus()
				formSubmit.click()
			}
		})

		// 密码回车提交
		this.bindEvent(inputPassword, 'keyup', (e: any) => {
			if (e.keyCode === 13) {
				formSubmit.focus()
				formSubmit.click()
			}
		})

		// 验证码回车提交
		this.bindEvent(inputCode, 'keyup', (e: any) => {
			if (e.keyCode === 13) {
				formSubmit.focus()
				formSubmit.click()
			}
		})

		// 谷歌验证表单提交
		this.bindEvent(formGoogleVerifySubmit, 'click', this.submitLoginInfo.bind(this, 'vcode'))

		// 谷歌验证表单回车提交
		this.bindEvent(formGoogleVerifyInput, 'keyup', (e: any) => {
			if (e.keyCode === 13) formGoogleVerifySubmit.click()
		})

		this.tooltip({
			el: formTipsQuestion,
			text: `
				<div class="mb-[.8rem]">
					<div class="font-bold">安全登录模式（推荐）</div>
					<div>在安全模式下，将加强登录会话的安全性，防止“重放攻击”风险，强烈建议使用安全模式登录面板。</div>
					<div class="text-danger"> 注意：在安全模式下，极少数网络环境可能出现无限退出的情况。 </div>
				</div>
				<div class="font-bold">普通登录模式（不推荐）</div>
				<div>兼容性好，但存在“重放攻击”的风险，建议在开启面板SSL的情况下再使用普通模式。</div>`,
		})

		this.checkAutoLogin()
		this.node.inputUsername.value = this.autoLoginParams.username
		this.node.inputPassword.value = this.autoLoginParams.password
		if (this.autoLoginParams.username && this.autoLoginParams.password) this.node.formSubmit.click()
	}

	/**
	 * @description 渲染静态加速列表
	 * @returns {Promise<void>} void
	 */
	// eslint-disable-next-line consistent-return
	async renderHostsList(): Promise<boolean | void> {
		const { formCdnAccelerate } = this.node
		const hostsList = (window.vite_public_hosts_list as any[]) || []
		this.hostCheck = hostsList.length > 0
		formCdnAccelerate.classList[this.hostCheck ? 'remove' : 'add']('!hidden') // 显示静态加速
		document.querySelector('.cdn-node')!.classList[this.hostCheck ? 'remove' : 'add']('!hidden') // 显示静态加速
		// 没有加速节点时，noreferrer_tips文字显示为联系客服
		if (this.hostCheck) document.querySelector('.noreferrer_tips')!.innerText = '联系客服'
		if (!this.hostCheck) return false
		const hostLists = []
		const requestList = []
		for (let i = 0; i < hostsList.length; i++) {
			const item = hostsList[i] as any
			hostLists.push({
				key: item.url,
				label: item.name,
			})
			requestList.push(this.getHostDelay(item.url))
		}
		this.monitorHostSpeed(hostLists, requestList) // 监控cdn加速列表
		// this.createHostSelect(hostLists) // 初始化渲染
	}

	/**
	 * @description 监控cdn加速列表
	 */
	async monitorHostSpeed(hostLists: any[], requestList: any[]): Promise<void> {
		const rdata = await Promise.all(requestList)
		hostLists = hostLists
			.map((item, index) => {
				return {
					key: item.key,
					label: `${item.label}${rdata[index] ? `(${rdata[index]}ms)` : ''}`,
					state: rdata[index],
					disabled: !rdata[index],
				}
			})
			.sort((a, b) => {
				if (a.state === false) return 1
				return a.state - b.state
			})
		this.createHostSelect(hostLists) // 初始化渲染
	}

	/**
	 * @description 渲染静态加速列表
	 * @returns {Promise<void>} void
	 */
	createHostSelect(hostLists: any[]) {
		const { formCdnAccelerate } = this.node
		if (hostLists) this.formData.cdn_url = hostLists[0].key
		// 渲染select，静态加速
		this.renderSelect({
			el: formCdnAccelerate,
			size: 'small',
			options: [
				{
					key: '',
					label: '不使用加速',
				},
				...hostLists,
			],
			active: hostLists[0].key,
			change: (key: string) => {
				this.formData.cdn_url = key
			},
		})
	}

	/**
	 * @description 获取cdn加速列表
	 * @param url
	 * @returns
	 */
	async getHostDelay(url: string): Promise<boolean | number> {
		try {
			const start = new Date().getTime()
			const { data } = await this.request({
				method: 'get',
				url: `https://${url}/test.txt`,
				data: { time: start },
			})
			if (typeof data === 'boolean') {
				const end = new Date().getTime()
				return Promise.resolve(end - start)
			}
			return Promise.resolve(false)
		} catch (error) {
			return Promise.resolve(false)
		}
	}

	/**
	 * @description 获取URL参数
	 */
	getUrlInfo() {
		const { formSubmit, inputUsername, inputPassword } = this.node
		const getUrl = window.location.href
		const getUrlInfo = getUrl.split('?')[1]
		const getUrlObj = new URLSearchParams(`?${getUrlInfo}`)
		const user = getUrlObj.get('username')
		const paw = getUrlObj.get('password')
		if (user && paw) {
			inputUsername.value = user
			inputPassword.value = paw
			formSubmit.click()
		}
	}

	/**
	 * @description 切换验证码
	 */
	cutCheckCode() {
		this.node.cutCode.querySelector('img').src = `/code?t=${new Date().getTime()}`
	}

	/**
	 * @description google动态口令验证
	 * @param {boolean} show 是否显示
	 */
	googleVerify(show: boolean) {
		const { formGoogleVerifyView, formGoogleVerifyInput } = this.node
		this.googleCheck = show // 开启谷歌验证
		this.formData.vcode = '' // 清空谷歌验证
		formGoogleVerifyInput.value = '' // 清空谷歌验证
		if (show) {
			formGoogleVerifyView.classList.remove('!hidden') // 显示谷歌验证
			formGoogleVerifyInput.focus() // 聚焦谷歌验证
		} else {
			formGoogleVerifyView.classList.add('!hidden') // 隐藏谷歌验证
		}
	}

	/**
	 * @description 验证码验证
	 * @param {boolean} show 是否显示
	 */
	codeVerify(show: boolean) {
		const { inputCode, codeView } = this.node
		this.codeCheck = show // 开启验证码
		this.formData.code = '' // 清空验证码
		codeView.classList[show ? 'remove' : 'add']('!hidden') // 显示验证码
		inputCode.value = '' // 清空input验证码
	}

	/**
	 * @description 设置提交表单提示
	 * @param val
	 */
	setFormSubmitError(errorTips: string) {
		const { formSubmit } = this.node
		formSubmit.parentElement?.querySelector('.error-tips')?.remove()
		formSubmit.parentElement?.classList.add('error')
		formSubmit.insertAdjacentHTML('afterend', `<div class="error-tips">${errorTips}</div>`)
		return {
			close: () => {
				formSubmit.parentElement?.classList.remove('error')
				formSubmit.parentElement?.querySelector('.error-tips')?.remove()
			},
		}
	}

	/**
	 * @description: 登录
	 * @param {string} type 登录类型
	 * @returns {Promise<void>} void
	 */
	async submitLoginInfo(type: string): Promise<void> {
		const { inputPassword } = this.node
		this.formVerify[type](async (form: any) => {
			const loading = this.loading('正在登录面板，请稍候...')
			const formData = { ...this.formData, ...form }
			this.formData = { ...formData }
			if (typeof type === 'string' && type === 'vcode') {
				formData.vcode = form.vcode // 是否谷歌验证提交
			}
			let param = await this.encryptionData(formData) // 加密数据
			if (this.hostCheck) param.cdn_url = this.formData.cdn_url // 静态加速
			if (this.googleCheck) param.vcode = this.formData.vcode // 谷歌验证
			if (this.codeCheck) param.code = this.formData.code // 验证码

			param = this.removeEmpty(param) // 去除空值
			try {
				sessionStorage.setItem('sendXhr', '1')
				const { data }: any = await this.request({
					method: 'post',
					url: '/login',
					data: param,
				})
				loading.close() // 关闭loading
				if (this.submitError) this.submitError.close() // 关闭错误信息
				this.loginErrorTimer = false // 清空错误状态
				if (typeof data === 'number' && data === 1) {
					this.googleVerify(true) // 开启谷歌验证
				} else if (typeof data === 'object') {
					const { status, msg } = data
					if (!status) {
						this.message({ type: 'error', message: msg }) // 提示错误信息
						if (type === 'vcode') {
							this.googleVerify(true)
						} else {
							inputPassword.value = '' // 清空密码
							this.googleVerify(false) // 关闭谷歌验证
							this.codeVerify(true) // 开启验证码
							this.cutCheckCode() // 切换验证码
							if (msg.indexOf('验证码错误') !== -1) this.cutCheckCode() // 重复切换验证码
							this.countdownInfo(msg) // 获取倒计时,并且提示错误信息
						}
					} else {
						this.message({ type: 'success', message: msg })
						sessionStorage.setItem('loginInfo', JSON.stringify(data))
						setTimeout(() => {
							window.location.href = '/'
						}, 500)
					}
				} else {
					// 提示错误信息
					this.message({
						message: data,
						type: 'error',
						time: 0,
						close: true,
					})
				}
			} catch (error) {
				this.message({ type: 'error', message: error, close: true }) // 提示错误信息
				loading.close() // 关闭loading
			}
		})
	}

	/**
	 * @description: 获取倒计时
	 * @param {string} info 错误信息
	 */
	countdownInfo(info: string) {
		let num = 0
		if (!(info.indexOf('多次登录失败') > -1)) return
		const second: any = info.match(/\d+/g)
		if (second) {
			this.loginErrorTimer = true // 开启错误信息倒计时
			num = second[0] as number
			if (this.timer) clearInterval(this.timer)
			this.timer = window.setInterval(() => {
				num--
				this.submitError = this.setFormSubmitError(info.replace(/\d+/g, num.toString()) as string)
				if (num <= 0 || !this.loginErrorTimer) {
					clearInterval(this.timer)
					this.submitError.close()
					num = 0
				}
			}, 1000)
		} else {
			setTimeout(() => {
				this.submitError.close()
			}, 3000)
		}
	}
}
