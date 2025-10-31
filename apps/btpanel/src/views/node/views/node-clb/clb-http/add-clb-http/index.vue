<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormInput, FormSelect, FormCustom, FormItemCustom } from '@form/form-item'
import { ElButton, ElTable, ElTableColumn, ElSelect, ElOption, ElAutocomplete } from 'element-plus'
import { httpRenderForm, addHttpNode, removeHttpNodeEvent, createQuerySearch } from '../useController'
import { updateHttpClbNodeList } from './useController'
import { createWebSocketWithResult } from '../../useController'
import { useClbHttpStore } from '../useStore'
import { isNil } from 'ramda'
import { deepClone } from '@/utils/data'

interface HttpRowData {
  nodes: any[]
  [key: string]: any
}

const { isHttpClbEdit, addNodeData, httpRowData, nodeClbHttpRefresh, domainList } = useClbHttpStore()

const clbTypeList = ref([
	{
		label: '轮询 - 按照权重依次分配请求到上游服务器',
		value: 'round_robin'
	},
	{
		label: 'coockie跟随 - 基于coockie选择实际的上游服务，保证每位访问者每次访问到同一个上游服务器',
		value: 'sticky_cookie'
	},
	{
		label: 'IP跟随 - 基于访问者的IP地址选择实际的上游服务，保证每位访问者每次访问到同一个上游服务器（拥有CDN的网站不推荐使用）',
		value: 'ip_hash'
	},
	{
		label: '最少链接 - 每次优先选择当前链接数量较少的上游服务器来处理访问者的请求',
		value: 'least_conn'
	},
])

const { BtForm, submit } = useForm({
	data: httpRenderForm,
	options: (formData: any) => {
		return computed(() => [
			FormInput('名称', 'ps', {
				attrs: {
					disabled: isHttpClbEdit.value,
					class: '!w-[320px]',
					placeholder: '请输入负载均衡名称',
				},
				rules: [
					{ required: true, message: '请输入负载均衡名称' },
					{
						validator: (rule: any, value: any, callback: any) => {
							if (value.length >= 3) {
								callback()
							} else {
								callback(new Error('请输入至少大于3个字符'))
							}
						},
						trigger: ['blur', 'change'],
					},
				],
			}),
			!isHttpClbEdit.value && FormItemCustom('选择网站', () => (
					<ElAutocomplete
							v-model={formData.value.site_name}
							fetch-suggestions={createQuerySearch(domainList.value)}
							clearable
							class="inline-input !w-[32rem]"
							onSelect={(item: any) => item.value.value}
							value-key="label"
							placeholder="请输入或选择网站"
					/>
			), 'site_name'),
			FormSelect('负载方式', 'http_alg', clbTypeList.value, {
				attrs: { placeholder: '请选择负载方式', class: '!w-[74rem]'}
			}),
			FormCustom(() => (
				<div>
					<div class="flex justify-between items-center mb-5">
						<ElButton type="primary" onClick={addHttpNode}>添加负载均衡节点</ElButton>
					</div>
					<ElTable data={ addNodeData.value } table-layout="auto">
						<ElTableColumn prop="node_remarks" label="负载均衡节点" width="120" />
						<ElTableColumn prop="node_site_name" label="节点网站" width="120"/>
						<ElTableColumn prop="port" label="端口" width="70" />
						<ElTableColumn prop="path" label="验证路径" width="100" />
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
						<ElTableColumn prop="weight" label="权重" width="60" />
						<ElTableColumn prop="max_fail" label="最大失败次数" width="90" />
						<ElTableColumn prop="fail_timeout" label="恢复时间（秒）" width="100" />
						<ElTableColumn prop="ps" label="备注" />
						<ElTableColumn label="操作" width="60">
							{{
								default: (_scope: any) => (
									<span class="bt-link" onClick={() => removeHttpNodeEvent(_scope.$index)}>删除</span>
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
			await validate()
			let { ps, site_name, http_alg, site_id, load_id } = param.value
			const nodes = deepClone(addNodeData.value) as any[]
			site_id = domainList.value.find((item: any) => item.label === site_name)?.value
			const params: any = {
				ps,
				site_name,
				...(!isNil(site_id) ? { site_id } : {}),
				http_config: {
					http_alg,
					proxy_next_upstream: 'error timeout http_500 http_502 http_503 http_504',
					proxy_cache_status: addNodeData.value.http_config?.proxy_cache_status || false,
					cache_time: addNodeData.value.http_config?.cache_time || '1d',
					cache_suffix: addNodeData.value.http_config?.cache_suffix || 'css,js,jpe,jpeg,gif,png,webp,woff,eot,ttf,svg,ico,css.map,js.map',
				},
				nodes,
			}
			if (isHttpClbEdit.value) {
				params.http_config.proxy_next_upstream = param.value.http_config.proxy_next_upstream
				params.site_id = param.value.site_id
				params.load_id = load_id
				params.name = param.value.name
			}
			await createWebSocketWithResult({
				mod_name: 'node',
				sub_mod_name: 'load',
				def_name: isHttpClbEdit.value ? 'modify_http_load' : 'create_http_load',
				ws_callback: isHttpClbEdit.value ? 'modify_http_load' : 'create_http_load',
				data: {
					...params,
				},
			})
			nodeClbHttpRefresh.value = true
			return true
		} catch (error) {
			console.error('提交失败:', error)
			return false
		}
	},
})
defineExpose({ onConfirm: submit })

onMounted(() => {
	if (!isNil(httpRowData.value)) {
		addNodeData.value = deepClone((httpRowData.value as HttpRowData).nodes) as any[]
	}
})

onUnmounted(() => {
	addNodeData.value = []
})

</script>

<style scoped>
.el-form {
	max-width: 1200px;
	margin: 0 auto;
}
</style>