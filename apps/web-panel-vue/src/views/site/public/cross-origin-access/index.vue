<template>
	<div class="w-full" v-loading="loading">
		<BtForm>
			<template #custom>
				<BtSettingDivider>
					<template #config>
						<el-form-item label-width="140px" label="允许跨域携带cookie" prop="allow_credentials">
							<el-switch v-model="crossOriginAccessParam.allow_credentials" />
							<el-popover placement="top-start" width="auto" trigger="hover" popper-class="green-tips-popover !p-0 !border-none">
								<template #reference>
									<span class="ml-[8px] bt-ico-ask">?</span>
								</template>
								<div class="!p-[12px] bg-primary text-white leading-[2.4rem]">
									Access-Control-Allow-Credentials 允许/拒绝浏览器发送凭据（如Cookie）。
									<br />
									设为 true 时，请求携带的凭据将被服务器接受，但需同时指定具体源（不能使用 *）。
								</div>
							</el-popover>
						</el-form-item>
						<el-form-item label-width="140px" label="允许跨域的请求方法" prop="allowed_methods">
							<el-popover placement="top-start" width="auto" trigger="click" popper-class="green-tips-popover !p-0 !border-none">
								<template #reference>
									<el-input type="textarea" :rows="4" class="!w-[32rem]" v-model="crossOriginAccessParam.allowed_methods" placeholder="允许跨域的请求方法，例如: GET, POST" />
								</template>
								<div class="!p-[12px] bg-primary text-white leading-[2.4rem]">
									Access-Control-Allow-Methods 指定允许的HTTP方法（如 GET, POST, OPTIONS），
									<br />
									用于预检请求（OPTIONS）时告知客户端可支持的方法列表。
								</div>
							</el-popover>
						</el-form-item>
						<el-form-item label-width="140px" label="允许跨域携带的请求头" prop="allowed_headers">
							<el-popover placement="top-start" width="auto" trigger="click" popper-class="green-tips-popover !p-0 !border-none">
								<template #reference>
									<el-input type="textarea" :rows="4" class="!w-[32rem]" v-model="crossOriginAccessParam.allowed_headers" placeholder="允许跨域携带的请求头" />
								</template>
								<div class="!p-[12px] bg-primary text-white leading-[2.4rem]">
									Access-Control-Allow-Headers 在预检请求中定义允许携带的自定义请求头（如 Content-Type），
									<br />
									告知客户端哪些头可安全用于实际请求。
								</div>
							</el-popover>
						</el-form-item>
						<el-form-item label-width="140px" label="允许浏览器访问的响应头" prop="exposed_headers">
							<el-popover placement="top-start" width="auto" trigger="click" popper-class="green-tips-popover !p-0 !border-none">
								<template #reference>
									<el-input type="textarea" :rows="4" class="!w-[32rem]" v-model="crossOriginAccessParam.exposed_headers" placeholder="允许跨域浏览器访问的响应头" />
								</template>
								<div class="!p-[12px] bg-primary text-white leading-[2.4rem]">
									Access-Control-Expose-Headers 暴露给浏览器脚本的响应头列表，
									<br />
									客户端只能访问在此列表中声明的头（如 Content-Range）。
								</div>
							</el-popover>
						</el-form-item>
					</template>
				</BtSettingDivider>
			</template>
		</BtForm>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormItemCustom, FormCustom } from '@/hooks/tools/form/form-item'
import { useCrossOriginAccessStore, CROSS_ORIGIN_ACCESS_STORE } from './useStore'
import type { FormItemProps } from '@/hooks/tools/form/types'
import { useSiteStore } from '@site/useStore'
import { getCrossOriginAccessData, submitCrossOriginAccessData } from './useController'

const { siteInfo } = useSiteStore()

const { formData } = useCrossOriginAccessStore()

const loading = ref(false)
const { reset: resetCrossOriginAccess } = CROSS_ORIGIN_ACCESS_STORE()

const {
	BtForm,
	submit,
	param: crossOriginAccessParam,
	ref: fromRef,
} = useForm({
	data: () => formData.value,
	options: formDataRef => {
		return computed(
			() =>
				[
					FormItemCustom(
						'状态',
						() => (
							<div class="flex items-center">
								<el-switch
									v-model={formDataRef.value.status}
									onChange={(val: boolean) => {
										if (!val) {
											// 状态关闭时，清除校验错误
											fromRef.value?.clearValidate(['allowed_origin'])
										}
									}}
								/>
								{formDataRef?.value.status ? <span class="ml-[2rem] text-small text-[#606266]">当允许行跨域访问</span> : null}
							</div>
						),
						'status',
						{
							labelWidth: '140px',
						}
					),
					...(formDataRef?.value.status
						? [
								FormItemCustom(
									'允许访问的域名',
									() => (
										<div class="flex items-center w-full">
											<div>
												<el-popover
													placement="top-start"
													width="auto"
													trigger="click"
													popper-class="green-tips-popover !p-0 !border-none"
													v-slots={{
														default: () => (
															<div class="!p-[12px] bg-primary text-white leading-[2.4rem]">
																使用*代表所有域名都可以跨域访问
																<br />
																多个域名用 , 分隔
															</div>
														),
														reference: () => <el-input type="textarea" rows={4} class="!w-[32rem]" placeholder="使用*代表所有域名都可以跨域访问，多个域名用,分隔" v-model={formDataRef.value.allowed_origin} />,
													}}></el-popover>
											</div>
										</div>
									),
									'allowed_origin',
									{
										rules: [
											{
												required: true,
												message: '请输入允许访问的域名',
												trigger: 'blur',
												validator: (rule: any, value: string, callback: (error?: Error) => void) => {
													if (!formDataRef?.value?.status) {
														callback()
														return
													}
													if (!value) {
														callback(new Error('请输入允许访问的域名'))
														return
													}
													callback()
												},
											},
										],
										labelWidth: '140px',
									}
								),
								{
									type: 'slots',
									key: 'custom',
								},
						  ]
						: []),
					FormItemCustom(' ', () => (
						<div class="flex items-center w-full ml-[6rem]">
							<el-button type="primary" onClick={() => submit()}>
								保存
							</el-button>
						</div>
					)),
				] as FormItemProps[]
		)
	},
	// 提交处理
	submit: async (formData, validate) => {
		try {
			await validate()
			submitCrossOriginAccessData(formData.value)
			// 发送API请求
			return true
		} catch (error) {
			return false
		}
	},
})

onMounted(async () => {
	resetCrossOriginAccess()
	loading.value = true
	await getCrossOriginAccessData({
		siteName: siteInfo.value.name,
		project_type: siteInfo.value.project_type,
	})
	loading.value = false
})
</script>

<style scoped lang="scss"></style>
