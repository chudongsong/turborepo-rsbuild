<template>
	<bt-install-mask>
		<template #content>
			<div class="flex items-center font-bold text-base">
				<span>当前站点目录未启用防篡改，</span>
				<bt-link @click="openTamperEvent" class="!font-bold !text-small">点击开启</bt-link>
			</div>
		</template>
	</bt-install-mask>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { multiCreate } from '@api/site'
import { useSiteStore } from '@/views/site/useStore'

const { siteInfo } = useSiteStore()

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const Message = useMessage() // 消息提示

/**
 * @description: 开启防篡改
 */
const openTamperEvent = async () => {
	const load = Message.load('正在开启防篡改')
	try {
		const { data } = await multiCreate({
			paths: JSON.stringify([{ path: siteInfo.value.path + '/', ps: siteInfo.value.name }]),
		})
		if (data.length && data[0].status) {
			Message.success('开启防篡改成功')
			props.compData.init()
		} else {
			Message.error('开启防篡改失败')
		}
	} catch (error) {
		console.log(error)
	} finally {
		load.close()
	}
}
</script>

<style scoped></style>
