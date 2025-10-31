<template>
	<div class="p-2rem">
		<el-form ref="detailFormRef" :model="detailForm" :rules="detailRules" :disabled="isDisabled" label-position="right" @submit.native.prevent>
			<el-form-item prop="filename" label="分享名称">
				<bt-input width="30rem" v-model="detailForm.name" readonly />
			</el-form-item>
			<el-form-item prop="path" label="分享外链">
				<el-col :span="18">
					<bt-input width="30rem" v-model="detailForm.link" readonly />
				</el-col>
				<el-col :span="3">
					<el-button class="!ml-4px" type="primary" @click="copyLink">
						<i class="svgtofont-icon-copy text-white text-1.4rem"></i>
					</el-button>
				</el-col>
				<el-col :span="3">
					<el-popover class="item" trigger="hover" placement="top-start" :popper-class="'white-popover'">
						<bt-qrcode :value="detailForm.qrcode" :size="110" class="p-[8px]" />
						<template #reference>
							<el-button class="!ml-4px" type="primary" @click="showQrcode = true">
								<i class="svgtofont-el-qrcode text-white text-1.4rem"></i>
								<!-- <img
									class="w-[1.6rem]"
									src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABUklEQVQ4T6WSIU9DQRCEvwlYLIoEgwEECs3rDyCpobbtL6AKRyggMQ9TJBjUMzgMCeUnIEAREoICFAoEZMk2dy/Xo4KGNZu7nZ2bnT3xz1DsN7MFYCnhe5V0n/Kb2QowL2kY70cEoXAHVEnDG/ABXAJXmVDHVZKqSFAA58AqsAY8AW3A68/AQ7hbBG6BbeDGlaQEh8AucA3suzDgC5gFXHID2At5YxJBNwA6ocFBM8B3OL8DTaCcpMDN2QojxHHdk9Qrx9SeAyf1CMFIJ3DjYqxLOgo192gs4ibSNfrMOaj2yBvMrCnpImYHR4C/vizpIPkX/mpbUtfMepJKMxtKKsyslNTLCZxkBzgFjoE5oCVp08yKvyhwgkGyRl9nX1LDzDz3kzxS8kuBpFYygq8xJ4gjjBMEpz+BF+AxcXLg39XMOpLOciW1gtz9ac71GqdpSrE/8U20EQ3XLHEAAAAASUVORK5CYII="
									alt="" /> -->
							</el-button>
						</template>
					</el-popover>
				</el-col>
			</el-form-item>
			<el-form-item v-if="detail.password" prop="path" label="提取码">
				<el-col :span="15">
					<bt-input class="!w-[24rem]" v-model="detailForm.code" readonly />
				</el-col>
				<el-col :span="9">
					<el-button class="!ml-8px" type="primary" @click="copyAll">复制链接及提取码</el-button>
				</el-col>
			</el-form-item>
			<el-form-item label="过期时间">
				<div class="text-[#777] text-small leading-3.2rem">{{ typeof detailForm.time === 'string' ? detailForm.time : formatTime(detailForm.time) }}</div>
			</el-form-item>
			<bt-help :options="helpList" class="ml-24px mt-20px"> </bt-help>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/index'
import { storeToRefs } from 'pinia'
import FILES_SHARE_STORE from './store'

const store = FILES_SHARE_STORE()
const { detailFormRef, detailForm, detailRules, isDisabled, showQrcode, detail } = storeToRefs(store)
const { helpList, copyAll, copyLink, initDetail } = store

onMounted(initDetail)
</script>

<style lang="css" scoped></style>
