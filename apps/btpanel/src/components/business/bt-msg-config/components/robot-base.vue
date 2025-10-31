<template>
	<MsgBase @save="save" @close="$emit('close')">
		<template #from>
			<el-form>
				<el-form-item label="名称">
					<el-input v-model="form.name" autofocus placeholder="机器人名称或备注" />
				</el-form-item>
				<el-form-item label="URL">
					<el-input v-model="form.url" class="url" type="textarea" :rows="4" :placeholder="`请输入${placeholder}机器人URL`" />
				</el-form-item>
			</el-form>
		</template>
		<template #tip>
			<ul style="list-style: disc">
				<li>
					<bt-link :href="tipUrl">如何创建{{ tipName }}机器人</bt-link>
				</li>
			</ul>
		</template>
	</MsgBase>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { setMsgConfig } from '@api/global'
import MsgBase from '@components/business/bt-msg-config/components/msg-base.vue'

interface Form {
	name: string
	url: string
}
const props = defineProps(['tipName', 'tipUrl', 'placeholder', 'type'])

const { proxy: vm }: any = getCurrentInstance()

const form = reactive<Form>({
	name: '',
	url: '',
})
const { load: $load, request: $request } = useMessage()

const save = async () => {
	let load: any
	try {
		load = $load(`正在设置${props.type}信息配置，请稍后...`)
		let res = await setMsgConfig(props.type, {
			title: form.name,
			url: form.url,
			atall: 'True',
		})
		$request(res)
		vm.$emit('callback')
		vm.$emit('close')
	} catch (e) {
		console.log(e)
	} finally {
		load && load.close()
	}
}
</script>

<style scoped lang="css">
:deep(.el-input--small) {
	width: 281px;
}

:deep(.el-textarea__inner) {
	resize: none;
}
</style>
