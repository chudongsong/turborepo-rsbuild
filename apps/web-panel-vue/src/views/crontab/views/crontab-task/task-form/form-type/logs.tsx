import { FormGroup, FormHelp, FormInputAppend, FormInputPath, FormSelect } from '@/hooks/tools/form/form-item'
import { fileSelectionDialog } from '@/public'
import { getCrontabDataList } from '@/api/crontab'
import CRONTAB_TASK_STORE from '../../useStore'

const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())
const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isAdd = computed(() => !rowData.value.id && !rowData.value) // 是否新增

const siteList = ref([{ label: '全部', value: 'ALL' }]) // 网站列表

export const logs = (form: any) => {
	// 初始化数据
	if (typeInit.value) initLog(form)

	return [
		// 存储路径
		FormInputPath(
			'存储路径',
			'log_cut_path',
			{
				attrs: { class: 'w-[36rem]' },
				rules: [{ required: true, message: '请输入存储路径', trigger: 'blur' }],
			},
			() => openFilePath(form)
		),
		// 切割日志
		FormGroup([
			FormSelect('切割日志', 'sName', siteList.value, {
				attrs: {
					class: '!w-[16rem] mr-[8px]',
					disabled: isEdit.value,
					onChange: (val: string) => {
						form.value.name = '切割日志[' + (val === 'ALL' ? '全部' : val) + ']'
					},
				},
			}),
			FormInputAppend('', 'save', '份', {
				attrs: { class: 'w-[14rem]' },
				// 最小输入1
				rules: [{ required: true, message: '请输入不为0的正整数', trigger: 'blur' }],
			}),
			FormHelp('温馨提示', [{ content: '只切分项目的访问日志，如需对项目日志进行切分，请前往【网站-**项目-项目日志】进行配置' }, { content: '日志切割后会在选择的目录下产生/history_backups文件夹，切割后的日志存储在这个文件夹中' }]),
		]),
	] as any[]
}

/**
 * @description 打开文件选择框
 */
const openFilePath = (form: any) => {
	fileSelectionDialog({
		type: 'dir',
		path: form.value.log_cut_path,
		change: path => {
			form.value.log_cut_path = path
		},
	})
}

/**
 * @description 获取网站列表
 */
const getSiteList = async (form: any) => {
	try {
		const { data: res } = await getCrontabDataList({ type: 'sites' })
		siteList.value = [{ label: '全部', value: 'ALL' }].concat(res.data.map(item => ({ label: item.name, value: item.name }))) || []
		// 赋值初始化
		form.value.sName = 'ALL'
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 初始化日志
 * @param form
 */
const initLog = async (form: any) => {
	typeInit.value = false
	if (isAdd.value) {
		// 初始化任务名称
		form.value.name = '切割日志[所有]'
		// 初始化任务保存份数
		form.value.save = 180
		// 初始化存储路径
		if (!form.value.log_cut_path) form.value.log_cut_path = '/www/wwwlogs'
		//获取网站列表
		getSiteList(form)
	} else {
		// 编辑
	}
}
