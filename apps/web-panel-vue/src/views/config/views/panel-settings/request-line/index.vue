<template>
	<config-rows :label="'面板云端请求线路'">
		<template #value>
			<bt-input v-model="line" disabled class="!w-[26rem]"></bt-input>
			<el-button type="primary" class="!ml-12px" @click="onSet">设置</el-button>
			<bt-dialog :title="'设置面板云端请求线路'" class="overflow-hidden" v-model="showPopup" :area="42" :show-footer="true" @confirm="onConfirm">
				<div class="p-20px">
					<el-form>
						<el-form-item :label="'云端请求线路'" label-width="12rem">
							<el-select v-model="select" placeholder="请选择" class="!w-[18rem]">
								<el-option v-for="item in options" :key="item.value" :label="item.title" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
					</el-form>
				</div>
			</bt-dialog>
		</template>
		<template #desc>
			<span>面板请求云端时，使用的请求线路，默认支持auto、ipv4、ipv6，请根据实际情况切换</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { setRequestIpType } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@/views/config/useStore'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
} = getConfigStore()

const showPopup = ref(false)
const select = ref('')

const options = ref([
	{ title: '自动', value: 'auto' },
	{ title: 'IPv4', value: 'ipv4' },
	{ title: 'IPv6', value: 'ipv6' },
])

const line = computed(() => {
	return options.value.filter(item => item.value === panelConfig.value.requestLine)[0]?.title || ''
})

const onSet = () => {
	showPopup.value = true
	select.value = panelConfig.value.requestLine
}

/**
 * @description: 设置云端请求节点
 */
const onConfirm = async () => {
	await useDataHandle({
		loading: '正在设置请求路线，请稍候...',
		request: setRequestIpType({ iptype: select.value }),
		message: true,
	})
	panelConfig.value.requestLine = select.value
	showPopup.value = false
}
</script>
