<template>
	<div class="time flex">
		<el-button-group class="control-btn">
			<el-button v-for="(item, index) in btnGroup" :key="index" :type="btnActive === index ? 'primary' : ''" @click="item.event">
				{{ item.content }}
			</el-button>
		</el-button-group>
		<el-date-picker
			align="right"
			type="date"
			v-model="customTime"
			placeholder="自定义时间"
			ref="player"
			class="auto-time !w-[13rem]"
			:class="`${btnActive === 2 ? 'active' : ''}`"
			@change="selectTime"
			:disabled-date="disabledDate"
		></el-date-picker>
	</div>
</template>

<script lang="ts" setup>
import { formatTime } from '@/utils';

interface Props {
	days: any;
}
const props = withDefaults(defineProps<Props>(), {
	days: '',
});

const emits = defineEmits(['cut-day', 'cut-day-click']);
//标记当前选择的天数按钮
const status = ref<string>('');
const btnActive = ref<number>(1);
const player = ref<any>(); //获取时间选择器

const btnGroup = ref<any>([
	{
		content: '昨天',
		active: false,
		event: () => {
			btnActive.value = 0;
			// 获取昨天日期
			const yesterday = formatTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
			emits('cut-day', 0, yesterday);
			customTime.value = '';
		},
	},
	{
		content: '今天',
		active: true,
		event: (event: any) => {
			btnActive.value = 1;
			// 获取今天日期
			const today = formatTime(new Date(), 'yyyy-MM-dd');
			emits('cut-day', 1, today);
			customTime.value = '';
		},
	},
]);

//自定义时间
const customTime = ref<any>('');
const disabledDate = (time: any) => {
	return time.getTime() > Date.now();
};

/**
 * @description: 选择时间
 * @param time 		选择的时间
 */
const selectTime = (time: any) => {
	status.value = '自定义时间';
	btnActive.value = 2;
	emits('cut-day', 2, formatTime(time, 'yyyy-MM-dd'));
};
</script>

<style lang="css" scoped>
:deep(.el-button + .el-button) {
	@apply ml-[0rem];
}

.control-btn :deep(.el-button:last-child) {
	@apply mr-0 rounded-none;
}

.auto-time :deep(.el-input__inner) {
	@apply rounded-l-none pl-3rem
	border-left: 0;
}
.auto-time :deep(.el-input__inner.active .el-input__inner) {
	@apply bg-primary text-white;
}
</style>
