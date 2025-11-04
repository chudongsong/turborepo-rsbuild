<template>
	<div class="h-[60rem]">
		<el-form v-if="!opening" ref="shellFormRef" class="p-[2rem]" :model="shellForm">
			<el-form-item label="请选择shell">
				<bt-select
					v-model="shellForm.type"
					:options="[
						{ label: 'Bash', value: 'bash' },
						{ label: 'sh', value: 'sh' },
					]"
					class="!w-[20rem]"
				/>
				<el-button class="!ml-[2rem]" type="primary" @click="onConfirm">开启终端</el-button>
			</el-form-item>
			<el-form-item label=" ">
				<el-checkbox v-model="shellForm.sudo"><div class="flex items-center">使用root权限执行</div></el-checkbox>
			</el-form-item>
		</el-form>
		<div v-if="opening" class="h-full">
			<ContainerTerminalDialog :comp-data="shellData" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { getConCmd } from '@/api/docker';
import ContainerTerminalDialog from '@docker/public/con-terminal-dialog/container-terminal-dialog.vue';
import { useMessage } from '@hooks/tools/message';
import { useDataHandle } from '@hooks/tools/data';

interface Props {
	compData?: any;
}

const Message = useMessage(); // 消息提示

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
});

const currentConDetail = inject<any>('currentConDetail'); // 当前容器详情

const shellFormRef = ref();
const shellForm = reactive({
	type: 'bash',
	sudo: false,
});
const opening = ref(false); // 是否开启终端
const shellData = ref<any>({ cmd: '' });

// 提交
const onConfirm = async () => {
	if (currentConDetail.value.State.Status !== 'running') {
		Message.error('容器未运行');
		return;
	}
	shellFormRef.value.validate(async (valid: boolean) => {
		if (valid) {
			useDataHandle({
				request: getConCmd({
					id: currentConDetail.value.Id,
					shell: shellForm.type,
					sudo_i: shellForm.sudo ? 1 : 0,
				}),
				data: {
					msg: [
						String,
						(data: string) => {
							shellData.value = { cmd: data };
							// 开启终端
							opening.value = true;
						},
					],
				},
			});
		}
	});
};
</script>
