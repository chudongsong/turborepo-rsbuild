<script lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormRadio, FormInput, FormButton } from '@/hooks/tools/form/form-item'
import { addProxyTcp, helpList } from '../useController'

export default defineComponent({
	name: 'AddProxyTcp',
	props: {
		compData: {
			type: Object,
			default: () => ({}),
		},
	},
	setup(props, { expose }) {
		const { BtForm, submit } = useForm({
			data: {
				isEdit: props.compData.isEdit || false,
				ps: props.compData.row?.ps || '',
				listen_port: props.compData.row?.listen_port || '',
				protocol: props.compData.row?.protocol || 'tcp',
				proxy_pass: props.compData.row?.proxy_pass || '',
			},
			options: (formData: any) =>
				computed(() => [
					FormRadio(
						'协议',
						'protocol',
						[
							{ label: 'TCP', value: 'tcp' },
							{ label: 'UDP', value: 'udp' },
							{ label: 'TCP/UDP', value: 'tcp/udp' },
						],
						{
							attrs: {
								disabled: props.compData.isEdit,
							},
						}
					),
					FormInput('代理端口', 'listen_port', {
						attrs: {
							placeholder: '请输入代理端口，例如：8764',
							width: '27rem',
							disabled: props.compData.isEdit,
						},
						rules: [
							{ required: true, message: '请输入代理端口', trigger: 'blur' },
							{
								trigger: ['blur'],
								validator: (rule: unknown, value: number, callback: any) => {
									const port = Number(value)
									if (Number.isNaN(port) || port < 0 || port > 65535) {
										callback(new Error('请输入正确的端口'))
									} else {
										callback()
									}
								},
							},
						],
					}),
					FormInput('代理地址', 'proxy_pass', {
						attrs: {
							placeholder: '请输入代理地址，例如：192.168.100.20:22',
							width: '27rem',
						},
						rules: [{ required: true, message: '请输入代理地址', trigger: 'blur' }],
					}),
					FormInput('备注', 'ps', {
						attrs: {
							placeholder: '请输入备注',
							width: '27rem',
						},
					}),
					...(props.compData.isEdit
						? [
								FormButton('保存', {
									attrs: {
										type: 'primary',
										class: '!ml-[10rem]',
										onClick: () => {
											submit()
										},
									},
								}),
						  ]
						: []),
				]),
			submit: addProxyTcp,
		})

		expose({
			onConfirm: async (emits: any) => {
				const res: boolean = await submit()
				if (res) emits('close')
			},
		})
		return () => <BtForm class="p-[2rem]" />
	},
})
</script>
