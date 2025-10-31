import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'

const FILES_IMAGE_PREVIEW_STORE = defineStore('FILES-IMAGE-PREVIEW-STORE', () => {
	const { fileTabActiveData, imageList } = storeToRefs(FILES_STORE())

	const fileItem = ref<any>() // 文件信息
	const imageUrl = window.location.protocol + '//' + window.location.host + '/download?filename='
	// const image = ref<any>(`/static/images/btwaf/dun.png`)
	const image = ref<any>('')
	const imagesArr = ref<any>([])

	/**
	 * @description: 获取数据库列表
	 */
	const getOptions = async () => {
		// const images = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tiff', 'ico', 'JPG', 'webp']
		// // 图片列表
		// const imageList = fileTabActiveData.value.list
		//     .filter(item => images.includes(item.ext))
		//     .map(item => item.path)
		// imagesList.value = imageList.map((path: any) => {
		//     return `${imageUrl}${path}`
		// })
		imagesArr.value = imageList.value.map(item => {
			return `${imageUrl}${fileTabActiveData.value.param.path}/${item[0]}`
		})
	}

	const init = () => {
		image.value = `${imageUrl}${fileItem.value.path}`
		getOptions()
	}

	const $reset = () => {
		imagesArr.value = []
	}

	return {
		fileItem,
		image,
		imagesArr,
		init,
		$reset,
	}
})

export default FILES_IMAGE_PREVIEW_STORE
