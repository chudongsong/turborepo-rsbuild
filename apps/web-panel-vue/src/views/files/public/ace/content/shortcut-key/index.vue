<template>
	<div class="bg-[#333333] text-white flex">
		<div class="keys-up-left">
			<div class="keys-up-row">
				<div class="keys-up-title">常用快捷键</div>
				<div class="keys-up-content">
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">S</span>
						<span class="keys-up-tips">保存文件</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">C</span>
						<span class="keys-up-tips">复制内容</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">X</span>
						<span class="keys-up-tips">剪切内容</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">V</span>
						<span class="keys-up-tips">粘贴内容</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">A</span>
						<span class="keys-up-tips">全选内容</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Z</span>
						<span class="keys-up-tips">撤销操作</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Y</span>
						<span class="keys-up-tips">反撤销操作</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">F</span>
						<span class="keys-up-tips">搜索内容</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">H</span>
						<span class="keys-up-tips">替换内容</span>
					</div>

					<div class="keys-up-item">
						<span class="keys-up-btn">Esc</span>
						<span class="keys-up-tips">退出搜索、取消自动提示</span>
					</div>
				</div>
			</div>
			<div class="keys-up-row">
				<div class="keys-up-title">光标移动</div>
				<div class="keys-up-content">
					<div class="keys-up-item">
						<span class="keys-up-btn">Home</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">End</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Up</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Left</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Down</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Right</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Home</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">End</span>
						<span class="keys-up-tips">光标移动到文档首/尾</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">P</span>
						<span class="keys-up-tips">跳转到匹配的标签</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">pageUp</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">pageDown</span>
						<span class="keys-up-tips">光标上/下翻页</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Alt</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Left</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Right</span>
						<span class="keys-up-tips">光标移动到行首/尾</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">I</span>
						<span class="keys-up-tips">跳转到指定行</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Alt</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Up</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Down</span>
						<span class="keys-up-tips">上/下增加光标</span>
					</div>
				</div>
			</div>
		</div>
		<div class="keys-up-right">
			<div class="keys-up-row">
				<div class="keys-up-title">内容选择</div>
				<div class="keys-up-content">
					<div class="keys-up-item">
						<span class="keys-up-btn">鼠标框选——拖动</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Shift</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Home</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">End</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Up</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Left</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Down</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Right</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Shift</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">pageUp</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">PageDown</span>
						<span class="keys-up-tips">上下翻页选中</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Shift</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Home</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">End</span>
						<span class="keys-up-tips">当前光标至头/尾</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Alt</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">鼠标拖动</span>
						<span class="keys-up-tips">块选择</span>
					</div>
				</div>
			</div>
			<div class="keys-up-row">
				<div class="keys-up-title">编辑</div>
				<div class="keys-up-content">
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">/</span>
						<span class="keys-up-tips">注释&取消注释</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Tab</span>
						<span class="keys-up-tips">对齐</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Shift</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Tab</span>
						<span class="keys-up-tips">整体前移</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Delete</span>
						<span class="keys-up-tips">删除</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">D</span>
						<span class="keys-up-tips">删除整行</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Alt</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Shift</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Up</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Down</span>
						<span class="keys-up-tips">复制行并添加到上一行/下一行</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Alt</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Delete</span>
						<span class="keys-up-tips">删除光标右侧内容</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Alt</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Up</span>
						<span class="keys-up-symbols">/</span>
						<span class="keys-up-btn">Down</span>
						<span class="keys-up-tips">当前行和上一行/下一行交换</span>
					</div>
					<div class="keys-up-item">
						<span class="keys-up-btn">Ctrl</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">Shift</span>
						<span class="keys-up-symbol">+</span>
						<span class="keys-up-btn">D</span>
						<span class="keys-up-tips">复制行并添加到下面</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<style lang="css" scoped>
.keys-up-left,
.keys-up-right {
	@apply px-[50px] py-[30px] flex-1;
}

.keys-up-row {
	@apply mb-[30px] text-[#eee];
}

.keys-up-title {
	@apply mb-[15px] text-[26px];
	border-left: 4px solid #20a53a;
	padding-left: 5px;
	padding: 5px 0 5px 10px;
}

.keys-up-content {
	@apply pl-[10px];
}

.keys-up-item {
	@apply leading-[25px] text-default text-[0] mb-[5px];
}

.keys-up-item :deep(img) {
	@apply w-[14px];
}

.keys-up-item :deep(.keys-up-btn) {
	@apply h-[25px] px-[10px] leading-[25px] text-center inline-block rounded-sm text-small font-semibold text-[#ccc];
	border: 1px solid #ccc;
}

.keys-up-item :deep(.keys-up-btn i) {
	@apply text-base;
}

.keys-up-item :deep(.keys-up-symbol) {
	@apply px-[5px] text-base font-semibold text-[#ccc];
}

.keys-up-item :deep(.keys-up-symbols) {
	@apply px-[2px] text-small font-semibold text-[#ccc];
}

.keys-up-item :deep(.keys-up-tips) {
	@apply pl-[25px] text-base text-[#ccc];
}
</style>
