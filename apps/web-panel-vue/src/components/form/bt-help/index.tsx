/*
 * @Descripttion: 帮助提示信息
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */
import { isFunction, isObject, isPromise, isString } from '@/utils'
import { has } from 'ramda'

export default defineComponent({
	name: 'BtHelp',
	props: {
		options: {
			type: Array as PropType<Array<{ content: string | Component; isHtml?: boolean; class?: string }>>,
			default: () => [],
		},
		listStyle: {
			type: String as PropType<'none' | 'disc' | 'circle' | 'square'>,
			default: 'disc',
		},
	},
	setup(props, { attrs, slots }) {
		/**
		 * @description 判断是否为组件
		 * @param {any} content 判断类型
		 */
		const checkComponent = (content: AnyObject | string | Promise<AnyObject>) => {
			// 判断是否为直接引用的组件,
			if (isObject(content) && has('__name', content)) return content
			// 判断是否为函数并且返回值为Promise, 则使用异步组件
			if (isFunction(content)) {
				const comp = (content as () => Promise<AnyObject>)()
				if (isPromise(comp)) {
					return defineAsyncComponent(() => comp as Promise<AnyObject>)
				}
				return comp
			}
			// tsx和字符串直接返回
			return content
		}

		let options = props.options instanceof Function ? props.options() : props.options
		watch(
			() => props.options,
			val => {
				if (!(val instanceof Function)) {
					options = val
				}
			}
		)
		return () => (
			<ul class={`text-secondary mt-[2px] leading-[2rem] text-small ml-[20px] list-${props.listStyle}`} {...attrs}>
				{options.map(
					(
						item: {
							content: string | AnyObject | Promise<AnyObject>
							isHtml: boolean
						},
						index: PropertyKey | undefined
					) => (item.isHtml ? <li key={index} v-html={item.content}></li> : <li key={index}>{checkComponent(item.content)}</li>)
				)}
				{slots?.default?.()}
			</ul>
		)
	},
})
