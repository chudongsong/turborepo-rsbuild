import { getPythonEnvironment, createPythonEnvironment, addPythonEnvironment, setPythonEnvironment, deletePythonEnvironment } from '@/api/site'
import { useConfirm, useForm, useDataHandle, Message, useDialog, useAllTable } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { FormHelp, FormRadioButton, FormInputPath, FormInput, FormItemCustom } from '@/hooks/tools/form/form-item'
import { ElRadio } from 'element-plus'
import { defineComponent } from 'vue'

interface FormData {
	add_type: 'system' | 'venv' | 'conda'
	path: string
}

export const versionUsed = ref('') // 已使用版本
export const isRefreshList = ref(false) // 是否刷新列表
const tableDataRef = shallowRef<any[]>([]) // 通用表格数据
export const currentApplyEnv = ref<any>(null)

/**
 * @description 获取版本列表
 */
export const getVersionListEvent = async () => {
	try {
		const res: AnyObject = await useDataHandle({
			request: getPythonEnvironment({ sort_not_use: 0 }),
		})
		if (!res.status) {
			Message.error(res.msg)
			tableDataRef.value = []
			return { data: [], total: 0 }
		}
		if (res.data.now_env) {
			currentApplyEnv.value = res.data.now_env
			for (let i = 0; i < res.data.env_list.length; i++) {
				if (res.data.env_list[i].bin_path === res.data.now_env.bin_path) {
					res.data.env_list[i].isCurrent = true
					tableDataRef.value = res.data.env_list
					return { data: res.data.env_list, total: res.data.env_list.length }
				}
			}
		}
		tableDataRef.value = res.data.env_list
		return { data: res.data.env_list, total: res.data.env_list.length }
	} catch (error) {
		console.error(error)
		return { data: [], total: 0 }
	}
}

/**
 * @description 设置命令行 / 取消设置命令行
 */
export const setPythonVersionEvent = async (path: string) => {
	await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setPythonEnvironment({
			path,
		}),
		message: true,
		success: () => {
			isRefreshList.value = true
		},
	})
}

/**
 * @description 删除环境
 */
export const deletePythonEnvEvent = async (path: string, name: string) => {
	await useConfirm({
		title: `确定删除环境【${name}】吗？`,
		content: '删除后无法恢复，请谨慎操作',
		onConfirm: async () => {
			await useDataHandle({
				request: deletePythonEnvironment({ path_data: path }),
				loading: '正在删除，请稍后...',
				// message: true,
				success: (res: any) => {
					if (res.status && res.data.data[0].status) {
						Message.success('删除成功')
						isRefreshList.value = true
					} else {
						Message.error(res.data.data?.[0]?.msg || res.msg)
					}
				},
			})
		},
	})
}

/**
 * @description 通用表格
 */
const getCommonTable = (type: 'apply' | 'create' = 'apply') => {
	const currentSelect = ref<any>(null)
	const currentApply = ref<any>(null)
	// 当前选择
	const handleCurrentChange = (val: any) => {
		currentSelect.value = val.bin_path
	}
	// 获取当前选择
	const getCurrentSelect = () => {
		return tableDataRef.value.find(item => item.bin_path === currentSelect.value)
	}
	return {
		...useAllTable({
			request: async () => {
				// 根据类型过滤数据
				const tableData = tableDataRef.value.filter(item => {
					if (type === 'apply') {
						item.isCurrent && (currentApply.value = item)
						return item.can_set_default
					}
					return item.can_create
				})
				return { data: tableData, total: tableData.length }
			},
			columns: [
				// useCheckbox({key: 'bin_path'}),
				{
					label: ' ',
					prop: 'select',
					width: 50,
					render: (row: any) => {
						return <ElRadio value={row.bin_path} v-model={currentSelect.value} />
					},
				},
				{
					label: '名称',
					prop: 'name',
					render: (row: any) => {
						return (
							<div class="truncate" title={`${row.name}${row.isCurrent && type === 'apply' ? `【当前使用】` : ''}`}>
								{row.name}
								{row.isCurrent && type === 'apply' ? <span class="font-bold text-default">【当前使用】</span> : ''}
							</div>
						)
					},
				},
				{
					label: '类型',
					prop: 'type',
					width: 100,
					render: (row: any) => {
						if (row.bin_path.includes('/www/server/panel/pyenv')) {
							return '宝塔面板环境'
						}
						switch (row.type) {
							case 'venv':
								return '虚拟环境'
							case 'system':
								return row.from_panel ? '面板安装' : '系统级环境'
							case 'conda':
								return 'Conda环境'
							default:
								return '未知'
						}
					},
				},
				{
					label: 'Python版本',
					prop: 'version',
					width: 100,
				},
			],
		}),
		getCurrentSelect,
		handleCurrentChange,
		currentApply,
	}
}

