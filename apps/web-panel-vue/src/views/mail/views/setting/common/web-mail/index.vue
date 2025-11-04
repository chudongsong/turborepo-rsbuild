<template>
	<setting-card title="WebMail">
		<div class="flex items-center">
			<div class="flex items-center mr-32px text-base">
				<span class="mr-10px">安装状态:</span>
				<span :class="info.status ? 'text-primary' : 'text-dangerDark'">
					{{ info.status ? '已安装' : '未安装' }}
				</span>
			</div>
			<div v-if="info.status" class="flex items-center mr-24px text-base">
				<span class="mr-10px">URL:</span>
				<bt-link :href="url" target="_blank">{{ url }}</bt-link>
				<!-- <span v-if="!info.ssl_status" class="flex items-center ml-6px text-desc">
					(当前域名需要 <bt-link @click="goSite">启用SSL</bt-link> 才能使用一键登录)
				</span> -->
			</div>
			<template v-if="info.status">
				<el-button @click="onUninstall"> 卸载 </el-button>
			</template>
			<template v-else>
				<el-button type="primary" ghost @click="onInstall"> 安装 </el-button>
				<el-button class="ml-10px" @click="onShowConfig">
					<span>添加已有的服务</span>
				</el-button>
				<!-- <el-tooltip>
					<template #content>
						If you have used Roundcube WebMail installed with one-click deployment, you can add it
						here
					</template>
<template #default>
						<el-icon class="ml-10px text-medium"><Warning /></el-icon>
					</template>
</el-tooltip> -->
			</template>
		</div>
	</setting-card>
</template>

<script lang="tsx" setup>
import SettingCard from '@mail/public/setting-card.vue'
import MAIL_SETTING_WEB from '@mail/views/setting/common/web-mail/store'
import { storeToRefs } from 'pinia'
import { getInfo, onUninstall, onInstall, onShowConfig, goSite } from '@mail/views/setting/common/web-mail/useMethod'

const { info, url } = storeToRefs(MAIL_SETTING_WEB())

const { reset } = MAIL_SETTING_WEB()

getInfo()

onUnmounted(() => {
	reset()
})
</script>
