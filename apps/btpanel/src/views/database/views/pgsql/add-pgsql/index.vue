<template>
	<div class="p-[24px]">
		<el-form :disabled="formDisabled" :model="addForm" ref="addFormRef" :rules="rules" @submit.native.prevent>
			<el-form-item label="数据库名" prop="name">
				<bt-input width="38rem" ref="data_name" placeholder="新的数据库名称" v-model="addForm.name" @input="changeDatabaseName" />
			</el-form-item>
			<el-form-item label="用户名" prop="db_user">
				<bt-input width="38rem" placeholder="数据库用户" v-model="addForm.db_user"></bt-input>
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<bt-input-icon width="38rem" icon="el-refresh" v-model.sync="addForm.password" @icon-click="() => (addForm.password = getRandomPwd(16))" :isActive="true"></bt-input-icon>
			</el-form-item>

			<el-form-item label="访问权限" prop="dataAccess">
				<el-select class="!w-[38rem]" v-model="addForm.listen_ip">
					<el-option label="所有人" value="0.0.0.0/0"></el-option>
					<el-option label="本地服务器" value="127.0.0.1/32"></el-option>
					<el-option label="指定ip" value="ip"></el-option>
				</el-select>
				<el-form-item prop="host">
					<bt-input v-if="addForm.listen_ip === 'ip'" placeholder="填写格式如：192.168.69.11/24" v-model="addForm.host" :width="'38rem'" class="mt-8px w-full" />
				</el-form-item>
			</el-form-item>

			<el-form-item label="添加至" prop="sid" class="!mb-0">
				<el-select class="!w-[24rem]" v-model="addForm.sid">
					<el-option v-for="(item, index) in addressOptions" :key="index" :label="item.ps + (item.db_host ? '（' + item.db_host + '）' : '')" :value="item.id"></el-option>
				</el-select>
				<bt-link class="ml-[8px]" @click="openServerView"> 管理远程数据库 </bt-link>
			</el-form-item>
			<el-form-item label=" " class="!mb-0">
				<ServerStatus :server="{ sid: addForm.sid, ip: selectedServer }"></ServerStatus>
			</el-form-item>
		</el-form>
	</div>
</template>
<script lang="ts" setup>
import type { CloudServerItem } from '@database/types'

import { addModulesDatabase } from '@/api/database'
import { openServerView, useCheckServerConnection } from '@/views/database/useMethod'
import { getDatabaseStore } from '@database/useStore'
import { Message } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'
import { getRandomPwd } from '@utils/index'

import ServerStatus from '@database/public/server-status/index.vue'

interface Props {
	compData: {
		options: Array<CloudServerItem>
	}
}

const {
	refs: { tabActive },
	refreshTableList,
} = getDatabaseStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		options: [],
	}),
})

const addFormRef = ref() // 表单实例
const formDisabled = shallowRef(false) // 表单禁用
const addressOptions = ref<Array<CloudServerItem>>([]) // 服务器列表

const addForm = ref({
	name: '',
	db_user: '',
	password: getRandomPwd(16),
	ps: '',
	sid: 0,
	listen_ip: '0.0.0.0/0',
	host: '',
}) //添加表单数据

const rules = {
	name: [{ required: true, message: '请输入数据库名', trigger: ['blur', 'change'] }],
	db_user: [{ required: true, message: '请输入用户名', trigger: ['blur', 'change'] }],
	password: [{ required: true, message: '请输入密码', trigger: ['blur', 'change'] }],
} // 表单校验规则

const selectedServer = computed(() => {
	return addressOptions.value.find((item: any) => item.id === addForm.value.sid)?.db_host || ''
}) // 选中的服务器

/**
 * @description 输入框数据变化赋值
 */
const changeDatabaseName = (val: any) => {
	addForm.value.db_user = addForm.value.name
	addForm.value.ps = addForm.value.name
}

/**
 * @description 增加数据库表单提交方法
 */
const submitAddForm = async (close: any) => {
	await addFormRef.value.validate()
	formDisabled.value = true
	// 再次检查一遍
	await CheckStatusEvent()
	let param: any = {
		...addForm.value,
		sid: String(addForm.value.sid),
	}
	param.listen_ip = param.listen_ip === 'ip' ? param.host : param.listen_ip
	// 请求
	await useDataHandle({
		loading: '正在添加数据库,请稍后...',
		request: addModulesDatabase(param, tabActive.value),
		message: true,
	})
	refreshTableList()
	close()
}

/**
 * @description 检查数据库状态
 */
const CheckStatusEvent = async () => {
	try {
		formDisabled.value = true
		const { status, msg, err_msg } = await useCheckServerConnection(addForm.value.sid)
		if (!status) {
			Message.error(err_msg || msg)
			throw new Error(err_msg || msg)
		}
		formDisabled.value = false
	} catch (error) {
		console.log(error)
	}
}

onMounted(async () => {
	addressOptions.value = await props.compData?.refresh()
	addForm.value.sid = addressOptions.value[0]?.id
})

defineExpose({ onConfirm: submitAddForm })
</script>

<style lang="css" scoped>
:deep(.el-select .el-input--small input.el-input__inner) {
	padding-right: 2.4rem;
}
</style>
