<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm, Message } from '@/hooks/tools'
import { FormSelect, FormInput, FormItemCustom, FormHelp } from '@form/form-item'
import { ElButton, ElAutocomplete } from 'element-plus'
import { isNil } from 'ramda'
import { testConnection, createQuerySearch } from '../useController'
import { getLabelByValue, compareVersions } from '../../useController'
import { useClbHttpStore } from '../useStore'
import { getNodeSites } from '@/api/node'
import { useNodeClbStore } from '../../useStore'
import { domainVerify, portVerify } from '@/utils'

const { addNodeData, httpRowData } = useClbHttpStore()
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
	value: item.value
})))
const domainList = ref<{ label: string; value: any; port: number }[]>([])
const loading = ref(false)
const createNewNode = ref('')

let addNodeDatas = ref({
		path: '/',
		weight: 1,
		max_fail: 5,
		fail_timeout: 10,
		ps: '',
		node_status: 'online',
})
const { BtForm, submit } = useForm({
	data: () => addNodeDatas.value,
	options: (formData: any) => {
		return computed(() => [
			FormSelect('负载均衡节点', 'node_id', nodeList.value, {
				attrs: {
					class: '!w-[38rem]', placeholder: '请选择负载均衡节点',
					onChange: async (val: any) => {
						loading.value = true
						domainList.value = []
						formData.value.node_site_name = ''
						try {
							const { data } = await getNodeSites({ node_id: val })
							if (data.msg && data.status === false) Message.error(data.msg)
							domainList.value = data.data.map((item: any) => ({ label: item.site_name, value: item.site_id, port: item.ports }))
						} catch (error) {
							console.log('error', error)
						} finally {
							loading.value = false
						}
					},
				},
				rules: [
					{ required: true, message: '请选择负载均衡节点' }
				]
			}),
			FormItemCustom('节点网站', () => (
				<ElAutocomplete
						v-model={formData.value.node_site_name}
						fetch-suggestions={createQuerySearch(domainList.value)}
						clearable
						class="inline-input !w-[38rem]"
						onSelect={(items: any) => {
							let ports: any = []
							createNewNode.value = items.value
							formData.value.node_site_id = items.value
							console.log('select_item', items.value, domainList.value)
							ports = domainList.value.find((item: any) => item.value === items.value)?.port
							console.log('ports', ports)
							formData.value.port = ports?.[1] ? ports[1] : ports?.[0] || 80
							return items.value
						}}
						value-key="label"
						placeholder="请输入或选择网站"
				/>
			), 'node_site_name', {
				rules: [
					{ required: true, message: '请输入或选择节点网站' }
				]
			}),
			FormInput('端口', 'port', {
				attrs: {
					class: '!w-[38rem]', 
					placeholder: '请输入端口',
				},
				rules: [
					portVerify({ message: '请输入端口' })
				]
			}),
			FormInput('验证路径', 'path', {
				attrs: { class: '!w-[38rem]', placeholder: '请输入验证路径' },
			}),
			FormSelect('节点算法', 'node_status', nodesStatusList.value, {
				attrs: { class: '!w-[38rem]', placeholder: '请输入或选择节点算法' },
				
			}),
			FormInput('权重', 'weight', {
				attrs: { class: '!w-[38rem]', placeholder: '请输入权重' },
			}),
			FormInput('阈值', 'max_fail', {
				attrs: { class: '!w-[38rem]', placeholder: '请输入最大失败次数' },
			}),
			FormInput('恢复时间（秒）', 'fail_timeout', {
				attrs: { class: '!w-[37.5rem]', placeholder: '请输入恢复时间（秒）' },
			}),
			FormInput('备注信息', 'ps', {
				attrs: { class: '!w-[38rem]', placeholder: '请输入备注' },
			}),
			FormItemCustom(
				'测试连接',
				() => {
					return (
						<ElButton type="primary" loading={testLinkStatus.value} onClick={() => testConnection(formData, domainList.value)}>测试连接</ElButton>
					)
				},
			),
			FormHelp('', [
				{
					content: '[节点算法]: 节点在负载均衡中的参与类型，参与：参与负载均衡，备用：无可用节点时启用，停用：停止使用的节点',
				},
				{
					content: '[权重] 当前节点在负载均衡中的节点负载权重，数值越大，使用率越高，请根据节点负载能力设置'
				},
				{
					content: '[阀值] 当负载节点访问故障次数超过指定阀值时，自动暂停此节点'
				},
				{
					content: '[恢复时间] 当负载节点因访问故障被自动暂停后，尝试自动恢复的间隔时间'
				},
				{
					content: '当后端节点返回的http状态码在错误状态码中时，该节点将会被视为处理失败'
				},
				{
					content: '当该节点在恢复时间内失败次数到达阈值后将会自动暂停访问该节点，并在间隔恢复时间时长后再次尝试使用该节点'
				}
			], {
				attrs: {
					class: '!mt-[1rem]'
				}
			})
		])
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		await validate()
		const node: any = nodeList.value.find((item: any) => item.value === param.value.node_id) || ''
		const isNewNode = domainList.value.some((item: any) => item.label === param.value.node_site_name)
		if (!isNewNode) delete param.value.node_site_id
		const { port } = param.value
		const newNode = {
			node_remarks: node.label.split('-')[0].trim(),
			...param.value,
			port: Number(port)
		}
		addNodeData.value.push(newNode)
		console.log('add',addNodeData.value)
		return true
	},
})
defineExpose({ onConfirm: submit })

onUnmounted(() => {
	testLinkStatus.value = false
	createNewNode.value = ''
})
</script>