<template>
	<div class="flex flex-col p-[2rem]" v-bt-loading="loading" v-bt-loading:title="'正在获取插件评分，请稍候...'">
		<div class="commentTitle">
			<div class="commentLeft">
				<div class="commentNum">{{ pluginScore.avg || '0.0' }}</div>
				<ul class="commentNumTips">
					<li>
						使用人数&nbsp;<span class="commentUserCount">{{ pluginScore.count }}</span>
					</li>
					<li>
						共&nbsp;<span class="commentPartake">{{ pluginScore.total }}</span
						>&nbsp;人参与评分
					</li>
					<li>
						<span class="commentRate">{{ pluginScore.rate }}%</span>&nbsp;好评率
					</li>
				</ul>
			</div>
			<div class="commentRight">
				<div v-for="item in 5" :key="item" class="commentStarGroup">
					<div class="commentStar">
						<span v-for="star in 5 - item + 1" :key="star" class="svgtofont-el-star-filled text-[#F6BA2A]" aria-hidden="true"></span>
					</div>
					<div class="commentProgress">
						<div class="commentProgressBgw" :style="{ width: `${pluginScore.starList[item - 1]}%` }"></div>
						<div class="commentProgressSpeed"></div>
					</div>
				</div>
			</div>
		</div>
		<el-divider class="mt-[0rem] mb-[2rem]" />
		<div class="flex flex-col items-center">
			<el-rate class="" v-model="score"></el-rate>
			<div class="mt-[2rem]">{{ getComment(score) }}:{{ score }}分</div>
			<el-button type="primary" class="submit" size="large" title="参与评分" @click="onSubmitScore">参与评分</el-button>
		</div>
	</div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { SOFT_STORE } from '../../store'

const { getComment, getDetail, onSubmitScore, $reset_score } = SOFT_STORE()
const { loading, pluginScore, score } = storeToRefs(SOFT_STORE())

onUnmounted($reset_score)

onMounted(getDetail)
</script>
<style lang="css" scoped>
.commentTitle {
	@apply flex items-center justify-between px-[1rem];
}
.commentLeft {
	@apply flex items-center h-[10rem];
}
.commentNum {
	@apply text-[6rem] text-secondary;
}
.commentNumTips {
	@apply flex flex-col justify-between ml-[2rem] py-[2rem];
}
.commentNumTips li {
	@apply text-tertiary text-base mt-[.5rem];
}
.commentRight {
	@apply w-[23rem] h-[10rem] py-[2rem] ml-[3rem] mt-[1rem];
}
.commentStarGroup {
	@apply h-[1rem] mt-[.1rem];
}
.commentStar {
	@apply w-[6.5rem] flex items-center justify-end;
}
.commentProgress {
	@apply w-[15rem] h-[.6rem] relative ml-[7.8rem] top-[-1.2rem];
}
.commentProgressBgw {
	@apply h-[.6rem] bg-darker rounded-small absolute top-0 left-0 z-50;
}
.commentProgressSpeed {
	@apply w-[15rem] h-[.6rem] bg-dark rounded-small;
}
:deep(.el-rate__icon) {
	@apply text-[4rem];
}
.submit {
	@apply mt-[1rem] w-[20rem] rounded-small;
}
</style>
