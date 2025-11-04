<template>
	<div class="payment-modal-content">
		<!-- 订单信息 -->
		<div class="order-info mb-6">
			<div class="info-grid">
				<div class="info-item">
					<span class="label">域名：</span>
					<span class="value">{{ orderInfo.domain }}</span>
				</div>
				
				<!-- 购买模式 -->
				<template v-if="!isRenewal">
					<div class="info-item">
						<span class="label">首年价格：</span>
						<span class="value price">{{ orderInfo.firstYearPrice }}</span>
					</div>
					<div class="info-item">
						<span class="label">续费价格：</span>
						<span class="value price">{{ orderInfo.renewalPrice }}</span>
					</div>
					<div class="info-item">
						<span class="label">年限：</span>
						<el-select v-model="orderInfo.years" @change="handleYearsChange" :disabled="qrcodeLoading" size="small" style="width: 80px">
							<el-option label="1年" :value="1" />
							<el-option label="2年" :value="2" />
							<el-option label="3年" :value="3" />
							<el-option label="5年" :value="5" />
						</el-select>
					</div>
					<div class="info-item">
						<span class="label">总价：</span>
						<span class="value price">{{ formattedPrice }}</span>
					</div>
				</template>
				
				<!-- 续费模式 -->
				<template v-else>
					<div class="info-item">
						<span class="label">当前到期：</span>
						<span class="value">{{ orderInfo.currentExpiry }}</span>
					</div>
					<div class="info-item">
						<span class="label">续费年限：</span>
						<el-select v-model="orderInfo.years" :disabled="qrcodeLoading" @change="handleYearsChange" size="small" style="width: 80px">
							<el-option label="1年" :value="1" />
							<el-option label="2年" :value="2" />
							<el-option label="3年" :value="3" />
							<el-option label="5年" :value="5" />
						</el-select>
					</div>
					<div class="info-item">
						<span class="label">续费价格：</span>
						<span class="value price">{{ formattedPrice }}</span>
					</div>
					<div class="info-item">
						<span class="label">新到期时间：</span>
						<span class="value">{{ orderInfo.newExpiry }}</span>
					</div>
				</template>
			</div>
		</div>

		<!-- 支付方式 -->
		<div class="payment-method">
			<div class="payment-header">
				<div class="section-title">
					<bt-icon name="credit-card" class="mr-2 text-primary" />
					支付方式：
				</div>
				<div class="payment-options">
					<el-radio-group v-model="selectedPayment" :disabled="qrcodeLoading" @change="handlePaymentChange" class="payment-radio-group">
						<el-radio value="wechat" class="payment-radio">
							<span class="payment-label">微信支付</span>
						</el-radio>
						<el-radio value="alipay" class="payment-radio">
							<span class="payment-label">支付宝</span>
						</el-radio>
						<el-radio value="balance" class="payment-radio">
							<span class="payment-label">账户余额</span>
							<span class="balance-info">(余额:{{ accountBalance }})</span>
						</el-radio>
					</el-radio-group>
				</div>
			</div>

			<!-- 支付内容区域 -->
			<div class="payment-content mt-4"v-bt-loading="qrcodeLoading" >
                <!-- 余额支付 -->
                <div v-if="selectedPayment === 'balance'" class="balance-section">
                    <div class="balance-info">
						<div class="flex justify-center">
							<div class="balance-text">可用余额: {{ accountBalance }} / 需支付: {{ formattedPrice }}</div>
						</div>
                        <bt-button v-if="isRenewal || agreementChecked" type="primary" @click="handleConfirm" :loading="balancePaymentLoading">立即支付</bt-button>
                    </div>
                </div>

				<!-- 二维码支付 -->
				<div v-else v-bt-loading:title="'获取支付二维码中...'" class="qrcode-section">
					
					<!-- 二维码区域 -->
					<div v-show="isRenewal || agreementChecked" class="qrcode-container">
						<bt-qrcode v-show="!qrcodeLoading" :value="qrcodeUrl" :size="160" />
					</div>
					
					<div class="payment-tip">
						<span v-if="isRenewal || agreementChecked">请使用{{ selectedPayment === 'wechat' ? '微信' : '支付宝' }}扫码支付</span>
					</div>
				</div>
				<div v-if="!isRenewal && !qrcodeLoading" class="agreement-section my-24px">
					<el-checkbox v-model="agreementChecked" class="agreement-checkbox" @change="showAgreement">
						我已阅读并同意<a href="https://www.bt.cn/new/agreement_domain_register.html" target="_blank" class="agreement-link">《宝塔域名注册协议》</a>
					</el-checkbox>
					<span v-if="!isRenewal && !agreementChecked" class="agreement-tip">请先同意协议条款</span>
				</div>
			</div>
		</div>

	</div>
</template>

<script setup lang="tsx">
import BtIcon from '@/components/base/bt-icon'
import BtQrcode from '@/components/extension/bt-qrcode'
import { accountBalance, getAccountBalance, createRenewOrder, createPurchaseOrder, qrcodeLoading, cancelOrder, orderId, orderNo, handlePaymentChange, selectedPayment, orderInfo, isRenewal, qrcodeUrl, generateQrcode, handleConfirm, balancePaymentLoading, dialogInstance, stopPolling, isPaymentSuccess, handleYearsChange, paymentQrcodes, agreementChecked, showAgreement } from './useController'

