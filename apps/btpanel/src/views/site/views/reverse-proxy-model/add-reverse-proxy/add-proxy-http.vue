<template>
	<BtForm class="p-2rem" label-width="100px">
		<template #proxysite>
			<el-form-item label="目标" prop="proxysite" label-width="100px">
				<div class="flex items-center">
					<el-form-item label-width="50px">
						<bt-select v-model="param.targetType" placeholder="请选择" :options="targetOptions" style="width: 16rem; margin-right: 1rem" @change="setTypeEvent"></bt-select>
					</el-form-item>
					<bt-input v-model="param.proxysite" :placeholder="param.targetType === 'url' ? '请输入目标地址' : '请选择sock文件'" width="24rem" :iconType="param.targetType === 'url' ? false : 'folder'" @input="handelInputTodo">
						<template v-if="param.targetType !== 'url'" #append>
							<bt-button @click="onPathChange(param)">
								<bt-icon icon="el-folder-opened" class="cursor-pointer" />
							</bt-button>
						</template>
					</bt-input>
				</div>
			</el-form-item>
		</template>
		<template #todomain>
			<el-form-item label="发送域名(host)" prop="todomain" label-width="100px">
				<bt-popover placement="top-start" effect="dark" title="" content="请求转发到后端服务器时的主机名，一般为$http_host，如果目标URL是域名，则需要改为域名" width="400" v-model:visible="hostFocus" :trigger-keys="[]" trigger="focus">
					<template #reference>
						<bt-input @focus="hostFocus = true" v-model="param.todomain" placeholder="请输入发送域名" width="42rem" />
					</template>
				</bt-popover>
			</el-form-item>
		</template>
	</BtForm>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import BtPopover from '@/components/feedback/bt-popover'
import BtFormItem from '@/components/form/bt-form-item'
import BtInput from '@/components/form/bt-input'
import { checkDomain } from '@/utils'
import BtSelect from '@/components/form/bt-select'
import BtButton from '@/components/base/bt-button'
import BtIcon from '@/components/base/bt-icon'
import { targetOptions, onPathChange, addProxySite, helpList } from '../useController'

const popoverFocus = ref(false) // 是否显示popover
const hostFocus = ref(false) // 发送域名popover

/**
 * @description 设置目标类型
 */
const setTypeEvent = async () => {
	param.value.proxysite = param.value.targetType === 'url' ? 'http://' : ''
}

const handelInputTodo = (val: any) => {
	if (typeof val === 'object') return
	if (param.value.targetType === 'unix') {
		param.value.todomain = '$http_host'
		return
	}
	let value = val.replace(/^http[s]?:\/\//, '')
	value = value.replace(/(:|\?|\/|\\)(.*)$/, '')
	param.value.todomain = value
}

const { BtForm, submit, param } = useForm({
	data: {
		isEdit: false,
		targetType: 'url', // 目标类型
		sitename: '',
		cache: false,
		advanced: false,
		cachetime: 1,
		proxysite: 'http://',
		todomain: '$http_host',
		remark: '',
		port: 80,
		domains: '',
	},
	options: (formData: any) =>
		computed(() => [
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="域名" prop="domains">
						<BtPopover ref="popover" placement="top-start" popper-class="green-tips-popover !p-0" title="" width="370" v-model:visible={popoverFocus.value} trigger-keys={[]} trigger="focus">
							{{
								default: () => (
									<div class="!p-[12px] bg-primary text-white">
										如需填写多个域名，请换行填写，每行一个域名，默认为80端口
										<br />
										IP地址格式：192.168.1.199
										<br />
										泛解析添加方法 *.domain.com
										<br />
										如另加端口格式为 www.domain.com:88
									</div>
								),
								reference: () => (
									<BtInput
										v-model={formData.value.domains}
										type="textarea"
										width="42rem"
										rows={6}
										resize="none"
										onInput={(val: any) => {
											if (typeof val === 'object') return
											// formData.value.domains = val
											formData.value.remark = val.split('\n')[0]
										}}
										onFocus={() => (popoverFocus.value = true)}
										placeholder={`如需填写多个域名，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88`}
									/>
								),
							}}
						</BtPopover>
					</BtFormItem>
				),
				rules: {
					domains: [
						{ required: true, message: '请输入域名', trigger: 'blur' },
						{
							trigger: ['blur', 'input', 'change'],
							validator: (rule: unknown, value: string, callback: any) => {
								// 使用换行符分割字符串为域名数组
								const domains = value.split('\n').filter(domain => domain.length)
								const invalidIndex = domains.findIndex(domain => domain.split(':')[0].length < 3)
								domains.map((domain, index) => {
									if (!checkDomain(domain.split(':')[0])) {
										callback(new Error(`当前域名格式错误，第${index + 1}行，内容:${domain}`))
									}
								})
								// 域名必须大于3个字符串
								if (invalidIndex !== -1) {
									callback(new Error(`第 ${invalidIndex + 1} 个域名长度不符合要求（必须大于3个字符）`))
								} else {
									callback()
								}
							},
						},
					],
				},
			},
			{
				type: 'slots',
				key: 'proxysite',
				rules: {
					proxysite: [
						{ required: true, message: '请输入目标地址', trigger: 'blur' },
						{
							validator: (rule: unknown, value: string, callback: any) => {
								if (!value) {
									callback(new Error(formData.value.targetType === 'url' ? '目标地址不能为空' : '请选择sock文件'))
									return
								}
								if (formData.value.targetType === 'unix') {
									callback()
									return
								}
								const urlValue = value.trim()
								// 检查是否只有http://或https://前缀，而没有实际域名
								if (/^https?:\/\/$/.test(urlValue)) {
									callback(new Error('请输入目标URL域名'))
									return
								}
								// 检查是否包含有效的URL格式
								if (!/^https?:\/\/.+/.test(urlValue)) {
									callback(new Error('目标URL格式不正确，应以http://或https://开头'))
									return
								}
								const ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/

								let val = value.replace(/^http[s]?:\/\//, '')
								val = val.replace(/(:|\?|\/|\\)(.*)$/, '')

								if (ipReg.test(val)) {
									formData.value.todomain = '$http_host'
								} else {
									formData.value.todomain = val
								}
								callback()
							},
						},
					],
				},
			},
			{
				type: 'slots',
				key: 'todomain',
				rules: {
					todomain: [{ required: true, message: '请输入发送域名', trigger: ['blur', 'change'] }],
				},
			},
			{
				type: 'input',
				label: '备注',
				key: 'remark',
				attrs: {
					placeholder: '请输入备注，可为空',
					width: '42rem',
				},
			},
			{
				type: 'help',
				options: helpList,
			},
		]),
	submit: addProxySite,
})

defineExpose({
	onConfirm: async (emits: any) => {
		const res: boolean = await submit()
		if (res) emits('close')
	},
})
</script>
