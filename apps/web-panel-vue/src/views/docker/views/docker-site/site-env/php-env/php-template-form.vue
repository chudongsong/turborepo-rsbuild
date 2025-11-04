<template>
	<div class="p-[2rem]">
		<BtForm />
		<bt-help :options="lsit" class="mt-[1rem]" />
	</div>
</template>
<script lang="tsx" setup>
import { useForm } from '@/hooks/tools';
import { FormInput, FormSelect,FormItemCustom } from '@form/form-item';
import { ElSelect,ElOption } from 'element-plus';
import { getTemplateFormData,templateFormData,setSupport,createPhpTemplate,extsFilterMethod } from './useController';
import { DOCKER_SITE_ENV_PHP_STORE } from './useStore';

const store = DOCKER_SITE_ENV_PHP_STORE();
const { versionOptions,extendsupOptions,isEdit } = storeToRefs(store);
const popupClose = inject('popupClose', () => {});
const lsit = [{
	content: '扩展支持多选，请选择合适使用的扩展'
},{
	content: '不建议选择项目用不上的扩展，构建慢且浪费空间'
}]
const extRef = ref();

// 表单实体
const { BtForm, submit,param:dataRef } = useForm({
	data: templateFormData,
	options: (formDataRef:any) => {
		return computed(()=> [
			FormInput('名称', 'name', {
				attrs: { class: '!w-[320px]', placeholder: '请输入环境名称', disabled: isEdit.value },
				rules: [{ required: true, message: '请输入环境名称', trigger: 'blur' }],
			}),
				FormSelect(
					'版本',
					'version',
					versionOptions.value,
					{
						attrs: { class: '!w-[22rem]', disabled: isEdit.value,onChange:(val:any)=>{
							setSupport(val)
						} },
						rules: [{ required: true, message: '请选择PHP版本', trigger: 'change' }]
					}
				),
				FormItemCustom(
					'扩展',
					()=>(
							<ElSelect
								ref={(ref:any)=>extRef.value = ref}
								class="!w-[32rem]"
								v-model={formDataRef.value.exts}
								filterable={true}
								multiple={true}
								collapse-tags={true}
								collapse-tags-tooltip={true}
								reserve-keyword={false}
								placeholder="请选择扩展，可多选(可粘贴识别多个扩展，用,分隔)"
								filter-method={(query:string)=>extsFilterMethod(query,extendsupOptions,formDataRef.value.version,dataRef,extRef)}
							>
							{
								extendsupOptions.value.map((item:any)=>{
									return (
										<ElOption
											key={item.value}
											label={item.label}
											value={item.value}
										/>
									)
								})
							}
							</ElSelect>
					),
					'exts',
					{
						rules: [{ required: true, message: '请选择扩展，可多选(可粘贴识别多个扩展，用,分隔)', trigger: 'change' }]
					}
				),
		]);
	},
	submit: async (param: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		createPhpTemplate(param.value,popupClose);
	},
});


onMounted(() => {
	getTemplateFormData(dataRef);
});


defineExpose({ onConfirm: submit });
</script>
<style lang="scss">
.my-extautocomplete li {
	padding: 0 0 !important;
}
</style>