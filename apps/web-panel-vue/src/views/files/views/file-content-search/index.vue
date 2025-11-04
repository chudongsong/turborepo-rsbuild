<template>
	<div class="flex flex-col p-[2rem] relative">
		<!-- <div v-if="authType !== 'ltd' && searchData.searchType === 'expert'" class="absolute top-0 right-0 w-[94rem] h-full">
			<bt-install-mask :visible="authType !== 'ltd' && searchData.searchType === 'expert'" width="36rem">
				<template #content>
					<div class="content-mask">
						<i class="svgtofont-el-warning text-warning mr-[4px] !text-extraLarge"></i>
						<span>此功能为企业版独享</span>，<span class="bt-link" @click="productPaymentDialog({ sourceId: 79 })">立即升级</span>
					</div>
				</template>
			</bt-install-mask>
		</div> -->
		<div class="menu">
			<div class="flex items-center h-[3.5rem]">
				<!-- 搜索模式选项 -->
				<!-- <el-select class="file_select text-base !w-[9.2rem]" v-model="searchData.searchType" @change="toggleSelectMode('mode')">
					<el-option label="常规搜索" value="routine"></el-option>
					<el-option label="高级搜索" value="expert"></el-option>
				</el-select> -->
				<span class="title">搜索内容</span>
				<!-- 搜索框 -->
				<div class="flex items-center border border-dark rounded-small">
					<div>
						<el-select class="file_select !w-[8rem]" v-model="searchData.searchContentType" :disabled="searchData.load" @change="toggleSelectMode('type')">
							<el-option label="文件" value="file"></el-option>
							<el-option label="文件名" value="name"></el-option>
						</el-select>
					</div>
					<div class="search-input">
						<input type="text" class="bg-transparent w-[59rem] h-[3rem] border-none outline-none shadow-none" placeholder="请输入搜索内容" v-model="searchData.searchContent" :disabled="searchData.load" @keydown.enter="search" />
						<BtDivider />
						<div class="inputOption" :class="{ disabled: searchData.load }">
							<span :class="searchData.case ? 'active' : ''" title="区分大小写" @click="selectOptions('case')">Aa</span>
							<span :class="searchData.word ? 'active' : ''" title="全词匹配" @click="selectOptions('word')">[ab]</span>
							<span :class="searchData.regular ? 'active' : ''" title="正则表达式" @click="selectOptions('regular')">.*</span>
						</div>
					</div>
				</div>
				<!-- 搜索按钮 -->
				<el-button class="!ml-[2rem] w-[8.5rem] h-[3rem] !rounded-small" @click="search" :type="searchData.load ? 'info' : 'primary'">{{ searchData.load ? '取消搜索' : '搜索' }}</el-button>
			</div>
			<div class="flex items-center h-[3.5rem] mt-[1rem]">
				<!-- 目录选择 -->
				<span class="title">目录</span>
				<div class="flex items-center relative mr-[2.5rem]">
					<bt-input-icon v-model="searchData.path" width="48rem" class="file-input" :disabled="searchData.load" icon="icon-file_mode" @icon-click="openFile" :placeholder="`请选择目录`" />
					<el-checkbox class="!absolute top-0 left-[33rem]" v-model="searchData.isDir" :disabled="searchData.load">包含子目录</el-checkbox>
				</div>
				<!-- 文件后缀 -->
				<div class="flex items-center relative">
					<span class="title">文件后缀</span>
					<bt-input v-model="searchData.suffix" width="32rem" spellcheck="false" :disabled="searchData.load" @focus="suffix.show = true" @blur="suffix.show = false" :placeholder="`选择或填写后缀类型，使用逗号分隔`" />
					<div v-if="suffix.show" class="ext-list">
						<div class="mt5">
							<ul>
								<li v-for="(ext, index) in suffix.extList" :key="ext.value" :class="suffix.selectList.indexOf(index) > -1 ? 'active' : ''" @mousedown.stop.prevent="selectExt(index)">
									{{ ext.title }}
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div v-show="searchData.searchType === 'expert'" class="flex items-center h-[3.5rem] mt-[1rem]">
				<!-- 修改时间 -->
				<span class="title">修改时间</span>
				<div class="flex items-center relative mr-[1.5rem]">
					<bt-select v-model="searchData.time" :disabled="searchData.load" :options="timeList" @change="setTimeMode" class="mr-[1rem]" :class="searchData.time === 'custom' ? '!w-[9rem]' : '!w-[20rem]'" :empty-values="[null, undefined]"></bt-select>
					<el-date-picker
						v-if="searchData.time === 'custom'"
						class="!w-[26rem]"
						align="right"
						type="daterange"
						v-model="searchData.customTime"
						:disabled="searchData.load"
						range-separator=""
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						ref="player"
						:default-time="pickerOptions.defaultTime"
						value-format="x"
						:disabled-date="pickerOptions.disabledDate" />
				</div>
				<!-- 文件大小 -->
				<div class="flex items-center relative">
					<span class="title">文件大小</span>
					<bt-select v-model="searchData.size" :disabled="searchData.load" @change="setSizeMode" :options="sizeList" class="mr-[1rem]" :class="searchData.size === 'custom' ? 'w-[9rem]' : '!w-[20rem]'" :empty-values="[null, undefined]"></bt-select>
					<div class="size flex items-center" v-show="searchData.size === 'custom'">
						<div class="title !w-[4rem]">大于</div>
						<bt-input v-model.number="searchData.minSize" type="number" class="w-[10rem] num-input" text-type="MB" :disabled="searchData.load" />
						<div class="title !w-[4rem]">小于</div>
						<bt-input v-model.number="searchData.maxSize" type="number" class="w-[10rem] num-input" text-type="MB" :disabled="searchData.load" />
					</div>
				</div>
			</div>
		</div>
		<div class="content">
			<div class="empty" v-if="searchResult.fileList.length == 0">
				<div v-show="searchData.load">正在搜索中...</div>
				<div v-show="!searchData.load && isfirst" class="flex flex-col items-center">
					<div>键入查找内容以在文件中查询</div>
					<div class="text-base">细致的选项可以有效地缩短检索时间</div>
				</div>
				<div v-show="!searchData.load && !isfirst">抱歉没有找到“{{ searchCon }}”相关的结果</div>
			</div>
			<div class="flex w-full" v-if="searchResult.fileList.length > 0 && searchResult.type === 'file'">
				<div class="result-list">
					<div class="search-num">
						<div v-show="searchData.load">文件搜索中<span class="svgtofont-el-loading"></span></div>
						<div v-show="!searchData.load">搜索完成:</div>
						<div>在{{ searchResult.fileList.length }}个文件中有{{ searchNum }}个匹配项</div>
					</div>
					<div class="list">
						<div class="file-item" :class="searchResult.activeIndex === index ? 'active' : ''" v-for="(file, index) in searchResult.fileList" :key="index" @click="searchResult.activeIndex = index">
							<span class="ellipsis w-[16rem]" :title="file.name">{{ file.name }}</span>
							<el-tag type="info">{{ file.search_num }}</el-tag>
						</div>
					</div>
				</div>
				<div class="log">
					<div class="name flex justify-between">
						<span class="ellipsis w-[65rem]" :title="searchResult.fileList[searchResult.activeIndex].path">
							{{ searchResult.fileList[searchResult.activeIndex].path }}
						</span>
						<bt-link class="ml-[1rem]" @click="editFind(searchResult.fileList[searchResult.activeIndex])">编辑</bt-link>
					</div>
					<div class="con">
						<span v-for="(line, index) in searchResult.fileList[searchResult.activeIndex].search_result" :key="index" v-html="`行${line.row_num}：${line.line}`"> </span>
					</div>
				</div>
			</div>
			<div class="flex w-full" v-if="searchResult.fileList.length > 0 && searchResult.type === 'name'">
				<div class="log">
					<div class="result">
						<div v-show="searchData.load">文件搜索中<span class="svgtofont-el-loading"></span></div>
						<div v-show="!searchData.load">
							{{ `搜索结果，共${searchResult.fileList.length}个文件` }}
						</div>
					</div>
					<div class="file-table">
						<div class="file" v-for="(file, index) in searchResult.fileList" :key="index">
							<div class="name">{{ file.path }}</div>
							<div class="msg">
								<span class="text-right w-[8rem]">{{ getByteUnit(file.size) }}</span>
								<span>{{ formatTime(file.mtime) }}</span>
								<bt-link @click="openAceEditor(file)">编辑</bt-link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<bt-help v-show="searchData.searchType === 'routine'" :options="helpList" class="pl-2rem list-disc"> </bt-help>
	</div>
