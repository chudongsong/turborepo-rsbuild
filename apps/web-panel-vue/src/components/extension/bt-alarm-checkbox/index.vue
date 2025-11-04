<template>
	<!-- <div class="!w-full"> -->
	<el-checkbox-group v-model="giveGroupModel" v-bt-loading="push.checkedLoad">
		<template v-for="(item, key) in push.config">
			<el-checkbox v-if="!limitType.includes(item.name)" :key="key" size="small" :name="item.name"
				:value="item.name" :disabled="!item.setup || !item.isConfig" @change="checkChange(item)">
				<div>
					<span>{{ item.title }}</span>
					<span v-if="!item.setup || !item.isConfig">
						[
						<span class="bt-link !text-danger" @click="configMessageChannels(item)">
							<!-- <template v-if="!item.setup">点击安装</template> -->
							<template v-if="!item.isConfig || !item.setup">
								<span class="text-danger">未配置</span>
							</template>
						</span>
						]
					</span>
				</div>
			</el-checkbox>
		</template>
	</el-checkbox-group>
	<!-- </div> -->
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { pushMessageConfigDialog } from '@/public'
import { getAlarmModule, installAlarmModule } from '@api/global'
import { useGlobalStore } from '@store/global'

interface Prop {
	modelValue: string[]
	name?: string
	prop?: string
	limitType?: string[] // 限制类型
}
interface ConfigPopos {
	title: string
	type: string
	callback?: (data: any) => void
}

const props = withDefaults(defineProps<Prop>(), {
	modelValue: () => [],
	name: 'give',
	limitType: () => ['sms'],
})
const { load: $load, error: $error } = useMessage()
const emit = defineEmits(['input', 'change'])

const { push, getSenderAlarmListInfo } = useGlobalStore()

const giveGroupModel = defineModel<string[]>()

const checkChange = (val: string[]) => {
	emit('change', val)
}

/**
 * @description 配置消息通道
 */
const configMessageChannels = async (item: AnyObject) => {
	let config: ConfigPopos = {
		title: '',
		type: '',
	}
	let load: any = null
	switch (item.name) {
		case 'dingding':
			config = { title: '钉钉机器人配置', type: 'dingding' }
			break
		case 'feishu':
			config = { title: '飞书机器人配置', type: 'feishu' }
			break
		case 'mail':
			config = { title: '发送者配置', type: 'mail' }
			break
		case 'weixin':
			config = { title: '企业微信机器人配置', type: 'weixin' }
			break
		case 'wx_account':
			if (!item.setup) {
				try {
					load = $load('正在安装微信公众号模块，请稍后...')
					const { data } = await getAlarmModule()
					if (!data.wx_account.setup) {
						const { status } = await installAlarmModule('wx_account')
						if (!status) {
							$error('微信公众号模块安装失败')
							return
						} else {
							await getSenderAlarmListInfo()
							config = { title: '微信公众号', type: 'wx_account' }
						}
					}
				} catch (error) {
					console.log(error)
				} finally {
					load && load.close()
				}
			} else {
				config = { title: '微信公众号', type: 'wx_account' }
			}
			break
	}
	pushMessageConfigDialog({
		...config,
		callback: getSenderAlarmListInfo || (() => { }),
	})
}

onMounted(() => {
	getSenderAlarmListInfo()
})

defineExpose({
	refresh: getSenderAlarmListInfo,
})
</script>
