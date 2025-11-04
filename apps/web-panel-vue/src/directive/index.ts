import { nextTick, type App } from 'vue'
import { isBoolean, inputFocus, getBody, hasOwnProperty, getRandom, isUndefined } from '@/utils'

/**
 * @description 显示Loading
 */
const showLoading = (customNode: HTMLElement) => {
	customNode?.classList.add('custom-loading--show')
}

/**
 * @description 隐藏Loading
 * @param customNode
 */
const hideLoading = (customNode: HTMLElement) => {
	customNode?.classList.remove('custom-loading--show')
	// customNode?.classList.add('ta');
}

export const mountDirective = (app: App) => {
	/**
	 * @description: 自动聚焦指令
	 */
	app.directive('focus', {
		mounted(el: HTMLElement, binding: any) {
			if (typeof binding.value === 'undefined' || binding.value) {
				nextTick(() => {
					inputFocus(el)
				})
			}
		},
	})

	/**
	 * @description: 自动滚动到底部
	 */
	app.directive('scroll-bottom', {
		beforeUpdate(el: HTMLElement, binding: any) {
			if (typeof binding.value === 'boolean' && !binding.value) return
			nextTick(() => {
				const { scrollHeight, clientHeight } = el
				el.scrollTop = scrollHeight + clientHeight
			})
		},
	})

	/**
	 * @description 监听内容变化，清理左右空格
	 */
	app.directive('trim', {
		mounted(el: HTMLInputElement) {
			el.addEventListener('change', function (e: any) {
				e.target.value = e.target.value.trim()
			})
		},
	})

	// 元素插入时执行
	const createElement = (el: HTMLElement, binding: any, randomId: string) => {
		const loading = document.createElement('div')
		loading.className = 'custom-loading'
		loading.dataset.id = randomId
		loading.innerHTML = `<div class="custom-loading__mask"></div>\
			<div class="custom-loading__content">\
				<div class="custom-loading__icon">
					<svg aria-hidden="true"><use href="#icon-tools-logo"></use></svg>
				</div>\
				<div class="custom-loading__title hidden"></div>\
			</div>`
		el.setAttribute('style', 'position: relative!important;')
		el.appendChild(loading)
		updateElement(loading, binding, true)
	}

	const checkVal = (binding: any) => {
		if (!isUndefined(binding.oldValue) && binding.oldValue === binding.value) return false
		return true
	}

	// 更新元素
	const updateElement = (loadingEl: HTMLElement, binding: any, init = false) => {
		if (!loadingEl) return false
		if (!checkVal(binding) && !init) return false
		if (!binding.arg) {
			if (isBoolean(binding.value) && binding.value) {
				showLoading(loadingEl)
			} else {
				hideLoading(loadingEl)
			}
		} else {
			switch (binding.arg) {
				case 'title':
					// eslint-disable-next-line no-case-declarations
					const title = loadingEl.querySelector('.custom-loading__title')
					title?.classList.remove('hidden')
					if (title) title.innerHTML = binding.value
					break
				case 'type':
					loadingEl.querySelector('.custom-loading__content')?.classList.add(binding.value)
					break
				case 'size':
					if (loadingEl) loadingEl.classList.add(binding.value)
					break
			}
		}
	}

	/**
	 * @description 自定义Loading指令
	 */
	app.directive('bt-loading', {
		// 绑定时执行
		created(el: HTMLElement, binding: any) {
			if (!el) return false
			if (el.dataset.id) {
				const loading = el.querySelector(`.custom-loading[data-id="${el.dataset.id}"]`)
				updateElement(loading as HTMLElement, binding, true)
				return false
			}
			const randomId = getRandom(8)
			el.dataset.id = randomId // 设置唯一标识
			createElement(el, binding, randomId) // 创建loading节点
		},
		// 更新时执行
		updated(el: HTMLElement, binding: any) {
			if (!el) return false
			if (!el.dataset.id) return false
			if (!checkVal(binding)) return false
			const id = el.dataset.id
			const loading = el.querySelector(`.custom-loading[data-id="${id}"]`)
			updateElement(loading as HTMLElement, binding)
		},
	})

	/**
	 * @description: 滚动列表阴影效果
	 */
	app.directive('scroll-shadow', {
		updated(el: HTMLElement) {
			nextTick(() => {
				const { scrollHeight, clientHeight } = el
				if (scrollHeight > clientHeight) el.setAttribute('data-scroll-bottom', 'true')
			})
			el.setAttribute('data-scroll-top', 'false')
			el.setAttribute('data-scroll-bottom', 'false')
			if (el.getAttribute('data-scroll')) return
			el.setAttribute('data-scroll', 'true')
			el.addEventListener('scroll', () => {
				if (el.scrollTop > 0) {
					el.dataset.scrollTop = 'true'
					el.dataset.scrollBottom = 'true'
				} else if (el.scrollTop === 0) {
					el.dataset.scrollTop = 'false'
					el.dataset.scrollBottom = 'true'
				}
				if (el.scrollTop + el.clientHeight === el.scrollHeight) {
					el.dataset.scrollBottom = 'false'
				}
			})
		},
	})

	/**
	 * @description: 表格滚动加载
	 */
	app.directive('table-scroll-load', {
		mounted(el: HTMLElement, binding: any) {
			const selectWrap = el.querySelector('.el-table__body-wrapper')!
			selectWrap.addEventListener('scroll', () => {
				const sign = 0
				const scrollDistance = selectWrap.scrollHeight - selectWrap.scrollTop - selectWrap.clientHeight
				if (scrollDistance <= sign) {
					binding.value()
				}
			})
		},
	})

	// 根据el获取input
	const getInput = (el: HTMLElement): HTMLInputElement | null => (el instanceof HTMLInputElement ? el : el.querySelector('input'))

	/**
	 * @description: input自动全选
	 */
	app.directive('input-select', {
		mounted(el: HTMLElement, binding: any) {
			if (typeof binding.value === 'boolean' && !binding.value) return
			// 由nexttick转为异步解决文件新建文件夹后input失焦问题
			setTimeout(() => {
				getInput(el)?.select()
			}, 500)
		},
	})

	/**
	 * @description: 滚动加载更多
	 */
	app.directive('load-more', {
		mounted(el: any, binding: any, vnode: any) {
			const { expand } = binding.modifiers
			const debounce = function (func: any, delay: any) {
				let timer: any = null
				return function () {
					if (timer) clearTimeout(timer)
					timer = null
					// eslint-disable-next-line prefer-rest-params
					const args = arguments
					timer = setTimeout(() => {
						func.apply(this, args)
					}, delay)
				}
			}
			// 使用更丰富的功能，支持父组件的指令作用在指定的子组件上
			if (expand) {
				/**
				 * target 目标DOM节点的类名
				 * distance 减少触发加载的距离阈值，单位为px
				 * func 触发的方法
				 * delay 防抖时延，单位为ms
				 * load-more-disabled 是否禁用无限加载
				 */
				const { target, distance = 0, func, delay = 200 } = binding.value
				if (typeof target !== 'string') return
				const targetEl = el.querySelector(target)
				if (!targetEl) {
					console.log('找不到容器')
					return
				}

				binding.handler = debounce(function () {
					const { scrollTop, scrollHeight, clientHeight } = targetEl
					let disabled = el.getAttribute('load-more-disabled')
					disabled = vnode[disabled] || disabled
					if (scrollHeight <= scrollTop + clientHeight + distance) {
						if (disabled) return
						// eslint-disable-next-line no-unused-expressions
						func && func()
						// 将滚动条返回至上一次的位置
						targetEl.scrollTop = scrollTop
					}
				}, delay)
				targetEl.addEventListener('scroll', binding.handler)
			} else {
				binding.handler = debounce(function () {
					const { scrollTop, scrollHeight, clientHeight } = el
					if (scrollHeight === scrollTop + clientHeight) {
						// eslint-disable-next-line no-unused-expressions
						binding.value && binding.value()
					}
				}, 200)
				el.addEventListener('scroll', binding.handler)
			}
		},
		updated(el: any, binding: any) {
			const { arg } = binding
			// 使用更丰富的功能，支持父组件的指令作用在指定的子组件上
			if (arg === 'expand') {
				/**
				 * target 目标DOM节点的类名
				 * offset 触发加载的距离阈值，单位为px
				 * method 触发的方法
				 * delay 防抖时延，单位为ms
				 */
				const { target } = binding.value
				if (typeof target !== 'string') return
				let targetEl = el.querySelector(target)
				// eslint-disable-next-line no-unused-expressions
				targetEl && targetEl.removeEventListener('scroll', binding.handler)
				targetEl = null
			} else {
				el.removeEventListener('scroll', binding.handler)
				el = null
			}
		},
	})

	/**
	 * @description: 拖拽指令
	 */
	app.directive('popup-drag', {
		mounted(el: HTMLElement) {
			const dialogHeaderEl: HTMLElement = el.querySelector('.el-dialog__header')!
			const dragDom: HTMLElement = el.querySelector('.el-dialog')!
			let dialogDom = dragDom
			dialogHeaderEl.style.cssText += ';cursor:move;'

			function applyStyle() {
				if (dragDom.className.includes('el-custom-class')) {
					dialogDom = el
					el.style.cssText = `position: fixed; ${dragDom.style.cssText} ; bottom: null;`
					el.className = 'el-dialog__container'
					setTimeout(() => {
						centerElement()
					}, 0)
				}
			}

			function centerElement() {
				nextTick(() => {
					const screenWidth = document.documentElement.clientWidth
					const screenHeight = document.documentElement.clientHeight
					const dragDomWidth = el.offsetWidth
					const dragDomHeight = el.offsetHeight
					const left = (screenWidth - dragDomWidth) / 2
					const top = (screenHeight - dragDomHeight) / 2

					el.style.left = `${left}px`
					el.style.top = `${top}px`
				})
			}

			applyStyle()

			// 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
			const style = (function () {
				const body = getBody()

				if (hasOwnProperty(body, 'currentStyle')) {
					return (dom: HTMLElement, attr: string) => (body as AnyObject).currentStyle[attr] // (IE兼容代码)
				}
				return (dom: HTMLElement, attr: any) => getComputedStyle(dom, null)[attr]
			})()

			dialogHeaderEl.onmousedown = e => {
				// 全屏时禁止拖拽
				if (dragDom.className.includes('is-fullscreen')) {
					return
				}
				// 鼠标按下，计算当前元素距离可视区的距离
				const disX: number = e.clientX - dialogHeaderEl.offsetLeft
				const disY: number = e.clientY - dialogHeaderEl.offsetTop

				const screenWidth: number = document.body.clientWidth // body当前宽度
				const screenHeight: number = document.documentElement.clientHeight // 可见区域高度(应为body高度，可某些环境下无法获取)

				const dragDomWidth: number = dialogDom.offsetWidth // 对话框宽度
				const dragDomheight: number = dialogDom.offsetHeight // 对话框高度

				const minDragDomLeft: number = dialogDom.offsetLeft
				const maxDragDomLeft: number = screenWidth - dialogDom.offsetLeft - dragDomWidth - 20

				const minDragDomTop: number = dialogDom.offsetTop - 15
				const maxDragDomTop: number = screenHeight - dialogDom.offsetTop - dragDomheight

				// 获取到的值带px 正则匹配替换
				let styL: any = style(dialogDom, 'left')
				// 为兼容ie
				if (styL === 'auto') styL = '0px'
				let styT: any = style(dialogDom, 'top')

				// 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
				if (styL.includes('%')) {
					styL = +document.body.clientWidth * (+styL.replace(/%/g, '') / 100)
					styT = +document.body.clientHeight * (+styT.replace(/%/g, '') / 100)
				} else {
					styL = +styL.replace(/px/g, '')
					styT = +styT.replace(/px/g, '')
				}
				document.onmousemove = function (e) {
					// 通过事件委托，计算移动的距离
					let left = e.clientX - disX
					let top = e.clientY - disY
					// 边界处理
					if (-left > minDragDomLeft) {
						left = -minDragDomLeft
					} else if (left > maxDragDomLeft) {
						left = maxDragDomLeft
					}

					if (-top > minDragDomTop) {
						top = -minDragDomTop
					} else if (top > maxDragDomTop) {
						top = maxDragDomTop
					}
					// 移动当前元素
					dialogDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
				}

				document.onmouseup = function () {
					document.onmousemove = null
					document.onmouseup = null
				}
				return false
			}
		},
	})
	/**
	 * @description: 点击外部事件
	 */
	app.directive('blur-check', {
		mounted(el: HTMLElement, binding: any) {
			const input = getInput(el)
			if (!input) return

			let isClick = false
			// 记录点击事件
			const handleMouseDown = (event: FocusEvent) => {
				isClick = true
				input.setAttribute('data-clicked-outside', 'true')
			}

			// 事件处理函数
			const handleBlur = (event: FocusEvent) => {
				if (isClick && input.getAttribute('data-clicked-outside') === 'true') {
					binding.value(event)
					input.removeAttribute('data-clicked-outside') // 清除属性以防止重复触发
				}
				isClick = false
			}

			// 将事件处理函数绑定到binding对象上
			binding.handleMouseDown = handleMouseDown
			binding.handleBlur = handleBlur

			// 确保只存在一个监听器
			document.removeEventListener('mousedown', binding.handleMouseDown)
			document.addEventListener('mousedown', binding.handleMouseDown)
			input.removeEventListener('blur', binding.handleBlur, true)
			input.addEventListener('blur', binding.handleBlur, true)
		},
		unmounted(el, binding) {
			const input = getInput(el)
			if (!input) return
			// 移除事件监听器
			document.removeEventListener('mousedown', (binding as any).handleMouseDown)
			input.removeEventListener('blur', (binding as any).handleBlur, true)
		},
	})
}
