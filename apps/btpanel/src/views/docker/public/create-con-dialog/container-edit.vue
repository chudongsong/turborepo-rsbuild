<template>
	<div class="container-dialog" :style="`max-height:${containerEditHight}px`">
		<el-form ref="cmdFormRef" :model="cmdForm" :rules="cmdRules" :label-position="`right`" @submit.native.prevent>
			<div class="pb-[0]">
				<el-form-item :disabled="editLoad" prop="name" label="容器名称">
					<bt-input v-model="cmdForm.name" :disabled="editLoad" width="40rem" :placeholder="editLoad ? `正在获取中...` : `请输入容器名称`" />
				</el-form-item>
				<el-form-item prop="image" label="镜像">
					<el-autocomplete popper-class="my-autocomplete" v-model="cmdForm.image" :disabled="editLoad" class="!w-[40rem]" :popper-append-to-body="false" :fetch-suggestions="querySearch" @select="setValue" :placeholder="editLoad ? `正在获取中...` : `请输入或选择镜像`">
						<!-- <i class="svgtofont-el-arrow-down el-input__icon"></i> -->
						<template #default="{ item }">
							<div class="flex items-center justify-between py-[1rem]" :title="`${item.value}`" :class="item.value === cmdForm.image ? ' text-primary hover:text-[#1d9534]' : ''">
								<div class="max-w-[25rem]">
									<div class="text-base leading-[1.4] max-w-[25rem] truncate">
										{{ `${item.value}` }}
									</div>
									<div class="text-small leading-[1.2] text-[#ccc] mt-[1rem]">
										{{ `${item.id?.slice(0, 12) || ''}` }}
									</div>
								</div>
								<span class="name">{{ getByteUnit(item.size) }}</span>
							</div>
						</template>
					</el-autocomplete>
				</el-form-item>
				<span class="inline-block ml-[10rem]">*可直接输入docker.io中的本地未下载的镜像直接创建容器</span>
				<el-form-item prop="port" label="端口" class="!mt-[1.6rem]">
					<bt-radio type="button" v-model="cmdForm.port" :options="type" />
				</el-form-item>
				<div class="my-[1rem] ml-[10rem]" v-show="cmdForm.port == 'port'">
					<bt-table class="mb-[10px]" ref="Table" v-show="portList.length > 0" row-key="id" :column="tableColumn" :data="portList" :description="'端口列表为空'" />
					<el-button title="添加端口" @click="addPort">添加</el-button>
				</div>
			</div>

			<el-form-item v-show="!cmdForm.auto_remove" prop="path" class="!mt-[.8rem]" label="重启规则">
				<el-radio-group v-model="cmdForm.reSet">
					<el-radio class="!leading-[2.5rem]" value="no">不重启</el-radio>
					<el-radio class="!leading-[2.5rem]" value="on-failure">失败后重启（默认重启5次）</el-radio>
					<el-radio class="!leading-[2.5rem]" value="unless-stopped">仅非正常退出的时候重启</el-radio>
					<el-radio class="!leading-[2.5rem]" value="always"
						>停止后马上重启 <el-tooltip class="item" effect="dark" content="服务器重启时也会马上重启" placement="top"> <i class="svgtofont-el-info-filled text-warning"></i> </el-tooltip
					></el-radio>
				</el-radio-group>
			</el-form-item>

			<div class="flex items-center cursor-pointer pl-[10rem] my-[2rem] px-[2rem]" @click="isAdv = !isAdv">
				<i :class="isAdv ? 'svgtofont-el-arrow-down' : 'svgtofont-el-arrow-right'"></i>
				<div class="ml-[1rem] text-primary w-[16rem] select-none">
					{{ `更多设置，${isAdv ? '点击收回' : '点击查看'}` }}
				</div>
			</div>
			<div v-show="isAdv" class="pt-[0]">
				<el-form-item label="网络">
					<div class="w-full">
						<bt-table ref="Table" v-show="cmdForm.net.length > 0" :column="tableNetColumn" :data="cmdForm.net" :description="'网络列表为空'" />
						<el-button :class="cmdForm.net.length > 0 ? '!mt-[1rem]' : ''" @click="addNet">添加网络</el-button>
					</div>
				</el-form-item>
				<el-form-item label="挂载/映射">
					<div class="border-lighter border rounded-small mb-[1rem] p-[1.5rem] w-full" v-show="cmdForm.mountList.length > 0" v-for="item in cmdForm.mountList" :key="item.id">
						<div class="flex items-center justify-between mb-[1.5rem]">
							<bt-radio type="button" v-model="item.Mtype" :options="MOption" />
							<el-button class="!ml-[4rem]" @click="delMount(item)">
								<i class="svgtofont-el-delete"></i>
							</el-button>
						</div>

						<div class="flex items-center text-small">
							<div v-show="item.Mtype == 'volume'">
								<div class="px-[.2rem] py-[.4rem]">挂载卷</div>
								<el-select v-model="item.volume" class="!w-[17rem]">
									<el-option v-for="items in volumeOptions" :key="items.key" :label="items.title" :value="items.key"> </el-option>
								</el-select>
							</div>
							<div v-show="item.Mtype == 'dir'">
								<div class="px-[.2rem] py-[.4rem]">挂载目录</div>
								<bt-input-icon v-model="item.local" class="!w-[17rem]" icon="icon-file_mode" @icon-click="openFile(item)" @change.passive="clearSpace(item)" :placeholder="`请输入镜像路径`" />
							</div>

							<div class="ml-[1rem]">
								<div class="px-[.2rem] py-[.4rem]">权限</div>
								<el-select v-model="item.auth" class="!w-[17rem]">
									<el-option v-for="items in authOptions" :key="items.key" :label="items.title" :value="items.key"> </el-option>
								</el-select>
							</div>
							<div class="ml-[1rem]">
								<div class="px-[.2rem] py-[.4rem]">容器目录</div>
								<bt-input width="17rem" v-model="item.dir" />
							</div>
						</div>
					</div>
					<el-button @click="addMount">添加</el-button>
				</el-form-item>

				<el-form-item label="command">
					<bt-input type="textarea" v-model="cmdForm.command" placeholder="一行一个" width="24rem" />
				</el-form-item>

				<el-form-item label="entrypoint">
					<bt-input v-model="cmdForm.entrypoint" width="24rem" />
				</el-form-item>

				<el-form-item prop="auto_remove" class="!mt-[.8rem]" label=" ">
					<el-checkbox v-model="cmdForm.auto_remove">容器退出后自动删除容器</el-checkbox>
				</el-form-item>

				<el-form-item prop="console" class="!mt-[.8rem]" label="控制台交互">
					<el-checkbox-group v-model="cmdForm.console">
						<el-checkbox value="-t">伪终端（-t）</el-checkbox>
						<el-checkbox value="-i">标准输入（-i）</el-checkbox>
					</el-checkbox-group>
				</el-form-item>

				<el-form-item prop="privileged" class="!mt-[0rem]" label=" ">
					<el-checkbox v-model="cmdForm.privileged">特权模式</el-checkbox>
				</el-form-item>

				<el-form-item v-if="maxGpus > 0" prop="gpus" label="GPU">
					<div class="flex items-center">
						<el-slider class="!w-[20rem] pl-[.6rem]" v-model="cmdForm.gpus" :min="0" :max="maxGpus" />
						<div class="inline-flex ml-[1.2rem] flex items-center flex-nowrap">
							<bt-input v-model.number="cmdForm.gpus" class="mr-[0.8rem] !w-[8rem]" />
							<span class="unit">GPU (最大值：{{ maxGpus }})</span>
						</div>
					</div>
				</el-form-item>
				<el-form-item prop="mem_reservation" label="最小分配内存">
					<div class="flex items-center">
						<el-slider class="!w-[20rem] pl-[.6rem]" v-model="cmdForm.mem_reservation" :min="0" :max="maxMem" />
						<div class="inline-flex ml-[1.2rem] flex items-center flex-nowrap">
							<bt-input v-model.number="cmdForm.mem_reservation" class="mr-[0.8rem] !w-[8rem]" />
							<span class="unit">MB (最大值：{{ maxMem }})</span>
						</div>
					</div>
				</el-form-item>
				<el-form-item prop="cpu_quota" class="!mt-[1.4rem]" label="CPU限制">
					<div class="flex items-center">
						<el-slider class="!w-[20rem] pl-[.6rem]" v-model="cmdForm.cpu_quota" :min="0" :max="maxCPU" />

						<span class="ml-[1.2rem] flex items-center">
							<bt-input v-model.number="cmdForm.cpu_quota" class="mr-[0.8rem] !w-[8rem]" />
							<span class="unit">核 (最大值：{{ maxCPU }})</span>
						</span>
					</div>
				</el-form-item>
				<el-form-item prop="path" class="!mt-[1.4rem]" label="内存限制">
					<el-slider class="!w-[20rem] pl-[.6rem]" v-model="cmdForm.mem_limit" :min="0" :max="maxMem" />
					<span class="ml-[1.2rem] flex items-center">
						<bt-input v-model.number="cmdForm.mem_limit" class="mr-[0.8rem] !w-[8rem]" />
						<span class="unit">MB(最大值：{{ maxMem }})</span>
					</span>
				</el-form-item>

				<el-form-item prop="labels" label="标签">
					<el-input type="textarea" :rows="5" class="!w-[50rem]" :placeholder="`容器标签，一行一个，例：key=value`" v-model="cmdForm.labels"> </el-input>
				</el-form-item>

				<el-form-item prop="environment" label="环境变量">
					<el-input type="textarea" :rows="5" class="!w-[50rem]" :placeholder="`添加环境变量格式如下，有多个请换行添加：\nJAVA_HOME=/usr/local/java8\nHOSTNAME=master`" v-model="cmdForm.environment"> </el-input>
				</el-form-item>

				<el-form-item v-if="props.type !== 'edit'" prop="remark" label="备注">
					<el-input type="textarea" :rows="5" class="!w-[50rem]" placeholder="容器备注" v-model="cmdForm.remark"> </el-input>
				</el-form-item>
			</div>

			<el-button class="ml-[10rem] mb-[54px]" v-if="isEdit" type="primary" @click="onEdit"> 保存容器配置 </el-button>
		</el-form>
	</div>