export const cancelApply = async () => {
	try {
		await useConfirm({
			title: '取消应用命令行',
			content: `确定取消命令行环境【${currentApplyEnv.value?.name || ''}】吗？`,
			onConfirm: async () => {
				await setPythonVersionEvent('')
				currentApplyEnv.value = null
			},
		})
	} catch (error) {
		console.error(error)
	}
}
/**
 * @description 应用命令行
 */
export const openApplyPythonEnvView = async (row: { venv_name: string; bin_path: string; ps: string }) => {
	const { BtTable, getCurrentSelect, handleCurrentChange, currentApply, refresh } = getCommonTable('apply')

	// 将函数式组件改为渲染函数组件
	const DialogContent = defineComponent({
		setup() {
			const cancelApply = async () => {
				try {
					await useConfirm({
						title: '取消应用命令行',
						content: `确定取消命令行环境【${currentApply.value.name || ''}】吗？`,
						onConfirm: async () => {
							await setPythonVersionEvent('')
							currentApply.value = null
						},
					})
				} catch (error) {
					console.error(error)
				}
			}

			watch(
				tableDataRef,
				() => {
					refresh()
				},
				{ deep: true }
			)

			return () => (
				<div class="p-[1.6rem]">
					<div class="flex items-center mb-[.5rem]">
						当前命令行的环境：{currentApply.value ? currentApply.value.name : '无'}
						{currentApply.value && (
							<span class="bt-link ml-[1rem]" onClick={cancelApply}>
								取消应用
							</span>
						)}
					</div>
					<div class="flex items-center mb-[1.6rem] text-tertiary">可在下方选择命令行环境</div>
					<BtTable highlight-current-row maxHeight={400} onCurrentChange={handleCurrentChange} />
				</div>
			)
		},
	})

	useDialog({
		title: '应用命令行',
		area: 65,
		btn: '应用命令行',
		component: DialogContent,
		onConfirm: async () => {
			const currentSelect = getCurrentSelect()
			if (currentSelect) {
				await setPythonVersionEvent(currentSelect.bin_path)
				return true
			} else {
				Message.error('请选择应用命令行的环境')
				return false
			}
		},
	})
}

/**
 * @description 打开创建虚拟环境弹窗
 */
export const openCreatePythonEnvView = async (row: { venv_name: string; bin_path: string; ps: string }) => {
	const { BtTable, getCurrentSelect, handleCurrentChange } = getCommonTable('create')

	// 表单生成
	const { BtForm, submit } = useForm({
		data: () => ({
			venv_name: '',
			python_bin: '',
			ps: '',
		}),
		options: (formDataRef: any) =>
			computed(() => [
				FormInput('名称', 'venv_name', {
					attrs: { class: '!w-[24rem]', placeholder: '虚拟环境名称' },
					rules: [{ required: true, message: '虚拟环境名称不可为空', trigger: ['blur', 'change'] }],
				}),
				FormItemCustom(
					'环境来源',
					() => {
						return (
							<div class="w-[90%]">
								<BtTable highlight-current-row maxHeight={400} onCurrentChange={handleCurrentChange} />
								{/* <div class="text-tertiary text-small">请选择需要创建虚拟环境的环境</div> */}
							</div>
						)
					},
					'python_bin',
					{
						attrs: { class: '!w-[52rem]' },
						rules: [
							{
								required: true,
								trigger: 'blur',
								validator: (rule: any, value: any, callback: any) => {
									const currentSelect = getCurrentSelect()
									if (currentSelect) {
										formDataRef.value.python_bin = currentSelect.bin_path
										callback()
									} else {
										callback(new Error('请选择需要创建虚拟环境的环境来源'))
									}
								},
							},
						],
					}
				),
				FormInput('备注', 'ps', {
					attrs: { class: '!w-[24rem]', placeholder: '备注' },
					rules: [{ required: false, message: '备注不可为空', trigger: ['blur', 'change'] }],
				}),
			]),
		submit: async (formData: Ref<{ venv_name: string; python_bin: string; ps: string }>, validate: any) => {
			await validate()
			return await createPythonEnvEvent(formData.value)
		},
	})
	useDialog({
		title: '创建虚拟环境',
		area: 65,
		btn: '创建',
		component: () => (
			<div class="p-[1.6rem]">
				<BtForm />
			</div>
		),
		onConfirm: async () => {
			try {
				const status = await submit()
				if (status) {
					return true
				}
				return false
			} catch (error) {
				console.error(error)
				return false
			}
		},
	})
}

