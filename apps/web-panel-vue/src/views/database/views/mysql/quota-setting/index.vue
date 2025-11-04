<template>
	<div class="p-[20px]">
		<el-form ref="quotaDBFormRef" :model="capacityData" :rules="rules" class="px-[2rem] flex justify-center flex-col justify-items-start addfrom">
			<el-form-item label="当前已用容量：" prop="used">
				<bt-input v-model="useSize.split(' ')[0]" class="mr-4" width="16rem" readonly :textType="useSize.split(' ')[1]">
					<template #append v-if="useSize.split(' ')[1]"> {{ useSize.split(' ')[1] }} </template>
				</bt-input>
			</el-form-item>
			<el-form-item label="当前容量配额：" prop="size">
				<bt-input v-model="capacityData.size" class="mr-4" width="16rem" type="number" @change="checkSize">
					<template #append> MB </template>
				</bt-input>
			</el-form-item>
			<el-form-item label="写入权限状态：">
				<div class="flex items-center">
					<span :class="insertAuthClass">{{ insertAuth }}</span>
					<span v-if="insertAuth === '已撤销'">【<span class="bt-link" @click="recoverDataAuth">恢复数据库写入权限</span>】</span>
					<i :disabled="refreshButton" :class="`svgtofont-el-${refreshButton ? 'loading' : 'refresh'}  bt-link ml-4px`" @click="onRefreshInsertAuth"></i>
				</div>
			</el-form-item>
			<el-form-item label="设置容量告警：">
				<el-switch v-model="capacityData.quota_push.status" @change="checkStatus"></el-switch>
			</el-form-item>
			<el-form-item v-if="capacityData.quota_push.status">
				<el-form-item label="触发告警大小：" prop="quota_push.size">
					<bt-input v-model="capacityData.quota_push.size" class="mr-4" width="16rem" type="number" :min="1">
						<template #append> MB </template>
					</bt-input>
				</el-form-item>
				<el-form-item label="告警次数：" class="mt-20px" prop="quota_push.push_count">
					<div class="flex items-center">
						<span class="text-small text-secondary whitespace-nowrap">每日最多触发</span><bt-input v-model="capacityData.quota_push.push_count" class="mx-4" width="10rem" type="number"></bt-input><span class="text-small text-secondary whitespace-nowrap">次告警</span>
					</div>
				</el-form-item>
				<el-form-item label="告警方式：" class="mt-20px">
					<bt-alarm-old-select ref="alertItemRef" class="!w-[28rem]" v-model="capacityData.module" :isMult="true" :needAll="false" name="channel" :limit="['sms']" />
				</el-form-item>
			</el-form-item>
			<ul class="mt-8 leading-10 list-disc">
				<li v-show="capacityData.quota_push.status">点击配置后告警状态未更新，尝试点击【<span class="bt-link" @click="refresh">手动刷新</span>】</li>
				<li>温馨提示：此功能为企业版专享功能</li>
				<li class="text-danger">到达限额容量后仅撤销当前数据库用户插入权限</li>
				<li class="text-danger">使用面板导入或使用root账号导入，不受配额影响</li>
				<li>配额容量：如需取消容量配额，请设为“0”</li>
				<li>此处是直接计算数据文件大小，与实际占用会存在些许误差</li>
				<li>写入权限状态需在后台计算获取，若进入状态不是最新，请重新手动刷新权限</li>
			</ul>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { addDatabaseQuota, databaseQuotaCheck, restoreDataAuth } from '@/api/database'
import { useDataHandle } from '@hooks/tools'
import { getDatabaseStore } from '@/views/database/useStore'
import { Message } from '@hooks/tools'
import { isArray } from '@utils/index'
import { dataBak } from '@/views/database/useMethod'

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { refreshTableList } = getDatabaseStore()

const quotaDBFormRef = ref<any>() // 表单实例
const refreshButton = ref(false) // 表单禁用

const alertItemRef = ref<any>() // 告警方式

const { quota, name } = props.compData
const { used, size, quota_push, quota_storage } = quota

const popupClose = inject<any>('popupClose') //     弹窗关闭

