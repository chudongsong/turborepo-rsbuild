/* eslint-disable consistent-return */
/* eslint-disable no-else-return */

import { isFunction, isPromise } from '@/utils'
import { SetupContext, ShallowRef } from 'vue'

import BtForm from '@/components/form/bt-form'
import BtFormItem from '@/components/form/bt-form-item'
import { FormRules } from 'element-plus'
import { getFormKey, renderFormType, renderGroup } from './render'
import type { FormItemElementProps, FormItemProps, UseFormProps, UseFormReturn } from './types'

/**
 * @description 渲染表单项
 * @param {FormOptionsItem} props 表单项集合
 */
const renderFormItem = (item: FormItemProps, formVal: Ref<AnyObject>) => {
	let prop = getFormKey(item as FormItemElementProps, formVal) // 获取key
	if (item.type === 'slots') return
	switch (item.type) {
		case 'custom':
			return item.render(formVal)
		case 'group':
			return <div class="flex flex-wrap w-full">{renderGroup(item, formVal)}</div>
		default:
			return (
				<BtFormItem label={item.label || ''} prop={prop} {...(item?.labelAttrs || {})}>
					{renderFormType(item, formVal)}
				</BtFormItem>
			)
	}
}

/**
 * @description	表单hook
 * @param props
 */
export const useForm = (props: UseFormProps): UseFormReturn => {
	const fromRef = ref() // 表单实例
	const formVal = ref({}) // 表单数据
	const formSolt = ref([]) // 表单插槽
	const rulesVal = shallowRef({}) // 表单校验规则
	const options = (isFunction(props.options) && props.options(formVal, fromRef.value?.validate())) || ((isRef(props.options) ? props.options : ref(props.options || {})) as Ref<FormItemProps[]> | ComputedRef<FormItemProps[]>) // 表单配置

	if (!options) return

	// 设置校验规则
	const setRules = (item: FormItemProps, rulesVal: ShallowRef<FormRules>) => {
		if (item.type === 'help') return
		if (item.type === 'slots' || item.type === 'custom') {
			// 特殊类型，由于自定义和插槽类型无需设置key,所以直接设置rules即可
			// eslint-disable-next-line no-restricted-syntax
			for (const keys in item?.rules) {
				if (!rulesVal.value[keys]) rulesVal.value[keys] = item.rules[keys]
			}
		} else if (item.type === 'group') {
			// 组类型，遍历组内的key，设置rules
			// eslint-disable-next-line no-restricted-syntax
			for (const items of item?.group) {
				if (!items) continue
				if (!('key' in items)) continue
				if (!rulesVal.value[items.key as string]) rulesVal.value[items.key as string] = items.rules || []
			}
		} else if (item?.key) {
			// } else if (item?.key && !rulesVal.value[item.key as string]) rulesVal.value[item.key as string] = item.rules
			rulesVal.value[item.key as string] = item.rules || []
		}
	}

	// 设置插槽
	// const setSolts = (item: FormItemProps, formSolt: ShallowRef<AnyObject>) => {
	// 	if (item.type === 'group') {
	// 		for (const items of item?.group) {
	// 			if (items?.key) formSolt.value.push(items.key);
	// 		}
	// 	} else if (item.type === 'slots') {
	// 		if (item?.key) formSolt.value.push(item.key);
	// 	}
	// };

	// 初始化数据
	const init = async () => {
		if (isPromise(props.data)) {
			;(props.data as Promise<AnyObject>).then((res: AnyObject) => {
				if (res.has('data')) {
					formVal.value = res.data || {}
				} else {
					formVal.value = res || {}
				}
			})
		} else if (isFunction(props.data)) {
			formVal.value = (await props.data()) || {}
		} else {
			formVal.value = props.data || {}
		}
	}
	init()

	return {
		// 表单组件
		BtForm: (_: unknown, { attrs, slots }: SetupContext) => {
			return (
				<BtForm model={formVal.value} ref={fromRef} rules={rulesVal.value} {...attrs}>
					{options.value.map((item: FormItemProps) => {
						if (!item) return null
						setRules(item, rulesVal)
						if (item.type === 'slots') {
							return slots[item.key as string] ? slots[item.key as string]!(formVal) : null
						} else {
							return renderFormItem(item, formVal)
						}
					})}
				</BtForm>
			)
		},
		// 清除表单验证
		clearValidate: () => fromRef.value?.clearValidate(),
		// 表单验证
		validate: () => fromRef.value?.validate(),
		// 表单数据
		param: formVal, // 表单实例
		// 获取表单实例
		ref: fromRef,
		// 表单配置
		options,
		// 提交表单
		submit: (): Promise<void | boolean> => {
			if (!props?.submit) return Promise.resolve(false)
			return props?.submit(formVal, fromRef.value?.validate, fromRef)
		},
	}
}
