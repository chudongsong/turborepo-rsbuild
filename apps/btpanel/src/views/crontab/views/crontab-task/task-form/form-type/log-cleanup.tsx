import { FormButton, FormGroup, FormHelp, FormRadio, FormSelect, FormTextarea } from '@/hooks/tools/form/form-item'
import { fileSelectionDialog } from '@/public'
import CRONTAB_TASK_STORE from '../../useStore'

const radioType = ref(1) // 选择类型
const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())
const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isCopy = computed(() => rowData.value && !rowData.value.id) // 是否复制

const clearLogType = [
	{ value: 'all', label: '所有日志' },
	{ value: 'system_log', label: '系统日志' },
	{ value: 'panel_log', label: '面板日志' },
	{ value: 'www_log', label: '网站日志' },
	{ value: 'usranalyse_log', label: '堡塔防入侵日志' },
	{ value: 'mysql_log', label: 'MySQL日志' },
	{ value: 'Recycle', label: '回收站日志' },
	{ value: 'mail_log', label: '邮件日志' },
	{ value: 'php_session', label: 'PHP会话日志' },
	{ value: 'total_log', label: '网站统计报表日志' },
	{ value: 'user_config', label: '用户配置日志' },
]

export const logCleanup = (form: any) => {
	if (typeInit.value) init(form)

	return [
		FormRadio(
			'清理类型',
			'radioType',
			[
				{ label: '选择类型', value: 1 },
				{ label: '自定义路径', value: 2 },
			],
			{
				attrs: {
					disabled: isEdit.value,
					onChange: (val: number) => {
						radioType.value = val
						form.value.radioType = val
						form.value.clearLogType = [] // 清空显示值
						form.value.sName = '' // 清空请求发送值
						form.value.name = '日志清理'

						if (val === 1) {
							form.value.sName = 'user_config'
						}
					},
				},
			}
		),
		radioType.value === 1
			? FormSelect(' ', 'clearLogType', clearLogType, {
					attrs: {
						multiple: true,
						disabled: isEdit.value,
						class: '!w-[30rem]',
						placeholder: '请选择日志类型',
						onChange: (val: any) => {
							form.value.clearLogType = val
							form.value.sName = val.join(',')
							// 设置名称
							// 当数组长度为2以内时，直接取值，否则取前两项+省略号
							const nameArr = val.map((item: any) => {
								return clearLogType.find((i: any) => i.value === item)?.label
							})
							form.value.name = val.length <= 2 ? `日志清理[${nameArr.join(',')}]` : `日志清理[${nameArr.slice(0, 2).join(',')}...等${nameArr.length}项]`
						},
					},
					rules: [{ required: true, message: '请选择日志类型', trigger: 'change' }],
			  })
			: FormGroup([
					FormTextarea(' ', 'logText', {
						attrs: {
							class: '!w-[32rem]',
							disabled: isEdit.value,
							placeholder: '请选择或输入自定义目录，一行一个',
							onInput: (val: string) => {
								form.value.logText = val // 表单存储值
								// 处理后的表单请求值
								form.value.log_cut_path = val
									.split('\n')
									.filter((item: string) => item !== '')
									.join(',')
								form.value.name = changeName(val, 2)
							},
						},
						rules: [{ required: true, message: '请输入自定义目录', trigger: 'blur' }],
					}),
					FormButton('添加目录', {
						attrs: {
							disabled: isEdit.value,
							class: '!ml-8px',
							onClick: () => addPath(form),
						},
					}),
			  ]),
		FormHelp('温馨提示', [{ content: '自定义选择的目录支持切割的日志类型有：.log、.txt、.out、.err、.log.1' }]),
	]
}

/**
 * @description 打开文件选择弹窗
 * @param form
 */
const addPath = (form: any) => {
	fileSelectionDialog({
		type: 'dir',
		path: form.value.logText,
		change: path => {
			// 表单存储值
			form.value.logText = form.value.logText + (form.value.logText ? '\n' : '') + path
			// 处理后的表单请求值
			form.value.log_cut_path = form.value.logText
				.split('\n')
				.filter((item: string) => item !== '')
				.join(',')
			form.value.name = changeName(form.value.logText, 1)
		},
	})
}

/**
 * @description 名称变化
 * @param val
 * @param num
 * @returns
 */
const changeName = (val: any, num: number) => {
	const name = val.split('\n').filter((item: string) => item !== '')
	const newName = name.length <= num ? `日志清理[${name.join(',')}]` : `日志清理[${name.slice(0, num).join(',')}...等${name.length}项]`
	return newName
}

/**
 * @description 初始化
 * @param form
 */
const init = (form: any) => {
	typeInit.value = false
	// 初始化名称
	// 添加的情况
	if (!isEdit.value && !isCopy.value) {
		radioType.value = 1
		form.value.radioType = 1
		form.value.name = `日志清理`
	}
	// 编辑或复制的情况
	if (isEdit.value || isCopy.value) {
		form.value.clearLogType = form.value.sName.split(',')
		form.value.radioType = form.value.log_cut_path !== '' ? 2 : 1
		radioType.value = form.value.radioType
		form.value.logText = form.value.log_cut_path.split(',').join('\n')
	}
}
