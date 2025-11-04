/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * @Descripttion: 标签页
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong 1738613989@qq.com
 * @LastEditTime: 2024-11-04 18:30:59
 */
import { ElTabPane, ElTabs, TabsInstance, type TabsPaneContext } from 'element-plus'
import 'element-plus/theme-chalk/src/tabs.scss'
import { checkComponent, getRandom, isFunction, isObject } from '@/utils'
import { Component } from 'vue'
import { has } from 'ramda'
import type { TabsOptionsProps } from './types'

export default defineComponent({
	name: 'BtTabs',
	props: {
		modelValue: {
			type: String,
			default: '',
		},
		type: {
			type: String as PropType<'card' | 'bg-card' | 'left-bg-card' | ''>,
			default: 'card',
		},
		options: {
			type: Array as PropType<TabsOptionsProps[]>,
			default: () => [],
		},
	},
	emits: ['update:modelValue', 'change'],
	setup(props, { attrs, slots, emit, expose }) {
		const modelVal = ref(props.modelValue)
		const tabs = reactive({})
		const tabsRef = ref()
		const tabsPanl: Record<string, any> = shallowRef({})

		const param = computed(() => {
			switch (props.type) {
				case 'card':
					return { className: 'tabs-card', type: 'card', tabPosition: 'top' }
				case 'bg-card':
					return { className: 'tabs-bg-card', type: 'border-card', tabPosition: 'top' }
				case 'left-bg-card':
					return { className: 'tabs-left-bg-card', type: 'border-card', tabPosition: 'left' }
				case '':
					return { className: 'tabs-demo', type: '', tabPosition: 'top' }
			}
		})

		watch(
			() => props.modelValue,
			val => {
				modelVal.value = val
			}
		)

		watch(modelVal, val => {
			emit('update:modelValue', val)
		})

		watch(
			tabsPanl,
			val => {
				if (has('init', tabsPanl[modelVal.value as string])) {
					;(tabsPanl as Record<string, any>)[modelVal.value as string]?.init()
				}
			},
			{ once: true }
		)

		// tab点击事件
		const tabClick = (pane: TabsPaneContext, _: Event) => {
			emit('change', pane.props.name, tabsPanl[pane.props.name as string])
			if (pane.props.name && has(pane.props.name as string, tabsPanl)) {
				if (has('init', tabsPanl[pane.props.name as string])) {
					;(tabsPanl as Record<string, any>)[pane.props.name as string]?.init()
				}
			}
		}

		expose(tabs)

		onMounted(() => {
			Object.assign(tabs, { ...{ getRef: () => tabsPanl }, ...(tabsRef.value as unknown as TabsInstance) })
		})

		return () => (
			<ElTabs {...attrs} ref={tabsRef} v-model={modelVal.value} class={param.value.className} onTabClick={tabClick} type={param.value.type} tab-position={param.value.tabPosition}>
				{props.options.length
					? props.options.map((item, index) => (
							<ElTabPane key={index} disabled={item.disabled} name={item.name} closable={item.closable} lazy={item.lazy}>
								{{
									default: () => {
										const refs = {
											ref: el => {
												const element = el ? (tabsPanl[item.name] = el) : null
												return element
											},
										}
										if (!isFunction(item.render)) return h(item.render as JSX.Element, refs)
										const Component = item.render as () => Component
										if (!isObject(Component)) {
											item.render = h(
												defineAsyncComponent(() => Promise.resolve(Component())),
												{
													ref: el => {
														const element = el ? (tabsPanl[item.name] = el) : null
														return element
													},
												}
											) as Component
											return item.render
										}
										return item.render
									},
									label: () => checkComponent(isFunction(item?.label) ? item.label?.() : item.label),
								}}
							</ElTabPane>
					  ))
					: slots.default && slots.default()}
			</ElTabs>
		)
	},
})
