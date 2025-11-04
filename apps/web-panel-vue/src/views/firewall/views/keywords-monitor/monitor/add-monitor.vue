<template>
	<!-- 添加修改端口规则表单 -->
	<el-form ref="monitorFormRef" :rules="rules" :model="ruleForm" class="p-[2rem] addfrom overflow-auto max-h-[60rem]" label-width="10rem">
		<el-form-item :label="'监控名'" prop="name">
			<bt-input v-model="ruleForm.name" width="26rem" :placeholder="'请输入监控名'" clearable></bt-input>
		</el-form-item>
		<el-form-item :label="'检测方式'">
			<bt-select v-model="ruleForm.method" :options="methodOptions" @change="onChangeMethod" class="!w-[26rem]" />
		</el-form-item>
		<el-form-item :label="'检测网站'" prop="site_name">
			<div class="flex">
				<el-select v-model="ruleForm.site_name" class="!w-[20rem] mr-4" :disabled="ruleForm.method === 3 || compData.isSite ? true : false">
					<el-option v-for="(item, index) in siteOptions" :key="index" :value="item.name" :label="`${item.name}[${item.ps}]`"></el-option>
					<el-option label="自定义网站" value="auto"></el-option>
				</el-select>
				<bt-input v-if="ruleForm.site_name === 'auto'" v-model="ruleForm.site_url" width="20rem" :placeholder="'请输入网站域名'" clearable></bt-input>
			</div>
		</el-form-item>
		<el-form-item :label="'访问网站方式'">
			<bt-radio v-model="ruleForm.access" :options="accessOptions" />
		</el-form-item>
		<el-form-item :label="'发送告警'">
			<el-switch v-model="ruleForm.send_msg"></el-switch>
		</el-form-item>
		<el-form-item v-if="ruleForm.send_msg ? true : false" :label="'通知方式'" prop="send_type">
			<bt-alarm-select v-model="ruleForm.send_type" :limit="['sms', 'wx_account']" @change="onChangeAlert" :multiple="false" class="!w-[26rem]" />
		</el-form-item>
		<el-form-item :label="'检测频率'" prop="type">
			<div class="flex">
				<bt-select class="!w-[8rem] mr-4" v-model="ruleForm.type" :options="typeOptions" />
				<el-select class="!w-[8rem] mr-4" v-if="ruleForm.type === 'week' ? true : false" v-model="ruleForm.week">
					<el-option v-for="(item, index) in weekOptions" :key="index" :label="item" :value="index + 1"></el-option>
				</el-select>
				<bt-input type="number" class="!w-[13rem] mr-4" min="0" max="31" v-if="ruleForm.type === 'day-n' || ruleForm.type === 'month' ? true : false" v-model="ruleForm.where1">
					<template #append>
						{{ ruleForm.type === 'day-n' ? '天' : '日' }}
					</template>
				</bt-input>
				<bt-input type="number" class="!w-[13rem] mr-4" min="0" max="23" v-model="ruleForm.hour">
					<template #append>时</template>
				</bt-input>
				<bt-input type="number" class="!w-[13rem]" min="0" max="59" v-model="ruleForm.minute">
					<template #append>分</template>
				</bt-input>
			</div>
		</el-form-item>

		<!-- 高级配置 -->
		<!-- v-if="ruleForm.switch_config" -->
		<BtSettingDivider :is-show-divider="true">
			<template #config>
				<el-form-item :label="'敏感词库'">
					<el-radio-group v-model="ruleForm.scan_config.thesaurus" class="border-darker border-1 !w-[26rem] rounded-small px-[1rem] py-[.5rem] flex flex-col !items-start">
						<el-radio :value="1">全选</el-radio>
						<el-radio :value="2">自定义词库</el-radio>
						<el-radio :value="3">默认词库</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'检测带参数的URL'">
					<div class="flex min-h-[3.2rem] items-start">
						<div class="items-center h-[3.2rem]">
							<el-switch v-model="ruleForm.scan_config.scan_args"></el-switch>
						</div>
						<div class="unit">
							<p>扫描时检测带参数的URL，如URL: https://bt.cn?a=b</p>
							<p>
								开启前
								<span class="ml-[2rem]">不检测</span>
							</p>
							<p>
								开启后
								<span class="ml-[2rem]">检测</span>
							</p>
							<p>注意，开启后检测页面将成倍增长，可能会导致检测时间大量增加</p>
						</div>
					</div>
				</el-form-item>
				<el-form-item :label="'头部JS检测'">
					<el-switch v-model="ruleForm.scan_config.title_hash"></el-switch>
					<span class="unit">监控页面源码中的title_hash标签是否有修改</span>
				</el-form-item>
				<el-form-item :label="'尾部JS检测'">
					<el-switch v-model="ruleForm.scan_config.tail_hash"></el-switch>
					<span class="unit">监控页面源码中的tail_hash标签是否有修改</span>
				</el-form-item>
				<el-form-item :label="'关键词检测'">
					<el-switch v-model="ruleForm.scan_config.keywords"></el-switch>
					<span class="unit">监控页面源码中的keywords标签是否有修改</span>
				</el-form-item>
				<el-form-item :label="'描述检测'">
					<el-switch v-model="ruleForm.scan_config.descriptions"></el-switch>
					<span class="unit">监控页面源码中的descriptions标签是否有修改</span>
				</el-form-item>
				<el-form-item :label="'标题检测'">
					<el-switch v-model="ruleForm.scan_config.title"></el-switch>
					<span class="unit">监控页面源码中的title标签是否有修改</span>
				</el-form-item>
				<el-form-item :label="'搜索引擎收录监控'">
					<el-switch v-model="ruleForm.scan_config.search_monitor"></el-switch>
					<span class="unit">监控搜索引擎是否存在风险关键词</span>
				</el-form-item>
				<el-form-item :label="'自定义访问UA'">
					<bt-input type="textarea" v-model="ruleForm.scan_config.scan_ua" width="36rem" height="10rem" :placeholder="'请输入自定义访问UA'" clearable></bt-input>
				</el-form-item>
			</template>
		</BtSettingDivider>

		<bt-help :options="helpList" class="pl-[3.6rem] mt-[2rem]"></bt-help>
	</el-form>
