/*
 * @Descripttion: 头像
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElAvatar, avatarProps } from 'element-plus'
import 'element-plus/theme-chalk/src/avatar.scss'

export default defineComponent({
	name: 'BtAvatar',
	props: { ...avatarProps },
	setup(_, { attrs, slots }) {
		return () => <ElAvatar {...attrs}>{slots}</ElAvatar>
	},
})
