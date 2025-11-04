<template>
	<div class="p-[2rem]">
		<div class="warm-tips">
			<i class="svgtofont-el-warning text-warning mr-[0.8rem] text-large"></i>
			<span class="text-warning"> 温馨提示：预览编辑界面，可以预览和修改当前概览界面，添加自己需要的工具和模块 </span>
		</div>
		<div class="flex flex-col">
			<div class="text-base mb-[1rem] font-bold leading-[2.2rem]">模板</div>
			<div class="overview-box min-h-[20rem]" v-bt-loading="isLoading">
				<div class="overview-item" v-for="(item, index) in overviewModelList" :key="index">
					<div class="content">
						<span class="model-title"> {{ item.title }}</span>
						<div class="model-content">
							<template v-if="item.template === 'browse'">
								<div class="model mt-[16px]">
									<div class="to-day"><span class="">今日</span><span class="font-bold">-</span></div>
									<div class="yester-day"><span>昨日</span><span class="font-bold">-</span></div>
								</div>
							</template>
							<template v-else>
								<span class="font-bold mt-[24px] text-base">-</span>
							</template>
						</div>
					</div>
					<div class="operate">
						<div class="flex items-center">
							<span class="mr-[.6rem]">显示</span>
							<el-switch v-model="item.isShow" :width="32" size="small" @change="store.setOverviewTemplateShow(item)" />
						</div>
						<template v-if="supportConfig.indexOf(item.name) > -1 || supportPath.indexOf(item.name) > -1">
							<el-divider direction="vertical" />
							<el-popover :visible="item.overviewPopover" placement="top" width="320" popper-class="el-tooltip-white overview-popover">
								<div class="py-1rem">
									<el-form :model="form" label-width="60px">
										<template v-for="(itemx, indexs) in item.params" :key="indexs">
											<div v-if="item.name">
												<el-form-item :label="itemx.name" :class="`${itemx.type === 'select' ? '' : '!mb-0'}`">
													<el-select v-if="itemx.type === 'select'" v-model="form['val' + indexs]" :placeholder="'请选择' + itemx.name">
														<el-option v-for="(itx, indx) in itemx.option" :key="indx" :label="itx.name" :value="indx" />
													</el-select>
													<bt-input-icon v-else v-model="form.val0" v-trim name="path" icon="el-folder-opened" readonly @icon-click="store.onPathChange(item)" width="20rem" />
												</el-form-item>
											</div>
										</template>
									</el-form>
									<div class="flex w-full justify-end" v-if="item.name !== 'open_dir'">
										<div>
											<el-button type="default" @click="item.overviewPopover = false"> 取消 </el-button>
											<el-button type="primary" @click="store.addOverviewFun(item)">确认</el-button>
										</div>
									</div>
								</div>
								<template #reference>
									<span class="cursor-pointer mr-[16px]" @click="store.setPopoverShow(item, index)"> 设置 </span>
								</template>
							</el-popover>
						</template>
						<template v-else>
							<span></span>
							<span></span>
						</template>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import HOME_OVERVIEW_STORE from '@home/views/overview/store'
import { storeToRefs } from 'pinia'

const store = HOME_OVERVIEW_STORE()
const { isLoading, overviewModelList, supportConfig, supportPath, form } = storeToRefs(store)

onMounted(async () => {
	await store.getOverviewData()
	await store.getOverviewTemplateData()
	store.dataAlignment()
})
</script>

<style lang="css" scoped>
.warm-tips {
	@apply leading-[3.6rem] h-[3.6rem] px-[1rem] mb-[2rem] rounded-small flex items-center;
	background: rgba(var(--el-color-warning-rgb), 0.1);
}

.overview-box {
	@apply group-b flex flex-wrap items-center align-middle justify-start gap-[1.6rem];
}

.overview-item {
	@apply border-1 border-dark rounded-base pt-[1.6rem] h-[9.9rem] w-[17.9rem] relative h-[12rem] flex flex-col justify-between;
	background-color: var(--el-fill-color-extra-light);
	&:hover {
		box-shadow: 0 0 38px rgb(var(--el-color-black-rgb), 0.2) inset;
		-webkit-transition: all 0.25s ease;
		transition: all 0.25s ease;
	}
}

.content {
	@apply px-[1.2rem];
}

.model-title {
	@apply text-tertiary leading-[2.4rem] text-base;
}

.model-content {
	@apply h-[3.6rem];
}

.model {
	@apply text-tertiary flex justify-between;
}

.to-day,
.yester-day {
	@apply flex items-center flex-row flex-1 whitespace-nowrap;
}

.to-day span,
.yester-day span {
	@apply text-secondary text-extraLarge;
}

.to-day span:first-child,
.yester-day span:first-child {
	@apply text-tertiary text-base pr-[.8rem];
}

.operate {
	@apply flex justify-between px-[1.2rem] h-[3rem] items-center border-t-[1px] border-lighter;
}
</style>
<style lang="css">
.overview-popover .el-form-item__label {
	min-width: 6rem !important;
}
</style>
