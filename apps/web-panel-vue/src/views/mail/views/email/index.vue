<template>
	<div>
		<bt-tabs type="card" :options="menuList" v-model="menu" />
	</div>
</template>

<script lang="tsx" setup>

import Inbox from './inbox/index.vue'
import Outbox from './outbox/index.vue'
import Spam from './spam/index.vue'
import Sender from './send/index.vue'

const menu = ref('inbox')

const menuList = [
	{
		label: '收件箱',
		name: 'inbox',
		lazy: true,
		render: () => <Inbox />,
	},
	{ name: 'outbox', label: '发件箱', lazy: true, render: () => <Outbox /> },
	{ name: 'spam', label: '垃圾邮件', lazy: true, render: () => <Spam /> },
	{ name: 'sender', label: '发送邮件', lazy: true, render: () => <Sender /> },
]
</script>
