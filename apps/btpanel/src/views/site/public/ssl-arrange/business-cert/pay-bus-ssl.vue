<template>
	<div class="px-[3rem] py-[2rem] pb-[24px]">
		<el-alert type="error" :closable="false">
			<template #title>
				<span class="text-small">
					<i calss="svgtofont-el-warning-outline text-small"></i>
					<span> 禁止含有诈骗、赌博、色情、木马、病毒等违法违规业务信息的站点申请SSL证书，如有违反，撤销申请，停用账号。 </span>
				</span>
			</template>
		</el-alert>
		<div class="ssl-pay-type">
			<span v-for="item in tabsList" :key="item.name" :class="`ssl-pay-tab-item ${item.label === tabActive ? 'isActive' : ''}`" @click="cutPayType(item.label)">
				<span :class="`pay-icon ${item.label}`"></span>
				<span>{{ item.name }}</span>
			</span>
		</div>
		<div class="p-[24px] flex flex-col justify-center items-center">
			<bt-qrcode :value="qrcodeUrl" :size="160" />
			<span class="mt-[16px] text-base font-bold flex items-center">
				<span>总计</span>
				<span class="text-[2.5rem] ml-[8px] text-orange"> {{ productInfo?.totalPrice.toFixed(2) }} 元 </span>
			</span>
			<span v-if="showReSendBtn" class="mt-[20px] text-base flex items-center">
				<el-button type="default" @click="pollingMonitorPayStatus">刷新支付状态</el-button>
				<span class="bt-link ml-[2rem]" @click="onlineServiceDialog">联系客服</span>
			</span>
		</div>
		<div class="ssl-pay-info">
			<div class="ssl-pay-info-line">
				<span class="w-[5rem]">商品名称</span>
				<span>
					{{ `${productInfo?.productName + productInfo?.years}年${productInfo?.install ? '(包含部署服务)' : ''}` }}
				</span>
			</div>
			<div class="ssl-pay-info-line">
				<span class="w-[5rem]">下单时间</span>
				<span>{{ formatTime(orderInfo.addtime, 'yyyy-MM-dd HH:mm:ss') }}</span>
			</div>
		</div>
		<div class="mt-[16px] flex items-center justify-center">
			<span class="scan-icon"></span>
			<span>
				{{ tabActive === 'wxcode' ? '微信扫一扫支付' : '支付宝扫一扫支付' }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useSiteSSLStore } from '../useStore'
import { onlineServiceDialog } from '@/public/popup'
import { cutPayType, pollingMonitorPayStatus, showReSendBtn, pollingTimer, polling, tabActive } from './usePayController'

import { formatTime } from '@/utils'

const { productInfo, orderInfo, pollingPopup } = useSiteSSLStore()

const props = withDefaults(
	defineProps<{
		compData: any
	}>(),
	{
		compData: {
			oid: 0,
			wxcode: '',
			alicode: '',
			qq: '',
			orderInfo: {},
			productInfo: {},
		},
	}
)
const emits = defineEmits(['close'])
const tabsList = [
	{ name: '微信支付', label: 'wxcode' },
	{ name: '支付宝支付', label: 'alicode' },
]

// 二维码地址
const qrcodeUrl = computed(() => {
	return props.compData[tabActive.value]
})

onMounted(() => pollingMonitorPayStatus(new Date().getTime() / 1000))

onUnmounted(() => {
	pollingPopup.value = null
	polling.value = false
	clearTimeout(pollingTimer.value)
})
</script>

