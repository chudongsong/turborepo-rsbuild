/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

export default class Tools {
	autoLoginParams: AnyObject = {
		password: '',
		username: '',
	}

	// Logo图片路径，不再使用HTML模板字符串
	static getLogoSrc(): string {
		return window.vite_public_panel_theme?.login.logo || '/static/icons/logo-green.svg'
	}

	// 检测当前路由是否包含自动登录字段
	public checkAutoLogin() {
		return new Promise((resolve, reject) => {
			const url = new URL(window.location.href)
			if (url.search !== '') {
				const params = new URLSearchParams(url.search)
				params.forEach((value, key) => {
					this.autoLoginParams[key] = value
				})
				if (this.autoLoginParams.username && this.autoLoginParams.password) {
					resolve(this.autoLoginParams)
				}
				// else {
				// 	reject(new Error('未检测到自动登录字段'))
				// }
			}
			// else {
			// 	reject(new Error('未检测到自动登录字段'))
			// }
		})
	}

	/**
	 * @description 事件绑定
	 * @param {HTMLElement} element  DOM元素
	 * @param {string} eventType 事件类型
	 * @param {(ev: Event) => void} handler 事件处理函数
	 */
	public bindEvent(element: HTMLElement | null, eventType: string, handler: (ev: Event) => void): void {
		if (element && element.addEventListener) {
			element.addEventListener(eventType, handler, false)
		} else if (element && (element as any).attachEvent) {
			;(element as any).attachEvent(`on${eventType}`, handler || null)
		} else {
			;(element as any)[`on${eventType}`] = handler || null
		}
	}

	/**
	 * @description 事件代理
	 * @param {HTMLElement} parentElement
	 * @param {string} eventType 事件类型
	 * @param {string | EventListener} selector 选择器
	 * @param {EventListener} handler 事件处理函数
	 */
	public delegateEvent(parentElement: HTMLElement | null, eventType: string, selector: string | EventListener, handler?: EventListener): void {
		function closestAttr(el: HTMLElement, attr: string) {
			while (el) {
				if (el.hasAttribute(attr)) return el
				el = el.parentElement as HTMLElement
			}
			return null
		}

		if (typeof selector === 'string' && parentElement) {
			parentElement.addEventListener(
				eventType,
				function (event) {
					const targetElement = event.target as HTMLElement
					const selectedElement = targetElement.closest(selector)
					if (this.contains(selectedElement)) {
						if (handler) handler.call(selectedElement, event)
					}
				},
				false
			)
		} else if (typeof selector !== 'string') {
			this.bindEvent(parentElement, eventType, selector as EventListener)
		}
	}

	/**
	 * @description 值类型转换
	 * @param {string|number} value 值
	 * @param {string|number} targetType 目标类型
	 * @returns {string|number}
	 */
	private convertType(value: any, targetType: 'string' | 'number'): string | number {
		const currentType = typeof value
		if (currentType === targetType) return value
		if (targetType === 'string') return String(value)
		if (targetType === 'number') return Number(value)
		throw new Error(`Unsupported target type: ${targetType}`)
	}

