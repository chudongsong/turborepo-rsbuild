<template>
	<div class="w-full p-[2rem] text-small">
		<div class="flex items-center">
			<div class="message flex-1 py-[.3rem] leading-[2.4rem]">
				<el-alert :show-icon="false" :closable="false" type="info">
					<template #title>
						<div class="leading-[2.5rem] flex items-center whitespace-nowrap">
							提示：如果当前插件出现<span class="text-[red]">异常错误</span>或<span class="text-[red]">无法使用</span>，请尝试点击
							<el-button size="small" type="primary" title="修复插件" class="!ml-[.5rem]" @click="repairPluginEvent"> 修复插件 </el-button>
						</div>
					</template>
				</el-alert>
				<!-- 特殊插件显示版本下拉 -->
				<template v-if="isSpecial">
					<div class="flex items-center justify-center mt-[2rem]">
						<div>选择版本</div>
						<bt-select v-model="plugin.version" :options="plugin.options" class="!w-[24rem] ml-[2rem] mr-[1rem]" />
						<el-button type="primary" title="切换版本" class="!ml-[.5rem]" @click="cutVersionEvent">切换版本</el-button>
					</div>
					<bt-help class="mt-[2rem] ml-[2rem]" :list="helpList" />
				</template>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SOFT_PLUGIN_STORE from '../store'
import { SOFT_STORE } from '@/views/soft/store'

const { isSpecial } = storeToRefs(SOFT_STORE())
const { plugin } = storeToRefs(SOFT_PLUGIN_STORE())
const { helpList, getPluginInfo, cutVersionEvent, repairPluginEvent } = SOFT_PLUGIN_STORE()

onMounted(getPluginInfo)
</script>
