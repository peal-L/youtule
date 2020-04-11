App({
    globalData: {
        isX: false,
    },
    onLaunch() {
      this.globalData.isX = wx.getMenuButtonBoundingClientRect().bottom > 70;
    }
})