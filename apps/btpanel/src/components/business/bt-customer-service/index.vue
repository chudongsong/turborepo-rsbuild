<!-- 
	@Descripttion: 客服显示组件
	@Author: chudong
	@version: 1.0
	@Date: 2024-09-25 11:43:00
	@LastEditors: chudong
	@LastEditTime: 2024-09-25 23:00:00
  -->
<template>
	<div class="toolbar-right">
		<BtPopover placement="left" effect="light" popper-class="!p-0" :visible="openCustomer" trigger="hover" width="160px">
			<div id="wechat-customer" class="wechat-customer" @mouseover="serviceMouseOver" @mouseleave="serviceMouseLeave">
				<div class="customer-title">
					<BtLink target="_blank" href="https://www.bt.cn/new/wechat_customer" class="text-medium cursor-pointer flex flex-row items-center flex-nowrap">
						<div class="flex border-solid border-b-1 border-primary text-primary justify-center items-center">
							点击咨询客服
							<BtIcon icon="arrow" :size="16" color="var(--el-color-primary)" class="ml-[5px]" />
						</div>
					</BtLink>
				</div>
				<div class="qrcode-wechat w-[128px] h-[128px] mt-[8px] mb-[4px]">
					<div id="wechatCustomerQrcode">
						<bt-image src="/customer/customer-qrcode.png" />
					</div>
				</div>
				<div class="wechat-title flex">
					<img
						class="w-[14px] h-[14px]"
						src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAATlJREFUSEvtVrFOw0AMfed8AxJsZWGAgQHBXP4DCQa+Ioou7g18BRIg9T/KDGJggIGFbiDxDXGQowSBuGvrFISEmtF+7/nis312RVEMiWgIoMT375aIjpj5KeJrTMy8JSJjAPsRzEhErl1Zlhd1XZ8kRKZEdMjM0xlBBiIyATCIYZxzl857X6uTiHaY+TElZrUz87aIPCjvI0gIwVmF5uG7H1gFmZepxv85XTdqCCEcLMQ0gLz3jbbTOm/rPdkLBt0v0E77xysq2it9T2nhuTzPN4ho10KyYEXkXvvkBcC6hWjEvmqQMwCnANZa8p1RJAbfa41vAM7/0cUzczOiZ43zvunrtPVOntuO3+wrluJ12qspvFBm/+bR+u03nhPrkKZk2ZVINUZO964sy44Ta9FSK5GuQ1VVXb0DLf+sHQ9tLL0AAAAASUVORK5CYII=" />
					<div class="text-base font-black">扫一扫</div>
				</div>
				<span class="layui-layer-setwin wechat-close" style="display: block"><a href="javascript:;" class="layui-layer-ico layui-layer-close layui-layer-close2"></a></span>
				<div v-show="serviceCloseBtnShow" @click="closeCustomer" class="absolute -top-1.5rem -right-1.5rem z-999 w-[3rem] h-3rem rounded-1/2 cursor-pointer">
					<div data-v-48b1409d="" class="absolute w-[3rem] h-3rem top-0 left-0 origin-center close-popup-btn"></div>
				</div>
			</div>
			<template #reference>
				<div class="icon-menu" @mouseover="serviceMouseOver" @mouseleave="serviceMouseLeave" @click="serviceClickFun">
					<BtIcon icon="customer-service" :size="45" color="var(--el-color-primary)" />
				</div>
			</template>
		</BtPopover>
		<BtTooltip effect="dark" content="点击打开调查问卷" placement="left" :enterable="true">
			<div class="icon-menu" @click="npsSurveyDialog">
				<BtIcon icon="evaluation-feedback" :size="45" color="var(--el-color-primary)" />
				<!-- npsSurveyDialog -->
			</div>
		</BtTooltip>
	</div>
</template>

<script setup lang="ts">
import { npsSurveyDialog } from '@/public/index' // 引入公共方法
import { getNps } from '@/api/global'
import { useGlobalStore } from '@/store/global'
const { panel } = useGlobalStore()

const service = ref(true)
const openCustomer = ref(false)
const serviceCloseBtnShow = ref(false)
let time: any = 0

const serviceMouseOver = () => {
	if (!serviceCloseBtnShow.value) {
		clearTimeout(time)
		service.value = false
		openCustomer.value = true
	} else {
		return false
	}
}
const serviceMouseLeave = () => {
	if (!serviceCloseBtnShow.value) {
		if (time !== 0) {
			service.value = true
			openCustomer.value = false
			time = 0
			return
		}
		time = setTimeout(() => {
			service.value = true
			openCustomer.value = false
		}, 500)
	} else {
		return false
	}
}

const serviceClickFun = () => {
	service.value = true
	openCustomer.value = true
	serviceCloseBtnShow.value = true
}

const closeCustomer = () => {
	service.value = true
	openCustomer.value = false
	setTimeout(() => {
		serviceCloseBtnShow.value = false
	}, 500)
}
onMounted(async () => {
	if (!panel.value.panelNps) {
		const res = await getNps({
			version: 'v2',
			productType: 0,
			softwareName: 'panel',
		})
		if (res.data.nps && res.data.safe_day >= 15) npsSurveyDialog()
	}
})
</script>

<style lang="css" scoped>
/* 左侧工具栏  */
.toolbar-right {
	@apply w-[35px] h-[150px] fixed right-0 bottom-[70px] flex flex-col items-center justify-center rounded-base z-[999];
	background-color: rgb(var(--el-color-white-rgb));
	box-shadow: 0 0 2px 0 var(--el-color-border-dark);
}

.toolbar-right .basic {
	@apply inline-block h-[75px] w-[35px] relative bg-no-repeat bg-center bg-[13.5px];
}

/* 微信客服二维码 */
.wechat-customer {
	@apply text-center text-small box-border w-full h-[214px] flex flex-col items-center;
}

.wechat-customer .customer-title {
	@apply w-full h-[46px] flex items-center justify-center flex-row bg-[var(--el-color-primary-9)];
}

.wechat-customer .wechat-title {
	@apply text-small font-bold text-secondary w-[100px] h-[26px] flex flex-row items-center justify-evenly mb-[10px];
}

/* 图标菜单 */
.icon-menu {
	@apply flex-1 w-full flex items-center justify-center cursor-pointer;
}
.icon-menu:first-child {
	@apply rounded-t-base;
}
.icon-menu:last-child {
	@apply rounded-b-base;
}

.icon-menu:hover {
	background: var(--el-color-primary);
}

.icon-menu:hover i {
	color: var(--el-color-white) !important;
}

.icon-menu .span {
	@apply text-secondary text-extraLarge cursor-pointer transition-all duration-300;
}
</style>
