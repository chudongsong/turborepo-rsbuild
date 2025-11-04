import type { ResponseResult } from '@/types'
import type { TermVideoInfoProps } from '@term/types'

import { setLoginRecord, getRecordVideo, removeVideoRecord } from '@/api/xterm'
import { useConfirm, useDataHandle, useDialog, useMessage } from '@hooks/tools'
import { formatTime } from '@utils/index'
import { create } from 'asciinema-player' // asciinema-player，录像播放器，终端录像回放
import { CheckboxValueType } from 'element-plus'
import { App } from 'vue'
import { useTermVideoStore } from './useStore'

const { warn: $warn, error: $error, request: $request } = useMessage()
const { isVideo } = useTermVideoStore()

const playerPopup = ref() // 播放器弹窗

// 录像列表
const VideoComp = defineComponent({
	props: {
		compData: {
			type: Object as PropType<TermVideoInfoProps>,
			default: () => ({}),
		},
	},
	setup: (props: any) => {
		onMounted(() => {
			const row = props.compData as TermVideoInfoProps
			const video = document.getElementById('video') as HTMLVideoElement
			if (video) video.innerHTML = ''

			getRecordVideo(row.id).then(async ({ data }: any) => {
				if (!data.stdout.length) {
					const popup = await playerPopup.value
					popup.unmount()
					return $error('链接中未进行通信，无法查看视频')
				}
				create({ data }, video, {
					autoPlay: true,
					theme: 'solarized-dark',
					terminalFontSize: 'small',
				})
			})
		})
	},
	render: () => (
		<>
			<div class="relative w-[90rem] h-[70rem]">
				<div id="video" class="border-white bg-black border-[1.6rem] rounded-base absolute leading-8 w-[90rem] h-[70rem]"></div>
			</div>
		</>
	),
})

/**
 * @description 播放视频
 * @param {TermVideoInfoProps} row 视频信息
 * @returns {void}
 */
export const playVideo = (row: TermVideoInfoProps) => {
	if (row.close_time === 0) return $warn('终端未关闭，录制未结束，无法播放')
	if (row.close_time - row.login_time <= 1) return $error('视频录制时间小于1秒，无法播放')
	playerPopup.value = useDialog({
		area: [90, 70],
		compData: row,
		component: VideoComp,
	})
}

/**
 * @description 录像详情
 * @param {TermVideoInfoProps} rowsData 行数据
 * @returns {Promise<App>}
 */
export const videoDetailDialog = (rowsData: TermVideoInfoProps, refresh: () => void): Promise<App> =>
	useDialog({
		title: formatTime(rowsData.login_time) + '详情',
		area: 60,
		component: () => import('@term/views/video-list/message-detail.vue'),
		compData: { rowsData, refresh },
	})

/**
 * @description 设置录像开关
 * @param {boolean} val 录像状态
 */
export const onChangeVideo = async (val: CheckboxValueType) => {
	isVideo.value = !val // 先不改变原有状态
	await useConfirm({
		title: (val ? '开启' : '关闭') + '录像',
		content: val ? '开启后，将会记录录像，便于回放，是否继续操作？' : '关闭后，将不会记录历史录像，是否继续操作？',
		icon: 'warning-filled',
	})
	const { status }: ResponseResult = await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + '录像，请稍后...',
		request: setLoginRecord(!val),
		data: { status: Boolean },
	})
	$request({ msg: status ? '操作成功' : '操作失败', status })
	isVideo.value = val as boolean
}

/**
 * @description 删除录像
 * @param {TermVideoInfoProps} row 录像信息
 * @returns {Promise<void>}
 */
export const deleteVideo = async (row: TermVideoInfoProps, refresh: () => void): Promise<void> => {
	if (row.close_time === 0) {
		$warn('终端未关闭，录制未结束，无法删除')
		return
	}

	await useConfirm({
		title: '删除录像',
		content: `确定要删除 ${formatTime(row.login_time)} 的录像吗？删除后无法恢复！`,
		icon: 'warning-filled',
	})

	const { status }: ResponseResult = await useDataHandle({
		loading: '正在删除录像，请稍后...',
		request: removeVideoRecord([row.id]),
		data: { status: Boolean },
	})

	$request({ msg: status ? '删除成功' : '删除失败', status })
	refresh()
}
