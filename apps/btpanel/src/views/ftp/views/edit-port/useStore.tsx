import { portVerify } from '@/utils';
import { FTP_STORE } from '@ftp/useStore';
import { defineStore, storeToRefs } from 'pinia';

const FTP_PORT_EDIT_STORE = defineStore('FTP-PORT-EDIT-STORE', () => {
	const ftpStore = FTP_STORE();
	const { ftpPort } = storeToRefs(ftpStore);

	const ftpPortForm = ref();

	const ftpPortOptions = reactive({
		port: {
			label: '默认端口',
			placeholder: '请输入FTP默认端口',
			width: '22rem',
			rules: [portVerify()],
		},
	});

	const ruleForm = reactive<{ port: number | string }>({
		port: unref(ftpPort),
	});

	const $reset = () => {
		ruleForm.port = unref(ftpPort);
	};

	return {
		ftpPortForm,
		ftpPortOptions,
		ruleForm,
		$reset,
	};
});
/**
 * @description FTP全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useFtpPortStore = () => {
	return storeToRefs(FTP_PORT_EDIT_STORE());
};

export { useFtpPortStore, FTP_PORT_EDIT_STORE };
