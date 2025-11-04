import type { DockerSiteCreateEnvProps } from '@docker/types'
import { fileSelectionDialog } from '@/public/index'
import { useDialog, Message, useDataHandle } from '@/hooks/tools'
import { createEnv } from '@/api/docker'
import { useAllTable } from '@/hooks/tools/table/index'
import { FormItemCustom } from '@form/form-item'

import { ElInput, ElSwitch, ElCheckboxGroup, ElCheckboxButton, ElButton } from 'element-plus'
import { DOCKER_SITE_ENV_STORE } from '@docker/views/docker-site/site-env/useStore'
import { DOCKER_SITE_ENV_JAVA_STORE } from './useStore'
import { storeToRefs } from 'pinia'
import { openBuildLog } from '@docker/views/docker-site/site-env/build-log/useController'

const store = DOCKER_SITE_ENV_JAVA_STORE()
const { getVersion, setTypeRefreshTable } = DOCKER_SITE_ENV_STORE()
const { versionOptions, isEdit, rowData } = storeToRefs(store)
const { resetData } = store

/**
 * @description: 触发目录选择
 */
export const openFile = (formData: any) => {
	fileSelectionDialog({
		type: 'dir',
		path: formData.value.path || '/www/dk_project/wwwroot',
		change: (path: string, type: string) => {
			formData.value.path = path
		},
	})
}
/**
 * @description 创建环境
 * @returns {App}
 */
export const openJavaForm = (row?: any): Promise<boolean> => {
	isEdit.value = !!row?.name
	rowData.value = row || {}
	return new Promise((resolve, error) => {
		useDialog({
			title: '创建',
			area: 80,
			btn: ['确认', '取消'],
			component: () => import('@docker/views/docker-site/site-env/java-env/java-form.vue'),
			onCancel: () => {
				resetData()
				resolve(false)
			},
		})
	})
}
//输入信息
const setPort = (val: string | boolean | any[], row: any, item: string) => {
	switch (item) {
		case 'server':
			row.server = val
			break
		case 'con':
			row.con = val
			break
		case 'protocol':
			row.protocol = val
			break
		case 'output':
			row.output = val
			break
	}
}
/**
 * @description 端口表格
 * @returns {App}
 */
export const usePortTable = (list: any[]): any => {
	const { BtTable } = useAllTable({
		request: () => {
			return { data: list, total: list.length }
		},
		columns: [
			{
				label: '本地端口',
				prop: 'server',
				render: (row: any) => {
					return <ElInput v-model={row.server} placeholder="如：10080" class="w-[9rem]" onBlur={(e: any) => setPort(e.target.value, row, 'server')}></ElInput>
				},
			},
			{
				label: '容器端口',
				prop: 'con',
				render: (row: any) => {
					return <ElInput v-model={row.con} placeholder="如：80" class="w-[9rem]" onBlur={(e: any) => setPort(e.target.value, row, 'con')}></ElInput>
				},
			},
			{
				label: '允许外部访问',
				prop: 'output',
				width: 130,
				cellStyle: "{ textAlign: 'center' }",
				render: (row: any) => {
					return (
						<div class="h-[3rem]">
							<ElSwitch v-model={row.access} onChange={(val: boolean) => setPort(val, row, 'output')} />
						</div>
					)
				},
			},
			{
				label: '协议',
				prop: 'protocol',
				width: 140,
				render: (row: any) => {
					return (
						<div class="h-[3rem]">
							<ElCheckboxGroup v-model={row.protocol} onChange={(val: any[]) => setPort(val, row, 'protocol')}>
								<ElCheckboxButton value="tcp">TCP</ElCheckboxButton>
								<ElCheckboxButton value="udp">UDP</ElCheckboxButton>
							</ElCheckboxGroup>
						</div>
					)
				},
			},
			{
				label: ' ',
				prop: 'del',
				width: 70,
				render: (row: any) => {
					return (
						<ElButton
							type="default"
							class="svgtofont-el-delete"
							onClick={() => {
								if (list.length == 1) return Message.error('至少保留一条端口映射')
								list.splice(
									list.findIndex(item => item.id === row.id),
									1
								)
							}}></ElButton>
					)
				},
			},
		],
	})
	return FormItemCustom(
		'端口',
		() => {
			return (
				<div class="w-[90%]">
					<BtTable></BtTable>
					<div class="text-tertiary text-small">请填写映射到服务器本地的端口，例如：本地10080映射容器的80</div>
				</div>
			)
		},
		'port',
		{
			attrs: { class: '!w-[52rem]' },
			rules: [
				{
					required: true,
					trigger: ['blur', 'change'],
					validator: (rule: any, value: any, callback: any) => {
						portSubmit(value, callback)
					},
				},
			],
		}
	)
}

