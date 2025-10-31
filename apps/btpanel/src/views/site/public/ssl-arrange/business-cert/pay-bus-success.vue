<template>
	<div class="px-[3rem] py-[2rem]">
		<el-alert type="error" :closable="false">
			<template #title>
				<span class="text-small">
					<i calss="svgtofont-el-warning-outline text-small"></i>
					<span> 禁止含有诈骗、赌博、色情、木马、病毒等违法违规业务信息的站点申请SSL证书，如有违反，撤销申请，停用账号。 </span>
				</span>
			</template>
		</el-alert>
		<el-col>
			<el-result icon="success" title="支付成功">
				<template #icon>
					<i class="svgtofont-el-circle-check text-[6rem] text-green-500 !text-primary"></i>
				</template>
				<template #extra>
					<div class="ssl-pay-info">
						<div class="ssl-pay-info-line">
							<span class="w-[5rem]">商品名称</span>
							<span>
								{{ `${productInfo.productName + productInfo.years}年${productInfo.install ? '(包含部署服务)' : ''}` }}
							</span>
						</div>
						<div class="ssl-pay-info-line">
							<span class="w-[5rem]">商品价格</span>
							<span>￥ {{ productInfo.totalPrice.toFixed(2) }}</span>
						</div>
						<div class="ssl-pay-info-line">
							<span class="w-[5rem]">下单时间</span>
							<span>
								{{ formatTime(orderInfo.addtime, 'yyyy-MM-dd hh:mm:ss') }}
							</span>
						</div>
					</div>
					<div class="mt-[3rem]">
						<el-button @click="onlineServiceDialog()">人工服务</el-button>
						<el-button @click="perfectCertificateData" type="primary">完善证书资料</el-button>
						<el-button @click="returnList">返回列表</el-button>
					</div>
					<bt-help :options="busSslHelp" class="mt-[40px] text-left" />
				</template>
			</el-result>
		</el-col>
	</div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/date'
import { perfectCertificateData } from './usePayController'
import { onlineServiceDialog } from '@/public'

const props = withDefaults(
	defineProps<{
		compData: any
	}>(),
	{
		compData: {
			orderInfo: {},
			productInfo: {},
		},
	}
)
const emits = defineEmits(['close'])
const productInfo = ref(props.compData.productInfo)
const orderInfo = ref(props.compData.orderInfo)

const busSslHelp = ref([{ content: '支付成功后请点击“完善证书资料”继续申请证书。' }, { content: '如果已购买人工服务，请点击“人工服务”咨询帮助。' }])

/**
 * @description 返回列表
 */
const returnList = () => {
	emits('close')
}
</script>

<style lang="css" scoped>
.ssl-pay-info {
	@apply w-[40rem] mx-[auto] py-[20px] px-[8px];
	border-top: 1px solid #ebeef5;
	border-bottom: 1px solid #ebeef5;
}
.ssl-pay-info-line {
	@apply flex justify-between mb-[8px];
}
.ssl-pay-info-line:last-child {
	@apply mb-0;
}
</style>
