import { ElImage } from 'element-plus'

export default defineComponent({
	props: {
		name: {
			type: String,
			default: '',
		},
		size: {
			type: String,
			default: '14',
		},
	},
	setup(props, { attrs }) {
		const src = ref(`/static/icons/${props.name}.svg`)
		watch(
			() => props.name,
			() => {
				src.value = `/static/icons/${props.name}.svg`
			}
		)
		return () => <ElImage src={src.value} style={{ width: `${props.size}px`, height: `${props.size}px` }} {...attrs} />
	},
}) // 无状态组件
