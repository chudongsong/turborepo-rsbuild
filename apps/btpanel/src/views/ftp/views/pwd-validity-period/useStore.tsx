import { formatTime } from '@/utils';
import { FTP_STORE } from '@ftp/useStore';
import { defineStore, storeToRefs } from 'pinia';
import { setTimeText } from './useMethod';

const FTP_PWD_VALIDITY_PERIOD = defineStore('FTP_PWD_VALIDITY_PERIOD', () => {
	const ftpStore = FTP_STORE(); // 获取FtpStore实例
	const { rowData } = storeToRefs(ftpStore); // 将FtpStore实例转换为响应式数据

	const pickerRef = ref(); // 日期选择器实例
	const updateFtpInfo = ref(); // 表单实例
	const isChange = ref(false); // 是否修改
	const selectValue = ref(); // 选择的值s

	const id = computed(() => rowData.value.id); // id
	const end_time = computed(() => rowData.value.end_time); // 名称

	const pickerOptions = reactive({
		disabledDate(time: any) {
			return time.getTime() < Date.now();
		},
		shortcuts: [
			{
				text: '永久',
				value: () => {
					const date = new Date();
					date.setTime(0);
					datePicker.value = 0;
					selectValue.value = 0;
					nextTick(() => {
						setTimeText();
					});
				},
			},
		],
	});

	const datePicker = ref<string | number>(formatTime(new Date(), 'yyyy-MM-dd')); // 日期选择器

	// 表单
	const ftpForm = ref<any>({
		status: '1',
		channel: [],
	});

	/**
	 * @description 到期时间对比
	 */
	const isTime = computed(() => {
		if (datePicker.value === formatTime(new Date(), 'yyyy-MM-dd')) {
			return end_time.value === '0';
		} else {
			if (Number(selectValue.value) == 0) return true;
			return datePicker.value === formatTime(new Date(), 'yyyy-MM-dd');
		}
	});

	return {
		pickerRef,
		rowData,
		updateFtpInfo,
		ftpForm,
		isTime,
		pickerOptions,
		datePicker,
		isChange,
		selectValue,
	};
});

/**
 * @description FTP全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useFtpPwdValidStore = () => {
	return storeToRefs(FTP_PWD_VALIDITY_PERIOD());
};

export { useFtpPwdValidStore, FTP_PWD_VALIDITY_PERIOD };
