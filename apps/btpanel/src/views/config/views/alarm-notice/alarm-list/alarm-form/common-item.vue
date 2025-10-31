<template>
	<el-form-item v-if="show" :label="labelName" :class="itemClass">
		<template v-if="data.type === 'number'">
			<el-input v-model.number="valueRef" type="number" class="!w-[15rem]" :text-type="data.unit" @input="validateNum" @blur="setDefaultNum">
				<template #append v-if="data.unit">{{ data.unit }}</template>
			</el-input>
			<div v-if="data.suffix" v-html="data.suffix" class="ml-[1rem]"></div>
		</template>
		<template v-if="data.type === 'textarea'">
			<el-input v-model="valueRef" type="textarea" :text-type="data.unit" class="!w-[15rem]" @blur="setDefaultText">
				<template #append>{{ data.unit }}</template>
			</el-input>
			<div v-if="data.suffix" v-html="data.suffix" class="ml-[1rem]"></div>
		</template>
		<template v-if="data.type === 'select' || data.type === 'cascader' || data.type === 'multiple-select'">
			<FormSelect :data="data" :tid="tid" :value="valueRef" :cycles="cycles" :row="row" @update:value="onChangeSelect"></FormSelect>
		</template>
		<template v-if="data.type === 'help'">
			<ul class="help-info-text c7" :style="data.style">
				<li v-for="item in data.list" :key="item">{{ item }}</li>
			</ul>
		</template>
		<template v-if="data.type === 'radio'">
			<el-radio-group v-model="valueRef">
				<el-radio :value="radio.value" v-for="(radio, index) in data.items" :key="index" @change="onInputRadio"> {{ radio.title }}</el-radio>
			</el-radio-group>
		</template>
		<template v-if="data.type === 'link'">
			<span class="bt-link" v-html="data.list"></span>
		</template>
		<template v-if="data.type === 'date'">
			<bt-date-picker v-model="valueRef" value-format="X" class="date" type="date" @clear="clearDate" :placeholder="valueRef === 0 ? data.default_show : '选择日期'" @change="onChangeDate"></bt-date-picker>
			<el-button type="default" class="!ml-[.4rem]" @click="clearDate"> 设为{{ data.default_show }} </el-button>
			<span class="ml-[1rem]" v-if="data.show_format && valueRef !== 0">{{ formattedShowText }}</span>
		</template>
	</el-form-item>
</template>

<script lang="ts" setup>
import type { Field } from '@config/types'
import FormSelect from './select.vue'
import { formatTime, isNumber } from '@utils/index'

interface Props {
	tid: string
	value: any
	data: Field
	row: any
	currentTemplate: any
}

const props = withDefaults(defineProps<Props>(), {
	tid: '',
	value: '',
	row: {},
	currentTemplate: {},
})

const { tid, data, row, currentTemplate } = toRefs(props)
const emit = defineEmits<{
	(event: 'update:value', val: any): void
}>()

const valueRef = computed<any>({
	get() {
		return props.value
	},
	set(val) {
		emit('update:value', { val, attr: data.value.attr })
	},
})

/**
 * @description 处理label空格问题
 */
const labelName = computed(() => {
	return data.value.name === ' ' ? '\u00A0' : data.value.name
})

const inlineMap = {
	'4': ['cycle', 'count'], // SSH登录失败告警
	'21': ['cycle', 'count'], // 首页cpu告警
	'22': ['cycle', 'count'], // 首页负载告警
	'23': ['cycle', 'count'], // 首页内存告警
	'123': ['hour', 'minute'], // 系统文件完整性提醒
}

const cycles = ['21', '22', '23'] // 首页cpu,负载,内存告警

// 判断当前表单项是否应该 inline 显示
const shouldBeInline = computed(() => {
	if (!currentTemplate.value?.sorted) return false

	// 在 sorted 数组中找到当前表单项所在的行
	const currentRow = currentTemplate.value.sorted.find(row => row.includes(data.value.attr))

	// 如果找到所在行，且该行有多个元素，则应该 inline 显示
	return currentRow && currentRow.length > 1
})

