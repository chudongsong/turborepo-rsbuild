<template>
	<div class="p-[24px]">
		<el-form :disabled="formDisabled" :model="addForm" ref="addFormRef" :rules="rules" @submit.native.prevent>
			<el-form-item label="数据库名" prop="name">
				<el-input class="w-[38rem]" ref="data_name" placeholder="新的数据库名称" v-model="addForm.name" @input="changeDatabaseName" />
			</el-form-item>
			<el-form-item label="用户名" prop="db_user">
				<bt-input width="38rem" placeholder="数据库用户" v-model="addForm.db_user"></bt-input>
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<bt-input-icon width="38rem" icon="el-refresh" v-model.sync="addForm.password" @icon-click="() => (addForm.password = getRandomPwd(16))" :isActive="true"></bt-input-icon>
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
import type { AddFormProps } from '@database/types'

import { getRandomPwd } from '@utils/index'
import { getDatabaseStore } from '@database/useStore'
import { Message } from '@hooks/tools'
import { useCheckServerConnection, openServerView } from '@/views/database/useMethod'
import { addModulesDatabase } from '@/api/database'

import { useDataHandle } from '@hooks/tools'

import ServerStatus from '@database/public/server-status/index.vue'

interface Props {
	compData: {
		options: Array<ServerItem>
	}
}

interface ServerItem {
	id: number
	db_host: string
	ps: string
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		options: [],
	}),
})

const {
	refs: { tabActive },
	refreshTableList,
} = getDatabaseStore()

const addFormRef = ref() // 添加表单ref
const formDisabled = ref(false) // 表单禁用
const addressOptions = ref<Array<ServerItem>>([]) // 服务器列表
const selectedServer = computed(() => addressOptions.value?.find((item: any) => item.id === addForm.value.sid)?.db_host || '') // 选中的服务器

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
	name: [
		{ required: true, message: '请输入数据库名', trigger: ['blur', 'change'] },
		{
			validator: (rule: any, value: any, callback: any) => {
				// 不能以数字开头
				if (/^\d/.test(value)) {
					callback(new Error('数据库名不能以数字开头'))
				}
				callback()
			},
		},
	],
	db_user: [{ required: true, message: '请输入用户名', trigger: ['blur', 'change'] }],
	password: [{ required: true, message: '请输入密码', trigger: ['blur', 'change'] }],
} // 表单校验规则

/**
 * @description 输入框数据变化赋值
 */
const changeDatabaseName = (val: any) => {
	addForm.value.db_user = val
	addForm.value.ps = val
}

/**
 * @description 增加数据库表单提交方法
 */
const onSubmit = async (close: any) => {
	await addFormRef.value.validate()
	// 再次检查一遍
	await CheckStatusEvent()
	let param: any = {
		...addForm.value,
		sid: String(addForm.value.sid),
	}
	await useDataHandle({
		loading: '正在添加数据库, 请稍后...',
		request: addModulesDatabase(param, tabActive.value),
		message: true,
	})
	refreshTableList()
	close()
}

/**
 * @description 检查服务器状态
 */
const CheckStatusEvent = async () => {
	try {
		formDisabled.value = true
		const { status, msg, err_msg } = await useCheckServerConnection(addForm.value.sid)
		if (!status) {
			Message.error(err_msg)
			throw new Error('服务器连接失败')
		}
		formDisabled.value = false
	} catch (error) {
		console.log(error)
	}
}

onMounted(async () => {
	addressOptions.value = (await props.compData?.refresh()) || []
	addForm.value.sid = addressOptions.value[0]?.id
})

defineExpose({ onConfirm: onSubmit })
</script>

<style lang="css" scoped>
:deep(.el-select .el-input--small input.el-input__inner) {
	padding-right: 2.4rem;
}
</style>
