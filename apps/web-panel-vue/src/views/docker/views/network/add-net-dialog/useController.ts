import { getDockerStore } from '@docker/useStore'
import { addN } from "@/api/docker";
import { checkIps } from "@utils/index";
import { Message,useDataHandle } from "@/hooks/tools";

interface formDataProp {
	name: string;
	driver: string;
	options: string;
	subnet: string;
	gateway: string;
	iprange: string;
	labels: string;
	remark: string;
	subnet_v6: string; // ipv6子网
	gateway_v6: string; // ipv6网关
	isAdv: boolean; // 是否高级设置
	ipv6: boolean; // 是否设置ipv6
}


const {
	refs: { isRefreshNetworkList },
} = getDockerStore() // 表格刷新


// 类型
export const options = [
  { label: "bridge", value: "bridge" },
  { label: "ipvlan", value: "ipvlan" },
  { label: "macvlan", value: "macvlan" },
  { label: "overlay", value: "overlay" },
];

export const checkIpValidator = (value: any, callback: any, message: string) => {
  if (value !== "" && !checkIps(value)) {
    callback(new Error(message));
  } else {
    callback();
  }
};

// 提交
export const onConfirm = async (formDataRef:Ref<formDataProp>,popupClose:AnyFunction) => {
	useDataHandle({
		request: addN({
			data: JSON.stringify({ 
				name: formDataRef.value.name,
				driver: formDataRef.value.driver,
				options: formDataRef.value.options,
				subnet: formDataRef.value.subnet,
				gateway: formDataRef.value.gateway,
				iprange: formDataRef.value.iprange,
				labels: formDataRef.value.labels,
				remark: formDataRef.value.remark,
				status: formDataRef.value.ipv6 ? 1 : 0 ,
				...(formDataRef.value.ipv6 ? {
					subnet_v6: formDataRef.value.subnet_v6,
					gateway_v6: formDataRef.value.gateway_v6,
				}:{subnet_v6: "",gateway_v6: ""}),
			}),
		}),
		message: true,
		loading: "正在设置网络...",
		success: ({ status }: { status: boolean }) => {
			if (status) {
				isRefreshNetworkList.value = true;
				popupClose();
			}
		},
	});
}