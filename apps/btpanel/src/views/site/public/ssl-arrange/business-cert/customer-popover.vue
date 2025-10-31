<template>
	<el-popover
		ref="BtCustomerPopover"
		v-bind="$attrs"
		:trigger="trigger"
		:placement="placement"
		effect="light"
		popper-class="BtCustomerPopover"
		:show-arrow="showArrow"
		:popper-style="{
			padding: '0',
			border: '0',
			background: '0',
		}">
		<div id="wechat-customer" class="wechat-customer">
			<div class="w-full h-[46px] flex flex-row items-center justify-center">
				<bt-link target="_blank" href="https://www.bt.cn/new/wechat_customer" class="text-[16px] flex flex-row flex-nowrap items-center">
					<div class="flex items-center border-b border-solid border-[var(--el-color-primary-light-9)] pb-4px">
						点击咨询客服
						<i class="svgtofont-el-d-arrow-right ml-4px w-[15px]"></i>
					</div>
				</bt-link>
			</div>
			<div class="qrcode-wechat w-[128px] h-[128px] m-[8px_0_4px_0]">
				<div id="wechatCustomerQrcode">
					<bt-image src="/customer/customer-qrcode.png"></bt-image>
				</div>
			</div>
			<div class="wechat-title">
				<img
					class="icon"
					style="width: 17px; height: 17px"
					src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAATlJREFUSEvtVrFOw0AMfed8AxJsZWGAgQHBXP4DCQa+Ioou7g18BRIg9T/KDGJggIGFbiDxDXGQowSBuGvrFISEmtF+7/nis312RVEMiWgIoMT375aIjpj5KeJrTMy8JSJjAPsRzEhErl1Zlhd1XZ8kRKZEdMjM0xlBBiIyATCIYZxzl857X6uTiHaY+TElZrUz87aIPCjvI0gIwVmF5uG7H1gFmZepxv85XTdqCCEcLMQ0gLz3jbbTOm/rPdkLBt0v0E77xysq2it9T2nhuTzPN4ho10KyYEXkXvvkBcC6hWjEvmqQMwCnANZa8p1RJAbfa41vAM7/0cUzczOiZ43zvunrtPVOntuO3+wrluJ12qspvFBm/+bR+u03nhPrkKZk2ZVINUZO964sy44Ta9FSK5GuQ1VVXb0DLf+sHQ9tLL0AAAAASUVORK5CYII=" />
				<div class="scan-title" style="font-size: 16px">扫一扫</div>
			</div>
			<span class="layui-layer-setwin wechat-close" style="display: block">
				<a href="javascript:;" class="layui-layer-ico layui-layer-close layui-layer-close2"></a>
			</span>
		</div>
		<template #reference>
			<slot></slot>
		</template>
	</el-popover>
</template>

<script setup lang="ts">
import { Placement, TooltipTriggerType } from 'element-plus'

interface Props {
	trigger?: 'click' | 'focus' | 'hover' | 'contextmenu' | TooltipTriggerType[]
	showArrow?: boolean
	placement?: Placement
}

const props = withDefaults(defineProps<Props>(), {
	trigger: 'click', // 触发方式 	click/focus/hover/manual
	showArrow: true, // 是否显示箭头
	placement: 'left', // 弹出位置   top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end
})

const BtCustomerPopover = ref<any>(null) // 用于获取组件实例

const trigger = computed(() => props.trigger)
const showArrow = computed(() => props.showArrow)
const placement = computed(() => props.placement)

defineExpose({
	BtCustomerPopover: () => BtCustomerPopover,
})
</script>

<style lang="css" scoped>
.wechat-customer {
	@apply bg-extraLight border-lighter border-1 rounded-base p-[0] text-center text-small w-[170px] h-[228px] flex flex-col items-center flex-nowrap;
	box-shadow: 0 6px 8px rgba(0, 0, 0, 0.25);
}

.wechat-title {
	@apply flex text-[1.1rem] font-bold text-secondary w-[10.3rem] h-[2.6rem] flex-row items-center justify-evenly;
}

.icon-r1 {
	bagkground-image: url('/static/icons/arrow.svg');
	background-repeat: no-repeat;
	background-size: contain;
}

.bt-popover {
	background-color: #ef0808 !important;
}

.bt-popover .popper__arrow::after {
	border-top-color: #ef0808 !important;
	border-bottom-color: #ef0808 !important;
}
</style>
