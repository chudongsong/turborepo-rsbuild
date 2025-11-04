<template>
	<div class="p-[24px]">
		<el-form :model="serverForm" :rules="rules" ref="cloudForm" @submit.native.prevent>
			<el-form-item label="服务器地址" prop="db_host">
				<el-input v-focus class="!w-[24rem]" placeholder="请输入服务器地址" v-model="serverForm.db_host" @input="changeServerName" />
			</el-form-item>

			<el-form-item label="数据库端口" prop="db_port">
				<bt-input type="number" class="!w-[24rem]" v-model="serverForm.db_port"></bt-input>
			</el-form-item>

			<el-form-item label="管理员名称" prop="db_user" v-if="tabActive != 'redis'">
				<bt-input v-model="serverForm.db_user" placeholder="请输入管理员名称" class="!w-[24rem]"></bt-input>
			</el-form-item>

			<el-form-item label="管理员密码" prop="db_password">
				<bt-input v-model="serverForm.db_password" placeholder="请输入管理员密码" class="!w-[24rem]"></bt-input>
			</el-form-item>

			<el-form-item label="备注">
				<bt-input v-model="serverForm.ps" placeholder="服务器备注" class="!w-[24rem]"></bt-input>
			</el-form-item>
		</el-form>

		<ul class="ml-20px mt-12px leading-8 text-small list-disc">
			<li v-if="tips?.length && tips[0]">{{ tips[0] }}</li>
			<li v-for="(help, index) in helpList" :key="index">{{ help.content }}</li>
			<li v-if="tips?.length && tips[1]">{{ tips[1] }}</li>
		</ul>
	</div>
</template>
<script lang="ts" setup>
import type { CloudServerItem } from '@database/types'

import { addServer, addModulesServer, modifyServer, modifyModulesServer } from '@api/database'
import { checkDomainIp, checkIp } from '@utils/index'
import { getDatabaseStore } from '@database/useStore'
import { showTips as tips } from '@database/useMethod'

import { useDataHandle } from '@hooks/tools'

interface Props {
	compData?: {
		row: CloudServerItem
		refreshEvent: AnyFunction
	}
}

const {
	refs: { tabActive },
} = getDatabaseStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		row: {},
		refreshEvent: () => {},
	}),
})

const cloudForm = ref() // 表单实例
const isFirst = ref(true) // 是否第一次加载

const placeholderData: any = {
	mysql: { port: 3306, db_user: 'root' },
	mongodb: { port: 27017, db_user: 'root' },
	sqlserver: { port: 1433, db_user: 'sa' },
	pgsql: { port: 5432, db_user: 'postgres' },
	redis: { port: 6379, db_user: '' },
} // 占位符数据

const serverForm = ref({
	db_host: '',
	db_port: placeholderData[tabActive.value].port,
	db_user: placeholderData[tabActive.value].db_user,
	db_password: '',
	ps: '',
	type: tabActive.value,
}) // 增加远程数据库表单数据

const helpList = [{ content: '支持阿里云、腾讯云等云厂商的云数据库' }, { content: '注意1：请确保本服务器有访问数据库的权限' }, { content: '注意2：请确保填写的管理员帐号具备足够的权限' }] // 帮助文案列表

const rules = {
	db_host: [
		{ required: true, message: '请输入服务器地址', trigger: ['blur', 'change'] },
		{
			validator: (rule: any, value: any, callback: any) => {
				if ((!checkIp(value) && !checkDomainIp(value)) || value === '') {
					callback(new Error('请输入正确的服务器地址'))
				}
				callback()
			},
			trigger: ['blur', 'change'],
		},
	],
	db_password: [{ required: true, message: '请输入服务器密码', trigger: ['blur', 'change'] }],
	db_user: [{ required: true, message: '请输入管理员名称', trigger: ['blur', 'change'] }],
	db_port: [{ required: true, message: '请输入服务器端口', trigger: ['blur', 'change'] }],
} // 校验

/**
 * @description 输入框数据变化赋值
 * @param val 输入框值
 */
const changeServerName = (val: string) => {
	// 第一次加载+编辑时，不赋值
	if (isFirst.value && props.compData.row) return (isFirst.value = false)
	isFirst.value = false
	serverForm.value.ps = val
}

/**
 * @description 添加远程数据库
 */
const addServerEvent = async () => {
	await cloudForm.value.validate()

	let params = {
		...serverForm.value,
		db_ps: serverForm.value.ps,
	}
	await useDataHandle({
		loading: '正在添加远程服务器信息，请稍候...',
		request: tabActive.value === 'mysql' ? addServer(params) : addModulesServer({ data: JSON.stringify(params) }, tabActive.value),
		message: true,
	})
}

/**
 * @description 修改远程数据库
 */
const editServerEvent = async () => {
	await cloudForm.value.validate()

	let params = {
		...serverForm.value,
		db_ps: serverForm.value.ps,
	}
	if (tabActive.value !== 'mysql') params.type = tabActive.value

	await useDataHandle({
		loading: '正在修改远程服务器信息，请稍候...',
		request: tabActive.value === 'mysql' ? modifyServer(params) : modifyModulesServer({ data: JSON.stringify(params) }, tabActive.value),
		message: true,
	})
}

/**
 * @description 确认事件
 */
const onConfirm = async (close: AnyFunction) => {
	if (props.compData.row?.db_host) {
		await editServerEvent() // 编辑
	} else {
		await addServerEvent() // 添加
	}
	props.compData.refreshEvent() // 刷新列表
	close()
}

onMounted(() => {
	// 编辑时
	if (props.compData.row?.db_host)
		serverForm.value = {
			...props.compData.row,
			type: tabActive.value,
		}
})

defineExpose({ onConfirm })
</script>

<style lang="sass"></style>
