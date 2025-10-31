<template>
	<div class="p-[2rem] master-redis-add-form">
		<BtForm />
	</div>
</template>

<script lang="tsx" setup>
import { useForm } from '@/hooks/tools/form'
import { useMasterRedisStore } from '../useStore'
import { createRedisGroup } from '@/api/node'
import { FormHelp, FormInput, FormItemCustom, FormSelect } from '@/hooks/tools/form/form-item'
import { ElCheckbox, ElCheckboxGroup, ElButton, ElInput, ElAlert } from 'element-plus'
import { compareVersions } from '../../../node-clb/useController'
import { ipVerify } from '@/utils/rule'
import { getRandomPwd } from '@utils/index'
import { Message, useDataHandle } from '@/hooks/tools'
import { openCreateStep } from '../useController'

const { redisAvailableNodes, openNodesLoading } = useMasterRedisStore()
const isRedisVersion = ref(false)
// 表单配置
const { BtForm, param, submit } = useForm({
	data: {
		slave_node_ids: [],
	},
	options: (formVal: any) => {
		return computed(() => [
			FormInput('主从名称', 'group_name', {
				attrs: {
					placeholder: '请输入主从复制组名称',
					class: '!w-[46rem]',
				},
				rules: [{ required: true, message: '主从名称不能为空', trigger: ['blur', 'change'] }],
			}),
			FormSelect('主节点选择', 'master_node_id', redisAvailableNodes.value.nodes || [], {
				attrs: {
					placeholder: '请选择主节点',
					class: '!w-[46rem]',
					loading: openNodesLoading.value,
					onChange: (val: any) => {
						const selectedNode = redisAvailableNodes.value.nodes.find((item: any) => item.value === val)
						formVal.value.master_ip = selectedNode.server_ip
						formVal.value.slave_node_ids = (formVal.value.slave_node_ids || []).filter((id: any) => id !== val)
					},
				},
				rules: [{ required: true, message: '请选择主节点', trigger: ['blur', 'change'] }],
			}),
			FormInput('主节点IP', 'master_ip', {
				attrs: {
					placeholder: '请输入主节点IP地址',
					class: '!w-[46rem]',
				},
				rules: [
					{
						required: true,
						...ipVerify(),
					},
				],
			}),
			FormItemCustom(
				'可用从节点',
				() => {
					return (
						<div v-bt-loading={openNodesLoading.value} class="slave-checkbox-list border w-full rounded p-[12px] max-h-[42rem] overflow-y-auto" style={{ minHeight: openNodesLoading.value ? '10rem' : 'auto' }}>
							{!openNodesLoading.value && !redisAvailableNodes.value.row.length && (
								<div class="text-small text-tertiary leading-[12px]">
									暂无可用Redis从节点，请先在前往 节点管理 -{' '}
									<span class="bt-link" onClick={() => (location.href = '/node/node-mgt')}>
										添加节点
									</span>
								</div>
							)}
							<ElCheckboxGroup v-model={formVal.value.slave_node_ids}>
								{redisAvailableNodes.value.row.map(item => {
									const nodeLabel = (
										<span class="text-small flex-1">
											{item.server_ip} - {item.name}
										</span>
									)
									return (
										<div class="flex justify-between items-center mb-[8px] last:mb-0" key={item.id}>
											<ElCheckbox value={item.id} class="mr-[8px]" disabled={item.id === formVal.value.master_node_id || item.is_in_replication_group}>
												{item.is_in_replication_group ? (
													<el-tooltip content={`节点已在主从组 - ${item.group_info?.group_name}`} placement="top">
														{{ default: () => nodeLabel }}
													</el-tooltip>
												) : (
													nodeLabel
												)}
											</ElCheckbox>
											<span
												class="ml-[12px] text-small px-[8px] py-[2px] leading-[22px] rounded"
												style={{
													background: compareVersions(item.redis_version, '7.0.0') === 1 ? '#f6ffed' : '#fff7e6',
													color: compareVersions(item.redis_version, '7.0.0') === 1 ? '#52c41a' : '#fa8c16',
												}}>
												Redis {item.redis_version}
											</span>
										</div>
									)
								})}
							</ElCheckboxGroup>
						</div>
					)
				},
				'slave_node_ids',
				{
					rules: [
						{
							required: true,
							trigger: ['blur', 'change'],
							validator: (rule: any, value: any, callback: any) => {
								if (!value || value.length === 0) {
									isRedisVersion.value = false
									callback(new Error('请选择主从节点'))
									return
								}
								const selectedNodes = redisAvailableNodes.value.row.filter(item => value.includes(item.id))
								const versions = selectedNodes.map(item => item.redis_version)
								const allSame = versions.every(v => v === versions[0])
								isRedisVersion.value = !allSame
								callback()
							},
						},
					],
				}
			),
			isRedisVersion.value &&
				FormItemCustom(' ', () => {
					return <ElAlert show-icon title="警告：检测到版本不一致，建议使用相同版本的Redis节点" effect="light" closable={false} type="warning" />
				}),
			FormItemCustom(
				'Redis密码',
				() => (
					<div class="flex items-center w-full">
						<ElInput v-model={formVal.value.redis_password} placeholder="请输入Redis密码" class="!w-[38rem]" type="password" show-password />
						<ElButton class="ml-[8px]" type="default" onClick={() => (formVal.value.redis_password = getRandomPwd(16))}>
							生成密码
						</ElButton>
					</div>
				),
				'redis_password',
				{
					rules: [{ required: true, message: 'Redis密码不能为空', trigger: ['blur', 'change'] }],
				}
			),
			FormHelp(' ', [
				{ content: '设置的密码将会覆盖当前redis密码' },
				{ content: 'redis密码建议使用包含字母、数字和特殊字符的复杂密码确保安全性' },
				{ content: '如有安全组，请执行以下两步操作' },
				{ content: '在主节点与从节点设置本机IP为白名单，放行6379端口' },
				{ content: '在主节点机器，设置从节点IP为白名单，放行6379端口' },
				{ content: '只支持通过app/或api添加的节点' },
			]),
		])
	},
	// 提交处理
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		let loading = null
		try {
			await validate()
			loading = Message.load('正在创建主从复制组，请稍候...')
			const params = {
				...param.value,
				slave_node_ids: JSON.stringify(param.value.slave_node_ids),
			}
			const res = await createRedisGroup(params)
			if (res.data.status) {
				console.log(res)
				openCreateStep(res.data.msg.task_id)
				Message.success(res.data.msg.message)
			} else {
				Message.error(res.data.msg || '创建主从复制组失败')
			}
			return res.status
		} catch (error) {
			return false
		} finally {
			loading?.close()
		}
	},
})
defineExpose({
	onConfirm: submit,
})
onUnmounted(() => {
	redisAvailableNodes.value = { row: [], nodes: [] }
	openNodesLoading.value = true
})
</script>

