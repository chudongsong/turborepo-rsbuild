<template>
	<el-alert v-if="isUpgrade" type="warning" class="!mb-[1.2rem] !p-[1.2rem]" :closable="false" show-icon>
		<template v-slot:title>
			<span class="text-base">
				<span> 提示：有一个新版本（{{ cloudVersionInfo?.version }}）可更新，更新时间：{{ cloudVersionInfo?.uptime }}</span>
				<el-button class="!ml-[1.2rem]" type="primary" @click="updateService">立即更新</el-button>
				<el-popover placement="bottom-start" width="200" trigger="hover" v-if="cloudVersionInfo?.updateMsg">
					<template #default>
						<div class="update-details" v-html="cloudVersionInfo?.updateMsg"></div>
					</template>
					<template #reference>
						<span class="!ml-[1.2rem] bt-link text-small">详情</span>
					</template>
				</el-popover>
			</span>
		</template>
	</el-alert>
</template>

<script lang="ts" setup>
import { getVersionsInfo } from '@/utils/check'
import { useSettingsStore } from '@/views/vhost/views/settings/useStore'
import { updateServiceApi } from '@/api/vhost'
import { useDataHandle } from '@/hooks/tools'

const isUpgrade = ref(false)
const isLoading = ref(false)
const isDestroyed = ref(false) // 组件销毁标识
const { version, cloudVersionInfo, getInfo, getCloudVersionInfo } = useSettingsStore()

/**
 * @description 比较版本号大小
 * @param {string} version1 版本号1
 * @param {string} version2 版本号2
 * @returns {boolean} true: version1 >= version2, false: version1 < version2
 */
const compareVersion = (version1: string, version2: string) => {
	const { versionArr, cloudVersionArr } = getVersionsInfo(version1, version2)

	// 逐位比较版本号，从左到右按优先级
	for (let i = 0; i < versionArr.length; i++) {
		const a = versionArr[i]
		const b = cloudVersionArr[i]

		if (a > b) return true // version1 > version2
		if (a < b) return false // version1 < version2
		// 如果相等，继续比较下一位
	}

	// 所有位都相等，version1 = version2，返回 true
	return true
}

const getIsUpgrade = () => {
	// 使用 cloudVersionInfo 进行版本比较
	if (cloudVersionInfo.value && cloudVersionInfo.value.version && cloudVersionInfo.value.version.trim() !== '') {
		isUpgrade.value = !compareVersion(version.value, cloudVersionInfo.value.version)
	} else {
		isUpgrade.value = false
	}
}

/**
 * 延迟获取云端版本信息，确保页面渲染完成后再调用
 */
const fetchCloudVersionInfo = async () => {
	// 防御性编程：组件销毁时停止执行
	if (isDestroyed.value || isLoading.value) return

	isLoading.value = true
	try {
		await getCloudVersionInfo()
		// 再次检查组件是否已销毁
		if (!isDestroyed.value) {
			getIsUpgrade()
		}
	} catch (error) {
		console.error('获取云端版本信息失败:', error)
		// 防御性编程：确保错误不影响页面显示
		if (!isDestroyed.value) {
			isUpgrade.value = false
		}
	} finally {
		if (!isDestroyed.value) {
			isLoading.value = false
		}
	}
}

const updateService = () => {
	useDataHandle({
		loading: '更新中...',
		request: updateServiceApi(),
		message: true,
		success: async () => {
			// 更新完成后重新获取服务信息和云端版本信息
			await getInfo()
			await getCloudVersionInfo()
			getIsUpgrade()
		},
	})
}

onMounted(async () => {
	// 先基于现有数据进行版本比较
	getIsUpgrade()

	// 使用 nextTick 确保 DOM 渲染完成，然后延迟获取云端版本信息
	await nextTick()
	setTimeout(() => {
		fetchCloudVersionInfo()
	}, 100) // 100ms 延迟，确保页面渲染完成
})

// 组件销毁时清理状态
onBeforeUnmount(() => {
	isDestroyed.value = true
})
</script>

<style scoped></style>
