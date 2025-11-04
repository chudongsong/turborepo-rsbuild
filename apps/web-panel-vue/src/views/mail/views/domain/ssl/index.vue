<template>
	<div class="h-full p-16px">
		<bt-tabs v-model="menu" type="card">
			<el-tab-pane v-for="item in menus" :key="item.type" :label="item.title" :name="item.type">
				<component :is="item.component" v-bind="menuData"></component>
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>

<script lang="ts" setup>
import { MailDomain } from '@mail/types';
import MAIL_DOMAIN_SSL from '@mail/views/domain/ssl/store';
import { storeToRefs } from 'pinia';

const { menu, menuData } = storeToRefs(MAIL_DOMAIN_SSL());
const { initMenu, menus } = MAIL_DOMAIN_SSL();

interface PropsData {
	row: MailDomain;
	onRefresh: () => void;
}

interface Props {
	compData: PropsData;
}

const props = withDefaults(defineProps<Props>(), {});

initMenu(props.compData);
</script>
