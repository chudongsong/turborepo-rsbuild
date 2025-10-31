import BtFormItem from '@/components/form/bt-form-item'
import { ElInput, ElTooltip, FormItemProps } from 'element-plus'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { FormInput, FormSwitch } from '@/hooks/tools/form/form-item'
import { useDataHandle } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { cloneWpSite } from '@/api/wp'
import { productPaymentDialog } from '@/public'

const { payment } = useGlobalStore()
const { localRow, cloneLocalForm, isRefreshLocalList } = storeToRefs(useWPLocalStore())

export const getCloneFormOption = (): ComputedRef<FormItemProps[]> => {
	return computed(() => {
		const getCreateSubDomainFormOption = {
			type: 'custom',
			key: 'subDomain',
			render: () => (
				<BtFormItem label={' '} prop={'subDomain'}>
					<ElInput style={'min-width: 220px; max-width: 300px'} v-model={cloneLocalForm.value.subDomain}>
						{{
							append: () => <span>.{localRow.value.name}</span>,
						}}
					</ElInput>
					<ElInput style={'width: 120px'} class={'ml-[1rem]'} v-model={cloneLocalForm.value.subPath} placeholder={'克隆路径'}>
						{{
							prepend: () => <span>/</span>,
						}}
					</ElInput>
					<ElTooltip content="空克隆路径意味着克隆在根目录中" placement="top">
						<span class="svgtofont-el-warning !text-extraLarge ml-[1rem] !text-warning"></span>
					</ElTooltip>
				</BtFormItem>
			),
			rules: {
				subDomain: [{ required: true, message: '请输入子域名', trigger: 'blur' }],
			},
		}

		const getCreateDomainFormOption = {
			type: 'custom',
			render: () => (
				<BtFormItem label={' '} prop={'newDomain'}>
					<ElInput style={'width: 200px'} v-model={cloneLocalForm.value.newDomain} placeholder="新域名"></ElInput>
					<ElInput style={'width: 120px'} class={'ml-[1rem]'} v-model={cloneLocalForm.value.newPath} placeholder={'克隆路径'}>
						{{
							prepend: () => <span>/</span>,
						}}
					</ElInput>
					<ElTooltip content="空克隆路径意味着克隆在根目录中" placement="top">
						<span class="svgtofont-el-warning !text-extraLarge ml-[1rem] !text-warning"></span>
					</ElTooltip>
				</BtFormItem>
			),
			rules: {
				newDomain: [{ required: true, message: '请输入新的域名', trigger: 'blur' }],
			},
		}

		return [
			{
				type: 'custom',
				render: () => (
					<BtFormItem label={'来源站点'}>
						<span>{localRow.value.name}</span>
					</BtFormItem>
				),
			},
			{
				label: '目标站点',
				key: 'method',
				type: 'radio:button',
				options: [
					{ label: '创建子域名', value: 1 },
					{ label: '创建新域名', value: 2 },
				],
			},
			cloneLocalForm.value.method === 1 ? getCreateSubDomainFormOption : getCreateDomainFormOption,
			FormSwitch('FastCGI缓存', 'cache_status', { attrs: { class: '!w-[100px]' } }),
		] as FormItemProps[]
	})
}

const getParams = () => {
	const domain = cloneLocalForm.value.method === 1 ? `${cloneLocalForm.value.subDomain}.${localRow.value.name}` : cloneLocalForm.value.newDomain
	return {
		domain,
		s_id: localRow.value.id,
		sub_path: cloneLocalForm.value.method === 1 ? cloneLocalForm.value.subPath : cloneLocalForm.value.newPath,
		enable_cache: cloneLocalForm.value.cache_status ? 1 : 0,
	}
}

export const onCloneConfirm = async (close: () => void) => {
	if (payment.value.authType !== 'ltd') {
		// 开通企业版付费
		productPaymentDialog({
			disablePro: true,
			sourceId: 335,
		})
		return
	}
	useDataHandle({
		loading: '正在克隆站点...',
		request: cloneWpSite(getParams()),
		message: true,
		success: (data: any) => {
			if (data.status) {
				close()
				isRefreshLocalList.value = true
			}
		},
	})
}
