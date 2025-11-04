<template>
	<div class="p-[20px]" v-bt-loading="loading">
		<span class="mr-[12px]">默认站点</span>
		<el-select v-model="defaultValue" class="!w-[32rem]">
			<el-option v-for="(item, index) in SiteOptions" :key="index" :label="item.name" :value="item.name"></el-option>
		</el-select>
		<el-button type="primary" @click="handleSaveEvent" class="!my-[20px] !block">保存</el-button>
		<bt-help
			:options="[
				{ content: '设置默认站点后,所有未绑定的域名和IP都被定向到默认站点' },
				{
					content: '可有效防止恶意解析',
				},
			]"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle, useHandleError } from '@/hooks/tools'
import { getDefaultSite, setDefaultSite } from '@api/site'

const loading = ref(false) // 加载中
const SiteOptions = ref([
	{
		name: '默认站点',
		value: 'default',
	},
	{
		name: '自定义站点',
		value: 'custom',
	},
])
const defaultValue = ref('default')

/**
 * @description 获取默认站点数据
 */
const getDefaultData = async () => {
	loading.value = true
	try {
		const { data } = await getDefaultSite()
		defaultValue.value = data.defaultSite
		if (!data.defaultSite) defaultValue.value = '未设置默认站点'
		SiteOptions.value = data.sites
		SiteOptions.value.unshift({
			name: '未设置默认站点',
			value: '未设置默认站点',
		})
	} catch (error) {
		useHandleError(error)
	} finally {
		loading.value = false
	}
}

const handleSaveEvent = async () => {
	const params = {
		name: defaultValue.value === '未设置默认站点' ? '0' : defaultValue.value,
	}
	loading.value = true
	await useDataHandle({
		loading: '正在设置默认站点，请稍后...',
		request: setDefaultSite(params),
		message: true,
	})
	loading.value = false
}

onMounted(() => {
	getDefaultData()
})
</script>
