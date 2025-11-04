<template>
	<div>
		<!-- <config-title>常用设置</config-title> -->
		<!-- 面板主题 -->
		<!-- <PanelTheme /> -->
		<!-- 用户名 -->
		<UsernameSet />
		<!-- 密码 -->
		<PasswordSet />
		<!-- 账号 -->
		<AccountSet />
		<!-- 面板端口 -->
		<PanelPort />
		<!-- 安全入口 -->
		<SafeEntry />
		<!-- 开发者模式 -->
		<DeveloperMode />
		<!-- API接口 -->
		<ApiInterface />
		<!-- 绑定域名 -->
		<BindDomain />
		<!-- 面板SSL -->
		<PanelSsl />
		<!-- 菜单隐藏 -->
		<MenuHide />
	</div>
</template>

<script lang="ts" setup>
import ConfigTitle from '@config/public/config-title/index.vue'
import UsernameSet from '@config/views/panel-settings/username-set/index.vue'
import PasswordSet from '@config/views/panel-settings/password-set/index.vue'
import AccountSet from '@config/views/panel-settings/account-set/index.vue'
import PanelPort from '@config/views/safe-settings/panel-port/index.vue'
import SafeEntry from '@config/views/safe-settings/safe-entry/index.vue'
import DeveloperMode from '@config/views/panel-settings/developer-mode/index.vue'
import ApiInterface from '@config/views/panel-settings/api-interface/index.vue'
import PanelSsl from '@config/views/safe-settings/panel-ssl/index.vue'
import MenuHide from '@config/views/panel-settings/menu-hide/index.vue'
// import PanelTheme from '@config/views/panel-settings/panel-theme/index.vue'
import BindDomain from '@config/views/safe-settings/bind-domain/index.vue'
</script>

<style scoped></style>
