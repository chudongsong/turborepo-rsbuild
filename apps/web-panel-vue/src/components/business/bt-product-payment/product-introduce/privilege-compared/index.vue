<template>
	<div class="privilege_contrast">
		<div class="privilege_contrast_title">
			<bt-image type="icons" src="privilege_contrast_title.png" class="w-[290px]" />
		</div>
		<div class="privilege_contrast_cont">
			<table class="function_table">
				<thead>
					<tr>
						<th><div class="title_type">功能特权</div></th>
					</tr>
				</thead>
				<tbody class="function_title">
					<tr v-for="priInfo in privilegeList" :key="priInfo">
						<td>{{ priInfo }}</td>
					</tr>
				</tbody>
			</table>
			<table class="pro_table">
				<thead>
					<tr>
						<th>
							<div class="title_type"><bt-image type="icons" src="pro-icon.svg" />专业版</div>
						</th>
					</tr>
				</thead>
				<tbody class="pro_cont">
					<tr v-for="key in proPrivilegeList" :key="key">
						<td><i :class="!key ? 'error-icon' : 'success-icon'"></i></td>
					</tr>
				</tbody>
			</table>
			<table class="ltd_table">
				<thead>
					<tr>
						<th>
							<span class="recommend-icon"></span>
							<div class="title_type"><bt-image type="icons" src="ltd-icon.svg" />企业版</div>
							<button type="button" class="ltd_btn" @click="go2tab('ltd')">立即购买</button>
						</th>
					</tr>
				</thead>
				<tbody class="ltd_cont">
					<tr v-for="key in ltdPrivilegeList" :key="key">
						<td><i :class="!key ? 'error-icon' : 'success-icon'"></i></td>
					</tr>
				</tbody>
			</table>
			<table class="ops_table">
				<thead>
					<tr>
						<th>
							<div class="title_type"><bt-image type="icons" src="ltd-icon.svg" />企业运维托管</div>
							<button type="button" class="ops_btn" @click="go2tab('dev')">
								<span>立即购买</span>
							</button>
						</th>
					</tr>
				</thead>
				<tbody class="ops_cont">
					<tr v-for="key in plusPrivilegeList" :key="key">
						<td><i :class="!key ? 'error-icon' : 'success-icon'"></i></td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script lang="ts" setup>
// eslint-disable-next-line @typescript-eslint/naming-convention
import PRODUCT_PAYMENT_STORE from '../../store'

const store = PRODUCT_PAYMENT_STORE()
const { privilegeList, proPrivilegeList, ltdPrivilegeList, plusPrivilegeList, go2tab } = store
</script>

<style lang="css" scoped>
.privilege_contrast {
	height: 750px;
	padding: 25px 40px 0px;
	line-height: 22px;
	color: var(--el-color-text-secondary);
}
.pro-price-herf {
	display: flex;
	justify-content: center;
}
.privilege_contrast_title {
	text-align: center;
	margin-bottom: 30px;
}
.privilege_contrast_title img {
	display: inline-block;
}
.privilege_contrast_cont {
	display: flex;
	font-size: var(--el-font-size-base);
}
.privilege_contrast_cont table tr td {
	position: relative;
	height: 40px;
	width: 222px;
}
.privilege_contrast_cont table {
	position: relative;
	width: 222px;
	display: inline-block;
	height: min-content;
}
.privilege_contrast_cont table thead tr th {
	text-align: center;
}
.privilege_contrast_cont table tbody tr td {
	text-align: center;
}
.privilege_contrast_cont .function_table tbody tr td {
	text-align: left;
	padding: 0 25px;
}
.privilege_contrast_cont .function_table {
	background: var(--el-fill-color-lighter);
	border: 1px solid var(--el-color-border);
}
.privilege_contrast_cont .function_table thead {
	background: var(--el-fill-color);
}
.privilege_contrast_cont .function_table tr:nth-of-type(2n + 0) {
	background: var(--el-fill-color);
}
.privilege_contrast_cont .pro_table {
	background: var(--bt-pro-bg-color);
	border: 1px solid var(--bt-pro-light-bg-color);
}
.privilege_contrast_cont .pro_table thead {
	background: var(--bt-pro-bg-color);
}
.privilege_contrast_cont .pro_table tr:nth-of-type(2n + 0) {
	background: var(--bt-pro-bg-color);
}
.privilege_contrast_cont .ltd_table {
	background: var(--bt-ltd-bg-color);
	border: 1px solid var(--bt-pro-light-bg-color);
	z-index: 555555;
	box-shadow: 0px 4px 10px rgb(0 0 0 / 55%);
	left: -1px;
	top: -14px;
}
.privilege_contrast_cont .ltd_table thead {
	background: var(--el-base-primary);
}
.privilege_contrast_cont .ltd_table thead tr:first-child th {
	height: 110px;
}
.privilege_contrast_cont .ltd_table tbody tr:last-child td {
	height: 54px;
}
.privilege_contrast_cont .ltd_table tr:nth-of-type(2n + 0) {
	background: var(--el-base-primary);
}
.privilege_contrast_cont .ops_table {
	background: var(--bt-ltd-bg-color);
	border: 1px solid var(--bt-pro-light-bg-color);
	left: -1px;
}
.privilege_contrast_cont .ops_table thead {
	background: var(--el-base-primary);
}

