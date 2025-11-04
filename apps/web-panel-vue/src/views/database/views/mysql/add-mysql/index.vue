<template>
	<div class="p-[24px]">
		<el-form :disabled="formDisabled" :model="addForm" ref="addFormRef" :rules="rules" @submit.native.prevent>
			<el-form-item label="数据库名" prop="name">
				<el-col :span="14">
					<el-input placeholder="新的数据库名称" v-model="addForm.name" @input="changeDatabaseName" />
				</el-col>
				<el-col :span="10">
					<el-form-item>
						<el-select v-model="addForm.codeing" class="ml-8px !w-[13.2rem]">
							<el-option label="utf8" value="utf8"></el-option>
							<el-option label="utf8mb4" value="utf8mb4"></el-option>
							<el-option label="gbk" value="gbk"></el-option>
							<el-option label="big5" value="big5"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-form-item>
			<el-form-item label="用户名" prop="db_user">
				<bt-input width="38rem" placeholder="数据库用户" v-model="addForm.db_user"></bt-input>
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<bt-input-icon width="38rem" icon="el-refresh" v-model.sync="addForm.password" @icon-click="() => (addForm.password = getRandomPwd(16))" :isActive="true"></bt-input-icon>
			</el-form-item>
			<el-form-item label="访问权限" prop="dataAccess">
				<el-select class="!w-[38rem]" v-model="addForm.dataAccess" @change="onChangeAccess">
					<el-option label="所有人" value="%"></el-option>
					<el-option label="本地服务器" value="127.0.0.1"></el-option>
					<el-option label="指定ip" value="ip"></el-option>
				</el-select>
				<el-form-item prop="address">
					<bt-input v-if="addForm.dataAccess === 'ip'" type="textarea" :rows="4" placeholder="如需填写多个IP，请换行填写，每行一个IP" v-model="addForm.address" :width="'38rem'" class="mt-[8px] w-full" />
				</el-form-item>
			</el-form-item>

			<el-form-item label="添加至" prop="sid" class="!mb-0">
				<el-select class="!w-[24rem]" v-model="addForm.sid">
					<el-option v-for="(item, index) in addressOptions" :key="index" :label="item.ps + (item.db_host ? '（' + item.db_host + '）' : '')" :value="item.id"> </el-option>
				</el-select>
				<bt-link class="ml-[8px]" @click="openServerView">管理远程数据库</bt-link>
			</el-form-item>
			<el-form-item label=" " class="!mb-0">
				<ServerStatus :server="{ sid: addForm.sid, ip: selectedServer }"> </ServerStatus>
			</el-form-item>
		</el-form>
	</div>
</template>
<script lang="ts" setup>
import type { AddFormProps, CloudServerItem } from '@database/types'

import { getRandomPwd, checkIp, inputFocus } from '@utils/index'
import { Message } from '@hooks/tools'
import { useCheckServerConnection, openServerView } from '@/views/database/useMethod'
import { getDatabaseStore } from '@database/useStore'
import { addDatabase } from '@/api/database'
import { useDataHandle } from '@hooks/tools'

import ServerStatus from '@database/public/server-status/index.vue'

interface Props {
	compData: {
		refresh: () => Promise<Array<CloudServerItem>>
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		refresh: async () => [],
	}),
})

const { refreshTableList } = getDatabaseStore()

const addFormRef = ref() // 添加数据库表单
const formDisabled = ref(false) // 表单禁用
const addressOptions = ref<Array<CloudServerItem>>([]) // 服务器列表

const addForm = ref<AddFormProps>({
	name: '',
	db_user: '',
	password: getRandomPwd(16),
	dataAccess: '127.0.0.1',
	address: '', //ip
	codeing: 'utf8mb4',
	dtype: 'MySQL',
	ps: '',
	sid: 0,
	listen_ip: '0.0.0.0/0',
	host: '',
}) //添加表单数据

const rules = {
	name: [{ required: true, message: '请输入数据库名', trigger: ['blur', 'change'] }],
	db_user: [{ required: true, message: '请输入用户名', trigger: ['blur', 'change'] }],
	password: [{ required: true, message: '请输入密码', trigger: ['blur', 'change'] }],
	address: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (addForm.value.dataAccess === 'ip') {
					if (value === '') {
						callback(new Error('请输入IP地址'))
					} else {
						value.split('\n').forEach((item: any) => {
							if (item === '') {
							} else {
								if (!checkIp(item)) {
									callback(new Error('请输入正确的IP地址'))
								}
							}
						})
						callback()
					}
				}
				callback()
			},
			trigger: ['blur', 'change'],
		},
	],
} // 表单校验规则

const selectedServer = computed(() => addressOptions.value.find((item: any) => item.id === addForm.value.sid)?.db_host || '') // 选中的服务器

/**
 * @description 输入框数据变化赋值
 */
const changeDatabaseName = (val: any) => {
	addForm.value.db_user = val
	addForm.value.ps = val
}

/**
 * @description 访问权限变化
 */
const onChangeAccess = () => {
	// 清除访问权限address表单验证
	addFormRef.value.clearValidate('address')
}

/**
 * @description 增加数据库表单提交方法
 */
const submitAddForm = async (close: any) => {
	await addFormRef.value.validate()
	// 检查服务器状态
	await CheckStatusEvent()

	if (addForm.value.dataAccess === 'ip') {
		addForm.value.address = addForm.value.address.replace(/\n/g, ',')
	}

	await useDataHandle({
		request: addDatabase({
			...addForm.value,
			sid: String(addForm.value.sid),
			address: addForm.value.dataAccess === 'ip' ? addForm.value.address : addForm.value.dataAccess,
		}),
		loading: '正在添加数据库，请稍后...',
		message: true,
	})
	refreshTableList() // 刷新列表
	close()
}

/**
 * @description 检查服务器状态
 */
const CheckStatusEvent = async () => {
	const loading = Message.load('正在连接服务器，请稍后...')
	try {
		const { status, msg, err_msg } = await useCheckServerConnection(addForm.value.sid)
		if (!status) {
			Message.error(err_msg)
			return false
		}
		return true
	} catch (error) {
		console.log(error)
	} finally {
		loading.close()
	}
}

onMounted(async () => {
	addressOptions.value = await props.compData.refresh()
	addForm.value.sid = addressOptions.value[0]?.id
	// nextTick(() => {
	// 	inputFocus(addFormRef.value.$el, 'name') // 聚焦密码输入框
	// })
})

defineExpose({ onConfirm: submitAddForm })
</script>

<style lang="css" scoped>
:deep(.el-select .el-input--small input.el-input__inner) {
	padding-right: 2.4rem;
}
</style>
