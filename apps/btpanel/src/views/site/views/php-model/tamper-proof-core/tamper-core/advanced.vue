<template>
	<div v-bt-loading="loading" v-bt-loading:title="'正在获取站点防篡改信息，请稍侯'">
		<Masker v-if="!ruleData?.path" :compData="{ ...compData, init: getTamperList }"></Masker>
		<bt-tabs ref="tamperRef" type="" v-model="tabActive" :options="tabComponent"></bt-tabs>
		<div class="overall-config overall-config-top">
			<div class="overall-config-item">
				<img class="mr-[.6rem]" width="16" src="/static/icons/icon-site-create.svg" alt="" />
				<span class="mr-1rem">拦截创建</span>
				<el-switch v-model="globalData.create" @change="onChangeTamper(globalData.create, 1)"></el-switch>
			</div>
			<el-divider direction="vertical" class="!h-2rem !mx-1.6rem"></el-divider>
			<div class="overall-config-item">
				<img class="mr-[.6rem]" width="16" src="/static/icons/icon-site-edit.svg" alt="" />
				<span class="mr-1rem">拦截编辑</span>
				<el-switch v-model="globalData.edit" @change="onChangeTamper(globalData.edit, 2)"></el-switch>
			</div>
			<el-divider direction="vertical" class="!h-2rem !mx-1.6rem"></el-divider>
			<div class="overall-config-item">
				<img class="mr-[.6rem]" width="16" src="/static/icons/icon-site-delete.svg" alt="" />
				<span class="mr-1rem">拦截删除</span>
				<el-switch v-model="globalData.delete" @change="onChangeTamper(globalData.delete, 3)"></el-switch>
			</div>
		</div>
		<div class="mt-2rem">
			<div class="flex items-center">
				开启高级设置
				<div class="more flex items-center cursor-pointer pl-[1rem]" @click="isAdv = !isAdv">
					<div class="ml-[1rem] text-primary mr-[.4rem] select-none">
						{{ `${isAdv ? '折叠' : '详情'}` }}
					</div>
					<i class="text-medium" :class="isAdv ? 'svgtofont-el-arrow-up' : 'svgtofont-el-arrow-down'"></i>
				</div>
			</div>
			<div v-if="isAdv" class="overall-config-content">
				<div class="overall-config-content-item" v-for="(arr, key) in showData" :key="key">
					<div class="overall-config-content-left">拦截{{ globalType[key] }}</div>
					<div class="overall-config-content-right">
						<div class="overall-config-item" v-for="(item, index) in arr" :key="index">
							<span class="mr-1rem">拦截{{ tamperConfigType[item] }}</span>
							<el-switch v-model="ruleData[`is_${item}`]" @change="onChangeTamper(ruleData[`is_${item}`], `is_${item}`)"></el-switch>
						</div>
					</div>
				</div>
			</div>
		</div>
		<bt-help
			class="mt-2rem"
			:options="[
				{
					content: '提示：当前配置默认拦截以上规则，请根据当前项目需求设置和配置规则',
				},
			]"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import { useHandleError } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { isString } from '@/utils'
import { getTamperRuleByPath, modifyPathConfig, modifyPathConfigBatch, multiCreate } from '@api/site'
import { useSiteStore } from '@site/useStore'
import { tamperConfigType } from '@site/useController'
import Masker from '@site/views/php-model/tamper-proof-core/tamper-core/masker.vue'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { siteInfo } = useSiteStore()

const tabActive = ref<string>('forbid')

const loading = ref<boolean>(false)
const isAdv = ref<boolean>(false)
const showData = reactive<any>({
	create: ['create', 'mkdir', 'link'],
	edit: ['rename', 'chown', 'chmod', 'modify'],
	delete: ['unlink', 'rmdir'],
})

const ruleData = ref<any>({}) // 当前规则数据
const globalData = ref<any>({
	create: false,
	edit: false,
	delete: false,
}) // 全局数据
const globalType = reactive<any>({
	create: '创建',
	edit: '编辑',
	delete: '删除',
}) // 全局类型

const tabComponent = ref<any>([
	{
		label: '禁止功能',
		name: 'forbid',
		lazy: true,
		render: () => <span></span>,
	},
])

/**
 * @description: 开启防篡改
 */
const onChangeTamper = async (value: boolean, key: string | number) => {
	const params = {
		value: value ? 1 : 0,
		path_id: ruleData.value.pid,
		[isString(key) ? 'key' : 'batch']: key,
	}
	const requestFun = isString(key) ? modifyPathConfig : modifyPathConfigBatch
	const res: AnyObject = await useDataHandle({
		loading: '正在修改配置，请稍后...',
		request: requestFun(params),
		message: true,
	})
	if (res.status) getTamperList()
}

/**
 * @description: 获取防篡改列表
 */
const getTamperList = async () => {
	try {
		loading.value = true
		const { data } = await getTamperRuleByPath({ path: siteInfo.value.path })
		let data2: any = []
		if (data) {
			for (const key in data) {
				if (key.indexOf('is_') !== -1) {
					data2[key] = data[key] ? true : false
				} else {
					data2[key] = data[key]
				}
			}
			ruleData.value = data2
			// glabalData.value.create 当前数据 'create', 'mkdir', 'link' 其中一个为true则为true
			for (const key in showData) {
				globalData.value[key] = showData[key].some((item: string) => data[`is_${item}`])
			}
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	getTamperList()
})
</script>

<style lang="css" scoped>
.overall-config {
	@apply flex items-center pb-[2.4rem] gap-2rem;
}

.overall-config-item {
	@apply flex items-center;
}
.overall-config-item img {
	display: inline-block;
}

.overall-config-content {
	@apply flex flex-col;
}

.overall-config-content-item {
	@apply flex items-center py-[2rem] px-1rem;
	border-bottom: 1px dashed var(--el-color-border-darker);
}

.overall-config-content-item:last-child {
	/* @apply border-bottom-0; */
	border-bottom: 0;
}

.overall-config-content-left {
	@apply mr-[2.6rem] w-[6rem] text-right text-default;
}

.overall-config-content-right {
	@apply flex-1 flex flex-wrap text-secondary;
}

.overall-config-item {
	@apply w-[33.3%] px-2rem text-left block;
}

.overall-config-item:first-child {
	@apply pl-0;
}

.overall-config-item:nth-child(4) {
	@apply pl-0 mt-[2.4rem];
}

.overall-config-item:last-child,
.overall-config-item:nth-child(3) {
	@apply border-right-0;
}
</style>
