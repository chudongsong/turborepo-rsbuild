<template>
	<footer v-if="showFooter" id="layout-footer" class="flex items-center items-end w-full h-[30px] mb-[14px] text-base justify-center relative z-90 mt-[14px]">
		<span class="mr-[8px] text-tertiary text-small">{{ vite_public_brand }}{{ vite_public_product }}©2014-{{ vite_public_year }} 广东堡塔安全技术有限公司 (bt.cn)</span>
		<BtDivider />
		<BtLink class="bt-link-info" href="http://www.bt.cn/bbs">
			<bt-svg name="tools-help" size="14" class="mr-[.2rem]" color="var(--el-color-primary)" />
			<span class="h-[1.2rem] flex items-center text-tertiary">论坛求助</span>
		</BtLink>
		<BtDivider />
		<BtLink class="bt-link-info" href="https://docs.bt.cn">
			<bt-svg name="tools-manual" size="14" class="mr-[.2rem]" />
			<span class="h-[1.2rem] flex items-center text-tertiary">使用手册</span>
		</BtLink>
		<BtDivider />
		<BtPopover placement="top-start" popper-class="white-tips-popover" width="160" trigger="hover">
			<template #reference>
				<span class="flex bt-link-info items-center">
					<bt-svg name="tools-wechat" size="14" class="mr-[.2rem]" />
					<span class="text-small h-[1.2rem] flex items-center text-tertiary cursor-pointer">微信公众号</span>
				</span>
			</template>
			<div class="w-full flex items-center justify-center">
				<BtImage :src="'/other/bt_wx.jpg'" />
			</div>
		</BtPopover>
		<BtDivider />
		<BtLink class="bt-link-info" href="https://www.bt.cn/auth">
			<bt-svg name="tools-check" size="14" class="mr-[.2rem]" />
			<span class="h-[1.2rem] flex items-center text-tertiary">正版查询</span>
		</BtLink>
		<BtDivider />
		<BtPopover placement="top-start" popper-class="white-tips-popover" width="160" trigger="hover">
			<template #reference>
				<span class="flex bt-link-info items-center">
					<bt-svg name="tools-customer" size="14" class="mr-[.2rem]" />
					<span class="text-small h-[1.2rem] flex items-center text-tertiary cursor-pointer">联系人工客服</span>
				</span>
			</template>
			<div class="w-full flex items-center justify-center">
				<BtImage :src="'/other/customer-qrcode.png'" class="w-[150px]" />
			</div>
		</BtPopover>
	</footer>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const showFooter = computed(() => !route.path.includes('waf'))
const { vite_public_brand, vite_public_product, vite_public_year } = window
</script>

<style lang="scss" scoped>
@media screen and (max-width: 1000px) {
	.bt-link-info svg {
		display: none;
	}
}
</style>
