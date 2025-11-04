<template>
	<div class="product-introduce">
		<div class="flex items-start">
			<bt-image v-if="data.imgSrc" :src="data.imgSrc" class="w-[7rem] mr-[1.4rem]"></bt-image>
			<div class="flex items-start flex-col">
				<p class="product-introduce-title">{{ data.title }}</p>
				<p class="product-introduce-ps">{{ data.ps }}</p>
				<div class="product-introduce-groupBtn">
					<el-button v-if="data.productSrc" type="default" @click="productPreview"> 产品预览 </el-button>
					<el-button v-if="data.isInstall" type="primary" @click="installSoftModel"> 立即安装 </el-button>
					<el-button v-else type="primary" @click="payClick"> 立即购买 </el-button>
				</div>
			</div>
		</div>
		<div v-if="data.source != 54" class="product-introduce-hr"></div>
		<ul class="product-introduce-ul">
			<li v-for="(item, index) in data.desc" :key="index">
				<span class="product-introduce-ul-icon"></span>
				<span>{{ item }}</span>
			</li>
		</ul>
		<div class="flex justify-center">
			<ul v-if="typeof data.tabImgs[tabIndex] != `string` ? true : false" class="product-introduce-tab">
				<li v-for="(item, index) in data.tabImgs" :key="index" class="whitespace-nowrap" :class="index === tabIndex ? 'on' : ''" @click="cutTab(index)">
					{{ item.title }}
				</li>
			</ul>
			<div class="max-h-[112rem] overflow-auto">
				<el-image :src="tabImg" class="flex-1"></el-image>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
// import { getPluginInfo } from '@api/global'
import { productPaymentDialog, pluginInstallDialog } from '@/public'

interface TabImgs {
	title: string
	imgSrc: string
}

interface DataProps {
	imgSrc?: string
	title: string
	ps: string
	source: number
	desc: Array<string>
	tabImgs: any | Array<TabImgs>
	isInstall?: boolean
	productSrc?: string
	pluginInfo?: AnyObject
}

interface Props {
	data: DataProps
}

const props = withDefaults(defineProps<Props>(), {
	data: () => {
		return {
			imgSrc: '',
			title: '',
			ps: '',
			source: 0,
			desc: [],
			tabImgs: [] || '',
			isInstall: false,
			productSrc: '',
			pluginInfo: {},
		}
	},
})

const tabIndex = ref<number>(0)
const tabImg = ref<string>('')

/**
 * @description 切换tabs切换组件
 */
const cutTab = (index: number) => {
	tabIndex.value = index
	tabImg.value = props.data.tabImgs[index].imgSrc
}

/**
 * @description 安装软件
 */
const installSoftModel = async (item: AnyObject) => {
	if (!props.data.pluginInfo) return
	const { name, type } = props.data.pluginInfo
	pluginInstallDialog({
		name,
		type: 'i',
		softData: {
			...props.data.pluginInfo,
			callBack: () => {
				window.location.reload()
			},
		},
	})
}

/**
 * @description 立即购买
 */
const payClick = () => {
	productPaymentDialog({
		sourceId: props.data.source,
	})
}

/**
 * @description 产品预览
 */
const productPreview = () => {
	window.open(props.data.productSrc, '_blank', 'noopener,noreferrer')
}

watchEffect(() => {
	tabImg.value = props.data.tabImgs[tabIndex.value] ? (typeof props.data.tabImgs[tabIndex.value] !== 'string' ? props.data.tabImgs[tabIndex.value].imgSrc : props.data.tabImgs) : ''
})
</script>

<style lang="css" scoped>
.product-introduce-title {
	@apply text-secondary font-bold mb-[1.2rem] text-subtitleLarge;
}

.product-introduce-ps {
	@apply text-secondary mb-[1.2rem] text-base leading-[2.4rem];
}

.product-introduce-groupBtn {
	@apply flex mt-[2rem] my-[.6rem];
}

.product-introduce-hr {
	@apply h-[0.1rem] border-[0.1rem] border-dashed border-extraLight my-[3.6rem];
}

.product-introduce-ul {
	@apply flex items-center justify-evenly text-secondary text-base mb-[5rem];
}

.product-introduce-ul li {
	@apply relative;
}

.product-introduce-ul-icon {
	@apply mr-[0.8rem];
}

.product-introduce-ul-icon::after {
	content: '';
	display: inline-block;
	width: 16px;
	height: 8px;
	border-left: 2px solid var(--el-color-primary);
	border-bottom: 2px solid var(--el-color-primary);
	transform: rotate(-45deg);
	position: absolute;
	left: -20px;
	top: 0;
}

.product-introduce-tab {
	@apply text-secondary text-base mr-[4rem] min-w-[13rem] border-r-[0.1rem] border-[var(--el-color-success-light-8)];
}

.product-introduce-tab > li {
	@apply cursor-pointer px-[2rem] leading-[4.6rem] text-base;
}

.product-introduce-tab > li.on {
	@apply border-r-[0.2rem] border-primary text-primary;
}
</style>
