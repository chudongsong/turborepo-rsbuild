import { StyleValue } from 'vue'
import { isRecombinationStyle } from '../components/base'
import { version, columns_source, column_map, cell_map, comp_style_map, allStyleCollection, comp_map, cellStyle, columnStyle, cell_style_map, column_row_style_map, compOptions, emailData, updateThroughAnchor, page_style, currentEditCompKey, configPanelType } from '../store'
import { ColumnConfig, Comp_Style, DragComponentType, MoreConfigStyle, RecombinationStyle } from '../components/base'
import { columnsSourceToTable, eventBUS } from '../styleEngine'

type CloneableTypes = number | string | boolean | Date | RegExp | Map<any, any> | Set<any> | Array<any> | Object | undefined

/**
 * 深拷贝函数，与 lodash-es 的 cloneDeep 行为一致
 * @param value 需要深拷贝的值
 * @returns 深拷贝后的新值
 */
export function cloneDeep<T extends CloneableTypes>(value: T): T {
	// 处理基本类型和 null/undefined
	if (value == null || typeof value !== 'object') {
		return value
	}

	// 处理 Date
	if (value instanceof Date) {
		return new Date(value.getTime()) as T
	}

	// 处理 RegExp
	if (value instanceof RegExp) {
		return new RegExp(value.source, value.flags) as T
	}

	// 处理 Map
	if (value instanceof Map) {
		const result = new Map()
		value.forEach((val, key) => {
			result.set(cloneDeep(key), cloneDeep(val))
		})
		return result as T
	}

	// 处理 Set
	if (value instanceof Set) {
		const result = new Set()
		value.forEach(val => {
			result.add(cloneDeep(val))
		})
		return result as T
	}

	// 处理数组
	if (Array.isArray(value)) {
		return value.map(item => cloneDeep(item)) as T
	}

	// 处理普通对象
	const result = Object.create(Object.getPrototypeOf(value))

	// 处理不可枚举属性和 symbol 属性
	const props = [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)]

	props.forEach(key => {
		const descriptor = Object.getOwnPropertyDescriptor(value, key)
		if (descriptor) {
			const newDescriptor = { ...descriptor }
			if (descriptor.value !== undefined) {
				newDescriptor.value = cloneDeep(descriptor.value)
			}
			Object.defineProperty(result, key, newDescriptor)
		}
	})

	return result
}

/************************************************************ 对column、cell、comp等数据表的操作 ************************************************************/
/**
 * @description 从菜单拖拽成员到视图区，新增column
 */
