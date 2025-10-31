interface Props {
	data?: string[]
	isIcon?: boolean
	modelValue: boolean | number
}

export default defineComponent<Props>({
	name: 'BtTableStatus',
	props: {
		data: {
			type: Array as () => string[],
			default: () => ['未启动', '运行中'],
		},
		isIcon: {
			type: Boolean,
			default: true,
		},
		modelValue: {
			type: [Boolean, Number],
			default: true,
		},
	},
	setup(props, { attrs }) {
		return () => (
			<span class={`bt-${props.modelValue ? 'link' : 'danger'}`} {...attrs}>
				<span class="flex items-center">
					<span>{props.data![Number(props.modelValue)]}</span>
					{props.isIcon && <i class={`ml-[2px] text-small svgtofont-icon-${props.modelValue ? 'start' : 'stop'}`}></i>}
				</span>
			</span>
		)
	},
})
