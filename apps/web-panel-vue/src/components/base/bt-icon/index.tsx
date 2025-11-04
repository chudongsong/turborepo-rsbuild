/*
 * @Descripttion: 图标
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: yang fu ren
 * @LastEditTime: 2024-09-25 16:39:28
 */

export default defineComponent({
	name: 'BtIcon',
	props: {
		icon: {
			type: String,
			default: 'defalut',
		},
		color: {
			type: String,
			default: '#666',
		},
		size: {
			type: Number,
			default: 16,
		},
	},
	setup(props) {
		return () => <i class={`svgtofont-${props.icon} `} style={`color:${props.color};font-size:${props.size}px;height:${props.size}px;line-height:${props.size}px;`} />
	},
})
