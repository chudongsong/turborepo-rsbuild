<template>
	<div class="p-20px">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="域名" prop="domain">
				<div class="w-320px">
					<el-input v-model="form.domain" :disabled="propsData.isEdit" placeholder="请输入域名，例如：bt.cn"> </el-input>
				</div>
			</el-form-item>
			<el-form-item label="A 记录">
				<div class="w-320px">
					<el-input v-model="form.a_record" :disabled="propsData.isEdit" placeholder="请输入A记录，例如：mail.bt.cn"> </el-input>
				</div>
			</el-form-item>
			<el-form-item label="域名配额">
				<el-input-number v-model="form.quota" class="!w-200px" :min="0" :controls="false"> </el-input-number>
				<div class="w-100px ml-20px">
					<bt-select v-model="form.quota_unit" :options="unitOptions"></bt-select>
				</div>
			</el-form-item>
			<el-form-item label="最大邮箱数量" prop="mailboxes">
				<el-input-number v-model="form.mailboxes" class="!w-320px" :min="0" :controls="false"> </el-input-number>
			</el-form-item>
			<el-form-item label="邮件捕获">
				<div class="!w-[320px] flex items-center">
					<bt-select class="!w-[140px]" v-model="form.catch_type" :options="catchTypeOptions"></bt-select>
					<el-popover placement="top-start" width="auto" trigger="click" popper-class="green-tips-popover !p-0 !border-none">
						<template #reference>
							<el-input class="!w-[170px] ml-10px" v-model="form.email"> </el-input>
						</template>
						<div class="!p-[12px] bg-primary text-white leading-[2.4rem]">
							{{ form.catch_type === 'none' ? '捕获不存在的邮箱，转发到此邮箱' : '捕获所有邮箱，转发到此邮箱' }}
						</div>
					</el-popover>
				</div>
			</el-form-item>
			<BtSettingDivider v-model:showConfig="showConfig">
				<template #config>
					<el-form-item label="DNS">
						<div class="w-320px">
							<el-select v-model="form.dns_id" class="!w-320px" filterable default-first-option size="default" placeholder="请选择验证类型">
								<template #empty>
									<p class="el-select-dropdown__empty">
										<span>暂无数据，请先添加DNS接口</span>
										<bt-link class="!text-base" @click="addDns">>>添加</bt-link>
									</p>
								</template>
								<el-option v-for="item in dnsList" :key="item.id" :label="item.dns_name" :value="item.id">
									<span style="float: left">{{ item.dns_name }}</span>
									<span class="ml-[1rem]" style="float: right; color: var(--el-base-tertiary); font-size: var(--el-font-size-base)">{{ item.ps }}</span>
								</el-option>
								<el-option label="更多类型" value="none" disabled>
									<p>
										<span>更多类型，请添加DNS接口</span>
										<bt-link class="!text-base" @click="addDns">>>添加</bt-link>
									</p>
								</el-option>
							</el-select>
						</div>
					</el-form-item>
					<el-form-item label=" " v-show="form.dns_id">
						<el-checkbox v-model="form.auto_create_record" :true-label="1" :false-label="0">一键解析</el-checkbox>
					</el-form-item>
					<el-form-item label="IP池">
						<el-select class="!w-[320px] bt-multiple-select" v-model="form.ip_tag" multiple placeholder="请选择IP">
							<template #tag>
								<div v-if="form.ip_tag && form.ip_tag.length" class="flex flex-wrap gap-[5px]">
									<el-tag type="info" v-for="tag in form.ip_tag" :key="tag" closable class="!w-auto inline-flex items-center" @close="handleCloseTag(tag)">
										{{ tag }} <span class="text-tertiary ml-1">IP: {{ getIpByTag(tag) }}</span>
									</el-tag>
								</div>
							</template>
							<el-option v-for="item in ipTagOptions" :key="item.value" :label="item.label" :value="item.value">
								<span style="float: left; max-width: 10ch; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ item.label }}</span>
								<span class="ml-[.8rem]" style="float: right; color: var(--el-base-tertiary); font-size: var(--el-font-size-base)">IP: {{ item.ip }}</span>
							</el-option>
							<el-option label="更多类型" value="none" disabled>
								<p>
									<span>更多IP，请前往IP池</span>
									<bt-link class="!text-base" @click="handleAddIpTag">>>添加</bt-link>
								</p>
							</el-option>
						</el-select>
					</el-form-item>
				</template>
			</BtSettingDivider>
		</el-form>
		<bt-help class="pl-20px" :options="helpOptions"> </bt-help>
	</div>
</template>

<script lang="ts" setup>
import { getDnsData } from '@/api/ssl'
import { dnsSettingDialog } from '@/views/domain/views/domain-manger/useMethod'
import { MailDomain } from '@mail/types'
import MAIL_DOMAIN_ADD from '@mail/views/domain/add/store'
import { storeToRefs } from 'pinia'
import { ipTagOptions, getIpTagOptions, addIpTag } from '../method'

const store = MAIL_DOMAIN_ADD()
const { form, formRef, propsData } = storeToRefs(store)
const { initForm, rules, unitOptions } = store

interface PropsData {
	row?: MailDomain
	isEdit: boolean
	onRefresh: () => void
}

interface Props {
	compData: PropsData
}

const showConfig = ref(false)

const helpOptions = [
	{
		content: '<span class="text-dangerDark">提示A记录解析失败，请检查填写的A记录域名是否已解析到服务器IP</span>',
		isHtml: true,
	},
	{
		content: '<span class="text-dangerDark">在IP池中选择一个IP时，此IP将作为本域名发送邮件的出口IP</span>',
		isHtml: true,
	},
	{
		content: '<span class="text-dangerDark">在IP池中选择多个IP时，将开启IP轮换在多个IP中定时切换</span>',
		isHtml: true,
	},
	{
		content: '需要在DNS服务提供商控制台添加一条A记录',
		isHtml: true,
	},
	{
		content: '如果使用CloudFlare，添加记录时请选择[DNS only]',
		isHtml: true,
	},
]

const catchTypeOptions = [
	{
		label: '捕获不存在的邮箱',
		value: 'none',
	},
	{
		label: '捕获所有邮箱',
		value: 'all',
	},
]

const emits = defineEmits(['close'])

// const props = withDefaults(defineProps<Props>(), {})
const props = defineProps<Props>()

const dnsList = ref<any>([])

const getDnsDataList = async () => {
	const { data } = await getDnsData()
	const { data: dns_list } = data
	dnsList.value = dns_list
}

const addDns = () => {
	emits('close')
	dnsSettingDialog()
}

const handleAddIpTag = () => {
	emits('close')
	addIpTag()
}

// 获取对应的IP
const getIpByTag = (tag: string) => {
	const found = ipTagOptions.value.find(item => item.value === tag)
	return found ? found.ip : ''
}

const handleCloseTag = (tag: string) => {
	form.value.ip_tag = form.value.ip_tag.filter(item => item !== tag)
}

watch(showConfig, val => {
	if (val) {
		getIpTagOptions()
		getDnsDataList()
	}
})

nextTick(() => {
	initForm(props.compData)
})
</script>
