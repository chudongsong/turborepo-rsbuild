import { defineStore } from 'pinia';
import type { MailSendLimit } from '@mail/types';

export const MAIL_MASS_ADD = defineStore('MAIL_MASS_ADD', () => {
	const formRef = ref();
	const propsData = ref({} as any);
	const form = reactive({
		task_name: '',
		addresser: null as string | null,
		file_recipient: '',
		subject: '',
		forward_user: '',
		up_content: 1,
		file_content: '',
		content: '',
		is_record: 0,
		unsubscribe: 0,
		threadsType: 0,
		threads: 1,
	});

	const rules: any = {
		task_name: [
			{
				trigger: ['blur', 'input'],
				validator: (rule: any, value: any, callback: any) => {
					if (!value.trim()) {
						callback(new Error('任务名称不能为空!'));
					} else {
						callback();
					}
				},
			},
		],
		file_recipient: [
			{
				trigger: 'blur',
				validator: (rule: any, value: any, callback: any) => {
					if (!value) {
						callback(new Error('收件箱不能为空!'));
					} else {
						callback();
					}
				},
			},
		],
		subject: [
			{
				trigger: 'blur',
				validator: (rule: any, value: any, callback: any) => {
					if (!value) {
						callback(new Error('邮件主题不能为空!'));
					} else {
						callback();
					}
				},
			},
		],
		file_content: [
			{
				trigger: 'blur',
				validator: (rule: any, value: any, callback: any) => {
					if (form.up_content === 1 && !value) {
						callback(new Error('发送内容不能为空!'));
					} else {
						callback();
					}
				},
			},
		],
		content: [
			{
				trigger: 'blur',
				validator: (rule: any, value: any, callback: any) => {
					if (form.up_content === 0 && !value.trim()) {
						callback(new Error('发送内容不能为空!'));
					} else {
						callback();
					}
				},
			},
		],
	};

	const columns = ref([
		{
			prop: 'domain',
			label: '域名',
			showOverflowTooltip: true,
		},
		{
			prop: 'count',
			label: '数量',
			width: 240,
		},
		// {
		// 	key: 'etc',
		// 	title: 'Projected completion time',
		// 	width: 240,
		// },
	]);
	const limitList = ref<MailSendLimit[]>([]);

	const maxThreads = ref(5);

	const initForm = () => {
		Object.assign(form, {
			task_name: '',
			addresser: null,
			file_recipient: '',
			subject: '',
			forward_user: '',
			up_content: 1,
			file_content: '',
			content: '',
			is_record: 0,
			unsubscribe: 0,
			threadsType: 0,
			threads: 1,
		});
		limitList.value = [];
	};

	return {
		formRef,
		form,
		rules,
		columns,
		limitList,
		maxThreads,
		propsData,
		initForm,
	};
});

export default MAIL_MASS_ADD;
