export const refreshUserTime = {
  methods: {
    refreshTime() {
      if (window.webofdConfig.IS_LOGIN) {
        const expiredTime = new Date() - this.api.expiredTime;
        if (expiredTime > 25 * 60 * 1000 && expiredTime < 30 * 60 * 1000) {
          console.log("刷新用户缓存")
          this.api({
            url: "/login/refresh",
            method: 'post'
          }).catch(error => {
            console.log(error)
          })
        }
      }
    }
  }
}
