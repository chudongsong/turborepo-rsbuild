import { getDockerStore } from '@docker/useStore'
import { dokcerInstall } from "@/api/docker";
import { msgBoxDialog } from "@/public/index";
import { useDataHandle } from "@/hooks/tools";

interface formDataProp {
	installType: 'default' | 'custom' | 'binary';
	url: string;
}

const { getSet } = getDockerStore();

export const typeOptions = [
  { label: "默认", value: "default" },
  { label: "自定义", value: "custom" },
  { label: "二进制安装", value: "binary" },
];

export const options = [
  {
    label: "mirrors.aliyun.com/docker-ce(阿里云镜像)",
    value: "mirrors.aliyun.com/docker-ce",
  },
  {
    label: "mirrors.tencent.com/docker-ce(腾讯云镜像)",
    value: "mirrors.tencent.com/docker-ce",
  },
  {
    label: "repo.huaweicloud.com/docker-ce(华为云镜像)",
    value: "repo.huaweicloud.com/docker-ce",
  },
  {
    label: "mirror.azure.cn/docker-ce(微软 Azure 镜像)",
    value: "mirror.azure.cn/docker-ce",
  },
  {
    label: "mirrors.163.com/docker-ce(网易云镜像)",
    value: "mirrors.163.com/docker-ce",
  },
  {
    label: "mirrors.tuna.tsinghua.edu.cn/docker-ce(清华大学 TUNA 镜像)",
    value: "mirrors.tuna.tsinghua.edu.cn/docker-ce",
  },
  {
    label: "mirrors.pku.edu.cn/docker-ce(北京大学镜像)",
    value: "mirrors.pku.edu.cn/docker-ce",
  },
  {
    label: "mirrors.nju.edu.cn/docker-ce(南京大学镜像)",
    value: "mirrors.nju.edu.cn/docker-ce",
  },
  {
    label: "mirror.sjtu.edu.cn/docker-ce(上海交通大学镜像)",
    value: "mirror.sjtu.edu.cn/docker-ce",
  },
  {
    label: "mirrors.ustc.edu.cn/docker-ce(中国科技大学镜像)",
    value: "mirrors.ustc.edu.cn/docker-ce",
  },
  {
    label: "mirror.iscas.ac.cn/docker-ce(中国科学院计算技术研究所镜像)",
    value: "mirror.iscas.ac.cn/docker-ce",
  },
  {
    label: "download.docker.com(Docker 官方镜像)",
    value: "download.docker.com",
  },
];

/**
 * @description: 设置IPV6范围
 */
export const onConfirm = async (formDataRef: Ref<formDataProp>,popupClose:AnyFunction) => {
  try {
		await useDataHandle({
			request: dokcerInstall({
				type: formDataRef.value.installType === "binary" ? 1 : 0,
				...(formDataRef.value.installType == "custom" ? { url: formDataRef.value.url } : {}),
			}),
			message: true,
			success: ({ status }: { status: boolean }) => {
				if (status) {
					msgBoxDialog(); // 消息盒子弹窗
					getSet();
					popupClose()
				}
			},
		});
  } catch (error) {
    console.log(error);
  }
};