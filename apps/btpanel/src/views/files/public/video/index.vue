<template>
	<div class="flex">
		<video type="" :src="videoSrc" controls="controls" controlslist="nodownload" autoplay="autoplay" width="640" height="360">您的浏览器不支持 video 标签。</video>
		<div class="video-list">
			<div v-for="item in videoList" :key="item.name" :class="`video-item ${videoUrl === currentPath + '/' + item.name ? 'active' : ''}`" @click="playVideo(item.name)">
				<div class="video-item-name w-[16rem]">{{ item.name }}</div>
				<div class="video-item-size">{{ getByteUnit(item.size) }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { getByteUnit } from '@/utils/index'
import { storeToRefs } from 'pinia'
import FILES_VIDEO_STORE from './store'

const store = FILES_VIDEO_STORE()
const { videoUrl, videoList } = storeToRefs(store)
const { currentPath, getList, playVideo, $reset } = store

const videoSrc = computed(() => {
	return '/download?filename=' + encodeURIComponent(videoUrl.value) + '&play=true'
})

onMounted(async () => {
	getList()
})

onUnmounted(() => {
	$reset()
})
</script>

<style scoped lang="css">
.video-list {
	@apply w-[26rem];
}

.video-item {
	@apply flex p-8px cursor-pointer justify-between items-center border-b-1 border-solid border-[#f0f0f0];
}

.video-item.active {
	background-color: #f0f0f0;
}

.video-item.active .video-item-name {
	@apply text-primary;
}
</style>
