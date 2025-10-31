/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import Tools from './utils'
import LoginAccount from './loginAccount' // 账号登录
import LoginScan from './loginScan' // 扫码登录
import ThemeManager from './themeManager' // 主题管理器

export default class App extends Tools {
	loginType: string

	el: HTMLDivElement

	node: AnyObject

	autoLoginParams: AnyObject

	themeManager: ThemeManager

	constructor(parameters: { el: string }) {
		super()
		const loginMain = document.querySelector('#login-main')
		this.loginType = localStorage.getItem('loginType') || 'account'
		this.el = document.querySelector<HTMLDivElement>(parameters.el) as HTMLDivElement
		this.node = {
			cutTips: null,
			loginAccount: null,
			loginScan: null,
		}
		// 自动登录参数
		this.autoLoginParams = {
			password: '',
			username: '',
		}
		// 初始化主题管理器
		this.themeManager = new ThemeManager()
		// 模板挂载
		this.render()

		if (loginMain) {
			;(loginMain as HTMLDivElement).style.display = 'block'
		}
	}

	// 初始化页面样式和主题配置
	private initPageStyle() {
		const themeConfig = window.vite_public_panel_theme
		const isShowBg = themeConfig?.login?.is_show_bg
		const isShowLoginLogo = themeConfig?.login?.is_show_logo
		const { bg_image } = themeConfig?.login || {}

		

		// 设置背景图片
		const loginImages = this.el.querySelector('#login-images') as HTMLDivElement
		if (loginImages && isShowBg && bg_image) {
			loginImages.style.backgroundImage = `url('${bg_image}')`
			// 使用CSS变量控制透明度，这些变量由ThemeManager设置
			loginImages.style.opacity = 'var(--login-bg-opacity, 1)'
			loginImages.style.display = 'block'
		}

		// 设置Logo显示状态
		const loginSvg = this.el.querySelector('#login-svg') as HTMLElement
		if (loginSvg) {
			if (!isShowLoginLogo) {
				loginSvg.classList.add('!hidden')
			} else {
				loginSvg.classList.remove('!hidden')
				// 设置Logo图片
				const logoImg = loginSvg.querySelector('#login-logo') as HTMLImageElement
				if (logoImg) {
					logoImg.src = themeConfig?.login?.logo || '/static/icons/logo-green.svg'
				}
			}
		}

		// 设置切换按钮位置
		const cutLoginType = this.el.querySelector('#cut-login-type') as HTMLElement
		if (cutLoginType) {
			cutLoginType.style.top = !isShowLoginLogo ? '20px' : '110px'
			cutLoginType.className = `cut-login-type ${this.loginType}`
		}
	}

	// DOM节点挂载
	private domMount() {
		this.node.cutTips = this.el.querySelector('.tips-text') as HTMLDivElement // 切换提示
		this.node.cutLoginType = this.el.querySelector('#cut-login-type') as HTMLDivElement // 切换按钮
		this.node.loginAccount = this.el.querySelector('#login-account') as HTMLDivElement // 账号登录
		this.node.loginScan = this.el.querySelector('#login-scan') as HTMLDivElement // 扫码登录
	}

	private eventMount() {
		const { cutLoginType, cutTips } = this.node

		// 切换视图变化
		this.bindEvent(cutLoginType, 'click', () => {
			cutLoginType.classList.add(this.loginType === 'account' ? 'scan' : 'account')
			cutLoginType.classList.remove(this.loginType === 'account' ? 'account' : 'scan')
			if (this.loginType === 'account') {
				this.setLoginScan()
				cutTips.innerText = '切换账号登录'
				localStorage.setItem('loginType', 'scan')
				// 更新SVG图标为账号登录图标
				this.updateLoginTypeIcon('scan')
			} else {
				this.setLoginAccount()
				cutTips.innerText = '切换扫码登录'
				localStorage.setItem('loginType', 'account')
				// 更新SVG图标为扫码登录图标
				this.updateLoginTypeIcon('account')
			}
		})
	}

	// 设置登录扫描
	private setLoginScan() {
		const { loginScan, loginAccount } = this.node
		this.loginType = 'scan'
		loginScan.classList.remove('!hidden')
		loginAccount.classList.add('!hidden')
		new LoginScan(this.node.loginScan) // 渲染扫码登录
	}

	// 设置账号登录
	private setLoginAccount() {
		const { loginScan, loginAccount } = this.node
		this.loginType = 'account'
		loginScan.classList.add('!hidden')
		loginAccount.classList.remove('!hidden')
		new LoginAccount(this.node.loginAccount) // 渲染账号登录
	}

	// 更新登录类型图标
	private updateLoginTypeIcon(loginType: string) {
		const { cutLoginType } = this.node
		if (cutLoginType) {
			const svg = cutLoginType.querySelector('.login-type-icon')
			if (svg) {
				// 根据登录类型显示对应的图标
				const iconContent =
					loginType === 'account'
						? '<rect x="3" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><path d="m5 5 0 0"/><path d="m5 18 0 0"/><path d="m18 5 0 0"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>'
						: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
				svg.innerHTML = iconContent
			}
		}
	}

	// 渲染视图
	private render() {
		// 初始化页面样式和主题配置
		this.initPageStyle()

		// 获取登录类型
		this.loginType = localStorage.getItem('loginType') || 'account'

		// 设置登录标题
		const titleText = this.el.querySelector('#login-title-text') as HTMLElement
		if (titleText) {
			titleText.textContent = window.vite_public_title
			titleText.title = window.vite_public_title
		}

		// DOM节点挂载和事件绑定
		this.domMount()
		this.eventMount()

		// 根据登录类型显示对应界面
		if (this.loginType === 'account') {
			this.setLoginAccount()
		} else {
			this.setLoginScan()
		}
	}
}
