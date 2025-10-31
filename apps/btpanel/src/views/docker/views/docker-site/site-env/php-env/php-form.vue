<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>
<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
// import { getRandomChart, getRandomPwd } from '@/utils';
// import { addAndEditFtp, getAddEditFtpParamTools } from '@ftp/useController';
import { FormInput, FormSelect, FormItemCustom } from '@form/form-item'
import { ElAutocomplete, ElSelect, ElOption } from 'element-plus'
// import { useFtpStore } from '@ftp/useStore';
import { getFormData, formData, setSupport, createPhpEnv, extsFilterMethod } from './useController'
import { DOCKER_SITE_ENV_PHP_STORE } from './useStore'

// const { isRefreshFtpList } = useFtpStore();

const store = DOCKER_SITE_ENV_PHP_STORE()
const { versionOptions, extendOptions, templateOptions, extendsupOptions, isEdit } = storeToRefs(store)
const popupClose = inject('popupClose', () => {})
const extRef = ref()

// 表单实体
const {
	BtForm,
	submit,
	param: dataRef,
} = useForm({
	data: formData,
	options: (formDataRef: any) => {
		return computed(() => [
			FormInput('名称', 'name', {
				attrs: { class: '!w-[320px]', placeholder: '请输入环境名称', disabled: isEdit.value },
				rules: [{ required: true, message: '请输入环境名称', trigger: 'blur' }],
			}),
			FormSelect('版本', 'version', versionOptions.value, {
				attrs: {
					class: '!w-[22rem]',
					disabled: isEdit.value,
					onChange: (val: any) => {
						setSupport(val)
					},
				},
				rules: [{ required: true, message: '请选择PHP版本', trigger: 'change' }],
			}),
			FormItemCustom(
				'PHP扩展源',
				() => {
					return (
						<ElAutocomplete
							v-model={formDataRef.value.repo_url}
							class="!w-[32rem]"
							placeholder="请选择或输入PHP扩展源"
							fetch-suggestions={(queryString: string, cb: any) => {
								cb(extendOptions.value)
							}}
							popper-class="my-extautocomplete">
							{{
								default: ({ item }: { item: any }) => {
									return (
										<div class={item.value === formDataRef.value.repo_url ? 'bg-light flex items-center justify-between px-[2rem]' : 'flex items-center justify-between px-[2rem]'}>
											<div class={item.value === formDataRef.value.repo_url ? 'bt-link w-[38rem] truncate' : 'w-[38rem] truncate'}>{item.value + `(${item.label})`}</div>
										</div>
									)
								},
							}}
						</ElAutocomplete>
					)
				},
				'repo_url',
				{
					attrs: { class: '!w-[22rem]' },
					rules: [{ required: true, message: '请输入或选择PHP扩展源', trigger: 'change' }],
				}
			),
			...(isEdit.value
				? []
				: [
						FormSelect('扩展模板', 'template', templateOptions.value, {
							attrs: {
								class: '!w-[22rem]',
								onChange: (val: string) => {
									const item: any = templateOptions.value.find((item: any) => item.value === val)
									if (item) {
										formDataRef.value.exts = item.ext.split(',')
									}
								},
							},
							rules: [{ required: false, message: '请选择PHP扩展模板', trigger: 'change' }],
						}),
				  ]),
			FormItemCustom(
				'扩展',
				() => (
					<ElSelect
						ref={(ref: any) => (extRef.value = ref)}
						class="!w-[32rem]"
						v-model={formDataRef.value.exts}
						filterable={true}
						multiple={true}
						collapse-tags={true}
						collapse-tags-tooltip={true}
						reserve-keyword={false}
						placeholder="请选择扩展，可多选(可粘贴识别多个扩展，用,分隔)"
						filter-method={(query: string) => extsFilterMethod(query, extendsupOptions, formDataRef.value.version, dataRef, extRef)}>
						{extendsupOptions.value.map((item: any) => {
							return <ElOption key={item.value} label={item.label} value={item.value} />
						})}
					</ElSelect>
				),
				'exts',
				{
					rules: [{ required: true, message: '请选择扩展，可多选(可粘贴识别多个扩展，用,分隔)', trigger: 'change' }],
				}
			),
		])
	},
	submit: async (param: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		createPhpEnv(param.value, popupClose)
	},
})

// import { FTP_ADD_USER } from './store';
// import { storeToRefs } from 'pinia';

// const store = FTP_ADD_USER();

onMounted(() => {
	getFormData(dataRef)
})

// onUnmounted(() => {
// 	store.$reset(); // 重置数据
// });

defineExpose({ onConfirm: submit })
</script>
<style lang="scss">
.my-extautocomplete li {
	padding: 0 0 !important;
}
</style>
