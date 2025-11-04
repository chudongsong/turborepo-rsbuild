<template>
	<div class="h-[3.5rem] bg-warning px-[1.5rem] flex items-center text-[#fff] text-[1.5rem]" @click.stop>
		<div class="bg-warning !hover:bg-warning">只读文件，文件为{{ editorTabsActive.path }} 历史版本[{{ formatTime(Number(reHistoryRow.st_mtime)) }}]</div>
		<bt-link class="ml-[30px]" size="1.5rem" @click="diffReHistory">点击恢复左侧历史版本</bt-link>
	</div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/index';
import { editorTabsActive, reHistoryRow } from '@files/public/ace/useMethods';
import FILES_ACE_STORE from '../store';

const { diffReHistory } = FILES_ACE_STORE();
</script>