// 端口提交处理
export const portSubmit = (portList: any[], callback?: AnyFunction) => {
	if (portList.length == 0) {
		return true
	}
	const ports: any = {}
	for (let index = 0; index < portList.length; index++) {
		const item = portList[index]
		switch (true) {
			case item.server == '':
				!callback && Message.error(`端口表格第${index + 1}行` + '本地端口不能为空')
				callback && callback(new Error(`端口表格第${index + 1}行` + '本地端口不能为空'))
				return false
			case isNaN(Number(item.server)) || Number(item.server) < 1 || Number(item.server) > 65535:
				!callback && Message.error(`端口表格第${index + 1}行` + '请输入正确的本地端口范围')
				callback && callback(new Error(`端口表格第${index + 1}行` + '请输入正确的本地端口范围'))
				return false
			case item.con == '':
				!callback && Message.error(`端口表格第${index + 1}行` + '容器端口不能为空')
				callback && callback(new Error(`端口表格第${index + 1}行` + '容器端口不能为空'))
				return false
			case isNaN(Number(item.con)) || Number(item.con) < 1 || Number(item.con) > 65535:
				!callback && Message.error(`端口表格第${index + 1}行` + '请输入正确的容器端口范围')
				callback && callback(new Error(`端口表格第${index + 1}行` + '请输入正确的容器端口范围'))
				return false
			case item.protocol.length == 0:
				!callback && Message.error(`端口表格第${index + 1}行` + '协议不能为空')
				callback && callback(new Error(`端口表格第${index + 1}行` + '协议不能为空'))
				return false
		}
		ports[`${item.con}/${item.protocol.join('/')}`] = item.output ? item.server : ['127.0.0.1', item.server]
	}
	callback && callback()
	return ports
}

/**
 * @description 获取数据
 * @returns {App}
 */
export const getFormData = async (dataRef: Ref<{ version: string }>): Promise<any> => {
	try {
		const res: any = await getVersion('java')
		if (res.status) {
			versionOptions.value = res.data['java'].map((item: any) => ({ label: item, value: item }))
			if (versionOptions.value.length > 0 && !isEdit.value) {
				dataRef.value.version = versionOptions.value[0].value
			}
		}
	} catch (error) {}
}
/**
 * @description 表单数据
 * @returns {App}
 */
export const formData = () => {
	try {
		if (isEdit.value) {
			// 端口
			const arr: any[] = []
			Object.entries(JSON.parse(rowData.value.ports || '{}'))?.forEach((item: any, index: number) => {
				if (item[1]) {
					const [con, ...protocol] = item[0].split('/')
					arr.push({
						id: Math.random() * 1000,
						server: item[1][0].HostPort,
						con,
						protocol,
						output: item[1][0].HostIp === '0.0.0.0',
					})
				}
			})
			return {
				name: rowData.value.name,
				version: rowData.value.version,
				path: rowData.value.path,
				command: rowData.value.command,
				port: arr,
				id: rowData.value.id,
			}
		}
		return {
			name: '',
			version: '',
			path: '',
			command: '',
			port: [{ server: '', con: '', output: false, protocol: ['tcp'], id: Math.random() * 1000 }],
		}
	} catch (error) {}
}

/**
 * @description 创建环境
 */
export const createJavaEnv = async (formData: any, close: AnyFunction): Promise<any> => {
	try {
		const ports = portSubmit(formData.port)
		if (!ports) {
			return false
		}
		const obj: DockerSiteCreateEnvProps = {
			runtime_name: formData.name,
			runtime_version: formData.version,
			site_path: formData.path,
			command: formData.command,
			ports: ports === true ? '' : JSON.stringify(ports),
			runtime_type: 'java',
			...(formData.id ? { id: formData.id } : {}),
		}
		await useDataHandle({
			request: createEnv(obj),
			success: (res: any) => {
				if (res.status) {
					close()
					openBuildLog(`tail -f /www/dk_project/runtime/run/java/${formData.name}/create.log`, () => {
						setTypeRefreshTable('java')
					})
				} else {
					Message.error(res.msg)
				}
			},
		})
	} catch (error) {}
}
