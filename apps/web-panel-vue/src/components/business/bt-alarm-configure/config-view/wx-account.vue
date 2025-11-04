<template>
	<div class="p-[16px]">
		<BtAlert :closable="false" :show-icon="true" type="warning">
			<template #title>
				<div>没有绑定微信公众号无法接收面板告警信息</div>
				<div>当前为体验版，限制每个宝塔账号发送频率100条/天</div>
			</template>
		</BtAlert>
		<div class="flex items-center justify-around mt-[1.6rem]">
			<div class="bind">
				<div class="title"><span class="steps">1</span>关注堡塔公众号</div>
				<div class="code">
					<img src="https://www.bt.cn/Public/img/bt_wx.jpg" alt="堡塔公众号" class="w-[160px]" />
				</div>
			</div>
			<div class="bind">
				<div class="title"><span class="steps">2</span>绑定微信账号</div>
				<div v-bt-loading="load" v-bt-loading:title="'正在获取二维码，请稍候...'" class="code p-[1rem]">
					<BtQrcode :value="code.bindCode" logo="/static/images/config/wx_logo.png" level="L" :size="140" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useDataHandle } from '@/hooks/tools'
import { getBindWxCode } from '@/api/global'
import type { RequestProps } from '@/hooks/tools/message/types'
import type { AlarmConfigProps } from '../types'

interface Props {
	compData: AlarmConfigProps
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {
		return {
			title: '', // 告警配置名称
			type: '', // 告警类型
			data: {}, // 告警配置数据
			callback: () => {}, // 回调函数
		}
	},
})

// 遮罩层
const load = ref(false)

// 绑定二维码
const code = reactive({ bindCode: 'www.bt.cn' })

/**
 * @description 获取绑定二维码
 */
const getBindCode = async () => {
	try {
		await useDataHandle({
			loading: load,
			request: getBindWxCode(),
			success: (res: RequestProps) => {
				if (!res.status) {
					code.bindCode = '二维码失效，请重新获取'
				} else {
					code.bindCode = res.data.res
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

onMounted(getBindCode)

defineExpose({
	onCancel: () => props.compData.callback(true),
})
</script>

<style lang="css" scoped>
.bind {
	@apply flex flex-col items-center;
}
.title {
	@apply flex items-center text-medium mb-[1rem];
}
.steps {
	@apply border rounded-circle border-primary text-primary w-[2.4rem] h-[2.4rem] flex justify-center items-center mr-[1rem];
}
.code {
	@apply w-[16rem] h-[16rem];
}
</style>
