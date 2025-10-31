import { storeToRefs } from 'pinia'
import FILES_STORE from './store'
import type { FileDataProps, FileTabProps } from '@files/types.d'
import { useConfirm, useDataHandle, useDialog, useMessage } from '@hooks/tools'
import { formatTime, getCookie, getRandomPwd, isMobile, isUndefined } from '@utils/index'
import { setFileToping, createCopyFiles, getFavoriteList as getFavoriteListData, getDiskList as getDiskListData, addFileFavorites, delFileFavorites, deleteFile, checkExistsFiles, setCopyFiles, cutFiles, fileBatchCopy, fileBatchPaste, getRecyclingBin, setFileHistory } from '@api/files'

import { editorExample, minimizeEvent, useCreateEditorTabs, useEditorLoading, useEditorUnLoading } from '@files/public/ace/useMethods'
import { productPaymentDialog } from '@/public/index'
import FILES_BATCH_SET_AUTH_STORE from './views/batch-set-auth/store'
import FILES_CLOUD_STORAGE_STORE from './views/cloud-storage/store'
import FILES_COMPRESS_PREVIEW_STORE from './views/compress-preview/store'
import FILES_CREATE_SYMBOLIC_LINK_STORE from './views/create-symbolic-link/store'
import FILES_FAVORITES_MANAGE_STORE from './views/favorites-manage/store'
import FILES_FORMAT_CONVERSION_STORE from './views/file-format-conversion/store'
import FILES_OVERLAY_TIPS_STORE from './views/file-overlay-tips/store'
import FILES_TAMPER_STORE from './views/file-tamper/store'
import FILES_TASK_STORE from './views/file-task/store'
import FILES_IMAGE_PREVIEW_STORE from './views/image-preview/store'
import FILES_IMPORT_DATABASE_STORE from './views/import-database/store'
import FILES_VIDEO_STORE from './public/video/store'
import FILES_SHARE_STORE from './public/share/store'
import FILES_SEND_EMAIL_STORE from './public/send-email/store'
import FILES_SPLIT_STORE from './public/file-split/store'
import FILES_TERMINAL_STORE from './public/file-terminal/store'
import FILES_MERGE_STORE from './public/file-merge/store'
import FILES_EDIT_STORE from './public/file-edit/store'
import FILES_DECOMPRESSION_STORE from './public/decompression/store'
import FILES_COMPRESS_STORE from './public/compress/store'
import FILES_RSYNC_STORE from './public/file-rsync/store'
import FILES_DETAIL_STORE from './public/file-deatil/store'
import FILES_RECYCLE_BIN_STORE from './public/recycle-bin/store'
import FILES_ACE_STORE from './public/ace/store'
import FILES_LIST_VIEW_STORE from './views/file-view/store'
import FILES_ACE_MOBILE_STORE from './public/ace-mobile/store'

import { useDialog as useDialogV2 } from '@/hooks/tools/dialog-v2'
import { isFunction } from '@/utils'

const Message = useMessage()

export const defaultPS = new Map([
	['/etc', 'PS: 系统主要配置文件目录'],
	['/home', 'PS: 用户主目录'],
	['/tmp', 'PS: 公共的临时文件存储点'],
	['/root', 'PS: 系统管理员的主目录'],
	['/home', 'PS: 用户主目录'],
	['/usr', 'PS: 系统应用程序目录'],
	['/boot', 'PS: 系统启动核心目录'],
	['/lib', 'PS: 系统资源文件类库目录'],
	['/mnt', 'PS: 存放临时的映射文件系统'],
	['/www', 'PS: 宝塔面板程序目录'],
	['/bin', 'PS: 存放二进制可执行文件目录'],
	['/dev', 'PS: 存放设备文件目录'],
	['/www/wwwlogs', 'PS: 默认网站日志目录'],
	['/www/server', 'PS: 宝塔软件安装目录'],
	['/www/wwwlogs', 'PS: 网站日志目录'],
	['/www/Recycle_bin', 'PS: 回收站目录,勿动'],
	['/www/server/panel', 'PS: 宝塔主程序目录，勿动'],
	['/www/server/panel/plugin', 'PS: 宝塔插件安装目录'],
	['/www/server/panel/BTPanel', 'PS: 宝塔面板前端文件'],
	['/www/server/panel/BTPanel/static', 'PS: 宝塔面板前端静态文件'],
	['/www/server/panel/BTPanel/templates', 'PS: 宝塔面板前端模板文件'],
	[getCookie('backup_path'), 'PS: 默认备份目录'],
	[getCookie('sites_path'), 'PS: 默认建站目录'],
])

// 推荐功能
export const recomList = ref([
	{ name: '收藏夹', ename: 'favorite', callback: () => openSearchRecom('favorite') },
	{ name: '文件分享', ename: 'fileShare', callback: () => openSearchRecom('fileShare') },
	{ name: '文件同步', ename: 'fileSync', callback: () => openSearchRecom('fileSync') },
	{ name: '企业级防篡改', ename: 'tamperProof', callback: () => openSearchRecom('tamperProof') },
	{ name: '文件内容搜索', ename: 'fileSearch', callback: () => openSearchRecom('fileSearch') },
])

/**
 * @description 打开搜索推荐
 */
const openSearchRecom = (val: string) => {
	const { openPlugin } = FILES_STORE()
	switch (val) {
		case 'favorite':
			ManageFavoritesView()
			break
		case 'fileShare':
			ShareListView()
			break
		case 'fileSync':
			openPlugin('rsync', 70)
			break
		case 'tamperProof':
			openPlugin('tamper_core', 75)
			break
		case 'fileSearch':
			FileSearchView()
			break
	}
}

export const exts: string[] = [
	'folder',
	'folder-unempty',
	'sql',
	'c',
	'cpp',
	'cs',
	'flv',
	'css',
	'js',
	'htm',
	'html',
	'java',
	'log',
	'mht',
	'php',
	'url',
	'xml',
	'ai',
	'bmp',
	'cdr',
	'gif',
	'ico',
	'jpeg',
	'jpg',
	'JPG',
	'png',
	'psd',
	'webp',
	'ape',
	'avi',
	'mkv',
	'mov',
	'mp3',
	'mp4',
	'mpeg',
	'mpg',
	'rm',
	'rmvb',
	'swf',
	'wav',
	'webm',
	'wma',
	'wmv',
	'rtf',
	'docx',
	'fdf',
	'potm',
	'pptx',
	'txt',
	'xlsb',
	'xlsx',
	'7z',
	'cab',
	'iso',
	'rar',
	'zip',
	'gz',
	'war',
	'bt',
	'tgz',
	'file',
	'apk',
	'bookfolder',
	'folder-empty',
	'fromchromefolder',
	'documentfolder',
	'fromphonefolder',
	'mix',
	'musicfolder',
	'picturefolder',
	'videofolder',
	'sefolder',
	'access',
	'mdb',
	'accdb',
	'fla',
	'doc',
	'docm',
	'dotx',
	'dotm',
	'dot',
	'pdf',
	'ppt',
	'pptm',
	'pot',
	'xls',
	'csv',
	'xlsm',
	'py',
	'sh',
	'json',
	'lua',
	'bt_split',
	'bt_split_json',
]

