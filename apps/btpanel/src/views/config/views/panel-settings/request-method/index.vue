<template>
	<config-rows :label="'面板云端请求方式'">
		<template #value>
			<bt-input v-model="method" disabled class="!w-[26rem]"></bt-input>
			<el-button type="primary" class="!ml-12px" @click="onSet">设置</el-button>
			<bt-dialog :title="'设置面板云端请求方式'" class="overflow-hidden" v-model="showPopup" :area="42" :show-footer="true" @confirm="onConfirm">
				<div class="p-20px">
					<el-form label-width="80px">
						<el-form-item :label="'云端请求方式'" label-width="12rem">
							<el-select v-model="select" :placeholder="'请选择'" class="!w-[18rem]">
								<el-option v-for="item in options" :key="item.value" :label="item.title" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
					</el-form>
				</div>
			</bt-dialog>
		</template>
		<template #desc>
			<span>面板请求云端时，使用的请求方式，默认支持python、curl、php，请根据实际情况切换</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { setRequestType } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@/views/config/useStore'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
} = getConfigStore()

const method = computed(() => {
	return options.value.filter(item => item.value === panelConfig.value.requestType)[0]?.title || ''
})

const showPopup = ref(false)

const onSet = () => {
	showPopup.value = true
	select.value = panelConfig.value.requestType
}

const select = ref('')

const options = ref([
	{ title: 'Python', value: 'python' },
	{ title: 'Curl', value: 'curl' },
	{ title: 'PHP', value: 'php' },
])

/**
 * @description: 设置云端请求节点
 */
const onConfirm = async () => {
	await useDataHandle({
		loading: '正在设置请求路线，请稍候...',
		request: setRequestType({ http_type: select.value }),
		message: true,
	})
	panelConfig.value.requestType = select.value
	showPopup.value = false
}
</script>
