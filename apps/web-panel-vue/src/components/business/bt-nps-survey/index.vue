<template>
	<div class="nps-survey-box">
		<div class="nps-survey-banner">
			<span> <i></i> <span style="vertical-align: 4px">宝塔面板产品体验调查</span> </span>
		</div>
		<div class="py-[40px] px-[30px]">
			<!-- 评分部分 -->
			<div class="nps-survey-score h-[130px]">
				<div class="text-round font-bold text-center text-black">您向朋友或同事推荐宝塔面板的可能性有多大?</div>
				<div id="survey-score" class="flex items-center justify-around">
					<ul class="survey-score-num small">
						<li v-for="value in [1, 2, 3, 4, 5, 6]" :key="value" :data-content="value" :class="{ act: checkScore(value) }" @mouseover="scoreMouseOver('small', value)" @mouseleave="scoreMouseLeave('small', value)" @click="scoreClick('small', value)">
							{{ checkScore(value) ? `${value}分` : value }}
						</li>
					</ul>
					<ul class="survey-score-num medium">
						<li v-for="value in [7, 8]" :key="value" :data-content="value" :class="{ act: checkScore(value) }" @mouseover="scoreMouseOver('medium', value)" @mouseleave="scoreMouseLeave('medium', value)" @click="scoreClick('medium', value)">
							{{ value + (checkScore(value) ? `分` : '') }}
						</li>
					</ul>
					<ul class="survey-score-num large">
						<li v-for="value in [9, 10]" :key="value" :data-content="value" :class="{ act: checkScore(value) }" @mouseover="scoreMouseOver('large', value)" @mouseleave="scoreMouseLeave('large', value)" @click="scoreClick('large', value)">
							{{ checkScore(value) ? `${value}分` : value }}
						</li>
					</ul>
				</div>
			</div>
			<!-- 回答部分 -->
			<div v-show="score !== 0" class="flex flex-col items-center">
				<el-form ref="npsForm" label-position="top" :model="questions" size="default">
					<el-form-item v-for="(item, index) in questionList" :key="index" label="" :error="item.error">
						<template #label>
							<span class="nps-survey-title"
								><span v-if="item.required" class="text-danger">*</span>
								<span class="text-base">{{ item.question }}</span>
							</span>
							<span v-if="!item.textarea" class="nps-surver-tips">
								{{ item.hint }}
							</span>
						</template>
						<template v-if="item.textarea">
							<el-popover ref="popover" v-model:visible="popoverFocus" placement="top-start" popper-class="green-tips-popover p-20px !border-none" title="" width="51.2rem" trigger="focus" :content="item.hint">
								<template #reference>
									<el-input v-model="questions[item.id]" type="textarea" class="!w-[51.2rem]" :rows="6" :maxlength="500" :placeholder="item.isHint ? item.hint : ''" @focus="popoverFocus = true" @input="changeInputEvent($event, item.id, index)" @blur="item.isHint = true"></el-input>
								</template>
							</el-popover>
						</template>
						<template v-else>
							<el-input v-model="questions[item.id]" class="w-[51.2rem]" :maxlength="500" placeholder="请填写问题答案" @input="changeInputEvent($event, item.id, index)"></el-input>
						</template>
					</el-form-item>
				</el-form>
				<div class="text-primary leading-[3.5rem] mb-[1rem]">我们特别重视您的需求反馈，我们会每周进行需求评审。希望能更好的帮到您</div>
				<el-button class="w-[12.5rem]" size="large" type="primary" @click="submit">提交</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@hooks/tools'
import { useGlobalStore } from '@store/global'
import { npsThanksDialog } from '@/public'
import { getNpsQuestion, writeNpsQuestion, ignoreNps } from '@api/global'

// 表单数据
interface Form {
	problem_one: string
	problem_two: string
	problem_three: string
}

interface objectForm {
	[key: string]: any
}

const emits = defineEmits(['close'])

const { proxy: vm }: any = getCurrentInstance()
const { load: $load, error: $error } = useMessage()
const { panel } = useGlobalStore()

