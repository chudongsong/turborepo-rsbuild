<template>
	<div class="agreement-content">
		<div class="agreement-item">
			<div class="agreement-title">1. 即时产品特性</div>
			<div class="agreement-text">域名为即时性产品，其注册成功以最终付款完成为准。域名一旦注册成功，不支持退款。请用户务必仔细核对所选域名信息，并尽快完成结算。</div>
		</div>
		
		<div class="agreement-item">
			<div class="agreement-title">2. 实名认证要求</div>
			<div class="agreement-text">根据工业和信息化部以及《中华人民共和国网络安全法》的相关规定，域名注册必须完成实名认证。未完成实名认证的域名将无法正常使用。</div>
		</div>
		
		<div class="agreement-item">
			<div class="agreement-title">3. 溢价域名续费</div>
			<div class="agreement-text">部分后缀的溢价域名，其续费价格可能高于普通域名的续费价格。具体续费价格请以系统结算时显示的价格为准。</div>
		</div>
		
		<div class="agreement-item">
			<div class="agreement-title">4. 禁止违规用途</div>
			<div class="agreement-text">通过我司申请注册的域名，严禁用于赌博、色情、钓鱼、私服等任何违反法律法规的用途。</div>
		</div>
	</div>
</template>

<script setup lang="ts">
// 这是一个纯展示组件，不需要任何逻辑
</script>

<style lang="scss" scoped>
.agreement-content {
	padding: 20px;
	line-height: 1.6;
}

.agreement-item {
	margin-bottom: 24px;
}

.agreement-title {
	font-weight: 600;
	color: var(--el-text-color-primary);
	margin-bottom: 8px;
	font-size: 14px;
}

.agreement-text {
	color: var(--el-text-color-regular);
	font-size: 14px;
	text-align: justify;
}
</style>
