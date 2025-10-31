import type { HelpOptionsProps } from '@/components/form/bt-help/types'
import type { SelectOptionProps } from '@/components/form/bt-select/types'
import type { FormRules } from 'element-plus'

import BtButton from '@/components/base/bt-button'
import BtIcon from '@/components/base/bt-icon'
import BtSelect from '@/components/form/bt-select'
import BtDivider from '@/components/other/bt-divider'
import BtFormItem from '@/components/form/bt-form-item'
import type { FormCheckboxProps, FormHelperProps, FormInputProps, FormItemProps, FormOtherProps, FormRadioProps, FormSelectProps, FormSwitchProps, FromCustomProps } from './types'
import { getFormKey } from './render' /**
 * @description 表单行hook
 */
export const FormRows = (type: string, label: string, key: string, other: FormOtherProps) => {
	return {
		type,
		label,
		key,
		attrs: {
			class: '!w-[300px]', // 宽度
			clearable: true, // 可清空
			...other?.attrs,
		},
		...other,
	}
}

/**
 * @description 表单行hook - input
 * @param { string } label 标签
 * @param { string } key 键
 * @returns { FormRowsProps }
 */
export const FormInput = (label: string, key: string, other?: FormOtherProps): FormInputProps => FormRows('input', label, key, other || {}) as FormInputProps

/**
 * @description 表单行hook - select
 * @param { string } label 标签
 * @param { string } key 键
 * @returns { FormRowsProps }
 */
export const FormTextarea = (label: string, key: string, other?: FormOtherProps): FormInputProps => FormRows('textarea', label, key, other || {}) as FormInputProps

/**
 * @description 表单行hook - select
 * @param { string } label 标签
 * @param { string } key 键
 * @param { SelectOptionProps[] | (() => SelectOptionProps[]) } options 选项
 */
export const FormSelect = (label: string, key: string, options: SelectOptionProps[] | (() => SelectOptionProps[]), other?: FormOtherProps): FormSelectProps => FormRows('select', label, key, { options, ...(other || { attrs: {} }) }) as FormSelectProps

/**
 * @description 表单行hook - switch
 * @param { string } label 标签
 * @param { string } key 键
 * @returns { FormRowsProps }
 */
export const FormSwitch = (label: string, key: string, other?: FormOtherProps): FormSwitchProps => FormRows('switch', label, key, other || {}) as FormSwitchProps

/**
 * @description 表单行hook - checkbox
 * @param { string } label 标签
 * @param { string } key 键
 * @param { SelectOptionProps[] | (() => SelectOptionProps[]) } options 选项
 * @param { AnyObject } other 其他参数
 *
 */
export const FormCheckbox = (label: string, key: string, options: SelectOptionProps[] | (() => SelectOptionProps[]), other?: FormOtherProps): FormCheckboxProps => FormRows('checkbox', label, key, { options, ...(other || { attrs: {} }) }) as FormCheckboxProps

/**
 * @description 表单行hook - checkbox:button
 * @param { string } label 标签
 * @param { string } key 键
 * @param { SelectOptionProps[] | (() => SelectOptionProps[]) } options 选项
 * @param { AnyObject } other 其他
 * @returns
 */
export const FormCheckboxButton = (label: string, key: string, options: SelectOptionProps[] | (() => SelectOptionProps[]), other?: FormOtherProps): FormCheckboxProps => FormRows('checkbox:button', label, key, { options, ...(other || { attrs: {} }) }) as FormCheckboxProps
/**
 * @description 表单行hook - radio
 * @param { string } label 标签
 * @param { string } key 键
 * @param { SelectOptionProps[] | (() => SelectOptionProps[]) } options 选项
 * @param { AnyObject } other 其他
 * @returns
 */
export const FormRadio = (label: string, key: string, options: SelectOptionProps[] | (() => SelectOptionProps[]), other?: FormOtherProps): FormRadioProps => {
	return FormRows('radio', label, key, { options, ...(other || { attrs: {} }) }) as FormRadioProps
}

/**
 * @description 表单行hook - radio:button
 * @param { string } label 标签
 * @param { string } key 键
 * @param { SelectOptionProps[] | (() => SelectOptionProps[]) } options 选项
 * @param { AnyObject } other 其他
 * @returns
 */
export const FormRadioButton = (label: string, key: string, options: SelectOptionProps[] | (() => SelectOptionProps[]), other?: FormOtherProps): FormRadioProps => {
	return FormRows('radio:button', label, key, { options, ...(other || { attrs: {} }) }) as FormRadioProps
}

/**
 * @description 表单行hook - 自定义
 * @param { () => JSX.Element } render 渲染函数
 * @returns { FromCustomProps }
 */
export const FormCustom = (render: () => JSX.Element, { key, rules }: { key: string; rules: FormRules<AnyObject> } = { key: '', rules: {} }): FromCustomProps => {
	return {
		type: 'custom',
		rules,
		render,
	}
}

/**
 * @description 表单行hook - help
 * @param { string } label 标签
 * @param { HelpOptionsProps } options 选项
 * @returns { FormHelperProps }
 */