</template>
<script setup lang="tsx">
import { getDockerStore } from '@docker/useStore'

import { openNps, usePortTableColumn, useTableNetColumn } from '@docker/useMethods'
import { AddContainerStatus, editCon, getMirrorList, getStorageList, getNetList } from '@/api/docker'
import { getRandomPwd, isEmpty, checkIp, checkVariable, getByteUnit } from '@utils/index'
import { fileSelectionDialog } from '@/public/index'
import { useGlobalStore } from '@store/global'
import { Message } from '@hooks/tools/message'
import { useConfirm } from '@hooks/tools/confirm'
import { useDataHandle } from '@hooks/tools/data'

interface Props {
	compData?: any
	type?: string
}

interface mountItem {
	id: string
	Mtype: string
	volume: string
	local: string
	dir: string
	auth: string
}

interface portItem {
	id: string
	server: string
	con: string
	protocol: string[]
}

const popupClose = inject<any>('popupClose') //     弹窗关闭

const {
	refs: { currentConDetail, maxCPU, maxMem, maxGpus, isRefreshTableList },
} = getDockerStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
	type: 'edit',
})
const emits = defineEmits(['close'])
const { mainHeight } = useGlobalStore()

let imageLoad = false // 镜像加载

// 编辑加载
const editLoad = ref(false)
const isEdit = ref(props.type == 'edit' || props.compData.type == 'edit')

