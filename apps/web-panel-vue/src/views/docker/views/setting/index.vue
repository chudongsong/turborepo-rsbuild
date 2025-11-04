<template>
	<div v-bt-loading="loading" v-bt-loading:title="'正在获取docker设置，请稍候...'">
		<div class="module-ui mb-16px !mt-0" shadow="never" header="全局设置" :body-style="{ padding: 0, display: 'flex', minHeight: '5.2rem' }">
			<BtForm label-position="right" :labelWidth="'9.6rem'" />
		</div>

		<div class="module-ui mb-16px" shadow="never" header="系统信息" :body-style="{ padding: 0, display: 'flex', minHeight: '5.2rem' }">
			<div class="leading-[3.2rem]">
				<div v-for="info in systemTemplate" :key="info.key" class="line text-small !leading-[3.2rem]">
					<div>{{ info.name }}</div>
					<div>{{ renderSystem(info.key) }}</div>
					<div v-if="info.append"><component :is="info.append" /></div>
				</div>
			</div>
		</div>

		<!-- <bt-install-mask v-if="isInstall" :width="settingData.installing ? '40rem' : '36rem'">
			<template #content>
				<div class="content-mask">
					<i class="svgtofont-el-warning text-warning !text-subtitleLarge mr-4px"></i>
					<span>当前{{ settingData.installing === 1 ? '正在安装' : '未安装' }}docker或docker-compose</span>，
					<span v-if="settingData.installing !== 1" @click="goInstall" class="bt-link">立即安装</span>
					<span v-if="settingData.installing === 1">请稍后...</span>
				</div>
			</template>
		</bt-install-mask> -->

		<bt-dialog title="全局配置文件" v-model="configEditorPopup" showFooter :area="64" @confirm="onConfirmConfig">
			<div class="h-[50rem] p-2rem">
				<bt-editor v-model="configEditorData" :filePath="settingData.daemon_path" :autoSave="false" :editorOption="{ mode: 'ace/mode/nginx' }" />
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormGroup, FormInput, FormButton,FormCustom, FormRadio, FormHelp, FormItemCustom, FormTextarea } from '@form/form-item'
import { ElButton, ElInput } from 'element-plus'
import { getDockerStore } from '@docker/useStore'
import { goInstall } from '@docker/useMethods'
import {
	configEditorPopup,
	init,
	openStatus,
	repair,
	setMStatus,
	save,
	setUrl,
	setCompose,
	setIpv6,
	setIpv6View,
	unInstall,
	configEditorData,
	systemTemplate,
	renderSystem,
	onConfirmConfig,
	unmountHandler,
	FormCustomHelp,
	openWareForm,
	setLogCutting,
	setLogCuttingView,
	setSwitch,
	setDriver,
	setDockerProxy,
	setDockerConfigAppPath
 } from './useController'
import { isEmpty } from '@/utils'

import { ElSwitch } from 'element-plus'
import BtLink from '@/components/base/bt-link'

const {
	refs: { settingData, loading },
} = getDockerStore()

// 是否安装
const isInstall = computed(() => {
	return !settingData.value.docker_installed || !settingData.value.docker_compose_installed
})



