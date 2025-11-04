<template>
	<div class="content-mask">
		<i class="text-orange !text-[2.2rem] svgtofont-el-warning mr-4px"></i>
		<span class="mr-8px">{{ tips }}</span>
		<span class="bt-link" @click="openServerView"> 添加远程数据库 </span>
		<div v-if="type !== 'SqlServer'">
			<el-divider direction="vertical" class="!mr-2px"></el-divider>
			<span class="bt-link" @click="installEnvPlugin(envPluginName || '')"> 安装{{ type }}环境 </span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { openServerView, installEnvPlugin } from '../../useMethod'

interface Props {
	type: string
}
const props = withDefaults(defineProps<Props>(), {
	type: '',
})

// 环境插件名称
const envPluginName = computed(() => (props.type === 'PgSql' ? 'pgsql_manager' : props.type?.toLowerCase()))

// 提示
const tips = computed(() => `${props.type !== 'SqlServer' ? `当前未安装${props.type}环境/远程数据库` : '当前未添加远程数据库'}`)
</script>

<style scoped></style>
