<template>
	<div>
		<!-- <config-title v-show="settingSearch === ''">安全设置</config-title> -->
		<SafeAlarm />
		<PanelSsl />
		<PortFree />
		<BasicAuth />
		<DynamePwd />
		<DeviceAuth />
		<PwdSafe />
		<BindDomain />
		<AuthIp />
		<PanelPort />
		<SafeEntry />
		<UnauthResp />
		<PwdExpire />
		<TempAuth />
		<AreaLogin />
		<UaAstrict />
	</div>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'

import SafeAlarm from './safe-alarm/index.vue'
import PanelSsl from './panel-ssl/index.vue'
import PortFree from './port-free/index.vue'
import BasicAuth from './basic-auth/index.vue'
import DynamePwd from './dyname-pwd/index.vue'
import DeviceAuth from './device-auth/index.vue'
import PwdSafe from './pwd-safe/index.vue'
import BindDomain from './bind-domain/index.vue'
import AuthIp from './auth-ip/index.vue'
import PanelPort from './panel-port/index.vue'
import SafeEntry from './safe-entry/index.vue'
import UnauthResp from './unauth-resp/index.vue'
import PwdExpire from './pwd-expire/index.vue'
import TempAuth from './temp-auth/index.vue'
import AreaLogin from './area-login/index.vue'
import UaAstrict from './ua-astrict/index.vue'

import ConfigTitle from '@config/public/config-title/index.vue'

const {
	refs: { settingSearch },
} = getConfigStore()
</script>
