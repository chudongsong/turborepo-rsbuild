<template>
	<div>
		<!-- <alarm-form ref="alarmForm" :compData="compData" @close="close"></alarm-form> -->
		<div class="alarmFrom" ref="alarmForm"></div>
	</div>
</template>

<script lang="ts" setup>
import { AlarmPush } from '@home/types';

// import AlarmForm from '@config/content/alarm/list/form/index.vue'
// import type { AlarmPush } from '@views/config/hooks/types.d'

interface Props {
	compData: {
		isEdit: boolean;
		row: AlarmPush;
		getList?: () => Promise<void>;
		diyProcessTemplate?: boolean;
		diyProcessTemplateTid?: string[];
	};
}

const props = withDefaults(defineProps<Props>(), {});
const emits = defineEmits(['close']);

const { compData } = toRefs(props);
const alarmForm = ref();
const close = () => {
	emits('close');
};

defineExpose({
	submit: () => {
		return alarmForm.value.onConfirm();
	},
});
</script>
