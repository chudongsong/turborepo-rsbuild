import { Message } from '@/hooks/tools'
import { getSelectDir } from '@/api/global'
import { importZipApphub, parserZipApphub } from '@/api/docker'
import { useDialog, useDataHandle } from '@/hooks/tools'
import { getFileList } from '@/api/files'
import { refreshList } from '../../top-tools/useController'

// 工具函数：生成本地文件应用描述
export function getFileDesc(filePath: string) {
	try {
		if (!filePath || typeof filePath !== 'string') return ''
		const name = filePath.split('/').pop() || ''
		return `从上传文件解析：${name}`
	} catch (error) {
		console.log('error', error)
		return ''
	}
}

// 本地上传专用
export const useLocalUploadController = () => {
	const fileList = ref<any[]>([])
	const appList = ref<any[]>([])

	// 获取应用文件列表
	const getApphubFiles = async () => {
		const res = await getFileList({ path: '/tmp/apphub' })
		const compressExts = ['zip', 'tar', 'gz', 'tar.gz', 'tgz', 'rar', '7z', 'bz2', 'war']
		const compressFiles = (res.data.files || [])
			.filter((f: any) => {
				if (!f.nm) return false
				const lower = f.nm.toLowerCase()
				return compressExts.some(ext => lower.endsWith('.' + ext))
			})
			.map((f: any) => `/tmp/apphub/${f.nm}`)
		fileList.value = compressFiles
		if (compressFiles.length) {
			await useDataHandle({
				request: parserZipApphub({ sfile: compressFiles }),
				loading: '正在获取应用列表，请稍后...',
				success: (res: any) => {
					const data = res.data.data || []
					let apps: any[] = []
					data.forEach((appsInFile: any, idx: number) => {
						const arr = Array.isArray(appsInFile) ? appsInFile : [appsInFile]
						arr.forEach((app: any) => {
							apps.push({
								...app,
								appdesc: app.parser_from ? `从上传文件解析：${app.parser_from}` : app.appdesc || '',
								sfile: compressFiles[idx],
							})
						})
					})
					appList.value = apps
				},
			})
		} else {
			appList.value = []
		}
	}

	// 打开文件上传弹窗
	const openFilesUpload = async () => {
		await useDialog({
			title: `上传文件到【/tmp/apphub】`,
			area: 72,
			component: () => import('@components/business/bt-file-upload/index.vue'),
			compData: {
				path: '/tmp/apphub',
			},
			onCancel: async () => {
				await getApphubFiles()
			},
		})
	}

	const onConfirm = async () => {
		if (!appList.value.length) {
			Message.error('应用列表为空，请上传文件')
			return false
		}
		const res: any = await useDataHandle({
			request: importZipApphub({ sfile: fileList.value }),
			loading: '正在导入应用，请稍后...',
			message: true,
		})
		if (!res.status) {
			Message.error(res?.msg || '导入失败')
			return false
		}
		refreshList(true)
		return true
	}
	return { fileList, appList, onConfirm, openFilesUpload, getApphubFiles }
}

