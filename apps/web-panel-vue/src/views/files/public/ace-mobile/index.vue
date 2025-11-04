<template>
	<div class="w-full h-full">
		<div class="bg-dark text-[#fff] absolute top-0 w-full h-[15rem] py-[1rem] z-9999">
			<div class="flex items-center justify-between px-[3rem]">
				<Sidebar />
				<Toolbars />
			</div>
			<FileHead />
		</div>
		<Content />
	</div>
</template>

<script setup lang="ts">
import type { FileDataProps } from '@files/types';

import FileHead from './content/files-header/index.vue';
import Toolbars from './toolbars/index.vue';
import Content from './content/index.vue';
import Sidebar from './sidebar/index.vue';

import FILES_ACE_MOBILE_STORE from './store';

const { init, $reset } = FILES_ACE_MOBILE_STORE();

interface Props {
	compData?: EditorProps;
}

interface EditorProps {
	fileItem: FileDataProps;
	callback: (data: FileDataProps) => void;
}

const props = withDefaults(defineProps<Props>(), {
	compData: {
		fileItem: { id: '', path: '' },
		callback: () => {},
	},
});

const emit = defineEmits(['close']);

provide('fileItem', props.compData?.fileItem);

const parentClose = () => {
	emit('close');
};

provide('parentClose', parentClose);

onMounted(() => {
	init();
});

onUnmounted(() => {
	$reset();
});
</script>
