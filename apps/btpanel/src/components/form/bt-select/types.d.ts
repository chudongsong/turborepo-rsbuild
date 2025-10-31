import type { Options, Placement } from 'element-plus/es/components/popper'
export declare const selectProps: {
	readonly ariaLabel: StringConstructor
	readonly emptyValues: ArrayConstructor
	readonly valueOnClear: import('element-plus/es/utils').EpPropFinalized<readonly [StringConstructor, NumberConstructor, BooleanConstructor, FunctionConstructor], unknown, unknown, undefined, boolean>
	readonly name: StringConstructor
	readonly id: StringConstructor
	readonly modelValue: import('element-plus/es/utils').EpPropFinalized<(ArrayConstructor | ObjectConstructor | NumberConstructor | StringConstructor | BooleanConstructor)[], unknown, unknown, undefined, boolean>
	readonly autocomplete: import('element-plus/es/utils').EpPropFinalized<StringConstructor, unknown, unknown, string, boolean>
	readonly automaticDropdown: BooleanConstructor
	readonly size: {
		readonly type: import('vue').PropType<import('element-plus/es/utils').EpPropMergeType<StringConstructor, '' | 'small' | 'default' | 'large', never>>
		readonly required: false
		readonly validator: ((val: unknown) => boolean) | undefined
		__epPropKey: true
	}
	readonly effect: import('element-plus/es/utils').EpPropFinalized<(new (...args: any[]) => string & {}) | (() => string) | ((new (...args: any[]) => string & {}) | (() => string))[], unknown, unknown, string, boolean>
	readonly disabled: BooleanConstructor
	readonly clearable: BooleanConstructor
	readonly filterable: BooleanConstructor
	readonly allowCreate: BooleanConstructor
	readonly loading: BooleanConstructor
	readonly popperClass: import('element-plus/es/utils').EpPropFinalized<StringConstructor, unknown, unknown, string, boolean>
	readonly popperOptions: import('element-plus/es/utils').EpPropFinalized<(new (...args: any[]) => Partial<Options>) | (() => Partial<Options>) | ((new (...args: any[]) => Partial<Options>) | (() => Partial<Options>))[], unknown, unknown, () => Partial<Options>, boolean>
	readonly remote: BooleanConstructor
	readonly loadingText: StringConstructor
	readonly noMatchText: StringConstructor
	readonly noDataText: StringConstructor
	readonly remoteMethod: FunctionConstructor
	readonly filterMethod: FunctionConstructor
	readonly multiple: BooleanConstructor
	readonly multipleLimit: import('element-plus/es/utils').EpPropFinalized<NumberConstructor, unknown, unknown, number, boolean>
	readonly placeholder: {
		readonly type: import('vue').PropType<string>
		readonly required: false
		readonly validator: ((val: unknown) => boolean) | undefined
		__epPropKey: true
	}
	readonly defaultFirstOption: BooleanConstructor
	readonly reserveKeyword: import('element-plus/es/utils').EpPropFinalized<BooleanConstructor, unknown, unknown, boolean, boolean>
	readonly valueKey: import('element-plus/es/utils').EpPropFinalized<StringConstructor, unknown, unknown, string, boolean>
	readonly collapseTags: BooleanConstructor
	readonly collapseTagsTooltip: BooleanConstructor
	readonly maxCollapseTags: import('element-plus/es/utils').EpPropFinalized<NumberConstructor, unknown, unknown, number, boolean>
	readonly teleported: import('element-plus/es/utils').EpPropFinalized<BooleanConstructor, unknown, unknown, true, boolean>
	readonly persistent: import('element-plus/es/utils').EpPropFinalized<BooleanConstructor, unknown, unknown, boolean, boolean>
	readonly clearIcon: {
		readonly type: import('vue').PropType<
			import('element-plus/es/utils').EpPropMergeType<
				| (new (...args: any[]) => (string | import('vue').Component<any, any, any, import('vue').ComputedOptions, import('vue').MethodOptions>) & {})
				| (() => string | import('vue').Component<any, any, any, import('vue').ComputedOptions, import('vue').MethodOptions>)
				| ((new (...args: any[]) => (string | import('vue').Component<any, any, any, import('vue').ComputedOptions, import('vue').MethodOptions>) & {}) | (() => string | import('vue').Component<any, any, any, import('vue').ComputedOptions, import('vue').MethodOptions>))[],
				unknown,
				unknown
			>
		>
		readonly required: false
		readonly validator: ((val: unknown) => boolean) | undefined
		__epPropKey: true
	}
	readonly fitInputWidth: BooleanConstructor
	readonly suffixIcon: {
		readonly type: import('vue').PropType<
			import('element-plus/es/utils').EpPropMergeType<
				| (new (...args: any[]) => (string | import('vue').Component<any, any, any, import('vue').ComputedOptions, import('vue').MethodOptions>) & {})
				| (() => string | import('vue').Component<any, any, any, import('vue').ComputedOptions, import('vue').MethodOptions>)
				| ((new (...args: any[]) => (string | import('vue').Component<any, any, any, import('vue').ComputedOptions, import('vue').MethodOptions>) & {}) | (() => string | import('vue').Component<any, any, any, import('vue').ComputedOptions, import('vue').MethodOptions>))[],
				unknown,
				unknown
			>
		>
		readonly required: false
		readonly validator: ((val: unknown) => boolean) | undefined
		__epPropKey: true
	}
	readonly tagType: {
		default: string
		type: import('vue').PropType<import('element-plus/es/utils').EpPropMergeType<StringConstructor, 'success' | 'warning' | 'info' | 'primary' | 'danger', unknown>>
		required: false
		validator: ((val: unknown) => boolean) | undefined
		__epPropKey: true
	}
	readonly tagEffect: {
		default: string
		type: import('vue').PropType<import('element-plus/es/utils').EpPropMergeType<StringConstructor, 'dark' | 'light' | 'plain', unknown>>
		required: false
		validator: ((val: unknown) => boolean) | undefined
		__epPropKey: true
	}
	readonly validateEvent: import('element-plus/es/utils').EpPropFinalized<BooleanConstructor, unknown, unknown, boolean, boolean>
	readonly remoteShowSuffix: BooleanConstructor
	readonly placement: import('element-plus/es/utils').EpPropFinalized<(new (...args: any[]) => Placement & {}) | (() => Placement) | ((new (...args: any[]) => Placement & {}) | (() => Placement))[], Placement, unknown, string, boolean>
	readonly fallbackPlacements: import('element-plus/es/utils').EpPropFinalized<(new (...args: any[]) => Placement[]) | (() => Placement[]) | ((new (...args: any[]) => Placement[]) | (() => Placement[]))[], unknown, unknown, string[], boolean>
}
export declare type SelectProps = ExtractPropTypes<typeof selectProps>

export interface SelectDefalutOptionProps {
	label: string
	value: string | number
	disabled?: boolean
	isStatus?: 'success' | 'error' | 'warning' | 'info'
	[key: string]: any
}

export interface SelectCustomProps extends SelectDefalutOptionProps {
	render: (option: SelectOptionProps, index: number) => JSX.Element
}

export type SelectOptionProps = SelectDefalutOptionProps | SelectCustomProps