const type = [
	{ label: '暴露端口', value: 'port' },
	{ label: '暴露所有', value: 'all' },
] // 创建方式选项

// 是否高级设置
const isAdv = ref(false)
// 挂载方式
const MOption = [
	{ label: '本机目录', value: 'dir' },
	{ label: '挂载卷', value: 'volume' },
] // 挂载方式选项

// 表单
const cmdForm = reactive({
	name: '',
	image: '',
	port: 'port',
	portList: [] as portItem[],
	net: [] as any[],
	mountList: [] as mountItem[],
	command: '',
	entrypoint: '',
	auto_remove: false,
	console: [] as string[],
	privileged: false,
	reSet: 'always',
	mem_reservation: 0,
	cpu_quota: 0,
	labels: '',
	environment: '',
	mem_limit: 0,
	remark: '',
	gpus: 0,
})

const portList = shallowRef<any>([])
const containerEditHight = computed(() => (mainHeight.value - 240 < 620 ? mainHeight.value - 240 : 620))

// 编辑模式获取数据
const getDetail = () => {
	const row = props.compData.row
	cmdForm.name = row.name
	cmdForm.image = row.image
	cmdForm.remark = row.remark
	const port = checkVariable(row.ports, 'object', {})
	// 端口
	portList.value = []
	Object.entries(port)?.forEach((item: any, index: number) => {
		if (item[1]) {
			const [con, ...protocol] = item[0].split('/')
			portList.value.push({
				id: getRandomPwd(),
				server: item[1][0].HostPort,
				con,
				output: item[1][0].HostIp === '0.0.0.0',
				protocol,
			})
		}
	})
	const nets: any = Object.entries(currentConDetail.value.NetworkSettings?.Networks || {})
	if (nets.length > 0) {
		// 网络
		cmdForm.net = nets.map((item: any, index: number) => {
			return {
				id: getRandomPwd(),
				network: item[0],
				ip4: item[1].IPAddress,
				ip6: item[1].GlobalIPv6Address,
			}
		})
	}
	// 挂载卷
	currentConDetail.value.Mounts?.forEach((item: any, index: number) => {
		cmdForm.mountList.push({
			id: getRandomPwd(),
			Mtype: 'dir',
			volume: '',
			local: item.Source,
			dir: item.Destination,
			auth: item.RW ? 'rw' : 'ro',
		})
	})
	// 自动删除
	cmdForm.auto_remove = currentConDetail.value?.HostConfig?.AutoRemove
	// 控制台交互
	if (currentConDetail.value?.Config?.Tty) {
		cmdForm.console.push('-t')
	}
	if (currentConDetail.value?.Config?.OpenStdin) {
		cmdForm.console.push('-i')
	}
	// 特权模式
	cmdForm.privileged = currentConDetail.value.HostConfig.Privileged
	// 重启规则
	cmdForm.reSet = currentConDetail.value.HostConfig?.RestartPolicy.Name
	// 最小分配内存
	cmdForm.mem_reservation = currentConDetail.value.HostConfig?.MemoryReservation / 1024 / 1024
	// CPU限制
	cmdForm.cpu_quota = currentConDetail.value.HostConfig?.CpuQuota / 100000
	// 内存限制
	cmdForm.mem_limit = currentConDetail.value.HostConfig?.Memory / 1024 / 1024
	// GPU
	cmdForm.gpus = currentConDetail.value.gpu_count
	// 标签
	Object.entries(currentConDetail.value.Config.Labels)?.forEach((item: any, index: number) => {
		cmdForm.labels += `${item[0]}=${item[1]}\n`
	})
	// 环境变量
	currentConDetail.value.Config.Env?.forEach((item: any, index: number) => {
		cmdForm.environment += `${item}\n`
	})
	// command
	cmdForm.command = currentConDetail.value.Config.Cmd.join('\n')
	// entrypoint
	cmdForm.entrypoint = currentConDetail.value.Config.Entrypoint.join(' ')
}

