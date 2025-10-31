import {DOCKER_SITE_LOG_STORE} from './useStore';
import { storeToRefs } from 'pinia';

interface EnvLogProps {
	log_type: 'run' | 'build';
	log_file?: string;
	compose_file?: string;
}


const {getEnvLog} = DOCKER_SITE_LOG_STORE();
const {tabActive} = storeToRefs(DOCKER_SITE_LOG_STORE());

/**
 * @description: 触发目录选择
 */
export const tabClick = (type:'run' | 'build') => {
	tabActive.value = type
  getEnvLog();
};