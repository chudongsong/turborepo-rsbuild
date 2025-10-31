<template>
	<div class="p-[2rem]">
		<!-- 文件保护 -->
		<div class="tools-card">
			<div class="tools-img">
				<span class="svgtofont-tamper-pro !text-extraLarge text-primary"></span>
			</div>
			<div class="tools-name">防篡改</div>
			<el-switch :model-value="file.status" :loading="fileLoad" @change="onUpdateFile"></el-switch>
			<i class="svgtofont-icon-ltd !text-extraLarge text-ltd"></i>
			<!-- <el-button class="ml-[1rem]" size="small" @click="onSetupFile">
				<span class="svgtofont-left-config !text-extraLarge"></span>
			</el-button> -->
			<div class="tools-desc flex items-center">
				<el-tag type="danger" size="small" :bordered="false">{{ file.number }}</el-tag>
				<span class="ml-[.5rem]"> 今天的修改被阻止 </span>
			</div>
		</div>

		<!-- 防火墙 -->
		<div class="tools-card">
			<div class="tools-img">
				<span class="svgtofont-left-waf !text-subtitleLarge text-primary"></span>
			</div>
			<div class="tools-name">Nginx WAF</div>
			<el-switch :model-value="firewall.status" :loading="firewallLoad" @change="onUpdateFirewall"></el-switch>
			<i class="svgtofont-icon-ltd !text-extraLarge text-ltd"></i>
			<!-- <el-button class="ml-[1rem]" size="small" @click="">
				<span class="svgtofont-left-config !text-extraLarge"></span>
			</el-button> -->
			<div class="tools-desc">
				<el-tag type="danger" size="small" :bordered="false">{{ firewall.number }}</el-tag>
				<span class="ml-[.5rem]"> 恶意请求今天被阻止 </span>
			</div>
		</div>

		<!-- 防盗链 -->
		<div class="tools-card">
			<div class="tools-img">
				<span class="svgtofont-el-link !text-subtitleLarge text-primary"></span>
			</div>
			<div class="tools-name">防盗链</div>
			<el-switch :model-value="hotlink" :loading="hotlinkLoad" @change="onUpdateHotlink"></el-switch>
			<!-- <el-button class="ml-[1rem]" size="small" @click="">
				<span class="svgtofont-left-config !text-extraLarge"></span>
			</el-button> -->
		</div>
	</div>
</template>

<script setup lang="ts">
import useWPProtectionStore from '@/views/wordpress/view/local/site-protection/useStore'
import { storeToRefs } from 'pinia'
import { init, onSetupFile, onUpdateFile, onUpdateFirewall, onUpdateHotlink } from './useController'

const { file, fileLoad, firewall, firewallLoad, hotlink, hotlinkLoad } = storeToRefs(useWPProtectionStore())

init()
</script>

<style lang="css" scoped>
.tools-card {
	display: flex;
	align-items: center;
	padding: 12px 24px;
	border-radius: var(--el-border-radius-base);
	background-color: var(--el-fill-color-light);
}
.tools-card + .tools-card {
	margin-top: 16px;
}
.tools-card .tools-img {
	display: flex;
	justify-content: center;
	width: 26px;
}
.tools-card .tools-name {
	min-width: 150px;
	padding: 0 12px;
	font-size: var(--el-font-size-base);
}
.tools-card .tools-desc {
	margin-left: 16px;
}
</style>
