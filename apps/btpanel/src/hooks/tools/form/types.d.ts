import type { HelpOptionsProps } from '@/components/extension/bt-help/types';
import type { CheckboxOptionsProps } from '@/components/form/bt-checkbox/types';
import type { RadioOptionsProps } from '@/components/form/bt-radio/types';
import type { SelectOptionProps } from '@/components/form/bt-select/types';
import type { InputProps, SelectProps } from 'element-plus';
import type { FormValidateCallback, FormValidationResult } from 'element-plus/lib/el-form/src/form.type';
import type { ComputedRef, Reactive, Ref } from 'vue';

type FormDataType = number | string | boolean | Array<number | string> | Array<{ [key: string]: number | string }>;
type FormKeyProps = { [key: string]: (() => FormDataType) | FormDataType };

/**
 * @description 表单项选项
 */
export interface BaseFormItemProps {
	label: string;
	labelAttrs?: { [key: string]: any }; // 标签属性
	key: string | FormKeyProps; // 表单项值
	prop?: { [key: string]: any }; // 表单组件参数
}

/**
 * @description 表单项选项
 */
export interface FormGroupItemProps {
	type: 'group';
	label: string;
	group: Array<FormItemElementProps>;
}

/**
 * @description 输入框表单项
 */
export interface FromCustomProps {
	type: 'custom';
	key?: string; // 表单项值
	rules?: { [key: string]: FormRules<RuleForm> }; // 表单项校验规则
	render: (formData: AnyObject) => JSX.Element;
}

/**
 * @description 表单项选项 - 插槽配置
 */
export interface FormSlotsProps {
	type: 'slots';
	key: string | FormKeyProps; // 表单项值，插槽key
	rules?: { [key: string]: FormRules<RuleForm> }; // 表单项校验规则
}

/**
 * @description 输入框表单项
 */
export interface FormInputProps extends BaseFormItemProps {
	type: 'input' | 'textarea'; // 表单项类型
	attrs?: { placeholder?: string; onChange?: (val: string) => void; class?: string; icon?: string; [key: string]: AnyObject | AnyFunction | number | string | boolean }; // 表单项属性
	slots?: { [key: string]: () => JSX.Element }; // 插槽
	rules?: FormRules<RuleForm>; // 表单项校验规则
}

/**
 * @description select表单项
 */
export interface FormSelectProps extends BaseFormItemProps {
	type: 'select'; // 表单项类型
	attrs?: SelectProps; // 表单项属性
	slots?: { [key: string]: JSX.Element }; // 插槽
	rules?: FormRules<RuleForm>; // 表单项校验规则
	options: SelectOptionProps[] | (() => SelectOptionProps[]); // 下拉选项
}

/**
 * @description switch表单项
 */
export interface FormSwitchProps extends BaseFormItemProps {
	type: 'switch'; // 表单项类型
	attrs?: SwitchProps; // 表单项属性
	slots?: { [key: string]: JSX.Element }; // 插槽
	rules?: FormRules<RuleForm>; // 表单项校验规则
}

/**
 * @description radio表单项
 */
export interface FormRadioProps extends BaseFormItemProps {
	type: 'radio' | 'radio:button'; // 表单项类型
	attrs?: RadioProps; // 表单项属性
	slots?: { [key: string]: JSX.Element }; // 插槽
	rules?: FormRules<RuleForm>; // 表单项校验规则
	options: RadioOptionsProps[] | (() => RadioOptionsProps[]); // 单选项
}

/**
 * @description checkbox表单项
 */
export interface FormCheckboxProps extends BaseFormItemProps {
	type: 'checkbox' | 'checkbox:button'; // 表单项类型
	attrs?: CheckboxProps; // 表单项属性
	slots?: { [key: string]: JSX.Element }; // 插槽
	rules?: FormRules<RuleForm>; // 表单项校验规则
	options: CheckboxOptionsProps[] | (() => CheckboxOptionsProps[]); // 多选项
}

/**
 * @description button表单项
 */
export interface FormButtonProps extends BaseFormItemProps {
	type: 'button'; // 表单项类型
	attrs?: ButtonProps; // 表单项属性
	slots?: { [key: string]: JSX.Element }; // 插槽
}

/**
 * @description 表单项选项
 */
export interface FormHelperProps {
	type: 'help';
	options: HelpOptionsProps[]; // 表单项集合
}

/**
 * @description 表单项所有元素类型
 */
export type FormItemElementProps = FormInputProps | FormCheckboxProps | FormRadioProps | FormSelectProps | FormSwitchProps;

// 表单项类型
export type FormItemProps = FormGroupItemProps | FromCustomProps | formBaseItemProps | FormButtonProps | FormSlotsProps;

// 表单项选项
export type FormOptionsProps = Ref<FormItemProps[]> | Reactive<FormItemProps[]> | ComputedRef<FormItemProps[]>;

// 表单项基础配置
export type formBaseItemProps = FormItemElementProps | FormHelperProps;

// 表单项校验规则
export type UseFormProps<T = AnyObject> = {
	data?: (() => T | Promise<T>) | T; // 表单数据
	options: ((formData?: T, validate: (trigger: string, callback?: FormValidateCallback | undefined) => FormValidationResult) => FormOptionsProps) | FormOptionsProps; // 表单项集合; // 表单项集合
	submit?: (data: any, validate: (trigger: string, callback?: FormValidateCallback | undefined) => FormValidationResult, ref: Ref<any>) => Promise<void | boolean>; // 请求方法, 用于提交表单
};

// 表单返回值
export type UseFormReturn<T = any> = {
	BtForm: (_: any, { attrs }: SetupContext) => JSX.Element; // 表单组件
	clearValidate: () => void; // 清除表单验证
	validate: () => Promise<boolean>; // 表单验证
	param: Ref<T>; // 表单数据
	ref: Ref<any>; // 表单实例
	options: FormOptionsProps; // 表单配置
	submit: () => Promise<void | boolean>; // 提交表单
};

// 表单其他参数配置
export type FormOtherProps = {
	attrs?: { [key: string]: any };
	rules?: FormRules<RuleForm>;
	labelAttrs?: { [key: string]: any };
	[key: string]: any;
};