export const fileType = {
	sql: 'sql',
	css: 'css',
	js: 'js',
	html: 'html',
	java: 'java',
	php: 'php',
	xml: 'xml',
	bmp: 'bmp',
	cdr: 'cdr',
	gif: 'gif',
	ico: 'ico',
	jpeg: 'jpeg',
	jpg: 'jpg',
	JPG: 'jpg',
	png: 'png',
	webp: 'webp',
	avi: 'avi',
	mkv: 'mkv',
	mov: 'mov',
	mp3: 'mp4',
	mp4: 'mp4',
	mpeg: 'mpeg',
	mpg: 'mpg',
	rm: 'rm',
	rmvb: 'rmvb',
	swf: 'swf',
	webm: 'webm',
	wma: 'wma',
	wmv: 'wmv',
	'7z': 'compress',
	rar: 'compress',
	zip: 'compress',
	gz: 'compress',
	war: 'compress',
	tgz: 'compress',
	'tar.gz': 'compress',
	iso: 'iso',
	apk: 'apk',
	access: 'access',
	doc: 'doc',
	pdf: 'pdf',
	ppt: 'ppt',
	xls: 'xls',
	bt_split: 'split',
	bt_split_json: 'join',
	javascript: 'js',
	json: 'json',
	log: 'log',
	lua: 'lua',
	py: 'py',
	python: 'py',
	recycle: 'recycle',
	flac: 'flac',
	sh: 'sh',
} as any

export const fileMainType: any = {
	images: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tiff', 'ico', 'JPG', 'webp'],
	compress: ['zip', 'rar', 'gz', 'war', 'tgz', '7z', 'tar.gz', 'tar'],
	video: ['mp4', 'mp3', 'mpeg', 'mpg', 'mov', 'avi', 'webm', 'mkv', 'mkv', 'mp3', 'rmvb', 'wma', 'wmv', 'flac', 'mov'],
	ont_text: ['iso', 'xlsx', 'xls', 'doc', 'docx', 'tiff', 'exe', 'so', 'bz', 'dmg', 'apk', 'pptx', 'ppt', 'xlsb', 'pdf'],
}

/**
 * @description 文件任务队列
 */
export const fileTaskDialog = (callback?: AnyFunction): Promise<any> => {
	const { instance } = storeToRefs(FILES_TASK_STORE())
	instance.value = useDialog({
		title: `实时任务队列`,
		area: 51,
		component: () => import('@files/views/file-task/index.vue'),
		compData: { callback: isFunction(callback) ? callback : undefined },
		modal: false,
	})
	return instance.value
}

/**
 * @description 文件内容搜索
 */
export const FileSearchView = (): Promise<any> =>
	useDialog({
		title: `文件内容搜索`,
		area: 105,
		component: () => import('@files/views/file-content-search/index.vue'),
	})

/**
 * @description 创建软链接
 * @returns {Promise<any>}
 */
export const symbolicLinkView = (): Promise<any> => {
	const store = FILES_CREATE_SYMBOLIC_LINK_STORE()
	const { onConfirm } = store
	return useDialog({
		title: `创建软链接`, //【string】 title，组件标题，为空不显示或false，可为空
		area: 50, // 【number、string、array<number/string>】视图大小，支持数组[宽，高]，默认单位rem
		btn: ['确认', '关闭'], // 【string、array<string>】支持字符串和数组，布尔值，"确认"和"取消"按钮 ，可为空
		component: () => import('@files/views/create-symbolic-link/index.vue'), // 组件引入
		onConfirm,
	})
}

/**
 * @description 管理收藏夹
 * @returns {Promise<any>}
 */
export const ManageFavoritesView = (): Promise<any> => {
	const store = FILES_FAVORITES_MANAGE_STORE()
	const { instance } = storeToRefs(store)
	instance.value = useDialog({
		title: `管理收藏夹`,
		area: 85,
		component: () => import('@files/views/favorites-manage/index.vue'),
	})
	return instance.value
}

/**
 * @description 分享列表
 * @returns {Promise<any>}
 */
export const ShareListView = (): Promise<any> =>
	useDialog({
		title: `分享列表`,
		area: 85,
		component: () => import('@files/views/share-list/index.vue'),
	})

/**
 * @description 分享文件
 * @param {FileDataProps} fileItem 文件信息
 * @returns {Promise<any>}
 */
export const FileSetShareView = (data: FileDataProps): Promise<any> => {
	const store = FILES_SHARE_STORE()
	const { fileItem } = storeToRefs(store)
	const { onConfirm } = store
	fileItem.value = data
	return useDialog({
		title: `设置分享文件[ ${data.fileName} ]`,
		area: 45,
		btn: '生成外链',
		component: () => import('@files/public/share/index.vue'),
		onConfirm,
		// compData: { fileItem },
	})
}

/**
 * @description 外链分享详情
 * @returns {Promise<any>}
 */
export const ShareDetailView = (row: any, isShareList?: boolean): Promise<any> => {
	const store = FILES_SHARE_STORE()
	const { compData } = storeToRefs(store)
	const { onConfirmDetail } = store
	compData.value = { ...row, isShareList }
	return useDialog({
		title: `外链分享-[${row.path ? row.path : row.filename}]`,
		btn: '关闭分享外链',
		confirmBtnType: 'danger',
		area: 55,
		component: () => import('@files/public/share/detail.vue'),
		// compData: { ...row, isShareList },
		onConfirm: onConfirmDetail,
	})
}

/**
 * @description 文件同步
 * @returns {Promise<any>}
 */
export const fileRsyncView = (row: any): Promise<any> => {
	const store = FILES_RSYNC_STORE()
	const { compData } = storeToRefs(store)
	compData.value = { row }
	return useDialog({
		title: `【${row.path}】设置数据同步`,
		area: 56,
		component: () => import('@files/public/file-rsync/index.vue'),
		compData: { row },
	})
}

/**
 * @description 文件操作记录
 * @returns {Promise<any>}
 */
export const FileOperationRecordView = (): Promise<any> =>
	useDialog({
		title: `文件操作记录`,
		area: 80,
		component: () => import('@files/views/file-operation-record/index.vue'),
		compData: {},
	})

/**
 * @description 文件属性
 * @param {FileDataProps} fileItem 文件信息
 * @param {string} tab 活跃tab
 * @returns {Promise<any>}
 */
export const FileStatusDetailView = (data: FileDataProps, tab: string): Promise<any> => {
	const { activeName, fileItem } = storeToRefs(FILES_DETAIL_STORE())
	activeName.value = tab
	fileItem.value = data
	return useDialog({
		title: `[ ${data.fileName} ] - 文件属性`,
		area: 58,
		component: () => import('@files/public/file-deatil/index.vue'),
		// compData: { fileItem, tab },
	})
}

/**
 * @description 压缩文件
 * @param {FileDataProps} fileItem 文件信息
 * @returns {Promise<any>}
 */
export const FileCompressView = (data: FileDataProps | FileDataProps[]): Promise<any> => {
	const store = FILES_COMPRESS_STORE()
	const { fileItem } = storeToRefs(store)
	const { onConfirm } = store
	fileItem.value = data
	return useDialog({
		title: `压缩文件`,
		area: 48,
		btn: '压缩',
		component: () => import('@files/public/compress/index.vue'),
		// compData: { fileItem },
		onConfirm,
	})
}

/**
 * @description 解压文件
 * @param {FileDataProps} fileItem 文件信息
 * @returns {Promise<any>}
 */
export const FileDecompressionView = (data: FileDataProps): Promise<any> => {
	const store = FILES_DECOMPRESSION_STORE()
	const { fileItem } = storeToRefs(store)
	const { onConfirm } = store
	fileItem.value = data
	return useDialog({
		title: `解压文件[ ${data.fileName} ]`,
		area: 48,
		btn: '解压',
		component: () => import('@files/public/decompression/index.vue'),
		// compData: { fileItem },
		onConfirm,
	})
}

