import { defineStore } from 'pinia';
import FILES_STORE from '@files/store';
import { getTaskLists, removeTask } from '@/api/global';
import { useConfirm, useDataHandle, useHandleError } from '@hooks/tools';

const FILES_TASK_STORE = defineStore('FILES-TASK-STORE', () => {
	const { refreshFilesList } = FILES_STORE();

	const instance = ref<any>(); // 实例

	// 定时器
	let timer: any = null;
	// 任务数据
	const taskData = ref<any>([]);

	/**
	 * @description 获取最新日志
	 */
	const getLog = async () => {
		try {
			const res = await getTaskLists({ status: -3 });
			if (res.data.length === 0) {
				clearInterval(timer);
				refreshFilesList();
				close();
				return;
			}
			taskData.value = res.data;
			timer = setTimeout(getLog, 2000); // 递归调用
		} catch (err) {
			useHandleError(err);
		}
	};

	// 取消当前任务
	const cancel = async (task: any) => {
		await useConfirm({
			title: `删除任务`,
			content: `您真的要删除当前任务【${task.name}:${task.shell}】吗？`,
		});
		useDataHandle({
			loading: '正在删除，请稍后...',
			request: removeTask({
				id: task.id,
			}),
			message: true,
			success: getLog,
		});
	};

	const close = async () => {
		const popup = await instance.value;
		popup?.unmount();
	};

	const $reset = () => {
		taskData.value = [];
		clearInterval(timer);
	};

	return {
		instance,
		taskData,
		getLog,
		cancel,
		$reset,
	};
});

export default FILES_TASK_STORE;
