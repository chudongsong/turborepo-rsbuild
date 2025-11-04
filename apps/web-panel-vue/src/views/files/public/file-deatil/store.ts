import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { getFileStatus, getDirSize, reHistory, getFileAuth, setFileAuth } from '@api/files'
import { Message, useConfirm, useDataHandle } from '@/hooks/tools'
import { formatTime } from '@/utils/index'

const FILES_DETAIL_STORE = defineStore('FILES-DETAIL-STORE', () => {
	const filesStore = FILES_STORE()
	const { fileTabActiveData } = storeToRefs(filesStore)
	const { refreshFilesList } = filesStore

	const fileItem = ref<any>() // 文件信息
	const activeName = ref('routine') // 当前激活的tab
	const load = ref<boolean>(false)

	// 获取文件信息
	const getFileItem = async () => {
		load.value = true
		const res = await getFileStatus({ filename: fileItem.value.path })
		if (res.status) {
			fileItem.value = { ...fileItem.value, ...res.data }
			load.value = false
		} else {
			Message.error(res.msg)
		}
		const fileSize = await getDirSize({
			path: fileTabActiveData.value.param.path + '/' + fileItem.value.fileName,
		})

		fileItem.value.st_size = fileSize.data
		watchFileItem()
	}

	// 属性列表
	const attrList = ref<any>([])

	const watchFileItem = () => {
		attrList.value = [
			{
				title: '文件名',
				value: fileItem.value.name,
			},
			{
				title: '类型',
				value: fileItem.value.st_type || '未知文件',
			},
			{
				title: '文件路径',
				value: `${fileItem.value.path}/${fileItem.value.name}`,
			},
			// {
			//     title: '权限',
			//     value: fileItem.value.mode,
			// },
			{
				title: '文件大小',
				value: `${fileItem.value.st_size}`,
			},
			{
				title: '访问时间',
				value: formatTime(fileItem.value.st_atime),
			},
			{
				title: '修改时间',
				value: formatTime(fileItem.value.st_mtime),
			},
			{
				title: '元数据修改时间',
				value: formatTime(fileItem.value.st_ctime),
			},
			{
				title: '文件MD5',
				value: fileItem.value.md5,
			},
			{
				title: '文件sha1',
				value: fileItem.value.sha1,
			},
			{
				title: '所属用户',
				value: fileItem.value.user,
			},
			{
				title: '所属组',
				value: fileItem.value.group,
			},
			{
				title: '文件权限',
				value: fileItem.value.mode,
			},
			{
				title: '特殊权限',
				value: fileItem.value.lsattr || '无',
			},
			{
				title: '用户id',
				value: fileItem.value.st_uid,
			},
			{
				title: '用户组id',
				value: fileItem.value.st_gid,
			},
			{
				title: 'inode的链接数',
				value: fileItem.value.st_nlink,
			},
			{
				title: 'inode的节点号',
				value: fileItem.value.st_ino,
			},
			{
				title: 'inode保护模式',
				value: fileItem.value.st_mode,
			},
			{
				title: 'inode驻留设备',
				value: fileItem.value.st_dev,
			},
		]
	}

	// 查看历史版本
	const showHistory = (row: any) => {}

	// 恢复历史版本
	const recoverHistory = async (row: any) => {
		await useConfirm({
			title: `恢复历史文件`,
			content: `是否恢复历史文件 ${formatTime(fileItem.value.st_mtime)}?恢复历史文件后，当前文件内容将会被替换！`,
		})
		useDataHandle({
			loading: '正在恢复历史文件，请稍后...',
			request: reHistory({
				filename: `${fileItem.value.path}/${fileItem.value.name}`,
				history: row.st_mtime,
			}),
			success: (res: any) => {
				if (res.data.status) {
					Message.success('恢复成功')
					refreshFilesList()
				} else {
					Message.error('恢复失败')
				}
			},
		})
	}

	// 权限列表
	const checkList = reactive({
		owner: [] as string[],
		group: [] as string[],
		public: [] as string[],
		auth: 0 as number | string,
		user: 'root',
		isDir: true,
		checkNumber: '',
	})
	// 所有者选项
	const ownerOptions = [
		{ label: 'root', value: 'root' },
		{ label: 'www', value: 'www' },
		{ label: 'mysql', value: 'mysql' },
	]

	// 获取文件权限
	const getFileAuths = async () => {
		const res = await getFileAuth({
			filename: `${fileItem.value.path + '/' + fileItem.value.fileName}`,
		})
		if (res.status) {
			const auth = res.data
			checkList.auth = auth.chmod
			checkList.user = auth.chown
			parsePermission(Number(auth.chmod))
		} else {
			Message.error(res.msg)
		}
	}

	/**
	 * @description 判断权限
	 * @param val 权限值
	 */
	const parsePermission = (permissionValue: number): void => {
		permissionValue = parseInt(permissionValue.toString(), 8)
		if (permissionValue & 0o400) {
			checkList.owner.push('r')
		} else {
			checkList.owner = checkList.owner.filter(item => item !== 'r')
		}
		if (permissionValue & 0o200) {
			checkList.owner.push('w')
		} else {
			checkList.owner = checkList.owner.filter(item => item !== 'w')
		}
		if (permissionValue & 0o100) {
			checkList.owner.push('x')
		} else {
			checkList.owner = checkList.owner.filter(item => item !== 'x')
		}
		if (permissionValue & 0o040) {
			checkList.group.push('r')
		} else {
			checkList.group = checkList.group.filter(item => item !== 'r')
		}
		if (permissionValue & 0o020) {
			checkList.group.push('w')
		} else {
			checkList.group = checkList.group.filter(item => item !== 'w')
		}
		if (permissionValue & 0o010) {
			checkList.group.push('x')
		} else {
			checkList.group = checkList.group.filter(item => item !== 'x')
		}
		if (permissionValue & 0o004) {
			checkList.public.push('r')
		} else {
			checkList.public = checkList.public.filter(item => item !== 'r')
		}
		if (permissionValue & 0o002) {
			checkList.public.push('w')
		} else {
			checkList.public = checkList.public.filter(item => item !== 'w')
		}
		if (permissionValue & 0o001) {
			checkList.public.push('x')
		} else {
			checkList.public = checkList.public.filter(item => item !== 'x')
		}
		// 去重
		checkList.owner = Array.from(new Set(checkList.owner))
		checkList.group = Array.from(new Set(checkList.group))
		checkList.public = Array.from(new Set(checkList.public))
	}

	// 权限选项
	const reversePermission = (): void => {
		let permissionValue = 0
		let auth: any = 0
		// Helper function to set permission based on array values
		const setPermission = (array: string[], readBit: number, writeBit: number, executeBit: number) => {
			if (array.includes(`r`)) {
				permissionValue |= readBit
			}
			if (array.includes(`w`)) {
				permissionValue |= writeBit
			}
			if (array.includes(`x`)) {
				permissionValue |= executeBit
			}
		}

		// Set owner permissions
		setPermission(checkList.owner, 0o400, 0o200, 0o100)

		// Set group permissions
		setPermission(checkList.group, 0o040, 0o020, 0o010)

		// Set public permissions
		setPermission(checkList.public, 0o004, 0o002, 0o001)

		checkList.auth = permissionValue.toString(8)
		while (checkList.auth.length < 3) {
			checkList.auth = '0' + checkList.auth
		}
	}

	//去除非数字输入
	const checkNumber = (val: any) => {
		checkList.checkNumber = val
		const reVal = String(val).replace(/[^\d]/g, '').slice(0, 3)
		checkList.auth = reVal

		parsePermission(Number(checkList.auth))
	}

	/**
	 * @description 用户改变
	 * @param {string} val 用户名
	 */
	const changeUser = (val: string) => {
		checkList.user = val
	}

	// 设置文件权限
	const setFileAuths = async () => {
		let auth = checkList.auth.toString()
		// 验证权限输入
		if (auth.length > 3) {
			Message.error('请输入正确权限')
			return
		}
		// 判断是否有非数字
		if (checkList.checkNumber.match(/\D/g)) {
			Message.error('请输入正确权限')
			return
		}

		// 如果包含了非数字就提示
		if (auth.match(/\D/g)) {
			Message.error('请输入正确权限')
			return
		}

		// 如果不够3位数就在前面补0
		while (auth.length < 3) {
			auth = '0' + auth
		}
		const res = await useDataHandle({
			loading: '正在设置文件权限，请稍后...',
			request: setFileAuth({
				filename: `${fileItem.value.path}/${fileItem.value.name}`,
				user: checkList.user,
				access: auth,
				all: checkList.isDir ? 'True' : 'False',
			}),
			message: true,
			success: refreshFilesList,
		})
		if (!res.status) {
			setTimeout(() => {
				getFileAuths() // 失败后重新获取权限
			}, 500)
		}
	}

	const $reset = () => {
		attrList.value = []
		Object.assign(checkList, {
			owner: [] as string[],
			group: [] as string[],
			public: [] as string[],
			auth: 0 as number | string,
			user: 'root',
			isDir: true,
			checkNumber: '',
		})
	}

	return {
		activeName,
		fileItem,
		load,
		getFileItem,
		$reset,

		attrList,
		watchFileItem,

		showHistory,
		recoverHistory,

		checkList,
		ownerOptions,
		checkNumber,
		changeUser,
		setFileAuths,
		reversePermission,
		getFileAuths,
	}
})

export default FILES_DETAIL_STORE
