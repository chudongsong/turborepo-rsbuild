import BtCheckbox from '@/components/form/bt-checkbox'
import BtHelp from '@/components/form/bt-help'
import BtInput from '@/components/form/bt-input'
import BtRadio from '@/components/form/bt-radio'
import BtSelect from '@/components/form/bt-select'
import BtSwitch from '@/components/form/bt-switch'
import BtButton from '@/components/base/bt-button'
import { isFunction, isObject } from '@/utils'
import { has } from 'ramda'
import { FromCustomProps, FormButtonProps, FormCheckboxProps, FormGroupItemProps, FormHelperProps, FormInputProps, FormItemElementProps, FormItemProps, FormKeyProps, FormRadioProps, FormSelectProps, FormSwitchProps } from './types'
import BtFormItem from '@/components/form/bt-form-item'

/**
 * @description 渲染表单项类型
 * @param {FormItemProps} item 选项
 * @param {Ref<AnyObject>} formVal 表单数据
 * @returns  {JSX.Element} 表单项
 */
export const renderFormType = (item: FormItemProps, formVal: Ref<AnyObject>) => {
	let component = <div>未知类型,请检查类型，或使用{/type:'custom'/}自定义渲染</div>
	switch (item.type) {
		case 'input':
		case 'textarea':
			component = renderInput(item, formVal)
			break
		case 'select':
			component = renderSelect(item, formVal)
			break
		case 'checkbox':
		case 'checkbox:button':
			component = renderCheckbox(item, formVal)
			break
		case 'radio':
		case 'radio:button':
			component = renderRadio(item, formVal)
			break
		case 'switch':
			component = renderSwitch(item, formVal)
			break
		case 'help':
			component = renderHelp(item)
			break
		case 'button':
			component = renderButton(item)
			break
		default:
			return
	}
	return component
}

/**
 * @description 获取表单key
 * @param {FormInputProps} item 表单项
 * @returns
 */
export const getFormKey = (item: FormItemElementProps, formVal: Ref<Record<string, any>>) => {
	let keys = ''
	if (isObject(item.key)) {
		keys = Object.keys(item.key)[0] as string
		if (!keys) return ''
		const keyProps = item.key as FormKeyProps
		if (!has(keys, formVal.value)) formVal.value[keys] = isFunction(keyProps[keys]) ? (keyProps[keys] as Function)() : keyProps[keys] // 设置默认值
	} else {
		keys = item.key
		if (!has(keys, formVal.value) && keys) formVal.value[keys] = isFunction(item.key) ? (item.key as Function)() : '' // 设置默认值
	}
	return keys
}

/**
 * @description 渲染表单项 - input类型
 * @param {FormOptionsItem} props 表单项集合
 * @returns {JSX.Element} 表单项
 */
export const renderInput = (item: FormInputProps, formVal: Ref<AnyObject>) => {
	const inputType: string = item.attrs?.type || item.type
	const keys = getFormKey(item, formVal)
	const { attrs, slots } = item
	return (
		<BtInput {...(attrs || {})} v-model={formVal.value[keys]} type={inputType}>
			{slots}
		</BtInput>
	)
}

/**
 * @description 渲染表单项 - select类型
 * @param {FormSelectProps} props 表单项集合
 * @param {Ref<AnyObject>} formVal 表单数据
 * @returns {JSX.Element} 表单项
 */
export const renderSelect = (item: FormSelectProps, formVal: Ref<AnyObject>) => {
	const { attrs, slots } = item
	const keys = getFormKey(item, formVal)
	return (
		<BtSelect options={item.options} {...(attrs || {})} v-model={formVal.value[keys]}>
			{slots}
		</BtSelect>
	)
}

/**
 * @description 渲染表单项 - checkbox类型
 * @param {FormCheckboxProps} props 表单项集合
 * @param {Ref<AnyObject>} formVal 表单数据
 * @returns {JSX.Element} 表单项
 */
export const renderCheckbox = (item: FormCheckboxProps, formVal: Ref<AnyObject>) => {
	const { attrs, slots, type } = item
	const viewType = type.split(':')[1] // 获取input类型
	const keys = getFormKey(item, formVal)
	return (
		<BtCheckbox options={item.options} type={viewType} {...(attrs || {})} v-model={formVal.value[keys]}>
			{slots}
		</BtCheckbox>
	)
}

/**
 * @description 渲染表单项 - button类型
 * @param {FormOptionsItem} item 表单项集合
 * @returns {JSX.Element} 表单项
 */
export const renderButton = (item: FormButtonProps) => {
	const { attrs, slots } = item
	return <BtButton {...(attrs || {})}>{slots}</BtButton>
}

/**
 * @description 渲染表单项 - radio类型
 * @param {FormRadioProps} props 表单项集合
 * @param {Ref<AnyObject>} formVal 表单数据
 * @returns {JSX.Element} 表单项
 */

export const renderRadio = (item: FormRadioProps, formVal: Ref<AnyObject>) => {
	const { attrs, slots, type } = item
	const viewType = type.split(':')[1] // 获取input类型
	const keys = getFormKey(item, formVal) // key值
	return (
		<BtRadio options={item.options} type={viewType} {...(attrs || {})} v-model={formVal.value[keys]}>
			{slots}
		</BtRadio>
	)
}

/**
 * @description 渲染表单项 - switch类型
 * @param {FormSwitchProps} props 表单项集合
 * @param {Ref<AnyObject>} formVal 表单数据
 * @returns {JSX.Element} 表单项
 */
export const renderSwitch = (item: FormSwitchProps, formVal: Ref<AnyObject>) => {
	const { attrs, slots } = item
	const keys = getFormKey(item, formVal)
	return (
		<BtSwitch {...(attrs || {})} v-model={formVal.value[keys]}>
			{slots}
		</BtSwitch>
	)
}

/**
 * @description 渲染表单项 - help类型
 * @param {FormOptionsItem} props 表单项集合
 * @returns {JSX.Element} 表单项
 */
export const renderHelp = (item: FormHelperProps) => {
	return <BtHelp options={item.options} listStyle="disc" class={item.attrs?.class || ''} />
}

/**
 * @description 渲染表单项 - group类型
 * @param {FormOptionsItem} props 表单项集合
 * @returns {JSX.Element} 表单项
 */
export const renderGroup = (item: FormGroupItemProps, formVal: Ref<AnyObject>) => {
	return item.group.map((item: any) => {
		if (item.type === 'custom') {
			return item.render(formVal)
		}
		return (
			<BtFormItem label={item?.label || ''} prop={getFormKey(item, formVal)} {...(item?.labelAttrs || {})}>
				{renderFormType(item, formVal)}
			</BtFormItem>
		)
	})
}
