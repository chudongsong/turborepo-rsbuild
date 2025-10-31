const SITE_JAVA_STORE = defineStore('SITE-JAVA-STORE', () => {
  return {};
});

const useSiteJavaStore = () => {
  return storeToRefs(SITE_JAVA_STORE());
};

export { SITE_JAVA_STORE, useSiteJavaStore };
