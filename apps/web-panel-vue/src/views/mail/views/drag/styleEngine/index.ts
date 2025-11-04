/**
 * @description 
 *    - 说明：
 *      - 根据columns_source、compStyleMap得到整个邮件的html结构和样式
 *    - 作用：
 *      - 防抖：因为计算行为比较频繁，所以采取防抖，每次操作结束后200毫秒才执行计算，队列冲撞时重新计时
 *      - DomTree构建：根据item的type构建DomTree
 *      - 订阅者：基于发布订阅执行，每一次操作后都手动触发style引擎执行计算
 */

import { StyleValue } from "vue"
import { CellStyle, Comp_Style } from "../components/base"
import { cell_map, column_map, columns_source, comp_map, comp_style_map, isSave, emailTemplate, saveFn, column_row_style_map, page_style, cell_style_map } from "../store"
import { configToStyle } from "../controller"
/**
 * @description 发布订阅器
 */
export const eventBUS: {
	events: { [key: string]: ((data?: any) => void)[] },
	$emit: (eventName: string, data?: any) => void
} = {
	events: {
		makeDom: [domEngine()],
	},
	$emit(eventName: string, data?: any) {
		if (this.events[eventName]) {
			this.events[eventName].forEach(fn => fn(data))
		}
	}
}



/**
 * @description 模板生成——防抖
 */
export function domEngine() {
	// 基于闭包实现防抖操作
	let timer: any = null
	return () => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			emailTemplate.value = columnsSourceToTable().outerHTML
			// 执行自动保存
			autoSaveFn()
		}, 300)
	}
}


/**
 * @description 自动保存——防抖
 */
export function autoSave() {
	// 基于闭包实现防抖操作
	let timer: any = null
	return () => {
		if (!isSave.value) return
		isSave.value = false
		clearTimeout(timer)
		timer = setTimeout(async () => {
			await saveFn.value()
			isSave.value = true
		}, 1000)
	}
}

// 得到自动保存的闭包
const autoSaveFn = autoSave()

/**
 * @description 遍历生成所有的组件
 */
export function compToElement() {
	const element_map: Record<string, any> = {}

	for (const key in comp_map.value) {
		const generalDom = document.createElement("div")
		generalApply(generalDom, comp_style_map.value[key])

		let elDom = null

		// 根据type生成不同的dom结构，并应用样式
		switch (comp_map.value[key].type) {
			case "button":
				elDom = document.createElement("a")
				buttonStyleApply(elDom, comp_style_map.value[key])
				break
			case "divider":
				elDom = document.createElement("div")
				dividerStyleApply(elDom, comp_style_map.value[key])
				break
			case "header":
				elDom = document.createElement("div")
				headerStyleApply(elDom, comp_style_map.value[key])
				break
			case "text":
				elDom = document.createElement("div")
				textStyleApply(elDom, comp_style_map.value[key])
				break
			case "image":
				if (comp_style_map.value[key].info?.href) {
					elDom = document.createElement("a")
					elDom.href = comp_style_map.value[key].info?.href
					elDom.target = comp_style_map.value[key].info?.target
					const imgDom = document.createElement("img")
					imgDom.src = comp_style_map.value[key].info?.src || ''
					imgDom.alt = comp_style_map.value[key].info?.alt || ''
					imgDom.style.display = 'block'
					imgDom.style.width = '100%'
					elDom.appendChild(imgDom)
				} else {
					elDom = document.createElement("img")
					elDom.src = comp_style_map.value[key].info?.src || ''
					elDom.alt = comp_style_map.value[key].info?.alt || ''
				}
				imageStyleApply(elDom, comp_style_map.value[key])
				break
			case "menu":
				elDom = document.createElement("div")
				menuStyleApply(elDom, comp_style_map.value[key])
				break
			default:
				break
		}

		if (elDom) {
			generalDom.appendChild(elDom)
		}

		element_map[key] = {
			dom: generalDom,
			general: {},
			info: comp_style_map.value[key].info
		}
	}
	return element_map
}

/**
 * @description 
 *    - 基于cell_map遍历生成所有的cell
 *    - 每一个cell是一个独立的table
 *    - cell的外层需要套一个td（因为cell是水平排布的）
 */
export function cellToTd() {
	const comp_map: Record<string, any> = compToElement()
	const td_map: Record<string, any> = {}
	for (const key in cell_map.value) {
		// 生成cell的单元格td
		const cellTd = document.createElement("td")
		// 设置单元格宽度
		cellTd.style.width = cell_map.value[key].width
		tdStyleApply(cellTd, cell_style_map.value[key])

		// 将组件dom放到单元格内,并设置单元格的样式
		cell_map.value[key].children.forEach(compKey => {
			if (!comp_map[compKey]) return
			cellTd.appendChild(comp_map[compKey].dom)
			// 设置单元格样式
			for (const key in comp_map[compKey].general) {
				cellTd.style[key as keyof StyleValue] = comp_map[compKey].general[key]
			}
		})

		td_map[key] = {
			dom: cellTd
		}
	}
	return td_map
}


/**
 * @description 
 *    - 基于column_map遍历生成所有column（也就是tr）
 *    - 每个tr内都只有一个td
 *    - 每一个td内都有一个table
 *    - 根据children的宽度来找到所有
 *    - cell的宽度就是td的宽度
 */
