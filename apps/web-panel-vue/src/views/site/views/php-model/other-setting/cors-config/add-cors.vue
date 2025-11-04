<template>
	<div>
		<bt-removed-tips></bt-removed-tips>

		<el-form v-bt-loading="tableLoading" ref="formRef" class="cors-form max-h-[61rem] overflow-auto" label-width="140px" label-position="right" :model="corsForm" :rules="rules">
			<el-form-item label="状态">
				<el-switch class="mr-[12px]" v-model="corsForm.status"></el-switch>
			</el-form-item>
			<template v-if="corsForm.status">
				<el-form-item label="来源（Origins）" prop="allowed_origins">
					<bt-input v-model="corsForm.allowed_origins" type="textarea" resize="none" width="36rem" :rows="3"></bt-input>
				</el-form-item>
				<el-form-item label="请求方法（Methods）" prop="allowed_methods">
					<div>
						<el-checkbox v-model="checkAll.allowed_methods" size="small" :indeterminate="isIndeterminate.allowed_methods" @change="handleCheckAllChange(checkAll.allowed_methods, 'allowed_methods')"> 全选 </el-checkbox>
						<bt-checkbox v-model="corsForm.allowed_methods" :options="methodsOptions" size="small" @change="handleCheckedChange(corsForm.allowed_methods, 'allowed_methods')"></bt-checkbox>
					</div>
				</el-form-item>
				<el-form-item label="请求头（Headers）" prop="allHeaders">
					<el-checkbox v-model="checkAll.allHeaders" size="small" :indeterminate="isIndeterminate.allHeaders" @change="handleCheckAllChange(checkAll.allHeaders, 'allHeaders')">全选</el-checkbox>
					<bt-checkbox v-model="corsForm.allHeaders" size="small" :options="allHeadersOptions" @change="handleCheckedChange(corsForm.allHeaders, 'allHeaders')"></bt-checkbox>
					<el-form-item label="" prop="allowed_headers">
						<bt-input v-if="corsForm.allHeaders.includes('custom')" v-model="corsForm.allowed_headers" placeholder="请输入自定义请求头，一行一个" class="mt-[4px]" type="textarea" resize="none" width="36rem" :rows="3"></bt-input>
					</el-form-item>
				</el-form-item>
				<el-form-item label="响应头（Headers）" prop="expHeaders">
					<el-checkbox v-model="checkAll.expHeaders" size="small" :indeterminate="isIndeterminate.expHeaders" @change="handleCheckAllChange(checkAll.expHeaders, 'expHeaders')">全选</el-checkbox>
					<bt-checkbox v-model="corsForm.expHeaders" size="small" :options="expHeadersOptions" @change="handleCheckedChange(corsForm.expHeaders, 'expHeaders')"></bt-checkbox>
					<el-form-item label="" prop="exposed_headers">
						<bt-input v-if="corsForm.expHeaders.includes('custom')" v-model="corsForm.exposed_headers" placeholder="请输入自定义响应头，一行一个" class="mt-[4px]" type="textarea" resize="none" width="36rem" :rows="3"></bt-input>
					</el-form-item>
				</el-form-item>
				<el-form-item label="缓存时间（Seconds）" prop="max_age">
					<bt-input v-model="corsForm.max_age" type="number" width="36rem" text-type="秒"></bt-input>
				</el-form-item>
			</template>
			<el-form-item label=" ">
				<el-button type="primary" @click="onConfirm()">保存</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { deleteCorsConfig, getCorsConfig, updateCorsConfig } from '@/api/site'
import { useDataHandle } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { useSiteStore } from '@site/useStore'

const { plugin } = useGlobalStore()
const { webserver: webServerType } = plugin.value

const { siteInfo } = useSiteStore()

const tableLoading = ref<boolean>(false) // 表格loading

const formRef = ref<any>() // 表单ref
const corsForm = reactive<any>({
	status: false,
	// 表单数据
	allowed_origins: '',
	allowed_methods: [],
	allHeaders: [],
	allowed_headers: '',
	expHeaders: [],
	exposed_headers: '',
	max_age: '',
})
const checkAll = reactive<any>({
	allowed_methods: false,
	allHeaders: false,
	expHeaders: false,
}) // 全选状态
const isIndeterminate = reactive<any>({
	allowed_methods: false,
	allHeaders: false,
	expHeaders: false,
}) // 全选状态

