import { useConfirm } from '@/hooks/tools';
import { isObject } from '@/utils';
import useWPLocalStore from '@/views/wordpress/view/local/useStore';
import { useGlobalStore } from '@/store/global';
import { wpIntegrityCheck, wpReinstallFiles } from '@/api/wp';

const { payment } = useGlobalStore();
const { verifyingData, localRow } = storeToRefs(useWPLocalStore());
const { setVerifyingLoading, setReinstallLoading } = useWPLocalStore();

export const onCheck = async () => {
	verifyingData.value.text = '';
	setVerifyingLoading(true);
	try {
		const { data } = await wpIntegrityCheck({ s_id: localRow.value.id });
		verifyingData.value.status = true;
		if (isObject(data)) {
			verifyingData.value.text = data.msg;
		}
	} catch (err: any) {
		verifyingData.value.status = false;
		verifyingData.value.text = err?.message?.result || '';
	} finally {
		setVerifyingLoading(false);
	}
};

export const onReinstall = async () => {
	await useConfirm({
		title: '重新安装WP',
		content: '这将重新安装WordPress核心文件而不会丢失站点内容。建议您在重新安装之前备份网站。',
		onConfirm: async () => {
			// if (payment.value.authType !== 'ltd') {
			// 	// 打开支付框
			// 	return;
			// }
			verifyingData.value.text = '';
			setReinstallLoading(true);
			const res = await wpReinstallFiles({ s_id: localRow.value.id });
			if (isObject(res)) {
				verifyingData.value.text = res.msg;
				verifyingData.value.status = true;
				setReinstallLoading(false);
			}
		},
	});
};
