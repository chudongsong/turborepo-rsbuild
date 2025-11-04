<template>
	<div class="p-[2rem]">
		<el-descriptions :column="1" border v-loading="loading" class="table-descriptions">
			<el-descriptions-item label="域名">
				<div v-for="item in certInfo.domain" :key="item">{{ item }}</div>
			</el-descriptions-item>
			<el-descriptions-item label="购买年限">
				{{ certInfo.purchaseYears }}
			</el-descriptions-item>
			<el-descriptions-item label="购买时间">
				{{ certInfo.purchaseTime }}
			</el-descriptions-item>
			<el-descriptions-item label="当前签发周期">
				{{ certInfo.currentCycle }}
			</el-descriptions-item>
			<el-descriptions-item label="当前周期剩余时间">
				{{ certInfo.remainingDays }}
			</el-descriptions-item>
			<el-descriptions-item label="下一次自动续签时间">
				<span :style="{color: typeColor}">{{ certInfo.nextRenewalTime }}</span>
			</el-descriptions-item>
			<el-descriptions-item label="验证方式">
				{{ certInfo.verificationMethod }}
			</el-descriptions-item>
			<!-- 根据验证方式判断是否显示主机名和记录值 -->
			<template v-if="certInfo.verificationMethod.includes('cname')">
				<el-descriptions-item label="主机名">
					<div class="max-w-[25rem] whitespace-pre-wrap">{{ certInfo.hostname }}</div>
				</el-descriptions-item>
				<el-descriptions-item label="记录值">
					<div class="max-w-[25rem] whitespace-pre-wrap">{{ certInfo.recordValue }}</div>
				</el-descriptions-item>
			</template>
		</el-descriptions>
		<bt-help class="mt-[1rem]" :options="[{content: '请确保验证记录正确否则将无法自动续签成功'}]" />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCertDetail } from '@/api/site'
import type { ResponseResult } from '@axios/types'

// 定义 props 接收证书 ID 或其他必要参数
interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({})
})

// 加载状态
const loading = ref(false)

// 证书信息数据
const certInfo = ref({
	domain: '',
	purchaseYears: 0,
	purchaseTime: '',
	currentCycle: 0,
	remainingDays: 0,
	nextRenewalTime: '',
	verificationMethod: '',
	hostname: '',
	recordValue: ''
})

// 定义下一次续签时间的颜色
const typeColor = ref('red')

/**
 * 获取证书详情
 */
const getCertDetailData = async () => {
	if (!props.compData.oid && !props.compData.pid) {
		console.warn('缺少证书ID或订单ID参数')
		return
	}

	loading.value = true
	
	try {
		// 调用 API 获取证书详情
		const {data: response}: ResponseResult = await getCertDetail({
			oid: props.compData.oid,
			pid: props.compData.pid
		})

		if (response.success && response.res) {
			const data = response.res
			
			// 映射后端数据到前端数据结构
			certInfo.value = {
				domain: data.domainName || [],
				purchaseYears: data.years || 0,
				purchaseTime: data.purchase_date || '--',
				currentCycle: data.cycle_text || '--',
				remainingDays: data.remaining_text || '--',
				nextRenewalTime: data.renewal_text || '--',
				verificationMethod: data.verifyInfo?.DCVdnsType || '--',
				hostname: data.verifyInfo?.DCVdnsHost || '--',
				recordValue: data.verifyInfo?.DCVdnsValue || '--'
			}
		}
	} catch (error) {
		console.error('获取证书详情失败:', error)
	} finally {
		loading.value = false
	}
}

// 组件挂载时获取数据
onMounted(() => {
	getCertDetailData()
})

// 暴露刷新方法供父组件调用
defineExpose({
	refresh: getCertDetailData
})
</script>

