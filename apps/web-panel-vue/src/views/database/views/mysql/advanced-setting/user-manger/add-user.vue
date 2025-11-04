<template>
	<div class="p-[24px]">
		<el-form label-width="90px" :model="addUserForm" ref="addUserFormRef" :rules="addUserFormRules" v-bt-loading="addUserForm.loading" @submit.native.prevent>
			<el-form-item label="服务器" prop="password">
				<el-select v-model="addUserForm.sid" class="mr-[1.5rem] !w-[16rem]" placeholder="请选择" @change="getDatabaseEvent">
					<el-option v-for="item in serverList" :key="item.id" :label="item.ps" :value="item.id" />
				</el-select>
			</el-form-item>
			<el-form-item label="用户名" prop="username">
				<bt-input width="38rem" placeholder="请填写用户名" v-model="addUserForm.username"></bt-input>
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<bt-input width="38rem" iconType="refresh" v-model="addUserForm.password" :is-null="true"></bt-input>
			</el-form-item>

			<el-form-item label="访问权限" prop="host">
				<el-col :span="8">
					<el-select v-model="addUserForm.host" class="!w-[16rem]">
						<el-option label="所有人" value="%"></el-option>
						<el-option label="本地服务器" value="127.0.0.1"></el-option>
						<el-option label="指定ip" value="ip"> </el-option>
					</el-select>
				</el-col>
				<el-form-item prop="address" v-show="addUserForm.host === 'ip'">
					<bt-input placeholder="请输入指定ip" v-model="addUserForm.address" width="22.3rem" class="ml-[1rem]"> </bt-input>
				</el-form-item>
			</el-form-item>
		</el-form>
	</div>
</template>
<script lang="ts" setup>
import type { UserFormProps } from '@database/types'

import { getRandomChart, checkIp } from '@utils/index'
import { Message, useDataHandle } from '@hooks/tools'
import { getDatabasesList, addUser } from '@/api/database'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const databaseOptions = ref<any[]>([]) // 数据库选项
const addUserFormRef = ref<any>(null) // 添加用户表单ref
const serverList = ref(props.compData.serverList) // 服务器列表

const addUserForm = reactive<UserFormProps>({
	sid: 0,
	username: '',
	password: getRandomChart(),
	host: '127.0.0.1',
	dbname: '*',
	tbname: '*',
	address: '',
	access: '',
	disabled: false,
	selected: [1, 6, 21, 22], // 数据库选中的权限
	loading: false,
}) // 添加用户表单

const addUserFormRules = {
	username: [{ required: true, message: '请输入用户名', trigger: ['blur'] }],
	password: [{ required: true, message: '请输入密码', trigger: ['blur'] }],
	address: [
		{
			required: true,
			validator: (rule: any, value: any, callback: any) => {
				if (!checkIp(value) && addUserForm.host === 'ip') {
					callback(new Error('请输入正确的ip地址'))
				} else {
					callback()
				}
			},
			trigger: ['blur'],
		},
	],
	tbname: [
		{
			required: true,
			validator: (rule: any, value: any, callback: any) => {
				if (value === '' && addUserForm.dbname !== '*') {
					callback(new Error('请选择数据库表'))
				} else {
					callback()
				}
			},
			trigger: ['blur'],
		},
	],
}

/**
 * @description 打开查询数据库
 */
const getDatabaseEvent = async () => {
	try {
		addUserForm.loading = true
		const res = await getDatabasesList({ sid: addUserForm.sid })
		databaseOptions.value = res.data
	} catch (error) {
		Message.error(error)
	} finally {
		addUserForm.loading = false
	}
}

/**
 * @description 提交添加用户-参数处理
 */
const handleSubmitParams = () => {
	if (addUserForm.host === 'ip') addUserForm.host = addUserForm.address
	if (addUserForm.dbname === '*') addUserForm.tbname = '*'
	let params = {
		sid: addUserForm.sid,
		username: addUserForm.username,
		password: addUserForm.password,
		host: addUserForm.host,
		db_name: addUserForm.dbname,
		tb_name: addUserForm.tbname,
	}
	return params
}

/**
 * @description 提交添加用户
 */
const onConfirm = async (close: any) => {
	try {
		await addUserFormRef.value.validate() // 校验表单
		const params = handleSubmitParams() // 处理参数

		await useDataHandle({
			loading: '正在添加用户,请稍后...',
			request: addUser(params),
			message: true,
			success: (res) => {
				if (res.status) {
					props.compData.refreshFn && props.compData.refreshFn()
					close()
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

defineExpose({ onConfirm })

onMounted(getDatabaseEvent)
</script>
