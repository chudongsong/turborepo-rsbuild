<template>
	<div class="realname-detail-content">
		<div v-if="loading" class="loading-container">
			<el-skeleton :rows="7" animated />
		</div>
		<div v-else-if="realnameInfo" class="info-container">
			<ElDescriptions :column="1" border>
				<ElDescriptionsItem label="域名">
					{{ props.compData?.domain || '-' }}
				</ElDescriptionsItem>
				<ElDescriptionsItem label="姓名">
					{{ realnameInfo.owner_name || realnameInfo.contact_person || '-' }}
				</ElDescriptionsItem>
				<ElDescriptionsItem label="身份证号">
					{{ realnameInfo.id_number || '-' }}
				</ElDescriptionsItem>
				<ElDescriptionsItem label="手机号码">
					{{ realnameInfo.phone || '-' }}
				</ElDescriptionsItem>
				<ElDescriptionsItem label="邮箱地址">
					{{ realnameInfo.email || '-' }}
				</ElDescriptionsItem>
				<ElDescriptionsItem label="联系地址">
					{{ realnameInfo.address || '-' }}
				</ElDescriptionsItem>
				<ElDescriptionsItem label="认证时间">
					{{ formatVerifyTime(realnameInfo.verify_time) || '-' }}
				</ElDescriptionsItem>
			</ElDescriptions>
		</div>
		<div v-else class="empty-state">
			<el-empty description="暂无实名信息" />
		</div>
	</div>
</template>

<script setup lang="tsx">
import { ref, onMounted } from 'vue'
import { getDomaiNuniversalModule } from '@/api/domain'
import { ElDescriptions, ElDescriptionsItem } from 'element-plus'

interface Props {
	compData?: {
		domainId?: number
		domain?: string
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({})
})

const loading = ref(true)
const realnameInfo = ref<any>(null)

// 格式化认证时间
const formatVerifyTime = (verifyTime: string) => {
	if (!verifyTime) return '-'
	try {
		const date = new Date(verifyTime)
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		})
	} catch (error) {
		return verifyTime
	}
}

// 获取实名信息详情
const getRealnameDetail = async () => {
	try {
		loading.value = true
		const response = await getDomaiNuniversalModule({
			url: '/api/v1/domain/manage/detail',
			domain_id: props.compData?.domainId
		})
		console.log('实名信息response', response)
		if (response.data && response.data.data && response.data.data.real_name_info) {
			realnameInfo.value = response.data.data.real_name_info
		} else {
			realnameInfo.value = null
		}
	} catch (error) {
		console.error('获取实名信息失败:', error)
		realnameInfo.value = null
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	getRealnameDetail()
})
</script>

<style lang="scss" scoped>
.realname-detail-content {
	padding: 20px;
	min-height: 300px;
}

.loading-container {
	padding: 20px 0;
}


.empty-state {
	padding: 40px 0;
	text-align: center;
}
</style>
