<template>
	<div class="" v-bt-loading="loading" v-bt-loading:title="'正在获取商业证书信息，请稍后...'">
		<div class="px-[3rem] py-[2rem] min-h-[62rem]">
			<el-alert type="error" :closable="false">
				<template #title>
					<span class="text-small flex items-center">
						<span class="svgtofont-hint-confirm-icon !text-extraLarge"></span>
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
								<div class="del-number" :class="{ 'is-disable': busCertBuyInfo.num === 1 }" @click="cretDomianNumHandle(-1)" />
								<input type="number" class="input-number" min="1" max="99" v-model="busCertBuyInfo.num" @input="cretDomianNumHandle" />
								<div class="add-number" :class="{ 'is-disable': busCertBuyInfo.num === 99 }" @click="cretDomianNumHandle(1)" />
							</div>
							<div class="ssl-service">
								<CustomerPopover :placement="'right'">
									<div class="flex items-center">
										<bt-image :src="`../icons/service-icon.svg`" class="mx-[.4rem] w-1.6rem h-1.6rem" />
										<span class="ml5">教我选择？</span>
									</div>
								</CustomerPopover>
								<!-- <bt-customer-popover :placement="'right'">
									<div class="flex items-center">
										<bt-image :src="`../icons/service-icon.svg`" class="mx-[.4rem] w-1.6rem h-1.6rem" />
										<span class="ml5">教我选择？</span>
									</div>
								</bt-customer-popover> -->
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
								<em class="ssl-subscript-tips" v-if="item.subscript">{{ item.subscript }}</em>
							</div>
						</div>
						<div class="ssl-tips-list mb-[.4rem]">
							<p class="mt-[.4rem]" v-for="item in certClassTips">{{ item }}</p>
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
								<em class="ssl-subscript-tips" v-if="item.subscript">{{ item.subscript }}</em>
							</div>
						</div>
						<div class="ssl-tips-list mb-[.4rem]">
							<p class="mt-[.4rem]" v-for="item in certBrandTips">{{ item }}</p>
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
								<em class="ssl-subscript-tips" v-if="item.subscript">{{ item.subscript }}</em>
							</div>
						</div>
						<div class="ssl-tips-list mb-[.4rem]">
							<p class="mt-[.4rem]" v-for="item in certTypeTips">{{ item }}</p>
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
								<em class="ssl-subscript-tips" v-if="item.subscript">{{ item.subscript }}</em>
							</div>
						</div>
						<div class="ssl-tips-list mb-[.4rem]">
							<p class="mt-[.4rem]" v-for="item in certLifeTips">{{ item }}</p>

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
									<em class="ssl-subscript-tips" v-if="item.subscript">{{ item.subscript }}</em>
								</div>
							</template>
						</div>
						<div class="ssl-tips-list mb-[.4rem]">
							<p class="mt-[.4rem]" v-for="item in certDeployTips">
								{{ item }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="ssl-info-view rounded-small">
			<div class="flex justify-between w-full">
				<div class="flex flex-col">
					<div class="mb-[4px]">
						商品包含：<span class="mr-[1rem]"
							>{{ `${certSelectSslInfo.productName} - 默认包含${certSelectSslInfo.number}个域名 ${certSelectSslInfo.yearsPrice}元/${certSelectSslInfo.years}年`
							}}{{ certSelectSslInfo.extraNumber > 0 ? `，额外超出${certSelectSslInfo.extraNumber}个域名${certSelectSslInfo.extraPrice.toFixed(2)}元/${certSelectSslInfo.years}年` : '' }}</span
						>
					</div>
					<div class="flex flex-col">
						<div class="flex h-[2.2rem] items-end mb-[4px]">
							<span>总计费用：</span>
							<div class="text-warning text-small">
								<span class="text-extraLarge font-bold">{{ certSelectSslInfo.totalPrice.toFixed(2) }}</span>
								<span>元/{{ certSelectSslInfo.years }}年</span>
								<span v-show="certSelectSslInfo.install">（包含部署服务）</span>
							</div>
						</div>
						<div class="pl-[6rem] text-small text-tertiary line-through">原价{{ (Number(certSelectSslInfo.originalPrice) * certSelectSslInfo.years).toFixed(2) }}元/{{ certSelectSslInfo.years }}年</div>
					</div>
				</div>
				<div class="flex items-center">
					<el-button size="large" type="primary" @click="paymentSslOrder">立即购买</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { applyCertOrderPay, getBusSslProductList } from '@api/site'
import { useMessage } from '@/hooks/tools'
import { useSiteSSLStore } from '@site/public/ssl-arrange/useStore'
import { useDataHandle } from '@hooks/tools/data'
import { useDialog } from '@hooks/tools/dialog'
import CustomerPopover from '@site/public/ssl-arrange/business-cert/customer-popover.vue'

const Message = useMessage()
const { sslApplicationInfo, productInfo, orderInfo } = useSiteSSLStore()

interface selectItem {
	name: string
	title: string
	value: string | number
	tips: string[]
	disable?: boolean
	subscript?: string
}
type BusCertBuyInfoValue = {
	[key: string]: any
	// 其他属性
}
const emit = defineEmits(['close'])
const loading = ref(false) // 加载状态
const certYearNum = ref<number>(0) // 默认包含的域名数量

const certTypeConfig: BusCertBuyInfoValue = {
	single: ['仅支持绑定一个二级域名或者子域名，例如 bt.com、cloud.bt.com、dnspod.cloud.bt.com的其中之一 。', '如需要绑定同级的所有子域名，例如*.bt.com，请购买泛域名证书。'],
	wildcard: ['带通配符的域名，例如：*.bt.com、*.cloud.bt.com均为泛域名，包含同一级的全部子域名。', '注意泛域名不支持跨级，例如*.bt.com 不包含 *.cloud.bt.com的支持'],
}

const certDeployConfig = {
	0: [],
	1: ['宝塔提供9:00 - 24:00的人工部署证书部署服务，帮助客户排查部署证书部署生效问题，快速上线'],
	2: ['宝塔提供9:00 - 24:00的人工部署国密算法证书部署服务，帮助客户排查部署证书部署生效问题，快速上线'],
}

// 商业证书-模板信息
const busCertBuyInfo = ref<BusCertBuyInfoValue>({
	num: 1,
	// 证书分类
	certClassAcitve: 'OV',
	certClass: [
		{ name: 'OV证书', title: '推荐企业使用', value: 'OV', tips: [], data: [] },
		{
			name: 'DV证书',
			title: '推荐个人，测试使用',
			value: 'DV',
			subscript: '热销',
			tips: [],
		},
		{
			name: 'EV证书',
			title: '推荐大型政企使用，高安全性',
			value: 'EV',
			tips: [],
		},
	] as selectItem[],

	// 证书品牌
	certBrandAcitve: '',
	certBrand: [
		{ name: '宝塔证书', title: '宝塔证书', value: '宝塔证书', tips: [] },
		{ name: 'Positive', title: 'Positive', value: 'Positive', tips: [] },
		{ name: '锐安信', title: '锐安信', value: '锐安信', tips: [] },
		{ name: 'CFCA', title: 'CFCA', value: 'CFCA', tips: [] },
		{ name: 'Digicert', title: 'Digicert', value: 'Digicert', tips: [] },
		{ name: 'GeoTrust', title: 'GeoTrust', value: 'GeoTrust', tips: [] },
		{ name: 'Sectigo', title: 'Sectigo', value: 'Sectigo', tips: [] },
		{ name: '亚洲诚信', title: '亚洲诚信', value: '亚洲诚信', tips: [] },
	] as selectItem[],

	// 证书类型
	certTypeAcitve: 'single',
	certType: [
		{ name: 'single', title: '单域名', value: 'single', tips: [] },
		{ name: 'multiple', title: '多域名', value: 'multiple', tips: [] },
		{ name: 'wildcard', title: '泛域名', value: 'wildcard', tips: [] },
		{ name: 'ip', title: 'IP证书', value: 'ip', tips: [] },
	] as selectItem[],

	certLifeAcitve: 1,
	certLife: [
		{ name: '1年', title: '1年', value: 1, tips: [] },
		{ name: '2年', title: '2年', value: 2, tips: [] },
		{ name: '3年', title: '3年', value: 3, tips: [] },
		{ name: '4年', title: '4年', value: 4, tips: [] },
		{ name: '5年', title: '5年', value: 5, tips: [] },
	] as selectItem[],

	certDeployAcitve: 1,
	certDeploy: [
		{ name: '不需要', title: '不需要', value: 0, tips: [] },
		{ name: '部署服务', title: '部署服务', value: 1, tips: [] },
		{ name: '部署服务（国密）', title: '部署服务（国密）', value: 2, tips: [] },
	] as selectItem[],
})
// 推荐品牌
const certRecomBrand = ref<BusCertBuyInfoValue>({})

// 商业证书-表单配置
const certSelectSslInfo = ref({
	addPrice: 0, // 额外域名价格/年
	productName: '', // 产品名称
	price: 0, // 价格,仅证书价格
	totalPrice: 0, // 总价格
	originalPrice: 0, // 原价
	deploymentPrice: 0, // 部署服务价格
	pid: 0, // 产品id
	years: 1, // 证书年限
	yearsPrice: 0, // 证书年限价格
	number: 1, // 证书数量
	extraNumber: 0, // 额外域名数量
	extraPrice: 0, // 额外域名价格
	install: 1, // 是否需要部署 0不需要 1需要
})

const payOrderInfo = ref({
	oid: 0,
	wxcode: '',
	alicode: '',
	qq: '',
	orderInfo: {},
}) // 支付订单信息

const certBusSslList: BusCertBuyInfoValue = {
	defalutList: [],
	domianNumList: [],
	classList: [],
	brandList: [],
	typeList: [],
}
// 证书类型提示
const certClassTips = computed((): string[] => {
	const list = busCertBuyInfo.value.certClass.filter((item: any) => item.value === busCertBuyInfo.value.certClassAcitve)
	return list && list.length > 0 ? list[0].tips : []
})

// 证书品牌提示
const certBrandTips = computed((): string[] => {
	const list = busCertBuyInfo.value.certBrand.filter((item: any) => item.value === busCertBuyInfo.value.certBrandAcitve)
	return list && list.length > 0 ? list[0].tips : []
})

// 证书类型提示
const certTypeTips = computed((): string[] => {
	const list = busCertBuyInfo.value.certType.filter((item: any) => item.value === busCertBuyInfo.value.certTypeAcitve)

	return list && list.length > 0 ? list[0].tips : []
})

// 证书年限提示
const certLifeTips = computed((): string[] => {
	const list = busCertBuyInfo.value.certLife.filter((item: any) => item.value === parseInt(busCertBuyInfo.value.certLifeAcitve))
	return list && list.length > 0 ? list[0].tips : []
})

// 证书部署提示
const certDeployTips = computed((): string[] => {
	const list = busCertBuyInfo.value.certDeploy.filter((item: any) => item.value === parseInt(busCertBuyInfo.value.certDeployAcitve))
	return list && list.length > 0 ? list[0].tips : []
})

/**
 * @description 获取商业证书列表
 */
const getBusSslList = async () => {
	let load: any
	try {
		loading.value = true
		// 获取商业证书列表
		const {
			data: { info, data, administrator },
		} = await getBusSslProductList()
		// 推荐品牌
		certRecomBrand.value = info.recommend
		// 初始化证书配置
		initCertConfig()
		// 创建证书提示结构
		createCretTipsStructure(info)
		// 创建商业证书品牌列表
		createCretMateSslList(data)
		// 商业证书配置
		cretSslHandle()
		// 证书验证
		sslApplicationInfo.value = {
			...administrator,
		}
	} catch (error) {
		console.log(error)
	} finally {
		loading.value = false
	}
}

/**
 * @description 创建证书提示结构
 * @param {Object} info 证书提示信息
 */
const createCretTipsStructure = ({ type, brand, times }: AnyObject) => {
	// 证书分类的提示
	busCertBuyInfo.value.certClass = mergeListTips(busCertBuyInfo.value.certClass, type, (item: selectItem, tips: any) => {
		return tips[`${item.value}`.toLowerCase()]
	})
	certTypeConfig['multiple'] = certTypeConfig.single // 多域名证书与单域名证书提示一致
	busCertBuyInfo.value.certType = mergeListTips(busCertBuyInfo.value.certType, certTypeConfig)
	busCertBuyInfo.value.certDeploy = mergeListTips(busCertBuyInfo.value.certDeploy, certDeployConfig)
	busCertBuyInfo.value.certBrand = mergeListTips(busCertBuyInfo.value.certBrand, brand, (item: selectItem, tips: any) => {
		return tips[item.value !== 'Positive' ? `${item.value}`.toLowerCase() : 'Positive']
	})
	busCertBuyInfo.value.certLife = mergeListTips(busCertBuyInfo.value.certLife, times, (item: selectItem, tips: any) => {
		return tips[item.value + '_year']
	})
}

/**
 * @description 创建商业证书品牌列表
 */
const createCretMateSslList = (data: any[]) => {
	const list = [] as any
	data.forEach((item: any) => {
		const type = item.type.match(/(OV|DV|EV)/)?.[0]
		const isWildcard = item.code.indexOf('wildcard') !== -1 // 是否支持泛域名
		const isIp = item.code.indexOf('ip') !== -1 // 是否支持IP证书
		const isMulti = item.add_price > 0 // 是否支持多域名
		let certType = isWildcard ? 'wildcard' : isMulti ? 'multiple' : 'single'
		// Digicert品牌只支持单域名，可以购买多张。
		if (item.brand === 'Digicert') certType = isWildcard ? 'wildcard' : 'single'
		list.push({ ...item, ...{ type, certType, isMulti, isIp } })
	})
	certBusSslList.defalutList = list
}

/**
 * @description 获取商业证书配置
 * @param {Object} config 证书配置
 * @returns {Object} 证书配置
 */
const getBusCertConifg = (data: any = {}): AnyObject => {
	let { num, classify, brand, type, life, deploy } = data
	const busCertBuy = busCertBuyInfo.value
	if (!num) num = busCertBuy.num
	if (!classify) classify = busCertBuy.certClassAcitve
	if (!brand) brand = busCertBuy.certBrandAcitve
	if (!type) type = busCertBuy.certTypeAcitve
	if (!life) life = busCertBuy.certLifeAcitve
	if (!deploy) deploy = busCertBuy.certDeployAcitve
	return { num, classify, brand, type, life, deploy }
}

/**
 * @description 初始化证书配置
 */
const initCertConfig = () => {
	busCertBuyInfo.value.certClassAcitve = 'DV'
	busCertBuyInfo.value.certBrandAcitve = getRecomBrand()
	busCertBuyInfo.value.certTypeAcitve = 'single'
	busCertBuyInfo.value.certLifeAcitve = 1
	busCertBuyInfo.value.certDeployAcitve = 1
}

/**
 * @description 商业证书配置
 */
const cretSslHandle = () => {
	cretSslDataHandle(certBusSslList.defalutList) // 证书列表处理
	cretSslConfigHandle() // 商业证书视图调整
	calculateCretSslPrice() // 计算证书价格
}

/**
 * @description 获取推荐品牌
 */
const getRecomBrand = () => {
	return certRecomBrand.value[busCertBuyInfo.value.certClassAcitve?.toLowerCase()]
}

/**
 * @description 商业证书视图调整
 */
const cretSslConfigHandle = () => {
	const { domianNumList, classList, brandList, typeList } = certBusSslList

	// 证书分类
	busCertBuyInfo.value.certClass.forEach((item: any) => {
		let isDisable = domianNumList.some((items: any) => items.type === item.value)
		if (item.value == 'EV' && busCertBuyInfo.value.certTypeAcitve === 'wildcard') isDisable = false
		item.disable = !isDisable
	})

	// 证书品牌
	busCertBuyInfo.value.certBrand.forEach((item: any) => {
		const isHidden = !classList.some((items: any) => items.brand === item.value)
		item.hidden = isHidden
		item.subscript = item.value === getRecomBrand() ? '推荐' : ''
		// 品牌匹配为空时，将品牌设置为推荐品牌，如果推荐品牌也为空，则设置为第一个品牌
		if (item.value === busCertBuyInfo.value.certBrandAcitve && item.hidden) {
			busCertBuyInfo.value.certBrandAcitve = getRecomBrand()
			if (item.value === busCertBuyInfo.value.certBrandAcitve && item.hidden) {
				busCertBuyInfo.value.certBrandAcitve = certBusSslList?.classList?.[0]?.brand
			}
			const newList = certBusSslList?.classList?.filter((item: any) => {
				return item.brand === busCertBuyInfo.value.certBrandAcitve
			})
			if (newList.length > 0) {
				certBusSslList.brandList = newList
				certTypeHandle(newList)
			}
		}
	})

	// 证书类型
	busCertBuyInfo.value.certType.forEach((item: any) => {
		let isHidden = !brandList.some((items: any) => {
			if (items.isIp && item.value === 'ip') return true // IP证书只支持DV证书
			return items.certType === item.value
		})
		if (item.value === 'single' && busCertBuyInfo.value.num > 1) isHidden = true
		if (item.value === 'multiple' && busCertBuyInfo.value.num === 1) isHidden = true
		if (item.value === 'multiple' && busCertBuyInfo.value.num > 1) isHidden = false
		if (item.value === 'ip' && busCertBuyInfo.value.num > 1) isHidden = true
		item.hidden = isHidden
	})
	// 部署服务,非CFCA品牌不支持自动部署
	if (busCertBuyInfo.value.certBrandAcitve !== 'CFCA' && busCertBuyInfo.value.certDeployAcitve === 2) {
		busCertBuyInfo.value.certDeployAcitve = 1
	}
}

/**
 * @description 证书域名处理
 */
const cretSslDataHandle = (list: any[]) => {
	let { num } = getBusCertConifg()
	const newList = list.filter((item: any) => {
		return num > 1 ? item.isMulti : true
	})
	if (newList.length > 0) {
		certBusSslList.domianNumList = newList
		certClassHandle(newList)
	}
}

/**
 * @description 证书分类处理
 */
const certClassHandle = (list: any[]) => {
	const { classify } = getBusCertConifg()
	const newList = list.filter((item: any) => {
		return item.type === classify
	})
	if (newList.length > 0) {
		certBusSslList.classList = newList
		certBrandHandle(newList)
	} else {
		console.log('证书分类', list)
	}
}

/**
 * @description 证书品牌处理
 */
const certBrandHandle = (list: any[]) => {
	const { brand } = getBusCertConifg()
	const newList = list.filter((item: any) => {
		return item.brand === brand
	})
	if (newList.length > 0) {
		certBusSslList.brandList = newList
		certTypeHandle(newList)
	}
}

/**
 * @description 证书类型处理
 */
const certTypeHandle = (list: any[]) => {
	const { type } = getBusCertConifg()
	if (list.length === 1) busCertBuyInfo.value.certTypeAcitve = list[0].certType // 单个证书类型时，直接设置为当前证书类型
	const newList = list.filter((item: any) => {
		// 兼容单域名支持多购买的证书。
		const isContainMulti = busCertBuyInfo.value.certTypeAcitve === 'multiple' && item.certType !== 'wildcard' && item.isMulti
		const isContainWildcard = busCertBuyInfo.value.certTypeAcitve === 'wildcard' && item.certType === 'wildcard' && item.isMulti
		const isContainIp = busCertBuyInfo.value.certTypeAcitve === 'ip' && item.isIp

		return item.certType === type || isContainMulti || isContainWildcard || isContainIp
	})
	if (newList.length > 0) {
		certBusSslList.typeList = newList
	}
}

/**
 * @description 证书域名数量
 */
const cretDomianNumHandle = (num: AnyObject | number = busCertBuyInfo.value.num) => {
	let newNum = num
	if (typeof num !== 'number') {
		num = parseInt(num.data)
		newNum = parseInt(busCertBuyInfo.value.num) || 1 // 域名数量，最小为1，禁止为0
	} else {
		newNum = parseInt(busCertBuyInfo.value.num + num) || 1 // 域名数量，最小为1，禁止为0
	}
	if (newNum && (newNum < 1 || newNum > 99)) {
		busCertBuyInfo.value.num = newNum < 1 ? 1 : 99
		return Message.error('域名数量范围为1-99')
	}
	busCertBuyInfo.value.num = newNum
	if (busCertBuyInfo.value.certTypeAcitve !== 'wildcard') {
		busCertBuyInfo.value.certTypeAcitve = busCertBuyInfo.value.num > 1 ? 'multiple' : 'single'
	}
	cretSslHandle()
}

/**
 * @description 切换证书的选项
 */
const cutCertOption = (name: string, type: string, item?: any) => {
	if (!item) item = busCertBuyInfo.value[type].filter((items: any) => items.value === name)
	if (item.disable) return
	if (`${type}Acitve` in busCertBuyInfo.value) busCertBuyInfo.value[`${type}Acitve`] = name
	cretSslHandle()
}

/**
 * @description 计算证书价格
 * @param {Array} list 证书列表
 * @param {Object} item 证书配置
 */
const calculateCretSslPrice = () => {
	const cretInfo = certBusSslList.typeList[0] || null // 证书信息
	certYearNum.value = cretInfo?.num || 0 // 默认包含的域名数量
	if (cretInfo) {
		const { num, life: years, deploy } = getBusCertConifg()
		const { price, other_price, add_price, pid, num: includeNum, install_price, install_price_v2 } = cretInfo

		const extraNumber = num - includeNum < 0 ? 0 : num - includeNum // 额外域名数量
		const deployPriceList = [0, install_price, install_price_v2]
		const deploymentPrice = deployPriceList[deploy] // 部署服务价格

		const extraPrice = add_price * extraNumber // 额外域名价格
		const totalPrice = (extraPrice + price) * years + deploymentPrice // 总价格
		const originalPrice = other_price + extraPrice + deploymentPrice // 原价
		certSelectSslInfo.value = {
			addPrice: add_price || 0,
			productName: cretInfo.title,
			price,
			totalPrice,
			originalPrice,
			deploymentPrice,
			pid,
			years,
			yearsPrice: price * years,
			number: includeNum,
			extraNumber,
			extraPrice,
			install: Number(deploy),
		}
	}
}

/**
 * @description 支付商业证书订单
 *
 */
const paymentSslOrder = async () => {
	try {
		const { pid, install, years, extraNumber } = certSelectSslInfo.value
		const params = {
			pdata: JSON.stringify({ pid, install, years, num: extraNumber }),
		}
		const { data: res, msg }: AnyObject = await useDataHandle({
			loading: '正在创建商业证书订单，请稍后...',
			request: applyCertOrderPay(params),
		})
		const { status } = res
		if (!status) return Message.error(msg)
		const { oid, wxcode, alicode, qq, order_info: orderInfo } = res.msg
		payOrderInfo.value = {
			oid,
			wxcode,
			alicode,
			qq,
			orderInfo,
		}
		busCertPayDialog({
			...payOrderInfo.value,
			productInfo: certSelectSslInfo.value,
		})
		emit('close')
	} catch (error) {
		console.log(error)
	} finally {
	}
}

/**
 * @description 合并列表提示
 */
const mergeListTips = (list: any[], tips: AnyObject, callback?: any) => {
	return list.map((item: any, index: number) => {
		const tipsItem = callback ? callback(item, tips) : tips[item.value]
		return {
			...item,
			tips: tipsItem,
		}
	})
}

/**
 * @description 商业证书支付弹窗
 * @param data
 * @returns
 */
const busCertPayDialog = (data: any) => {
	productInfo.value = data.productInfo
	orderInfo.value = data.orderInfo
	useDialog({
		title: '支付商业证书订单',
		area: [60],
		component: () => import('./pay-bus-ssl.vue'),
		compData: data,
	})
}

onMounted(() => {
	getBusSslList()
	// payBusSslPopup.value = true
})
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
	background: var(--el-color-success-light-9);
	margin: 3px 10px;
	padding: 0 10px;
	color: var(--el-color-primary);
	border-radius: var(--el-border-radius-base);
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
	border: 2px solid var(--el-color-primary);
	z-index: 99;
	padding: 0;
	text-align: center;
	transition: border-color 500ms;
	color: var(--el-color-primary);
	background: var(--el-color-success-light-9);
	-moz-appearance: textfield;
}
.ssl-number-select .input-number::-webkit-inner-spin-button {
	-webkit-appearance: none;
}
.ssl-number-select .is-disable {
	background: var(--el-fill-color-darker) !important;
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
	border: 1px solid var(--el-color-border-dark-tertiary);
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
	background-color: var(--el-color-white);
}
.ssl-number-select .del-number::before,
.ssl-number-select .add-number::before,
.ssl-number-select .add-number::after {
	content: '';
	display: inline-block;
	position: absolute;
	left: 50%;
	top: 50%;
	background-color: var(--el-color-text-secondary);
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
	@apply flex flex-row h-[100%];
}
.ssl-option-item {
	border: 1px solid var(--el-color-border-dark-tertiary);
	text-align: center;
	cursor: pointer;
	position: relative;
	padding: 1px;
	position: relative;
	transition: border-color 500ms;
	border-radius: var(--el-border-radius-small);
	line-height: 32px;
	display: inline-block;
	font-size: var(--el-font-size-base);
	margin-right: 8px;
}
.ssl-option-item.is-disabled {
	background: var(--el-fill-color-darker);
	border: 1px solid var(--el-color-border-darker);
	color: var(--el-base-tertiary);
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
	color: var(--el-color-white);
	font-size: var(--el-font-size-small);
}
.ssl-option-item.is-active {
	@apply border-primary border-[2px] bg-extraLight p-0;
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
	@apply text-base font-bold border-b-[1px] border-light mx-[12px] p-[2px];
}
.ssl-type-tips {
	@apply text-small h-[3.6rem] text-grey-999 p-[4px];
}
</style>
