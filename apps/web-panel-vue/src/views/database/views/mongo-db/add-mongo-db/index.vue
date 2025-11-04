<template>
	<div class="p-[24px]">
		<el-form :disabled="formDisabled" :model="addForm" ref="addFormRef" :rules="rules" @submit.native.prevent>
			<!-- 数据库名 -->
			<el-form-item label="数据库名" prop="name">
				<el-input class="w-[38rem]" ref="data_name" placeholder="新的数据库名称" v-model="addForm.name" @input="changeDatabaseName" />
			</el-form-item>

			<!-- 添加至 -->
			<el-form-item label="添加至" prop="sid" class="!mb-0">
				<el-select class="!w-[24rem]" v-model="addForm.sid">
					<el-option v-for="(item, index) in addressOptions" :key="index" :label="item.ps + (item.db_host ? '（' + item.db_host + '）' : '')" :value="item.id"> </el-option>
				</el-select>
				<bt-link class="ml-[8px]" @click="openServerView">管理远程数据库</bt-link>
			</el-form-item>

			<!-- 数据库连接状态 -->
			<el-form-item label=" " class="!mb-0">
				<ServerStatus :server="{ sid: addForm.sid, ip: selectedServer }"> </ServerStatus>
			</el-form-item>
		</el-form>
	</div>
</template>
<script lang="ts" setup>
import type { CloudServerItem } from '@database/types'
import type { AddFormProps } from '@database/types'

import { addModulesDatabase } from '@/api/database'
import { getDatabaseStore } from '@database/useStore'

import { getRandomPwd } from '@utils/index'
import { Message } from '@hooks/tools'
import { useCheckServerConnection, openServerView } from '@/views/database/useMethod'
import { useHandleError } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'

import ServerStatus from '@database/public/server-status/index.vue'
import { add } from 'ramda'

interface Props {
	compData: {
		options: Array<CloudServerItem>
	}
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

const addFormRef = ref() // 表单实例
const formDisabled = shallowRef<boolean>(false) // 表单禁用

//添加表单数据
const addForm = ref<AddFormProps>({
	name: '',
	db_user: '',
	password: getRandomPwd(16),
	dataAccess: '127.0.0.1',
	address: '', //ip
	codeing: 'utf8mb4',
	dtype: 'MongoDb',
	ps: '',
	sid: 0,
	listen_ip: '0.0.0.0/0',
	host: '',
})

// 服务器列表
const addressOptions = ref<Array<CloudServerItem>>([])

// 表单校验规则
const rules = {
	name: [{ required: true, message: '请输入数据库名', trigger: ['blur', 'change'] }],
}

// 选中的服务器
const selectedServer = computed(() => {
	return addressOptions.value.find((item: CloudServerItem) => item.id === addForm.value.sid)?.db_host || ''
})

/**
 * @description 输入框数据变化赋值
 */
const changeDatabaseName = (val: string) => {
	addForm.value.db_user = val
	addForm.value.ps = val
}

/**
 * @description 增加数据库表单提交方法
 */
const onConfirm = async (close: AnyFunction) => {
	await addFormRef.value.validate()
	const res: any = await CheckStatusEvent() // 再次检查一遍数据库连接v
	if (!res) return false
	await useDataHandle({
		loading: '正在添加数据库, 请稍后...',
		request: addModulesDatabase(addForm.value, tabActive.value),
		message: true,
		success: (res: any) => {
			if (res.status) {
				close()
				refreshTableList()
			}
		},
	})
}

/**
 * @description 检查服务器状态
 */
const CheckStatusEvent = async () => {
	try {
		formDisabled.value = true
		const { db_status, msg, err_msg } = await useCheckServerConnection(addForm.value.sid)
		if (!db_status) {
			Message.error(err_msg || msg)
			return false
		}
		formDisabled.value = false
		return true
	} catch (error) {
		useHandleError(error)
	}
}

onMounted(async () => {
	addressOptions.value = (await props.compData?.refresh()) || []
	addForm.value.sid = addressOptions.value[0]?.id
})

defineExpose({ onConfirm })
</script>

<style lang="css" scoped>
:deep(.el-select .el-input--small input.el-input__inner) {
	padding-right: 2.4rem;
}
</style>
