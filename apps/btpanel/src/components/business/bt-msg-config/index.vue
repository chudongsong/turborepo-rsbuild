<template>
	<div>
		<RobotBase v-if="type === 'dingding'" class="dingding" :placeholder="'钉钉'" :tip-name="'钉钉'"
			:tip-url="'https://www.bt.cn/bbs/thread-108081-1-1.html'" :type="'dingding'" @close="$emit('close')"
			@callback="callback" />
		<RobotBase v-if="type === 'feishu'" class="feishu" :placeholder="'飞书'" :tip-name="'飞书'"
			:tip-url="'https://www.bt.cn/bbs/thread-108274-1-1.html'" :type="'feishu'" @close="$emit('close')"
			@callback="callback" />
		<RobotBase v-if="type === 'weixin'" class="weixin" :placeholder="'企业微信'" :tip-name="'企业微信'"
			:tip-url="'https://www.bt.cn/bbs/thread-108116-1-1.html'" :type="'weixin'" @close="$emit('close')"
			@callback="callback" />
		<Mail v-if="type === 'mail'" @callback="callback" @close="$emit('close')" />
		<WeChatAccount v-if="type === 'wx_account'" @save="$emit('close')" />
	</div>
</template>

<script setup lang="ts">
import RobotBase from '@components/business/bt-msg-config/components/robot-base.vue'
import Mail from '@components/business/bt-msg-config/components/mail.vue'
import WeChatAccount from '@components/business/bt-msg-config/components/we-chat-account.vue'

interface Props {
	compData: CompDataProps
}

interface CompDataProps {
	type: string
	callback: (data: any) => void
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		type: '',
		callback: () => { }
	}),
})

const { type, callback } = toRefs(props.compData)
</script>