</template>

<script setup lang="ts">
import { getByteUnit, formatTime } from '@utils/index'
import { productPaymentDialog } from '@/public/index'
import { openAceEditor } from '@files/useMethods'
import FILES_CONTENT_SEARCH_STORE from './store'
import { storeToRefs } from 'pinia'

const store = FILES_CONTENT_SEARCH_STORE()
const { authType, searchData, searchResult, suffix, pickerOptions, isfirst, searchCon } = storeToRefs(store)
const { helpList, timeList, sizeList, setSizeMode, editFind, search, openFile, selectExt, setTimeMode, toggleSelectMode, $reset, getSearchPath, selectOptions } = store

// 获取当前标签页的数据
// const fileTabData: any = computed(() => getFileTabData(fileTabActive.value))

// 匹配项
const searchNum = computed(() => {
	return searchResult.value.fileList.reduce((total: number, item: any) => {
		return total + item.search_num
	}, 0)
})

onMounted(() => {
	getSearchPath()
})

onUnmounted(() => {
	$reset()
})
</script>

<style lang="css" scoped>
/* :deep(.file-input) */
:deep(.file-input .el-input__inner) {
	@apply pr-[12rem];
}

/* :deep(.el-input__inner) */
:deep(.el-input__inner) {
	@apply rounded-small;
}

