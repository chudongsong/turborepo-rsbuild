import { getPyVersion } from '@/api/site';
import { useHandleError } from '@/hooks/tools';

const SITE_GO_STORE = defineStore('SITE-GO-STORE', () => {
  return {};
});

const useSiteGoStore = () => {
  return storeToRefs(SITE_GO_STORE());
};

export { SITE_GO_STORE, useSiteGoStore };
