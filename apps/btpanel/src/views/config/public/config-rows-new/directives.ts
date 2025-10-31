import { DirectiveBinding } from 'vue'
import { getConfigStore } from '@config/useStore'

const selectLighting = {
	async mounted(el: HTMLElement, binding: DirectiveBinding) {
		const {
			refs: { settingSearch },
		} = getConfigStore()

		watch(
			() => settingSearch.value,
			val => {
				// 获取搜索值
				const expr = new RegExp(val, 'gi')
				// 判断标题
				if (!el.classList.contains('desc')) {
					const text = el.innerText
					const matches = text.match(expr)
					if (matches) {
						const highlightedHTML = text.replace(expr, match => `<i class="setingLight not-italic bg-[yellow]">${match}</i>`)
						el.innerHTML = highlightedHTML
					}
				} else {
					// 判断为描述
					// 获取该容器节点下的 span 标签
					const spanElements = el.querySelectorAll('span')
					spanElements.forEach((span: HTMLElement) => {
						const text = span.innerText
						const matches = text.match(expr)
						if (matches) {
							const highlightedHTML = text.replace(expr, match => `<i class="setingLight not-italic bg-[yellow]">${match}</i>`)
							span.innerHTML = highlightedHTML
						}
					})
				}
			}
		)
	},
}

export default selectLighting
