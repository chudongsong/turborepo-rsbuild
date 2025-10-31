<template>
	<div>
		<el-alert type="warning" class="!mb-[1.2rem] !p-[1.2rem]" :closable="false" show-icon>
			<template v-slot:title>
				<span class="text-base">
					<span> 提示：即将到期证书 {{ expiringCertificateCount }} 个，已过期证书 {{ expiredCertificateCount }} 个</span>
				</span>
			</template>
		</el-alert>
		<bt-tabs type="card" v-model="activeTabs" :options="tabComponent" />
	</div>
</template>

<script setup lang="tsx">
import { getSslStore } from '@ssl/useStore'
import SslCertificate from './ssl-certificate/index.vue'
import TestCertificate from './test-certificate/index.vue'
import EncryptCertificate from './encrypt-certificate/index.vue'
import OtherCertificate from './other-certificate/index.vue'
import { useCertificateStore } from './useStore'

const { activeTabs } = storeToRefs(useCertificateStore())
const {
	refs: { expiringCertificateCount, expiredCertificateCount },
} = getSslStore()

const tabComponent = ref([
	{
		label: '商用SSL',
		name: 'ssl',
		render: () => <SslCertificate></SslCertificate>,
	},
	// {
	// 	label: '测试证书',
	// 	name: 'test',
	// 	lazy: true,
	// 	render: () => <TestCertificate></TestCertificate>,
	// },
	{
		label: "Let's Encrypt",
		name: 'encrypt',
		lazy: true,
		render: () => <EncryptCertificate></EncryptCertificate>,
	},
	{
		label: '其他证书',
		name: 'other',
		lazy: true,
		render: () => <OtherCertificate></OtherCertificate>,
	},
])
</script>

<style lang="scss" scoped></style>