const checkIsPositiveInteger = (rule, value, callback) => {
	if (value === '') callback(new Error('请输入配置数据'))
	const reg = /^(0|[1-9][0-9]*)$/
	if (reg.test(value) && value !== 0) {
		callback()
	} else {
		callback(new Error('请输入大于等于0的正整数'))
	}
	callback()
}

// 表单校验
const rules = reactive({
	size: [{ required: true, message: '请输入容量配额', trigger: 'blur' }, { validator: checkIsPositiveInteger }],
	'quota_push.size': [{ trigger: 'blur', validator: checkIsPositiveInteger }],
	'quota_push.push_count': [{ required: true, message: '请输入容量配额', trigger: 'blur' }, { validator: checkIsPositiveInteger }],
})

// 容量配置
const capacityData = reactive({
	used: used,
	size: size,
	quota_push: quota_push,
	quota_storage: quota_storage,
	module: !isArray(quota_push.module) ? quota_push.module?.split(',') : quota_push.module,
})

const insertAuthClass = computed({
	get: () => {
		return Object.keys(quota_storage).includes('insert_accept') ? (quota_storage.insert_accept ? 'text-primary' : 'text-danger') : 'text-warning'
	},
	set: (val: string) => val,
})

// 写入权限
const insertAuth = computed({
	get: () => {
		return Object.keys(quota_storage).includes('insert_accept') ? (quota_storage.insert_accept ? '正常' : '已撤销') : '未配置'
	},
	set: (val: string) => val,
})

// 格式化容量大小
const formatBytes = (bytes: number, decimals = 2) => {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i))?.toFixed(dm)) + ' ' + sizes[i]
}
// 使用容量大小
const useSize = computed(() => {
	return capacityData.used === -1 ? '未配置容量大小' : formatBytes(capacityData.used)
})

// 判断容量大小
const checkSize = (val: number) => {
	if (val < 1) capacityData.quota_push.status = false
}
// 判断状态
const checkStatus = (val: boolean | number | string) => {
	if (val && Number(capacityData.size) <= 0) {
		Message.error('请输入容量配额')
		capacityData.quota_push.status = false
	}
}

// 手动刷新
const refresh = async () => {
	alertItemRef.value?.refresh()
	Message.success('刷新成功')
}

/**
 * @description 提交修改权限
 * @param close 关闭弹窗
 */
const onConfirm = async (close: any) => {
	await quotaDBFormRef.value.validate()

	const data = {
		db_name: name,
		quota_push: {
			module: capacityData.module?.join(','),
			status: capacityData.quota_push.status,
			size: Number(capacityData.quota_push.size),
			push_count: Number(capacityData.quota_push.push_count) || 0,
		},
		quota_storage: {
			size: Number(capacityData.size),
		},
	}

	await useDataHandle({
		loading: '正在提交，请稍后...',
		request: addDatabaseQuota(JSON.stringify(data)),
		message: true,
	})

	refreshTableList()
	close()
}

// const tableData = inject('tableData', []) // 表格数据

/**
 * @description 刷新写入权限
 */
const onRefreshInsertAuth = async () => {
	refreshButton.value = true
	await useDataHandle({
		request: databaseQuotaCheck(),
		message: true,
	})
	await refreshTableList()
	// 在dataBak.value中找到对应的数据，然后更新数据
	dataBak.value.forEach((item: any) => {
		if (item.id === props.compData.id) {
			const { quota_storage } = item.quota
			const isHaveFlag = Object.keys(quota_storage).includes('insert_accept')
			insertAuth.value = isHaveFlag ? (quota_storage.insert_accept ? '正常' : '已撤销') : '未配置'
			insertAuthClass.value = isHaveFlag ? (quota_storage.insert_accept ? 'text-primary' : 'text-danger') : 'text-warning'
		}
	})
	refreshButton.value = false
	// 获取当前表格数据
	Message.success('已提交刷新权限任务，将会在后台计算运行，时间约为1分钟')
}

/**
 * @description 恢复数据库写入权限
 */
const recoverDataAuth = async () => {
	await useDataHandle({
		loading: '正在恢复，请稍后...',
		request: restoreDataAuth({ db_name: name }),
		message: true,
	})

	popupClose()
	refreshTableList()
}

defineExpose({
	onConfirm,
})
</script>
