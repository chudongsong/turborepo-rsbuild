<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm, Message } from '@/hooks/tools'
import { FormSelect, FormHelp, FormItemCustom } from '@form/form-item'
import { addSlaveToRedisGroup, getGroupDetail } from '@/api/node'
import { useMasterRedisStore } from '../useStore'
import { ElSelect, ElOption } from 'element-plus'
import { useRouter } from 'vue-router'

const { redisGroupDetail, isRedisRefreshList } = useMasterRedisStore()
const router = useRouter()

const props = withDefaults(defineProps<{
	compData: {
		group_id: string,
		nodes: [],
	}
}>(), {
	compData: () => ({
		group_id: '',
		nodes: [],
	}),
})
const formData = ref(props.compData.nodes.map((item: any) => ({
	label: `${item.server_ip} - Redis ${item.redis_version}`,
	value: item.id,
})))
console.log('props.compData', props.compData.nodes)
const { BtForm, submit } = useForm({
	data: {
		new_slave_node_id: [],
	},
	options: (formValue: any) => {
		return computed(() => [
			FormItemCustom('选择节点', () => {
				return (
					<div class="w-full">
						<ElSelect
							v-model={formValue.value.new_slave_node_id}
							popper-class="slave-select-popper"
							placeholder="请选择要添加的从节点"
						>
							{{
								default: () => {
									return (
										<div>
											{formData.value.map((item: any) => {
												return <ElOption label={item.label} value={item.value} />
											})}
										</div>
									)
								},
								empty: () => {
									return (
										<div style="text-align: center;">
											暂无可用的Redis节点，
											<span
												class="bt-link"
												onClick={() => {
													if (router && typeof router.push === 'function') {
														router.push({ name: 'node-mgt' })
													} else {
														window.location.href = '/node/node-mgt'
													}
												}}
											>
												去添加
											</span>
										</div>
									)
								},
							}}
						</ElSelect>
					</div>
				)
			}, 'new_slave_node_id', {
				rules: [
					{ required: true, message: '请选择要添加的从节点' }
				]
			}),
			FormHelp(' ', [
				{content: '只显示可用的Redis节点，已在复制组中的节点不会显示'}
			])
		])
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		let loading = null;
		try {
			await validate()
			loading = Message.load('正在配置从节点信息，请稍后...')
			const { new_slave_node_id } = param.value
			console.log('提交数据:', props.compData.group_id, param)
			const res = await addSlaveToRedisGroup({ group_id: props.compData.group_id, new_slave_node_id })
			if (res.status) {
				const { data: updetaData } = await getGroupDetail({ group_id: props.compData.group_id })
				redisGroupDetail.value.slave_details = updetaData.data.slave_details
				isRedisRefreshList.value = true
				console.log('添加从节点结果:', updetaData)
				Message.success(res.msg || '添加从节点成功')
			} else {
				Message.error(res.msg || '添加从节点失败')
			}
			return res.status
		} catch (error) {
			return false
		} finally {
			loading?.close()
		}
	},
})
defineExpose({ onConfirm: submit })

</script>