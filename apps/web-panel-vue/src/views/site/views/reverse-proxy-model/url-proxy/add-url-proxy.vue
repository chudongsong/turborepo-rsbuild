<template>
	<div class="p-[20px]">
		<el-form ref="proxyFormRef" :model="urlData" :rules="proxyFormRules" label-width="100px" v-bt-loading="formLoading" :disabled="formDisabled">
			<el-form-item label="代理目录" prop="path">
				<bt-input v-model="urlData.path" placeholder="请输入代理目录，例如：/web" width="42rem"> </bt-input>
			</el-form-item>
			<el-form-item label="目标" prop="proxysite">
				<div class="flex items-center">
					<el-form-item>
						<bt-select class="!w-[16rem]" v-model="urlData.targetType" placeholder="请选择" :options="targetOptions" @change="setTypeEvent"></bt-select>
					</el-form-item>

					<bt-input v-model="urlData.proxysite" :placeholder="urlData.targetType === 'http' ? '请输入目标地址' : '请选择sock文件'" class="!ml-[1rem]" width="24rem" :iconType="urlData.targetType === 'http' ? false : 'folder'" @folder="onPathChange" @input="handelInputTodo" >
					<template v-if="urlData.targetType !== 'http'" #append>
							<bt-button @click="onPathChange">
								<bt-icon icon="el-folder-opened" class="cursor-pointer" />
							</bt-button>
						</template>
					</bt-input>
				</div>
			</el-form-item>
			<el-form-item label="发送域名(host)" prop="todomain" label-width="100px">
				<el-popover placement="top-start" effect="dark" title="" content="请求转发到后端服务器时的主机名，一般为$http_host，如果目标URL是域名，则需要改为域名" width="400" v-model:visible="popoverFocus" :trigger-keys="[]" trigger="focus">
					<template #reference>
						<bt-input v-model="urlData.todomain" @focus="popoverFocus = true" placeholder="请输入发送域名" width="42rem" />
					</template>
				</el-popover>
			</el-form-item>
			<el-form-item label="备注">
				<bt-input v-model="urlData.ps" placeholder="请输入备注,可为空" width="42rem"></bt-input>
			</el-form-item>
			<!-- <el-form-item label=" ">
				<el-button>保存</el-button>
			</el-form-item> -->
		</el-form>
		<bt-help :options="addHelpList" class="mt-2rem ml-[20px]"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { addHelpList, targetOptions, urlData, popoverFocus, formLoading, formDisabled, proxyFormRef, proxyFormRules, setTypeEvent, onPathChange, handelInputTodo, onConfirmAdd as onConfirm } from './useController'

defineExpose({
	onConfirm,
})
</script>
