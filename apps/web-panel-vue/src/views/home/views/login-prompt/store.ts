import { defineStore } from 'pinia'

const HOME_LOGIN_PROMPT_STORE = defineStore('HOME-LOGIN-PROMPT-STORE', () => {

  const loginInfo = ref<any>({
    ip_info: {
      ip: '',
      info: '',
    },
    last_login: {
      ip_info: {
        ip: '',
        info: '',
      },
      login_time_str: '',
    },
  })
  
  const initData = () => { 
    const loginContent = JSON.parse((sessionStorage.getItem('loginInfo') as string))
    loginInfo.value = loginContent ? loginContent : loginInfo.value
  }

  return {
    loginInfo,
    initData
  }
})

export default HOME_LOGIN_PROMPT_STORE