/**
 * @description 文件拆分
 * @param {FileDataProps} fileItem 文件信息
 * @returns {Promise<any>}
 */
export const FileSplitView = (data: FileDataProps): Promise<any> => {
	const store = FILES_SPLIT_STORE()
	const { fileItem } = storeToRefs(store)
	const { onConfirm } = store
	fileItem.value = data
	return useDialog({
		title: `【${data.fileName}】文件拆分`,
		area: 55,
		btn: '确定',
		component: () => import('@files/public/file-split/index.vue'),
		// compData: { fileItem },
		onConfirm,
	})
}

/**
 * @description 文件合并
 * @param {FileDataProps} fileItem 文件信息
 * @returns {Promise<any>}
 */
export const FileMergeView = (data: FileDataProps): Promise<any> => {
	const store = FILES_MERGE_STORE()
	const { fileItem } = storeToRefs(store)
	const { onConfirm } = store
	fileItem.value = data
	return useDialog({
		title: `合并【${data.fileName}】文件`,
		area: 44,
		btn: '确定',
		component: () => import('@files/public/file-merge/index.vue'),
		// compData: { fileItem },
		onConfirm,
	})
}

/**
 * @description 发送至邮箱
 * @param {FileDataProps} fileItem 文件信息
 * @returns {Promise<any>}
 */
export const SendEmailView = (data: FileDataProps): Promise<any> => {
	const store = FILES_SEND_EMAIL_STORE()
	const { fileItem } = storeToRefs(store)
	const { onConfirm } = store
	fileItem.value = data
	return useDialog({
		title: `发送至邮箱`,
		area: 50,
		btn: '发送',
		component: () => import('@files/public/send-email/index.vue'),
		// compData: { fileItem },
		onConfirm,
	})
}

/**
 * @description 格式转换
 * @param {FileDataProps} fileItem 文件信息
 * @returns {Promise<any>}
 */
export const FileFormatConversionView = (data: FileDataProps | FileDataProps[]): Promise<any> => {
	const store = FILES_FORMAT_CONVERSION_STORE()
	const { instance } = storeToRefs(store)
	instance.value = useDialog({
		title: `文件格式转换`,
		area: 78,
		component: () => import('@files/views/file-format-conversion/index.vue'),
	})
	return instance.value
}

/**
 * @description 压缩预览
 * @param {FileDataProps} fileItem 文件信息
 * @returns {Promise<any>}
 */
export const FileCompressPreview = (data: FileDataProps) => {
	const store = FILES_COMPRESS_PREVIEW_STORE()
	const { fileItem, instance } = storeToRefs(store)
	fileItem.value = data
	instance.value = useDialog({
		title: `压缩预览 --【${data.fileName}】`,
		area: 74,
		component: () => import('@files/views/compress-preview/index.vue'),
	})
}

/**
 * @description getViewportWidth: 获取可用视口宽度
 * 功能说明：
 *  - 尝试获取 id="layout-footer" 元素的宽度，若元素不存在则宽度为 0
 *  - 尝试获取 id="layout-main" 元素的宽度，若元素不存在则宽度为 0
 *  - 优先使用 footerWidth，否则使用 laymainWidth
 *  - 减去固定左右边距 32px 后返回最终宽度
 *
 * @returns {number} 可用视口宽度（px）
 */
export const getViewportWidth = (): number => {
	const footer = document.getElementById('layout-footer')
	const footerRect = footer?.getBoundingClientRect()
	const footerWidth = footerRect?.width || 0
	const laymain = document.getElementById('layout-main')
	const laymainRect = laymain?.getBoundingClientRect()
	const laymainWidth = laymainRect?.width || 0
	return (footerWidth || laymainWidth) - 32
}

/**
 * @description 文件编辑器
 * @param {FileDataProps} fileItem 文件信息
 * @param {AnyFunction} callback 回调函数
 * @returns {Promise<any>}
 */
export const FilesAceEditor = async (data: FileDataProps, callback?: AnyFunction): Promise<any> => {
	const { fileItem, instance } = storeToRefs(FILES_ACE_STORE())
	const { onCancel } = FILES_ACE_STORE()
	const { fileItem: fileItemMobile, instance: instanceMobile } = storeToRefs(FILES_ACE_MOBILE_STORE())
	const currentPageWidth = getViewportWidth()
	fileItem.value = data
	fileItemMobile.value = data
	// isMobile() ||
	// mainWidth.value < 1280 ? '100vh' : (mainHeight.value - 100) / 10
	const overlays = document.querySelectorAll('.el-overlay')
	const lastOverlay = overlays[overlays.length - 1]
	const zIndex = lastOverlay ? window.getComputedStyle(lastOverlay).zIndex : null

	const dialogInstance = useDialogV2({
		title: `在线文本编辑器`,
		area: currentPageWidth < 1280 ? '100vw' : 143,
		customClass: 'dialog-editor',
		zIndex: zIndex ? parseInt(zIndex) + 1 : 2012,
		component: () => {
			return import('@files/public/ace/index.vue')
		},
		fullscreen: true,
		compData: { data, callback },
		onCancel: onCancel,
	})

	// 同时给两个instance赋值
	instance.value = dialogInstance
	instanceMobile.value = dialogInstance

	// return popup
}

/**
 * @description 文件历史版本
 * @returns {Promise<any>}
 */
export const FilesHistoryRecordView = (): Promise<any> =>
	useDialog({
		title: `文件历史版本`,
		area: 75,
		component: () => import('@files/public/ace/history-record/index.vue'),
	})

/**
 * @description 导入数据库
 * @param {FileDataProps} fileItem 文件信息
 * @returns {Promise<any>}
 */
export const FileInputDatabaseView = (data: FileDataProps): Promise<any> => {
	const store = FILES_IMPORT_DATABASE_STORE()
	const { fileItem } = storeToRefs(store)
	const { onConfirm } = store
	fileItem.value = data
	return useDialog({
		title: `导入数据库`,
		area: 40,
		btn: '确定',
		component: () => import('@files/views/import-database/index.vue'),
		onConfirm,
	})
}

/**
 * @description 图片预览
 * @param {FileDataProps} fileItem 文件信息
 * @returns {Promise<any>}
 */
export const FileImageView = (data: FileDataProps): Promise<any> => {
	const { fileItem } = storeToRefs(FILES_IMAGE_PREVIEW_STORE())
	fileItem.value = data
	return useDialog({
		area: 75,
		component: () => import('@files/views/image-preview/index.vue'),
	})
}

/**
 * @description 编辑文件
 * @param {string} data 文件内容
 * @param {FileDataProps} fileItem 文件信息
 * @param {FileDataProps} fileItem 文件名称
 * @returns {Promise<any>}
 */
export const editFilesDialog = (data: string, fileItem: FileDataProps, name: string, path: string): Promise<any> => {
	const store = FILES_EDIT_STORE()
	const { compData } = storeToRefs(store)
	const { onConfirm } = store
	compData.value = { data, fileItem, name, path }
	return useDialog({
		title: '在线编辑',
		area: 65,
		btn: '保存',
		component: () => import('@files/public/file-edit/index.vue'),
		// compData: { data, fileItem, name, path },
		onConfirm,
	})
}

/**
 * @description 防篡改
 * @param {string} data 表格信息
 * @returns {Promise<any>}
 */
