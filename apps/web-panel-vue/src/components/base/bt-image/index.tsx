import { ElImage } from 'element-plus'

export default defineComponent({
	props: {
		src: {
			type: String,
			default: '',
		},
		type: {
			type: String,
			default: 'images',
		},
		all: {
			type: Boolean,
			default: false,
		},
	},
	setup(props, { attrs, slots }) {
		const src = ref(!props.all ? `/static/${props.type}/${props.src}` : props.src)
		watch(
			() => props.src,
			() => {
				src.value = !props.all ? `/static/${props.type}/${props.src}` : props.src
			}
		)
		return () => (
			<ElImage src={src.value.replace('//', '/')} {...attrs}>
				{{
					error: () => slots.error && slots.error(),
				}}
			</ElImage>
		)
	},
}) // 无状态组件
