import type { ResponseResult } from '@axios/types'
import { useAxios } from '@/hooks/tools'
import type { TableParamsProps } from '@/types/files.d'

/**
 * @description 获取文件内容
 * @returns { Promise }
 */
export const getFileBody = (data: { path: string }): Promise<ResponseResult> => useAxios.post('files/GetFileBody', { data, check: 'object' })

/**
 * @description 获取文件列表
 * @returns { Promise }
 */
export const getFileList = (data: TableParamsProps): Promise<ResponseResult> => useAxios.post('files/GetDirNew', { data, check: 'ignore' })

/**
 * @description 获取文件对应的目录列表
 * @returns { Promise }
 */
export const getFileDirList = (data: TableParamsProps): Promise<ResponseResult> => useAxios.post('/files?action=GetDirNew&tojs=GetFiles', { customType: 'model', data })

/**
 * @description 文件重命名
 * @param {String} sfile 旧名称路径
 * @param {String} dfile 新名称路径
 * @returns { Promise }
 */
export const setFileName = (data: { sfile: string; dfile: string; rename: boolean }): Promise<ResponseResult> => useAxios.post('files/MvFile', { data, check: 'msg' })

/**
 * @description 新建文件/文件夹
 * @param {String} path 新建文件/文件夹路径
 * @returns { Promise }
 */
export const createNewFile = (data: { path: string; type: string }): Promise<ResponseResult> =>
	useAxios.post(`files/${data.type === 'dir' ? 'CreateDir' : 'CreateFile'}`, {
		data: { path: data.path },
		check: 'msg',
	})

/**
 * @description 删除文件/文件夹
 * @param {String} path 删除文件/文件夹路径
 * @returns { Promise }
 */
export const deleteFile = (data: { path: string; type?: string }): Promise<ResponseResult> =>
	useAxios.post(`files/${data.type === 'dir' ? 'DeleteDir' : 'DeleteFile'}`, {
		data: { path: data.path },
		check: 'msg',
	})

/**
 * @description 添加收藏
 * @param {String} path 文件/文件夹路径
 * @returns { Promise }
 */
export const addFileFavorites = (data: { path: string }): Promise<ResponseResult> =>
	useAxios.post(`files/add_files_store`, {
		data: { path: data.path },
		check: 'msg',
	})

/**
 * @description 取消收藏
 * @param {String} path 文件/文件夹路径
 * @returns { Promise }
 */
export const delFileFavorites = (data: { path: string }): Promise<ResponseResult> =>
	useAxios.post(`files/del_files_store`, {
		data: { path: data.path },
		check: 'msg',
	})

/**
 * @description 文件置顶/取消置顶
 * @param {String} path 文件/文件夹路径
 * @param {String} type set置顶  unset取消置顶
 * @returns { Promise }
 */
export const setFileToping = (data: { path: string; type: string }): Promise<ResponseResult> =>
	useAxios.post(`/files/logs/set_topping_status`, {
		customType: 'model',
		data: { sfile: data.path, status: data.type === 'set' ? 1 : 0 },
		check: 'msg',
	})

/**
 * @description 检查文件是否存在（复制文件和文件夹前需要调用）
 * @param {String} path 文件/文件夹路径(不包含文件名)
 * @param {String} name 文件名
 * @returns { Promise }
 */
export const checkExistsFiles = (data: { path: string; name?: string }) => {
	const params = data.name ? { dfile: data.path, filename: data.name } : { dfile: data.path }
	return useAxios.post(`files/CheckExistsFiles`, {
		loading: '正在粘贴文件，请稍候...',
		data: params,
		check: 'array',
	})
}

/**
 * @description 复制文件（文件和文件夹）
 * @param {String} sfile 旧名称路径
 * @param {String} dfile 新名称路径
 * @returns { Promise }
 */
export const setCopyFiles = (data: { sfile: string; dfile: string }) =>
	useAxios.post(`files/CopyFile`, {
		data: { sfile: data.sfile, dfile: data.dfile },
		check: 'msg',
	})

/**
 * @description 剪切文件（文件和文件夹）
 * @param {String} sfile 旧名称路径
 * @param {String} dfile 新名称路径
 * @returns { Promise }
 */
export const cutFiles = (data: { sfile: string; dfile: string; rename?: boolean }) =>
	useAxios.post(`files/MvFile`, {
		data,
		check: 'msg',
	})