	/**
	 * @description 渲染select
	 * @param {string} data.el select的DOM元素
	 * @param {Array} data.options select的数据列表
	 * @param {AnyFunction} data.change select的change事件
	 */
	public renderSelect(data: { el: HTMLDivElement; options: { key: string | number; label: string; disabled?: boolean }[]; active?: string | number; size?: string; change?: (key: string, index: number) => void }): string | undefined {
		const { el, options, active, change, size } = data
		const selectDisplay = document.createElement('div')
		const selectList = document.createElement('div')

		el.classList.add('form-select-module')
		el.innerHTML = ''
		if (size) el.classList.add(size)
		selectList.classList.add('select-list')

		// 判断配置是否存在值
		if (options.length > 0) {
			let activeBak = active
			if (typeof active === 'undefined') activeBak = options[0].key as string
			for (let i = 0; i < options.length; i++) {
				const select = document.createElement('div')
				select.classList.add('select-item')
				if (typeof options[i].disabled === 'boolean' && options[i].disabled) {
					select.classList.add('disabled')
				}
				select.innerText = options[i].label
				select.dataset.key = options[i].key as string
				select.dataset.disabled = `${Number(options[i].disabled)}`
				if (options[i].key === activeBak) {
					select.classList.add('active')
					selectDisplay.innerText = options[i].label
				}
				selectList.appendChild(select)
			}
		}

		selectDisplay.classList.add('select-display')
		el.appendChild(selectDisplay)
		el.appendChild(selectList)

		// 定义全局事件处理器
		const globalClickHandler = (ev: any) => {
			if (ev.target.classList.contains('disabled') && ev.target.classList.contains('select-item')) {
				this.message({ message: '当前选项不可选', type: 'error', time: 2000 })
			} else {
				el.classList.remove('active')
				window.removeEventListener('click', globalClickHandler)
			}
		}

		// 点击打开下拉
		this.delegateEvent(selectDisplay, 'click', (e: Event) => {
			e.stopPropagation() // 阻止事件冒泡
			el.classList.toggle('active')
			if (el.classList.contains('active')) {
				window.addEventListener('click', globalClickHandler)
			} else {
				window.removeEventListener('click', globalClickHandler)
			}
		})

		// 点击下拉选项
		this.delegateEvent(selectList, 'click', '.select-item', (e: Event) => {
			const target = e.target as HTMLElement
			const { key, disabled } = target.dataset
			const label = target.innerText
			if (Number(disabled)) return
			const index = options.findIndex(item => item.key === this.convertType(key, typeof item.key as 'string' | 'number'))
			const select = selectList.querySelectorAll('.select-item')
			select.forEach((item, indexs) => {
				if (index === indexs) {
					item.classList.add('active')
				} else {
					item.classList.remove('active')
				}
			})
			selectDisplay.innerText = label
			el.classList.remove('active')
			if (key) el.dataset.key = key
			if (change && key) change(key, index)
		})
		// 注销全局事件
		window.removeEventListener('click', globalClickHandler)
		return el.dataset.key
	}

	/**
	 * @description 表单验证
	 * @param {HTMLFormElement} data.el 表单DOM元素
	 * @param {AnyObject} data.rules 表单验证规则
	 * @returns {boolean}
	 */
	public validateForm(data: { el: HTMLFormElement; rules: AnyObject }): (fn: AnyFunction) => void {
		const { rules } = data
		const ruleList: AnyObject = {}
		const nodeList: AnyObject = {}
		for (const key in rules) {
			if (Object.prototype.hasOwnProperty.call(rules, key)) {
				nodeList[key] = document.querySelector(`[name="${key}"]`)
				const rule = rules[key]
				if (rule.trigger) {
					rule.trigger.forEach((item: string) => {
						let errorVerify: boolean = false
						// eslint-disable-next-line consistent-return
						ruleList[key] = (keys: string): Error | boolean => {
							const that = nodeList[keys]
							rule.validator(that.value.trim(), function (error: string | undefined) {
								try {
									if (error) {
										throw new Error(error)
									} else {
										errorVerify = false
										that.parentElement?.querySelector('.error-tips')?.remove()
										that.parentElement?.classList.remove('error')
									}
								} catch (error: any) {
									const errorTips = (error as Error).message.replace('Error: ', '') // 判断是否有错误提示
									const errorTipsNode = that.parentElement?.querySelector('.error-tips')
									if (errorTips) {
										errorVerify = true
										that.parentElement?.classList.add('error')
										// 判断错误提示是否存在，不存在则添加
										if (!errorTipsNode) {
											that.insertAdjacentHTML('afterend', `<div class="error-tips">${errorTips}</div>`)
										} else {
											errorTipsNode.innerText = errorTips
										}
									}
								}
							})
							if (errorVerify) return new Error(`${keys}:${nodeList[keys].value}`)
							return true
						}
						this.bindEvent(nodeList[key], item, function (this: HTMLElement) {
							if ('isShow' in rules[key] && !rules[key].isShow()) {
								return true
							}
							const name = this.getAttribute('name')
							if (name && ruleList[name]) ruleList[name](name)
						})
					})
				}
			}
		}
		return (fn: AnyFunction) => {
			let isVerifyError = 0
			for (const key in ruleList) {
				if (Object.prototype.hasOwnProperty.call(ruleList, key)) {
					const element = ruleList[key]
					try {
						if ('isShow' in rules[key] && !rules[key].isShow()) continue
						const error = element(key)
						if (typeof error === 'object') throw error
					} catch (error) {
						isVerifyError++ // 验证错误
						nodeList[key].focus() // 获取焦点，显示错误提示
						return false // 避免循环验证
					}
				}
			}

			if (!isVerifyError) {
				const formData: AnyObject = {}
				for (const key in nodeList) {
					if (Object.prototype.hasOwnProperty.call(nodeList, key)) {
						const element = nodeList[key]
						const { value } = element
						formData[key] = value.trim()
					}
				}
				fn(formData)
			}
		}
	}

