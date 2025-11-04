<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<div class="flex items-center">
						<span class="mr-[4px]">启用增量文件备份</span>
						<el-switch v-model="incrementStatus" @change="changeStatusEvent"></el-switch>
					</div>
					<bt-divider></bt-divider>
					<el-button type="default" @click="openBackupConfigEvent">增量备份配置</el-button>
				</div>
			</template>
			<template #header-right>
				<bt-table-refresh @refresh="getBackupData"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table ref="incrementSiteTable" height="400" :data="incrementTableData" :column="inBackTableColumn" v-bt-loading="tableLoad" v-bt-loading:title="'正在加载列表，请稍后...'" />
			</template>
			<template #footer-right></template>
			<template #popup>
				<bt-dialog title="增量文件备份配置" v-model="configurationPopup" :area="60" @confirm="handleConfirmEvent" showFooter>
					<div class="p-[20px]">
						<el-form v-bt-loading="isLoading" ref="configFormRef" :model="configForm" :rules="rules">
							<el-form-item label="备份目录">
								<bt-input disabled v-model="configForm.path" width="34rem" :title="configForm.path"></bt-input>
							</el-form-item>
							<el-form-item label="执行周期">
								<div class="flex items-center">
									<el-select class="!w-[8rem] mr-1rem" v-model="configForm.type" @change="handleTypeChange(configForm.type, true)">
										<template v-for="(item, index) in timeType">
											<el-option v-if="item.type === 'second-n' ? false : true" :key="index" :label="item.text" :value="item.type"></el-option>
										</template>
									</el-select>
									<el-form-item v-if="configForm.type == 'week'" class="el-form-item-item">
										<el-select v-model="configForm.week" class="mr-1rem !w-[8rem]">
											<el-option label="周一" value="1"></el-option>
											<el-option label="周二" value="2"></el-option>
											<el-option label="周三" value="3"></el-option>
											<el-option label="周四" value="4"></el-option>
											<el-option label="周五" value="5"></el-option>
											<el-option label="周六" value="6"></el-option>
											<el-option label="周日" value="7"></el-option>
										</el-select>
									</el-form-item>
									<el-form-item v-if="timeType[cycleTime]?.showDay" class="el-form-item-item mr-1rem" prop="where1">
										<bt-input v-model="configForm.where1" :min="1" width="10rem" type="number">
											<template #append>天</template>
										</bt-input>
									</el-form-item>
									<el-form-item v-if="timeType[cycleTime]?.showHour" class="el-form-item-item mr-1rem" prop="hour">
										<bt-input v-model="configForm.hour" width="12rem" max="23" min="0" type="number">
											<template #append>小时</template>
										</bt-input>
									</el-form-item>
									<el-form-item v-if="timeType[cycleTime]?.showMinute" class="el-form-item-item" prop="minute">
										<bt-input class="mr-1rem" v-model="configForm.minute" width="12rem" max="59" min="0" type="number">
											<template #append>分钟</template>
										</bt-input>
									</el-form-item>
									<el-form-item v-if="timeType[cycleTime]?.showSecond" class="el-form-item-item" prop="second">
										<bt-input v-model="configForm.second" width="10rem" max="59" min="0" type="number">
											<template #append>秒</template>
										</bt-input>
									</el-form-item>
								</div>
							</el-form-item>
							<el-form-item label="备份到">
								<bt-select v-model="configForm.backupTo" :options="backupOptions" class="!w-24rem"></bt-select>
							</el-form-item>
						</el-form>
						<bt-help :options="[backupTipList[0]]" class="mt-[16px] pl-[5rem]"></bt-help>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<bt-help :options="backupTipList" class="mt-[16px] pl-[20px]"></bt-help>
	</div>
</template>
<script lang="tsx" setup>
import { TableColumnProps } from '@/components/data/bt-table/types'
import { Message, useConfirm, useDataHandle, useHandleError } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { deleteBackup, downloadBackup, editBackupConfig, getBackupConfig, getBackupList, getBackupType, restoreBackup, setBackupStatus } from '@api/site'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => [],
})

