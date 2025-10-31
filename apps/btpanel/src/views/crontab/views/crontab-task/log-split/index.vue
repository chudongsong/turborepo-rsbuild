<template>
	<div class="p-[20px]">
		<div class="mt-[16px] flex items-center">
			<el-popover placement="bottom" width="200" popper-class="green-tips-popover" trigger="hover">
				<span class="p-[8px] inline-block">当日志文件过大时，读取和搜索时间会增加，同时也会占用存储空间，因此需要对日志进行切割以方便管理和维护。</span>
				<template #reference>
					<el-checkbox v-model="splitForm.status" @change="changeSplit">日志切割</el-checkbox>
				</template>
			</el-popover>
			<span class="ml-[8px]">{{ tips }} </span>
		</div>
		<el-divider></el-divider>
		<div class="py-[20px]">
			<el-form ref="logSplitRef" :model="splitForm" :rules="rules" class="-ml-3rem">
				<el-form-item label="切割方式">
					<el-radio-group v-model="splitForm.stype" @change="changeSplitTips">
						<el-radio value="size">按日志大小</el-radio>
						<el-radio value="day">按执行周期</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="执行时间" v-if="splitForm.stype == 'day'">
					<div class="flex items-center">
						<el-form-item label="" prop="hour">
							<bt-input @blur="changeSplitTips" type="number" width="18.6rem" v-model="splitForm.hour" min="0" max="23">
								<template #prepend>每天</template>
								<template #append>时</template>
							</bt-input>
						</el-form-item>
						<el-form-item label="" prop="minute" class="!mt-0">
							<bt-input type="number" width="12rem" min="0" @blur="changeSplitTips" max="59" v-model="splitForm.minute">
								<template #append>分</template>
							</bt-input>
						</el-form-item>
					</div>
				</el-form-item>
				<el-form-item v-else-if="splitForm.stype == 'size'" label="日志大小" prop="log_size">
					<bt-input @blur="changeSplitTips" type="number" width="16rem" v-model="splitForm.log_size">
						<template #append>MB</template>
					</bt-input>
				</el-form-item>
				<el-form-item label="保留最新" prop="num">
					<bt-input type="number" v-model="splitForm.num" :min="1" width="14rem">
						<template #append>份</template>
					</bt-input>
				</el-form-item>
				<el-form-item label=" ">
					<el-checkbox v-model="splitForm.compress">切割后压缩日志</el-checkbox>
				</el-form-item>
				<el-form-item label=" ">
					<el-button type="primary" @click="onConfirm">保存</el-button>
				</el-form-item>
			</el-form>
			<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
				<li v-if="splitForm.stype === 'day'">
					每天的 {{ splitForm.hour?.toString() ? addZero(splitForm.hour) : '--' }}:{{ splitForm.minute.toString() ? addZero(splitForm.minute) : '--' }}
					执行一次， 被切割后日志将会被清空
				</li>
				<template v-else>
					<li>每5分钟执行一次， 被切割后日志将会被清空</li>
					<li>【日志大小】：日志文件大小超过指定大小时进行切割日志文件</li>
				</template>
				<li>【保留最新】：保留最新的日志文件，超过指定数量时，将自动删除旧的日志文件</li>
				<li>该功能开启后会对计划任务在/www/server/cron目录下产生的日志(.log格式)进行切割</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { logSplitRef, splitForm, tips, changeSplit, onConfirm, rules, addZero, getSplitStatus, changeSplitTips } from './useController'

defineExpose({ onConfirm })

onMounted(() => getSplitStatus())
</script>
