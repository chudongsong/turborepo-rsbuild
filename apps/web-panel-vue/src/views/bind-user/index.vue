<template>
	<div class="flex flex-col items-center" :style="{ 'min-height': mainHeight - 200 + 'px' }">
		<BtAlert v-if="forceLtd" class="w-[44rem]" :closable="false" type="warning" title="温馨提醒：Linux 面板企业版为付费版本，绑账号试用14天，试用结束后可选择需续费企业版或者继续使用免费版。（付费插件功能不可继续使用，功能与直接安装免费版无任何区别）" />
		<BtBindUser v-if="commonBind" class="w-[44rem]" :compData="{ title: '绑定宝塔官网账号', btn: '登录' }" />

		<component class="w-[44rem]" v-if="!commonBind && !aliyunEcsLtd" :compData="{ title: '绑定宝塔官网账号', btn: '登录', authData, onChangeType, isDialog: false }" :is="asyncBindComponent"></component>
		<template v-if="bindType === 'bind' && !aliyunEcsLtd">
			<ul class="list-disc help-text-info -ml-7rem">
				<li>为了您能更好的体验面板功能，请先绑定堡塔账号；</li>
				<li>单个宝塔帐号支持多台服务器绑定；</li>
				<li>绑定帐号没有接管服务器的功能权限，请放心使用；</li>
				<li>帐号绑定过程中遇到问题请联系客服处理；</li>
				<li>客服电话：0769-23030556</li>
				<li>
					客服咨询：
					<el-popover placement="bottom" width="150" trigger="hover" popper-class="white-tips-popover" class="inline-block relative leading-[2.4rem]">
						<template #reference>
							<span class="bt-link">查看二维码</span>
						</template>
						<bt-image width="150" :src="`/other/customer-qrcode.png`" alt="客服咨询" />
					</el-popover>
				</li>
			</ul>
		</template>
		<li v-if="bindType === 'other' && !aliyunEcsLtd">
			如果遇到问题，请联系客服处理：
			<el-popover placement="bottom" width="150" trigger="hover" popper-class="white-tips-popover" class="inline-block relative leading-[2.4rem]">
				<template #reference>
					<span class="bt-link">查看二维码</span>
				</template>
				<bt-image width="150" :src="`/other/customer-qrcode.png`" alt="客服咨询" />
			</el-popover>
		</li>
	</div>
</template>

<script lang="ts" setup>
import { useGlobalStore } from '@store/global'
import { checkLoginAuth } from '@api/global'

import AliBindUser from '@/components/business/bt-bind-user/ali-bind-user.vue'
import TencentBindUser from '@/components/business/bt-bind-user/tencent-bind-user.vue'

import BtImage from '@/components/base/bt-image'
import { ElPopover } from 'element-plus'
import { clearCache } from '@/utils'

const { mainHeight, forceLtd, aliyunEcsLtd } = useGlobalStore()
const commonBind = ref(true) // 是否普通面板

const bindType = ref('bind') // bind堡塔账号，other第三方账号
const authData = ref({
	client: 0, // 服务商标识 0：宝塔账号，1：腾讯云，2：阿里云
	login: 0, // 授权登录方式 0：宝塔账号，1：一键登录，2：授权登录
}) // 一键登录权限

const asyncBindComponent = ref<Component | string>('div') // 第三方绑定组件

// 切换绑定类型
const onChangeType = (type: 'bind' | 'other') => {
	bindType.value = type
}

// 判断是否有一键登录权限
const checkBindAuth = async () => {
	try {
		const res = await checkLoginAuth()
		commonBind.value = true // 默认使用普通绑定
		// 检查是否支持第三方登录
		if (res.status && res.data?.login !== 0) {
			const clientMap = {
				1: TencentBindUser,
				2: AliBindUser,
			}
			authData.value = {
				client: res.data.client,
				login: res.data.login,
			}
			asyncBindComponent.value = clientMap[res.data.client as keyof typeof clientMap] || 'div'
			commonBind.value = false
		}
	} catch (error) {
		// 出错时使用普通绑定
		commonBind.value = true
	}
}

onMounted(() => {
	// 页面挂载时清除缓存
	clearCache()
	// 页面加载时检查绑定权限
	nextTick(checkBindAuth)
})
</script>

<style lang="css" scoped>
.help-text-info li {
	@apply items-center leading-[2.4rem] text-secondary;
}

.advantage-list {
	box-shadow: 0 0 4px 2px #00000017;
	@apply w-[80%] flex justify-center items-center mt-[2.4rem] mx-[auto] text-small truncate bg-[var(--el-color-warning-light-9)] p-[1.6rem] rounded-base;
}
</style>