const isLoading = ref<boolean>(false) // 加载状态
const configurationPopup = ref<boolean>(false) // 增量备份配置弹窗
const incrementStatus = ref<boolean>(false) // 增量备份开关
const incrementTableData = ref([]) // 增量表格数据

const path = toRef(props.compData, 'path')

const configFormRef = ref<any>() // 表单ref
const configForm = reactive<any>({
	path: path.value,
	time: '30分钟',
	backupTo: 'localhost',
	type: 'day',
	week: '1', // 周几
	hour: '1', // 小时
	minute: '30', // 分钟
	second: '', // 秒
	where1: '1', // x天xxx
	timeSet: ['1'], // 周几 多选 或者 几号 多选
	timeType: 'sday', // 备份周期类型
})
let taskId = '' // 任务id

const cycleTime = computed(() => {
	return (
		timeType.value.findIndex((item: any) => {
			return item.type === configForm.type
		}) || 0
	)
})

const timeData: any = {
	30: '30分钟',
	60: '1小时',
	1440: '1天',
}
let timeType = ref([
	{
		type: 'day',
		text: '每天',
		showDay: false,
		showHour: true,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'day-n',
		text: 'N天',
		showDay: true,
		showHour: true,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'hour',
		text: '每小时',
		showDay: false,
		showHour: false,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'hour-n',
		text: 'N小时',
		showDay: false,
		showHour: true,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'minute-n',
		text: 'N分钟',
		showDay: false,
		showHour: false,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'week',
		text: '每周',
		showDay: false,
		showHour: true,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'month',
		text: '每月',
		showDay: true,
		showHour: true,
		showMinute: true,
		showSecond: false,
	},
])

const backupOptions = ref<any[]>([])

const tableLoad = ref<boolean>(true) // 表格加载状态