const questions = reactive<objectForm>({}) // 表单数据
const questionList = ref<AnyObject[]>([]) // 问题列表
const popoverFocus = ref(false) // 域名popover
const hoverScore = ref(0) // 鼠标移入评分
const score = ref(0) // 评分

/**
 * @description 评分验证
 * @param {number} val 评分值
 */
const checkScore = (val: number) => {
	return hoverScore.value === val || score.value === val
}

/**
 * @description: 评分鼠标移入事件
 * @param {string} type 评分类型
 * @param {number} index 评分索引
 */
const scoreMouseOver = (type: string, index: number) => {
	if (score.value === index) return false
	hoverScore.value = index
	// chooseCss(type, index, 0.8);
}

/**
 * @description: 表单输入事件-强制更新视图
 * @param {string} val 输入值
 * @param {string} id 问题id
 */
const changeInputEvent = (val: any, id: string, index: any) => {
	if (val == '') {
		questionList.value[index].error = '问题答案不可为空'
	} else {
		questionList.value[index].error = ''
	}
	questions[id] = val
	vm.$forceUpdate()
}
/**
 * @description: 评分鼠标移出事件
 * @param {string} type 评分类型
 * @param {number} index 评分索引
 */
const scoreMouseLeave = (type: string, index: number) => {
	if (score.value === index) return false
	hoverScore.value = -1
}

/**
 * @description: 评分点击事件
 * @param {string} type 评分类型
 * @param {number} index 评分索引
 */
const scoreClick = (type: string, index: number) => {
	if (!questionList.value.length) {
		$error('暂时无法进行评分哦~请刷新页面重试')
		return false
	}
	score.value = index
}

/**
 * @description: 提交问卷
 */
const submit = async () => {
	try {
		// 若questionList中存在error，则提示错误
		await questionList.value.forEach((item: any) => {
			if (item.error != '') {
				$error('还有必填项没有填写哦~')
				throw new Error('还有必填项没有填写哦~')
			}
		})
		let load = $load('正在提交问卷，请稍后...')
		const rdata = await writeNpsQuestion({
			questions: JSON.stringify(questions), // 问题与回答
			product_type: 0, // 产品类型 0:面板 1:waf 2:监控报表 3：防篡改
			rate: score.value, // 评分
			software_name: 'panel', // 面板类型 panel、total、btwaf
		})
		if (rdata.status) {
			load.close()
			emits('close')
			npsThanksDialog()
		}
	} catch (e) {
		console.log(e)
	}
}

onBeforeMount(async () => {
	try {
		const { data } = await getNpsQuestion({ version: -1, product_type: 0 })
		questionList.value = data.msg
		questionList.value = [
			{
				id: 4,
				hint: '您在使用产品过程中有什么需求没有被满足，或遇到什么BUG没被解决，请将您的问题或需求详细描述给我们，我们尽力为您解决及开发对应的功能',
				product_type: 0,
				question: '您的哪些需求在宝塔面板上还没有被满足的?',
				required: 1,
				version: 0,
				textarea: true, // 是否为文本域
				isHint: true, // 是否显示信息
			},
		]
		questionList.value.forEach((item: any) => {
			questions[item.id] = ''
		})
	} catch (error) {
		console.log(error)
	}
})

onMounted(async () => {
	panel.value.panelNps = true
	ignoreNps({ software_name: 'panel' })
})
</script>

<style scoped lang="css">
.nps-survey-banner {
	position: relative;
	background-image: url('/static/images/feedback/qa_banner.png');
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
	width: 100%;
	background-size: 100%;
	height: 92px;
	margin-top: -1px;
}

.nps-survey-banner > span {
	position: absolute;
	left: 3.2rem;
	top: 1.6rem;
	font-size: var(--el-font-size-medium);
	color: var(--el-color-white);
}