/**
 * @description 创建副本
 * @param {String} path 文件路径
 * @returns { Promise }
 */
export const createCopyFiles = (data: { path: string }) =>
	useAxios.post(`/files/logs/copy_file_to`, {
		customType: 'model',
		data: { sfile: data.path },
		check: 'msg',
	})

/**
 * @description 获取磁盘分区列表
 * @returns { Promise }
 */
export const getDiskList = () =>
	useAxios.post(`system/GetDiskInfo`, {
		check: 'array',
	})

/**
 * @description 获取收藏列表
 * @returns { Promise }
 */
export const getFavoriteList = () =>
	useAxios.post(`files/get_files_store`, {
		check: 'array',
	})

/**
 * @description 获取分享列表
 * @returns { Promise }
 */
export const getShareList = (data: any) => useAxios.post(`files/get_download_url_list`, { data: { p: 1, ...data }, check: 'object' })

/**
 * @description 获取回收站数据
 * @param {String} data.type 类型
 * @param {number} data.p 页码
 * @param {number} data.limit 每页条数
 * @param {String} data.search 搜索关键字
 * @param {number[]} data.time_search 时间搜索
 * @returns { Promise }
 */
export const getRecyclingBin = (data: any) => useAxios.post(`files/Get_Recycle_bin`, { data, check: 'object' })

/**
 * @description 设置回收站状态
 * @returns { Promise }
 */
export const setRecyclingBin = (data?: AnyObject) => useAxios.post(`files/Recycle_bin`, { data, check: 'msg' })

/**
 * @description 清空回收站
 * @returns { Promise }
 */
export const cleanRecyclingBin = (data: { force?: number; type: string }) => useAxios.post(`files/Close_Recycle_bin_new`, { data, check: 'msg' })

/**
 * @description 回收站恢复文件
 * @param {String} data.path 恢复前的rname
 * @param {String} data.rpath 恢复到的完整路径
 * @returns { Promise }
 */
export const recoverRecyclingBin = (data: any) => useAxios.post(`files/Re_Recycle_bin`, { data, check: 'msg' })

/**
 * @description 回收站删除文件
 * @param {String} data.path 文件的rname
 * @returns { Promise }
 */
export const deleteRecyclingBin = (data: any) => useAxios.post(`files/Del_Recycle_bin_new`, { data, check: 'msg' })

/**
 * @description 回收站批量删除数据库
 * @param {String} data.path_list 文件的rname
 * @returns { Promise }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const batchDeleteRecyclingBin = (data: { force?: number; path_list: any }) => useAxios.post(`files/Batch_Del_Recycle_bin`, { data, check: 'msg' })

/**
 * @description 回收站下载文件
 * @param {String} data.name 文件的name
 * @param {String} data.rname 文件的rname
 * @returns { Promise }
 */
export const dowmloadRecyclingBin = (data: any) => useAxios.post(`files/download_file`, { data, check: 'object' })

/**
 * @description 获取zip压缩包内文件列表
 * @param {String} data.sfile 文件的path
 * @returns { Promise }
 */
export const getZipFiles = (data: any) => useAxios.post(`/files/zip/get_zip_files`, { data, check: 'object', customType: 'model' })

/**
 * @description 获取tar.gz压缩包内文件列表
 * @param {String} data.sfile 文件的path
 * @returns { Promise }
 */
export const getGzFiles = (data: any) => useAxios.post(`/files/gz/get_zip_files`, { data, check: 'object', customType: 'model' })

/**
 * @description 切割文件
 * @param {String} data.file_path 文件的完整路径
 * @param {String} data.save_path 文件的保存路径
 * @param {String} data.split_size? 文件的分割大小
 * @param {String} data.split_num? 文件的分割数量
 * @returns { Promise }
 */
export const splitFile = (data: any) => useAxios.post(`files/SplitFile`, { data, check: 'object' })

/**
 * @description 获取切割文件信息
 * @param {String} data.file_path 文件的完整路径
 * @returns { Promise }
 */
export const getSplitFile = (data: any) => useAxios.post(`files/JoinConfigFile`, { data, check: 'msg' })

/**
 * @description 合并文件
 * @param {String} data.file_path 文件的完整路径
 * @param {String} data.save_path 文件的保存路径
 * @returns { Promise }
 */
export const mergeFile = (data: any) => useAxios.post(`files/JoinFile`, { data, check: 'msg' })

