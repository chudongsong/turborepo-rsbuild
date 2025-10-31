


import type { DockerSiteGetBuildLogProps,DockerSiteGetRunLogProps } from '@/views/docker/types';
import {getEnvLog as getLog} from '@/api/docker';
import { Message } from '@/hooks/tools';

const DOCKER_SITE_LOG_STORE = defineStore('DOCKER-SITE-LOG-STORE', () => {
	const tabActive = ref<'run'|'build'>('run');
	const rowData = ref<{
		log_file:string,
		compose:string
	}>({
		compose: '',
		log_file: ''
	});
	const logContent = ref('');
/**
   * @description 获取日志内容
   */
  const getEnvLog = async () => {
    try {
			const params:DockerSiteGetRunLogProps | DockerSiteGetBuildLogProps = {
				log_type: tabActive.value,
				...(tabActive.value === 'run' ? {compose_file: rowData.value.compose} : {log_file: rowData.value.log_file})
			}
			const load = Message.load('正在获取日志，请稍后...');
      const {data} = await getLog(params);
			load.close();
			if(data.status){
				logContent.value = data.data;
			}else{
				Message.error(data.msg);
				logContent.value = '暂无日志内容';
			}
    } catch (error) {
    }
  };

	const resteData = () => {
		logContent.value = '';
		rowData.value.compose_file = '';
		rowData.value.log_file = '';
		tabActive.value = 'run';
	}

  return {
    rowData,
		tabActive,
		logContent,
		getEnvLog,
		resteData,
  };
});

const useDockerSiteLogStore = () => {
  return storeToRefs(DOCKER_SITE_LOG_STORE());
};

export { DOCKER_SITE_LOG_STORE, useDockerSiteLogStore };