/* :deep(.el-input-group__append) */
:deep(.el-input-group__append) {
	@apply rounded-r-2x;
}

/* :deep(.file_select .el-select__wrapper) */
:deep(.file_select .el-select__wrapper) {
	@apply border-none outline-none shadow-none mr-[.5rem] pl-[0.6rem];
}

.search-input {
	@apply border-l border-dark pl-[1rem] flex items-center;
}
.search-input .inputOption {
	@apply flex items-center;
}
.search-input .inputOption.disabled {
	@apply opacity-50;
}
.search-input .inputOption.disabled span {
	@apply cursor-not-allowed;
}
.search-input .inputOption span {
	@apply w-[3.2rem] h-[2.4rem] rounded-small flex items-center justify-center cursor-pointer mr-[.4rem];
}
.search-input .inputOption span:hover {
	@apply bg-lighter text-default;
}
.search-input .inputOption span.active {
	@apply bg-extraLight text-primary border border-[var(--el-color-success-light-7)];
}

.title {
	@apply w-[7rem] mr-[2.3rem] text-small text-secondary flex justify-end;
}

.ext-list {
	@apply absolute top-[3rem] right-0 w-[32rem] bg-white border border-dark rounded-small overflow-hidden z-9999;
}
.ext-list ul {
	@apply p-[.5rem];
}
.ext-list ul li {
	@apply inline-block py-[.2rem] px-[1rem] text-secondary bg-light rounded-base mr-[.5rem] mb-[.4rem] cursor-pointer border border-light;
}
.ext-list ul li.active {
	@apply bg-extraLight text-primary border-[var(--el-color-success-light-7)];
}
.ext-list ul li:hover {
	@apply bg-extraLight text-primary border-[var(--el-color-success-light-7)];
}

.content {
	@apply h-[44rem] mt-[2rem] border-lighter border flex;
}
.content .empty {
	@apply text-disabled text-extraLarge flex flex-col items-center h-full w-full pt-[8.3rem] leading-[3.5rem];
}
.content .result-list {
	@apply w-[22rem] h-full border-lighter border-r flex flex-col;
}
.content .result-list .search-num {
	@apply p-[.5rem] min-h-[5rem] border-lighter border-b mb-[-.1rem];
}
.content .result-list .list {
	@apply overflow-y-auto flex-1;
}
.content .result-list .list .file-item {
	@apply flex items-center justify-between min-h-[4rem] px-[1rem] cursor-pointer border-lighter border-t;
}
.content .result-list .list .file-item:hover {
	@apply bg-darker text-primary;
}
.content .result-list .list .file-item.active {
	@apply bg-darker text-primary;
}
.content .result-list .list .file-item :deep(.el-tag--small) {
	@apply px-[.3rem];
}
.content .log {
	@apply w-full h-full flex flex-col;
}
.content .log .name {
	@apply p-[.7rem] h-[3rem] flex items-center;
}
.content .log .con {
	@apply bg-[#222] flex-1 text-white p-[2rem] flex flex-col overflow-auto break-all;
}
.content .log .result {
	@apply p-[.7rem] mb-[-.1rem] h-[4rem] flex items-center border-lighter border-b;
}
.content .log .file-table {
	@apply flex-1 flex flex-col overflow-auto break-all;
}
.content .log .file-table .file {
	@apply border-lighter border-t flex items-center justify-between h-[4rem] p-[.7rem];
}
.content .log .file-table .file:hover {
	@apply bg-darker;
}
.content .log .file-table .file .name {
	@apply w-[60%] truncate;
}
.content .log .file-table .file .msg {
	@apply flex-1 flex items-center justify-between;
}

.size :deep(.el-input-group__append) {
	@apply px-[.7rem];
}

.ellipsis {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>

<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none !important;
	margin: 0;
}

input[type='number'] {
	-moz-appearance: textfield;
}
</style>
