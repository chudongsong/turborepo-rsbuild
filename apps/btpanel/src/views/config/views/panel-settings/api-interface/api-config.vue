<template>
	<div class="p-[2rem]" v-bt-loading="load" v-bt-loading:title="loadTitle">
		<el-form>
			<el-form-item label="API接口">
				<el-switch v-model="panelConfig.apiInterface" @change="onChangeEvent"></el-switch>
			</el-form-item>
			<el-form-item label="接口密钥">
				<div class="w-[32rem]">
					<bt-input v-model="form.token" type="text" readonly>
						<template #suffix class="flex items-center">
							<el-button type="primary" size="small" @click="onResetEvent"> 重置 </el-button>
						</template>
					</bt-input>
				</div>
			</el-form-item>
			<el-form-item>
				<template #label>
					<div class="py-8px leading-[1.4]">
						<div class="pr-6px">IP白名单</div>
						<div>(每行一个)</div>
					</div>
				</template>
				<div class="w-[32rem]">
					<bt-input v-model="form.limit_addr" type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }"> </bt-input>
				</div>
			</el-form-item>
			<el-form-item label=" ">
				<el-button type="primary" @click="onSaveEvent">保存</el-button>
			</el-form-item>
		</el-form>
		<bt-help class="my-20px">
			<li class="text-secondary h-[2.4rem]">IP白名单支持格式：</li>
			<li class="text-secondary h-[2.4rem]">单IP：（192.168.1.1），IP段：（192.168.1.1-192.168.1.255），所有IP：（*）</li>
			<li class="text-secondary h-[2.4rem]">开启API后，必需在IP白名单列表中的IP才能访问面板API接口</li>
			<li class="text-danger h-[2.4rem]">请不要在生产环境开启，这可能增加服务器安全风险；</li>
			<li class="text-secondary h-[2.4rem]">
				API接口文档在这里：
				<bt-link href="https://www.bt.cn/bbs/thread-20376-1-1.html"> https://www.bt.cn/bbs/thread-20376-1-1.html </bt-link>
			</li>
		</bt-help>
	</div>
</template>

<script lang="ts" setup>
import { setToken, getToken } from '@/api/config'
import { Message, useConfirm } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'

const {
	refs: { panelConfig },
} = getConfigStore()

const form = reactive({
	token: '',
	limit_addr: '',
})

const load = ref(false)
const loadTitle = ref('正在获取API配置，请稍候...')

/**
 * @description: 切换API接口状态
 */
const onChangeEvent = async () => {
	await useDataHandle({
		loading: load,
		request: setToken({ t_type: 2 }),
		message: true,
	})
}

/**
 * @description: 重置密钥
 */
const onResetEvent = async () => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: '重置密钥',
			isHtml: true,
			content: `
			<p>您确定要重置当前密钥吗？</p>
			<p class="text-danger">	重置密钥后，已关联密钥产品，将失效，请重新添加新密钥至产品。</p>`,
		})
		loadTitle.value = '正在重置密钥，请稍候...'
		await useDataHandle({
			loading: load,
			request: setToken({ t_type: 1 }),
			message: false,
			success: (res: any) => {
				if (res.status) form.token = res.msg
				else Message.error(res.msg)
			},
		})
	} catch (err) {}
}

/**
 * @description: 保存API配置
 */
const onSaveEvent = async () => {
	loadTitle.value = '正在设置API配置，请稍候...'
	await useDataHandle({
		loading: load,
		request: setToken({ t_type: 3, limit_addr: form.limit_addr }),
		message: true,
	})
}

/**
 * @description: 获取API配置
 */
const getConfigEvent = async () => {
	const res = await useDataHandle({
		loading: load,
		request: getToken(),
		data: { limit_addr: String, token: String },
	})
	form.token = res.token
	form.limit_addr = res.limit_addr
}

onMounted(() => {
	getConfigEvent()
})
</script>
