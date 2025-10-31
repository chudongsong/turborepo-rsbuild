<template>
	<div class="p-[2.4rem] give-dialog">
		<el-form ref="pushMsg" :model="msgForm" label-width="80px" :rules="rules" @submit.native.prevent>
			<!-- <el-form-item label="告警开关" prop="switch">
        <el-switch v-model="msgForm.switch" name="switch"></el-switch>
      </el-form-item> -->
			<el-form-item label="告警方式" prop="give">
				<bt-alarm-select v-model="msgForm.give" class="!w-[28rem]" :limit="['sms']" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { setNewAlarmTask } from '@/api/firewall'
import { Message } from '@hooks/tools/message'

interface Form {
	switch: boolean
	give: string[]
}

interface Props {
	compData: any
}

const { proxy: vm }: any = getCurrentInstance()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
// 更新提醒状态备份
const checkedLoad = ref<boolean>(false)
const msgForm = reactive<Form>({
	switch: false,
	give: [],
})

const rules = reactive({
	give: [{ required: true, trigger: 'blur', message: '请选择告警方式' }],
})

/**
 * @description 初始化，获取信息配置
 */
const renderPushConfig = async () => {
	msgForm.give = props.compData.sender
	msgForm.switch = true
}

/**
 * @description 提交更新提示
 */
const onConfirm = (close: any) => {
	try {
		vm.$refs['pushMsg'].validate(async (valid: boolean) => {
			if (valid) {
				if (!msgForm.give.length) return Message.error('请选择告警方式')
				const res = await setNewAlarmTask({
					task_data: JSON.stringify({
						task_data: {
							tid: '7',
							type: 'ssh_login',
							title: 'SSH登录告警',
							status: msgForm.switch,
							count: 0,
							interval: 600,
							project: '',
						},
						sender: msgForm.give,
						number_rule: { day_num: 3, total: 0 },
						time_rule: { send_interval: 0, time_range: [0, 86399] },
					}),
					template_id: '7',
				})
				props.compData.refreshEvent && props.compData.refreshEvent()
				close()
				Message.request(res)
			}
		})
	} catch (error) {
		console.log(error)
	}
}

onMounted(async () => {
	renderPushConfig()
})

defineExpose({
	onCancel: () => props.compData.refreshEvent(),
	onConfirm,
})
</script>
<style lang="css" scoped>
.give-dialog :deep(.el-input-group__append, .el-input-group__prepend) {
	padding: 5px;
}
.give-dialog :deep(.el-radio__label) {
	@apply text-small text-default;
}
.give-dialog :deep(.el-slider__runway) {
	@apply my-[1.3rem];
}
</style>