// Props
interface Props {
	compData?: {
		domain?: string
		firstYearPrice?: string
		renewalPrice?: string
		years?: number
		accountBalance?: string
		// 续费相关字段
		currentExpiry?: string
		newExpiry?: string
		// 类型：'purchase' | 'renewal'
		type?: 'purchase' | 'renewal'
		// 购买相关字段
		suffix?: string
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		domain: '',
		firstYearPrice: '¥0.00',
		renewalPrice: '¥0.00',
		years: 1,
		accountBalance: '¥0.00',
		currentExpiry: '',
		newExpiry: '',
		type: 'purchase'
	})
})
// 初始化订单信息
orderInfo.value = {
	domain: props.compData?.domain || '',
	firstYearPrice: props.compData?.firstYearPrice || '¥0.00',
	renewalPrice: props.compData?.renewalPrice || '¥0.00',
	totalPrice: '',
	years: props.compData?.years || 1,
	currentExpiry: props.compData?.currentExpiry || '',
	newExpiry: props.compData?.newExpiry || '',
	suffix: props.compData?.suffix || '',
	type: props.compData?.type || 'purchase',
	accountBalance: props.compData?.accountBalance || accountBalance.value
}

// 格式化价格显示
const formattedPrice = computed(() => {
	const priceStr = String(orderInfo.value.totalPrice)
	if (!priceStr) {
		return '...'
	}
	const priceNum = parseFloat(priceStr.replace(/[¥,]/g, ''))
	
	if (isNaN(priceNum)) {
		return '...'
	}
	return `¥${priceNum.toFixed(2)}`
})


// 暴露方法给父组件
defineExpose({
	handleConfirm,
	selectedPayment,
	orderInfo,
	orderNo,
	balancePaymentLoading,
	dialogInstance,
	handleYearsChange
})

// 初始化
onMounted(async () => {
    isPaymentSuccess.value = false // 重置支付成功标志
    qrcodeLoading.value = true
	await getAccountBalance()
	await generateQrcode()
})

onUnmounted(() => {
    stopPolling()
    qrcodeUrl.value = ''
    selectedPayment.value = 'wechat'
    qrcodeLoading.value = false
    balancePaymentLoading.value = false
    orderId.value = ''
    orderNo.value = ''
    paymentQrcodes.value.wx = ''
    paymentQrcodes.value.ali = ''
    agreementChecked.value = false
})
</script>

<style lang="scss" scoped>
.payment-modal-content {
	padding: 20px;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16px;
}

.info-item {
	display: flex;
	align-items: center;
	
	.label {
        text-align: right;
		color: var(--el-text-color-secondary);
		font-size: 14px;
        width: 90px;
		flex-shrink: 0;
	}
	
	.value {
		color: var(--el-text-color-primary);
		font-size: 14px;
		font-weight: 500;
		word-break: break-all;
		overflow-wrap: break-word;
		
		&.price {
			color: #ff6b35;
			font-weight: 600;
		}
	}
}

.payment-method {
	.payment-header {
		display: flex;
		align-items: center;
		
		.section-title {
			display: flex;
			align-items: center;
			justify-content: right;
			font-size: 14px;
			font-weight: 500;
			color: var(--el-text-color-secondary);
			white-space: nowrap;
			width: 90px;
			flex-shrink: 0;
		}
	}
	
	.payment-options {
		.payment-radio-group {
			display: flex;
			flex-wrap: nowrap;
			.payment-radio {
				height: 40px;
				line-height: 40px;
				margin-right: 12px;
				transition: all 0.3s ease;
				
				&.is-checked {
					:deep(.el-radio__label) {
						color: var(--el-text-color-primary);
					}
				}
				
				:deep(.el-radio__input) {
					margin-right: 8px;
				}
				
				:deep(.el-radio__label) {
					font-size: 14px;
					color: var(--el-text-color-primary);
					padding-left: 0;
				}
			}
			
			.payment-label {
				font-size: 14px;
				color: var(--el-text-color-primary);
				margin-right: 8px;
			}
			
			.balance-info {
				font-size: 12px;
				color: var(--el-text-color-regular);
			}
		}
	}
}

.payment-content {
	min-height: 160px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
}

.qrcode-section {
	text-align: center;
	width: 100%;
}
.agreement-section {
	display: flex;
	flex-direction: column;
	.agreement-checkbox {
		:deep(.el-checkbox__label) {
			font-size: 14px;
			color: var(--el-text-color-primary);
		}
	}
	
	.agreement-link {
		color: var(--el-color-primary);
		text-decoration: underline;
		margin: 0 2px;
		
		&:hover {
			color: var(--el-color-primary-light-3);
		}
	}
	.agreement-tip {
		text-align: center;
		color: var(--el-color-warning);
	}
}

.qrcode-container {
	display: flex;
	justify-content: center;
	min-height: 160px;
	min-width: 160px;
	margin-bottom: 4px;
}
.balance-section {
	width: 100%;
	
	.balance-info {
		text-align: center;
		
		.balance-text {
			color: var(--el-color-primary);
			font-weight: 500;
            margin-bottom: 12px;
			padding: 4px 12px;
			font-size: 14px;
			border-radius: var(--el-border-radius-base);
			background-color: var(--el-color-primary-light-9);
		}
	}
}

</style>
