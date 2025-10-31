<template>
	<div>
		<BtTabs type="card" v-model="tabActive" />
		<bt-help v-if="['encryptedAccess', 'forbidAccess'].includes(tabActive)" :options="tabActive === 'encryptedAccess' ? passHelpList : forbidHelpList" class="ml-[20px] mt-[20px]"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools'
import CertBind from '@site/views/php-model/access-restriction/cert-authentication/index.vue'
import LimitAccessComponent from '@site/views/php-model/access-restriction/limit-access-component/index.vue'
import { useGlobalStore } from '@/store/global'
const { enterpriseRec } = useGlobalStore()
const tabActive = ref('encryptedAccess')

const { BtTabs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		{
			label: '加密访问',
			lazy: true,
			name: 'encryptedAccess',
			render: <LimitAccessComponent tabActive="encryptedAccess" />,
		},
		{
			label: '禁止访问',
			lazy: true,
			name: 'forbidAccess',
			render: <LimitAccessComponent tabActive="forbidAccess" />,
		},
		...(enterpriseRec.value
			? [
					{
						label: () => (
							<span
								v-html={`<span class="inline-flex items-center">
								<i
									class="svgtofont-icon-ltd text-medium text-ltd mr-[4px] inline-flex"></i>
								双向认证 <span class="text-warning">【推荐】</span></span
							>`}></span>
						),
						lazy: true,
						name: 'addBatch',
						render: <CertBind />,
					},
			  ]
			: []),
	],
})

const passHelpList = ref([
	{
		content: '目录设置加密访问后，访问时需要输入账号密码才能访问',
	},
	{
		content: '例如我设置了加密访问 /test/ ,那我访问 http://aaa.com/test/ 时就要输入账号密码才能访问',
	},
]) // 帮助列表

const forbidHelpList = ref([
	{
		content: '后缀：禁止访问的文件后缀',
	},
	{
		content: '目录：规则会在这个目录内生效',
	},
]) // 帮助列表
</script>

<style lang="css" scoped>
:deep(.el-tabs__nav) {
	display: flex;
	align-items: center;
	@apply flex items-center;
}
</style>