export const temperDialog = (data: any, temp_data?: any): Promise<any> => {
	const store = FILES_TAMPER_STORE()
	const { compData } = storeToRefs(store)
	const { onConfirm } = store
	compData.value = { data, temp_data }
	return useDialog({
		title: `【${data.path}】配置`,
		area: 40,
		btn: true,
		component: () => import('@files/views/file-tamper/index.vue'),
		onConfirm,
	})
}

/**
 * @description 视频播放
 * @returns {Promise<any>}
 */
export const videoPlayDialog = (data: AnyObject): Promise<any> => {
	const { videoUrl } = storeToRefs(FILES_VIDEO_STORE())
	videoUrl.value = data.path
	return useDialog({
		title: '视频播放',
		area: 89,
		component: () => import('@files/public/video/index.vue'),
		// compData: { type: data.ext, src: data.path }
	})
}

/**
 * @description 文件终端
 * @returns {Promise<any>}
 */
export const CreateTerminalDialog = (): Promise<any> => {
	const { instance } = storeToRefs(FILES_TERMINAL_STORE())
	instance.value = useDialog({
		title: '宝塔终端',
		area: [80, 50],
		component: () => import('@files/public/file-terminal/index.vue'),
	})
	return instance.value
}

/**
 * @description 解压重复文件
 * @param {FileDataProps} data 重复文件信息
 * @param {FileDataProps} params 解压文件信息
 * @param {AnyFunction} callback 回调函数
 * @returns {Promise<any>}
 */
export const FilesCompressCoverView = (data: any, params: any, callback?: AnyFunction): Promise<any> => {
	const store = FILES_COMPRESS_STORE()
	const { compData, instance } = storeToRefs(store)
	compData.value = { data, params, callback }
	instance.value = useDialog({
		title: false,
		area: 70,
		component: () => import('@files/public/compress/cover/index.vue'),
		// compData: { data, params, callback },
	})
	return instance.value
}

/**
 * @description 上传下载云存储文件
 * @param {FileDataProps} data.type 上传下载类型 【upload、down】
 * @param {FileDataProps} data.pName 插件名称
 * @param {FileDataProps} data.zName 插件中文名称
 */
export const cloudStorageDialog = (data: any): Promise<any> => {
	const store = FILES_CLOUD_STORAGE_STORE()
	const { compData, instance } = storeToRefs(store)
	const { onConfirm } = store
	compData.value = data
	instance.value = useDialog({
		title: `${data.type === 'upload' ? '上传到' + data.zName : '从' + data.zName + '下载【勾选需要下载的文件】'}`,
		area: 70,
		btn: [data.type === 'upload' ? '上传' : '下载', '取消'],
		component: () => import('@files/views/cloud-storage/index.vue'),
		onConfirm,
	})
	return instance.value
}

/**
 * @description 批量设置权限
 * @param {FileDataProps} dataList 权限列表
 */
export const BatchSetAuth = (dataList: any): Promise<any> => {
	const store = FILES_BATCH_SET_AUTH_STORE()
	const { fileList } = storeToRefs(store)
	const { setFileAuths } = store
	fileList.value = dataList.map((item: any) => item.fileName)
	return useDialog({
		title: `设置权限【批量】`,
		area: 45,
		component: () => import('@files/views/batch-set-auth/index.vue'),
		btn: true,
		onConfirm: setFileAuths,
	})
}

/**
 * @description 编辑器界面离开提示
 * @returns {Promise<any>}
 */
export const editorLeaveDialog = (parentClose: AnyFunction): Promise<any> => {
	const { onConfirmCheckFile, onCancelCheckFile } = FILES_ACE_STORE()
	return useDialog({
		title: '温馨提示',
		area: [35, 9],
		btn: ['保存', '不保存'],
		component: () => import('@files/public/ace/check-file-change/index.vue'),
		// compData: { close },
		separationCancelClose: true,
		onConfirm: (close: any) => {
			onConfirmCheckFile()
			parentClose()
		},
		onCancel: (close: any) => {
			onCancelCheckFile(close)
			parentClose()
		},
	})
}

/**
 * @description 编辑器tab关闭提示
 * @returns {Promise<any>}
 */
export const editorCloseDialog = (type: string, item?: any): Promise<any> => {
	const store = FILES_ACE_STORE()
	const { compDataClose } = storeToRefs(store)
	const { onConfirmClose, onCancelClose } = store
	compDataClose.value = { type, item }
	return useDialog({
		title: '温馨提示',
		area: [35, 9],
		btn: ['保存', '不保存'],
		component: () => import('@files/public/ace/check-file-close/index.vue'),
		// compData: { type, item },
		separationCancelClose: true,
		onConfirm: onConfirmClose,
		onCancel: onCancelClose,
	})
}

/**
 * @description 新增tab标签并跳转
 * @param {string} obj.path 路径
 * @param {Function} callback 回调函数
 */
export const addTabEvent = ({ path, name }: { path: string; name?: string }, callback?: AnyFunction) => {
	const store = FILES_STORE()
	const { fileTabList, fileTabActive, disabledCutTab, fileTabActiveData } = storeToRefs(store)
	if (!path) return
	if (disabledCutTab.value) return
	// if (!isAddTabs.value) {
	// 	Message.error('当前标签页已达上限，请关闭部分标签页后再试！')
	// 	return
	// }

	let label: any = path
	let sPath: string = path
	if (label === '/') {
		label = '根目录'
	} else {
		// 检测字段的最后一个字符是否为 '/'，如果是则删除
		if (sPath[sPath.length - 1] === '/') {
			sPath = sPath.slice(0, sPath.length - 1)
		}
		label = path.split('/').pop()
	}
	if (name) label = name
	const tab = {
		id: getRandomPwd(),
		label,
		type: fileTabActiveData.value.type, // 视图模式,延续当前标签的视图模式
		loading: false, // 加载状态
		total: 0, // 总条数
		list: [], // 文件列表
		param: {
			// 表格数据
			p: 1, // 当前页
			showRow: 500, // 每页显示条数
			path: sPath,
		},
	}
	disabledCutTab.value = true
	fileTabList.value.push(tab as FileTabProps)
	fileTabActive.value = fileTabList.value.length - 1 // 切换标签
	nextTick(() => {
		store.updateTabActiveData() // 更新标签数据
		store.refreshFilesList() // 刷新文件列表
		callback && callback(tab)
	})
}

/**
 * @description 匹配非法字符
 * @param {string} path 配置对象
 * @return 返回匹配结果
 */
