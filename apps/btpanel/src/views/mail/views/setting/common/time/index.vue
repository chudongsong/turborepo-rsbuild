<template>
	<setting-card title="邮件保存时间">
		<div class="flex items-center">
			<el-radio-group v-model="type">
				<el-radio :value="0">永久</el-radio>
				<el-radio class="ml-24px" :value="1">自定义</el-radio>
			</el-radio-group>
			<div class="w-250px">
				<el-input v-model="days" class="flex-1 ml-16px" type="number" :min="1" :max="999999" @input="handleInput" :disabled="type === 0" :controls="false" placeholder="请输入保存时间">
					<template #append>天</template>
				</el-input>
			</div>
			<el-button class="ml-24px" type="primary" ghost @click="onSave"> 保存 </el-button>
		</div>
	</setting-card>
</template>

<script lang="ts" setup>
import { getMailStore } from '@mail/useStore'
import MAIL_SETTING_TIME from '@/views/mail/views/setting/common/time/store'
import { storeToRefs } from 'pinia'
import { getData, onSave, handleInput } from '@/views/mail/views/setting/common/time/useMethod'
import SettingCard from '@mail/public/setting-card.vue'

const { type, days } = storeToRefs(MAIL_SETTING_TIME())
const { reset } = MAIL_SETTING_TIME()

const store = getMailStore()

if (store.install) {
	getData()
}

onUnmounted(() => {
	reset()
})
</script>
