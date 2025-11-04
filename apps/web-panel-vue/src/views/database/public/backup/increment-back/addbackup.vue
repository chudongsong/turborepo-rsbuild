<template>
	<div class="flex flex-col justify-center items-center my-20px">
		<el-form ref="increFormData" class="mr-16px w-[90%]" :model="incrementFormData">
			<el-form-item label="数据库名称" prop="db_name" v-if="!compData.rowData">
				<el-select class="!w-[42rem]" v-model="incrementFormData.db_name" @change="changeDbValue">
					<el-option v-for="(item, index) in selectOptions" :key="index" :label="item.name + (item.cron_id ? '' : '[无备份任务]')" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="选择表" prop="list" v-if="!compData.rowData">
				<el-select class="!w-[42rem]" v-model="incrementFormData.tb_name" multiple collapse-tags @change="handleChangeOption" placeholder="请选择表">
					<el-option v-for="(item, index) in tableOptionData" :key="index" :label="item.tb_name + (item.cron_id ? '' : '[无备份任务]')" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="数据备份到">
				<bt-select v-model="backup_address" multiple filterable allow-create default-first-option class="!w-[42rem] bt-multiple-select">
					<el-option v-for="(item, index) in addressOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
				</bt-select>
			</el-form-item>

			<el-form-item label="压缩密码" prop="zip_passwor d">
				<bt-input-icon v-if="!compData.rowData" @icon-click="() => (incrementFormData.zip_password = getRandomChart(16))" placeholder="请输入或选取随机密码，密码可为空" icon="el-refresh" v-model="incrementFormData.zip_password" width="42rem"></bt-input-icon>
				<bt-input disabled v-else v-model="incrementFormData.zip_password" placeholder="无"></bt-input>
			</el-form-item>

			<AlertForm ref="alertFormRef" class="mt-20px" :rowData="compData.rowData"></AlertForm>
			<ul class="mt-8px leading-8 text-small list-disc ml-20px" v-if="!(compData.type === 'edit')">
				<li class="text-danger">请牢记压缩密码，以免因压缩密码导致无法恢复和下载数据</li>
				<li>远程数据库暂不支持增量备份</li>
				<li>首次执行为全量备份，执行周期间隔后才会是增量备份</li>
			</ul>
		</el-form>
	</div>
</template>
<script lang="ts" setup>
import { Message, useDataHandle } from '@hooks/tools'
import { addIncrementData, modifyIncrementData } from '@/api/database'
import { getRandomChart, isArray, isString } from '@utils/index'

import AlertForm from '@database/public/alert-form/index.vue'

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const selectOptions = useVModel(props.compData, 'selectOptions') // 数据库下拉框数据

const increFormData = ref() // 表单数据

const backup_address = ref(['localhost']) // 数据备份位置
const alertFormRef = ref() // 备份提醒表单
const tableOptionData = ref() // 表下拉框数据

const incrementFormData = ref<any>({
	db_name: selectOptions.value?.length ? selectOptions.value[0].value : '',
	zip_password: '',
	cron_type: 'hour-n',
	backup_cycle: 3,
	upload_alioss: 'localhost',
	backup_type: 'tables',
	name: 'MySQL数据库增量备份',
	sType: 'enterpriseBackup',
	sBody: '',
	sName: 'tables',
	urladdress: '',
	save: '',
	save_local: 1,
	tb_name: [] as any,
}) // 表单数据

const allChannel = ['mail', 'dingding', 'feishu', 'weixin', 'sms', 'wx_account'] // 所有通道
const addressOptions = [
	{ label: '服务器磁盘', value: 'localhost' },
	{ label: '阿里云OSS', value: 'alioss' },
	{ label: '腾讯云OSS', value: 'txcos' },
	{ label: '七牛云存储', value: 'qiniu' },
	{ label: '华为云存储', value: 'obs' },
	{ label: '百度云存储', value: 'bos' },
	{ label: '天翼云存储', value: 'tianyiyun' },
	{ label: 'WebDav存储', value: 'webdav' },
	{ label: 'MinIO存储', value: 'minio' },
]

