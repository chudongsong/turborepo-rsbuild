<template>
	<div class="flex items-center">
		<template v-for="(item, index) in options">
			<!-- 分割线 -->
			<template v-if="item.division">
				<el-divider :key="'division' + index" class="!h-[25px]" direction="vertical" />
			</template>

			<!-- 按钮 -->
			<template v-if="isHide(item) && !item.dropdown">
				<el-button :key="index" :size="item.size || ''" :type="buttonType(item)" :title="isBoolean(item.title) ? item.content : item.title" class="!flex items-center" @click="item.event">
					<i v-if="item.icon" :class="item.icon + ' mr-4px'"></i>
					<span :class="'flex items-center ' + item.class"> {{ item.content }}</span>
				</el-button>
			</template>

			<!-- 下拉按钮类型 -->
			<template v-if="isHide(item) && item.dropdown">
				<el-dropdown :key="'dropdown' + index" :split-button="item.splitButton" :type="buttonType(item)" size="small" @click.native="item.event">
					<el-button v-if="!item.splitButton" type="default">
						{{ item.content }}
						<i class="svgtofont-arrow-down ml-4px text-small"></i>
					</el-button>
					<span v-if="item.splitButton">{{ item.content }}</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item v-for="(option, i) in item.settingList" :key="i" class="!py-0 !px-[1.5rem] !leading-[2.7rem]" :class="option.hide === true ? 'hidden' : ''" @click.native="item.event(option.name)">
								<span v-if="!option.description">{{ option.label }}</span>
								<div v-if="option.description" class="inline-block flex flex-col py-[12px] mb-[8px]">
									<span class="text-secondary text-base mb-[8px]">{{ option.label }}</span>
									<span class="text-tertiary text-small" v-html="option.description"></span>
								</div>
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
import { isBoolean, isFunction } from '@utils/index'
import type { BtnGroupProps } from './types'

interface Props {
	options: Array<BtnGroupProps>
}

withDefaults(defineProps<Props>(), {
	options: () => [], // 按钮组配置
})

/**
 * @description 是否隐藏
 * @param {BtnGroupProps} item 按钮配置
 */
const isHide = (item: BtnGroupProps) => {
	return !item.hide || (isFunction(item.hide) && !item.hide())
}

/**
 * @description 按钮类型
 */
const buttonType = (item: BtnGroupProps) => {
	return item.active ? 'primary' : 'default'
}
</script>

<style scoped lang="css">
:deep(.el-dropdown .el-dropdown__caret-button) {
	height: 3.2rem;
}

.el-dropdown {
	margin: 0 1rem;
}

:deep(.el-dropdown .el-button) {
	height: 3.2rem;
}

:deep(.el-button-group) {
	display: inline-flex;
	flex-wrap: nowrap;
}
</style>
