<template>
	<div class="search-results">
		<!-- <config-title>{{ `${settingSearch === '' ? '面板' : '搜索'}设置` }}</config-title> -->
		<!-- 关闭面板 -->
		<ClosePanel />
		<!-- 监听IPv6 -->
		<ListenIpv6 />
		<!-- 离线模式 -->
		<OfflineMode />
		<!-- 开发者模式 -->
		<DeveloperMode />
		<!-- API接口 -->
		<ApiInterface />
		<!-- 在线客服 -->
		<CustomerService />

		<!-- 登录归属地提示 -->
		<LoginOrigin />
		<!-- 用户体验 -->
		<UserExperience />

		<!-- 面板名称 -->
		<PanelName />
		<!-- 菜单标题 -->
		<MenuTitle />
		<!-- 会话超时 -->
		<SessionTimeout />
		<!-- 站点路径 -->
		<SitePath />
		<!-- 备份路径 -->
		<BackupPath />
		<!-- 服务器IP -->
		<ServerIp />
		<!-- 服务器时间 -->
		<ServerTime />
		<!-- 服务器时区 -->
		<ServerZone />
		<!-- 用户名 -->
		<UsernameSet />
		<!-- 密码 -->
		<PasswordSet />
		<!-- 账号 -->
		<AccountSet />
		<!-- 菜单隐藏 -->
		<MenuHide />
		<!-- 请求方式 -->
		<RequestMethod />
		<!-- 请求行 -->
		<RequestLine />
		<!-- 面板节点 -->
		<PanelNode />
	</div>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'

import ClosePanel from './close-panel/index.vue'
import ListenIpv6 from './listen-ipv6/index.vue'
import OfflineMode from './offline-mode/index.vue'
import DeveloperMode from './developer-mode/index.vue'
import ApiInterface from './api-interface/index.vue'
import CustomerService from './customer-service/index.vue'
import UserExperience from './user-experience/index.vue'
import PanelName from './panel-name/index.vue'
import MenuTitle from './menu-title/index.vue'
import SessionTimeout from './session-timeout/index.vue'
import SitePath from './site-path/index.vue'
import BackupPath from './backup-path/index.vue'
import ServerIp from './server-ip/index.vue'
import ServerTime from './server-time/index.vue'
import UsernameSet from './username-set/index.vue'
import PasswordSet from './password-set/index.vue'
import AccountSet from './account-set/index.vue'
import MenuHide from './menu-hide/index.vue'
import RequestMethod from './request-method/index.vue'
import RequestLine from './request-line/index.vue'
import PanelNode from './panel-node/index.vue'
import LoginOrigin from './login-prompt/index.vue'
import ServerZone from './server-zone/index.vue'

import ConfigTitle from '@config/public/config-title/index.vue'

const {
	refs: { settingSearch },
} = getConfigStore()
</script>
