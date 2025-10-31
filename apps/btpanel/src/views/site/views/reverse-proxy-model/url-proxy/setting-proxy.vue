<template>
	<div class="p-[20px]">
		<el-form ref="proxyFormRef" :model="setProxyData" :rules="setProxyFormRules" label-width="110px" v-bt-loading="formLoading" :disabled="formDisabled">
			<el-form-item label="代理目录" prop="path">
				<bt-input v-model="setProxyData.path" disabled placeholder="请输入代理目录" width="42rem"> </bt-input>
			</el-form-item>
			<el-form-item label="目标" prop="targetType">
				<el-select class="!w-[16rem]" v-model="setProxyData.targetType" placeholder="请选择">
					<el-option v-for="item in targetOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label=" " prop="proxysite">
				<bt-input v-model="setProxyData.proxysite" :placeholder="setProxyData.targetType !== 'http' ? '请选择sock文件' : '请输入目标URL'" width="42rem" @input="handelInputURL">
					<template v-if="setProxyData.targetType !== 'http'" #append>
						<bt-button @click="onSockChange">
							<bt-icon icon="el-folder-opened" class="cursor-pointer" />
						</bt-button>
					</template>
				</bt-input>
			</el-form-item>
			<el-form-item label="发送域名(host)" prop="todomain">
				<bt-input v-model="setProxyData.todomain" placeholder="请输入发送域名" width="42rem" />
			</el-form-item>
			<el-form-item label="备注">
				<bt-input v-model="setProxyData.ps" placeholder="请输入备注,可为空" width="42rem"></bt-input>
			</el-form-item>
			<el-form-item label="websocket支持">
				<el-tooltip :disabled="!globalWs" effect="dark" content="全局websocket已开启，不允许单独关闭" placement="top">
					<el-checkbox :disabled="globalWs" v-model="setProxyData.websocket"> </el-checkbox>
				</el-tooltip>
			</el-form-item>
			<el-form-item label="连接超时时间" prop="proxy_connect_timeout">
				<bt-input v-model="setProxyData.proxy_connect_timeout" textType="秒" width="41rem">
					<template #append> 秒 </template>
				</bt-input>
			</el-form-item>
			<el-form-item label="后端请求超时时间" prop="proxy_send_timeout">
				<bt-input v-model="setProxyData.proxy_send_timeout" textType="秒" width="41rem">
					<template #append> 秒 </template>
				</bt-input>
			</el-form-item>
			<el-form-item label="代理响应超时时间" prop="proxy_read_timeout">
				<bt-input v-model="setProxyData.proxy_read_timeout" textType="秒" width="41rem">
					<template #append> 秒 </template>
				</bt-input>
			</el-form-item>
			<el-form-item label=" ">
				<el-button type="primary" @click="onConfirm">保存</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { proxyData, globalWs, proxyFormRef, formDisabled, formLoading, setProxyFormRules, setProxyData, targetOptions, setInitValue, onConfirmProxy as onConfirm, onSockChange, handelInputURL } from './useController'

watch(
	() => proxyData.value,
	() => {
		setInitValue(proxyData.value)
	}
)

onMounted(() => {
	setInitValue(proxyData.value)
})
</script>