/**
 * @description 外链分享文件
 * @param {any} data
 * @returns { Promise }
 */
export const shareFile = (data: any) => useAxios.post(`files/create_download_url`, { data, check: 'msg' })

/**
 * @description 获取分享文件详情
 * @param {any} data.id
 * @returns { Promise }
 */
export const getShareFile = (data: any) => useAxios.post(`files/get_download_url_find`, { data })

/**
 * @description 关闭外链分享
 * @param {any} data.id
 * @returns { Promise }
 */
export const closeShareFile = (data: any) => useAxios.post(`files/remove_download_url`, { data, check: 'msg' })

/**
 * @description 监听日志
 * @param {any} data.file
 * @param {any} data.limit
 * @returns { Promise }
 */
export const getFileLog = (data: any) => useAxios.post(`/files/logs/get_logs_info`, { data, check: 'object', customType: 'model' })

/**
 * @description 压缩文件
 * @returns { Promise }
 */
export const addCompressFile = (data: any) => useAxios.post(`files/Zip`, { data, check: 'msg' })

/**
 * @description 压缩并下载文件
 * @returns { Promise }
 */
export const compressAndDownloadFile = (data: any) => useAxios.post(`files/ZipAndDownload`, { data, check: 'msg' })

/**
 * @description 解压文件
 * @returns { Promise }
 */
export const unCompressFile = (data: any) => useAxios.post(`files/UnZip`, { data, check: 'msg' })

/**
 * @description 获取邮箱信息
 * @returns { Promise }
 */
export const getEmail = () => useAxios.post(`/files/upload/check_email_config`, { check: 'object', customType: 'model' })

/**
 * @description 发送到邮箱
 * @returns { Promise }
 */
export const sendEmail = (data: any) => useAxios.post(`/files/upload/send_to_email`, { data, check: 'object', customType: 'model' })

/**
 * @description 获取文件属性
 * @param {any} data.filename 文件完整路径
 * @returns { Promise }
 */
export const getFileStatus = (data: any) => useAxios.post(`files/get_file_attribute`, { data, check: 'object' })

/**
 * @description 获取文件属性
 * @param {string} data.filename 文件完整路径
 * @param {string} data.history 文件时间
 * @returns { Promise }
 */
export const reHistory = (data: AnyObject) => useAxios.post(`files/re_history`, { data, check: 'object' })

/**
 * @description 获取文件权限
 * @param {string} data.filename 文件完整路径
 * @returns { Promise }
 */
export const getFileAuth = (data: any) => useAxios.post(`files/GetFileAccess`, { data, check: 'object' })

/**
 * @description 设置文件权限
 * @param {string} data.filename 文件完整路径
 * @param {string} data.user 文件用户
 * @param {string} data.access 文件权限
 * @param {string} data.all
 * @returns { Promise }
 */
export const setFileAuth = (data: any) => useAxios.post(`files/SetFileAccess`, { data, check: 'msg' })

/**
 * @description 导入数据库
 * @param {string} data.name 数据库名称
 * @param {string} data.file 文件完整路径
 * @returns { Promise }
 */
export const inputDatabase = (data: any) => useAxios.post(`database/InputSql`, { data, check: 'msg' })

/**
 * @description zip压缩包提交文件
 * @returns { Promise }
 */
export const compressAddZip = (data: any) => useAxios.post(`/files/zip/add_zip_file`, { data, check: 'msg', customType: 'model' })

/**
 * @description tar.gz压缩包提交文件
 * @returns { Promise }
 */
export const compressAddGz = (data: any) => useAxios.post(`/files/gz/add_zip_file`, { data, check: 'msg', customType: 'model' })

/**
 * @description zip压缩包获取文件详情
 * @returns { Promise }
 */
export const compressEditZip = (data: any) => useAxios.post(`/files/zip/get_fileinfo_by`, { data, check: 'object', customType: 'model' })

/**
 * @description tar.gz压缩包获取文件详情
 * @returns { Promise }
 */
export const compressEditGz = (data: any) => useAxios.post(`/files/gz/get_fileinfo_by`, { data, check: 'object', customType: 'model' })

/**
 * @description zip压缩包保存文件
 * @returns { Promise }
 */
export const compressSaveZip = (data: any) => useAxios.post(`/files/zip/write_zip_file`, { data, check: 'msg', customType: 'model' })

/**
 * @description tar.gz压缩包保存文件
 * @returns { Promise }
 */
