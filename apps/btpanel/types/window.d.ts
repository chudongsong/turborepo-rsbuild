import { GlobalTheme } from '@/types/theme'
import type { CSSVariableManager } from '@/utils/theme-config'

declare global {
	interface Window {
		requestAnimFrame: any
		ace: any
		webkitRequestAnimationFrame: any
		mozRequestAnimationFrame: any
		vite_public_title: string // 模板变量：面板标题
		vite_public_version: string // 模板变量：面板版本
		vite_public_encryption: string // 模板变量：加密方式
		vite_public_login_token: string // 模板变量：登录token
		vite_public_login_check: boolean // 模板变量：登录验证码
		vite_public_hosts_list: Array<any> // 模板变量：登录验证码
		vite_public_request_token: string // 模板变量：请求token
		vite_public_ip: string // 模板变量：面板IP地址
		vite_public_menu: string
		vite_public_brand: string
		vite_public_product: string
		vite_public_year: string
		vite_public_cdn_url: string
		vite_public_proxy_key: string
		vite_public_proxy_ip: string
		vite_public_proxy_port: string
		vite_public_panel_type: string
		vite_public_soft_flush: string
		vite_public_error: string
		vite_public_file_version: string
		vite_public_socket: AnyObject
		vite_public_preloaded_list: Array<string> // 预加载列表
		vite_public_panel_theme: GlobalTheme
		$extension: () => Promise<AnyObject>
		product_recommend: any // 兼容代码，支付老版本
		plugin_view: any
		bt: AnyObject
		lan: AnyObject
		soft: AnyObject
		jQuery: any // jQuery
		md5: any // md5加密
		QRCode: any // 二维码
		JSEncrypt: any // 加密
		check_shrink: (isShow: boolean) => void
		themeManager: CSSVariableManager
		// linkCssMount: (config: { content: string; url?: string; id?: string }) => void
	}
}

export {}
