<template>
	<div class="flex flex-col p-[2rem]">
		<div class="text-medium">扫码绑定（使用宝塔面板APP或Google身份验证器APP扫码）</div>
		<div class="flex justify-center py-[2rem] h-[19rem]">
			<bt-qrcode :value="qrcode" :size="150" />
		</div>
		<ul class="list-disc w-[50rem] pl-[1rem] text-secondary">
			<li>
				提示：请使用“ 宝塔面板APP或Google身份验证器APP ”绑定,各大软件商店均可下载该APP，支持安卓、IOS系统。
				<bt-link href="https://www.bt.cn/bbs/thread-47408-1-1.html" target="_blank"> 使用教程 </bt-link>
			</li>
			<li class="text-[red]">开启服务后，请立即使用“宝塔面板APP或Google身份验证器APP”绑定，以免出现无法登录的情况。</li>
			<li class="text-[red]">同一个IP验证成功后24小时内无需再次验证。</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
import { getQrcodeData, getTwoStepKey } from '@/api/config'
import { useDataHandle } from '@hooks/tools'

const qrcode = ref()

/**
 * @description: 获取二步验证密钥
 */
const getKeyEvent = async () => {
	try {
		await useDataHandle({
			loading: '正在获取密钥，请稍候...',
			request: getTwoStepKey(),
		})
		getQrcodeDataEvent()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 获取二步验证二维码
 */
const getQrcodeDataEvent = async () => {
	try {
		await useDataHandle({
			loading: '正在获取二维码，请稍候...',
			request: getQrcodeData({ act: 1 }),
			data: [String, qrcode],
		})
	} catch (error) {
		console.log('342')
	}
}

onMounted(getKeyEvent)
</script>
