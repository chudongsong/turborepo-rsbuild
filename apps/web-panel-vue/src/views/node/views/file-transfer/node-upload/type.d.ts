// export interface FileUploadOptionProps {
// 	target: string // 上传地址
// 	chunkSize: number // 分片大小
// 	whileFileNum: number // 同时上传文件数量
// 	uploadPath: string // 上传路径
// 	ref: any // 上传组件的引用
// }

// export interface FileUploadQueryProps {
// 	size: any
// 	name: any
// 	file: any
// 	relativePath: string
// }

// export interface FileUploadResponseProps {
// 	response: string
// 	callback: (arg0: any, arg1: string) => void
// 	file: { size: any; name: any; parent?: any; currentSpeed: number }
// 	chunk: any
// }

// export interface FileUploadSyncDataProps {
// 	totalProgress: string // 总进度
// 	uploadSize: string // 文件总大小
// 	sizeUploaded: string // 文件已上传大小
// 	currentSpeed: string // 当前速度
// 	averageSpeed: string // 平均速度
// 	timeRemaining: string // 剩余时间
// 	timeElapsed: string | number // 已用时间
// 	fileNum: number // 文件数量
// }

// export interface FileUploadEventProps {
// 	dragenter: (e: DragEvent) => void
// 	dragleave: (e: any) => void
// 	drop: (e: any) => void
// }

// uploadStatus: Ref<String> = ref('paused'); // 上传状态  0:等待上传  1:上传成功  2:上传中

//
export type UploadStatus = 'paused' | 'uploading' | 'success' | 'error'

export interface UploadFileItem {
	uid: string // 文件唯一标识
	name: string // 文件名称
	status: UploadStatus // 文件状态
	percentage: number // 文件上传百分比
	size: number // 文件大小
	uploadTime: number // 文件上传时间
	uploadSpeed: number // 文件上传速度
	uploadProgress: number // 文件上传进度
	file: File // 文件对象
}

export interface FileUploadEventProps {
	dragenter: (e: Event) => void
	dragleave: (e: Event) => void
	dragover: (e: Event) => void
	drop: (e: Event) => void
}