/**
 * @description 数据库选择框选中数据变化 请求表数据
 * @param {string} val 选择值
 */
const handleChangeOption = async (val: string) => {
	// 当选中的值为空时，默认选中all
	if (!val.length || val[val.length - 1] == '') {
		incrementFormData.value.tb_name = ['']
		return
	}
	// 选中除开all的其他项目时，取消all选中
	if ((isArray(val) || isString(val)) && val.length) {
		const index = incrementFormData.value.tb_name?.indexOf('')
		if (index !== -1) {
			incrementFormData.value.tb_name.splice(index, 1)
		}
	}
}

/**
 * @description 数据库选择框选中数据变化 请求表数据
 * @param val 选择值
 */
const changeDbValue = async (val: string) => {
	const database = props.compData.selectOptions?.find((item: any) => val === item.value)
	tableOptionData.value = database?.table_list || []
	if (tableOptionData.value?.length) incrementFormData.value.tb_name = ['']
	else incrementFormData.value.tb_name = []
}

/**
 * @description 提交参数处理
 */
const handleSubmitParams = () => {
	const params = {
		...alertFormRef.value.formData,
		...incrementFormData.value,
		backupTo: backup_address.value.join('|'), // 数据备份到
		name: 'MySQL数据库增量备份[' + incrementFormData.value.db_name + ']',

		// 上传到远程时，将上传地址改为对应的地址
		upload_alioss: backup_address.value?.indexOf('localhost') > 0 ? 'localhost' : backup_address.value[0],

		tb_name: incrementFormData.value.tb_name[0] == '' ? '' : typeof incrementFormData.value.tb_name == 'string' ? incrementFormData.value.tb_name : incrementFormData.value.tb_name.join('|'),
		notice_channel: alertFormRef.value.formData.noticeChannel,
	}

	// 消息通道处理
	params.notice_channel = params.notice_channel === 'all' ? allChannel.join(',') : params.notice_channel

	// 编辑时传递id
	if (props.compData.rowData) params.id = props.compData.rowData.cron_id

	return params
}

/**
 * @description 增加增量备份任务/修改
 */
const onConfirm = async (close: AnyFunction) => {
	await alertFormRef.value.formDataRef.validate()
	if (backup_address.value.length === 0) {
		Message.error('请至少选择一个数据备份位置')
		return
	}

	const params = handleSubmitParams() // 提交参数
	const data = props.compData.rowData // 表格行数据

	await useDataHandle({
		loading: '正在提交任务中，请稍候...',
		request: data?.cron_id ? modifyIncrementData(params) : addIncrementData(params),
		message: true,
	})

	props.compData.refreshEvent() // 刷新表格数据
	close()
}

/**
 * @description 初始化
 */
const init = async () => {
	// 获取数据库表选项数据
	changeDbValue(incrementFormData.value.db_name)
	// 当rowData存在时，将表格行内的数据赋值给表单数据
	if (props.compData.rowData) {
		Object.keys(incrementFormData.value).forEach((key: any) => {
			if (props.compData.rowData.hasOwnProperty(key)) {
				incrementFormData.value[key] = props.compData.rowData[key]
			}
		})
		// 将表格内的数据备份位置数据值赋值给表单数据
		backup_address.value = props.compData.rowData.backupTo
	}
}

onMounted(() => {
	init()
	// 当从表格内打开增量备份时
	if (props.compData.rowDatabaseName) {
		console.log(props.compData.rowDatabaseName)
		incrementFormData.value.db_name = props.compData.selectOptions?.find((item: any) => {
			return item.value === props.compData.rowDatabaseName
		})?.value
	}
})

defineExpose({ onConfirm })
</script>