export const compressSaveGz = (data: any) => useAxios.post(`/files/gz/write_zip_file`, { data, check: 'msg', customType: 'model' })

/**
 * @description zip压缩包解压文件
 * @returns { Promise }
 */
export const deCompressZip = (data: any) => useAxios.post(`/files/zip/extract_byfiles`, { data, check: 'msg', customType: 'model' })

/**
 * @description tar.gz压缩包解压文件
 * @returns { Promise }
 */
export const deCompressGz = (data: any) => useAxios.post(`/files/gz/extract_byfiles`, { data, check: 'msg', customType: 'model' })

/**
 * @description zip压缩包删除文件
 * @returns { Promise }
 */
export const zipDeleteFiles = (data: any) => useAxios.post(`/files/zip/delete_zip_file`, { data, check: 'msg', customType: 'model' })

/**
 * @description tar.gz压缩包删除文件
 * @returns { Promise }
 */
export const gzDeleteFiles = (data: any) => useAxios.post(`/files/gz/delete_zip_file`, { data, check: 'msg', customType: 'model' })

/**
 * @description 格式转换获取可转换的格式
 * @returns { Promise }
 */
export const getConvertList = () => useAxios.post(`/files/conversion/get_convert_liet`, { check: 'msg', customType: 'model' })

/**
 * @description 格式转换
 * @returns { Promise }
 */
export const ConvertFile = (data: any) => useAxios.post(`/files/conversion/run`, { data, check: 'msg', customType: 'model' })

/**
 * @description 下载文件
 * @returns { Promise }
 */
export const downloadFile = (data: any) => useAxios.post(`files/DownloadFile`, { data, check: 'msg' })

/**
 * @description 计算目录大小
 * @returns { Promise }
 */
export const computedDir = (data: any) => useAxios.post(`/files/size/get_batch_path_size`, { data, check: 'msg', customType: 'model' })

/**
 * @description 设置备注
 * @returns { Promise }
 */
export const setFilePs = (data: any) => useAxios.post(`files/set_file_ps`, { data, check: 'msg' })

/**
 * @description 文件同步-增加接收端
 * @returns { Promise }
 */

export const addReceiveRsync = (data: any) =>
	useAxios.post(`/plugin?action=a&name=rsync&s=add_module`, {
		data,
		check: 'msg',
		customType: 'model',
	})

export const addFileRsync = (data: any) =>
	useAxios.post(`files/add_files_rsync`, {
		data,
		check: 'msg',
	})

/**
 * @description 文件同步-增加发送端
 * @returns { Promise }
 */
