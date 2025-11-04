<template>
	<div class="p-[2rem]">
		<BtForm>
			<template #expire_time>
				<bt-form-item prop="expire_date" label="到期时间">
					<bt-radio
						v-model="formData.expireType"
						:options="[
							{ label: '永久', value: 0 },
							{ label: '自定义', value: 1 },
						]" />
					<bt-date-picker :disabled-date="disabledDate" class="!w-[15rem] ml-[3.5rem]" v-if="formData.expireType" v-model="formData.expire_date" type="date" date-format="YYYY-MM-DD" placeholder="选择到期日期" />
				</bt-form-item>
			</template>
			<template #package_id>
				<bt-form-item prop="expire_date" label="资源包">
					<div v-bt-loading="packageLoading" v-bt-loading:size="'small'" v-bt-loading:type="'horizontal'" v-bt-loading:title="'获取列表中'">
						<bt-select v-model="formData.package_id" :options="packageOptions" placeholder="请选择资源包" @change="changePackageEvent" clearable class="!w-[28rem]" />
						<bt-popover trigger="hover" placement="right" popper-style="padding:0" width="240px">
							<template #reference>
								<span class="bt-link text-small ml-[15px]">详情</span>
							</template>
							<table class="custom-table">
								<tbody>
									<tr>
										<td>资源名称</td>
										<td>{{ selectPackageOptions.package_name }}</td>
									</tr>
									<tr>
										<td>备注</td>
										<td>{{ selectPackageOptions.remark }}</td>
									</tr>
									<tr>
										<td>磁盘配额（MB）</td>
										<td>{{ selectPackageOptions.disk_space_quota ? getByteUnit(selectPackageOptions.disk_space_quota, true, 0) : '无限制' }}</td>
									</tr>
									<tr>
										<td>每月带宽限制（MB）</td>
										<td>{{ selectPackageOptions.monthly_bandwidth_limit ? getByteUnit(selectPackageOptions.monthly_bandwidth_limit, true, 0) : '无限制' }}</td>
									</tr>
									<tr>
										<td>最大网站数</td>
										<td>{{ selectPackageOptions.max_site_limit ? selectPackageOptions.max_site_limit : '无限制' }}</td>
									</tr>
									<tr>
										<td>数据库数量</td>
										<td>{{ selectPackageOptions.max_database ? selectPackageOptions.max_database : '无限制' }}</td>
									</tr>
									<tr>
										<td>启动子进程数量</td>
										<td>{{ selectPackageOptions.php_start_children }}</td>
									</tr>
									<tr>
										<td>最大子进程数量</td>
										<td>{{ selectPackageOptions.php_max_children }}</td>
									</tr>
								</tbody>
							</table>
						</bt-popover>
					</div>
				</bt-form-item>
			</template>
			<template #mountpoint>
				<bt-form-item prop="expire_date" label="存储磁盘">
					<div v-bt-loading="diskLoading" v-bt-loading:size="'small'" :disabled="isEdit" v-bt-loading:type="'horizontal'" v-bt-loading:title="'获取列表中'">
						<bt-select v-model="formData.mountpoint" :options="diskOptions" placeholder="请选择存储磁盘" clearable class="!w-[28rem]" />
					</div>
				</bt-form-item>
			</template>
		</BtForm>
	</div>
</template>
<script lang="ts" setup>
import { useForm, useMessage } from '@/hooks/tools'
import { FormInput, FormInputPaw } from '@/hooks/tools/form/form-item'
import { useAccountStore } from '../useStore'
import { checkEmail, getRandomChart, pawVerify, getByteUnit, isString } from '@/utils'
import { createAccountApi, modifyAccountApi } from '@/api/vhost'
import { formatDate } from '@vueuse/core'
const { isEdit, formData, packageOptions, packageLoading, renderPackageOptions, changePackageEvent, selectPackageOptions, diskOptions, diskLoading, renderDiskOptions, refreshList, resetFormData } = useAccountStore()

const { request: $request, load: $load } = useMessage()

