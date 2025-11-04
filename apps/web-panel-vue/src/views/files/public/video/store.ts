import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { getFilesVideoList } from '@api/files'
import { useDataHandle } from '@/hooks/tools'

const FILES_VIDEO_STORE = defineStore('FILES-VIDEO-STORE', () => {
	const { fileTabActiveData } = storeToRefs(FILES_STORE())

	// 视频地址
	const videoUrl = ref<string>('')
	// 目录视频列表
	const videoList = ref<any[]>([])
	// 当前目录地址
	const currentPath = fileTabActiveData.value.param.path

	// 播放列表事件
	const playVideo = (name: string) => {
		videoUrl.value = currentPath + '/' + name
	}

	const getList = async () => {
		await useDataHandle({
			request: getFilesVideoList({ path: currentPath }),
			data: [Array, videoList],
		})
	}

	const $reset = () => {
		videoUrl.value = ''
		videoList.value = []
	}

	return {
		currentPath,
		videoList,
		videoUrl,
		playVideo,
		getList,
		$reset,
	}
})

export default FILES_VIDEO_STORE