export function columnToTr() {
	const td_map: Record<string, any> = cellToTd()
	const tr_map: Record<string, any> = {}
	for (const key in column_map.value) {
		const tr = document.createElement("tr")
		const td = document.createElement("td")
		const div = document.createElement("div")
		columnsStyleApply(div, column_row_style_map.value[key])

		const childTable = document.createElement("table")
		childTable.style.width = "100%"
		const childTableTr = document.createElement("tr")

		column_map.value[key].children.forEach(cellKey => {
			childTableTr.appendChild(td_map[cellKey].dom)
		})
		childTable.appendChild(childTableTr)
		div.appendChild(childTable)
		td.appendChild(div)
		tr.appendChild(td)
		tr_map[key] = {
			dom: tr
		}
	}

	return tr_map
}

/**
 * @description 
 *    - 基于columns_source生成table
 *    - 根据内部columnKey追加columnToTr生成的tr
 */
export function columnsSourceToTable() {
	const column_map: Record<string, any> = columnToTr()

	const table = document.createElement("table")
	table.setAttribute("width", page_style.value.maxWidth as string)
	table.style.margin = '0 auto'
	table.style.backgroundColor = page_style.value.backgroundColor as string

	// 遍历所有columnKey，生成tr并插入table
	for (const columnKey of columns_source.value) {
		table.appendChild(column_map[columnKey].dom)
	}

	return table
}

/********** 各组件样式应用方法 ***********/

// 容器样式应用
function generalApply(colDom: HTMLElement, style: Comp_Style) {
	// 解析style基本样式
	const generalStyle = configToStyle(style, "general")
	if (generalStyle) {
		Object.entries(generalStyle).forEach(([key, value]) => {
			colDom.style[key as keyof StyleValue] = value
		})
	}
}

// button按钮
function buttonStyleApply(btnDom: HTMLAnchorElement, style: Comp_Style) {
	// 解析style基本样式
	const domStyle = configToStyle(style) as StyleValue
	// 解析general样式
	const generalStyle = configToStyle(style, "general")
	for (const attr in domStyle as Record<string, any>) {
		btnDom.style[attr as keyof StyleValue] = domStyle![attr as keyof typeof domStyle]
	}
	// 添加btn的默认文本
	btnDom.innerText = style.content
	const { info } = style
	if (info) {
		btnDom.href = info.href
		btnDom.target = info.target
	}
	return {
		generalStyle
	}
}

// divider分割线
function dividerStyleApply(dividerDom: HTMLDivElement, style: Comp_Style) {
	const domStyle = configToStyle(style) as StyleValue
	const generalStyle = configToStyle(style, "general")
	for (const attr in domStyle as Record<string, any>) {
		dividerDom.style[attr as keyof StyleValue] = domStyle![attr as keyof typeof domStyle]
	}
	return {
		generalStyle
	}
}

// header标题
function headerStyleApply(headerDom: HTMLDivElement, style: Comp_Style) {
	const domStyle = configToStyle(style) as StyleValue
	const generalStyle = configToStyle(style, "general")
	for (const attr in domStyle as Record<string, any>) {
		headerDom.style[attr as keyof StyleValue] = domStyle![attr as keyof typeof domStyle]
	}
	headerDom.innerText = style.content
	return {
		generalStyle
	}
}


// text文本
function textStyleApply(pDom: HTMLParagraphElement, style: Comp_Style) {
	const domStyle = configToStyle(style) as StyleValue
	const generalStyle = configToStyle(style, "general")
	for (const attr in domStyle as Record<string, any>) {
		pDom.style[attr as keyof StyleValue] = domStyle![attr as keyof typeof domStyle]
	}
	pDom.innerText = style.content
	return {
		generalStyle
	}
}

// image图片上传
function imageStyleApply(elDom: HTMLAnchorElement | HTMLImageElement, style: Comp_Style) {
	const domStyle = configToStyle(style) as StyleValue

	for (const attr in domStyle as Record<string, any>) {
		elDom.style[attr as keyof StyleValue] = domStyle![attr as keyof typeof domStyle]
	}
}

// menu菜单
function menuStyleApply(elDom: HTMLParagraphElement, style: Comp_Style) {
	const { links, info } = style

	links.forEach((link: { href: string; id: string; label: string }) => {
		const aDom = document.createElement("a")
		menuItemStyleApply(aDom, style)
		aDom.style.display = info?.layout === 'vertical' ? 'block' : 'inline-block'
		aDom.href = link.href
		aDom.target = '_blank'
		aDom.innerText = link.label
		elDom.appendChild(aDom)
	})
}

function menuItemStyleApply(elDom: HTMLAnchorElement, style: Comp_Style) {
	const domStyle = configToStyle(style) as StyleValue
	for (const attr in domStyle as Record<string, any>) {
		elDom.style[attr as keyof StyleValue] = domStyle![attr as keyof typeof domStyle]
	}
}

// columns
function columnsStyleApply(colDom: HTMLElement, style: Comp_Style) {
	// 解析style基本样式
	const domStyle = configToStyle(style) as StyleValue
	for (const attr in domStyle as Record<string, any>) {
		colDom.style[attr as keyof StyleValue] = domStyle![attr as keyof typeof domStyle]
	}
}

// td
function tdStyleApply(tdDom: HTMLElement, style: CellStyle) {
	// 解析style基本样式
	const domStyle = configToStyle(style) as StyleValue
	for (const attr in domStyle as Record<string, any>) {
		tdDom.style[attr as keyof StyleValue] = domStyle![attr as keyof typeof domStyle]
	}
}