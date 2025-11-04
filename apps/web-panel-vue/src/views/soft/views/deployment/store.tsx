import type { DeployTypeItemProps, SoftTableRowProps, DeployTableProps } from '@soft/types'
import type { TableColumnProps } from '@components/data/bt-table/types'
import type { TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types'

import { useDialog, Message, useConfirm } from '@hooks/tools'
import { useBatchStatus, useCheckbox } from '@hooks/tools/table/column'
import { defineStore, storeToRefs } from 'pinia'

import { useSoftName, useSoftOperate, useSoftPs, useSoftScore, softForceMsg } from '@/views/soft/useMethod'
import { openPluginView } from '@/public'

import { useHandleError } from '@hooks/tools/error'
import { deployDel, getDeployList } from '@/api/soft'
import { checkObjKey, isArray } from '@utils/index'
import { splitEvery } from 'ramda'
import {} from '@hooks/tools'

import { SOFT_STORE } from '@soft/store'
import axios from 'axios'

const SOFT_DEPLOY_STORE = defineStore('SOFT-DEPLOY-STORE', () => {
	const { tabDeployActive, isLoading, searchVal } = storeToRefs(SOFT_STORE())
	const { scoreEvent } = SOFT_STORE()

	const rowData = ref<SoftTableRowProps | null>(null) // 表格行数据
	const oneDeploy = ref<any>()

	const deployTableListRef = ref() // 应用列表
	const tablePageConfig = ref({ total: 0, page: 1, row: 15 }) // 表格分页配置
	const deployTypeList = useSessionStorage<DeployTypeItemProps[]>('deployTypeList', []) // 软件类型列表

	const deployTableList = shallowRef<SoftTableRowProps[]>([]) // 软件列表
	const deployShowTableList = shallowRef<SoftTableRowProps[]>([]) // 软件列表

	const projectType = ref('all') // 项目类型

	const projectTypeOptions = [
		{ label: '全部项目', value: 'all' },
		{ label: 'PHP项目', value: 'php' },
		{ label: '异步项目', value: 'php_async' },
		{ label: 'Java项目', value: 'java' },
	]

	// 类型列表
	const typeList = computed(() => {
		return [...[{ title: '全部', tid: 0 }], ...deployTypeList.value]
	})

	/**
	 * @description 项目类型切换事件
	 * @param val
	 */
	const onChangeProjectType = (val: string) => {
		tablePageConfig.value.page = 1
		getDeployListData({
			type: tabDeployActive.value,
			search: searchVal.value,
			force: '0', // 不强制
		})
	}

	/**
	 * @description 切换分类事件
	 * @param {number} type 分类tid
	 */
	const toggleClassEvent = (type: number) => {
		tabDeployActive.value = type
		sessionStorage.setItem('SOFT-DEPLOY-TYPE', String(type))
		tablePageConfig.value.page = 1
		tablePageConfig.value.total = 0
		getDeployListData({ type, search: searchVal.value })
		TableColumn.value[0].isHide = tabDeployActive.value != 100
	}

	/**
	 * @description 导入一键部署项目包
	 * @param {number} row 行数据
	 */
	const importProjectEvent = (row?: SoftTableRowProps) => {
		rowData.value = row || null
		useDialog({
			title: `${row ? '更新' : '导入'}一键部署项目包${row ? `【${row.title}】` : ''}`, //【string】 title，组件标题，为空不显示或false，可为空
			area: 60, // 【number、string、array<number/string>】视图大小，支持数组[宽，高]，默认单位rem
			btn: ['提交', '取消'], // 【string、array<string>】支持字符串和数组，布尔值，"确认"和"取消"按钮 ，可为空
			component: () => import('@soft/views/deployment/import.vue'), // 组件引入
			showClose: true,
		})
	}

	/**
	 * @description 提供者信息
	 * @param {row}  行数据
	 * @returns {Promise<void>}
	 */
	const authorEvent = async (row: any): Promise<void> => {
		if (row.official) {
			window.open(row.official, '_blank', 'noopener,noreferrer')
		} else {
			location.reload()
		}
	}

	/**
	 * @description 分割数组
	 * @param {any} param.list 列表
	 * @param {number} param.limit 限制
	 * @param {number} param.p 分页
	 */
	const chunkArray = (param: { list: any; limit: number; p: number }): any => {
		const chunks = splitEvery(param.limit, param.list)
		return chunks[param.p - 1] || []
	}

	/**
	 * @description 切割软件列表页
	 * @param val
	 */
	const cutDeployTablePage = (): void => {
		deployShowTableList.value = chunkArray({
			list: deployTableList.value,
			limit: tablePageConfig.value.row,
			p: tablePageConfig.value.page,
		})
	}

	/**
	 * @description 分页事件
	 * @param {number} page 页码
	 * @param {number} row 条数
	 */
	const pageChangeEvent = (page: number, row: number) => {
		tablePageConfig.value.page = page
		tablePageConfig.value.row = row
		cutDeployTablePage()
	}

	/**
	 * @description 获取一键部署列表
	 * @returns {Promise<void>} void
	 */
	const getDeployListData = async (params: DeployTableProps) => {
		try {
			if (!params.search) delete params.search
			isLoading.value = true
			const { data, status } = await getDeployList(params)
			const checkObj = checkObjKey(data) // 检查对象是否存在，柯里化函数
			const { list, dep_type } = data
			if (Number(params.force) === 1) softForceMsg(status) // 强制刷新提示
			const pType = projectType.value === 'all' ? '' : projectType.value
			// 判断是否存在列表
			if (checkObj('list') && isArray(list)) {
				deployTableList.value = (
					!pType
						? list
						: list.filter((item: any) => {
								switch (pType) {
									case 'php':
										return item.project_type === null || item.project_type === pType || (item.project_type === 0 && item.install_type === 0)
									case 'php_async':
										return item.project_type === pType || (item.project_type === 0 && item.install_type === 1)
									case 'java':
										return item.project_type === pType || item.project_type === 1
									default:
										return item.project_type === pType
								}
						  })
				) as SoftTableRowProps[]
				tablePageConfig.value.total = deployTableList.value.length
				cutDeployTablePage()
			}
			if (checkObj('dep_type') && isArray(dep_type)) {
				deployTypeList.value = dep_type as DeployTypeItemProps[]
				deployTypeList.value.push({
					tid: 100,
					title: '其他',
				})
			}
		} catch (error) {
			useHandleError(error)
		} finally {
			isLoading.value = false
		}
	}

	// 表格列
	let TableColumn = shallowRef<TableColumnProps[]>([
		useCheckbox({ isHide: tabDeployActive.value != 100, type: 'page', key: 'name' }),
		useSoftName({
			type: 'deploy',
			sortable: true,
			onClick: (row: SoftTableRowProps) => oneDeployEvent(row),
		}),
		{ label: '版本', prop: 'version' },
		useSoftPs('deploy'),
		{
			label: '项目类型',
			width: 90,
			render: (row: any) => {
				if (tabDeployActive.value === 100) {
					const typeObj: { [key: string]: string } = {
						php_async: '异步项目',
						java: 'Java项目',
						default: 'PHP项目',
					}
					return typeObj[row.project_type] || typeObj.default
				} else {
					const typeObj: { [key: string]: string } = {
						// php_async: '异步项目',
						1: 'Java项目',
						0: 'PHP项目',
					}
					return typeObj[row.project_type] || typeObj.default
				}
			},
		},
		{
			label: '支持版本',
			render: (row: any) => {
				const { php, java, project_type } = row
				const isJavaProject = project_type === 1 || project_type === 'java'
				const supTitle = isJavaProject ? 'JDK版本：' : 'PHP版本：'
				const version = php || java

				return (
					<span title={`支持的${supTitle}${version}`}>
						{supTitle}
						{version}
					</span>
				)
			},
		},
		{
			label: '提供者',
			prop: 'author',
			render: (row: any) => {
				let author = '--'
				switch (row.author) {
					case '宝塔':
						author = row.title
						break
					case '本地导入':
					default:
						author = row.author
						break
				}
				return (
					<span class="bt-link" onClick={() => authorEvent(row)}>
						{author}
					</span>
				)
			},
		},
		useSoftScore({
			onClick: (row: SoftTableRowProps) => scoreEvent(row),
			sortable: true,
		}),
		useSoftOperate((row: SoftTableRowProps) => {
			let softOperateList = [{ onClick: oneDeployEvent, title: '一键部署' }]
			// 判断是否为用户上传的项目
			const isUserUpload = row.id === 0
			if (isUserUpload) {
				softOperateList.push({ onClick: importProjectEvent, title: '更新' })
				softOperateList.push({ onClick: deleteDeployEvent, title: '删除' })
			}
			return softOperateList
		}),
	])

	const oneDeployEvent = async (row: SoftTableRowProps) => {
		rowData.value = row
		oneDeploy.value = useDialog({
			title: `【${row.title}】一键部署`, //【string】 title，组件标题，为空不显示或false，可为空
			area: 60, // 【number、string、array<number/string>】视图大小，支持数组[宽，高]，默认单位rem
			btn: ['提交', '取消'], // 【string、array<string>】支持字符串和数组，布尔值，"确认"和"取消"按钮 ，可为空
			component: () => import('@soft/views/deployment/deploy-project/index.vue'), // 组件引入
			showClose: true,
		})
		return oneDeploy.value
	}

	// 批量操作
	const TableBatchOptions = [
		{
			label: '删除自定义项目',
			value: 'delete',
			event: async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps) => {
				const requestHandle = async (item: any) => await deployDel({ dname: item.name })
				await batchConfirm({
					title: `批量删除`,
					content: `即将删除所选中的项目，是否继续操作?`,
					column: [{ prop: 'name', label: '项目名称' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
					onConfirm: async () => {
						await nextAll(requestHandle)
						getDeployListData({ type: tabDeployActive.value, search: searchVal.value })
						// 返回false则不关闭弹窗
						return false
					},
				})
			},
		},
	]

	const refreshDeployList = (force: '0' | '1' = '0') => {
		getDeployListData({
			type: tabDeployActive.value,
			search: searchVal.value,
			force,
		})
	}

	/**
	 * @description 删除一键部署项目
	 * @param {SoftTableRowProps} row 行数据
	 */
	const deleteDeployEvent = async (row: SoftTableRowProps): Promise<any> => {
		try {
			await useConfirm({
				title: `删除自定义项目`,
				type: 'calc',
				icon: 'warning-filled',
				content: `您真的要删除【${row.name}】吗？`,
			})
			const res = await deployDel({ dname: row.name })
			if (res.status) {
				Message.success(res.msg)
				refreshDeployList()
			} else {
				Message.error(res.msg)
			}
		} catch (err) {}
	}

	// --------------------------------------------------------
	// 一键部署导入
	// --------------------------------------------------------
	// 表单
	const cmdForm = reactive({
		name: '',
		title: '',
		php: '',
		enable_functions: '',
		version: '',
		ps: '',
		file: null as any,
		project_type: 'php',
		mysql_version: '',
		java_version: '',
	})
	// 文件名
	const fileName = ref('未选择任何文件')
	const cmdFormRef = ref()

	// 帮助文本
	const helpList = [
		{
			content: () => (
				<>
					<span class="text-danger">请上传zip格式的项目包</span>,里面必需包含auto_install.json配置文件
				</>
			),
		},
	]
	const projectTypeRadio = [
		{ label: 'PHP', value: 'php' },
		{ label: 'Java', value: 'java' },
	]

	// 验证规则
	const cmdRules = {
		name: [{ required: true, message: '请输入项目英文名称', trigger: ['blur'] }],
		title: [{ required: true, message: '请输入项目中文名称', trigger: ['blur'] }],
		php: [{ required: true, message: '请输入项目PHP版本', trigger: ['blur'] }],
		version: [{ required: true, message: '请输入项目版本', trigger: ['blur'] }],
		ps: [{ required: true, message: '请输入项目简介', trigger: ['blur'] }],
		java_version: [{ required: true, message: '请输入JDK版本', trigger: ['blur'] }],
		mysql_version: [{ required: true, message: '请输入Mysql版本', trigger: ['blur'] }],
	}

	// 导入项目
	const importPlugin = () => {
		const input = document.createElement('input')
		input.type = 'file'
		input.style.display = 'none'
		input.accept = '.zip'
		input.id = 'update_zip'
		input.multiple = true
		input.addEventListener('change', async () => {
			const files = input.files || []
			if (files.length === 0) return
			fileName.value = files[0].name
			cmdForm.file = files[0]
		})
		input.click()
	}

	// 提交
	const onConfirm = async (close: any) => {
		try {
			await cmdFormRef.value.validate()

			if (!cmdForm.file) {
				Message.error('请上传项目包')
				return
			}
			if (!cmdForm.file.name.endsWith('.zip')) {
				Message.error('请上传zip格式的项目包')
				return
			}
			const formData = new FormData()
			formData.append('name', cmdForm.name)
			formData.append('title', cmdForm.title)
			if (cmdForm.project_type === 'php') {
				formData.append('php', cmdForm.php)
				formData.append('enable_functions', cmdForm.enable_functions)
			} else {
				formData.append('mysql_version', cmdForm.mysql_version)
				formData.append('java_version', cmdForm.java_version)
				formData.append('project_type', cmdForm.project_type)
			}
			formData.append('version', cmdForm.version)
			formData.append('ps', cmdForm.ps)
			formData.append('dep_zip', cmdForm.file)
			let config = {
				//添加请求头
				headers: {
					'Content-Type': 'multipart/form-data',
					'x-http-token': window.vite_public_request_token,
				},
			}
			const load = Message.load('正在导入项目，请稍后...')
			const res: any = await axios.post('/deployment?action=AddPackage', formData, config)
			load.close()
			if (res.data.status) {
				tablePageConfig.value.page = 1
				tabDeployActive.value = 100
				refreshDeployList()
				close()
				Message.success(res.data.msg)
			} else {
				Message.error(res.data.msg)
			}
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 切换项目类型
	 */
	const changeProjectType = (val: string) => {
		// 切换时清除校验
		cmdFormRef.value.resetFields()
		cmdForm.project_type = val
	}

	const initImportForm = () => {
		// 编辑状态赋值
		if (rowData.value) {
			const { name, title, php, enable_functions, version, ps, project_type, java, mysql } = rowData.value as SoftTableRowProps
			Object.assign(cmdForm, {
				name,
				title,
				php: php || '',
				enable_functions: enable_functions || '',
				version,
				ps,
				project_type: project_type === 'java' ? 'java' : 'php',
				mysql_version: mysql || '',
				java_version: java || '',
			})
		}
	}

	const $reset_import_form = () => {
		rowData.value = null
		fileName.value = '未选择任何文件'
		Object.assign(cmdForm, {
			name: '',
			title: '',
			php: '',
			enable_functions: '',
			version: '',
			ps: '',
			file: null as any,
			project_type: 'php',
			mysql_version: '',
			java_version: '',
		})
	}

	const $reset = () => {
		searchVal.value = ''
		projectType.value = 'all'
		deployTableList.value = []
		// TableColumn.value = []
		deployShowTableList.value = []
		tablePageConfig.value = { total: 0, page: 1, row: 10 }
	}

	return {
		searchVal,
		typeList,
		projectType,
		projectTypeOptions,
		TableColumn,
		deployShowTableList,
		deployTableListRef,
		TableBatchOptions,
		tablePageConfig,
		getDeployListData,
		pageChangeEvent,
		importProjectEvent,
		toggleClassEvent,
		onChangeProjectType,
		refreshDeployList,

		// 导入项目
		fileName,
		helpList,
		cmdForm,
		cmdRules,
		cmdFormRef,
		projectTypeRadio,
		changeProjectType,
		importPlugin,
		onConfirm,
		initImportForm,
		oneDeploy,

		rowData,
		$reset,
		$reset_import_form,
	}
})

export default SOFT_DEPLOY_STORE
