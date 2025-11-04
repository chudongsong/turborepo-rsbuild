<template>
	<div class="p-2rem">
		<div class="text-subtitleLarge text-center mb-[1.5rem]"><i></i>检测到授权冲突</div>
		<div class="text-base unbind-author-content">
			<p>
				当前面板已绑定【<span :class="authType + '-author-name'">{{ typeName }}</span
				>】，若要购买/更换其他授权，请先解绑当前授权。
			</p>
			<p>专业版/企业版每月允许免费更改服务器IP(解绑授权)一次，超过限制次数后请手动购买解绑次数。</p>
		</div>
		<el-button type="primary" class="w-full h-4rem text-base mb-[2rem] mt-1rem" :disabled="isDisabledAuth" @click="changeUnbindAuthor()">
			<template v-if="isDisabledAuth">
				<span>正在解绑授权，请稍候...</span>
			</template>
			<template v-else>
				{{ extra.rest_unbind_count ? `解绑授权，剩余次数${extra.rest_unbind_count}次` : `点击前往购买解绑次数` }}
			</template>
		</el-button>
	</div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import PRODUCT_PAYMENT_STORE from '../store'

const store = PRODUCT_PAYMENT_STORE()
const { isDisabledAuth, authType, bindAuthData } = storeToRefs(store)
const { changeUnbindAuthor } = store

const { extra, typeName } = bindAuthData.value
</script>

<style lang="css" scoped>
.unbind-author-content {
	line-height: 3rem;
}

.ltd-author-name {
	color: var(--bt-ltd-color);
}

.pro-author-name {
	color: var(--el-color-warning);
}
</style>
