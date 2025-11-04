import { defineComponent, computed } from 'vue'

export default defineComponent({
	name: 'SvgIcon',
	props: {
		prefix: {
			type: String,
			default: 'icon',
		},
		name: {
			type: String,
			required: true,
		},
		size: {
			type: String,
			default: '16',
		},
		color: {
			type: String,
			default: '',
		},
	},
	setup(props) {
		const symbolId = computed(() => `#${props.prefix}-${props.name}`)
		return () => (
			<svg aria-hidden="true" style={{ width: `${props.size}px`, height: `${props.size}px` }} fill={props.color ? `color:${props.color}` : ''}>
				<use href={symbolId.value} />
			</svg>
		)
	},
})