export function dragColumnToView(item: ColumnConfig, position: number) {
	if (item.key == '0') {
		const columnKey = getRandom()
		// 在column_source中插入新数据
		insertColumnSource(columnKey, position)
		// 为columnKey初始化一个新的column配置
		insertColumnMap(columnKey)
		insertStyleMap(columnKey, 'columns' as DragComponentType)
	}

	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 为columns_source新增一个columnKey（也可以排序）
 */
function insertColumnSource(columnKey: string, index: number) {
	columns_source.value.splice(index, 0, columnKey)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 在column_map中新增一个column,默认插入一个cell
 */
function insertColumnMap(columnKey: string) {
	const cellKey = getRandom()
	column_map.value[columnKey] = {
		type: DragComponentType.Columns,
		name: '列',
		key: columnKey,
		children: [cellKey],
	}
	// 默认插入一个cell
	insertCellMap(cellKey)
	// 默认创建一份columnStyle样式
	insertColumnRowStyle(columnKey)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 为指定column新增一个cell
 */
export function insertCellToColumn(columnKey: string, cellKey: string) {
	// 先在column中新增cellKey
	column_map.value[columnKey].children.push(cellKey)
	// 再为cell_map新增一个cell
	insertCellMap(cellKey)

	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 在cell_map中插入新数据
 */
function insertCellMap(cellKey: string) {
	cell_map.value[cellKey] = {
		width: '100%',
		key: cellKey,
		children: [],
	}
	// 在cell_style_map中创建一份对应样式
	insertCellStyle(cellKey)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 为cell_map中某一个cell添加组件comp
 */
export function insertCompToCell(cellKey: string, compKey: string, compType: DragComponentType) {
	cell_map.value[cellKey].children.push(compKey)
	// 随后在comp_map中初始化一个组件数据
	insertCompMap(compKey, compType)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 为cell_map中某一个cell添加组件comp
 */
export function spliceCompToCell(cellKey: string, compKey: string, compType: DragComponentType, index: number) {
	cell_map.value[cellKey].children.splice(index, 0, compKey)
	// 随后在comp_map中初始化一个组件数据
	insertCompMap(compKey, compType)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 在comp_map中插入数据
 */
export function insertCompMap(compKey: string, compType: DragComponentType) {
	comp_map.value[compKey] = {
		key: compKey,
		type: compType,
	}
	// 同时为组件初始化一份样式
	insertStyleMap(compKey, compType)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 在style_map样式表中插入新数据
 */
export function insertStyleMap(compKey: string, compType: DragComponentType) {
	comp_style_map.value[compKey] = cloneDeep(allStyleCollection[compType] as Comp_Style)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 删除style_map中指定数据
 */
export function delFromStyleMap(compKey: string) {
	delete comp_style_map.value[compKey]
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 删除comp_map中指定的组件
 */
export function delFromCompMap(compKey: string, cellKey: string) {
	// 先删除所有样式
	delFromStyleMap(compKey)
	// 再删除自己
	delete comp_map.value[compKey]
	// 最后在cell_map中删除对应的组件
	cell_map.value[cellKey].children = cell_map.value[cellKey].children.filter(key => key !== compKey)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 删除cell_map中指定的cell单元格
 */
export function delFromCellMap(cellKey: string, columnKey: string) {
	// 先删除cell下属所有组件
	cell_map.value[cellKey].children.forEach(compKey => {
		delFromCompMap(compKey, cellKey)
	})
	// 再删除cell自己
	delete cell_map.value[cellKey]
	// 再删除column_map中对应的cellKey
	column_map.value[columnKey].children = column_map.value[columnKey].children.filter(key => key !== cellKey)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 删除column_map中指定的column列
 */
export function delFromColumnMap(columnKey: string) {
	configPanelType.value = ''
	currentEditCompKey.value = ''
	// 先删除下属所有cell单元格
	column_map.value[columnKey].children.forEach(cellKey => {
		delFromCellMap(cellKey, columnKey)
	})
	// 再删除自己
	delete column_map.value[columnKey]
	// 最后从column_source中删除这个column
	columns_source.value = columns_source.value.filter(key => key !== columnKey)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 在cell_style_map表中插入数据
 */
export function insertCellStyle(cellKey: string) {
	cell_style_map.value[cellKey] = cloneDeep(cellStyle)
}

/**
 * @description 在column_row_style_map表中插入数据
 */
export function insertColumnRowStyle(columnKey: string) {
	column_row_style_map.value[columnKey] = cloneDeep(columnStyle)
}

/**
 * @description comp排序:左冒泡
 */
export function compSortLeft(cellKey: string, compKey: string, targetKey: string) {
	const compIndex = cell_map.value[cellKey].children.findIndex(key => key == compKey)
	const targetIndex = cell_map.value[cellKey].children.findIndex(key => key == targetKey)
	if (compIndex !== -1 && targetIndex !== -1 && compIndex > targetIndex) {
		cell_map.value[cellKey].children.splice(compIndex, 1)
		cell_map.value[cellKey].children.splice(targetIndex, 0, compKey)
	}
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description comp排序：右冒泡
 */
export function compSortRight(cellKey: string, compKey: string, targetKey: string) {
	const compIndex = cell_map.value[cellKey].children.findIndex(key => key == compKey)
	const targetIndex = cell_map.value[cellKey].children.findIndex(key => key == targetKey)
	if (compIndex !== -1 && targetIndex !== -1 && compIndex < targetIndex) {
		cell_map.value[cellKey].children.splice(targetIndex, 1)
		cell_map.value[cellKey].children.splice(compIndex, 0, targetKey)
	}
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description column排序：左冒泡
 */
export function columnSortLeft(columnKey: string, targetKey: string) {
	const compIndex = columns_source.value.findIndex(key => key == columnKey)
	const targetIndex = columns_source.value.findIndex(key => key == targetKey)
	if (compIndex !== -1 && targetIndex !== -1 && compIndex < targetIndex) {
		columns_source.value[compIndex] = targetKey
		columns_source.value[targetIndex] = columnKey
	}
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}
/**
 * @description column排序：右冒泡
 */
export function columnSortRight(columnKey: string, targetKey: string) {
	const compIndex = columns_source.value.findIndex(key => key == columnKey)
	const targetIndex = columns_source.value.findIndex(key => key == targetKey)
	if (compIndex !== -1 && targetIndex !== -1 && compIndex > targetIndex) {
		columns_source.value[compIndex] = targetKey
		columns_source.value[targetIndex] = columnKey
	}
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 配置项中选择对应分列比例(比如：应用新的分列配比[33.33,33.33,33.33])
 */
export function columnPercentConfirm(newCellsWidth: number[], columnKey: string) {
	const cell_arr = column_map.value[columnKey].children
	// 新增cell
	if (cell_arr.length < newCellsWidth.length) {
		// 获取newCellWidth超过的个数
		const addCellLength = newCellsWidth.length - cell_arr.length
		// 以此遍历，新增对应的cell
		for (let i = 0; i < addCellLength; i++) {
			const newCellKey = getRandom()
			insertCellToColumn(columnKey, newCellKey)
		}
	} else {
		// 大于newCellWidth长度，默认从最后开始删除，先获取需要删除的cellKey集合
		const delCells = cell_arr.splice(newCellsWidth.length)
		// 遍历并执行cell的c删除操作
		delCells.forEach(cellKey => {
			delFromCellMap(cellKey, columnKey)
		})
	}
	// 处理结束后，使用新的宽度来覆盖原本宽度
	cell_arr.forEach((cellKey, index) => {
		cell_map.value[cellKey].width = newCellsWidth[index] + '%'
	})
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 新增column项的算法
 */
export function addCell(columnKey: string) {
	// 收集所有的cell宽度
	const cell_width_arr: number[] = []
	column_map.value[columnKey].children.forEach(cellKey => {
		cell_width_arr.push(Number(cell_map.value[cellKey].width.split('%')[0]))
	})

	const targetTotal = 100 // 目标总和
	const newValue = targetTotal / (cell_width_arr.length + 1) // 新项占总和的三分之一
	// 计算当前总和
	const currentTotal = cell_width_arr.reduce((sum, num) => sum + num, 0)
	// 计算需要调整的总和
	const totalAfterAddition = currentTotal + newValue
	const adjustment = targetTotal - totalAfterAddition
	// 计算比例因子
	const factor = adjustment / currentTotal
	// 添加新项
	cell_width_arr.push(newValue)
	// 按比例调整元素
	for (let i = 0; i < cell_width_arr.length - 1; i++) {
		cell_width_arr[i] += cell_width_arr[i] * factor // 调整每个元素
	}

	// 应用新的宽度到当前column
	columnPercentConfirm(cell_width_arr, columnKey)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 减少column项的算法
 */
export function removeColumnItem(cellKey: string, columnKey: string) {
	// 先收集所有cell的宽度集合（此处需要形成map结构，这样才能精准找到应该删除哪一个cell）
	const cell_width_arr_map: Record<string, number> = column_map.value[columnKey].children.reduce((p, v) => {
		const cellWidth = Number(cell_map.value[cellKey].width.split('%')[0])
		return { ...p, [v]: cellWidth }
	}, {})
	// 根据cellKey删除map中对应的宽度
	delete cell_width_arr_map[cellKey]
	// 得到新的宽度集合
	let width_arr = Object.values(cell_width_arr_map)
	// 目标总和
	const targetTotal = 100
	// 计算当前总和
	const currentTotal = width_arr.reduce((sum, num) => sum + num, 0)
	// 计算需要增加的值
	const adjustment = targetTotal - currentTotal
	// 计算比例因子
	const factor = adjustment / currentTotal
	// 按比例调整剩余项
	width_arr = width_arr.map(num => parseFloat((num * (1 + factor)).toFixed(2)))

	// 确保总和为 100
	const finalTotal = width_arr.reduce((sum, num) => sum + num, 0)
	const totalAdjustment = targetTotal - finalTotal
	// 如果有误差，均匀调整最后一项
	if (totalAdjustment !== 0) {
		width_arr[width_arr.length - 1] += totalAdjustment
	}
	// 删除对应的cell
	delFromCellMap(cellKey, columnKey)
	// 执行宽度覆盖
	columnPercentConfirm(width_arr, columnKey)
	// 通知事件中心更新模板html
	eventBUS.$emit('makeDom')
}

/**
 * @description 复制column
 * @param key
 */
export function copyColumn(key: string) {
	console.log(key)
	/* const index = columns_source.value.findIndex(item => item.key === key)
	if (index === -1) return
	const cloneColumn = cloneDeep(columns_source.value[index])
	cloneColumn.key = getRandom()
	columns_source.value.splice(index + 1, 0, cloneColumn) */
}

/**
 * @description 复制comp
 * @param key
 */
export function copyComp(compKey: string, cellKey: string) {
	const cellItem = cell_map.value[cellKey]
	const compItem = comp_map.value[compKey]
	const compStyle = comp_style_map.value[compKey]

	if (cellItem && compItem && compStyle) {
		const newStyle = cloneDeep(compStyle)
		const newComp = cloneDeep(compItem)
		const newCompKey = getRandom()

		const index = cellItem.children.findIndex(item => item === compKey)
		if (index !== -1) {
			cellItem.children.splice(index + 1, 0, newCompKey)
		}

		newComp.key = newCompKey
		comp_map.value[newCompKey] = newComp
		comp_style_map.value[newCompKey] = newStyle
	}
}

function configInit(data: string) {
	const info = JSON.parse(data)
	compOptions.value = info.compOptions
	cell_style_map.value = info.cell_style_map
	column_row_style_map.value = info.column_row_style_map
	column_map.value = info.column_map
	comp_map.value = info.comp_map
	cell_map.value = info.cell_map
	comp_style_map.value = info.comp_style_map
	columns_source.value = info.columns_source
	if (info.page_style) {
		page_style.value = info.page_style
	}
}

export function setEmailData(data: string) {
	if (!data) return

	configInit(data)
	updateThroughAnchor()
	eventBUS.$emit('makeDom')
}

export function resetEmailData() {
	columns_source.value = []
	column_map.value = {}
	cell_map.value = {}
	comp_map.value = {}
	cell_style_map.value = {}
	column_row_style_map.value = {}
	comp_style_map.value = {}
	compOptions.value = {}
}

export function versionCheck(render: string) {
	// 1.得到了id和render配置
	// 2.对比version版本，发现需要更新
	// 3.使用render生成一份新的html模板、新的render配置
	// 4.调用await请求，将新的html模板、render配置、id一并提交
	if (!render) return

	const info = JSON.parse(render)
	const infoVersion = info.version
	if (infoVersion !== version) {
		configInit(render)
		updateThroughAnchor()
		return {
			content: columnsSourceToTable().outerHTML,
			render: emailData.value,
		}
	}
	return null
}

/************************************************************  相关业务方法 ************************************************************/

/**
 * @description 生成一个随机字符串,用来作为拖拽源的key
 * @mention 有可能出现字符串重复，后续可以先与columns_source所有成员的key进行比对，如果重复则递归即可
 */
export function getRandom(length = 10) {
	return Math.random()
		.toString(16)
		.slice(2, 2 + length)
}

/**
 * @description 将驼峰字符串转换为中线连接语法，如：camelCase ==> camel-case
 */
export function camelCaseToKebab(camelCaseStr: string) {
	return camelCaseStr
		.replace(/(?<![A-Z])([A-Z][a-z])/g, function (match, p1) {
			return '-' + p1.toLowerCase()
		})
		.replace(/^-/, '')
}

/**
 * @description 对border、padding、margin等四边符合属性的translate方法
 */
export function recombinationStyleTranslate(recombination: MoreConfigStyle, attrKey: RecombinationStyle) {
	let all = ''
	let top = ''
	let right = ''
	let bottom = ''
	let left = ''

	if (attrKey == 'border') {
		all = 'border'
		top = 'borderTop'
		right = 'borderRight'
		bottom = 'borderBottom'
		left = 'borderLeft'
	}

	if (attrKey == 'padding') {
		all = 'padding'
		top = 'paddingTop'
		right = 'paddingRight'
		bottom = 'paddingBottom'
		left = 'paddingLeft'
	}

	if (attrKey == 'borderRadius') {
		all = 'borderRadius'
		top = 'borderTopLeftRadius'
		right = 'borderTopRightRadius'
		bottom = 'borderBottomRightRadius'
		left = 'borderBottomLeftRadius'
	}

	if (recombination.more) {
		return {
			[top]: recombination.top,
			[right]: recombination.right,
			[bottom]: recombination.bottom,
			[left]: recombination.left,
		}
	} else {
		return { [all]: recombination.all }
	}
}

/**
 * @description 将样式配置对象转换为style对象
 */
export function configToStyle(config: Comp_Style, configKey: keyof Comp_Style = 'style') {
	if (!config) return

	const styleObj: Record<string, unknown> = {}
	for (const key in config[configKey]) {
		if (isRecombinationStyle(key)) {
			Object.assign(styleObj, recombinationStyleTranslate(config[configKey][key] as MoreConfigStyle, key))
		} else {
			styleObj[key] = config[configKey][key] as string
		}
	}
	return styleObj as StyleValue
}

interface DebouncedFunction<T extends (...args: any[]) => any> {
	(...args: Parameters<T>): ReturnType<T> | undefined;
	cancel(): void;
	flush(): ReturnType<T> | undefined;
	pending(): boolean;
  }
  
  interface DebounceOptions {
	leading?: boolean;
	trailing?: boolean;
	maxWait?: number;
  }
  
  /**
   * 函数防抖，与 lodash-es 行为一致
   * @param func 需要防抖的函数
   * @param wait 等待时间（毫秒）
   * @param options 配置选项
   */
  export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait = 0,
	options: DebounceOptions = {}
  ): DebouncedFunction<T> {
	let lastArgs: Parameters<T> | undefined;
	let lastThis: any;
	let maxWait: number | undefined;
	let result: ReturnType<T>;
	let timerId: ReturnType<typeof setTimeout> | undefined;
	let lastCallTime: number | undefined;
	let lastInvokeTime = 0;
	let leading = false;
	let maxing = false;
	let trailing = true;
  
	wait = Number(wait) || 0;
	if (options) {
	  leading = !!options.leading;
	  maxing = 'maxWait' in options;
	  maxWait = maxing ? Math.max(Number(options.maxWait) || 0, wait) : undefined;
	  trailing = 'trailing' in options ? !!options.trailing : trailing;
	}
  
	function invokeFunc(time: number) {
	  const args = lastArgs;
	  const thisArg = lastThis;
  
	  lastArgs = lastThis = undefined;
	  lastInvokeTime = time;
	  result = func.apply(thisArg, args!);
	  return result;
	}
  
	function startTimer(pendingFunc: () => void, wait: number) {
	  return setTimeout(pendingFunc, wait);
	}
  
	function cancelTimer(id: ReturnType<typeof setTimeout>) {
	  clearTimeout(id);
	}
  
	function leadingEdge(time: number) {
	  lastInvokeTime = time;
	  timerId = startTimer(timerExpired, wait);
	  return leading ? invokeFunc(time) : result;
	}
  
	function remainingWait(time: number) {
	  const timeSinceLastCall = time - (lastCallTime || 0);
	  const timeSinceLastInvoke = time - lastInvokeTime;
	  const timeWaiting = wait - timeSinceLastCall;
  
	  return maxing
		? Math.min(timeWaiting, (maxWait || 0) - timeSinceLastInvoke)
		: timeWaiting;
	}
  
	function shouldInvoke(time: number) {
	  const timeSinceLastCall = time - (lastCallTime || 0);
	  const timeSinceLastInvoke = time - lastInvokeTime;
  
	  return (
		lastCallTime === undefined ||
		timeSinceLastCall >= wait ||
		timeSinceLastCall < 0 ||
		(maxing && timeSinceLastInvoke >= (maxWait || 0))
	  );
	}
  
	function timerExpired() {
	  const time = Date.now();
	  if (shouldInvoke(time)) {
		return trailingEdge(time);
	  }
	  timerId = startTimer(timerExpired, remainingWait(time));
	}
  
	function trailingEdge(time: number) {
	  timerId = undefined;
  
	  if (trailing && lastArgs) {
		return invokeFunc(time);
	  }
	  lastArgs = lastThis = undefined;
	  return result;
	}
  
	function cancel() {
	  if (timerId !== undefined) {
		cancelTimer(timerId);
	  }
	  lastInvokeTime = 0;
	  lastArgs = lastCallTime = lastThis = timerId = undefined;
	}
  
	function flush() {
	  return timerId === undefined ? result : trailingEdge(Date.now());
	}
  
	function pending() {
	  return timerId !== undefined;
	}
  
	function debounced(this: any, ...args: Parameters<T>) {
	  const time = Date.now();
	  const isInvoking = shouldInvoke(time);
  
	  lastArgs = args;
	  lastThis = this;
	  lastCallTime = time;
  
	  if (isInvoking) {
		if (timerId === undefined) {
		  return leadingEdge(lastCallTime);
		}
		if (maxing) {
		  timerId = startTimer(timerExpired, wait);
		  return invokeFunc(lastCallTime);
		}
	  }
	  if (timerId === undefined) {
		timerId = startTimer(timerExpired, wait);
	  }
	  return result;
	}
  
	debounced.cancel = cancel;
	debounced.flush = flush;
	debounced.pending = pending;
  
	return debounced;
  }