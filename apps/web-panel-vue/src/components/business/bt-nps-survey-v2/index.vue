<template>
	<div class="nps-survey-box">
		<div class="nps-survey-banner">
			<span>
				<i></i> <span style="vertical-align: 4px">{{ moduleTile }}</span>
			</span>
		</div>
		<div class="px-[4rem] text-center !relative">
			<!-- 分数(可不展示) -->
			<el-rate v-if="!isNoRate" ref="rate" v-model="rateValue" class="mt-[8px] mb-[3rem]" :colors="['var(--el-color-danger)', 'var(--el-color-warning)', 'var(--el-color-primary)']" :texts="['很不满意', '不满意', '一般', '满意', '非常满意']" aria-label="Rate" size="large" />
			<!-- 回答部分 -->
			<span class="text-[red] absolute left-12" :class="symbolTips">*</span>
			<el-popover placement="top-start" width="440" popper-class="tips !bg-primary !text-white !text-small !p-12px !leading-[2rem]" trigger="click" :visible-arrow="true" :content="placeholder">
				<template #reference>
					<el-input ref="inputRef" v-model="questions" type="textarea" :rows="5" :placeholder="placeholder" @keydown.enter.stop></el-input>
				</template>
			</el-popover>
		</div>

		<!-- 用户标签 -->
		<div v-if="isCard" class="px-[4rem] mt-[2rem] vertical-top">
			<div class="my-[1rem]">
				<span class="text-base text-secondary align-top">您所属行业：</span>
				<div class="inline-block cardView">
					<!-- 鼠标经过时添加active -->
					<span v-for="(item, index) in socialTypeList" :key="index" class="inline-block text-base h-[1.7rem] cardTitle align-super" :class="{ active: item.checked }" @mouseover="changeCardType(item, index)">{{ item.text }}</span>
				</div>
				<div class="mt-[4px] ml-[7.6rem]">
					<template v-if="identityIndex == 5">
						<span><el-input v-model="otherCard" placeholder="您的行业是" class="!w-[36rem]" /></span>
					</template>
					<template v-else>
						<el-tag v-for="(item, index) in socialStatus[identityIndex]" :class="item.check ? 'active' : ''" size="small" :key="index" type="info" @click="changeCharacter(item, index)" effect="plain">{{ item.role }}</el-tag>
					</template>
				</div>
			</div>
		</div>

		<div v-if="payment.authType === 'ltd' && isShowPhone" class="px-[4rem] mt-[2rem]">
			<div class="mb-1rem">
				<span class="text-base text-secondary">是否愿意接受回访：</span>
				<bt-switch size="small" v-model="form.status"></bt-switch>
			</div>
			<el-form ref="formPhone" label-position="top" :model="form">
				<el-form-item v-show="form.status" label="" prop="phone">
					<span class="w-[36rem] ml-[7.6rem] inline-block"><el-input v-model="form.phone" placeholder="请留下手机号码或邮箱"></el-input></span>
				</el-form-item>
			</el-form>
		</div>
		<div class="mt-[2.4rem] text-base text-primary leading-[4.6rem] flex justify-center">我们特别重视您的需求反馈，我们会每周进行需求评审，希望能更好的帮到您</div>
		<div class="flex flex-col items-center p-[2rem] mt-[1.2rem]">
			<el-button class="w-[12.5rem] !py-12px !px-20px !h-auto" size="large" type="primary" @click="submit">提交</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { writeNpsQuestion } from '@api/global'
import { checkPhone } from '@utils/index'
import { useMessage } from '@hooks/tools'
import { npsThanksDialog } from '@/public'
import { useGlobalStore } from '@/store/global'

interface Props {
	compData?: any
}
const { payment } = useGlobalStore()

const Message = useMessage()
const emits = defineEmits(['close'])
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const {
	id, // 问题id
	type, //product_type
	name, // 模块名称(中文)
	softName, // 面板类型 panel、total、btwaf(默认panel)
	description, // 问题描述
	isNoRate, // 是否显示评分
	title, // 标题
	isCard, // 是否显示身份
	isShowPhone, // 是否展示回访
} = props.compData

