/*
 * @Descripttion: 上传
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */
import { ElUpload, uploadProps } from 'element-plus';
import 'element-plus/theme-chalk/src/upload.scss';

export default defineComponent({
	name: 'BtUpload',
	props: { ...uploadProps },
	setup(_, { attrs, slots }) {
		return () => <ElUpload {...attrs}>{slots}</ElUpload>;
	},
});
