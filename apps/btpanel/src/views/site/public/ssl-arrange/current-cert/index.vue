<template>
	<div class="flex flex-col w-full overflow-y-hidden">
		<el-alert v-if="sslInfo?.isCertInfo && !sslInfo?.httpsMode && sslInfo?.isStart" type="error" class="!mb-[16px]" @close="ignoreHttpsModeEvent">
			<template #title>
				<div class="flex items-center justify-between w-full">
					<div class="flex">
						<div class="mr-[32px] text-small">网站安全：未开启HTTPS防窜站，站点访问可能存在风险。<span class="ml-[1rem] bt-link" @click="openHttpsMode(popupClose)">>>前往开启</span></div>
					</div>
				</div>
			</template>
		</el-alert>
		<div class="ssl-status-info" v-if="sslInfo?.isCertInfo">
			<div class="left flex-1">
				<div>
					<span>证书分类：</span>
					<span>
						<bt-link @click="cutSslType(sslInfo.type)">
							{{ sslTypeInfo }}
						</bt-link>
					</span>
				</div>
				<div>
					<span>认证域名：</span>
					<span class="truncate max-w-24rem" :title="sslInfo.dns.join('、')">
						{{ sslInfo.dns.join('、') }}
					</span>
				</div>
				<div class="!mb-0">
					<span>强制HTTPS：</span>
					<span>
						<el-switch size="small" class="!mb-0" v-model="sslInfo.https" @change="forceHttpsChangeEvent" />
					</span>
				</div>
			</div>
			<div class="right flex-1">
				<div>
					<span>证书品牌：</span>
					<span class="truncate max-w-24rem" :title="sslInfo.issuer">
						{{ sslInfo.issuer }}
					</span>
				</div>
				<div>
					<span>到期时间：</span>
					<span>
						<span v-if="Number(sslInfo.endtime) > 0">
							{{ sslInfo.notAfter }}
						</span>
						<span v-else class="text-danger">证书已过期</span>
					</span>
				</div>
				<div class="!mb-0">
					<span>到期提醒：</span>
					<span class="flex items-center">
						<el-switch size="small" class="!mb-0" v-model="sslInfo.pushAlarm" @change="cutSslExpireEvent" />
						<bt-link class="ml-[8px]" @click="sslExpireDialog()"> 到期设置提醒 </bt-link>
					</span>
				</div>
			</div>
		</div>
		<div class="flex flex-1 justify-start">
			<div class="flex-1 mr-[20px]">
				<div class="mb-[4px]">密钥(KEY)</div>
				<el-input type="textarea" :rows="12" v-model="certKey" @focus="detectCertFromClipboard('key', certKey)" />
			</div>
			<div class="flex-1">
				<div class="mb-[4px]">证书(PEM格式)</div>
				<el-input type="textarea" :rows="12" v-model="certCsr" @focus="detectCertFromClipboard('cert', certCsr)" />
			</div>
		</div>
		<div class="my-[16px]">
			<el-button type="primary" class="mr-[4px]" @click="saveAndEnableCertEvent">
				{{ sslInfo?.isStart ? '保存' : '保存并启用证书' }}
			</el-button>
			<el-button type="primary" class="mr-[4px]" v-if="sslInfo?.isSupportRenewal || sslInfo?.type === 1" @click="renewalCurrentCertEventV2()"> 续签证书 </el-button>
			<el-button type="default" v-if="sslInfo.csr" class="mr-[4px]" @click="downloadCertMethodEvent()"> 下载证书 </el-button>
			<el-button type="default" v-if="sslInfo?.isStart" @click="closeCertEvent"> 关闭SSL </el-button>
		</div>
		<bt-help :options="sslHelp" list-style="disc" class="ml-[20px]" />
		<bt-dialog title="关闭证书到期提醒" showFooter v-model="isCloseCert" @confirm="closeRemindConfirm" @cancel="closeRemindCancel" :area="['auto']">
			<div class="p-2rem">
				<div class="flex">
					<i class="svgtofont-el-warning-filled !text-[4rem] text-warning"></i>
					<div class="ml-4">
						<div class="py-[.3rem] leading-[2.4rem] text-base">关闭证书到期提醒后将不在提醒和证书到期，是否继续操作？</div>
						<div class="mt-8px flex items-center">
							<div>应用配置</div>
							<el-select v-model="isAll" class="!w-[20rem] ml-2rem">
								<el-option label="应用到当前站点" :value="false"> </el-option>
								<el-option label="应用到所有未设置过的站点" :value="true"> </el-option>
							</el-select>
						</div>
					</div>
				</div>
				<bt-help :options="[{ content: '任务优先级：单个站点的任务优先于所有站点的任务。' }]" list-style="disc" class="ml-4rem mt-2rem"></bt-help>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { sslExpireDialog } from '@site/useController'
import { useSiteStore } from '@site/useStore'
import { closeCertEvent, renewalCurrentCertEventV2 } from '../useController'
import { useSiteSSLStore } from '../useStore'
import { isCloseCert, isAll, closeRemindConfirm, closeRemindCancel, certCsr, certKey, cutSslExpireEvent, cutSslType, downloadCertMethodEvent, forceHttpsChangeEvent, initCurrent, saveAndEnableCertEvent, sslHelp, detectCertFromClipboard, openHttpsMode, ignoreHttpsModeEvent } from './useController'

const { sslInfo } = useSiteSSLStore()

const typeList = ['其他证书', "Let's Encrypt", '宝塔SSL', '商业证书'] // 证书类型列表
const sslTypeInfo = computed(() => {
	return sslInfo.value.type !== -1 ? typeList[sslInfo.value.type] : typeList[0]
})

const popupClose = inject('popupClose', () => {})

onMounted(initCurrent)

defineExpose({ init: initCurrent })
</script>

<style lang="css" scoped>
.ssl-status-info {
	@apply flex justify-between flex-1 py-[16px] px-[32px] bg-base;
	margin-bottom: 8px;
	border-radius: var(--el-border-radius-base);
	border: 1px solid var(--el-color-border-dark-tertiaryer);
}

.ssl-status-info .left > div,
.ssl-status-info .right > div {
	@apply flex items-center mb-[4px] h-[2rem] lining-[2rem];
}

.ssl-status-info .left div > span:first-child,
.ssl-status-info .right div > span:first-child {
	@apply font-bold text-medium text-small;
}
</style>
