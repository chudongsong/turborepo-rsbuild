<!-- eslint-disable @typescript-eslint/naming-convention -->
<template>
	<div>
		<div v-if="!isErrorFind" class="p-[20px]">
			<h3 class="mb-10">出错了，面板运行时发生错误！</h3>
			<pre class="h-108 w-full whitespace-pre-wrap mb-0">{{ errorBody.trim() }}</pre>
			<div class="">
				<el-button @click="copyError">点击复制错误信息</el-button>
			</div>
			<ul class="help-info-text err_project_ul inline-block">
				<li class="list-none leading-[3.2rem]">
					<b>很抱歉，面板运行时意外发生错误，请尝试按以下顺序尝试解除此错误：</b>
				</li>
				<li class="list-none leading-[3.2rem]">修复方案一：在[首页]右上角点击修复面板，并退出面板重新登录。<bt-link href="javascript:;" class="bt-link ml-4" @click="onRepair">尝试点击修复</bt-link></li>
				<li class="list-none leading-[3.2rem]">修复方案二：如上述尝试未能解除此错误，请截图此窗口到宝塔论坛发贴寻求帮助, 论坛地址：<bt-link class="btlink" href="https://www.bt.cn/bbs" target="_blank">https://www.bt.cn/bbs</bt-link></li>
				<li v-if="isBuyProduct" class="list-none leading-[3.2rem]">修复方案三(<span class="text-warning-500">推荐</span>)：使用微信扫描右侧二维码，联系技术客服。</li>
			</ul>
			<div v-if="isBuyProduct" class="relative mt-20 mr-10 text-center text-xs pull-right">
				<span id="err_kefu_img" class="p-5 border border-green-500 inline-block h-28">
					<bt-image :src="'customer/customer-qrcode.png'"> </bt-image>
				</span>
				<div>【微信客服】</div>
			</div>
		</div>
		<div v-else>
			<div class="p-[2rem]" v-html="errorBody"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { repairPanelNew } from '@api/global'
import { clearCache, copyText, formatTime, isNumber } from '@/utils'
import { useConfirm, useDialog, useDataHandle, useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'

interface Props {
	compData: {
		errorBody: string
		errorFind: number | boolean
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		errorBody: '', // 错误信息
		errorFind: false, // 是否找到错误
	}),
})

const Message = useMessage() // 消息提示
const { isBuy: isBuyProduct } = useGlobalStore() // 类型

const { errorFind, errorBody } = toRefs(props.compData)
const isErrorFind = ref(isNumber(errorFind.value))

/**
 * @description 初始化
 */
const init = () => {
	// 判断是否为错误信息
	if (isErrorFind.value) {
		errorBody.value = errorBody.value.split('<!--')[2].replace('-->', '')
		const tmp = errorBody.value.split('During handling of the above exception, another exception occurred:')
		errorBody.value = tmp[tmp.length - 1]
	}
}

/**
 * @description 复制错误信息
 */
const copyError = () => {
	const value = isErrorFind.value ? errorBody.value.trim() : `${errorBody.value.trim()}\n${errorBody.value.trim()}`
	try {
		navigator.clipboard.writeText(value)
	} catch (error) {
		copyText({ value })
	} finally {
		Message.success('复制成功')
	}
}

/**
 * @description 修复面板
 */
/**
 * @description 修复面板
 */
const onRepair = async () => {
	await useDataHandle({
		loading: '正在获取数据，请稍后...',
		request: repairPanelNew(),
		success: async (res: any) => {
			const { data } = res
			if (data.upgrade === 1) {
				// 存在修复面板
				await useConfirm({
					title: '修复面板',
					content: `<div class="flex items-center">
              <div class="mr-1rem w-[4rem]"><img width="40" src="/static/icons/icon-upgrade.svg"></img></div>
              <div class="flex-1">
                <div class="text-medium leading-2.4rem">发现新版本，继续修复面板能修复使用中遇到的各种异常问题</div>
              </div>
            </div>
            <div class="pl-5rem mt-[4px]">
              <div>最新版本：${data.cloud.version}</div>
              <div>更新时间：${formatTime(data.cloud.update_time * 1000)}</div>
            </div>`,
					icon: false,
					width: '40rem',
					isHtml: true,
					confirmText: '继续修复',
				})
				useDataHandle({
					loading: '正在修复面板，请稍后...',
					request: repairPanelNew({ force: 1 }),
					message: true,
					success: (res: any) => {
						clearCache()
						if (res.status) {
							setTimeout(() => {
								// 修复日志
								useDialog({
									title: `正在${data.type === 'repair' ? '修复' : '更新'}面板，请耐心等候...`,
									area: 70,
									compData: { type: 'repair' },
									component: () => import('@home/views/header/repair-upgrade-log/index.vue'),
								})
							}, 1500)
						}
					},
				})
			} else {
				Message.msg({
					message: `<div>
              <div>当前已是最新版本</div>
              <div>当前版本：${data.local.version}</div>
              <div>更新时间：${formatTime(data.local.update_time * 1000)}</div>
            </div>`,
					type: 'success',
					dangerouslyUseHTMLString: true,
				})
			}
		},
	})
}

onMounted(() => init())
</script>

<style lang="css" scoped>
:deep(pre) {
	display: block;
	padding: 9.5px;
	margin: 0 0 10px;
	font-size: var(--el-font-size-base);
	line-height: 1.42857143;
	color: var(--el-color-text-primary);
	word-break: break-all;
	word-wrap: break-word;
	background-color: var(--el-fill-color-light);
	border: 1px solid var(--el-color-border-darker);
	border-radius: var(--el-border-radius-base);
	overflow: auto;
}
:deep(li) {
	line-height: 32px;
}
:deep(.pull-right) {
	float: right;
	position: relative;
	margin-top: 20px;
	margin-right: 40px;
	text-align: center;
	font-size: var(--el-font-size-small);
}
:deep(h3) {
	font-size: var(--el-font-size-subtitle-large);
	font-family: inherit;
	font-weight: 500;
	line-height: 1.1;
	color: inherit;
}
:deep(.help-info-text) {
	margin-top: 15px;
}
</style>