.privilege_contrast_cont .ops_table tr:nth-of-type(2n + 0) {
	background: var(--el-base-primary);
}

.recommend-icon {
	background-image: url('/static/icons/recommend-icon.svg');
	background-repeat: no-repeat;
	background-position: 10px 10px;
	background-size: auto;
	display: inline-block;
	width: 68px;
	height: 62px;
	position: absolute;
	top: -10px;
	left: -14px;
}
.title_type {
	font-size: var(--el-font-size-extra-large);
	display: flex;
	justify-content: center;
	align-items: center;
}
table:nth-child(1) .title_type,
table:nth-child(2) .title_type {
	padding: 36px 0;
	color: var(--el-color-text-primary);
	background-color: var(--bt-pro-bg-color);
}
table:nth-child(3) .title_type {
	padding-top: 24px;
	background: linear-gradient(90deg, var(--bt-ltd-light-color), var(--bt-ltd-sub-color));
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-fill-color: transparent;
}
table:nth-child(4) .title_type {
	padding-top: 15px;
	color: var(--bt-ltd-sub-bg-color);
}
.title_type img {
	margin-right: 5px;
}
.ltd_btn {
	width: 99px;
	height: 30px;
	background: linear-gradient(180deg, var(--bt-ltd-border-color) 0%, var(--bt-ltd-light-color) 47%, var(--bt-ltd-sub-color) 100%);
	border-radius: var(--el-border-radius-round);
	line-height: 25px;
	border: none;
	margin: 15px 0;
	color: var(--el-color-text-primary);
}
.ops_btn {
	width: 99px;
	height: 30px;
	border: 1.5px solid var(--bt-ltd-light-color);
	background: transparent;
	border-radius: var(--el-border-radius-round);
	line-height: 25px;
	color: var(--el-color-text-primary);
	margin: 15px 0;
}
.ops_btn span {
	background: linear-gradient(180deg, var(--bt-ltd-border-color) 0%, var(--bt-ltd-light-color) 47%, var(--bt-ltd-sub-color) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-fill-color: transparent;
}
.error-icon,
.success-icon {
	position: relative;
	display: inline-block;
}
.error-icon::before {
	content: '';
	display: inline-block;
	width: 8px;
	height: 8px;
	border-left: 2px solid var(--el-color-danger);
	border-bottom: 2px solid var(--el-color-danger);
	transform: rotate(-45deg);
	position: absolute;
	left: -5px;
	top: -12px;
}
.error-icon::after {
	content: '';
	display: inline-block;
	width: 8px;
	height: 8px;
	border-left: 2px solid var(--el-color-danger);
	border-bottom: 2px solid var(--el-color-danger);
	transform: rotate(-225deg);
	position: absolute;
	left: -5px;
	top: -3px;
}
.success-icon::after {
	content: '';
	display: inline-block;
	width: 16px;
	height: 8px;
	border-left: 2px solid var(--bt-ltd-light-color);
	border-bottom: 2px solid var(--bt-ltd-light-color);
	transform: rotate(-45deg);
	position: absolute;
	left: -8px;
	top: -10px;
}
</style>
