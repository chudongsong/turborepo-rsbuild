<!--  -->
<template>
	<bt-tabs v-model="activeName" type="left-bg-card" @tab-click="handleTabClick">
		<el-tab-pane label="服务" name="service">
			<Status></Status>
		</el-tab-pane>

		<el-tab-pane label="配置文件" name="config">
			<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
			<div class="my-[12px]">
				<bt-editor v-bt-loading="textLoading" class="!h-[36rem] !w-[50rem]" v-model="staticContent" id="configContent" :filePath="`/usr/local/lsws/conf/httpd_config.conf`" />
			</div>
			<el-button type="primary" @click="saveFileEvent">保存</el-button>
			<bt-help :options="helpList" class="ml-[20px] mt-[20px]"></bt-help>
		</el-tab-pane>

		<el-tab-pane label="参数设置" name="setting" v-bt-loading="viewLoading"
			><div class="flex flex-col text-secondary performance">
				<el-form label-position="right" label-width="186px">
					<el-form-item :label="item.name" v-for="(item, index) in paramData" :key="index">
						<div class="flex items-center">
							<bt-input v-model="item.value" v-if="item.name !== 'enableGzipCompress'" width="16rem"></bt-input>
							<div v-else>
								<el-switch v-model="item.value" class="w-[16rem]"></el-switch>
							</div>
							<el-tooltip v-if="item.name != 'rollingSize'" class="item" effect="dark" placement="top-start">
								<template #content>
									<div v-html="item.ps"></div>
								</template>
								<i class="svgtofont-el-warning text-orange text-medium ml-[8px]"></i>
							</el-tooltip>
						</div>
					</el-form-item>
					<el-form-item label=" ">
						<el-button type="primary" @click="getOpenLiteSpeedConf">刷新</el-button>
						<el-button type="primary" @click="saveSetting">保存</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-tab-pane>
	</bt-tabs>
</template>

<script setup lang="ts">
import Status from '@soft/public/environment-plugin/public/service-status/index.vue'
import { activeName, staticContent, textLoading, viewLoading, paramData, helpList, handleTabClick, saveFileEvent, getOpenLiteSpeedConf, saveSetting, init } from './useController'

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
