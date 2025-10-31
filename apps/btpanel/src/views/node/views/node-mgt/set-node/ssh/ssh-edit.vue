<template>
	<div class="p-[2rem] node-ssh-edit-form">
		<BtForm />
	</div>
</template>

<script lang="tsx" setup>
import { useForm, useDataHandle, Message } from '@/hooks/tools';
import { FormInput, FormRadio, FormItemCustom, FormGroup } from '@/hooks/tools/form/form-item';
import { ElButton } from 'element-plus';
import { nodeSSHSet } from '@/api/node';
import { useNodeStore } from '@node/useStore'
import { portVerify } from '@/utils/rule';
import { onCancel } from '@/views/site/views/python-model/collaborative-service/useController';
const { setNodeSSHisSet, setNodeInfo, isRefreshNodeList, sshTerminalVisible } = useNodeStore();

interface Props {
	compData: {
		node_id: 0,
		server_ip: string,
		ssh_conf: {
			pkey_passwd?: string
			pkey?: string
		},
		callback?: () => void
	}
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		node_id: 0,
		server_ip: '',
		ssh_conf: {},
		callback: () => {}
	}),
})

const nodeSSHInfo = ref(props.compData || {});
const linkLoading = ref(false)
console.log('nodeSSHInfo', nodeSSHInfo.value);

const { BtForm, submit } = useForm({
	data: () => ({
		node_id: nodeSSHInfo.value.node_id || '',
		port: 22,
		password_type: 0,
		pkey: '',
		pkey_passwd: '',
		test_case: 1
	}),
	options: (formData: any) => {
		return computed(() => [
			FormInput('端口', 'port', {
				attrs: {
					placeholder: '请输入 SSH 端口',
					class: '!w-[8rem]',
				},
				rules: [
					portVerify()
				],
			}),
			FormRadio('认证方式', 'password_type', [
				{ label: '密码', value: 0 },
				{ label: '私钥', value: 1 },
			], {
				attrs: {
					onChange: (val: number) => {
						console.log('radio', val)
					}
				},
				rules: [
					{ required: true, message: '请选择认证方式', trigger: ['blur', 'change'] },
				],
			}),
			formData.value.password_type === 1 && FormItemCustom('私钥', () => (
				<div class="flex items-end w-full">
					<el-input
						v-model={formData.value.pkey}
						type="textarea"
						placeholder="请输入 SSH 私钥"
						class="!w-[320px]"
						rows={4}
					/>
					<el-button class="ml-[8px]" type="default" loading={linkLoading.value} onClick={() => testConnection(formData)}>测试连接</el-button>
				</div>
			), 'pkey', {
				rules: [
					{ required: true, message: 'SSH 私钥不能为空', trigger: ['blur', 'change'] },
				],
			}),
			formData.value.password_type === 1 && FormInput('私钥密码', 'pkey_passwd', {
				attrs: {
					type: 'password',
					'show-password': true,
					placeholder: '请输入 SSH 私钥密码',
					class: '!w-[320px]',
				},
			}),
			formData.value.password_type == 0 && FormItemCustom('密码', () => (
				<div class="flex items-center w-full">
					<el-input
						v-model={formData.value.password}
						type="password"
						show-password
						placeholder="请输入密码"
						class="!w-[320px]"
					/>
					<el-button class="ml-[8px]" type="default" loading={linkLoading.value} onClick={() => testConnection(formData)}>测试连接</el-button>
				</div>
			), 'password', {
				rules: [
					{ required: true, message: '密码不能为空', trigger: ['blur', 'change'] },
				],
			}),
		]);
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		const loading = Message.load('正在保存中，请稍后...')
		try {
			await validate() // 校验表单
			const params = { ...param.value }
			const { port, password, pkey, pkey_passwd } = params
			if (params.password_type == 0) {
				params.pkey_passwd = ''
				params.pkey = ''
			} else {
				params.password = ''
			}
			delete params.password_type
			params.test_case = 0
			const data = await nodeSSHSet(params)
			console.log(data)
			if (data.status) {
				setNodeInfo.value.ssh_conf = {
					host: nodeSSHInfo.value.server_ip,
					port: Number(port),
					password,
					pkey,
					pkey_passwd,
					username: "root"
				}
				console.log(params)
				setNodeSSHisSet.value = true
				isRefreshNodeList.value = true
				sshTerminalVisible.value = false
				Message.success('SSH 信息保存成功')
			} else {
				Message.error(data.msg || '保存失败')
			}
			return data.status
		} catch (error ) {
			console.error(error)
			return false
		} finally {
			loading?.close()
		}
	},
});
const testConnection = async (formData: any) => {
	try {
		linkLoading.value = true;
		const { node_id, port, password,pkey, pkey_passwd } = formData.value
		const params = {
			port: Number(port),
			password,
			pkey,
			pkey_passwd,
			node_id,
			test_case: 1
		}
		await useDataHandle({
			request: nodeSSHSet(params),
			message: true
		})
	} catch (error) {
		console.error('Connection test failed:', error);
	} finally {
		linkLoading.value = false;
	}
};

onUnmounted(() => {
	props.compData.callback?.()
})

defineExpose({
	onConfirm: submit,
});
</script>