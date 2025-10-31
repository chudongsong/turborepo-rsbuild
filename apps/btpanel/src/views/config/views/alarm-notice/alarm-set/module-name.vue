<template>
	<div class="flex items-center">
		<div class="icon" :class="row.ps.indexOf('API') > -1 ? 'webhook' : row.name"></div>
		<div class="flex-1 leading-[1.5]">
			<span class="text-base font-bold cursor-pointer" @click="onClick(row)">
				{{ row.title }}
			</span>
			<div class="flex">
				<span>{{ row.ps }}</span>
				<bt-link :href="row.help" target="_blank">>>帮助文档</bt-link>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
// import { openAlarmSetDialog } from '@config/setting/config.popup'
// import { AlarmSetting } from '@config/type.d'

interface Props {
	row: any
}

withDefaults(defineProps<Props>(), {})

const onClick = (row: any) => {
	// if (row.name !== 'sms') {
	// 	openAlarmSetDialog(row)
	// }
}
</script>

<style lang="css" scoped>
.icon {
	width: 36px;
	height: 36px;
	margin-right: 8px;
	background: url('/static/images/config/config-alarm.png');
	background-size: 100%;
	border-radius: var(--el-border-radius-medium);
}

.icon.mail {
	background-position: 0 36px;
}

.icon.dingding {
	background-position: 0 0;
}

.icon.feishu {
	background-position: 0 144px;
}

.icon.weixin {
	background-position: 0 72px;
}

.icon.wx_account {
	background-position: 0 108px;
}

.icon.sms {
	background-position: 0 180px;
}

.icon.webhook {
	background: url('/static/images/config/config_alert_api.png');
	background-size: 36px;
}
</style>