// 表单实体
const { BtForm } = useForm({
	data: () => settingData.value,
	options: (formDataRef: Ref<FormData>) => {
		return computed(() => [
			FormItemCustom(
				'服务状态',
				() => {
					return (
						<div>
							{
								!isInstall.value ? (<span class="flex items-center text-small">
									当前状态：{ settingData.value.service_status ? '开启' : '停止' }
									<span class={settingData.value.service_status ? 'svgtofont-icon-start text-primary' : 'svgtofont-icon-stop text-danger'}></span>
									<ElButton class="!ml-[2rem]" onClick={()=>openStatus('toggle')}>{ settingData.value.service_status ? '停止' : '开启' }</ElButton>
									<ElButton onClick={()=>openStatus('reset')}>重启</ElButton>
									{
										!settingData.value.service_status && (<ElButton onClick={repair}>修复</ElButton>)
									}
								</span>):(<span>当前状态：未安装</span>)
							}
						</div>
					)
				},
			),
			...(settingData.value.monitor_status ? [
				FormGroup([
				FormItemCustom(
						'容器监控',
						() => {
							return (
								<ElSwitch v-model={settingData.value.monitor_status} onChange={setMStatus} />
							)
						},
						'monitor_status'
					),
					FormCustomHelp(`*设置容器页面监控开关,关闭后CPU使用率将不再监控`),
				]),
				FormGroup([
					FormInput('监控天数', 'monitor_save_date', {
						attrs: { class: '!w-[32rem]', placeholder: '请输入保存天数' },
					}),
					FormButton('保存', { attrs: { class: '!ml-4px',type:'primary', onClick: () => save('date') } }),
					FormCustomHelp(`*设置容器页面监控保存天数`),
				]),
			]:[]),
			FormGroup([
				FormInput('加速URL', 'url', {
					attrs: { class: '!w-[32rem]', placeholder: '加速URL',disabled:true },
				}),
				FormButton('修改', { attrs: { class: '!ml-4px', type:'primary', onClick: () => setUrl(formDataRef.value.url) } }),
				FormCustom(() => (<BtLink class="mx-[2rem] text-primary cursor-pointer leading-[3.2rem] mb-[1.8rem]" target="_blank" href='https://www.bt.cn/bbs/thread-134771-1-1.html'>>>帮助</BtLink>)),
				...(settingData.value.bad_registry ? [FormCustomHelp(`*提示：检测到您上次拉取镜像出现异常，请尝试更换推荐的加速站: ${settingData.value.bad_registry_path}`)]:[]),
			]),
			FormGroup([
				FormInput('docker compose', 'docker_compose_path', {
					attrs: { class: '!w-[32rem]', placeholder: 'docker compose路径',disabled:true },
				}),
				FormButton('修改', { attrs: { class: '!ml-4px',type:'primary', onClick: setCompose } }),
				FormCustomHelp(`*docker compose路径`),
			]),
			FormGroup([
				FormTextarea('私有仓库', 'warehouse', {
					attrs: { class: '!w-[32rem]',disabled:true,rows:4,autosize:{minRows:4,maxRows:4}, placeholder: 'Docker私有仓库地址' },
				}),
				FormButton('修改', { attrs: { class: '!ml-4px self-end',type:'primary', onClick: () => openWareForm(formDataRef.value.warehouse) } }),
				// FormCustomHelp(`*设置容器页面监控保存天数`),
			]),
			FormGroup([
				FormItemCustom(
					'日志切割',
					() => {
						return (
							<ElSwitch v-model={settingData.value.log_cutting.status} onChange={setLogCutting} />
						)
					},
					'log_cutting',
					{
						onClick: (e:Event) => e.preventDefault(),
					}
				),
				// ...(settingData.value.log_cutting.status ? [
					FormButton('设置', { attrs: { class: '!ml-[1rem]',type:'primary', onClick: () => setLogCuttingView() } }),
					FormItemCustom('', () => h('span',{class:'text-tertiary mt-[2px] leading-[2rem] text-small ml-[20px]'},`*切割文件大小${settingData.value.log_cutting.size}MB，保留份数${settingData.value.log_cutting.file}份`)),
				// ]:[]),
			]),
			FormGroup([
				FormItemCustom(
					'ipv6',
					() => {
						return (
							<ElSwitch v-model={settingData.value.ipv6} onChange={setIpv6} />
						)
					},
					'ipv6',
					{
						onClick: (e:Event) => e.preventDefault(),
					}
				),
				// ...(settingData.value.ipv6 ? [
					FormButton('ipv6地址配置', { attrs: { class: '!ml-[1rem]',type:'primary', onClick: setIpv6View } }),
				// ]:[]),
				FormCustomHelp(`*此ipv6范围将会在默认的bridge网络中使用，启用或关闭ipv6后需要重启docker，请确保可以重启docker再操作`),
			]),
			FormGroup([
				FormItemCustom(
					'iptables',
					() => {
						return (
							<ElSwitch v-model={settingData.value.iptables} onChange={(val:boolean) => setSwitch('iptables',val)} />
						)
					},
					'iptables',
					{
						onClick: (e:Event) => e.preventDefault(),
					}
				),
				FormCustomHelp(`*Docker 对 iptables 规则的自动配置`),
			]),
			FormGroup([
				FormItemCustom(
						'live_restore',
						() => {
						return (
							<ElSwitch v-model={settingData.value.live_restore} onChange={(val:boolean) => setSwitch('live_restore',val)} />
						)
					},
					'live_restore',
					{
						onClick: (e:Event) => e.preventDefault(),
					}
				),
				FormCustomHelp(`*开启后Docker守护进程发生意外停机或崩溃时保留正在运行的容器状态`),
			]),
			FormGroup([
				FormRadio('cgroup driver', 'driver', [
					{ label: 'cgroupfs', value: 'cgroupfs' },
					{ label: 'systemd', value: 'systemd' },
				],
				{
					attrs: {
						onChange: (val:string) => setDriver(val)
					}
				}
			),
			// FormButton('保存', { attrs: { class: '!ml-[1rem]',type:'primary', onClick: () => setDriver(formDataRef.value.driver) } }),
			]),
			FormItemCustom(
				'配置文件',
				() => {
					return (
						<ElButton type="primary" title="全局配置文件" onClick={()=>configEditorPopup.value = true}>打开配置文件</ElButton>
					)
				},
			),
			FormItemCustom(
				'Docker代理',
				() => {
					return (
						<div>
							<ElSwitch class="mr-[1rem]" v-model={settingData.value.proxy.status} onChange={setDockerProxy} />
							<ElButton type="primary" onClick={setDockerProxy}>设置代理</ElButton>
						</div>
					)
				},
				'customProxy',
				{
					onClick: (e:Event) => e.preventDefault(),
				}
			),
			FormItemCustom(
				'应用商店目录',
				() => {
					return (
						<div class="flex items-center">
							<ElInput
								v-model={settingData.value.dk_project_path}
								disabled={!settingData.value.allow_update_install_path}
								style="width: 32rem"
								placeholder="请输入目录"
							/>
							<ElButton
								type="primary"
								class="ml-4px"
								disabled={!settingData.value.allow_update_install_path}
								onClick={() => {
									setDockerConfigAppPath(settingData.value.dk_project_path)
								}}
							>修改</ElButton>
							{(!settingData.value.allow_update_install_path) ? (
								<span class="ml-[1.6rem] text-red-500 text-small">当前已有应用存在，无法修改</span>
							) : null}
						</div>
					)
				},
				'dk_project_path'
			),
			FormItemCustom(
				'卸载Docker',
				() => {
					return (
						<ElButton type="default" onClick={unInstall}>卸载</ElButton>
					)
				},
			),
		])
	},
})

// 视图加载完成后执行
onMounted(() => {
	init()
})

onUnmounted(() => {
	unmountHandler()
})
</script>

<style lang="css" scoped>
:deep(.el-input__inner) {
	@apply h-[3.2rem] leading-[3.2rem] text-small;
}
.unit {
	@apply text-tertiary ml-[1.2rem] text-small;
}
.line {
	@apply flex items-center;
}
.line div:first-child {
	@apply w-[13.5rem] mr-2rem text-right;
}
</style>
