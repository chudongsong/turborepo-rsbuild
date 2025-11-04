import { getLoginRecord, getVideoList } from '@/api/xterm'
import { useDataHandle } from '@/hooks/tools'
import { getPageTotal } from '@/utils/index'

import { defineStore } from 'pinia'

const TERM_VIDEO_LIST = defineStore('TERM_VIDEO_LIST', () => {
	const isVideo = ref(false) // 录像开关
	const completedTotal = ref(0) // 总条数
	// 表格接口请求
	const tableParam = reactive({
		p: 1,
		limit: 10,
	})

	/**
	 * @description 获取服务器列表
	 * @returns {Promise<void>}
	 */
	const getVideo = async ({ p, limit }: { p: number; limit: number }) => {
		try {
			const { data, page }: { data: AnyObject[]; page: string } = await useDataHandle({
				request: getVideoList({ p, limit }),
				data: {
					data: Array,
					page: String,
				},
			})
			return { data, total: getPageTotal(page), other: {} }
		} catch (error) {
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 获取录像状态
	 * @returns {Promise<void>}
	 */
	const getVideoStatus = async () => {
		try {
			await useDataHandle({
				request: getLoginRecord(),
				data: { status: [Boolean, isVideo] },
			})
		} catch (error) {
			console.error(error)
		}
	}

	const $reset = () => {
		isVideo.value = false
		tableParam.p = 1
		completedTotal.value = 0
	}

	return {
		getVideo,
		getVideoStatus,
		isVideo,
		completedTotal,
		tableParam,
		$reset,
	}
})

/**
 * @description 录像列表
 * @returns
 */
const useTermVideoStore = () => {
	const store = TERM_VIDEO_LIST()
	return { ...store, ...storeToRefs(store) }
}

export { useTermVideoStore }
