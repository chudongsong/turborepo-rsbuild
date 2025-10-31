<template>
	<div v-bt-loading="loading" v-bt-loading:title="'正在获取商业证书信息，请稍后...'">
		<div class="px-[3rem] py-[2rem] min-h-[62rem]">
			<el-alert type="error" :closable="false">
				<template #title>
					<span class="text-small">
						<i calss="svgtofont-el-warning-outline text-small"></i>
						<span> 禁止含有诈骗、赌博、色情、木马、病毒等违法违规业务信息的站点申请SSL证书，如有违反，撤销申请，停用账号。 </span>
					</span>
				</template>
			</el-alert>
			<div class="ssl-bus-pay-form">
				<div class="ssl-line">
					<div class="ssl-label">域名数量</div>
					<div class="ssl-content">
						<div class="ssl-box mb-[4px]">
							<div class="ssl-number-select">
								<div class="del-number" :class="{ 'is-disable': busCertBuyInfo.num === 1 }" @click="certDomainNumHandle(-1)" />
								<input type="number" class="input-number" min="1" max="99" v-model="busCertBuyInfo.num" @input="certDomainNumHandle" />
								<div class="add-number" :class="{ 'is-disable': busCertBuyInfo.num === 99 }" @click="certDomainNumHandle(1)" />
							</div>
							<div class="ssl-service">
								<CustomerPopover :placement="'right'">
									<div class="flex items-center">
										<i class="mx-[4px] text-1.6rem svgtofont-el-service text-primary" />
										<span>教我选择？</span>
									</div>
								</CustomerPopover>
							</div>
							<div class="ssl-tips" v-show="certSelectSslInfo.addPrice !== 0">默认包含{{ certYearNum }}个域名，超出数量每个域名{{ certSelectSslInfo.addPrice }}元/个/年</div>
						</div>
						<div class="ssl-tips">请选择当前证书包含的域名数量</div>
					</div>
				</div>
				<div class="ssl-line">
					<div class="ssl-label">证书分类</div>
					<div class="ssl-content">
						<div class="ssl-option-list w-full">
							<div
								v-for="item in busCertBuyInfo.certClass"
								class="ssl-option-item flex-1"
								:key="item.value"
								:class="{
									'is-active': item.value === busCertBuyInfo.certClassAcitve,
									'is-disabled': item.disable,
									'!hidden': item.hidden,
								}"
								@click="cutCertOption(item.value, 'certClass', item)">
								<div class="ssl-type-title">{{ item.name }}</div>
								<div class="ssl-type-tips">{{ item.title }}</div>
								<em class="ssl-subscript-tips" v-if="item.subscript">
									{{ item.subscript }}
								</em>
							</div>
						</div>
						<div class="ssl-tips-list mb-[4px]">
							<p class="mt-[4px]" v-for="(item, index) in certClassTips" :key="index">
								{{ item }}
							</p>
						</div>
					</div>
				</div>
				<div class="ssl-line">
					<div class="ssl-label">证书品牌</div>
					<div class="ssl-content">
						<div class="ssl-option-list">
							<div
								v-for="item in busCertBuyInfo.certBrand"
								class="ssl-option-item min-w-[9rem]"
								:key="item.value"
								:class="{
									'is-active': item.value === busCertBuyInfo.certBrandAcitve,
									'is-disabled': item.disable,
									'!hidden': item.hidden,
								}"
								@click="cutCertOption(item.value, 'certBrand', item)">
								<div class="ssl-type-title !font-normal border-none">
									{{ item.title }}
								</div>
								<em class="ssl-subscript-tips" v-if="item.subscript">
									{{ item.subscript }}
								</em>
							</div>
						</div>
						<div class="ssl-tips-list mb-[4px]">
							<p class="mt-[4px]" v-for="(item, index) in certBrandTips" :key="index">
								{{ item }}
							</p>
						</div>
					</div>
				</div>
				<div class="ssl-line">
					<div class="ssl-label">证书类型</div>
					<div class="ssl-content">
						<div class="ssl-option-list">
							<div
								v-for="item in busCertBuyInfo.certType"
								class="ssl-option-item min-w-[9rem]"
								:key="item.value"
								:class="{
									'is-active': item.value === busCertBuyInfo.certTypeAcitve,
									'is-disabled': item.disable,
									'!hidden': item.hidden,
								}"
								@click="cutCertOption(item.value, 'certType', item)">
								<div class="ssl-type-title !font-normal border-none">
									{{ item.title }}
								</div>
								<em class="ssl-subscript-tips" v-if="item.subscript">
									{{ item.subscript }}
								</em>
							</div>
						</div>
						<div class="ssl-tips-list mb-[4px]">
							<p class="mt-[4px]" v-for="(item, index) in certTypeTips" :key="index">
								{{ item }}
							</p>
						</div>
					</div>
				</div>
				<div class="ssl-line">
					<div class="ssl-label">购买年限</div>
					<div class="ssl-content">
						<div class="ssl-option-list">
							<div
								v-for="item in busCertBuyInfo.certLife"
								class="ssl-option-item min-w-[9rem]"
								:key="item.value"
								:class="{
									'is-active': item.value === busCertBuyInfo.certLifeAcitve,
								}"
								@click="cutCertOption(item.value, 'certLife', item)">
								<div class="ssl-type-title !font-normal border-none">
									{{ item.title }}
								</div>
								<em class="ssl-subscript-tips" v-if="item.subscript">
									{{ item.subscript }}
								</em>
							</div>
						</div>
						<div class="ssl-tips-list mb-[4px]">
							<p class="mt-[4px]" v-for="(item, index) in certLifeTips" :key="index">
								{{ item }}
							</p>
							<p class="mt-[4px]" v-show="busCertBuyInfo.certBrandAcitve === '宝塔证书' && busCertBuyInfo.certLifeAcitve > 1">部署成功后会生成自动续签任务 请不要变更DNS验证内容</p>
						</div>
					</div>
				</div>
				<div class="ssl-line">
					<div class="ssl-label">部署服务</div>
					<div class="ssl-content">
						<div class="ssl-option-list">
							<template v-for="item in busCertBuyInfo.certDeploy" :key="item.value">
								<div
									v-if="item.value !== 2 || busCertBuyInfo.certBrandAcitve === 'CFCA'"
									class="ssl-option-item min-w-[9rem]"
									:class="{
										'is-active': item.value === busCertBuyInfo.certDeployAcitve,
									}"
									@click="cutCertOption(item.value, 'certDeploy', item)">
									<div class="ssl-type-title !font-normal border-none">
										{{ item.title }}
									</div>
									<em class="ssl-subscript-tips" v-if="item.subscript">
										{{ item.subscript }}
									</em>
								</div>
							</template>
						</div>
						<div class="ssl-tips-list mb-[4px]">
							<p class="mt-[4px]" v-for="(item, index) in certDeployTips" :key="index">
								{{ item }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="ssl-info-view rounded-sm">
			<div class="flex justify-between w-full">
				<div class="flex flex-col">
					<div class="mb-[4px]">
						商品包含：
						<span class="mr-[1rem]">
							{{ `${certSelectSslInfo.productName} - 默认包含${certSelectSslInfo.number}个域名 ${certSelectSslInfo.yearsPrice}元/${certSelectSslInfo.years}年`
							}}{{ certSelectSslInfo.extraNumber > 0 ? `，额外超出${certSelectSslInfo.extraNumber}个域名${certSelectSslInfo.extraPrice.toFixed(2)}元/${certSelectSslInfo.years}年` : '' }}
						</span>
					</div>
					<div class="flex flex-col">
						<div class="flex h-[2.2rem] items-end mb-[4px]">
							<span>总计费用：</span>
							<div class="text-warning text-small">
								<span class="text-extraLarge font-bold">
									{{ certSelectSslInfo.totalPrice.toFixed(2) }}
								</span>
								<span>元/{{ certSelectSslInfo.years }}年</span>
								<span v-show="certSelectSslInfo.install">（包含部署服务）</span>
							</div>
						</div>
						<div class="pl-[6rem] text-small text-tertiary line-through">原价{{ (Number(certSelectSslInfo.originalPrice) * certSelectSslInfo.years).toFixed(2) }}元/{{ certSelectSslInfo.years }}年</div>
					</div>
				</div>
				<div class="flex items-center">
					<el-button type="primary" @click="paymentSslOrder(emit('close'))"> 立即购买 </el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { busCertBuyInfo, certBrandTips, certClassTips, certDeployTips, certDomainNumHandle, certLifeTips, certSelectSslInfo, certTypeTips, certYearNum, cutCertOption, getCertList, loading, paymentSslOrder } from './useCertController'
import CustomerPopover from './customer-popover.vue'

const emit = defineEmits(['close'])

onMounted(getCertList)
</script>

<style lang="css" scoped>
.ssl-bus-pay-form {
	@apply pt-[16px];
}
.ssl-line {
	@apply py-[.4rem] flex flex-row pb-[1.2rem];
}
.ssl-label {
	@apply w-[10rem] pr-[3.2rem] justify-end;
}
.ssl-label,
.ssl-box {
	@apply h-[3.8rem] flex items-center;
}
.ssl-content {
	@apply flex flex-col w-full;
}
.ssl-tips-list {
	@apply text-small text-tertiary mt-[2px] leading-[1.6rem];
}
.ssl-tips-list span {
	@apply block;
}
.ssl-tips {
	@apply text-small text-tertiary mt-[2px];
}
.ssl-info-view {
	height: 90px;
	background: var(--el-fill-color);
	display: flex;
	align-items: center;
	width: 100%;
	padding: 0 50px;
	justify-content: space-between;
}
.ssl-service {
	display: flex;
	flex-direction: row;
	align-items: center;
	line-height: 32px;
	background: var(--el-fill-color);
	margin: 3px 10px;
	padding: 0 10px;
	color: var(--el-color-primary);
	border-radius: 4px;
	cursor: pointer;
	font-size: var(--el-font-size-small);
}
.ssl-number-select .input-number {
	outline: none;
	width: 50px;
	height: 35px;
	vertical-align: middle;
	text-align: center;
	margin: 0 2px;
	border: 2px solid var(--el-fill-color);
	z-index: 99;
	padding: 0;
	text-align: center;
	transition: border-color 500ms;
	color: var(--el-color-text-primary);
	background: var(--el-color-primary-light-9);
	-moz-appearance: textfield;
}
.ssl-number-select .input-number::-webkit-inner-spin-button {
	-webkit-appearance: none;
}
.ssl-number-select .is-disable {
	background: var(--el-fill-color-dark) !important;
	border: 1px solid var(--el-color-border-darker) !important;
	cursor: no-drop !important;
}
.ssl-number-select .is-disable::after,
.ssl-number-select .is-disable::before {
	background-color: var(--el-fill-color-darker) !important;
}
.ssl-number-select .del-number,
.ssl-number-select .add-number {
	height: 35px;
	width: 35px;
	border: 1px solid var(--el-color-border-dark-tertiaryer);
	display: inline-block;
	vertical-align: middle;
	cursor: pointer;
	position: relative;
}
.ssl-number-select .del-number:hover,
.ssl-number-select .add-number:hover {
	border: 1px solid var(--el-color-primary);
	background-color: var(--el-color-primary);
	color: var(--el-color-white);
}
.ssl-number-select .del-number:hover::after,
.ssl-number-select .del-number:hover::before,
.ssl-number-select .add-number:hover::after,
.ssl-number-select .add-number:hover::before {
	color: var(--el-color-white);
}

.ssl-number-select .del-number::before,
.ssl-number-select .add-number::before,
.ssl-number-select .add-number::after {
	content: '';
	display: inline-block;
	position: absolute;
	left: 50%;
	top: 50%;
	background-color: var(--el-base-secondary);
}
.ssl-number-select .del-number::before,
.ssl-number-select .add-number::before {
	margin-left: -7px;
	margin-top: -1px;
	height: 2px;
	width: 14px;
}
.ssl-number-select .add-number::after {
	height: 14px;
	width: 2px;
	margin-top: -7px;
	margin-left: -1px;
}
.ssl-option-list {
	@apply flex flex-row h-[100%] flex-wrap gap-4 flex-1;
}
.ssl-option-item {
	border: 1px solid var(--el-color-border-dark-tertiaryer);
	text-align: center;
	cursor: pointer;
	position: relative;
	padding: 1px;
	position: relative;
	transition: border-color 500ms;
	border-radius: 2px;
	line-height: 32px;
	display: inline-block;
	font-size: 13px;
	/* margin-right: 8px; */
}
.ssl-option-item.is-disabled {
	background: var(--el-fill-color-dark);
	border: 1px solid var(--el-color-border-darker);
	color: var(--el-color-text-tertiary);
}
.ssl-option-item .ssl-subscript-tips {
	position: absolute;
	right: -1px;
	top: -10px;
	font-style: initial;
	background: var(--el-color-warning);
	border-radius: 0 9px;
	height: auto;
	line-height: 15px;
	padding: 2px 6px;
	color: #fff;
	font-size: var(--el-font-size-small);
}
.ssl-option-item.is-active {
	@apply border-primary border-[2px] bg-[var(--el-color-primary-light-9)] p-0;
}
.ssl-option-item.is-active .ssl-type-title,
.ssl-option-item.is-active .ssl-type-tips {
	@apply text-primary;
}
.ssl-option-item.is-active .ssl-type-tips {
	color: var(--el-color-text-tertiary);
}

.ssl-option-item.is-active::before,
.ssl-option-item.is-active::after {
	content: '';
	display: inline-block;
	position: absolute;
}
.ssl-option-item.is-active::before {
	width: 12px;
	height: 6px;
	border-bottom: 2px solid var(--el-color-white);
	border-left: 2px solid var(--el-color-white);
	right: 0px;
	bottom: 5px;
	z-index: 1;
	transform: rotate(-45deg);
}
.ssl-option-item.is-active::after {
	width: 0;
	height: 0;
	border-left: 25px solid transparent;
	border-bottom: 25px solid var(--el-color-primary);
	right: -2px;
	bottom: -1px;
}
.ssl-type-title,
.ssl-type-tips {
	@apply flex h-[3.2rem] items-center justify-center;
}
.ssl-type-title {
	@apply text-small font-bold border-b-[1px] border-lighter mx-[12px] p-[2px];
}
.ssl-type-tips {
	@apply text-small h-[3.6rem] text-grey-999 p-[4px];
}
</style>
