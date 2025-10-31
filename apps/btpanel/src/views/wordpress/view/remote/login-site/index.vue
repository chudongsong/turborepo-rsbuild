<template>
	<div class="p-[2rem]">
		<div class="text-center mb-[2rem]">
			<div class="flex items-center mb-[1.5rem] bg-dark p-[1.5rem] justify-center">
				<i class="svgtofont-left-wp !text-extraLarge text-tertiary mr-4px"></i>
				<span>您可以通过此页面安全访问WP-ADMIN</span>
			</div>
			<el-button @click="onPay(compData.id)" size="large" type="primary">
				<i class="svgtofont-icon-ltd !text-extraLarge text-ltd mr-4px"></i>
				免密码登录
			</el-button>
			<el-button style="margin-left: 2.4rem" size="large" @click="onLogin(compData.login_url)">
				<!-- <template #icon>
					<n-icon>
						<bt-icon name="wp-login" size="18"></bt-icon>
					</n-icon>
				</template> -->
				登录
			</el-button>
		</div>
		<bt-help class="ml-[2rem]"> 提示：此功能在有限的时间内免费 </bt-help>
	</div>
</template>

<script setup lang="ts">
import { onPay, onLogin } from '@/views/wordpress/view/remote/form-controller'

interface Pros {
	compData: any
}

const props = defineProps<Pros>()
</script>

<style scoped></style>