<style lang="css" scoped>
.ssl-pay-type {
	@apply flex justify-center flex-row bg-base w-[40rem] mx-[auto] mt-[12px];
}
.ssl-pay-tab-item {
	@apply w-[20rem] h-[3.2rem] flex items-center justify-center cursor-pointer rounded-default text-base;
}
.ssl-pay-tab-item span {
	@apply flex h-[2rem] items-center;
}
.ssl-pay-tab-item .wxcode {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAACp0lEQVRIS8WVTUhUURTH/+c9532MZhCEfYi4sBYVtYkgqKjGafowooUSUW0jgmBmIe6aoEWrYlokSbQog7Ao+0DSUQMrWhkWZGGBm8HIjQTy3rszzT3xRkdm5s3oMIZeeJtz/+f87j0f9xFWYNEKMLD6EG1Q21YllXMguZlBDSA0gtEI4HfmIxoHy6eaSA7/acFMqawUv0kfag1Vi0ChMAG1S6aUkAAjZs+I22hDslDvgfj79Rap4gYxti8Z3Cv4BFau2EfsD7lbeRDzrVmPlPwIQn0FgAUXUnHKOixeZg35kLjeA6C1QsAUGM9YpedOwBl265lsTo67sRYgRr8WJYWuVgAYBXGPBPWKZjHhj+snGOhgyUNOKBnNg5hx/R2AfTmQCQY2lCw84RWYH9tOshcnYVW/8e2SqtoO8Fk3BhO+Os1ixwLEP+LfyCI9lV8svg/mTknKdQJC83sWA91Q6JETcEZcW01fzfq0728E4A5PV0m52wqlRjPpMoaM8yT5QaFIlb662dDstJvKzOmYusVR8TOr8w/ol5nQDqChWJoJuGgFRVcGYsb1MICbRYS37KCIFNrNAe00iFx7bno97qzQBSfgPJyDDGitIHI7y7PslDBwHCKjG/LtQVoNg/hMOQ1CurrJOmD9mktX3GgA+AsBawudWfI10tR7SMkwCJ5bLQJ7bwfF/sLuugPgUjknLEfjHs7TwniBNaZf/wGgrpwgS2ie2EHRltXkTXz1oLZTMn1eFoSRgE/Zax+yE0Uh8/U5SOC7ALZWABsliagVEq9zfYs+9Yt1WwmwO3Bd7kyUmBev2RjU+4hxDMA0S+4khdYxoYkktoDQBGCMiMdY4htV0ffcF7dsiBnXGYQYpynmhJzJCtKW57L6//jl3qBkd/2vwLlx/gEqxfAaZBkG6QAAAABJRU5ErkJggg==);
}
.ssl-pay-tab-item .alicode {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAACkklEQVRIS72WS0hUURjH/9+Z0Yg2jY80aiHmVbA20aIIIiVy1wOCVi3ahM31AQUuWo0ugrKd4szUwl2bgrCgXaCREbRoU2njKCTYA9S5Uy3EnHv+cZU7zdwZrzMi3t055zvf73zvK9iFT3aBgaKQmodfD2b+rrWU+4BgZUViqbPhh/deASQUTY4L0FYuwJUnMGGZRnvu/TxIKDozJJCe7QL+gzhsmc297joLqY4lDpFqwRdAPZA9FxXxkxXRh5fDLd8cmSxk/3CyTQUw7ndR22hP9xgTVSOJfmwBcWV9IY5vvUDaGHAhFHW2SICzsSwZ4ij1KnIgjtUFgAAiuQlTEqSY2zTQljaN11WxZAREfymu3Tomgn7NHLfZEARAobYRDP7imvxOdzfOh0aSYyK4lAvdtiW5Sih4boWNy6HY1DFhxUevVSVC+AjEFES+a2BVgJOAtAp4CkA9BdessPG4KjozCEhfmRCmFFQHxf5JjRtK1AcgkFgyGxOOorrY7IEM2bFcs/okZO2tl4x+D0FdmRBcFUg9waG8i+QXgYxpqJdW15FJ96wmOn1CU10QURcJHHf3fd3lZJAqUiPZlkHcsbqMe01DyT2zvcZq7kM24hPoANR5beO+k+7Fs0vhKCh9IK8XFCMYtszmeG18zrC1ngGxQOFdZ88rWxufMhZvtiY3SWFOpszmM+u1AGkAuY/AC+q1N+nu1vnq+Nw5av3Ko3SZ5GAmyNE/nS1LRTrBxpand70VbT9QEvy82NU0u34em25QDDod+vamRUisiJJhoRp1EyXPkpK6sF+JF6QXTqe6jXd5EGexU/MEkGcps+mKy93xyQjgqYi+5c6SAkuyub/NGW9X6k++gS/H3eXK7sov0T/6gk8p0/94ewAAAABJRU5ErkJggg==);
}
.ssl-pay-tab-item.isActive {
	@apply bg-primary text-white;
}
.ssl-pay-tab-item.isActive .wxcode {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAACAUlEQVRIS8WVTYhOURjHf/+dDUppfKVZYIHYSCnKTholC5KwlZRiITszZWFFY0EmWTBKCCE7s/CR1Qjlo6FsRGZjN8Xmr2c6d9z3zrnv+877auap07nd5zn///N5jpgF0SxwMPckttcCB4HlwEqgN62fQKwPwF1gRNKvuqxkI7G9ADgJnADiu5V8AwaBi5L+VI2nkdjeBZwD1rVCzuhfA8clvSzrGkhsrwBeAbF3I7slPSwAqiS3gb0don8H7gH3JY1EPSVFzf51l+1+4EwHBKNAOPdA0pjtPuA08FRSYDaQPAe2lkjGgCVNCv8IuJXAJ2xvBE4BBxLGe0nrp0hsLwUi3LJcAy4DZ4EdSTEBDAM3JT2Lf7YXp04M76uySdLoZE1sHwKuZ4x6JI2nVIZ6WNKXws72seR9zFBOjkgaKkhiHs5nrC5IinlpENt7kvfl9OZIDku6UZBER0XxcjJP0u8U8eY0oPtrbKu/l0n6UZBEuO+AhZnDA8DVBD4tqiZkLyRtC/3UnNi+BBxt08N2zAZyLTwf+Az0tIPQwuaOpH2FTXXiNwBvuySJy3KLpNgnJXdBbgeuAGs6IIvp75f0uHy27qpv1m057gAfipnIKetIngA7gfE09YuAVcDqtL8BYn0EPpVv3JmQOD1Cg5K+dpC2hiNz/8Z3G0Ftd/0v4DLOXwwcoxqzt88zAAAAAElFTkSuQmCC);
}
.ssl-pay-tab-item.isActive .alicode {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAB8UlEQVRIS72WO2gVQRSGv7+ysPeBFjYiaBqxUAQxIWjnAwJWFmksLBQULKw0haCmS5pgYWejIBqwE4wYEVLYaIJRG8FXoYI2YiG/nMtsmOzd7N69kTvd7jlnvp3/PGbFAJYGwKASYnsrsKuPD1iW9KUc1wWx/QQY7gNQhMxJGsnjV0FsTwHn1gEoQqclnS8eViC2twEfGwATmf1Kg+92SZ/CJ4eERCFV3RqRNGf7KtAE6fg2QToOpTWRQQ5X2PNc9gzJ5ensmSBVhREnaw2pkm1Y0lPbsWFI1ihtk1xhj41y2SKHBv4CP4Ffkj7YfgCcKBF7kqupkh9KOml7CHhV4dwT5BawBHwG/gD7gd3AAWALcFrSHds3gUttIT+Ao8BX4AzwEohxsRwb2d6U7HcTbAHY3BZyKgVH9+frDRDaP5I0Xxhs7wOOAceBvVlArVxRhlU9UsRflnTd9gZJIePKSvkJFY4AN+qacU/SeLxCgrOSZmzvBN6mMXQt3pV9w0fSu7VKeF7SodQLO4CNwCzwLJXrKPC4tOl3IArgtqRvZeBas+s5MAksSnqfEh7AmNAXa2r7NzCdYJ1CKZ+klync1Du5/aCkF6sg6Wv/131yX9JY10myklzvzXgPuFDcJV0nyUD93vGvaxPfRuy2vgP5JfoHdyLWGkb9msUAAAAASUVORK5CYII=);
}
.ssl-pay-tab-item .pay-icon {
	@apply flex bg-no-repeat w-[2rem] h-[2rem] bg-contain bg-center mr-[8px];
}
.ssl-pay-info {
	@apply w-[40rem] mx-[auto] py-[16px] px-[8px];
	border-top: 1px solid #ebeef5;
	border-bottom: 1px solid #ebeef5;
}
.ssl-pay-info .ssl-pay-info-line {
	@apply flex justify-between;
}
.ssl-pay-info .ssl-pay-info-line:first-child {
	@apply mb-[4px];
}
.scan-icon {
	@apply flex w-[2rem] h-[2rem] bg-no-repeat mr-[8px];
	background-size: 2rem;
	background-position: 0px 2px;
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADMElEQVR4Xu1abU7bQBB9YxupUo3qcoHSE5QI+N1wg9yg9AQNJ6A9AekNwg1yA+jvtEo4QeEC1AgjVYq9g9bUNA0f3vFqqVE2v9/OvHnzdrO7XsKS/2jJ64cXwDtgyRXwU8DGAMkECTh+VxuD8rO08/u0FjcHSCYv1sHRm9oxlJ2kHaS1uAcAjRygCw/yeB9EfZPEDKQczjqmIujig2Llp0nsEsM8UFH2pYkQYgF08ZTHR0S0YUwQgCL1Md28GpqMWRvHn0G0b4KtMMw85SjbkYogFmDtezwA6JOEnMaqcPbWmQNuyfDX863MyJXVEJEApfWL1V+3qgMXBB4qxuhRQaL81LT4Kk65BuTR+mNxA0KPQbsEvKpwKrx8LXGBTIBx3A2Ijv6SkisudU4dftGRinkn3c6O68Y1c8CCANJkpqQkuMSSk5UDvABCu0k6a4r1DvBT4N+FWTot/RpgOtc0zna+SXKZYm05eQeYKl06YO6QwsAFh7MN6Q5Pks8Eu3hwkmy5dXyRA25FyKNdFeXD/138/LY5aMhJLIBJV54TxgvwnLrlgqvYAWvj+IAJossQF8Tvi0mM6fl2tifJJxJg8T9XkuipsE+6E3yqoiR5nAqgiegLCAb1CKi/sZUwt8QycEbgkdMrMUuOrRwuWgNaWYElKS+AVMDytrYI3yMsvrVpK9yUk8gBC4ch0dceqdCmeM2JipUJAYke4/QwZHv2Ni1KgrPlJHOA5f2bpDBTrBfAsineAaZWKy9DLNWW5DLF2nLyDjBV2jvAT4G7awCwbJ/H7z6QSIl4oAiPf4939EgqYHSZqV/tAm92gg4fSNzcB6zqdz4fJGtHk0dS89tbQa7D863LXQG+yXcBJFTExwSqfx43x0SR2ks3rwYm5JIfL/sBBwcm2ArD4BMOs67keYweK/obrJL9eSukizF2guSQIn4mBxyq8LIvLb6xAPNCII83AqD7ULdUwCmCYiQ9OpfHbhX2AkXlKe++nwKOEWXTJoVX8Ro5QGLNtmO9AG3vkGt+3gGuFW57fO+AtnfINT/vANcKtz2+d0DbO+San3eAa4XbHt87oO0dcs1v6R1wDSbCMF8UwqNRAAAAAElFTkSuQmCC);
}
</style>