.nps-survey-banner i {
	background-image: url('/static/icons/logo-white.svg');
	background-size: contain;
	background-repeat: no-repeat;
	background-size: 18px;
	display: inline-block;
	width: 20px;
	height: 20px;
	margin-right: 8px;
	margin-top: 4px;
}

.nps-survey-score ul {
	@apply relative mt-[2.4rem] rounded-small cursor-pointer inline-block text-0;
	border: 1px solid var(--el-color-text-disabled);
}

.nps-survey-score ul.small::before {
	background: linear-gradient(to bottom, var(--el-color-error-light-9), rgb(var(--el-color-white-rgb)));
}

.nps-survey-score ul.medium::before {
	background: linear-gradient(to bottom, var(--el-color-warning-light-9), rgb(var(--el-color-white-rgb)));
}

.nps-survey-score ul.large::before {
	background: linear-gradient(to bottom, var(--el-color-primary-light-9), rgb(var(--el-color-white-rgb)));
}

.survey-score-num li {
	transition: 'background' 0.3s;
}

.survey-score-num.small .act {
	background: var(--el-color-error);
}

.survey-score-num.medium .act {
	background: var(--el-color-warning);
}

.survey-score-num.large .act {
	background: var(--el-color-success);
}

.survey-score-num.small {
	border-color: var(--el-color-danger-light-9);
	background: var(--el-color-danger-light-9);
	color: var(--el-color-danger);
}

.survey-score-num.small::after {
	content: '不可能推荐';
	@apply absolute top-[4.8rem] left-[9.4rem] text-small leading-[1.8rem] cursor-auto;
}

.survey-score-num.medium {
	border-color: var(--el-color-warning-light-9);
	background: var(--el-color-warning-light-7);
	color: var(--el-color-warning);
}

.survey-score-num.medium::after {
	content: '可能推荐';
	@apply absolute top-[4.8rem] left-[1.8rem] text-small cursor-auto leading-[1.8rem];
}

.survey-score-num.large {
	border-color: var(--el-color-success-light-9);
	background: var(--el-color-success-light-7);
	color: var(--el-color-success);
}

.survey-score-num.large::after {
	content: '一定推荐';
	@apply absolute top-[4.8rem] left-[1.8rem] text-small cursor-auto leading-[1.8rem];
}

.survey-score-num li {
	@apply relative inline-block text-center text-base font-bold leading-[4.2rem] w-[42px] h-[42px];
}

.survey-score-num li::before {
	content: '';
	@apply absolute right-0 top-[1rem] h-[2.5rem];
	border-right-style: solid;
	border-right-width: 1px;
	border-color: rgb(255 255 255 / 30%);
}

.survey-score-num .act::before {
	content: attr(data-content);
	height: 52px;
	line-height: 52px !important;
	width: 100%;
	background: inherit;
	font-weight: initial;
	@apply absolute -top-[0.5rem] text-extraLarge text-white rounded-base;
}

.survey-score-num .act::after {
	font-size: var(--el-font-size-small);
	color: var(--el-color-white);
	position: absolute;
	right: 5px;
	margin-left: 2px;
}

.survey-score-num .ten::after {
	@apply text-small text-white absolute left-[2.5rem] leading-[4.2rem];
}

.survey-score-num .ten::before {
	content: attr(data-content);
	@apply h-[5.2rem] leading-[5.2rem] text-white rounded-base absolute -top-[0.5rem] text-extraLarge text-left pl-[0.2rem];
	width: 100%;
	background: inherit;
	font-weight: initial;
}

.survey-score-num::before {
	content: '';
	height: 35px;
	width: 100%;
	@apply absolute inline-block -bottom-[3.7rem] cursor-auto;
}

.el-form .el-form-item {
	@apply flex flex-col;
}

.nps-surver-tips {
	@apply text-small text-tertiary ml-[1rem];
}

:deep(.el-form-item__label) {
	@apply text-base font-bold leading-[3.6rem];
}

:deep(.el-popover.popover-primary) {
	width: 512px !important;
}

:deep(.el-form .el-form-item__label) {
	margin-right: 0 !important;
}
</style>