	/**
	 * @description 处理请求数据
	 * @param { AnyObject } oldData
	 * @returns
	 */
	private handleTransformRequest(oldData: AnyObject): string {
		let newStr = ''
		// eslint-disable-next-line no-restricted-syntax
		for (const key in oldData) {
			if (Object.prototype.hasOwnProperty.call(oldData, key)) {
				const value = oldData[key]
				newStr += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`
			}
		}
		newStr = newStr.slice(0, -1)
		return newStr
	}

	/**
	 * @description 请求方法-POST
	 * @param {string} config.url 请求地址
	 * @param {AnyObject} config.data 请求参数,默认为{}
	 * @returns
	 */
	public async request<T>({ url, data, method }: AnyObject = { method: 'post', data: {}, url: '' }): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			const xhr = new XMLHttpRequest()
			xhr.open(method, url, true)
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
			xhr.timeout = 250000
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status >= 200 && xhr.status < 300) {
						try {
							resolve({
								...xhr,
								data: JSON.parse(xhr.responseText),
							})
						} catch (error: any) {
							resolve({
								...xhr,
								data: xhr.responseText,
								error: error as Error,
							})
						}
					} else {
						reject(new Error(xhr.statusText))
					}
				}
			}
			xhr.ontimeout = () => reject(new Error('Request timed out'))
			xhr.onerror = () => reject(new Error('Network error'))
			xhr.send(this.handleTransformRequest(data))
		})
	}

	/**
	 * @description rsa加密
	 * @param { string } str 需要加密的字符串
	 * @returns { string } 加密后的字符串
	 */
	private async rsaEncrypt(str: string): Promise<string> {
		const { JSEncrypt } = window as any
		const publicKey = (window as any).vite_public_encryption
		if (publicKey.length < 10) return str
		const encrypt = new JSEncrypt()
		encrypt.setPublicKey(publicKey)
		return encrypt.encrypt(str) as string
	}

	/**
	 * @description 加密数据
	 * @param {AnyObject} data
	 * @return {AnyObject} 加密后的数据
	 */
	public async encryptionData(data: any): Promise<AnyObject> {
		const { md5 } = window as any
		data.username = await this.rsaEncrypt(md5(md5(data.username + (window as any).vite_public_login_token)))
		data.password = await this.rsaEncrypt(md5(`${md5(data.password)}_bt.cn`))
		return data
	}

	/**
	 * @description 移除空值
	 * @param {[key: string]: any} obj 需要移除空值的对象
	 * @returns {[key: string]: any} 移除空值后的对象
	 */
	public removeEmpty(obj: { [key: string]: any }): { [key: string]: any } {
		return Object.entries(obj).reduce((a: { [key: string]: any }, [k, v]) => {
			if (v != null && v !== '') a[k] = v
			return a
		}, {})
	}

	/**
	 * @description 加载loading
	 * @param {string} text loading提示信息
	 * @returns {AnyObject} loading对象
	 */
	public loading(text: string): { close: () => void } {
		// 创建loading元素，不再使用HTML模板字符串
		const loadingDiv = document.createElement('div')
		loadingDiv.id = 'full-loading'
		loadingDiv.className = 'el-loading-mask login-loading'
		loadingDiv.style.cssText = 'background-color: rgba(0, 0, 0, 0.3); z-index: 3006;'

		const spinnerDiv = document.createElement('div')
		spinnerDiv.className = 'el-loading-spinner'

		const iconElement = document.createElement('i')
		iconElement.className = 'svgtofont-loading'
		// const logoImg = document.createElement('img')
		// logoImg.src = Tools.getLogoSrc()
		// logoImg.alt = 'logo'
		// iconElement.appendChild(logoImg)
		iconElement.innerHTML = `
			<svg aria-hidden="true" style="color: var(--el-color-primary);"><use href="#icon-tools-logo"></use></svg>
		`

		const textElement = document.createElement('p')
		textElement.className = 'el-loading-text'
		textElement.textContent = text

		spinnerDiv.appendChild(iconElement)
		spinnerDiv.appendChild(textElement)
		loadingDiv.appendChild(spinnerDiv)

		window.document.body.appendChild(loadingDiv)
		return {
			close() {
				const loading = document.getElementById('full-loading')
				if (loading) loading.remove()
			},
		}
	}

	/**
	 * @description 消息提示
	 * @param {string} data.message 提示信息
	 * @param {string} data.type 提示类型
	 * @param {number} data.time 提示时间
	 */
	public message({ message, type, time = 3000, close = false }: { message: string; type: 'success' | 'error'; time?: number; close?: boolean }) {
		document.getElementById('el-message')?.remove()
		const iconType = type === 'success' ? 'circle-check-filled' : 'circle-close-filled'
		const template = `<div id="el-message" class="el-message el-message--${type}" style="z-index: 4001;">
				${close ? '<div class="el-dialog-close"></div>' : ''}
				<div class="el-message__icon loading-icon svgtofont-el-${iconType}"></div>
				<div class="el-message__content">${message || ''}</div>
			</div>`
		window.document.body.insertAdjacentHTML('beforeend', template)
		if (time) {
			window.setTimeout(() => {
				const message = document.getElementById('el-message')
				if (message) message.remove()
			}, time)
		}
		if (close) {
			this.bindEvent(document.querySelector('.el-dialog-close'), 'click', () => {
				document.getElementById('el-message')?.remove()
			})
		}
	}

	/**
	 * @description 消息提示
	 */
	public tooltip({ el, text }: { el: HTMLElement; text: string }): void {
		document.getElementById('el-tooltip')?.remove()
		const template = `<div  id="el-tooltip" x-placement="top" class="el-tooltip__popper is-dark el-tooltip-white overview-popover w-[40rem] custom-login-popover" style="transform-origin: center bottom; z-index: 3009; display: none;">
				<div class="leading-8 p-[8px]">${text}</div>
				<div class="popper__arrow" style="left: 154px;"></div>
		</div>`
		window.document.body.insertAdjacentHTML('beforeend', template)
		const elTooltip = document.getElementById('el-tooltip') as HTMLDivElement
		let closeTime = 0
		// 在触发按钮鼠标移入
		this.bindEvent(el, 'mouseenter', (ev: Event) => {
			const mouseEvent = ev as MouseEvent
			clearTimeout(closeTime)
			elTooltip.style.display = 'block'
			elTooltip.style.left = `${mouseEvent.clientX - mouseEvent.offsetX - 150}px`
			elTooltip.style.top = `${mouseEvent.clientY - mouseEvent.offsetY - elTooltip.clientHeight - 10}px`
		})

		// 在触发按钮鼠标移出
		this.bindEvent(el, 'mouseleave', () => {
			clearTimeout(closeTime)
			closeTime = window.setTimeout(() => {
				elTooltip.style.display = 'none'
			}, 100)
		})

		// 在提示上鼠标移入
		this.bindEvent(elTooltip, 'mouseenter', () => {
			clearTimeout(closeTime)
			elTooltip.style.display = 'block'
		})

		// 在提示上鼠标移出
		this.bindEvent(elTooltip, 'mouseleave', () => {
			clearTimeout(closeTime)
			closeTime = window.setTimeout(() => {
				elTooltip.style.display = 'none'
			}, 100)
		})

		elTooltip.style.left = `calc(50% - ${elTooltip.offsetWidth / 2}px)`
		elTooltip.style.top = `calc(50% - ${elTooltip.offsetHeight / 2}px)`
	}
}
