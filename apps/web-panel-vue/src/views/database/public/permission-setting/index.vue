<template>
	<div class="p-20px">
		<el-form ref="permissionFormRef" :model="ruleForm" :rules="rules" label-width="5rem">
			<el-form-item label="访问权限" prop="permission">
				<el-select class="!w-[22rem]" v-model="ruleForm.permission">
					<el-option v-for="item in handleOptions[tabActive].option" :key="item.value" :label="item.label" :value="item.value"></el-option>
					<el-option label="指定ip" value="ip"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item prop="ip" v-if="ruleForm.permission === 'ip' ? true : false" label="IP地址">
				<bt-input :type="tabActive === 'mysql' ? 'textarea' : 'text'" :rows="4" width="22rem" v-model="ruleForm.ip" :placeholder="handleOptions[tabActive].placeholder" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { batchSetMysqlAuth, getPermission, setPermission, setPgSqlAuth } from '@/api/database'
import { assembBatchParams, assembBatchResults } from '@/public'
import { openResultView } from '@/views/database/useMethod'
import { getDatabaseStore } from '@database/useStore'
import { useConfirm } from '@hooks/tools'
import { Message } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'

interface Props {
	compData?: {
		type: 'single' | 'multlples' // 单个还是批量
		rowData: any
		config: {
			enable: boolean
			exclude: any[]
			clearBatch: any
		}
	}
}

const {
	refs: { tabActive },
	refreshTableList,
} = getDatabaseStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		type: 'single',
		rowData: {},
		config: {},
	}),
})

const { rowData, type } = props.compData

const { enable, exclude, clearBatch } = props.compData.config

const permissionFormRef = ref() // 表单实例
const ruleForm = reactive<any>({
	permission: '',
	ip: '',
}) // 修改权限表单数据

const rules = {
	ip: [{ required: true, trigger: ['blur', 'change'], message: '请输入IP地址' }],
} // 校验规则

/**
 * @description 获取mysql权限
 */
const getMysqlPermission = async () => {
	// 单选行数据时获取权限
	const { msg, status } = await useDataHandle({
		request: getPermission({ name: rowData.username }),
		data: {
			msg: String,
			status: Boolean,
		},
	})
	if (!status) return Message.error(msg)
	ruleForm.permission = msg
	// 配置的指定ip
	if (msg !== '%' && msg !== '127.0.0.1') {
		ruleForm.permission = 'ip'
		ruleForm.ip = msg.replace(/,/g, '\n') // 将逗号替换为空格
	}
}

/**
 * @description 处理权限参数
 */
const handleMysqlParams = () => {
	const { permission: dataAccess, ip: address } = ruleForm
	let data: any = {
		name: rowData.username,
		dataAccess,
		access: dataAccess === 'ip' ? address : dataAccess,
		address: dataAccess === 'ip' ? address : '',
	}
	// 批量操作时
	if (type == 'multlples') {
		delete data.name
		return assembBatchParams(rowData, exclude, enable, { params: { ...data } })
	}
	return data
}

/**
 * @description 设置mysql权限
 */
const setMysqlPermission = async () => {
	const params = handleMysqlParams()
	if (type === 'multlples') {
		const res = await batchSetMysqlAuth(params)
		const { data } = assembBatchResults(res.data)
		data.length && openResultView(data, { title: '修改权限' })
		clearBatch && clearBatch()
		return res
	} else {
		const res = await useDataHandle({
			loading: '正在修改权限，请稍后...',
			request: setPermission(params),
			message: type === 'single', // 批量时getSearchData不提示笑弹框
			data: {
				error: [Object, data => Object.keys(data)],
				success: Array,
				status: Boolean,
				msg: String,
			},
		})
		if (!res.status) return Message.error(res.msg)
		return res
	}
}

/**
 * @description 获取pgsql权限
 */
const getPgsqlPermission = () => {
	const flag = rowData.listen_ip !== '0.0.0.0/0' && rowData.listen_ip !== '127.0.0.1/32'
	ruleForm.ip = flag ? rowData.listen_ip : ''
	ruleForm.permission = flag ? 'ip' : rowData.listen_ip
}

/**
 * @description 设置pgsql权限
 */
const setPgSqlPermission = async () => {
	const { permission: dataAccess, ip: address } = ruleForm
	const params: { [key: string]: any } = {
		data_name: rowData.name,
		username: rowData.username,
		listen_ip: dataAccess === 'ip' ? address : dataAccess,
	}
	const res = await useDataHandle({
		loading: '正在修改权限，请稍后...',
		request: setPgSqlAuth({ data: JSON.stringify(params) }),
		success: ({ data: res }: any) => {
			Message.request({ msg: res.msg || res.data, status: res.status })
		},
	})
	return res
}

/**
 * @description 处理事件
 */
const handleOptions: { [key: string]: any } = {
	pgsql: {
		option: [
			{ label: '所有人', value: '0.0.0.0/0' },
			{ label: '本地服务器', value: '127.0.0.1/32' },
		],
		placeholder: '填写格式如：192.168.69.11/24',
		getPermission: getPgsqlPermission, // 获取权限
		setPermission: setPgSqlPermission, // 设置权限
	},
	mysql: {
		option: [
			{ label: '所有人', value: '%' },
			{ label: '本地服务器', value: '127.0.0.1' },
		],
		placeholder: '如果要允许IP段访问，可以使用%作为通配符，如127.17.%.%，如需要填写多个IP，请换行填写，每行一个IP',
		getPermission: getMysqlPermission,
		setPermission: setMysqlPermission,
	},
}

/**
 * @description 提交修改权限
 * @param close 关闭弹窗
 */
const onConfirm = async (close: AnyFunction) => {
	await permissionFormRef.value.validate() // 校验表单
	const { permission: dataAccess, ip: address } = ruleForm
	if (['%', '0.0.0.0/0'].includes(dataAccess)) {
		await useConfirm({
			title: '提示',
			content: '设置权限为所有人后，将会导致数据库安全性降低，他人可以随意访问数据库，是否继续操作？',
			icon: 'warning-filled',
		})
	}
	const res = await handleOptions[tabActive.value].setPermission()
	if (res.status) {
		close()
		refreshTableList()
	}
}

/**
 * @description 打开弹窗时获取权限
 */
const getPermissionData = async () => {
	// 当操作类别为多选时，权限默认为本地
	if (type == 'multlples') {
		ruleForm.permission = handleOptions[tabActive.value].option.filter((item: any) => item.label.includes('本地'))[0].value
		return
	}
	// 获取权限操作
	handleOptions[tabActive.value].getPermission()
}

onMounted(() => {
	getPermissionData()
})

defineExpose({ onConfirm })
</script>
