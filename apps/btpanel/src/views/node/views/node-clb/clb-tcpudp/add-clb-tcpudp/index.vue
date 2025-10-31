<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { tcpudpRenderForm, addTcpudpNode } from '../useController'
import { FormInput, FormRadio, FormCustom } from '@form/form-item'
import { ElButton, ElTable, ElTableColumn, ElSelect, ElOption } from 'element-plus'
import { defaultVerify, portVerify } from '@/utils/rule'
import { useClbTcpudpStore } from '../useStore'
import { createWebSocketWithResult } from '../../useController'
import { deepClone } from '@/utils/data'
import { TcpudpNodeData } from '@/views/node/types'

const { isTcpudpClbEdit, addTcpudpNodeData, nodeClbTcpudpRefresh } = useClbTcpudpStore()

// 删除节点
const removeNode = (index: number) => {
	addTcpudpNodeData.value.splice(index, 1)
}

const { BtForm, submit } = useForm({
	data: tcpudpRenderForm,
	options: (formData: any) => {
		return computed(() => [
			FormInput('名称', 'ps', {
				attrs: {
					disabled: isTcpudpClbEdit.value,
					class: '!w-[320px]',
					placeholder: '请输入负载均衡名称',
				},
				rules: [
					defaultVerify({
						message: '请输入负载均衡名称',
						trigger: ['blur', 'change'],
					})
				],
			}),
			FormRadio('协议', 'type', [{ label: 'TCP', value: 'tcp' }, { label: 'UDP', value: 'udp' }]),
			FormRadio('监听地址', 'host', [{ label: '127.0.0.1', value: '127.0.0.1' }, { label: '0.0.0.0', value: '0.0.0.0' }]),
			FormInput('监听端口', 'port', {
				attrs: {
					class: '!w-[320px]',
					placeholder: '请输入监听端口',
				},
				rules: [
					portVerify({ message: '请输入监听端口' })
				],
			}),
			FormInput('超时时间（秒） ', 'proxy_timeout', {
				attrs: {
					class: '!w-[320px]',
					placeholder: '连接节点时的最大超时时间，默认8秒',
				},
			}),
			FormInput('保持时间（秒）', 'proxy_connect_timeout', {
				attrs: {
					class: '!w-[320px]',
					placeholder: '连接成功后最长无操作时间，默认86400秒',
				},
			}),
			FormCustom(() => (
				<div>
					<div class="flex justify-between items-center mb-5">
						<ElButton type="primary" onClick={addTcpudpNode}>添加负载均衡节点</ElButton>
					</div>
					<ElTable data={addTcpudpNodeData.value} table-layout="auto">
						<ElTableColumn prop="node_id" label="负载均衡节点">
							{{
								default: ({ row }: any) => (
									<span>{row.host}</span>
								)
							}}
						</ElTableColumn>
						<ElTableColumn prop="port" label="端口" />
						<ElTableColumn prop="node_status" label="节点状态">
							{{
								default: ({ row }: any) => (
									<ElSelect v-model={row.node_status} style="width: 70px">
										<ElOption label="参与" value="online" />
										<ElOption label="备份" value="backup" />
										<ElOption label="停用" value="down" />
									</ElSelect>
								)
							}}
						</ElTableColumn>
						<ElTableColumn prop="weight" label="权重" />
						<ElTableColumn prop="max_fail" label="阈值" />
						<ElTableColumn prop="fail_timeout" label="恢复时间（秒）" />
						<ElTableColumn prop="ps" label="备注" show-overflow-tooltip width="120" />
						<ElTableColumn label="操作" width="60">
							{{
								default: (_scope: any) => (
									<span class="bt-link" onClick={() => removeNode(_scope.$index)}>删除</span>
								)
							}}
						</ElTableColumn>
					</ElTable>
				</div>
			))
		])
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		try {
			await validate() // 校验表单
		const { name, proxy_connect_timeout, proxy_timeout, host, port, type , ps } = param.value
		const nodes: any[] = addTcpudpNodeData.value || []
		let params: any = {
			name,
			ps,
			tcp_config: {
				type,
				host,
				port: Number(port),
				proxy_connect_timeout: Number(proxy_connect_timeout),
				proxy_timeout: Number(proxy_timeout),
			},
			nodes
			}
		if (isTcpudpClbEdit.value) {
			params.load_id = param.value.load_id
		}
		await createWebSocketWithResult({
			mod_name: 'node',
			sub_mod_name: 'load',
			def_name: isTcpudpClbEdit.value ? 'modify_tcp_load' : 'create_tcp_load',
			ws_callback: isTcpudpClbEdit.value ? 'modify_tcp_load' : 'create_tcp_load',
			data: {
				...params,
			},
		})
			nodeClbTcpudpRefresh.value = true
			return true
		} catch (error) {
			console.error(error)
			return false
		}
	},
})
defineExpose({ onConfirm: submit })

onMounted(() => {
	addTcpudpNodeData.value = deepClone((tcpudpRenderForm() as any).nodes ?? []) as TcpudpNodeData[]
})
onUnmounted(() => {
	addTcpudpNodeData.value = []
})
</script>