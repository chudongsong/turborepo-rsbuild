<template>
	<div class="p-[2rem]">
		<bt-install-mask v-if="isLoginMask.value">
			<template #content>
				<div class="content-mask">
					<i class="text-warning !text-subtitleLarge svgtofont-el-warning mr-4px"></i>
					<span class="mr-8px">{{ isLoginMask.message }}</span>
				</div>
			</template>
		</bt-install-mask>
		<div class="text-center mb-[2rem]">
			<div class="flex items-center mb-[1.5rem] bg-dark p-[1.5rem] justify-center">
				<i class="svgtofont-left-wp !text-extraLarge text-tertiary mr-4px"></i>
				<span>您可以通过此页面安全访问WP-ADMIN</span>
			</div>
			<el-button @click="onPay" size="large" type="primary">
				<i class="svgtofont-icon-ltd !text-extraLarge text-ltd mr-4px"></i>
				免密码登录
			</el-button>
			<el-button style="margin-left: 2.4rem" size="large" @click="onLogin">
				<!-- <template #icon>
					<n-icon>
						<bt-icon name="wp-login" size="18"></bt-icon>
					</n-icon>
				</template> -->
				登录
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { onLogin, onPay } from '@/views/wordpress/view/local/useController'

const { localRow, isLoginMask } = storeToRefs(useWPLocalStore())
const { loginInit } = useWPLocalStore()

onMounted(() => {
	loginInit(localRow.value.id)
})
</script>

<style scoped></style>