<style lang="scss" scoped>
.master-redis-add-form :deep(.el-step__line) {
	// display: none;
	border-color: var(--el-color-border-darker);
	background-color: var(--el-fill-color-darker);
	left: 10px;
}
.master-redis-add-form :deep(.el-step__title.is-process) {
	color: var(--el-color-text-tertiary);
	font-weight: 500;
}
.master-redis-add-form :deep(.el-step__head.is-process) {
	.svgtofont-el-loading {
		color: var(--el-color-text-tertiary) !important;
	}
	.el-step__icon-inner {
		display: flex;
	}
}
.master-redis-add-form :deep(.el-step__main) {
	display: flex;
	justify-content: space-between;
	.el-step__title {
		font-size: var(--el-font-size-base);
	}
	.el-step__description.is-process {
		color: var(--el-color-text-tertiary);
	}
	.el-step__description {
		padding-top: 6px;
		padding-right: 5%;
		font-size: var(--el-font-size-base);
	}
}
.master-redis-add-form :deep(.el-alert) {
	padding: 4px 8px;
	.el-alert__title {
		font-size: var(--el-font-size-small);
	}
	.el-alert__icon {
		font-size: var(--el-font-size-base);
		margin-right: 4px;
	}
}
.manual-import-card {
	background: var(--el-fill-color-light);
	border-radius: var(--el-border-radius-medium);
	padding: 1.2rem;
	margin-bottom: 1rem;
	font-size: var(--el-font-size-base);
	color: var(--el-color-text-secondary);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	.import-tip {
		color: var(--el-color-text-secondary);
		margin: 5px 0 10px;
		font-size: var(--el-font-size-small);
	}
	.manual-import-actions {
		display: flex;
		align-items: center;
		margin-top: 8px;
	}
	.file-name {
		margin-bottom: 4px;
	}
}
</style>
