<template>
	<div class="nps_survey_box" @mouseenter="handleMouseEnter">
		<div v-if="isTime" class="time-keeping">
			<span>{{ time }}</span> 秒后自动关闭
		</div>
		<div class="nps-title">您对【{{ name }}】使用体验的满意程度？</div>
		<div class="px-[3rem] text-center relative">
			<!-- 分数(可不展示) -->
			<el-rate ref="rate" v-model="rateValue" class="mt-[8px] mb-[3rem]" :texts="text" :colors="['var(--el-color-danger)', 'var(--el-color-warning)', 'var(--el-color-primary)']"> </el-rate>
		</div>
		<div v-show="rateValue > 0" class="nps-content">
			<div class="nps-content-title">您{{ rateValue < 3 ? '不' : '' }}满意的原因？</div>
			<div class="flex justify-between">
				<el-tag v-for="(item, index) in tagList[rateValue < 3 ? 'bad' : 'good'].slice(0, 4)" :class="item.check ? 'active' : ''" size="small" :key="index" type="info" @click="changeCharacter(item, index)" effect="plain">{{ item.text }}</el-tag>
			</div>
			<bt-input v-model="otherCard" width="30rem" placeholder="自定义填写" class="mt-[1.4rem]" />
		</div>
		<div class="flex flex-col items-center px-[3rem] py-[2rem] pb-[2.8rem]">
			<el-button type="primary" class="w-full" size="default" @click="submit">提交反馈</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { writeNpsQuestion, getNewNpsTag } from '@api/global'
import { npsThanksDialog } from '@/public/index'
import { useEventListener } from '@vueuse/core'

interface Props {
	compData?: any
}

const emits = defineEmits(['close'])
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const { proxy: vm }: any = getCurrentInstance()

const {
	id, // 问题id
	type, //product_type
	name, // 模块名称(中文)
	softName, // 面板类型 panel、total、btwaf(默认panel)
	description, // 问题描述
} = props.compData
const symbolTips = ref('top-0') // 必填标识
// const questions = ref('') // 表单数据
const rateValue = ref(0)
const rate = ref()
const tagList = reactive({
	good: [], // 好评标签
	bad: [], // 差评标签
	middle: [], // 中评标签
}) // 标签列表(暂时不用)
const text = ['很不满意', '不满意', '一般', '满意', '非常满意']
const textList = [
	{ text: '很不满意', color: 'var(--el-color-danger)', borderColor: 'rgba(var(--el-color-danger-rgb),0.4)', bgColor: 'rgba(var(--el-color-danger-rgb),0.1)' },
	{ text: '不满意', color: 'var(--el-color-danger)', borderColor: 'rgba(var(--el-color-danger-rgb),0.4)', bgColor: 'rgba(var(--el-color-danger-rgb),0.1)' },
	{ text: '一般', color: 'var(--el-color-warning)', borderColor: 'rgba(var(--el-color-warning-rgb),0.4)', bgColor: 'rgba(var(--el-color-warning-rgb),0.1)' },
	{ text: '满意', color: 'var(--el-color-primary)', borderColor: 'rgba(var(--el-color-primary-rgb),0.4)', bgColor: 'rgba(var(--el-color-primary-rgb),0.1)' },
	{ text: '非常满意', color: 'var(--el-color-primary)', borderColor: 'rgba(var(--el-color-primary-rgb),0.4)', bgColor: 'rgba(var(--el-color-primary-rgb),0.1)' },
]
const otherCard = ref('')
const socialStatus = ref([
	[
		{ role: '操作复杂', check: false },
		{ role: '出现卡顿', check: false },
		{ role: 'BUG太多', check: false },
		{ role: '功能不稳定', check: false },
	],
	[
		{ role: '简单好用', check: false },
		{ role: '操作流畅', check: false },
		{ role: 'BUG极少', check: false },
		{ role: '功能完善', check: false },
	],
])
const isTime = ref(true) // 是否显示倒计时
const time = ref(15)
const timer = ref<any>(null)

const form = reactive<any>({
	phone: '',
	status: false,
})

const changeCharacter = (item: any, index: number) => {
	item.check = !item.check
}

/**
 * @description: 提交问卷
 * @returns
 */
const submit = async () => {
	let role = []
	// 获取选中标签内容
	tagList[rateValue.value < 3 ? 'bad' : 'good'].forEach((item: any) => {
		if (item.check) role.push(item.id)
	})
	// socialStatus.value[rateValue.value < 3 ? 0 : 1].forEach((item: any) => {
	// 	if (item.check) role.push(item.role)
	// })
	// if (otherCard.value) role.push(otherCard.value)

	try {
		const param = {
			reason_tags: role.join(','),
			// feedback: otherCard.value,
			// questions: '{"999":"啊实打实","1000":""}',
			questions: JSON.stringify({ '999': otherCard.value || '' }),
			rate: rateValue.value,
			product_type: type,
			software_name: 1,
			phone_back: 0,
		}
		console.log(param)
		await writeNpsQuestion(param)
		emits('close')
	} catch (e) {
		console.log(e)
	} finally {
		npsThanksDialog()
	}
}

