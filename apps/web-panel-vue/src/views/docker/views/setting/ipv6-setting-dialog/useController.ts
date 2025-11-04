import { getDockerStore } from '@docker/useStore'
import { setDockerGlobal } from "@/api/docker";
import { useDataHandle,useConfirm } from "@/hooks/tools";

interface formDataProp {
	address: string;
}


const {
	getDockerState
} = getDockerStore() // 表格刷新


/**
 * @description: 设置IPV6范围
 */
export const onConfirm = async (formDataRef: Ref<formDataProp>,popupClose:AnyFunction) => {
  try {
    await useConfirm({
      title: "设置IPV6范围",
      content: `设置后需要重启docker，请确保可以重启docker再操作。是否继续？`,
    });
    useDataHandle({
      request: setDockerGlobal({ status: 1, 'fixed-cidr-v6': formDataRef.value.address }),
      loading: "正在设置，请稍候...",
			message: true,
      success: () => {
				popupClose();
				getDockerState()
			},
    });
  } catch (error) {
    console.log(error);
  }
};