export const addSendRsync = (data: any) =>
	useAxios.post(`/plugin?action=a&name=rsync&s=add_ormodify_send`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 文件历史
 * @returns { Promise }
 */
export const getFileHistory = () =>
	useAxios.post(`files/file_history_list`, {
		check: 'array',
	})

/**
 * @description 文件操作记录
 * @returns { Promise }
 */
export const getFileHistoryRecord = (data: { content: string; p: number }) =>
	useAxios.post(`files/GetFileHistory`, {
		data,
		check: 'msg',
	})

/**
 * @description 文件历史删除
 * @param {String} data.id 文件历史id
 * @returns { Promise }
 */
export const fileHistoryDel = (data: any) =>
	useAxios.post(`files/del_file_history`, {
		data,
		check: 'object',
	})

/**
 * @description 批量操作文件
 * @param {Array} data.data 文件名称数组
 * @param {number} data.type 模式  1复制  2剪切  3权限  4删除
 * @param {string} data.path 当前路径
 * @returns { Promise }
 */
export const fileBatchCopy = (data: any) =>
	useAxios.post(`files/SetBatchData`, {
		data,
		check: 'msg',
	})

/**
 * @description 批量粘贴文件
 * @param {number} data.type 模式  1粘贴 2剪切粘贴
 * @param {string} data.path 当前路径
 * @returns { Promise }
 */
export const fileBatchPaste = (data: any) =>
	useAxios.post(`files/BatchPaste`, {
		data,
		check: 'msg',
	})

/**
 * @description 企业防篡改-获取有效路径
 * @returns { Promise }
 */

export const getEffectivePath = (data: any) => useAxios.post(`/tamper_core/get_effective_path.json`, { data, customType: 'model' })

/**
 * @description 企业防篡改-获取有效路径
 * @returns { Promise }
 */
export const setTamperStatus = (data: any) =>
	useAxios.post(`/tamper_core/modify_global_config.json`, {
		data,
		customType: 'model',
		check: 'msg',
	})

// /**
//  * @description 上传文件是否存在
//  * @returns { Promise }
//  */
// export const uploadFileExists = (data: any) =>
// 	useAxios.post(`files/upload_file_exists`, { data, check: 'ignore' })

/**
 * @description 上传文件是否存在
 * @returns { Promise }
 */
export const uploadFilesExists = (data: any) => useAxios.post(`files/upload_files_exists`, { data, check: 'array' })

/**
 * @description 添加文件防篡改
 * @returns { Promise }
 */
export const addTamperCore = (data: any) => useAxios.post(`/tamper_core/batch_setting.json`, { data, check: 'object', customType: 'model' })

/**
 * @description 添加文件防篡改
 * @returns { Promise }
 */
export const createPath = (data: any) => useAxios.post(`/tamper_core/create_path.json`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量设置文件防篡改
 * @returns { Promise }
 */
export const batchSettingTamperCore = (data: any) => {
	return useAxios.post(`/tamper_core/batch_setting.json`, {
		data,
		check: 'ignore',
		customType: 'model',
	})
}
/**
 * @description 获取文件缩略图列表
 * @returns { Promise }
 */
export const getFilesImageList = (data: any) => useAxios.post(`files/get_images_resize`, { data, check: 'object' })

/**
 * @description 获取文件播放列表
 * @returns { Promise }
 */
export const getFilesVideoList = (data: any) => useAxios.post(`files/get_videos`, { data, check: 'array' })

/**
 * @description 获取文件当前目录大小
 * @returns { Promise }
 */
export const getDirSize = (data: any) => useAxios.post(`files/GetDirSize`, { data, check: 'string' })

/**
 * @description 获取当前文件计算状态
 * @returns { Promise }
 */
export const CheckTaskStatus = (data: any) => useAxios.post(`files/CheckTaskStatus`, { data, check: 'string' })

/**
 * @description 创建软链接
 * @returns { Promise }
 */
export const getCreateLink = (data: any) => useAxios.post(`files/CreateLink`, { data, check: 'msg' })

/**
 * @description 获取格式转换操作列表
 * @returns { Promise }
 */
export const getConversionLog = (data: any) => useAxios.post(`/files/conversion/get_log`, { data, check: 'object', customType: 'model' })

/**
 * @description 获取文件内容
 */
export const testPath = (data: any) => useAxios.post(`files/test_path`, { data })

/**
 * @description 获取文件历史
 */
export const setFileHistory = (data: any) => useAxios.post(`files/file_history`, { data })

/**
 * @description 获取当前目录下全文件大小
 * @param {String} path 目录路径
 */
export const getDirSizeByPath = (path: string) =>
	useAxios.post(`/files/size/get_dir_path_size`, {
		data: { path, is_refresh: true },
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取文件历史内容
 * @param {String} data.filename 文件完整路径
 * @param {String} data.history 文件历史版本时间戳
 */
export const getfileHistoryData = (data: any) =>
	useAxios.post(`files/read_history`, {
		data,
		check: 'object',
	})

/**
 * @description 删除文件历史
 * @param {String} data.filename 文件完整路径
 * @param {String} data.history 文件历史
 */
export const delFileHistory = (data: { filename: string; history: string }) =>
	useAxios.post(`files/del_history`, {
		data,
		check: 'msg',
	})

/**
 * @description 获取云存储配置
 * @returns { Promise }
 */
export const getCloudConfig = () => useAxios.post(`/files/upload/get_oss_objects`, { customType: 'model' })

/**
 * @description 获取云存储文件列表
 * @param {String} path 目录路径
 * @param {String} pname 云存储名称
 * @returns { Promise }
 */
export const getCloudList = (data: { path: string; pname: string }): Promise<ResponseResult> =>
	useAxios.post(`/plugin?action=a&s=get_list&name=${data.pname}`, {
		data: { path: data.path },
		check: 'object',
		customType: 'model',
	})

// 上传、下载云存储文件
export const cloudFileAction = (data: any, type: string) =>
	useAxios.post(`/files/${type === 'upload' ? 'upload/upload_file' : 'down/download_file'}`, {
		data: { data: JSON.stringify(data) },
		check: 'msg',
		customType: 'model',
	})
