import { defineComponent, ref, watch, onMounted, PropType } from 'vue'
import qrcode from 'qrcode'
import { isDark } from '@/utils/theme-config'

interface Props {
	value: string // 二维码内容，必填
	size?: number // 二维码大小
	margin?: number // 二维码边距
	level?: 'L' | 'M' | 'Q' | 'H' // 容错率 L: 7%, M: 15%, Q: 25%, H: 30%
	scale?: number // 缩放比例
	small?: boolean // 是否小二维码
	foreground?: string // 前景色
	background?: string // 背景色
}

export default defineComponent({
	name: 'BtQrcode',
	props: {
		value: {
			type: String as PropType<string>,
			required: true,
		},
		size: {
			type: Number as PropType<number>,
			default: 100,
		},
		margin: {
			type: Number as PropType<number>,
			default: 0,
		},
		level: {
			type: String as PropType<'L' | 'M' | 'Q' | 'H'>,
			default: 'M',
		},
		scale: {
			type: Number as PropType<number>,
			default: 4,
		},
		small: {
			type: Boolean as PropType<boolean>,
			default: false,
		},
		foreground: {
			type: String as PropType<string>,
			default: '#000000ff',
		},
		background: {
			type: String as PropType<string>,
			default: '#ffffffff',
		},
	},
	setup(props: Props) {
		const qrcodeRef = ref<HTMLCanvasElement | null>(null)
		// 初始化二维码
		const init = async () => {
			const canvas = qrcodeRef.value
			if (!canvas || !props.value) return
			await qrcode.toCanvas(canvas, props.value, {
				margin: props.margin,
				width: props.size,
				errorCorrectionLevel: props.level,
				scale: props.scale,
				small: props.small,
				color: {
					dark: props.foreground,
					light: props.background,
				},
			})
		}
		// 监听二维码内容变化
		watch(() => props.value, init)
		// 初始化二维码
		onMounted(init)
		return () => (
			<div class="flex p-[10px] bg-white">
				<canvas ref={qrcodeRef} style={{ width: `${props.size - 20}px`, height: `${props.size - 20}px` }} />
			</div>
		)
	},
})
