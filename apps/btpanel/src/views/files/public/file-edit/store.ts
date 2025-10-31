import { defineStore } from 'pinia';
import { useDataHandle } from '@/hooks/tools';
import { compressSaveZip, compressSaveGz } from '@api/files';

const FILES_EDIT_STORE = defineStore('FILES-EDIT-STORE', () => {
	const compData = ref<any>();

	// 编辑器配置
	const config = {
		mode: 'ace/mode/nginx',
	};

	const load = ref(false);

	// 配置文件内容
	const cmdForm = reactive({
		data: '',
	});

	// 提交
	const onConfirm = async (close?: any) => {
		const params = {
			sfile: compData.value.fileItem.path,
			filename: (compData.value.path != '' ? compData.value.path + '/' : '') + compData.value.name,
			data: cmdForm.data,
		};

		const requestFun = compData.value.fileItem.ext === 'zip' ? compressSaveZip : compressSaveGz;

		await useDataHandle({
			loading: '正在保存，请稍后...',
			request: requestFun({
				data: JSON.stringify(params),
			}),
			message: true,
			success: (res: any) => {
				if (res.status) close && close();
			},
		});
	};

	const init = () => {
		cmdForm.data = compData.value.data.data;
	};

	return {
		compData,
		config,
		load,
		cmdForm,
		onConfirm,
		init,
	};
});

export default FILES_EDIT_STORE;
