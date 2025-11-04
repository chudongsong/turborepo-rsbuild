<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormSelect, FormInput, FormItemCustom, FormHelp } from '@form/form-item'
import { ElButton } from 'element-plus'
import { testTcpudpConnection } from '../useController'
import { getLabelByValue, compareVersions } from '../../useController'
import { useNodeClbStore } from '../../useStore'
import { useClbTcpudpStore } from '../useStore'
import { portVerify } from '@/utils'

const { addTcpudpNodeData } = useClbTcpudpStore()
const { nodesStatusList, testLinkStatus } = useNodeClbStore()

interface Props {
	compData: {
		nodes: any[]
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		nodes: []
	}),
})

const nodeList = ref(props.compData.nodes.map((item: any) => ({
	label: `${item.label} - ${item.server_ip} (${item.version == ''? '本机地址' : item.version} ${compareVersions(item.version, '9.7.0') < 0 && '版本较低无法显示站点' || ''})`,
	value: item.value,
	server_ip: item.server_ip
})))
const host = ref('')

const { BtForm, submit } = useForm({
	data: () => ({
		port: 80,
		node_status: 'online',
		weight: 1,
		max_fail: 3,
		fail_timeout: 600,
		ps: '',
	}),
	options: (formData: any) => {
		return computed(() => [
			FormSelect('负载均衡节点', 'node_id', nodeList.value, {
				attrs: {
					class: '!w-[40rem]', placeholder: '请选择负载均衡节点', onChange: (val: any) => { 
						host.value = nodeList.value.find(item => item.value === val)?.server_ip || ''
					}
				},
				rules: [
					{ required: true, message: '负载均衡节点不能为空' }
				],
			}),
			FormInput('端口', 'port', {
				attrs: { class: '!w-[40rem]', placeholder: '请输入端口' },
				rules: [
					portVerify({ message: '请输入端口' })
				],
			}),
			FormSelect('节点状态', 'node_status', nodesStatusList.value, {
				attrs: { class: '!w-[40rem]', defaultValue: 'online' },
			}),
			FormInput('权重', 'weight', {
				attrs: { class: '!w-[40rem]', placeholder: '请输入权重' },
			}),
			FormInput('阈值', 'max_fail', {
				attrs: { class: '!w-[40rem]', placeholder: '请输入阈值' },
			}),
			FormInput('恢复时间（秒）', 'fail_timeout', {
				attrs: { class: '!w-[39.5rem]', placeholder: '请输入恢复时间（秒）' },
			}),
			FormInput('备注', 'ps', {
				attrs: { class: '!w-[40rem]', placeholder: '请输入备注' },
			}),
			FormItemCustom(
				'测试连接',
				() => {
					return (
						<ElButton type="primary" loading={testLinkStatus.value} onClick={() => testTcpudpConnection({...formData.value, host: host.value})}>测试连接</ElButton>
					)
				},
			),
			FormHelp('', [
				{
					content: '备份状态: 指当其它节点都无法使用时才会使用此节点',
				},
				{
					content: '参与状态: 正常参与负载均衡,请至少添加1个普通节点'
				},
				{
					content: 'IP地址: 仅支持IP地址,否则无法正常参与负载均衡'
				},
				{
					content: '阈值: 在恢复时间的时间段内，如果Nginx与节点通信尝试失败的次数达到此值，Nginx就认为服务器不可用'
				},
			], {
				attrs: {
					class: '!mt-[1rem]'
				}
			})
		])
	},
	submit: async (params: any, validate: any, ref: Ref<any>) => {
		await validate()
		const nodeServerIp = nodeList.value.find(item => item.value === params.value.node_id)?.server_ip
		const { port } = params.value
		const newNode = {
			...params.value,
			port: Number(port),
			host: nodeServerIp
		}
		addTcpudpNodeData.value = [...addTcpudpNodeData.value, newNode]
		return true
	},
})
defineExpose({ onConfirm: submit })

onUnmounted(() => {
	testLinkStatus.value = false
})
</script>