const disabledDate = (time: any) => {
	return time.getTime() < Date.now() - 8.64e7
}

// 表单实体
const { BtForm, submit } = useForm({
	data: formData.value,
	options: (formData: any) => {
		return computed(() => [
			FormInput('用户名', 'username', {
				attrs: {
					class: '!w-[32rem]',
					clearable: true,
					placeholder: '请输入用户名',
					disabled: isEdit.value,
				},
				rules: [
					{ required: true, message: '用户名不能为空！', trigger: 'blur' },
					{ min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
				],
			}),
			FormInputPaw(
				'密码',
				'password',
				{
					attrs: { class: '!w-[32rem]', placeholder: '请输入密码' },
					rules: !isEdit.value
						? [
								{
									required: true,
									clearable: true,
									message: '密码不能为空！',
								},
								pawVerify({ complex: { length: 6 } }),
						  ]
						: [],
				},
				() => (formData.value.password = getRandomChart(12))
			),
			// FormInput('邮箱', 'email', {
			// 	attrs: {
			// 		class: '!w-[32rem]',
			// 		clearable: true,
			// 		placeholder: '请输入邮箱地址',
			// 	},
			// 	rules: [
			// 		{ required: true, message: '邮箱地址不能为空！', trigger: 'blur' },
			// 		{
			// 			validator: (rule: any, value: any, callback: any) => {
			// 				if (!value) return callback()
			// 				if (!checkEmail(value)) return callback(new Error('邮箱地址格式不正确！'))
			// 				callback()
			// 			},
			// 			trigger: ['blur', 'change'],
			// 		},
			// 	],
			// }),
			{
				type: 'slots',
				key: 'expire_time',
			},
			{
				type: 'slots',
				key: 'package_id',
			},
			!isEdit.value
				? {
						type: 'slots',
						key: 'mountpoint',
				  }
				: false,
			FormInput('备注', 'remark', {
				attrs: {
					class: '!w-[32rem]',
					clearable: true,
					placeholder: '请输入备注内容，可为空',
				},
			}),
		])
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		await validate() // 校验表单
		let newData = { ...param.value, email: 'vhost@bt.cn' }
		if (newData.expireType === 0) {
			newData.expire_date = '0000-00-00'
		} else {
			newData.expire_date = !isString(newData.expire_date) ? formatDate(newData.expire_date, 'YYYY-MM-DD') : newData.expire_date
		}
		delete newData.expireType // 删除无用字段
		const { max_site_limit, disk_space_quota, monthly_bandwidth_limit, max_email_account, max_database, php_start_children, php_max_children } = selectPackageOptions.value
		newData = {
			...newData,
			disk_space_quota,
			monthly_bandwidth_limit,
			max_site_limit,
			max_email_account,
			max_database,
			php_start_children,
			php_max_children,
		}
		if (!isEdit.value) {
			delete newData.account_id
		} else {
			delete newData.mountpoint
		}
		let rdata = null
		const loading = $load('正在提交表单信息，请稍候...')
		try {
			rdata = await (isEdit.value ? modifyAccountApi(newData) : createAccountApi(newData))
			$request(rdata)
			if (!rdata.status) return false
			resetFormData()
			refreshList()
		} catch (error) {
			console.log(error)
		} finally {
			loading.close()
		}
		return rdata
	},
})

onMounted(() => {
	renderPackageOptions()
	renderDiskOptions()
})

defineExpose({ onConfirm: submit, onCancel: resetFormData })
</script>
<style>
.custom-table {
	padding: 5px;
	font-size: var(--el-font-size-small);
}
.custom-table td {
	border: 1px solid var(--el-color-border-dark-tertiary);
	padding: 6px 4px;
}
.custom-table tr td:nth-child(1) {
	width: 150px;
	text-align: right;
	padding-right: 10px;
	background-color: var(--el-fill-color-light);
}
.custom-table tr td:nth-child(2) {
	width: 110px;
	padding-left: 20px;
}
</style>
