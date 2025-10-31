<template>
	<el-form ref="cmdFormRef" :model="cmdForm" :rules="cmdRules" @submit.native.prevent>
		<el-form-item label="当前镜像">
			{{ currentConDetail.Config?.Image || '' }}
		</el-form-item>
		<el-form-item prop="new_image" label="目标镜像">
			<el-input v-model="cmdForm.new_image" style="width: 50rem" :placeholder="`请输入版本号`">
				<template #prepend>
					<div class="max-w-[35rem] truncate">
						{{ currentConDetail.Config?.Image.split(':')[0] || '' }}
					</div>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item label=" ">
			<el-checkbox v-model="cmdForm.upgrade">强制升级</el-checkbox>
		</el-form-item>
		<el-form-item label=" ">
			<el-checkbox v-model="cmdForm.pull">强制拉取镜像</el-checkbox>
		</el-form-item>
		<el-button class="ml-[10rem]" type="primary" @click="onConfirm">保存配置</el-button>
	</el-form>
</template>
<script setup lang="ts">
import { editCon } from '@/api/docker';
import { getDockerStore } from '@docker/useStore';
import { Message } from '@hooks/tools/message';
import { useConfirm } from '@hooks/tools/confirm';
import { useDataHandle } from '@hooks/tools/data';

interface Props {
	compData?: any;
}

const {
	refs: { currentConDetail },
} = getDockerStore();

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
});
const emits = defineEmits(['close']);

const { row } = toRefs(props.compData);

// 表单
const cmdForm = reactive({
	new_image: 'latest',
	upgrade: false,
	pull: false,
});

const cmdFormRef = ref();

// 验证规则
const cmdRules = {
	new_image: [{ required: true, message: '请输入目标镜像版本', trigger: ['blur'] }],
};

// 验证是否需要强制升级
const compareVersions = () => {
	const nowVersion = currentConDetail.value.Config.Image.split(':')[1];
	const newVersion = cmdForm.new_image;
	// 如果是latest，不需要强制升级
	if (nowVersion == 'latest' || newVersion == 'latest') {
		return false;
	}

	// Split the versions into arrays
	const arr1 = nowVersion.split('.');
	const arr2 = newVersion.split('.');

	// Compare each segment
	for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
		const num1 = parseInt(arr1[i]) || 0;
		const num2 = parseInt(arr2[i]) || 0;
		if (num1 < num2) {
			// 新版本大于旧版本，不需要强制升级
			return false;
		} else if (num1 > num2) {
			// 新版本小于旧版本，需要强制升级
			return true;
		}
	}
};

// 提交
const onConfirm = async () => {
	await cmdFormRef.value.validate();
	// 判断是否需要强制升级
	if (compareVersions() && !cmdForm.upgrade) {
		Message.error('检测到当前目标版本低于原镜像版本，请重新输入或点击强制升级！');
		return;
	}
	await useConfirm({
		title: `升级`,
		content: `升级操作需要重建容器，任何未持久化的数据将会丢失，是否继续？`,
	});

	useDataHandle({
		request: editCon({
			data: JSON.stringify({
				new_image: cmdForm.new_image,
				upgrade: '1',
				id: row.value.id,
				force_pull: cmdForm.pull ? '1' : '0',
			}),
		}),
		message: true,
		success: async (res: any) => {
			if (res.status) {
				emits('close');
				// 1s后刷新页面
				setTimeout(() => {
					window.location.reload();
				}, 1000);
			}
		},
	});
};

onMounted(async () => {});
</script>