const methodsOptions = [
	{ label: 'GET', value: 'GET' },
	{ label: 'POST', value: 'POST' },
	{ label: 'OPTIONS', value: 'OPTIONS' },
	{ label: 'PATCH', value: 'PATCH' },
	{ label: 'DELETE', value: 'DELETE' },
	{ label: 'HEAD', value: 'HEAD' },
]

const allHeadersOptions = [
	{ label: 'Content-Type', value: 'Content-Type' },
	{ label: 'Authorization', value: 'Authorization' },
	{ label: 'X-Requested-With', value: 'X-Requested-With' },
	{ label: 'Range', value: 'Range' },
	{ label: 'Accept', value: 'Accept' },
	{ label: 'Cache-Control', value: 'Cache-Control' },
	{ label: 'If-Modified-Since', value: 'If-Modified-Since' },
	{ label: '自定义', value: 'custom' },
]

const expHeadersOptions = [
	{ label: 'X-Custom-Header', value: 'X-Custom-Header' },
	{ label: 'Content-Length', value: 'Content-Length' },
	{ label: 'ETag', value: 'ETag' },
	{ label: 'Cache-Control', value: 'Cache-Control' },
	{ label: 'Last-Modified', value: 'Last-Modified' },
	{ label: 'Expires', value: 'Expires' },
	{ label: 'Vary', value: 'Vary' },
	{ label: '自定义', value: 'custom' },
]

const arrObject: any = {
	allowed_methods: methodsOptions,
	allHeaders: allHeadersOptions,
	expHeaders: expHeadersOptions,
}

