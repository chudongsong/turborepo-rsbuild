<template>
	<el-form ref="shellFormRef" class="p-[2rem]" :model="shellForm">
		<el-form-item label="请选择shell">
			<bt-select
				v-model="shellForm.type"
				:options="[
					{ label: 'Bash', value: 'bash' },
					{ label: 'sh', value: 'sh' },
				]"
				class="!w-[20rem]"
			/>
		</el-form-item>
		<el-form-item label=" ">
			<el-checkbox v-model="shellForm.sudo"><div class="flex items-center">使用root权限执行</div></el-checkbox>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import { getConCmd } from '@/api/docker';
import { useDataHandle } from '@hooks/tools/data';

interface Props {
	compData?: any;
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
});
const emits = defineEmits(['close']);

const {
	row: { id },
} = props.compData;

const shellFormRef = ref();
const shellForm = reactive({
	type: 'bash',
	sudo: false,
});

// 提交
const onConfirm = async () => {
	await shellFormRef.value.validate();
	await useDataHandle({
		request: getConCmd({
			id: id,
			shell: shellForm.type,
			sudo_i: shellForm.sudo ? 1 : 0,
		}),
		success: (res: any) => {
			props.compData.openTerminalLog(res.msg);
			if (res.status) {
				emits('close');
			}
		},
	});
};
defineExpose({
	onConfirm,
});
</script>
