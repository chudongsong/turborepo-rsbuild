import type { FileStoreProps, FileTabOptionalProps } from '@files/types'
import { setCookie } from '@utils/index'
import { defineStore, storeToRefs } from 'pinia'

const filesStore = defineStore('FILES-STORE1', {
	state: (): FileStoreProps => ({
		realTask: false, // 是否真实任务
		isAddTabs: true, // 是否允许添加tab
		isRefreshFileList: false, // 是否刷新文件列表
		deleteFileData: {}, // 删除文件信息
		createListType: '', // 创建列表类型,默认空
		isNoCreteItem: false, // 不可以新建列表
		fileTabActive: 0, // 当前活跃的tab索引
		openSearchRecom: '', // 打开搜索推荐
		disabledCutTab: false, // 禁用点击tab
		keyDownStatus: true, // 是否允许键盘事件
		imgPathItem: '', // 图片预览路径

		// 表格文件名宽度记录
		fileTableWidth: {},
		globalTamperStatus: {
			status: false,
			tip: '',
		}, // 插件防篡改状态
		// tab列表
		fileTabList: [
			{
				id: 'label-1',
				label: 'wwwroot',
				type: 'list', // 视图模式，默认列表模式
				loading: false, // 加载状态
				total: 0, // 总条数、
				param: {
					// 表格数据
					p: 1, // 当前页
					showRow: 500, // 每页显示条数
					path: '/www/wwwroot',
					sort: '',
					reverse: 'True',
				},
			},
		] as FileTabProps[],
		fileTabActiveData: {
			id: 'label-1',
			label: 'wwwroot',
			type: 'list', // 视图模式，默认列表模式
			// menuType: '',
			loading: false, // 加载状态
			total: 0, // 总条数、
			param: {
				// 表格数据
				p: 1, // 当前页
				showRow: 500, // 每页显示条数
				path: '/www/wwwroot',
				sort: '',
			},
		}, // 当前活跃的tab数据
		favoriteList: [], // 收藏列表
		diskList: [], // 磁盘列表
		fileSync: [], // 同步列表
		fileTamper: {}, // 当前目录下的防篡改列表
		copyFilesData: {
			files: [], // 复制的文件数据
			type: '', // 操作类型 copy/cut
		}, // 复制/剪切的文件数据
		isShareRefresh: false, // 是否刷新分享列表
		searchHistory: [], // 搜索历史
		dirLength: 0, // 当前目录下的文件夹数量
		fileLength: 0, // 当前目录下的文件数量
		imageList: [], //当前目录下的图片缩略图列表
		recyclingBinStatus: false, // 回收站是否开启
		columnShow: {
			// 列表显示的列
			isLock: true,
			rootLevel: true,
			size: true,
			time: true,
			ps: true,
		},
		navBtnHeight: 0, // 导航按钮栏高度
	}),
	actions: {
		/**
		 * @description 设置当前活跃的tab索引的值
		 * @param {FileTabProps} data 当前活跃的数据
		 */
		updateTabActiveData(data: FileTabOptionalProps = {}) {
			const oldData = this.fileTabList[this.fileTabActive]
			if (data.param) data.param = { ...oldData.param, ...data.param }
			const newData = { ...oldData, ...data } as any
			// 删除原数组的数据并替换
			this.fileTabList.splice(this.fileTabActive, 1, newData)
			this.$patch({
				fileTabActiveData: newData,
			})
		},
		/**
		 * @description 获取对应目录下的文件列表
		 * @param {AnyFunction} callback 回调函数
		 * @returns {Promise<void>} void
		 */
		async refreshFilesList(): Promise<void> {
			this.isRefreshFileList = true
			setCookie('Path', this.fileTabActiveData.param.path)
		},
	},
	// 持久化
	persist: {
		// 持久化的数据
		paths: ['fileTabActive', 'fileTabList', 'fileTabActiveData', 'copyFilesData'],
	},
})

const useFilesStore = () => {
	const store = filesStore() // 直接初始化
	return { ...store, ...storeToRefs(store) } // 返回store实例，以及store实例的ref
}

export default useFilesStore
export { useFilesStore as getFilesStore }
