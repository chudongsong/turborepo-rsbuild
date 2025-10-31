<template>
	<div>
		<div>
			当前登录信息：
			<div class="login-message">
				<div class="login-message-row">
					<span class="login-message-title">IP</span>
					<span class="login-message-content">{{ loginInfo.ip_info.ip }}</span>
				</div>
				<div class="login-message-row">
					<span class="login-message-title">归属地</span>
					<span class="login-message-content">{{ loginInfo.ip_info.info }}</span>
				</div>
			</div>
		</div>
		<div>
			上次登录信息：
			<div class="login-message">
				<div class="login-message-row">
					<span class="login-message-title">IP</span>
					<span class="login-message-content">
						{{ loginInfo.last_login.ip_info.ip }}
						<el-tooltip v-if="loginInfo.last_login.ip_info.ip !== loginInfo.ip_info.ip" content="登录异常" effect="dark" placement="top">
							<i class="svgtofont-el-warning text-warning cursor-pointer ml-[8px]"></i>
						</el-tooltip>
					</span>
				</div>
				<div class="login-message-row">
					<span class="login-message-title">归属地</span>
					<span class="login-message-content">{{ loginInfo.last_login.ip_info.info }}</span>
				</div>
				<div class="login-message-row">
					<span class="login-message-title">时间</span>
					<span class="login-message-content">{{ loginInfo.last_login.login_time_str }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import HOME_LOGIN_PROMPT_STORE from './store'

const store = HOME_LOGIN_PROMPT_STORE()
const { loginInfo } = storeToRefs(store)

onMounted(() => store.initData())
</script>

<style lang="css" scoped>
.login-success {
	@apply h-[29.8rem] w-[35.6rem];
}

.login-message {
	@apply my-[10px] mx-0 h-[auto] border border-dark;
	@apply bg-white text-secondary flex flex-col;
}

.login-message-content {
	@apply flex items-center ml-[12px];
}

.login-message-title {
	@apply h-[3rem] w-[6.8rem];
	@apply bg-light text-tertiary px-[12px] inline-block leading-[3rem] text-center mr-[10px];
	border-right: 1px solid var(--el-color-border-dark);
}

.login-message-row {
	@apply bg-light flex items-center w-[26rem];
	border-bottom: 1px solid var(--el-color-border-dark);
}

.login-message-row:last-child {
	border-bottom: 0;
}
</style>