const rules = reactive({
	allowed_origins: [{ required: true, message: '请输入来源（Origins）', trigger: 'blur' }],
	allowed_methods: [{ required: true, message: '请选择请求方法（Methods）', trigger: 'change' }],
	allHeaders: [{ required: true, message: '请选择请求头（Headers）', trigger: 'change' }],
	allowed_headers: [
		{
			trigger: ['blur', 'change'],
			validator: (rule: any, value: any, callback: any) => {
				if (corsForm.allHeaders.includes('custom') && !value && corsForm.allHeaders.length === 1) {
					callback(new Error('请输入自定义请求头'))
				} else {
					callback()
				}
			},
		},
	],
	expHeaders: [{ required: true, message: '请选择响应头（Headers）', trigger: 'change' }],
	exposed_headers: [
		{
			trigger: ['blur', 'change'],
			validator: (rule: any, value: any, callback: any) => {
				if (corsForm.expHeaders.includes('custom') && !value && corsForm.expHeaders.length === 1) {
					callback(new Error('请输入自定义响应头'))
				} else {
					callback()
				}
			},
		},
	],
	max_age: [
		{ required: true, message: '请输入缓存时间（Seconds）', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value === '' || !Number.isInteger(parseFloat(value)) || value < 0) {
					callback(new Error('请输入大于0的整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
})

/**
 * @description 全选事件
 */
const handleCheckAllChange = (val: boolean, key: string) => {
	corsForm[key] = val ? arrObject[key].map((item: any) => item.value) : []
	isIndeterminate[key] = false
}

/**
 * @description 单选事件
 */
const handleCheckedChange = (val: any, key: string) => {
	const checkedCount = val.length
	const totalCount = arrObject[key].length
	checkAll[key] = checkedCount === totalCount
	isIndeterminate[key] = checkedCount > 0 && checkedCount < totalCount
	formRef.value?.clearValidate()
}

/**
 * @description 初始化数据
 */
const initData = (rowData: AnyObject) => {
	const { allowed_methods, exposed_headers, allowed_headers } = rowData
	let customAllHeaders: any = [],
		customExpHeaders: any = []
	// 请求头 分离自定义 和 checkbox
	allowed_headers
		?.replace(/\,/g, '\n')
		?.split('\n')
		.forEach((item: any) => {
			if (!allHeadersOptions.find((v: any) => v.value === item)) {
				if (!corsForm.allHeaders.includes('custom')) corsForm.allHeaders.push('custom')
				customAllHeaders.push(item)
			} else {
				corsForm.allHeaders.push(item)
			}
		})
	// 响应头 分离自定义 和 checkbox
	exposed_headers
		?.replace(/\,/g, '\n')
		?.split('\n')
		.forEach((item: any) => {
			if (!expHeadersOptions.find((v: any) => v.value === item)) {
				if (!corsForm.expHeaders.includes('custom')) corsForm.expHeaders.push('custom')
				customExpHeaders.push(item)
			} else {
				corsForm.expHeaders.push(item)
			}
		})
	// 赋值
	Object.assign(corsForm, {
		...rowData,
		status: true,
		allowed_headers: customAllHeaders.join('\n'),
		exposed_headers: customExpHeaders.join('\n'),
		allowed_methods: Array.isArray(allowed_methods) ? allowed_methods : allowed_methods?.replace(/\s/g, '')?.split(',') || [],
	})

	// 修改全选状态
	Object.keys(isIndeterminate).forEach((key: string) => {
		isIndeterminate[key] = true
	})
}

/**
 * @description 确认事件
 */
const onConfirm = async () => {
	// 开启状态 添加 关闭状态 删除
	const params = {
		path: `/www/server/panel/vhost/${webServerType}/${siteInfo.value.name}.conf`,
		encoding: 'utf-8',
	}
	if (corsForm.status) {
		await formRef.value?.validate()
		const { allowed_origins, allowed_methods, allHeaders, allowed_headers, expHeaders, exposed_headers, max_age } = corsForm
		let headersArr: any = allHeaders.filter((item: any) => item !== 'custom'),
			expHeadersArr: any = expHeaders.filter((item: any) => item !== 'custom')
		// 选中自定义时，渲染自定义内容
		if (allHeaders.includes('custom')) {
			allowed_headers?.split('\n')?.forEach((item: any) => {
				// 请求头
				if (!headersArr.includes(item)) {
					headersArr.push(item)
				}
			})
		}
		// 选中自定义时，渲染自定义内容
		if (expHeaders.includes('custom')) {
			exposed_headers?.split('\n')?.forEach((item: any) => {
				// 响应头
				if (!expHeadersArr.includes(item)) {
					expHeadersArr.push(item)
				}
			})
		}
		Object.assign(params, {
			allowed_origins,
			allowed_methods: allowed_methods.join(','),
			allowed_headers: headersArr.join(','),
			exposed_headers: expHeadersArr.join(','),
			max_age,
		})
	}

	const requestFun = corsForm.status ? updateCorsConfig : deleteCorsConfig

	const res: any = await useDataHandle({
		loading: '正在设置，请稍后...',
		request: requestFun(params),
		message: true,
		success: (res: any) => {
			if (res.status) getCorsData()
		},
	})
	return res.status
}

/**
 * @description 获取跨域数据
 */
const getCorsData = () => {
	useDataHandle({
		loading: tableLoading,
		request: getCorsConfig({
			path: `/www/server/panel/vhost/${webServerType}/${siteInfo.value.name}.conf`,
		}),
		success: (res: any) => {
			if (Array.isArray(res.data.msg) && res.data.msg.length) initData(res.data.msg[0])
			else $reset()
		},
	})
}

/**
 * @description 重置数据
 */
const $reset = () => {
	Object.assign(corsForm, {
		allowed_origins: '',
		allowed_methods: [],
		allHeaders: [],
		allowed_headers: '',
		expHeaders: [],
		exposed_headers: '',
		max_age: '',
	})
	Object.keys(isIndeterminate).forEach((key: string) => {
		isIndeterminate[key] = false
		checkAll[key] = false
	})
}

onMounted(getCorsData)

defineExpose({
	onConfirm,
	init: getCorsData,
})
</script>

<style lang="css" scoped>
.cors-form :deep(.el-checkbox) {
	@apply w-13rem;
}
</style>