</template>
<script lang="ts" setup>
import { addMonitor, getDataList } from '@/api/firewall'
import { useDataHandle } from '@hooks/tools'
import { checkDomain } from '@utils/index'

import BtSettingDivider from '@/components/business/bt-setting-divider/index.vue'

interface Props {
	compData: any
}

const monitorFormRef = ref<any>(null)
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

// 表单数据
const ruleForm = ref<any>({
	name: '',
	method: 2,
	site_name: '',
	site_url: '',
	access: 'http',
	send_msg: false,
	send_type: [],
	type: 'day',
	week: 1,
	where1: 1,
	hour: 1,
	minute: 19,
	switch_config: false,
	scan_config: {
		thesaurus: 1,
		scan_args: false,
		title_hash: false,
		tail_hash: false,
		keywords: false,
		descriptions: false,
		title: false,
		search_monitor: false,
		scan_ua: 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
	},
	id: '',
})

const siteOptions = shallowRef<any>([])
const weekOptions = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] //星期
const isEdit = ref(props.compData.id ? true : false)

const helpList = [{ content: '如果是本机端口转发，目标IP为：127.0.0.1' }, { content: '如果目标IP不填写，默认则为本机端口转发!' }]

//检测方式
const methodOptions = [
	{ label: '全站扫描', value: 1 },
	{ label: '快速扫描', value: 2 },
	{ label: '单URL', value: 3 },
]

const accessOptions = [
	{ label: 'HTTPS', value: 'https' },
	{ label: 'HTTP', value: 'http' },
] //访问网站方式

const typeOptions = [
	{ label: '每天', value: 'day' },
	{ label: 'N天', value: 'day-n' },
	{ label: '每星期', value: 'week' },
	{ label: '每月', value: 'month' },
] //检测频率

// 校验规则
const rules = {
	name: [{ required: true, trigger: ['blur', 'change'], message: '请输入监控名' }],
	site_name: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value !== 'auto') {
					callback()
				} else {
					if (!ruleForm.value.site_url) callback(new Error('请输入网站域名'))
					if (ruleForm.value.method !== 3 && !checkDomain(ruleForm.value.site_url)) {
						return callback(new Error('检测网站域名格式不正确'))
					}
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	send_type: [{ required: true, message: '请选择通知方式', trigger: ['blur', 'change'] }],
	type: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value === 'day-n' || value === 'month') {
					if (ruleForm.value.where1 < 0 || ruleForm.value.where1 > 31) {
						return callback(new Error('请输入正确天数范围[0-31]'))
					}
				}
				if (ruleForm.value.hour < 0 || ruleForm.value.hour > 23) {
					return callback(new Error('请输入正确小时范围[0-23]'))
				}
				if (ruleForm.value.minute < 0 || ruleForm.value.minute > 59) {
					return callback(new Error('请输入正确分钟范围[0-59]'))
				}
				callback()
			},
			trigger: ['blur', 'change'],
		},
	],
}