const symbolTips = ref('top-0') // 必填标识
const questions = ref('') // 表单数据
const rateValue = ref(0)

const rate = ref()
const textList = [
	{ text: '很不满意', color: 'var(--el-color-danger)', borderColor: 'rgba(var(--el-color-danger-rgb),0.4)', bgColor: 'rgba(var(--el-color-danger-rgb),0.1)' },
	{ text: '不满意', color: 'var(--el-color-danger)', borderColor: 'rgba(var(--el-color-danger-rgb),0.4)', bgColor: 'rgba(var(--el-color-danger-rgb),0.1)' },
	{ text: '一般', color: 'var(--el-color-warning)', borderColor: 'rgba(var(--el-color-warning-rgb),0.4)', bgColor: 'rgba(var(--el-color-danger-rgb),0.1)' },
	{ text: '满意', color: 'var(--el-color-primary)', borderColor: 'rgba(var(--el-color-primary-rgb),0.4)', bgColor: 'rgba(var(--el-color-primary-rgb),0.1)' },
	{ text: '非常满意', color: 'var(--el-color-primary)', borderColor: 'rgba(var(--el-color-primary-rgb),0.4)', bgColor: 'rgba(var(--el-color-primary-rgb),0.1)' },
]
const identityIndex = ref(0)
const socialRole = ref('')
const socialTypeList = ref([
	{ text: '软件和互联网', checked: true },
	{ text: '事业单位', checked: false },
	{ text: '传统企业', checked: false },
	{ text: '创业公司', checked: false },
	{ text: '个人', checked: false },
	{ text: '其他', checked: false },
])
const otherCard = ref('')
const socialStatus = ref([
	[
		{ role: '软件开发', check: false },
		{ role: '建站', check: false },
		{ role: '互联网服务', check: false },
		{ role: '软件服务', check: false },
	],
	[
		{ role: '政府单位', check: false },
		{ role: '政企单位', check: false },
		{ role: '医院', check: false },
		{ role: '学校', check: false },
	],
	[
		{ role: '工业', check: false },
		{ role: '服务', check: false },
		{ role: '餐饮', check: false },
		{ role: '制造业等', check: false },
	],
	[{ role: '创业公司', check: false }],
	[
		{ role: '个人站长', check: false },
		{ role: '学生', check: false },
	],
])

const moduleTile = !title ? (name ? `您对${name}有什么改进的方向和建议?` : '宝塔面板需求反馈收集') : title
const placeholder = description || '如果您在使用过程中遇到任何问题或功能不完善，请将您的问题或需求详细描述给我们，我们将尽力为您解决或完善。'

const form = reactive<any>({
	phone: '',
	status: false,
})
const changeCardType = (item: any, index: number) => {
	identityIndex.value = index
	socialTypeList.value.forEach((item: any) => {
		item.checked = false
	})
	item.checked = true
}
const changeCharacter = (item: any, index: number) => {
	socialRole.value = item.role
	socialStatus.value.forEach((item: any) => {
		item.forEach((item: any) => {
			item.check = false
		})
	})
	item.check = true
}
/**
 * @description: 提交问卷
 * @returns
 */
const submit = async () => {
	let param: any = {
			product_type: type,
			software_name: softName || 'panel',
			rate: rateValue.value,
		},
		que: any = {}
	if (!isNoRate && (rateValue.value === null || rateValue.value === 0)) {
		Message.error('打个分数再提交吧，麻烦您了~')
		// throw new Error('打个分数再提交吧，麻烦您了~')\
		return
	}

	if (questions.value === '') {
		Message.error('请输入您的需求')
		// throw new Error('请输入您的需求')
		return
	}

	try {
		que[id] = questions.value
		if (identityIndex.value != 5) {
			que[1000] = socialRole.value
		} else {
			que[1000] = otherCard.value
		}

		param['questions'] = JSON.stringify(que) // 问题id与回答
		if (form.status) {
			if (!form.phone) {
				Message.error('请留下您的手机号码方便后续回访~')
				return
			}
			let isPhone = checkPhone(form.phone)
			param['feedback'] = JSON.stringify(isPhone ? { phone: form.phone } : { email: form.phone })
		}
		await writeNpsQuestion(param)
		npsThanksDialog()
		emits('close')
	} catch (e) {
		console.log(e)
	}
}

