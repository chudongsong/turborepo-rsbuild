import { getScriptListByType } from '@/api/crontab'
import { useDataHandle, useDialog } from '@/hooks/tools'
import { desiredNpsDialog } from '@/public'
import { getNpsQuestion } from '@/api/global'

/**
 * @description 执行结果弹窗
 * @param data
 */
export const resultDialog = (data: any) => {
	// 处理data，防止xss攻击
	data.msg = data.msg.replace(/</g, '&lt;').replace(/>/g, '&gt;')
	useDialog({
		title: '执行结果',
		area: [60, 40],
		component: () => <pre class="h-full w-full bg-darkPrimary !overflow-auto whitespace-pre-line text-white break-all p-12px">{data.msg}</pre>,
	})
}

export const getTomorrowFormatted = () => {
	const now = new Date()
	now.setDate(now.getDate() + 1) // 增加一天
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0') // 月份从0开始，需要加1
	const day = String(now.getDate()).padStart(2, '0')
	return `${year}-${month}-${day} 00:00:00`
}

/**
 * @description 获取脚本库数据
 */
export const getScripDataEvent = async () => {
	const res = await useDataHandle({
		request: getScriptListByType(),
		data: Array,
	})
	return res
}

export const cloudServiceMapping: { [key: string]: string } = {
	localhost: '服务器磁盘',
	alioss: '阿里云OSS',
	txcos: '腾讯云COS',
	qiniu: '七牛云存储',
	obs: '华为云OBS',
	bos: '百度云存储',
	ftp: 'FTP存储空间',
	upyun: '又拍云存储',
	tianyiyun: '天翼云存储',
	webdav: 'WebDav存储',
	minio: 'MinIO存储',
	dogecloud: '多吉云COS',
	aws_s3: '亚马逊S3云存储',
	gdrive: '谷歌云网盘存储',
	msonedrive: '微软OneDrive存储',
	gcloud_storage: '谷歌云存储',
	jdcloud: '京东云存储',
}

/**
 * @description 打开批量结果展示弹窗
 * @param list
 * @param config
 */
export const openResultView = (list: any, config: { title: string }) => {
	useDialog({
		title: `批量${config.title}结果`,
		area: 45,
		component: () => import('@/components/extension/bt-result/index.vue'),
		compData: {
			resultData: list,
			resultTitle: config.title || '操作',
		},
	})
}

/**
 * @description NPS
 */
export const openNps = async () => {
	const { data } = await getNpsQuestion({ version: -1, product_type: 6 })
	desiredNpsDialog({
		name: '计划任务',
		type: 6,
		id: data.msg[0].id,
		description: data.msg[0].question,
	})
}
