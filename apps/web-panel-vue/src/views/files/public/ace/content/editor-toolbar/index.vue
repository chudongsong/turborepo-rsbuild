<template>
	<!-- 操作菜单 -->
	<div class="toolbar" @click.stop>
		<div v-if="!unTitleArr.includes(editorCustomToolbar)" class="title">
			{{ getTitle }}
		</div>
		<div v-if="!(editorCustomToolbar === 'shortcutKey')">
			<!-- 跳转指定行 -->
			<div class="menu px-[1.5rem]" v-if="editorCustomToolbar === 'jump'">
				<input type="number" v-focus v-model.number="line" class="w-[37rem] h-[3.5rem] leading-[3.5rem] bg-[#444] border border-white outline-none" @keydown.enter="jumpLine" name="num" />
				<div class="mt-[1rem]">当前：行{{ editorRowColumnCount.row }}，列{{ editorRowColumnCount.column }}，输入行数(介于1-{{ editorRowColumnCount.count }}之间)</div>
			</div>
			<!-- 设置字体大小 -->
			<div class="menu flex items-center px-[1.5rem]" v-if="editorCustomToolbar === 'font'">
				<input type="number" v-focus v-model.number="editorOption.aceEditor.fontSize" class="w-[25rem] h-[3.5rem] leading-[3.5rem] bg-[#444] border border-white outline-none" placeholder="字体设置范围 12-45" name="num" @keyup.enter="saveFont" />
				<el-button type="primary" size="default" class="!ml-[2rem]" @click="saveFont">保存</el-button>
			</div>
			<!-- 设置编码格式 -->
			<div class="menu px-[1.5rem]" v-if="editorCustomToolbar === 'encode'">
				<div class="click" v-for="item in codeing" :key="item.type" @click="setCode(item.type)">
					<span :class="{ 'bg-[#333]': encodingData?.toLowerCase() === item.type?.toLowerCase() }" class="w-full h-3rem flex items-center justify-between px-[8px]">{{ item.title }}</span>
				</div>
			</div>
			<!-- 设置缩进 -->
			<div class="menu px-[1.5rem] flex flex-col" v-if="editorCustomToolbar === 'tab'">
				<span class="text-[#9e9e9e]">设置制表符</span>
				<el-divider class="border border-[#666]"></el-divider>
				<div class="click" v-for="item in tabData" :key="item.type" @click="setTabType(item.type)">
					<span :class="{ 'bg-[#333]': `${editorOption.aceEditor.useSoftTabs ? 'tab' : 'nbsp'}` === item.type }" class="flex items-center w-full h-full px-8px">{{ item.title }}</span>
				</div>
				<span class="mt-[8px] text-[#9e9e9e]"> 设置制表符长度 </span>
				<el-divider class="!border-[#666666] border"></el-divider>
				<div class="click w-full" :class="{ 'bg-[#333]': editorOption.aceEditor.tabSize === item }" v-for="item in 6" :key="item" @click="setTabType(item)">
					<span class="flex items-center w-full h-full px-[8px]">{{ item }}</span>
					<span class="text-extraLarge mr-[1rem]" :class="{ 'svgtofont-el-check': editorOption.aceEditor.tabSize === item }"></span>
				</div>
			</div>
			<!-- 设置编辑器主题 -->
			<div class="menu !pt-[1rem] px-16px" v-if="editorCustomToolbar === 'theme'">
				<div class="click" @click="setTheme('chrome')"><span>chrome【白色主题】</span><span :class="editorOption.aceEditor.editorTheme === 'chrome' ? '' : 'hidden'" class="svgtofont-el-check"></span></div>
				<div class="click" @click="setTheme('monokai')"><span>monokai【黑色主题】</span><span :class="editorOption.aceEditor.editorTheme === 'monokai' ? '' : 'hidden'" class="svgtofont-el-check"></span></div>
			</div>
			<!-- 编辑器设置【部分设置需要重新打开编辑器生效】 -->
			<div class="menu !pt-[1rem] px-[16px]" v-if="editorCustomToolbar === 'set'">
				<div class="click" v-for="item in set" :key="item.type" @click="seting(item.type)">
					<span>{{ item.title }}</span>
					<span :class="editorOption.aceEditor[item.type] ? '' : 'hidden'" class="svgtofont-el-check"></span>
				</div>
			</div>
			<!-- 设置文件保存行结束符 -->
			<div class="menu !pt-[1rem] px-[16px]" v-if="editorCustomToolbar === 'lineBreak'">
				<div class="click" :class="{ 'bg-[#333]': editorTabsActive.lineBreak === item.type }" v-for="item in lineBreak" :key="item.type" @click="useSetLineBreak(editorTabsActive.id, item.type)">
					<span>{{ item.title }}</span>
					<span :class="editorTabsActive.lineBreak === item.type ? '' : 'hidden'" class="svgtofont-el-check"></span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { editorOption, editorCustomToolbar, editorRowColumnCount, editorTabsActive, useSetLineBreak } from '@files/public/ace/useMethods'
import { storeToRefs } from 'pinia'
import FILES_ACE_STORE from '../../store'

const store = FILES_ACE_STORE()
const { fontSize, tabSize, editorTheme, useSoftTabs, encodingData, line } = storeToRefs(store)
const { tool, set, tabData, unTitleArr, saveFont, jumpLine, setCode, setTabType, setTheme, seting } = store

/**
 * @description: 获取标题
 */
const getTitle = computed(() => {
	return tool.find((item: any) => item.type === editorCustomToolbar.value)?.title || ''
})

const codeing = [
	{ title: 'ASCII', type: 'ASCII' },
	{ title: 'GBK', type: 'GBK' },
	{ title: 'UTF-8', type: 'UTF-8' },
	{ title: 'GB2312', type: 'GB2312' },
	{ title: 'BIG5', type: 'BIG5' },
]

const lineBreak = [
	{ title: 'CRLF', type: 'CRLF' },
	{ title: 'LF', type: 'LF' },
]
</script>

<style lang="css" scoped>
.toolbar {
	@apply bg-[#444] w-[40rem] absolute top-0 left-[50%] ml-[-20rem];
	z-index: 999;
}

.toolbar .title {
	@apply px-[2rem] pt-[1rem] pb-[1rem] border-b border-[#666666] text-[#9e9e9e];
}

.toolbar .menu {
	@apply py-[2rem] text-[#fff];
}

.toolbar .menu .click {
	@apply h-[3rem] flex items-center justify-between cursor-pointer hover:bg-[#333];
}

:deep(.el-divider--horizontal) {
	margin: 0.8rem !important;
}
</style>