const rules = reactive({
	backupTo: [{ required: true, message: '请选择备份到', trigger: 'change' }],
	where1: [
		{
			validator: (rule: any, value: string, callback: any) => {
				if (configForm.type === 'day-n' || configForm.type === 'month') {
					if (Number.parseInt(value) > 31 || Number.parseInt(value) < 1 || !Number.isInteger(parseFloat(value))) {
						callback(new Error('请输入1-31的整数'))
					} else if (value === '') {
						callback(new Error('请输入天数'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	hour: [
		{
			validator: (rule: any, value: string, callback: any) => {
				if (configForm.type === 'minute-n' || configForm.type === 'hour' || configForm.type === 'second-n') callback()
				if (Number.parseInt(value) > 23 || Number.parseInt(value) < 0 || !Number.isInteger(parseFloat(value))) {
					callback(new Error('请输入0-23的整数'))
				} else if (value === '') {
					callback(new Error('请输入小时'))
				} else if (configForm.type === 'hour-n' && Number.parseInt(value) === 0 && Number.parseInt(configForm.minute) === 0) {
					callback(new Error('小时和分钟不能同时为0'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	minute: [
		{
			validator: (rule: any, value: string, callback: any) => {
				if (Number.parseInt(value) > 59 || Number.parseInt(value) < 0 || !Number.isInteger(parseFloat(value))) {
					callback(new Error('请输入0-59的整数'))
				} else if (value === '') {
					callback(new Error('请输入分钟'))
				} else if (configForm.type === 'hour-n' && Number.parseInt(value) === 0 && Number.parseInt(configForm.hour) === 0) {
					// n小时n分钟不能同时为0
					callback(new Error('小时和分钟不能同时为0'))
				} else if (configForm.type === 'minute-n' && (Number.parseInt(value) < 1 || !/^[1-9]\d*$/.test(value))) {
					// n分钟不能小于1
					callback(new Error('请输入1-59的整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	second: [
		{
			validator: (rule: any, value: string, callback: any) => {
				// 判断是否为整数
				if (configForm.type === 'second-n') {
					if (!Number.isInteger(parseFloat(value)) || Number.parseInt(value) > 59 || Number.parseInt(value) < 1) {
						callback(new Error('请输入1-59的整数'))
					} else if (value === '') {
						callback(new Error('请输入秒'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	timeSet: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (configForm.type === 'sweek' && !value.length) {
					callback(new Error('请选择时间'))
				} else {
					callback()
				}
			},
			trigger: 'change',
		},
	],
})

// 帮助提示
const backupTipList = ref([
	{
		content: '温馨提示：如果文件未发生改变，则不会触发增量备份',
	},
	{
		content: '增量备份第一次备份，会备份一个完整的备份用于恢复，之后的备份则仅备份修改的文件',
	},
])

const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		{
			prop: 'name',
			label: '备份名称',
			showOverflowTooltip: true,
			minWidth: 100,
			render: (row: any) => {
				return <span class="truncate">{row.name}</span>
			},
		},
		{
			prop: 'backupTo',
			label: '存储位置',
		},
		{
			prop: 'size',
			label: '备份大小',
		},
		{
			prop: 'time',
			label: '备份时间',
			width: 150,
		},
		{
			prop: 'type',
			label: '备份类型',
			width: 80,
		},
		useOperate([
			{ onClick: restoreBackupEvent, width: 60, title: '恢复备份' },
			{ onClick: downloadEvent, title: '下载' },
			{ onClick: delInBackEvent, title: '删除' },
		]), // 操作
	])
}

/**
 * @description 操作 执行
 * @param row 类型
 */
const restoreBackupEvent = async (row: any) => {
	await useConfirm({
		title: '恢复数据',
		content: `恢复备份【${row.name}】到文件后，文件将被覆盖，是否继续操作？`,
		icon: 'warning-filled',
	})
	useDataHandle({
		loading: '正在恢复备份，请稍后...',
		request: restoreBackup({ backup_file: row.name, backup_id: row.id }),
		message: true,
	})
}

/**
 * @description 操作 下载
 * @param row 类型
 */
const downloadEvent = async (row: any) => {
	const res: AnyObject = await useDataHandle({
		request: downloadBackup({
			backup_file: row.name,
			cron_id: taskId,
			backup_id: row.id,
		}),
		data: {
			path: String,
			is_local: Boolean,
		},
	})
	if (res.path) window.open(`${res.is_local ? '/download?filename=' + encodeURIComponent(res.path) : res.path}`, '_blank', 'noopener,noreferrer')
}

/**
 * @description 操作 删除
 * @param  row 类型
 */
const delInBackEvent = async (row: any) => {
	await useConfirm({
		width: 50,
		title: '删除备份',
		content: `删除备份【${row.name}】后，备份文件将被删除，是否继续操作？`,
		icon: 'warning-filled',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除备份，请稍后...',
		request: deleteBackup({ backup_file: row.name, backup_id: row.id }),
		message: true,
	})
	if (res.status) await getBackupData()
}

const getConfig = async () => {
	try {
		const {
			data: { msg: rdata, status },
		} = await getBackupConfig({ src_folder: props.compData.path })
		incrementStatus.value = Array.isArray(rdata) && rdata.length ? !!rdata[0].status : false
		if (Array.isArray(rdata) && rdata.length) {
			taskId = rdata[0].id
			// 将表格内的备份提醒与执行周期数据值赋值给表单数据
			Object.keys(configForm).forEach((key: any) => {
				if (rdata[0].hasOwnProperty(key)) {
					configForm[key] = rdata[0][key]
				}
				if (rdata[0].hasOwnProperty(`where_${key}`)) {
					configForm[key] = rdata[0][`where_${key}`]
				}
			})
			configForm.backupTo = rdata[0].backupTo || 'localhost'
			configForm.path = rdata[0].sName
			handleTypeChange(configForm.type)
		} else {
			taskId = ''
		}
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 修改周期
 */
const handleTypeChange = (val: string, isSelect: boolean = false) => {
	configForm.type = val
	configForm.where1 = '1'
	if (configForm.type === 'minute-n') {
		configForm.where1 = configForm.minute
	}
	if (configForm.type === 'hour-n') {
		configForm.where1 = configForm.hour
	}
	if (configFormRef.value) configFormRef.value.clearValidate()
}

// 初始化
const initEnBack = async () => {
	await getConfig()
	getBackupData()
}

/**
 * @description 获取增量备份列表
 */
const getBackupData = async () => {
	try {
		tableLoad.value = true
		const res = await getBackupList({ src_folder: props.compData.path, cron_id: taskId })
		if (res.status) incrementTableData.value = res.data.msg
		else Message.error(res.msg)
	} catch (error) {
		console.log(error)
	} finally {
		tableLoad.value = false
	}
}

const handleConfirmEvent = async () => {
	await configFormRef.value.validate()
	const res: AnyObject = await useDataHandle({
		loading: '正在保存配置，请稍后...',
		request: editBackupConfig({
			name: `网站增量备份[ ${props.compData.name} ]`,
			...configForm,
			backupTo: configForm.backupTo,
			sName: configForm.path,
			sBody: '',
			sType: 'toShell',
		}),
		message: true,
	})
	if (res.status) {
		configurationPopup.value = false
		await getConfig()
	}
}

/**
 * @description 打开增量备份配置弹窗
 */
const openBackupConfigEvent = async () => {
	configForm.path = props.compData.path
	await getBackupTypeData()
	configurationPopup.value = true
}

/**
 * @description 获取备份到 数据列表
 */
const getBackupTypeData = async () => {
	try {
		isLoading.value = true
		const res = await getBackupType({ type: 'sites' })
		backupOptions.value =
			res?.data?.orderOpt?.map((item: any) => ({
				label: item.name,
				value: item.value,
			})) || []
		backupOptions.value.unshift({
			label: '服务器磁盘',
			value: 'localhost',
		})
	} catch (error) {
		useHandleError(error)
	} finally {
		isLoading.value = false
	}
}

/**
 * @description 获取参数
 */
const getParams = () => {
	const { week, hour, minute, where1, type, path, backupTo } = configForm
	return {
		name: `网站增量备份[ ${props.compData.name} ]`,
		week,
		hour,
		minute,
		where1,
		type,
		sName: !taskId ? props.compData.path : path,
		sBody: '',
		sType: 'toShell',
		backupTo: !taskId ? 'localhost' : backupTo,
	}
}

/**
 * @description 修改增量备份配置
 */
const changeStatusEvent = async (val: any) => {
	if (val) {
		if (!taskId) {
			// 如果没有任务id，说明是第一次开启增量备份
			const params = getParams()
			editBackupConfig(params)
			openBackupConfigEvent() // 打开增量备份配置弹窗
			configurationPopup.value = true
		} else {
			// 如果有任务id，说明是修改增量备份配置开关
			await useSetBackupStatus()
			await getConfig()
		}
	} else {
		await useConfirm({
			title: '关闭增量文件备份',
			content: `关闭增量文件备份后，将会删除增量备份配置，是否继续操作？`,
			icon: 'warning-filled',
		})
		await useSetBackupStatus()
		await getConfig()
	}
}

/**
 * @description 设置增量备份状态
 */
const useSetBackupStatus = async () => {
	await useDataHandle({
		request: setBackupStatus({ id: taskId }),
		message: true,
	})
}

const inBackTableColumn = useTableColumn()

onMounted(initEnBack)

defineExpose({
	init: initEnBack,
})
</script>
<style lang="css" scoped>
.text-wrapper {
	@apply white-space: pre-wrap;
}
</style>
