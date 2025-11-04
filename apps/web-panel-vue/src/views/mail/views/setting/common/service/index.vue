<template>
	<setting-card title="服务状态">
		<bt-table :loading="loading" :loading-num="3" :data="table.data" :column="columns"></bt-table>

		<!-- <bt-dialog
			v-model="configModal.show"
			:title="configModal.title"
			:area="[800, 624]"
			area-unit="px"
			:footer="true"
			confirm-text="保存">
			<ServiceConfig :row="configModal.data.row" />
		</bt-dialog> -->
	</setting-card>
</template>

<script lang="tsx" setup>
import { getMailStore } from '@mail/useStore';
import SettingCard from '@mail/public/setting-card.vue';
import MAIL_SETTING_SERVICE from '@/views/mail/views/setting/common/service/store';
import { storeToRefs } from 'pinia';
import { getList } from '@/views/mail/views/setting/common/service/useMethod';

const { table, loading } = storeToRefs(MAIL_SETTING_SERVICE());
const { columns, reset } = MAIL_SETTING_SERVICE();

const store = getMailStore();

if (store.install) {
	getList();
}

onUnmounted(() => {
	reset();
});
</script>