/**
 * @description: 开始倒计时
 * @returns
 */
const startInterval = () => {
	timer.value = setInterval(() => {
		time.value--
		if (time.value === 0) {
			clearInterval(timer)
			emits('close')
		}
	}, 1000)
}

/**
 * @description: 移入清除定时器
 * @returns
 */
const handleMouseEnter = () => {
	clearInterval(timer.value)
	isTime.value = false
}

/**
 * @description: 初始化数据
 * @returns
 */
const initData = async () => {
	try {
		// 获取标签
		const res = await getNewNpsTag({ product_type: type })
		if (res.status) {
			// 根据满意度分类
			res.data.value.forEach((item: any) => {
				const items = {
					...item,
					check: false,
				}
				switch (items.satisfactions) {
					case '0':
						tagList.bad.push(items)
						break
					case '1':
						tagList.middle.push(items)
						break
					case '2':
						tagList.good.push(items)
						break

					default:
						break
				}
			})
		}
	} catch (error) {
		console.log(error)
	}
}

onMounted(() => {
	initData()
	startInterval()

	// 存储打开2天后的时间sessionStorage
	localStorage.setItem('NPS-TIME', JSON.stringify(new Date().getTime() + 2 * 24 * 60 * 60 * 1000))

	// 获取已经填写过的入口
	let expArr: any = localStorage.getItem('NPS-EXP')
	if (expArr) {
		expArr = JSON.parse(expArr)
	} else {
		expArr = []
	}
	expArr = [...expArr, type]
	localStorage.setItem('NPS-EXP', JSON.stringify(expArr))

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
		useEventListener(item, 'mouseover', () => {
			list.forEach((item: any) => {
				item.querySelector('.rate-tips').style.display = 'none'
			})

			rateValue.value = index + 1
			div.style.display = 'block'
		})
		// item.addEventListener('mouseover', () => {
		// 	list.forEach((item: any) => {
		// 		item.querySelector('.rate-tips').style.display = 'none'
		// 	})

		// 	rateValue.value = index + 1
		// 	div.style.display = 'block'
		// })
	})
})
</script>

<style lang="css" scoped>
.nps_survey_banner {
	position: relative;
	background-image: url('/static/images/feedback/qa_banner.png');
	width: 100%;
	background-size: 100%;
	background-position: top center;
	height: 92px;
	margin-top: -1px;
}

.nps_survey_banner > span {
	@apply absolute left-[3.2rem] top-[1.6rem] text-large text-white;
}

.nps_survey_banner i {
	background-image: url('/static/icons/logo-white.svg');
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

.nps_survey_box {
	@apply bg-white relative;
}

.nps_survey_box .time-keeping {
	@apply absolute top-[0.4rem] right-[2.8rem] text-tertiary;
}

.nps_survey_box .time-keeping span {
	@apply text-danger;
}

.nps_survey_box .nps-title {
	@apply px-[3rem] pt-[4rem] pb-[1rem] text-base font-bold;
}

.nps_survey_box .nps-content {
	@apply px-[3rem];
}

.nps_survey_box .nps-content-title {
	@apply text-base font-bold text-secondary py-[1.4rem];
}

.el-rate {
	@apply h-5rem;
	display: flex;
}

.el-rate :deep(.el-rate__item) {
	position: relative;
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
}

.el-rate :deep(.el-rate__item) .rate-tips {
	display: none;
	position: absolute;
	bottom: -18px;
	font-size: var(--el-font-size-small);
	width: 60px;
	height: 18px;
	text-align: center;
	border-radius: var(--el-border-radius-base);
	color: var(--el-color-danger);
	background-color: rgba(var(--el-color-danger-rgb), 0.1);
	border: 1px solid rgba(var(--el-color-danger-rgb), 0.2);
}

.el-rate :deep(.el-rate__item) .el-rate__icon {
	font-size: var(--el-font-size-title-large) !important;
}

.el-rate :deep(.el-rate__item) .el-rate__text {
	@apply text-small w-[6rem] border rounded-base inline-block text-center py-[.2rem];
}

.cardTitle {
	position: relative;
	margin-right: 0.8rem;
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
	top: 0.1rem;
	right: -0.9rem;
	margin: 0 0.5rem;
}

.cardTitle:last-child::after {
	display: none;
}

.el-tag {
	cursor: pointer;
	@apply h-[3rem] leading-[2.8rem];
}

.el-tag:hover {
	@apply bg-extraLight text-primary border-darker;
}

.el-tag.active {
	@apply bg-extraLight text-primary border-primary;
}
</style>