const cmdFormRef = ref()
// 验证规则
const cmdRules = {
	name: [{ required: true, message: '请输入容器名', trigger: 'blur' }],
	image: [{ required: true, message: '请选择镜像', trigger: ['blur', 'change'] }],
}

//输入信息
const setPort = (val: string, row: any, item: string) => {
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
// 添加网络
const addNet = () => {
	cmdForm.net.push({
		id: getRandomPwd(),
		network: '',
		ip4: '',
		ip6: '',
	})
}

// 删除网络
const delNet = (row: any) => {
	const index = cmdForm.net.findIndex((item: any) => item.id === row.id)
	cmdForm.net.splice(index, 1)
}

// 添加端口
const addPort = () => {
	portList.value = [
		...portList.value,
		{
			id: getRandomPwd(),
			server: '',
			con: '',
			protocol: ['tcp'],
			output: false,
		},
	]
}

// 删除端口
const delPort = (row: any) => {
	const index = portList.value.findIndex((item: any) => item.id === row.id)
	portList.value.splice(index, 1)
	portList.value = [...portList.value]
}

// 网络类型
const netOptions = shallowRef([])

// 选择网络类型
const changeNet = (row: any, val: string, type: string) => {
	switch (type) {
		case 'network':
			row.network = val
			if (val === 'bridge' || val === 'none' || val === 'host') {
				row.ip4 = ''
				row.ip6 = ''
			}
			break
		case 'ip4':
			row.ip4 = val
			break
		case 'ip6':
			row.ip6 = val
			break
	}
}

// 添加挂载
const addMount = () => {
	cmdForm.mountList.push({
		id: getRandomPwd(),
		Mtype: 'volume',
		volume: '',
		local: '',
		dir: '',
		auth: 'ro',
	})
}

// 删除挂载
const delMount = (row: any) => {
	const index = cmdForm.mountList.findIndex((item: any) => item.id === row.id)
	cmdForm.mountList.splice(index, 1)
}

// 设置镜像选项
const mirrorOptions = shallowRef<{ value: string; id: string; size: number }[]>([])
let timer: any = null
let selectValue = ''
// 设置选中的值
const setValue = (val: any) => {
	selectValue = val.value
}
// 搜索镜像
const querySearch = (queryString: string, cb: any) => {
	// 返回结果
	const performSearch = () => {
		const showList = mirrorOptions.value
		const results =
			queryString === selectValue
				? showList.sort((a, b) => {
						if (a.value === selectValue && b.value !== selectValue) {
							return -1 // a排在前面
						} else if (a.value !== selectValue && b.value === selectValue) {
							return 1 // b排在前面
						} else {
							return 0 // 保持原顺序
						}
				  })
				: showList.filter((image: any) => image.value.includes(queryString))
		cb(results)
	}
	// 如果正在加载镜像就等待
	if (imageLoad) {
		timer = setInterval(() => {
			if (!imageLoad) {
				clearInterval(timer)
				performSearch()
			}
		}, 1000)
	} else {
		// 如果没有加载就直接搜索
		performSearch()
	}
}

// 设置挂载卷选项
const volumeOptions = shallowRef<{ key: string; title: string }[]>([])

// 权限选项
const authOptions = [
	{ key: 'ro', title: '只读' },
	{ key: 'rw', title: '读写' },
]

/**
 * @description: 触发目录选择
 */
const openFile = (item: any) => {
	fileSelectionDialog({
		type: 'dir',
		change: (path: string) => {
			item.local = path
		},
	})
}

/**
 * @description: 清除空格
 */
const clearSpace = (item: any) => {
	const path = checkVariable(item.local, 'string', '')
	item.local = path.replace(/\s+/g, '')
}

// 端口表格列
const tableColumn = usePortTableColumn({
	setPort,
	delPort,
})

// 网络表格列
const tableNetColumn = useTableNetColumn({
	changeNet,
	delNet,
	netOptions,
})

// 编辑提交
const onEdit = async () => {
	if (editLoad.value) {
		Message.error('正在获取容器数据中，请稍后')
		return
	}
	await cmdFormRef.value.validate()
	try {
		const ports = portSubmit()
		const volumes = mountSubmit()
		const nets = netSubmit()
		if (isEmpty(ports) || !volumes || !nets) return false
		const params: any = {
			id: props.compData.row.id,
			new_name: cmdForm.name,
			new_image: cmdForm.image,
			new_publish_all_ports: cmdForm.port == 'all' ? '1' : '0',
			new_ports: ports === true ? '' : ports,
			network_info: nets === true ? [] : nets,
			new_command: cmdForm.command,
			new_entrypoint: cmdForm.entrypoint,
			new_auto_remove: cmdForm.auto_remove ? '1' : '0',
			new_privileged: cmdForm.privileged ? '1' : '0',
			new_restart_policy: {
				Name: cmdForm.reSet,
			},
			new_mem_reservation: `${cmdForm.mem_reservation == 0 ? 0 : `${cmdForm.mem_reservation}MB`}`,
			gpus: cmdForm.gpus,
			new_cpu_quota: cmdForm.cpu_quota,
			new_mem_limit: `${cmdForm.mem_limit == 0 ? 0 : `${cmdForm.mem_limit}MB`}`,
			new_labels: setInput(cmdForm.labels),
			new_environment: setInput(cmdForm.environment),
			// remark: cmdForm.remark,
		}
		// 如果选了自动删除就不添加重启规则
		if (cmdForm.auto_remove) {
			params.new_restart_policy.Name = ''
		}
		// 有存储卷就添加存储卷
		if (volumes && Object.keys(volumes).length > 0) {
			params.new_volumes = volumes
		}
		// 重启规则为失败后重启时默认5次
		if (cmdForm.reSet == 'on-failure') {
			params.new_restart_policy.MaximumRetryCount = 5
		}
		// 有控制台交互就添加
		if (cmdForm.console.length > 0) {
			cmdForm.console?.forEach((item: any, index: number) => {
				switch (item) {
					case '-t':
						params.new_tty = true
						break
					case '-i':
						params.new_stdin_open = true
						break
					default:
						break
				}
			})
		}
		await useConfirm({
			title: `编辑容器【${props.compData.row.name}】`,
			width: '45rem',
			content: `【command、entrypoint，标签和环境变量】<span class="text-danger">配置错误可能导致编辑后的容器无法运行或者丢失</span>，请谨慎操作`,
			isHtml: true,
			type: 'input',
			input: { content: '确认无误' },
		})

		await useDataHandle({
			request: editCon({ data: JSON.stringify(params) }),
			message: true,
			loading: '正在编辑容器，请稍后...',
			success: (res: any) => {
				// 编辑后id会变，所以重新获取列表
				if (res.status) {
					setTimeout(() => {
						window.location.reload()
					}, 1000)
					popupClose()
					emits('close')
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

// 网络提交处理
const netSubmit = ():
	| boolean
	| {
			network: string
			ip_address: string
			ip_addressv6: string
	  }[] => {
	try {
		if (cmdForm.net.length == 0) {
			return true
		}
		const network_info: any = []
		cmdForm.net?.forEach((item: any) => {
			if (item.network === '' && item.ip4 !== '') {
				Message.error('请选择网络')
				return false
			}
			if (item.ip4 !== '' && !checkIp(item.ip4)) {
				Message.error('请输入正确的IPV4地址,为空则自动生成')
				throw Error('请输入正确的IPV4地址,为空则自动生成')
			}
			network_info.push({
				network: item.network,
				ip_address: item.ip4,
				ip_addressv6: item.ip6,
			})
		})
		// 过滤空的网络
		return network_info.filter((item: any) => item.network !== '')
	} catch (error) {
		return false
	}
}

// 端口提交处理
const portSubmit = () => {
	if (cmdForm.port == 'all' || portList.value.length == 0) {
		return true
	}
	const ports: any = {}
	portList.value?.forEach((item: any) => {
		if (item.server == '') {
			Message.error('本地端口不能为空')
			return false
		}
		if (isNaN(Number(item.server)) || Number(item.server) < 1 || Number(item.server) > 65535) {
			Message.error('请输入正确的本地端口范围')
			return false
		}
		if (item.con == '') {
			Message.error('容器不能为空')
			return false
		}
		if (isNaN(Number(item.con)) || Number(item.con) < 1 || Number(item.con) > 65535) {
			Message.error('请输入正确的容器端口范围')
			return false
		}
		if (item.protocol.length == 0) {
			Message.error('协议不能为空')
			return false
		}
		ports[`${item.con}/${item.protocol.join('/')}`] = item.output ? item.server : ['127.0.0.1', item.server]
	})
	return ports
}

// 存储卷提交处理
const mountSubmit = () => {
	if (cmdForm.mountList.length == 0) {
		return true
	}
	let mount: any = {}
	cmdForm.mountList?.forEach((item: any) => {
		if (item.Mtype == 'volume') {
			if (item.volume == '') {
				Message.error('挂载卷不能为空')
				mount = false
			}
		} else {
			if (item.local == '') {
				Message.error('挂载目录不能为空')
				mount = false
			}
		}
		if (item.auth == '') {
			Message.error('权限不能为空')
			mount = false
		}
		if (item.dir == '') {
			Message.error('容器目录不能为空')
			mount = false
		}
		if (mount !== false) {
			mount[`${item.Mtype == 'volume' ? item.volume : item.local}`] = {
				bind: item.dir,
				mode: item.auth,
			}
		}
	})
	return mount
}

// 多行输入处理
const setInput = (val: string) => {
	const arr = val.split('\n')
	if (arr.length == 1) return val
	return arr.join('\n')
}

// 添加提交
const onConfirm = async () => {
	await cmdFormRef.value.validate()
	try {
		const ports = portSubmit()
		const volumes = mountSubmit()
		const nets = netSubmit()
		if (isEmpty(ports) || !volumes || !nets) return false
		const params: any = {
			name: cmdForm.name,
			image: cmdForm.image,
			publish_all_ports: cmdForm.port == 'all' ? '1' : '0',
			ports: ports === true ? '' : ports,
			network_info: nets === true ? [] : nets,
			command: cmdForm.command,
			entrypoint: cmdForm.entrypoint,
			auto_remove: cmdForm.auto_remove ? '1' : '0',
			privileged: cmdForm.privileged ? '1' : '0',
			restart_policy: { Name: cmdForm.reSet },
			gpus: cmdForm.gpus,
			mem_reservation: `${cmdForm.mem_reservation == 0 ? 0 : `${cmdForm.mem_reservation}MB`}`,
			cpu_quota: cmdForm.cpu_quota,
			mem_limit: `${cmdForm.mem_limit == 0 ? 0 : `${cmdForm.mem_limit}MB`}`,
			labels: setInput(cmdForm.labels),
			environment: setInput(cmdForm.environment),
			remark: cmdForm.remark,
		}
		// 如果选了自动删除就不添加重启规则
		if (cmdForm.auto_remove) params.restart_policy.Name = ''
		// 有存储卷就添加存储卷
		if (volumes && Object.keys(volumes).length > 0) params.volumes = volumes
		// 重启规则为失败后重启时默认5次
		if (cmdForm.reSet == 'on-failure') params.restart_policy.MaximumRetryCount = 5
		// 有控制台交互就添加
		if (cmdForm.console.length > 0) {
			cmdForm.console?.forEach((item: any, index: number) => {
				switch (item) {
					case '-t':
						params.tty = '1'
						break
					case '-i':
						params.stdin_open = '1'
						break
					default:
						break
				}
			})
		}
		useDataHandle({
			request: AddContainerStatus({ data: JSON.stringify(params) }),
			message: true,
			loading: '添加中...',
			success: (res: any) => {
				if (res.status) {
					// openNps()
					isRefreshTableList.value = true
					emits('close')
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

// 获取选项数据
const getOptions = async () => {
	// 获取网络选项
	await useDataHandle({
		request: getNetList(),
		data: Array,
		success: (data: any) => {
			netOptions.value = data.map((item: any) => {
				return { label: item.name, value: item.name }
			})
		},
	})
	// 获取镜像选项
	await useDataHandle({
		request: getMirrorList(),
		data: Array,
		success: (data: any) => {
			mirrorOptions.value = data.map((item: any) => {
				return {
					value: item.name,
					id: item.id.replace('sha256:', ''),
					size: item.size,
				}
			})
		},
	})

	imageLoad = false
	nextTick(() => {
		// 初始化镜像选项
		cmdForm.image = props.compData.image || props.compData.row?.image || ''
		// 获取存储卷选项
		useDataHandle({
			request: getStorageList(),
			data: Array,
			success: (data: any) => {
				volumeOptions.value = data.map((item: any) => ({ key: item.Name, title: item.Name }))
			},
		})
	})
}

// 如果用户设置了容器推出后自动删除,就把重启策略跳到不重启
watch(
	() => cmdForm.auto_remove,
	newVal => {
		if (newVal) cmdForm.reSet = 'no'
	}
)

onMounted(async () => {
	try {
		imageLoad = true // 关闭镜像提示
		if (isEdit.value) editLoad.value = true
		getOptions()
		// 默认开启GPU
		if (maxGpus.value > 0) cmdForm.gpus = maxGpus.value
		// 如果是编辑就获取当前容器详情
		if (isEdit.value) getDetail()
	} catch (error) {
	} finally {
		editLoad.value = false
	}
})

defineExpose({ onConfirm })
</script>
<style lang="css" scoped>
:deep(.el-autocomplete-suggestion.is-loading li) {
	height: 3.2rem !important;
	line-height: 3.2rem !important;
}
.unit {
	@apply text-small text-secondary;
}
.container-dialog {
	@apply flex flex-col lib-box;
}
.container-dialog .table .item {
	@apply flex items-center h-[5rem];
}
:deep(.shortLabel .el-form-item__label) {
	@apply min-w-[4rem];
}
</style>
