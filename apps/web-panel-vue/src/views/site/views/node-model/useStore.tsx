import { getPyVersion } from '@/api/site';
import { useHandleError } from '@/hooks/tools';

const SITE_NODE_STORE = defineStore('SITE-NODE-STORE', () => {
  const delNodeSiteEvent = () => {};

  return {};
});

const useSiteNodeStore = () => {
  return storeToRefs(SITE_NODE_STORE());
};

export { SITE_NODE_STORE, useSiteNodeStore };