const inputRef = ref()

onMounted(() => {
	if (!isNoRate) {
		symbolTips.value = 'top-34'
		const list = rate.value.$el.querySelectorAll('.el-rate__item')
		list.forEach((item: HTMLElement, index: number) => {
			const div = document.createElement('div')
			const textItem = textList[index]
			div.innerText = textItem.text
			div.classList.add('rate-tips')
			div.style.color = textItem.color
			div.style.borderColor = textItem.borderColor
			div.style.backgroundColor = textItem.bgColor
			item.appendChild(div)
			if (![1, 3, 5].includes(index)) {
				div.style.display = 'block'
			}
			item.addEventListener('mouseover', () => {
				list.forEach(item => {
					item.querySelector('.rate-tips').style.display = 'none'
				})
				rateValue.value = index + 1
				div.style.display = 'block'
			})
		})
	}

	setTimeout(() => {
		inputRef.value?.focus()
	}, 400)
})
</script>

<style lang="css" scoped>
.nps-survey-banner {
	background-image: url('/static/images/feedback/qa_banner.png');
	background-repeat: no-repeat;
	position: relative;
	width: 100%;
	background-size: 100%;
	background-position: top center;
	height: 92px;
	margin-top: -1px;
	margin-bottom: 16px;
}

.nps-survey-banner > span {
	@apply absolute left-[3.2rem] top-[1.6rem] text-large text-white;
}

.nps-survey-banner i {
	background-image: url('/static/icons/logo-white.svg');
	background-size: contain;
	background-repeat: no-repeat;
	background-size: 18px;
	@apply inline-block w-[20px] h-[20px];
}

.el-form .el-form-item {
	@apply flex flex-col;
}

.nps_surver_tips {
	@apply text-small text-tertiary ml-[1rem];
}

:deep(.el-form .el-form-item--small .el-form-item__label) {
	@apply text-base font-bold leading-[3.6rem];
}

/* 分数 */
.el-rate {
	@apply h-5rem;
	display: flex;
}

:deep(.el-rate__item) {
	position: relative;
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
}

:deep(.rate-tips) {
	display: none;
	position: absolute;
	bottom: -18px;
	font-size: var(--el-font-size-small);
	width: 60px;
	height: 18px;
	text-align: center;
	border-radius: var(--el-border-radius-base);
	color: var(--el-color-danger);
	background-color: rgba(var(--el-color-danger-rgb), 0.05);
	border: 1px solid rgba(var(--el-color-danger-rgb), 0.26);
}

:deep(.el-rate__icon) {
	font-size: var(--el-font-size-title-large) !important;
}

:deep(.el-rate__text) {
	@apply text-small w-[6rem] border rounded-base inline-block text-center py-[2px];
}

/* 身份 */
.cardTitle {
	position: relative;
	margin-right: 1.2rem;
	cursor: pointer;
}

.cardTitle.active {
	color: var(--el-color-primary);
}

.cardTitle::after {
	content: '';
	display: block;
	border-left: 0.1rem solid var(--el-color-border-darker);
	position: absolute;
	height: 1.2rem;
	top: 0.2rem;
	right: -1.2rem;
	margin: 0 0.5rem;
}

.cardTitle:last-child::after {
	display: none;
}

.el-tag {
	cursor: pointer;
	@apply mr-[4px];
}

.el-tag:hover {
	@apply bg-extraLight text-primary border-[var(--el-color-success-light-7)];
}

.el-tag.active {
	@apply bg-extraLight text-primary border-[var(--el-color-success-light-7)];
}
</style>

<style lang="css">
.el-popover .popper__arrow::after {
	border-top-color: var(--el-color-primary) !important;
	border-bottom-color: var(--el-color-primary) !important;
}
</style>