export const matchUnqualifiedString = (path: string) => {
	var containSpecial = RegExp(/[\*\|\:\\\"\/\<\>\?]+/)
	return containSpecial.test(path)
}

/**
 * @description 拼接获取完整路径
 * @param {string} paths 要与当前路径拼接的路径
	returns {string} 返回拼接后的路径
 */
export const getWholePath = (paths: string) => {
	const { fileTabActiveData } = storeToRefs(FILES_STORE())
	return toRepeatPath(fileTabActiveData.value.param.path + '/' + paths)
}

/**
 * @description 路径去重
 * @param {string} path 路径
 */
export const toRepeatPath = (path: string) => {
	return path.replace('//', '/')
}

/**
 *@description 路径跳转
 * @param {string} path 跳转的完整路径
 */
export const pathJumpEvent = async (path: string) => {
	const pathInfo = path.replace(/\/+$/, '') || '/'
	const pathData = path_check(pathInfo)
	if (path === '/.Recycle_bin' || path === '/www/.Recycle_bin') {
		Message.error('此为回收站目录，请在右上角按【回收站】按钮打开')
		return false
	}
	const store = FILES_STORE()
	const { fileTabActiveData, searchVal } = storeToRefs(store)
	fileTabActiveData.value.param.p = 1 // 重置页码
	store.updateTabActiveData({ param: { path: pathData, search: '' } })
	store.refreshFilesList()
	return pathData
}

/**
 * @descripttion: 路径过滤
 * @return: 无返回值
 */
export const path_check = (path: string) => {
	// 过滤多个\为/
	path = path.replace(/\\/g, '/')
	// 过滤多个/为一个/
	path = path.replace('//', '/')
	if (path === '/') return path
	path = path.replace(/\/+$/g, '')
	return path
}

/**
 * @description 获取文件类型
 * @param {string} type 文件类型
 * @returns {string} 返回文件类型
 */
export const getDataType = (type: any) => {
	if (type === 'dir') return '文件夹'
	return '文件'
}

/**
 *@description 文件重命名
 * @param {FileDataProps} fileItem 重命名文件的数据
 * @param {Function} callback 回调函数(表格组件的editRow方法,打开表格编辑状态)
 */
export const fileReName = (fileItem: FileDataProps, callback: AnyFunction) => {
	fileItem.isReName = true
	callback && callback(fileItem)
}

/**
 * @description xss过滤文件名
 * @param fileName 文件名
 * @returns 过滤后的文件名
 */
const filterFileName = (fileName: string) => {
	// 创建一个临时的 DOM 元素
	const temp = document.createElement('div')
	temp.textContent = fileName
	console.log(temp.innerHTML)
	return temp.innerHTML
}

/**
 *@description 删除文件/文件夹
 * @param {FileDataProps} fileItem 删除文件的数据
 */
export const delFileEvent = async (fileItem: FileDataProps, callback?: AnyFunction): Promise<void> => {
	const filesStore = FILES_STORE()
	const { recyclingBinStatus } = storeToRefs(filesStore)
	const { watchDeleteFileData } = filesStore
	if (recyclingBinStatus.value === null) {
		const { data } = await getRecyclingBin({
			type: 'all',
			search: '',
			time_search: JSON.stringify([]),
		})
		recyclingBinStatus.value = data.status
	}
	const msg = recyclingBinStatus.value
		? `删除【${filterFileName(fileItem.fileName)}】${fileItem.type === 'file' ? '文件' : '文件夹'}后，该文件将迁移至文件回收站，如需彻底删除请前往文件回收站，是否继续操作？`
		: `风险操作，当前未开启文件回收站，删除的【${filterFileName(fileItem.fileName)}】${fileItem.type === 'file' ? '文件' : '文件夹'}将彻底删除，无法恢复，是否继续操作？`
	await useConfirm({
		title: `删除${getDataType(fileItem.type)}【${filterFileName(fileItem.fileName)}】`,
		isHtml: true,
		type: recyclingBinStatus.value ? 'default' : 'calc',
		content: '<div class="break-all">' + msg + '<div>' + (fileItem.isShare ? '<span class="text-danger">当前文件已开启【外链分享】，请谨慎操作！</span>' : ''),
	})
	await useDataHandle({
		loading: '正在删除，请稍后...',
		request: deleteFile({
			path: getWholePath(fileItem.fileName),
			type: fileItem.type,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) {
				watchDeleteFileData(fileItem)
			}
			callback && callback()
		},
	})
}

/**
 *@description  添加收藏
 * @param {FileDataProps} fileItem 添加收藏的文件
 * @param {AnyFunction} callback 回调函数
 */
export const addFavorites = async (fileItem: FileDataProps, callback?: AnyFunction) => {
	const res = await addFileFavorites({ path: getWholePath(fileItem.fileName) })
	if (res.status) {
		Message.success(res.msg)
		callback && callback()
	} else {
		Message.error(res.msg)
	}
	// 刷新收藏列表
	getFavoriteList()
}

export const fileUploadDialog = ref<any>(null)

/**
 * @description: 文件上传
 */
export const openFilesUpload = () => {
	const { fileTabActiveData } = storeToRefs(FILES_STORE())
	if (fileTabActiveData.value.param.path === '/') {
		Message.error('不能直接上传文件到系统根目录!')
		return
	}
	fileUploadDialog.value = useDialog({
		title: `上传文件到【${fileTabActiveData.value.param.path}】 --支持断点续传`,
		area: '72',
		component: () => import('@components/business/bt-file-upload/index.vue'),
		compData: {
			path: fileTabActiveData.value.param.path,
		},
		onCancel: () => {
			fileUploadDialog.value = null
		},
	})
}

/**
 *@description  取消收藏
 * @param {FileDataProps} fileItem 取消收藏的文件
 * @param {AnyFunction} callback 回调函数
 */
export const delFavorites = async (fileItem: FileDataProps, callback?: AnyFunction) => {
	const res = await delFileFavorites({ path: getWholePath(fileItem.fileName) })
	if (res.status) {
		Message.success(res.msg)
		callback && callback()
	} else {
		Message.error(res.msg)
	}
	// 刷新收藏列表
	getFavoriteList()
}

/**
 * @description 置顶/取消置顶
 * @param {FileDataProps} fileItem 文件
 * @param {string} type set置顶  unset取消置顶
 */
export const setToping = async (fileItem: FileDataProps, type: string) => {
	const store = FILES_STORE()
	const res = await setFileToping({
		path: getWholePath(fileItem.fileName),
		type,
	})
	if (res.status) {
		Message.success(res.msg)
	} else {
		Message.error(res.msg)
	}
	// 刷新文件列表
	store.refreshFilesList()
}

/**
 *@description   创建副本
 * @param {FileDataProps} fileItem 文件
 */
export const createCopy = async (fileItem: FileDataProps) => {
	const store = FILES_STORE()
	const res = await createCopyFiles({ path: getWholePath(fileItem.fileName) })
	if (res.status) {
		Message.success(res.msg)
	} else {
		Message.error(res.msg)
	}
	// 刷新文件列表
	store.refreshFilesList()
}

/**
 *@description 清除本地剪切板数据
 */
export const removeCopyOrCutData = () => {
	const { copyFilesData } = storeToRefs(FILES_STORE())
	copyFilesData.value = {
		files: [],
		type: '',
	}
}

/**
 * @description 重复文件提示
 * @param {string} type 类型 paste粘贴重复
 * @returns {Promise<any>}
 */
export const repetFileView = (fileData: any, type: string) => {
	const store = FILES_OVERLAY_TIPS_STORE()
	const { compData } = storeToRefs(store)
	compData.value = { fileData, type }
	useDialog({
		title: `重复文件提示`,
		area: 40,
		btn: ['确认', '取消'],
		component: () => import('@files/views/file-overlay-tips/index.vue'),
	})
}

/**
 * @description 回收站
 */
export const FileRecyclingBinView = (type?: string): Promise<any> => {
	const { activeName, compData } = storeToRefs(FILES_RECYCLE_BIN_STORE())
	activeName.value = type === 'database' ? 'db' : 'all'
	compData.value = { type }
	return useDialog({
		title: `回收站`,
		area: 110,
		component: () => import('@files/public/recycle-bin/index.vue'),
		// compData: { type },
	})
}

// 获取文件图标
export const getExtIcon = (fileName: string, type: string) => {
	if (type === 'dir') return 'folder'
	const extArr = fileName.split('.')
	const extLastName = extArr[extArr.length - 1]
	for (let i = 0; i < exts.length; i++) {
		if (exts[i] == extLastName) {
			return exts[i]
		}
	}
	return 'file'
}

/**
 * @description 获取文件类型
 * @param ext 文件后缀
 */
export const determineFileType = (ext: string) => {
	let returnVal: string = 'text'
	if (ext) ext = ext.toLowerCase()
	Object.entries(fileMainType).forEach(([key, item]: [string, any]) => {
		item.forEach((items: string) => {
			if (items == ext) {
				returnVal = key
			}
		})
	})
	return returnVal
}

/**
 *@description   粘贴单个文件
 */
export const pasteFiles = async () => {
	const store = FILES_STORE()
	const { fileTabActiveData, copyFilesData } = storeToRefs(store)
	let load: any = null
	// 获取要粘贴的文件
	const fileItem = copyFilesData.value.files[0]
	// 获取要粘贴文件的原路径
	const pastePath = getWholePath(fileItem.fileName)
	// 如果粘贴在自身目录下，就不允许粘贴
	if (fileItem.type === 'dir' && fileTabActiveData.value.param.path.indexOf(pastePath + '/') > -1) {
		Message.error(`错误的复制逻辑，从${pastePath}粘贴到${fileTabActiveData.value.param.path}有包含关系，存在无限循环复制风险!`)
		return false
	}
	const params: any = {
		path: fileTabActiveData.value.param.path,
	}
	if (copyFilesData.value.files.length === 1) {
		// 单个文件
		params.name = fileItem.fileName
	}
	const { data } = await checkExistsFiles(params)
	if (data.length > 0) {
		// 如果存在同名文件，就提示是否覆盖或重命名
		repetFileView(data, copyFilesData.value.files.length > 1 ? 'batch' : 'single')
		return false
	} else {
		delayRequest() // 延迟请求实时任务[粘贴]、提前返回则清除定时器
		try {
			load = Message.load('正在粘贴，请稍候...')
			// 多个粘贴
			if (copyFilesData.value.files.length > 1) {
				const res = await fileBatchPaste({
					type: copyFilesData.value.type === 'copy' ? 1 : 2,
					path: fileTabActiveData.value.param.path,
				})
				Message.request(res)
				copyFilesData.value.files = []
				// 清除剪切板数据
				removeCopyOrCutData()
			} else {
				// 单个粘贴
				// 如果不存在同名文件，就直接粘贴
				let oldPath = fileItem.path
				const params: any = {
					sfile: oldPath,
					dfile: pastePath,
				}
				const res = copyFilesData.value.type === 'copy' ? await setCopyFiles(params) : await cutFiles(params)
				if (res.status) {
					copyFilesData.value.type === 'copy' ? Message.success(res.msg) : Message.success('剪切成功')
					copyFilesData.value.files = []
					// 清除剪切板数据
					removeCopyOrCutData()
				} else {
					Message.error(res.msg)
				}
			}
		} finally {
			if (load) load.close()
			// 清除定时器【粘贴】
			clearTimeout(taskTimer)
			// 刷新文件列表
			store.refreshFilesList()
		}
	}
}

// 临时定时器
let taskTimer: any = null
/**
 * @description 延迟请求实时任务
 */
const delayRequest = () => {
	const { getRealTask } = FILES_STORE()
	taskTimer = setTimeout(() => {
		getRealTask() // 获取实时任务队列
	}, 1500)
}

/**
 * @description: 打开对应编辑器视图
 * @param {any} fileItem 文件信息
 */
export const openEditorView = async (fileItem: any) => {
	await useEditorLoading()
	await openAceEditor(fileItem)
	await setFileHistory({ name: fileItem.fileName, path: fileItem.path })
	await useEditorUnLoading()
}

/**
 *@description  复制/剪切单个文件
 * @param {FileDataProps} fileItem 文件
 * @param {string} type 操作类型 copy复制 cut剪切
 */
export const copyFiles = (fileItem: FileDataProps, type: string) => {
	const { copyFilesData } = storeToRefs(FILES_STORE())
	// 获取要复制文件的原路径
	fileItem.path = getWholePath(fileItem.fileName)
	copyFilesData.value.files = [fileItem]
	copyFilesData.value.type = type
	Message.success(`${type === 'copy' ? '复制' : '剪切'}成功，请在目标目录点击右上角【粘贴】按钮!`)
}

/**
 *@description   根据路径打开文件编辑器
 * @param {string} path 完整文件路径
 * @param {AnyFunction} callback 回调函数
 */
export const openAceEditor = async (fileItems: FileDataProps, callback?: AnyFunction) => {
	const { unbindKeydown } = FILES_STORE()
	unbindKeydown() // 解绑键盘事件
	const fileItem: any = {
		path: fileItems.path,
		title: fileItems.path.split('/').pop(),
		size: fileItems.size,
		type: 'editor',
	}

	if (fileItems?.path?.includes('/dev/pts')) {
		Message.error('系统目录文件不支持编辑')
		return
	}
	if (determineFileType(fileItem.fileName?.split('.').pop()) !== 'text') {
		Message.error('暂不支持该类型文件编辑')
		return
	}
	const minimizeIcon = document.querySelector('.bt-dialog-header .svgtofont-icon-minmax-black')
	if (minimizeIcon?.closest('.icon')?.dataset.state === 'minimize') {
		minimizeEvent(fileItem)
		return
	}
	if (editorExample.value) {
		useCreateEditorTabs(fileItem)
		return
	}
	// openEditorView(fileItem)
	await useEditorLoading()
	FilesAceEditor(fileItem, callback)
}

/**
 * @description 打开文件
 * @param {FileDataProps} fileItem 文件信息
 */
export const openFile = (fileItem: FileDataProps) => {
	// const { imgPathItem } = storeToRefs(FILES_STORE())
	const { createItem } = storeToRefs(FILES_STORE())

	const { findCurrentImgIndex } = FILES_LIST_VIEW_STORE()
	createItem.value = [] // 清空新建
	if (fileItem.isNew || fileItem.isReName) return false
	// 判断是否是文件夹
	if (fileItem.type === 'dir') {
		// 如果是文件夹，就打开文件夹

		pathJumpEvent(fileItem.path)
	} else {
		// 文件类型判断
		switch (determineFileType(fileItem.ext)) {
			case 'images':
				// text = '预览'
				// FileImageView(fileItem)
				findCurrentImgIndex(window.location.protocol + '//' + window.location.host + '/download?filename=' + fileItem.path)
				// imgPathItem.value = window.location.protocol +
				// 	'//' +
				// 	window.location.host +
				// 	'/download?filename=' +
				// 	fileItem.path
				break
			case 'video':
				// text = '播放'
				// delete config['vsopen']
				videoPlayDialog(fileItem)
				break
			case 'compress':
				// text = props.row.ext.toUpperCase() + '压缩预览'
				// if (authType.value !== 'ltd') {
				// 	// 打开企业版付费
				// 	productPaymentDialog({ disablePro: true, sourceId: 171, plugin: false })
				// } else {
				// 	if (fileItem.ext === 'zip' || fileItem.ext === 'rar' || fileItem.ext === 'tar.gz') {
				// 		FileCompressPreview(fileItem)
				// 	} else {
				// 		Message.error('暂不支持该类型文件预览')
				// 	}
				// }

				deCompressFile(fileItem)
				break
			default:
				// text = '编辑'
				openAceEditor(fileItem)
				break
		}
	}
}

/**
 * @description 下载文件
 * @param {FileDataProps} fileItem 文件信息
 * @param {Function} callback 回调函数
 * @return void
 */
export const downFile = (fileItem: FileDataProps, callback?: any) => {
	window.open('/download?filename=' + encodeURIComponent(fileItem.path), '_self', 'noopener,noreferrer')
	callback && callback()
}

/**
 * @description 打开文件拆分
 * @param {FileDataProps} fileItem 文件信息
 * @param {Function} callback 回调函数
 * @return void
 */
export const openFileSplit = (fileItem: FileDataProps) => {
	FileSplitView(fileItem)
}
/**
 * @description 打开文件合并
 * @param {FileDataProps} fileItem 文件信息
 * @param {Function} callback 回调函数
 * @return void
 */
export const openFileMerge = (fileItem: FileDataProps) => {
	FileMergeView(fileItem)
}
/**
 * @description 设置外链分享
 * @param {FileDataProps} fileItem 文件信息
 * @return void
 */
export const setFileShare = (fileItem: FileDataProps) => {
	FileSetShareView(fileItem)
}

/**
 * @description 外链分享详情
 * @param {FileDataProps} fileItem 文件信息
 * @return void
 */
export const openFileShare = (fileItem: FileDataProps) => {
	ShareDetailView(fileItem)
}

/**
 * @description 文件同步
 * @param {FileDataProps} fileItem 文件信息
 * @return void
 */
export const openFileAsync = async (fileItem: FileDataProps) => {
	const { authType } = storeToRefs(FILES_STORE())
	if (authType.value !== 'ltd') {
		// 打开企业版付费
		productPaymentDialog({ disablePro: true, sourceId: 70, plugin: false })
	} else {
		fileRsyncView(fileItem)
	}
}

/**
 * @description 创建单个、批量压缩
 * @param {FileDataProps| FileDataProps[]} fileItem 文件信息
 * @return void
 */
export const createCompress = (fileItem: FileDataProps | FileDataProps[]) => {
	FileCompressView(fileItem)
}
/**
 * @description 解压
 * @param {FileDataProps} fileItem 文件信息
 * @return void
 */
export const deCompressFile = (fileItem: FileDataProps) => {
	FileDecompressionView(fileItem)
}

/**
 * @description 格式转换
 * @param {FileDataProps| FileDataProps[]} fileItem 文件信息
 * @return void
 */
export const formatFile = (data: any) => {
	const store = FILES_FORMAT_CONVERSION_STORE()
	const { fileItem } = storeToRefs(store)
	fileItem.value = data
	FileFormatConversionView(data)
}
/**
 * @description 发送至邮箱
 * @param {FileDataProps} fileItem 文件信息
 * @return void
 */
export const sendEmail = (fileItem: FileDataProps) => {
	SendEmailView(fileItem)
}
/**
 * @description 文件属性
 * @param {FileDataProps} fileItem 文件信息
 * @param {string} tab 活跃tab
 * @return void
 */
export const openDetail = (fileItem: FileDataProps, tab?: string) => {
	if (!tab) tab = 'routine'
	FileStatusDetailView(fileItem, tab)
}

/**
 * @description 上传文件
 * @return void
 */
export const uploadFiles = () => {
	openFilesUpload()
}

/**
 * @description 批量复制/剪切文件
 * @param {FileDataProps[]} arr 文件信息数组
 * @param {string} type 操作类型 copy复制 cut剪切
 * @return void
 */
export const fileBatchSet = async (arr: FileDataProps[], type: string) => {
	const { fileTabActiveData, copyFilesData } = storeToRefs(FILES_STORE())
	const parmas = {
		data: JSON.stringify(arr.map((item: FileDataProps) => item.fileName)),
		type: 0,
		path: fileTabActiveData.value.param.path,
	}
	switch (type) {
		case 'copy':
			parmas.type = 1
			break
		case 'cut':
			parmas.type = 2
			break
		default:
			break
	}
	const res = await fileBatchCopy(parmas)
	if (res.status) {
		Message.success(`${type === 'copy' ? '复制' : '剪切'}成功，请在目标目录点击右上角【粘贴】按钮!`)
		copyFilesData.value.files = arr
		copyFilesData.value.type = type
	} else {
		Message.error(res.msg)
	}
}

/**
 * @description 批量删除
 * @param {FileDataProps[]} item 文件信息数组
 * @return void
 */
export const batchDelFile = async (item: FileDataProps[]) => {
	const store = FILES_STORE()
	const { fileTabActiveData, recyclingBinStatus } = storeToRefs(FILES_STORE())
	const msg = recyclingBinStatus.value ? `删除后，文件将迁移至文件回收站，如需彻底删除请前往文件回收站，是否继续操作？` : `风险操作，当前未开启文件回收站，删除后将彻底删除，无法恢复，是否继续操作？`
	await useConfirm({
		title: `批量删除文件`,
		type: recyclingBinStatus.value ? 'default' : 'calc',
		content: msg,
	})
	await useDataHandle({
		loading: '正在删除，请稍后...',
		request: fileBatchCopy({
			data: JSON.stringify(item.map((file: FileDataProps) => file.fileName)),
			type: 4,
			path: fileTabActiveData.value.param.path,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) store.refreshFilesList()
		},
	})
}

/**
 * @description 新增tab标签并跳转
 * @param {string} obj.path 路径
 * @param {Function} callback 回调函数
 */
export const addTab = ({ path, name }: { path: string; name?: string }, callback?: AnyFunction) => {
	const store = FILES_STORE()
	const { fileTabList, disabledCutTab, fileTabActive } = storeToRefs(store)
	if (!path) return
	if (disabledCutTab.value) return
	// if (!isAddTabs.value) {
	// 	Message.error('当前标签页已达上限，请关闭部分标签页后再试！')
	// 	return
	// }

	let label: any = path
	let sPath: string = path
	if (label === '/') {
		label = '根目录'
	} else {
		// 检测字段的最后一个字符是否为 '/'，如果是则删除
		if (sPath[sPath.length - 1] === '/') {
			sPath = sPath.slice(0, sPath.length - 1)
		}
		label = path.split('/').pop()
	}
	if (name) label = name
	const tab = {
		id: getRandomPwd(),
		label,
		type: 'list', // 视图模式，默认列表模式
		loading: false, // 加载状态
		total: 0, // 总条数
		list: [], // 文件列表
		param: {
			// 表格数据
			p: 1, // 当前页
			showRow: 500, // 每页显示条数
			path: sPath,
		},
	}
	disabledCutTab.value = true
	fileTabList.value.push(tab as FileTabProps)
	fileTabActive.value = fileTabList.value.length - 1 // 切换标签
	nextTick(() => {
		store.updateTabActiveData() // 更新标签数据
		store.refreshFilesList() // 刷新文件列表
		callback && callback(tab)
	})
}

/**
 * @description 计算弹窗位置
 * @param {MouseEvent} event 鼠标事件
 * @param {HTMLElement} el 弹窗元素
 * @return {Object} 返回弹窗位置
 */
export const calculatePopoverPosition = (event: MouseEvent, el: HTMLElement) => {
	const windowWidth = window.innerWidth
	const windowHeight = window.innerHeight

	const menuWidth = el.offsetWidth
	const menuHeight = el.offsetHeight

	const mouseX = event.clientX
	const mouseY = event.clientY

	// Calculate left position
	let left = mouseX
	if (mouseX + menuWidth > windowWidth) {
		left = mouseX - menuWidth
	}

	// Calculate top position
	let top = mouseY
	if (mouseY + menuHeight > windowHeight) {
		top = mouseY - menuHeight
	}
	if (top < 0) {
		top = 0
	}

	return { top, left, el }
}

/**
 * @description 控制表格列显示隐藏
 * @param {string} key 列key
 * @param {boolean} status 状态
 * @returns {Promise<void>} void
 */
export const setColumn = (key: string, status: boolean) => {
	// this.columnShow[key] = status
	// localStorage.setItem('columnShow', JSON.stringify(this.columnShow))
}

/**
 * @description 获取收藏列表
 * @returns {Promise<void>} void
 */
export const getFavoriteList = async () => {
	const { favoriteList } = storeToRefs(FILES_STORE())
	await useDataHandle({
		request: getFavoriteListData(),
		data: [Array, favoriteList],
	})
}

/**
 * @description 获取磁盘列表
 * @returns {Promise<void>} void
 */
export const getDiskList = async () => {
	const { diskList } = storeToRefs(FILES_STORE())
	const { data } = await getDiskListData()
	diskList.value = data // 磁盘列表
}

/**
 * @description 设置文件列表激活
 * @param {string} path 路径
 */
export const setFileListActive = (path: string) => {
	const store = FILES_STORE()
	const { fileTabList, fileTabActive } = storeToRefs(store)
	let sPath: string = path
	// 检测字段的最后一个字符是否为 '/'，如果是则删除
	if (sPath[sPath.length - 1] === '/' && sPath !== '/') {
		sPath = sPath.slice(0, sPath.length - 1)
	}
	const itemIndex = fileTabList.value.findIndex((item: any) => item.param.path === sPath)
	if (itemIndex !== -1) {
		fileTabActive.value = itemIndex
		store.updateTabActiveData()
		store.refreshFilesList()
	} else {
		addTab({ path })
	}
}

const getPath = (path: string, filename: string) => {
	return `${path}/${filename}`.replace('//', '/')
}

const getBtPs = (fileName: string, path: string) => {
	let fMsg = '',
		dMsg = defaultPS.get(`${path === '/' ? '/' : `${path}/`}${fileName}`)
	switch (fileName) {
		case '.htaccess':
			fMsg = 'PS: Apache用户配置文件(伪静态)'
			break
		case 'swap':
			fMsg = 'PS: 宝塔默认设置的SWAP交换分区文件'
			break
	}
	if (fileName.includes('.upload.tmp')) {
		fMsg = 'PS: 宝塔文件上传临时文件,重新上传从断点续传,可删除'
	}
	if (fileName.includes('.user.ini')) {
		fMsg = 'PS: PHP用户配置文件(防跨站)!'
	}

	if (dMsg) fMsg = dMsg
	return dMsg || fMsg
}
export const createFile = (type: string) => {
	return {
		icon: `icon-${type}`, // 文件图标
		ext: type == 'dir' ? ' folder' : '', // 文件后缀
		fileName: `新建${type == 'dir' ? '文件夹' : '文本'}`, // 文件名称
		time: '', // 时间
		ps: '', // 备注
		size: 0, // 文件大小
		type, // 文件类型
		user: 'root', // 所有者
		rootLevel: '0', // 用户权限
		isLink: '', // 软连接
		isShare: false, // 是否分享
		isTop: false, //是否置顶
		isFav: false, // 是否收藏
		isOsPs: false, // 是否系统备注信息
		isPsEdit: false, // 是否备注编辑
		isSearch: false, //判断是否搜索
		isReName: true, // 是否重命名
		isNew: true, // 是否新建
		isSync: '', // 是否同步
		isLock: false, // 是否加锁
		path: ``,
		tamperProofId: 0, // 防篡改ID
		isFile: type !== 'dir', // 是否是文件
	} as FileDataProps
}

export const reconstructionFile = (type: string, FileItem: any, TamperData: string = '0;0', path: string, bt_sync: any = []) => {
	const fileMsg = getBtPs(FileItem.nm, path)
	const isLock = TamperData.split(';')[0] === '1'
	const tid = TamperData.split(';')[1]
	const ext = getExtIcon(FileItem.nm, type)
	const filePath = getPath(path, FileItem.nm)
	return {
		icon: determineFileType(ext), // 文件图标
		ext, // 文件后缀
		fileName: FileItem.nm, // 文件名称
		time: formatTime(FileItem.mt), // 时间
		ps: fileMsg || FileItem.rmk || '', // 备注
		size: FileItem.sz, // 文件大小
		type: type, // 文件类型
		user: FileItem.user, // 所有者
		rootLevel: FileItem.acc, // 用户权限
		isLink: FileItem.lnk, // 软连接
		isShare: Number(FileItem.durl) != 0 ? FileItem.durl : 0, // 是否分享 0否 其它值为分享ID
		isTop: !!FileItem.top, //是否置顶
		isFav: !!Number(FileItem.fav), // 是否收藏
		isOsPs: !isUndefined(fileMsg) && fileMsg !== '', // 是否系统备注信息
		isPsEdit: false, // 是否备注编辑
		isSearch: true, //判断是否搜索
		isReName: false, // 是否重命名
		isNew: false, // 是否新建
		isSync: isSyncType(bt_sync, filePath), // 是否同步
		isLock, // 是否加锁，防篡改
		path: filePath, // 文件路径
		tamperProofId: Number(tid), // 防篡改ID:在防篡改列表中查询
		isFile: type !== 'dir', // 是否是文件
	}
}
// 是否同步类型
export const isSyncType = (arr: any, path: string) => {
	if (isUndefined(arr) || arr.length == 0) return ''
	const sync = arr.find((item: any) => item.path === path)
	return sync ? sync.type : ''
}

// 渲染历史记录列表
export const renderHistoryList = (list: [{ val: string; time: string }]) => {
	return list.map(item => {
		return {
			val: item.val,
			label: item.val,
		}
	})
}

/**
 * @description 打开结果弹窗
 * @param { any[] } data.resultData 数据
 * @param { string } data.resultTitle 标题
 * @param { string } data.autoTitle 自定义标题
 * @param { number | number[] } area 弹窗大小
 */
export const openResultDialog = (data: any, area?: any) => {
	useDialog({
		title: data?.title || '批量操作结果',
		area: area || 42,
		component: () => import('@components/extension/bt-result/index.vue'),
		compData: data,
	})
}

/**
 * @description 计算菜单位置
 * @param e 传入鼠标事件
 * @param contextmenuDom 菜单dom
 */
export const calculateContextMenuPosition = (e: MouseEvent, contextmenuDom: any) => {
	const windowWidth = window.innerWidth // 窗口宽度
	const windowHeight = window.innerHeight // 窗口高度

	const menuWidth = contextmenuDom.offsetWidth // 菜单宽度
	const menuHeight = contextmenuDom.offsetHeight // 菜单高度

	const mouseX = e.clientX // 鼠标x坐标
	const mouseY = e.clientY // 鼠标y坐标

	let left = mouseX // 默认左边位置
	if (mouseX + menuWidth > windowWidth) {
		// 如果菜单超出右边界，则左移菜单宽度
		left = mouseX - menuWidth
	}
	let top = mouseY - (windowHeight - mouseY < menuHeight ? menuHeight : 0)
	if (top < 0) {
		// 如果菜单超出上边界，则居中显示
		top = (windowHeight - menuHeight) / 2
	}
	// 设置菜单位置
	contextmenuDom.style.top = top + 'px'
	contextmenuDom.style.left = left + 'px'
}
