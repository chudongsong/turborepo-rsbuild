<!--  -->
<template>
	<bt-tabs v-model="activeName" type="left-bg-card" @tab-click="handleTabClick">
		<el-tab-pane label="服务" name="service">
			<Status></Status>
		</el-tab-pane>

		<el-tab-pane label="配置文件" name="config">
			<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
			<div class="my-[12px]">
				<bt-editor v-bt-loading="textLoading" class="!h-[36rem] !w-[full]" v-model="staticContent" id="configContent" :filePath="`/www/server/tomcat/conf/server.xml`" />
			</div>
			<el-button @click="saveFileEvent" type="primary">保存</el-button>
			<ul class="leading-8 mt-20px text-small list-disc ml-[20px]">
				<li>此处为tomcat主配置文件,若您不了解配置规则,请勿随意修改</li>
			</ul>
		</el-tab-pane>

		<el-tab-pane label="版本切换" name="version">
			<div class="flex text-secondary items-center">
				<span>选择版本</span>
				<el-select class="mx-[12px] !w-[18rem]" v-model="version">
					<el-option v-for="(item, index) in versionList" :key="index" :label="'tomcat' + item.m_version" :value="item.m_version"></el-option>
				</el-select>
				<el-button type="primary" @click="switchVersion(compData)">切换</el-button>
			</div>
		</el-tab-pane>

		<el-tab-pane label="运行日志" name="logs">
			<div class="pre-box bg-[#333] text-white h-[50rem] overflow-auto p-[12px] rounded-small" v-bt-loading="textLoading" v-scroll-bottom>
				{{ logMsg || '暂无日志' }}
			</div>
		</el-tab-pane>
	</bt-tabs>
</template>

<script setup lang="ts">
import Status from '@soft/public/environment-plugin/public/service-status/index.vue'
import { activeName, staticContent, textLoading, logMsg, version, versionList, handleTabClick, saveFileEvent, switchVersion, init } from './useController'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

onMounted(() => {
	init(props.compData)
})
</script>
