<template>
	<div>
		<!-- 证书信息 -->
		<el-alert v-if="menuData?.row.ssl_status" class="mb-16px" type="success" :show-icon="false">
			<div class="cert-info">
				<span class="cert-label">品牌: </span>
				<span class="cert-value">{{ menuData?.row.ssl_info.issuer }}</span>
			</div>
			<div class="cert-info">
				<span class="cert-label">认证域名: </span>
				<span class="cert-value">{{ domains }}</span>
			</div>
		</el-alert>
		<!-- 证书内容 -->
		<div class="mb-16px flex justify-between gap-[10px]">
			<div class="w-48%">
				<div class="mb-8px">密钥(KEY)</div>
				<bt-input type="textarea" class="!w-full" v-model="keys" :rows="14"></bt-input>
			</div>
			<div class="w-48%">
				<div class="mb-8px">证书(CRT/PEM格式)</div>
				<bt-input type="textarea" class="!w-full" v-model="crt" :rows="14"></bt-input>
			</div>
		</div>
		<!-- 操作 -->
		<div class="mb-12px flex">
			<!-- 保存 -->
			<el-button type="primary" @click="onSave(popupClose)"> 保存 </el-button>
			<!-- 删除 -->
			<el-button @click="onDel(popupClose)"> 关闭 </el-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import MAIL_DOMAIN_SSL from '@mail/views/domain/ssl/store'
import { storeToRefs } from 'pinia'

const { keys, crt, domains, menuData } = storeToRefs(MAIL_DOMAIN_SSL())
const { onSave, onDel } = MAIL_DOMAIN_SSL()
const popupClose = inject<any>('popupClose') // 弹窗关闭
</script>

<style lang="css" scoped>
.cert-info {
	color: var(--el-color-success-dark-2);
}
.cert-info + .cert-info {
	margin-top: 2px;
}
.cert-label {
	font-weight: bold;
}
.cert-value {
	flex: 1;
	width: 0;
}
</style>
