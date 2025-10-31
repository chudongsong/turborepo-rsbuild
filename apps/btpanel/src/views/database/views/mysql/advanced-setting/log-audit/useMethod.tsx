import { FormCustom } from '@form/form-item';
import { DATABASE_MYSQL_ADVANCED_AUDIT_STORE } from './useStore';

import { ElSelect,ElOption } from 'element-plus';
import BtFormItem from '@/components/form/bt-form-item'


const store = DATABASE_MYSQL_ADVANCED_AUDIT_STORE();
const { auditAdvFormData,userOptions,databaseOptions,orderOptions,loading } = storeToRefs(store);
const {extsFilterMethod} = store
// 表单ref
export const refObj = {
	includeUser: null as null | Component<typeof ElSelect>,
	includeOrder: null as null | Component<typeof ElSelect>,
	includeDatabase: null as null | Component<typeof ElSelect>,
	excludeUser: null as null | Component<typeof ElSelect>,
	excludeOrder: null as null | Component<typeof ElSelect>,
	excludeDatabase: null as null | Component<typeof ElSelect>,
}

// 抽取表单配置项生成逻辑
export const createFormSelectItem = (
	label: string,
	placeholder: string,
	refKey: keyof typeof refObj,
	formDataKey: 
		'audit_log_exclude_accounts'|
		'audit_log_exclude_databases'|
		'audit_log_exclude_commands'|
		'audit_log_include_accounts'|
		'audit_log_include_databases'|
		'audit_log_include_commands'
	,
	optionsKey: 'userOptions' | 'orderOptions' | 'databaseOptions',
) => {
	return FormCustom(() => {
		return (
			<BtFormItem label={label}>
				{{
					default: () => (
						<div class="flex items-center">
							<ElSelect
								ref={(ref) => {
									refObj[refKey] = ref;
								}}
								v-model={auditAdvFormData.value[formDataKey]}
								placeholder={placeholder}
								style="width: 280px"
								loading={loading.value[refKey.replace('include', '').replace('exclude', '').toLowerCase()]}
								filter-method={(query: string) =>
									extsFilterMethod(
										refKey.replace('include', '').replace('exclude', '').toLowerCase(),
										query,
										{userOptions,databaseOptions,orderOptions}[optionsKey],
										(newVal: string[]) => {
											auditAdvFormData.value[formDataKey] = newVal;
										},
										refObj[refKey]
									)
								}
								filterable
								multiple
								collapse-tags
								collapse-tags-tooltip
								reserve-keyword={false}
							>
								{{userOptions,databaseOptions,orderOptions}[optionsKey].value?.map(
									(item: { label: string; value: string }) => (
										<ElOption key={item.value} label={item.label} value={item.value} />
									)
								)}
							</ElSelect>
						</div>
					),
				}}
			</BtFormItem>
		);
	});
}