// 服务器上传专用
export const useServerUploadController = () => {
	const currentPath = ref('/tmp/apphub')
	const fileList = ref<any[]>([])
	const selectedFiles = ref<any[]>([])
	const loading = ref(false)
	const parsedAppList = ref<any[]>([])
	const selectedApps = ref<(string | number)[]>([])

	// 文件类型判断
	const isSelectable = (row: any) => row && row.isFile && /\.(zip|tar|gz|tar\.gz|tgz|rar)$/i.test(row.name)
	// 用 fullpath 判断是否选中
	const isChecked = (row: any) => selectedFiles.value.some(f => f.fullpath === row.fullpath)
	const toggleSelection = async (row: any) => {
		if (!isSelectable(row)) return
		const idx = selectedFiles.value.findIndex(f => f.fullpath === row.fullpath)
		if (idx > -1) {
			// 取消选中
			selectedFiles.value.splice(idx, 1)
			parsedAppList.value = parsedAppList.value.filter(app => app.fullpath !== row.fullpath)
		} else {
			// 选中：先请求解析接口
			const parserLoading = Message.load('正在解析文件中，请稍后...')
			const res: any = await parserZipApphub({ sfile: row.fullpath })
			const arr = Array.isArray(res.data) ? res.data : res.data?.data || []
			if (!arr.length || typeof arr[0] !== 'object' || arr[0] === null || (!('appid' in arr[0]) && !('appname' in arr[0]))) {
				Message.error('解析失败，无法从该压缩包文件中获取应用信息')
				parserLoading.close()
				return
			}
			parserLoading.close()
			arr.forEach((app: any) => {
				const sourcePath = app.parser_from || row.fullpath
				parsedAppList.value.push({
					...app,
					fullpath: sourcePath,
					appdesc: `从服务器文件解析：${sourcePath}`,
				})
			})
			selectedFiles.value.push(row)
		}
		selectedApps.value = parsedAppList.value.map(app => app.appid)
	}
	const getIconClass = (row: any) => {
		if (row.isDir) return 'icon-bg folder-icon'
		if (['zip', 'rar', '7z', 'gz', 'tar.gz', 'tgz', 'war'].includes(row.ext)) return 'icon-bg compress-icon'
		return 'icon-bg file-icon'
	}
	const parseFileRow = (row: string, isFile = false, basePath = '') => {
		const [name, mtime, size, perm, owner] = row.split(';')
		const ext = isFile ? (name.split('.').pop() || '').toLowerCase() : ''
		const fullpath = basePath.endsWith('/') ? basePath + name : basePath + '/' + name
		return {
			name,
			mtime,
			size,
			perm,
			owner,
			isFile,
			isDir: !isFile,
			ext,
			fullpath,
		}
	}
	const fetchFiles = async () => {
		loading.value = true
		const res = await getSelectDir({ path: currentPath.value, disk: false })
		if (res.data.PATH && currentPath.value !== res.data.PATH) {
			currentPath.value = res.data.PATH
		}
		fileList.value = [...(res.data.DIR || []).map((row: string) => parseFileRow(row, false, currentPath.value)), ...(res.data.FILES || []).map((row: string) => parseFileRow(row, true, currentPath.value))]
		loading.value = false
	}
	const removeFile = (file: any) => {
		selectedFiles.value = selectedFiles.value.filter(f => f.fullpath !== file.fullpath)
		// 同步移除 parsedAppList 里 fullpath 匹配的应用
		parsedAppList.value = parsedAppList.value.filter(app => app.fullpath !== file.fullpath)
		selectedApps.value = parsedAppList.value.map(app => app.appid)
	}
	const handlePathChange = (path: string) => {
		currentPath.value = path
		fetchFiles()
	}
	const refresh = () => {
		fetchFiles()
	}
	const enterDir = (row: any) => {
		if (row.isDir) {
			let base = currentPath.value.replace(/\/$/, '')
			if (base === '') base = '/'
			currentPath.value = base === '/' ? `/${row.name}` : `${base}/${row.name}`
			fetchFiles()
		}
	}
	onMounted(() => {
		fetchFiles()
	})
	const onConfirm = async () => {
		if (!parsedAppList.value.length) {
			Message.error('请选择要导入的文件')
			return false
		}
		const res: any = await useDataHandle({
			request: importZipApphub({ sfile: selectedFiles.value.map(item => item.fullpath) }),
			loading: '正在导入应用，请稍后...',
			message: true,
		})
		if (!res.status) {
			Message.error(res?.msg || '导入失败')	
			return false
		}
		refreshList(true)
		return true
	}
	return {
		currentPath,
		fileList,
		selectedFiles,
		loading,
		parsedAppList,
		selectedApps,
		isSelectable,
		isChecked,
		toggleSelection,
		getIconClass,
		removeFile,
		handlePathChange,
		refresh,
		enterDir,
		onConfirm,
	}
}