export const FormHelp = (label: string, options: HelpOptionsProps[], other?: FormOtherProps): FormHelperProps => {
	return {
		label,
		type: 'help',
		options,
		attrs: {
			...(other?.attrs || {}),
		},
	}
}

/**
 * @description 表单行hook - group
 * @param label
 * @param group
 * @returns
 */
export const FormGroup = (group: (() => FormItemProps[]) | FormItemProps[]) => {
	return {
		type: 'group',
		label: '',
		group,
	}
}

/**
 * @description 表单行hook - icon
 * @param { string } label 标签
 * @param { string } key 键
 * @param { FormOtherProps & { icon: string; attrs?: any; click: () => void } } other 其他
 */
export const FormInputIcon = (label: string, key: string, other: FormOtherProps & { icon?: string; iconClick?: () => void }) => {
	return {
		type: 'input',
		label,
		key,
		attrs: {
			...(other?.attrs || {}),
		},
		rules: other?.rules || [],
		slots: {
			append: () => (
				<BtButton onClick={other.iconClick}>
					<BtIcon icon={other?.icon} class="cursor-pointer" />
				</BtButton>
			),
		},
	} as FormInputProps
}

/**
 * @description 表单行hook - icon
 * @param { string } label 标签
 * @param { string } key 键
 * @param { FormOtherProps & { icon: string; attrs?: any; click: () => void } } other 其他
 */
export const FormInputSelect = (
	label: string,
	key: string,
	other: FormOtherProps & {
		data: Ref<any> // 表单数据
		key: string // 表单键
		options: SelectOptionProps[] // 选项
		placeholder?: string // 提示
		change?: (val: any) => void // 选项改变
		attrs?: any // 其他
	}
) => {
	return {
		type: 'input',
		label,
		key,
		attrs: {
			...(other?.attrs || {}),
		},
		slots: {
			append: () => <BtSelect v-model={other.data.value[other.key]} options={other.options} placeholder={other?.placeholder || '请选择'} onChange={other?.change}></BtSelect>,
		},
	} as FormInputProps
}

/**
 * @description 表单行hook - icon
 * @param { string } label 标签
 * @param { string } key 键
 * @param { FormOtherProps & { icon: string; attrs?: any; click: () => void } } other 其他
 * @returns
 */
export const FormInputAppend = (
	label: string,
	key: string,
	content: JSX.Element | string, // 内容
	other?: any // 其他
) => {
	return {
		type: 'input',
		label,
		key,
		...(other || {}),
		rules: other?.rules || [],
		slots: {
			append: () => <span>{content}</span>,
		},
	} as FormInputProps
}

/**
 * @description 表单行hook 更多配置
 * @param { Ref<boolean> } isMore 是否展开
 * @param { string } content 内容
 */
export const FormMore = (isMore: Ref<boolean>, content?: string) => {
	return {
		type: 'custom',
		render: () => (
			// <BtSettingDivider>
			// </BtSettingDivider>
			<BtDivider class="w-full" direction="horizontal">
				<div class="flex items-center w-full">
					<span
						class="bt-link mr-[4px]"
						onClick={() => {
							isMore.value = !isMore.value
						}}>
						{!isMore.value ? '展开' : '收起'}
						{content || '更多配置'}
					</span>
					<BtIcon icon={isMore.value ? 'el-arrow-up' : 'el-arrow-down'}></BtIcon>
				</div>
			</BtDivider>
		),
	}
}

/**
 * @description 表单行hook - password
 *
 */
export const FormInputPaw = (label: string, key: string, other: FormOtherProps, click: () => void) => {
	return FormInputIcon(label, key, { iconClick: click, icon: 'el-refresh', ...other })
}

/**
 * @description 表单行hook - password
 */

export const FormInputPath = (label: string, key: string, other: FormOtherProps, click: () => void) => {
	return FormInputIcon(label, key, { iconClick: click, icon: 'el-folder-opened', ...other })
}

/**
 * @description 表单行hook - button
 * @param { JSX.Element | string } slots 插槽
 * @param { FormOtherProps } other 其他
 */
export const FormButton = (slots: JSX.Element | string, other?: AnyObject) => {
	return {
		type: 'button',
		slots,
		...(other || {}),
		attrs: {
			size: 'default',
			type: 'default',
			...(other?.attrs || {}),
		},
	}
}

/**
 * @description 表单行hook - 自定义
 * @param { string } label 标签
 * @param { () => JSX.Element } render 渲染函数
 * @param { string } key 键
 * @param { any } other 其他 BtFormItem 其他参数
 * @returns
 */
export const FormItemCustom = (label: string, render: () => JSX.Element, key?: string, other?: any) => {
	return {
		type: 'custom',
		key: key || '',
		rules: other?.rules || [],
		render: (formVal: Ref<AnyObject>) => {
			const keys = key ? getFormKey({ key }, formVal) : ''
			return (
				<BtFormItem label={label} prop={keys} {...(other || {})}>
					{render()}
				</BtFormItem>
			)
		},
	}
}
