<template>
	<div class="p-[20px]" v-bt-loading="viewLoading">
		<span class="mr-[12px]">PHP-CLI版本</span>
		<el-select v-model="phpVersionValue" class="!w-[32rem]" placeholder="请选择版本">
			<el-option v-for="(item, index) in phpVersionOption" :key="index" :label="item.name" :value="item.version"></el-option>
		</el-select>
		<el-button type="primary" @click="handleSaveEvent" class="!my-[20px] !block">保存</el-button>
		<bt-help :options="helpList"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { getCliVersion, setCliVersion } from '@api/site'

const phpVersionOption = ref<any>()

const helpList = ref([
	{
		content: '此处可设置命令行运行php时使用的PHP版本',
	},
	{
		content: '安装新的PHP版本后此处需要重新设置',
	},
	{
		content: '其它PHP版本在命令行可通过php+版本的方式运行，如：php74,php80',
	},
	{
		content: 'PHP-CLI:一种运行 PHP 脚本的方式，它允许您在命令行终端中直接执行PHP脚本文件，请根据您的需求选择合适的版本。',
	},
])
const phpVersionValue = ref() // 已使用版本
const viewLoading = ref(false) // 页面加载状态

/**
 * @description 获取命令行数据
 */
const getCliData = async () => {
	useDataHandle({
		loading: viewLoading,
		request: getCliVersion(),
		data: {
			'select.version': [String, phpVersionValue],
			versions: [Array, phpVersionOption],
		},
	})
}

/**
 * @description 保存
 */
const handleSaveEvent = () => {
	useDataHandle({
		loading: '正在设置版本，请稍后...',
		request: setCliVersion({ php_version: phpVersionValue.value }),
		message: true,
	})
}

onMounted(() => {
	getCliData()
})
</script>
