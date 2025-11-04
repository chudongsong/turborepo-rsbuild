<template>
	<div class="bt-msg-config">
		<div class="p-4rem">
			<div class="from">
				<slot name="from"></slot>
			</div>
			<div class="mt-2rem ml-2rem">
				<slot name="tip"></slot>
			</div>
		</div>
		<div>
			<div class="el-dialog__footer flex justify-end">
				<div class="footer">
					<el-button type="warning" @click="$emit('close')">取消</el-button>
					<el-button type="primary" @click="$emit('save')">保存</el-button>
				</div>
			</div>
		</div>
	</div>
</template>