// 移除原来的 itemClass 计算属性，使用新的逻辑
const itemClass = computed(() => {
	const classes = []

	// 检查是否需要 inline
	if (shouldBeInline.value) {
		classes.push('inline')
	}

	// 检查特殊的 inline 映射
	const entries = Object.entries(inlineMap)
	for (let i = 0; i < entries.length; i++) {
		const [key, val] = entries[i]
		if (key === tid.value && val.includes(data.value.attr)) {
			classes.push('inline')
		}
	}

	return classes.join(' ')
})

const showMap = {
	'1': ['interval'], // 网站证书(SSL)到期
	'2': ['interval'], // 网站到期
	'3': ['interval'], // 面板密码有效期
	'4': ['interval'], // SSH登录失败告警
}

/**
 * @description 验证表单数字
 * @param {string} val 表单值
 */
const validateNum = (val: number) => {
	const reg = /^[0-9]*$/
	if (!reg.test(String(val)) || val <= 0) {
		valueRef.value = 1
	}
}

/**
 * @description 为空时设置默认值
 */
const setDefaultNum = () => {
	if (valueRef.value === '') {
		valueRef.value = 1
	}
}
const setDefaultText = () => {
	if (valueRef.value === '') {
		valueRef.value = data.value.default
	}
}

const { fields } = inject('alarm-list-form') as {
	fields: Ref<Field[]>
}

const onChangeSelect = (val: string | number) => {
	// 任务类型 = 项目停止告警 & 当前行为项目类型
	if (tid.value === '9' && data.value.attr === 'cycle') {
		if (isNumber(val)) {
			fields.value.forEach((fieldGroup: any) => {
				fieldGroup.forEach((item: any) => {
					if (item.all_items) {
						const list = item.all_items[Number(val) - 1]
						if (list) {
							item.items = list
							item.value = ''
						}
					}
				})
			})
		}
		setValue(val)
	} else {
		setValue(val)
	}
}

/**
 * @description 设置表单值
 * @param val

 */
const setValue = (val: any) => {
	fields.value.forEach((fieldGroup: any) => {
		fieldGroup.forEach((item: any) => {
			if (item.attr === data.value.attr) {
				item.value = val
			}
		})
	})
}

const onInputRadio = (val: string | number) => {
	// 任务类型 = 首页磁盘告警
	if (tid.value === '20') {
		// 获取第三组的第一个字段
		const thirdGroupField = fields.value[2]?.[0]
		if (thirdGroupField) {
			switch (val) {
				case 1:
					thirdGroupField.unit = 'GB'
					thirdGroupField.name = '占用超过'
					break
				case 2:
					thirdGroupField.unit = '%'
					thirdGroupField.name = '占用率超过'
					break
				default:
					break
			}
		}
	}
}

const show = computed(() => {
	const entries = Object.entries(showMap)
	for (let i = 0; i < entries.length; i++) {
		const [key, val] = entries[i]
		if (key === tid.value && val.includes(data.value.attr)) {
			return false
		}
	}
	return true
})

const formattedShowText = computed(() => {
	if (!data.value.show_format || !valueRef.value) return ''
	return data.value.show_format.replace('${value}', formatTime(valueRef.value, 'yyyy-MM-dd'))
})

const onChangeDate = (val: string | number | null) => {
	if (!val) {
		valueRef.value = 0
		return
	}
	const timestamp = Number(val)
	if (isNaN(timestamp)) {
		valueRef.value = 0
		return
	}
	valueRef.value = timestamp
}

const clearDate = () => {
	valueRef.value = 0
}
</script>

<style lang="css" scoped>
.el-form-item.inline {
	display: inline-flex;
}

.el-form-item.inline + .inline :deep(.el-form-item__label) {
	min-width: auto;
	margin-right: 10px;
}

.el-form-item :deep(.el-form-item__content) {
	display: flex;
	align-items: center;
	font-size: var(--el-font-size-small);
}

.el-form-item :deep(.el-form-item__content .el-select) {
	margin-top: -2px;
}

.el-radio-group :deep(.el-radio__label) {
	font-size: var(--el-font-size-small);
	font-weight: normal;
}

.help-info-text li {
	list-style: inside disc;
	line-height: 24px;
	font-size: var(--el-font-size-small);
	color: var(--el-color-text-secondary);
}

:deep(.el-loading-spinner i) {
	color: var(--el-color-primary);
}

:deep(.el-loading-spinner .el-loading-text) {
	color: var(--el-color-primary);
}

:deep(.bt-input-group) {
	width: 15rem;
}
</style>
