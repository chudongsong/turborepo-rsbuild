<template>
	<!-- 第三方插件 -->
	<div class="p-20px">
		<!-- 插件描述 -->
		<div class="p-20px text-base bg-light rounded-base border border-lighter">
			<div class="mt-12px">
				<span class="font-bold">插件名称：</span>
				<span>{{ compData.title }}</span>
			</div>
			<div class="mt-12px">
				<span class="font-bold">插件版本：</span>
				<span>{{ `${Array.isArray(compData.versions) ? compData.versions[0]?.m_version + '.' + compData.versions[0]?.version : compData.versions}` }}</span>
			</div>
			<div class="mt-12px">
				<span class="font-bold">插件描述：</span>
				<span class="leading-10">{{ decodeHtml(compData.ps?.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '') || '') }}</span>
			</div>
			<div class="mt-12px">
				<span class="font-bold">插件大小：</span>
				<span>{{ getByteUnit(compData.size) }}</span>
			</div>
			<div class="mt-12px">
				<span class="font-bold">插件开发商：</span>
				<span>{{ compData.author }}</span>
			</div>
			<div class="mt-12px">
				<span class="font-bold">插件来源：</span>
				<bt-link :href="compData.home" class="!text-base">{{ compData.home }}</bt-link>
			</div>
		</div>
		<bt-help class="ml-20px mt-12px" :options="[{ content: '安装过程可能需要几分钟时间，请耐心等候！' }, { content: '如果已存在此插件，将被替换！' }]"></bt-help>
		<bt-dialog :title="'正在执行安装脚本，请稍候...'" v-model="isShowSpeedVisible" :area="50" @cancel="cancelInstall">
			<SpeedInstall :compData="{}" />
		</bt-dialog>
	</div>
</template>
<script setup lang="ts">
import { getByteUnit } from '@utils/index'
import SOFT_OTHER_STORE from '../store'
import SpeedInstall from '@components/business/bt-soft-install/popup/speed-install.vue'
import { storeToRefs } from 'pinia'
import { decodeHtml } from '@utils/index'

const { installThirdPlugin, cancelInstall, $reset_install } = SOFT_OTHER_STORE()

const { rowData: compData, isShowSpeedVisible } = storeToRefs(SOFT_OTHER_STORE())

defineExpose({ onConfirm: installThirdPlugin })
onUnmounted($reset_install)
</script>