/**
 * @description: 提交表单
 */
const submitFrom = async (close: Function) => {
	await monitorFormRef.value.validate()
	let siteName = ruleForm.value.site_name === 'auto' ? ruleForm.value.site_url : ruleForm.value.site_name
	let params = {
		...ruleForm.value,
		site_name: siteName,
		url: ruleForm.value.access + '://' + siteName,
		send_msg: Number(ruleForm.value.send_msg),
	}
	const form = ruleForm.value
	// if (params.send_msg) params['send_type'] = form.send_type[0]
	if (form.type === 'week') params['week'] = form.week
	// if (form.switch_config) params['scan_config'] = getScanConfig()// 无效代码
	if (isEdit.value) params['id'] = form.id

	await useDataHandle({
		loading: '正在提交，请稍后...',
		request: addMonitor(isEdit.value, params),
		message: true,
	})
	props.compData.refreshEvent && props.compData.refreshEvent()
	close()
}

/**
 * @description: 获取关键词监控详情
 */
const getScanConfig = () => {
	const config = ruleForm.value.scan_config
	const params = {
		scan_args: Number(config.scan_args),
		title: Number(config.title),
		keywords: Number(config.keywords),
		descriptions: Number(config.descriptions),
		title_hash: Number(config.title_hash),
		tail_hash: config.tail_hash,
		search_monitor: Number(config.search_monitor),
		scan_ua: config.scan_ua,
		thesaurus: config.thesaurus,
	}
	return params
}

/**
 * @description: 获取网站列表
 */
const getSiteList = async () => {
	await useDataHandle({
		loading: '正在获取网站列表，请稍后...',
		request: getDataList({ type: 'sites' }),
		data: { data: [Array, siteOptions] },
	})
	// 赋值首位
	ruleForm.value.site_name = isEdit.value ? props.compData.site_name : siteOptions.value[0].name
	// 若为网站进入，则默认选中当前网站
	if (props.compData.isSite) ruleForm.value.site_name = props.compData.name
}

/**
 * @description 选择告警方式变化
 * @param val 被选中的告警值
 */
const onChangeAlert = (val: any) => {
	// ruleForm.value.push_method = []
	// ruleForm.value.push_method.push(val.name)
}

/**
 * @description: 检测方式改变
 */
const onChangeMethod = (val: number) => {
	ruleForm.value.method = val
	if (val === 3) ruleForm.value.site_name = 'auto'
	else {
		if (props.compData.isSite) ruleForm.value.site_name = props.compData?.site_name || props.compData.name || ''
	}
}

/**
 * @description: 编辑初始化
 */
const onInitEdit = () => {
	const data = props.compData
	ruleForm.value = {
		...data,
		...data.crontab_info,
		...data.scan_config,
		access: data.url?.split('://')[0],
		where1: data.crontab_info?.where1 || 1,
		hour: data.crontab_info?.where_hour || 1,
		minute: data.crontab_info?.where_minute || 30,
		send_msg: data.send_msg ? true : false,
		id: data.id,
		// send_type: data.send_type,
	}
	// 判定type:每x天,为day-n,每星期为week,每月为month
	let type = props.compData.crontab_info?.type
	if (type === '每星期') {
		ruleForm.value.type = 'week'
	} else if (type === '每月') {
		ruleForm.value.type = 'month'
	} else if (type === '每天') {
		ruleForm.value.type = 'day'
	} else {
		ruleForm.value.type = 'day-n'
	}
}

watch(
	() => ruleForm.value.site_name,
	() => {
		const name = methodOptions.find((item: any) => item.value === ruleForm.value.method).label
		ruleForm.value.name = ((ruleForm.value.site_name === 'auto' ? ruleForm.value.site_url : ruleForm.value.site_name) || '') + name
	}
)

defineExpose({ onConfirm: submitFrom })

onMounted(() => {
	getSiteList()
	if (isEdit.value) onInitEdit()
})
</script>
<style lang="css">
.push_method {
	display: flex !important;
	flex-wrap: wrap;
	align-items: center;
}
.push_method .el-radio {
	display: flex;
	margin-right: 2rem;
}
.unit {
	line-height: 2.2rem;
	color: var(--el-base-tertiary);
	margin-left: 2rem;
	font-size: var(--el-font-size-small);
}
</style>