const createPythonEnvEvent = async (formData: { venv_name: string; python_bin: string; ps: string }) => {
	const res: any = await useDataHandle({
		request: createPythonEnvironment({ venv_name: formData.venv_name, python_bin: formData.python_bin, ps: formData.ps }),
		message: true,
		loading: '正在创建，请稍后...',
	})
	if (res.status) {
		isRefreshList.value = true
		return true
	}
	return false
}
/**
 * @description 打开文件选择框
 */
const openFilePath = (formDataRef: Ref<FormData>, type: 'file' | 'dir' = 'dir') => {
	fileSelectionDialog({
		type,
		path: formDataRef.value.path,
		change: path => {
			formDataRef.value.path = path
		},
	})
}

/**
 * @description 打开添加已存在的Python环境弹窗
 */
export const openAddPythonEnvView = () => {
	const typeHelp = {
		venv: '添加虚拟环境需要指定到虚拟环境目录',
		conda: '添加Conda环境需要指定到Conda可执行文件',
		system: '添加系统级环境需要指定到Python解释器文件',
	}

	// 表单生成
	const { BtForm, submit } = useForm({
		data: () => ({
			add_type: 'venv',
			path: '',
		}),
		options: (formDataRef: any) =>
			computed(() => [
				FormRadioButton('环境类型', 'add_type', [
					{ label: '虚拟环境', value: 'venv' },
					{ label: 'Conda环境', value: 'conda' },
					{ label: '系统级环境', value: 'system' },
				]),
				FormInputPath(
					'环境位置',
					'path',
					{
						attrs: { class: '!w-[42rem]', placeholder: typeHelp[formDataRef.value.add_type as keyof typeof typeHelp] },
						rules: [{ required: true, message: '环境位置不可为空', trigger: ['blur', 'change'] }],
					},
					() => {
						let type: 'file' | 'dir' = 'dir'
						switch (formDataRef.value.add_type) {
							case 'system':
								type = 'file'
								break
							case 'venv':
								type = 'dir'
								break
							case 'conda':
								type = 'file'
								break
						}
						openFilePath(formDataRef, type)
					}
				),
				FormHelp(' ', [{ content: typeHelp[formDataRef.value.add_type as keyof typeof typeHelp] }]),
			]),
		submit: async (formData: Ref<FormData>, validate: any) => {
			await validate()
			return await useDataHandle({
				loading: '正在添加，请稍后...',
				request: addPythonEnvironment(formData.value),
				message: true,
				success: () => {
					isRefreshList.value = true
				},
			})
		},
	})

	useDialog({
		area: 65,
		title: '添加已存在的Python环境',
		btn: '添加',
		component: () => (
			<div class="p-[1.6rem]">
				<BtForm />
			</div>
		),
		onConfirm: async () => {
			const res: any = await submit()
			if (res.status) {
				return true
			}
			return false
		},
	})
}

/**
 * @description 卸载组件时
 */
export const unmountedHandle = () => {
	tableDataRef.value = []
}
