<template>
	<BtForm class="p-[2rem]">
		<template #domain>
			<el-form-item :prop="param.domainorpath === 'domain' ? 'redirectdomain' : 'redirectpath'" :label="`重定向${param.domainorpath === 'domain' ? '域名' : '路径'}`">
				<div class="flex items-center">
					<el-select v-if="param.domainorpath === 'domain'" collapse-tags multiple style="width: 15rem" v-model="param.redirectdomain">
						<template #header>
							<div class="flex items-center justify-center checked-button">
								<el-button @click="selectAllEvent" type="default">全选</el-button>
								<el-button @click="unAllEvent" type="default">取消全选</el-button>
							</div>
						</template>
						<el-option v-for="(item, index) in domainOptions" :key="index" :value="item.name" :label="item.name"></el-option>
					</el-select>
					<bt-input v-else width="15rem" v-model="param.redirectpath" placeholder="如：/b.com"></bt-input>
					<el-form-item label="目标url" prop="tourl">
						<bt-input v-model="param.tourl" width="24rem"></bt-input>
					</el-form-item>
				</div>
			</el-form-item>
			<el-form-item>
				<bt-help :options="addHelpList" list-style="disc"></bt-help>
			</el-form-item>
		</template>
	</BtForm>
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import BtSelect from '@/components/form/bt-select'
import BtSwitch from '@/components/form/bt-switch'
import { useForm } from '@/hooks/tools'
import { defaultVerify } from '@/utils/rule'
import { addHelpList, domainOptions, getDomainData, rowData, submitRedirect } from './useController'

/**
 * @description 全选
 * @param val
 */
const selectAllEvent = (val: any) => {
	// 点击选中domainOptions所偶有数据
	param.value.redirectdomain = domainOptions.value.map((item: any) => item.name)
}

/**
 * @description 取消全选
 * @param val
 */
const unAllEvent = (val: any) => {
	// 点击取消选中domainOptions所偶有数据
	param.value.redirectdomain = []
}

const { BtForm, param, submit, clearValidate } = useForm({
	data: () => {
		let config = {
			type: true,
			holdpath: true,
			domainorpath: 'domain',
			redirecttype: '301',
			redirectpath: '',
			tourl: 'http://', // 重定向到
			redirectdomain: [] as string[], // 重定向域名
			redirectname: '',
		}
		if (rowData.value) {
			const { type, holdpath, ...rest } = rowData.value
			Object.assign(config, {
				type: type === 1,
				holdpath: holdpath === 1,
				...rest,
			})
		}
		return config
	},
	options: (formData: Ref<AnyObject>) => {
		return computed(() => [
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="开启重定向">
						<div class="flex items-center">
							<BtSwitch v-model={formData.value.type}></BtSwitch>
							<BtFormItem label="保留URL参数" style="margin-left: 4rem;">
								<BtSwitch v-model={formData.value.holdpath}></BtSwitch>
							</BtFormItem>
						</div>
					</BtFormItem>
				),
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="重定向类型">
						<div class="flex items-center">
							<BtSelect
								v-model={formData.value.domainorpath}
								options={[
									{ label: '域名', value: 'domain' },
									{ label: '路径', value: 'path' },
								]}
								onChange={(val: any) => {
									// 清除表单验证
									clearValidate()
								}}
								style="width: 15rem;"
							/>
							<BtFormItem label="重定向方式">
								<BtSelect
									v-model={formData.value.redirecttype}
									options={[
										{ label: '301（永久重定向）', value: '301' },
										{ label: '302（临时重定向）', value: '302' },
									]}
									style="width: 15rem;"
								/>
							</BtFormItem>
						</div>
					</BtFormItem>
				),
			},
			{
				type: 'slots',
				key: 'domain',
				rules: {
					tourl: [
						defaultVerify({ message: '请输入目标URL', trigger: 'blur' }),
						// 校验url合法性
						{
							validator: (rule: any, value: any, callback: any) => {
								if (value === 'http://' || value === 'https://') {
									callback(new Error('请输入目标URL'))
								} else {
									// 校验是否为合法URL
									try {
										new URL(value)
										callback()
									} catch (error) {
										callback(new Error('请输入正确的URL'))
									}
								}
							},
							trigger: ['change', 'input'],
						},
					],
					redirectdomain: [
						{
							required: true,
							message: '请选择重定向域名',
							trigger: 'change',
						},
						{
							validator: (rule: any, value: any, callback: any) => {
								if (value.length === 0 && formData.value.domainorpath === 'domain') {
									callback(new Error('请选择重定向域名'))
								} else {
									callback()
								}
							},
							trigger: ['change'],
						},
					],
					redirectpath: [
						{
							required: true,
							message: '请输入重定向路径',
							trigger: 'blur',
						},
					],
				},
			},
		])
	},
	submit: async (param: Ref<T>, validator: () => Promise<'closed' | true>) => {
		await validator()
		return await submitRedirect(param.value)
	},
})

onMounted(getDomainData)

defineExpose({
	onConfirm: submit,
})
</script>
